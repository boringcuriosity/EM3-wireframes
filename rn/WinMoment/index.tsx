/* WinMoment: what happens between tapping "Log n items" and landing back on the day. The Rise variant with the
   final layout B, ported from v7/r3/assets/win-moment.js.

   It starts the instant the button is pressed, so the wait for the save is part of the show rather than a spinner,
   and it pays off when the save lands:
     ref.begin(buttonRect, foodNames)        green liquid wells up out of the button and pools while it saves
     ref.win({ gain, meal, n, queued }, cb)  it floods the screen, the foods burst at the surface, the gain counts
                                             up; 2.8s later it drains, fades to white and calls cb (navigate there)
     ref.cancel()                            the save failed: put it all away

   No Skia. Layers, back to front, as the web draws them (canvas under DOM):
     1. one react-native-svg canvas: the button's blob, the liquid (path + gradient), the white edge line, the
        bubble rings, the sparkle dots
     2. the food chips (RN views)
     3. the content (layout B, RN views and text)
     4. a white sheet for the exit

   Timing: one frame callback on the UI thread owns the three clocks (t, w, ex, see timeline.ts). Every path and
   style is an animated prop computed from them, so the animation never waits on React; React renders only when
   the moment starts, when the payoff content mounts, and once per step of the count-up (N renders for +N%). */
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { StatusBarProps } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { Chip, Sparkles } from './Chips';
import { Content } from './Content';
import type { Fonts } from './Content';
import { defaultHaptic } from './haptics';
import type { HapticBeat } from './haptics';
import {
  DONE_AT,
  EXIT_AFTER_S,
  GAIN_BUZZ_AT,
  MIN_CHARGE_S,
  blob,
  bubblesPath,
  countUp,
  edgePath,
  fillPath,
  liquid,
  makeBubbles,
  makeChips,
  makeGeo,
  seg,
  whiteOpacity,
  CONTENT_AT,
  MAX_CHIPS,
} from './timeline';
import type { Geo } from './timeline';

export type { Fonts } from './Content';
export type { HapticBeat } from './haptics';

/** A rect in window coordinates, as measureInWindow gives it. */
export type WinRect = { x: number; y: number; width: number; height: number };

export type WinData = {
  /** The score's gain in percentage points: shown as "+N%". */
  gain: number;
  /** The meal that was logged, as the chip names it: "{meal} logged". */
  meal: string;
  /** How many items were logged (used in the screen reader announcement). */
  n: number;
  /** Saved offline, sends later: the line says so instead. */
  queued?: boolean;
};

export interface WinMomentHandle {
  /** The button was pressed: start the charge from it. foodNames (up to 4 are used) ride up as chips. */
  begin(buttonRect: WinRect, foodNames?: string[]): void;
  /** The save landed: pay off (no sooner than 0.7s after begin), then call onDone once the screen is white. */
  win(data: WinData, onDone?: () => void): void;
  /** The save failed: remove everything at once. */
  cancel(): void;
}

export interface WinMomentProps {
  /** Hold on the final screen instead of exiting (the web's ?stay=1). For demos and screenshots. */
  hold?: boolean;
  /** Force reduced motion on or off. By default it follows the system setting. */
  reducedMotion?: boolean;
  /** Replace or silence the haptics (pass () => {} to turn them off). Defaults to react-native-haptic-feedback. */
  haptic?: (beat: HapticBeat) => void;
  /** Native font names. Defaults to GoodFlip's registered Roboto files. */
  fonts?: Partial<Fonts>;
  /** Turn the status bar light while the screen is green (default true). */
  statusBar?: boolean;
}

const ROBOTO: Fonts = { regular: 'Roboto-Regular', medium: 'Roboto-Medium', semibold: 'Roboto-SemiBold', bold: 'Roboto-Bold' };

/* the wave's point spacing: the web's 6px on iOS, 8px on Android (see README, Performance) */
const STEP = Platform.OS === 'android' ? 8 : 6;

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

/* one play: its geometry and its random particles, fixed for the run and captured by the worklets */
type Run = { id: number; geo: Geo; names: string[]; bubbles: number[]; chips: number[] };

export const WinMoment = forwardRef<WinMomentHandle, WinMomentProps>(function WinMoment(
  { hold = false, reducedMotion, haptic = defaultHaptic, fonts: fontsIn, statusBar = true },
  ref,
) {
  const fonts = { ...ROBOTO, ...fontsIn };
  const win = useWindowDimensions();

  /* ---- reduced motion: the system setting unless forced ---- */
  const [sysReduced, setSysReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSysReduced).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setSysReduced);
    return () => sub.remove();
  }, []);
  const reduced = reducedMotion ?? sysReduced;

  /* ---- where the overlay sits in the window, so a button's window rect maps into it ---- */
  const host = useRef<View>(null);
  const origin = useRef({ x: 0, y: 0, w: win.width, h: win.height });
  const measure = useCallback(() => {
    host.current?.measureInWindow((x, y, w, h) => {
      if (w > 0 && h > 0) origin.current = { x, y, w, h };
    });
  }, []);

  /* ---- state that React renders ---- */
  const [run, setRun] = useState<Run | null>(null);
  const [data, setData] = useState<WinData | null>(null);
  const [count, setCount] = useState(0);
  const doneRef = useRef<(() => void) | undefined>(undefined);
  const runId = useRef(0);

  /* ---- clocks and particles, on the UI thread ---- */
  const t = useSharedValue(0);
  const w = useSharedValue(-1);
  const ex = useSharedValue(-1);
  const t0 = useSharedValue(-1);
  const winReq = useSharedValue(false);
  const winAt = useSharedValue(-1);
  const exitAt = useSharedValue(-1);
  const buzzed = useSharedValue(false);
  const finished = useSharedValue(false);
  const holdSV = useSharedValue(hold);
  const gainSV = useSharedValue(0);
  useEffect(() => {
    holdSV.value = hold;
  }, [hold, holdSV]);

  /* the status bar goes light over the green and back to dark as it leaves into white */
  const barEntry = useRef<StatusBarProps | null>(null);
  const barLight = useCallback(() => {
    if (!statusBar || barEntry.current) return;
    barEntry.current = StatusBar.pushStackEntry({ barStyle: 'light-content', animated: true });
  }, [statusBar]);
  const barDark = useCallback(() => {
    if (!barEntry.current) return;
    StatusBar.popStackEntry(barEntry.current);
    barEntry.current = null;
  }, []);
  const onPayoff = useCallback(() => {
    haptic('surge');
    barLight();
  }, [haptic, barLight]);
  const onExit = useCallback(() => barDark(), [barDark]);
  const onGain = useCallback(() => haptic('gain'), [haptic]);
  const onFinish = useCallback(() => {
    const cb = doneRef.current;
    doneRef.current = undefined;
    barDark();
    setRun(null);
    setData(null);
    cb?.();
  }, [barDark]);

  const frame = useFrameCallback(info => {
    'worklet';
    const now = info.timestamp;
    if (t0.value < 0) t0.value = now;
    const tt = (now - t0.value) / 1000;
    // never pay off before the charge has had a moment to read
    if (winReq.value && winAt.value < 0 && tt >= MIN_CHARGE_S) {
      winAt.value = now;
      runOnJS(onPayoff)();
    }
    const ww = winAt.value < 0 ? -1 : (now - winAt.value) / 1000;
    if (ww > GAIN_BUZZ_AT && !buzzed.value) {
      buzzed.value = true;
      runOnJS(onGain)();
    }
    if (ww >= EXIT_AFTER_S && exitAt.value < 0 && !holdSV.value) {
      exitAt.value = now;
      runOnJS(onExit)();
    }
    const ee = exitAt.value < 0 ? -1 : (now - exitAt.value) / 1000;
    t.value = tt;
    w.value = ww;
    ex.value = ee;
    if (ee > DONE_AT && !finished.value) {
      finished.value = true;
      runOnJS(onFinish)();
    }
  }, false);

  // the count-up: the web's data-from 0 / data-to N, eased over .8s from .1s into the content
  useAnimatedReaction(
    () => (w.value < 0 ? 0 : reduced ? gainSV.value : countUp(w.value - CONTENT_AT, gainSV.value)),
    (v, prev) => {
      if (v !== prev) runOnJS(setCount)(v);
    },
    [reduced],
  );

  const stop = useCallback(() => {
    frame.setActive(false);
  }, [frame]);

  useImperativeHandle(
    ref,
    () => ({
      begin(rect, names = []) {
        measure();
        const o = origin.current;
        const W = o.w || win.width;
        const H = o.h || win.height;
        const g = makeGeo(W, H, { x: rect.x - o.x, y: rect.y - o.y, width: rect.width, height: rect.height }, STEP);
        t0.value = -1;
        winReq.value = false;
        winAt.value = -1;
        exitAt.value = -1;
        buzzed.value = false;
        finished.value = false;
        gainSV.value = 0;
        t.value = 0;
        w.value = -1;
        ex.value = -1;
        doneRef.current = undefined;
        setData(null);
        setCount(0);
        runId.current += 1;
        setRun({ id: runId.current, geo: g, names: names.slice(0, MAX_CHIPS), bubbles: makeBubbles(W), chips: makeChips(g.Bx, names.length) });
        frame.setActive(true);
        haptic('press');
      },
      win(d, onDone) {
        doneRef.current = onDone;
        gainSV.value = Math.max(0, Math.round(d.gain));
        setData(d);
        winReq.value = true;
        AccessibilityInfo.announceForAccessibility(
          d.queued
            ? `${d.meal} logged. Saved on your phone. Your score updates when you're back online.`
            : `${d.meal} logged. ${Math.round(d.gain)} percent added to your sufficiency score.`,
        );
      },
      cancel() {
        stop();
        barDark();
        doneRef.current = undefined;
        setRun(null);
        setData(null);
      },
    }),
    [measure, win.width, win.height, t0, winReq, winAt, exitAt, buzzed, finished, gainSV, t, w, ex, frame, haptic, stop, barDark],
  );

  useEffect(() => {
    if (!run) stop();
  }, [run, stop]);

  return (
    <View ref={host} style={StyleSheet.absoluteFill} pointerEvents={run ? 'auto' : 'none'} onLayout={measure} collapsable={false}>
      {run ? (
        <Stage
          key={run.id}
          geo={run.geo}
          names={run.names}
          data={data}
          count={count}
          reduced={reduced}
          fonts={fonts}
          t={t}
          w={w}
          ex={ex}
          bubbles={run.bubbles}
          chips={run.chips}
        />
      ) : null}
    </View>
  );
});

export default WinMoment;

/* ------------------------------------------------------------------------------------------------ the stage */
type SV<T> = import('react-native-reanimated').SharedValue<T>;
type StageProps = {
  geo: Geo;
  names: string[];
  data: WinData | null;
  count: number;
  reduced: boolean;
  fonts: Fonts;
  t: SV<number>;
  w: SV<number>;
  ex: SV<number>;
  bubbles: number[];
  chips: number[];
};

function Stage({ geo, names, data, count, reduced, fonts, t, w, ex, bubbles, chips }: StageProps) {
  const { W, H } = geo;

  /* the liquid. The web's gradient runs from the surface (top) to the bottom of the screen; here y1 follows top. */
  const grad = useAnimatedProps(() => ({ y1: liquid(geo, t.value, w.value, ex.value).top }));
  const fill = useAnimatedProps(() => ({ d: fillPath(geo, liquid(geo, t.value, w.value, ex.value), t.value) }));
  const edge = useAnimatedProps(() => ({ d: edgePath(geo, liquid(geo, t.value, w.value, ex.value), t.value) }));
  const rings = useAnimatedProps(() => ({ d: bubblesPath(geo, liquid(geo, t.value, w.value, ex.value), t.value, bubbles) }));
  const blobP = useAnimatedProps(() => {
    const b = blob(geo, t.value);
    return { d: b.d, fillOpacity: b.op };
  });
  const white = useAnimatedStyle(() => ({ opacity: whiteOpacity(ex.value) }));

  /* reduced motion: no flood. A still green plate fades in with the content in place, then the same white exit. */
  const plate = useAnimatedStyle(() => ({ opacity: w.value < 0 ? 0 : seg(w.value, 0, 0.3) }));

  return (
    <View style={StyleSheet.absoluteFill} accessibilityRole="alert" accessibilityLiveRegion="polite">
      {reduced ? (
        <Animated.View style={[StyleSheet.absoluteFill, plate]}>
          <Svg width={W} height={H}>
            <Defs>
              <LinearGradient id="wmPlate" x1="0" y1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#6CE9A6" />
                <Stop offset="0.18" stopColor="#2FB47B" />
                <Stop offset="1" stopColor="#1E7A52" />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width={W} height={H} fill="url(#wmPlate)" />
          </Svg>
          {data ? <Content meal={data.meal} count={count} queued={!!data.queued} fonts={fonts} w={w} ex={ex} reduced /> : null}
        </Animated.View>
      ) : (
        <>
          <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
            <Defs>
              <AnimatedGradient id="wmLiquid" x1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse" animatedProps={grad}>
                <Stop offset="0" stopColor="#6CE9A6" />
                <Stop offset="0.18" stopColor="#2FB47B" />
                <Stop offset="1" stopColor="#1E7A52" />
              </AnimatedGradient>
            </Defs>
            {/* the blob leaving the button, before the pool covers it */}
            <AnimatedPath fill="#299D6B" animatedProps={blobP} />
            <AnimatedPath fill="url(#wmLiquid)" animatedProps={fill} />
            <AnimatedPath fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={3} animatedProps={edge} />
            <AnimatedPath fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1.3} animatedProps={rings} />
            {names.map((_, j) => (
              <Sparkles key={j} j={j} geo={geo} chips={chips} w={w} />
            ))}
          </Svg>
          {names.map((n, j) => (
            <Chip key={j} name={n} j={j} geo={geo} chips={chips} t={t} w={w} ex={ex} font={fonts.medium} />
          ))}
          {data ? <Content meal={data.meal} count={count} queued={!!data.queued} fonts={fonts} w={w} ex={ex} reduced={false} /> : null}
        </>
      )}
      <Animated.View style={[StyleSheet.absoluteFill, styles.white, white]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  white: { backgroundColor: '#FFFFFF' },
});

/** Measures a view (the pressed button) in window coordinates, for begin(). */
export function measureInWindow(view: View | null): Promise<WinRect> {
  return new Promise(resolve => {
    if (!view) return resolve({ x: 0, y: 0, width: 0, height: 0 });
    view.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }));
  });
}

/* SufficiencyScore: the "Cloud Drop" liquid score, ported from liquid-score/index.html in embedded mode (as
   v7/r3/heroes/cloud.js embeds it: embed=1, y=.03, v=Cloud Drop, a 300px tall full-width hero).

   Layers, back to front (the web draws them the same way, over a white page):
     1. fluid canvas   the bloom, pour, bubble, glow, ring and aura (shaders/fluid.ts), premultiplied over white
     2. overlay canvas the 30 orbs (shaders/orbs.ts), the number and word (Digits.tsx), the chip (Tags.tsx),
                       the 0 / 100 labels and the step-up "+n" pill
     3. padlock        lottie, locked mode only, where the number would be

   The fluid is the expensive part, so it renders at min(2, PixelRatio) like the web (which caps its canvas at
   2x): its canvas is laid out smaller and scaled up by the view transform. The overlay keeps full density so the
   text and orbs stay sharp. That is why there are two canvases rather than one.

   Timing: one frame callback on the UI thread advances the clock (timeline.clock: the intro runs 2.3x fast on an
   11.5s score, then the idle runs at normal speed) and the pulse spring; every prop is a derived value, so the
   animation causes no React renders. The callback stops with the component. */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { PixelRatio, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Canvas, FilterMode, Group, ImageShader, MipmapMode, Paragraph, Rect, RoundedRect, Shader, Skia, useFont, useFonts, useImage } from '@shopify/react-native-skia';
import Animated, { runOnJS, useAnimatedStyle, useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

import { ScoreText } from './Digits';
import { Tag } from './Tags';
import { END, GAIN, LOCK_SIZE, makePara, tagFor } from './layout';
import type { TagKey } from './layout';
import { fluidSource } from './shaders/fluid';
import { orbSource } from './shaders/orbs';
import {
  anchors,
  clock,
  endsOpacity,
  fluidUniforms,
  gainState,
  introPack,
  LOCK_PLAY_AT,
  makeGeo,
  orbUniforms,
  ORBS_PACK,
  scoreState,
  STEP_PULSE_AT,
  targetPack,
} from './timeline';
import type { Cfg } from './timeline';

const FONTS = {
  regular: require('./assets/fonts/Roboto-Regular.ttf'),
  medium: require('./assets/fonts/Roboto-Medium.ttf'),
  bold: require('./assets/fonts/Roboto-Bold.ttf'),
};
const ORB_PNG = require('./assets/orb.png');
const ORB_SHADOW_PNG = require('./assets/orb-shadow.png');
const LOCK_JSON = require('./assets/lock.json');
const SAMPLING = { filter: FilterMode.Linear, mipmap: MipmapMode.None };

/* Pixel ratio of the fluid. The web caps at 2. On low-end Android, drop this to 1.5 (about 45% fewer fluid pixels
   than 2x); the fluid is soft everywhere except the bubble's 1px rim, which stays acceptable at 1.5x. */
const MAX_FLUID_DPR = 2;

export interface SufficiencyScoreProps {
  /** 0..100. Ignored when locked. */
  score: number;
  /** Step-up mode (arriving from a log): no intro, the number counts from this to score, "+n" rises, one pulse. */
  from?: number;
  /** No plan yet: mist palette, no number, word or tag; the padlock locks, then a glint runs along the empty orbs. */
  lock?: 'lit' | 'quiet';
  /** Status chip. Defaults from the score: >= 70 solid, >= 50 grow, else attention. */
  tag?: TagKey;
  /** Change it to play the score again from the start. */
  playKey?: number;
  /** Skip the intro and show the settled score (the idle drift keeps running, as on the web). */
  reducedMotion?: boolean;
  /** Defaults to the window width. */
  width?: number;
  /** Defaults to 300, the hero's height on the web. The gauge keeps its designed size whatever the height. */
  height?: number;
}

export default function SufficiencyScore({
  score,
  from,
  lock,
  tag,
  playKey = 0,
  reducedMotion = false,
  width,
  height = 300,
}: SufficiencyScoreProps) {
  const win = useWindowDimensions();
  const W = width ?? win.width;
  const H = height;
  const PR = PixelRatio.get();
  const dpr = Math.min(MAX_FLUID_DPR, PR);
  const k = dpr / PR; // fluid canvas size against the hero

  const lockMode = lock ?? null;
  const value = lockMode ? 0 : Math.max(0, Math.min(100, Math.round(score || 0)));
  const fromV = from != null && !lockMode ? Math.round(from) : null;
  const tagKey: TagKey | null = lockMode ? null : tag ?? tagFor(value);

  const geo = useMemo(() => makeGeo(W, H), [W, H]);
  const cfg: Cfg = useMemo(
    () => ({ geo, score: value, from: fromV, lock: lockMode, start: ORBS_PACK, target: targetPack(lockMode), intro: introPack(lockMode) }),
    [geo, value, fromV, lockMode],
  );
  const anchor = useMemo(() => anchors(geo), [geo]);

  /* ---- assets ---- */
  const fluidEffect = useMemo(() => Skia.RuntimeEffect.Make(fluidSource(geo.SIZE)), [geo.SIZE]);
  const orbEffect = useMemo(() => Skia.RuntimeEffect.Make(orbSource), []);
  const orbImg = useImage(ORB_PNG);
  const shadowImg = useImage(ORB_SHADOW_PNG);
  const fontMgr = useFonts({ Roboto: [FONTS.regular, FONTS.medium, FONTS.bold] });
  const digitFont = useFont(FONTS.medium, 36);
  const pctFont = useFont(FONTS.regular, 14.4);
  // fractional advances, as a browser lays text out
  useMemo(() => [digitFont, pctFont].forEach(f => { if (f) { (f as any).setSubpixel(1); f.setLinearMetrics(true); } }), [digitFont, pctFont]); // ponytail: Skia 1.12.4 JSI reads setSubpixel as a number

  /* ---- clock ---- */
  // FROM skips 30s (the day as it stood), reduced motion skips 10s (past the intro), exactly as the web's reset()
  const skip = fromV != null ? 30 : reducedMotion ? 10 : 0;
  const t = useSharedValue(clock(skip)); // score clock
  const since = useSharedValue(reducedMotion ? 10 : 0); // real seconds since this play started
  const real = useSharedValue(0); // real seconds since mount
  const vk = useSharedValue(reducedMotion ? 0 : 1); // what is left of the web's start-up variant blend
  const pulse = useSharedValue(0);
  const pulseV = useSharedValue(0);
  const kick = useSharedValue(0); // pulse impulses from the JS side (padlock complete)
  const t0 = useSharedValue(-1);
  const mount0 = useSharedValue(-1);
  const last = useSharedValue(-1);
  const stepped = useSharedValue(false);
  const lockPlayed = useSharedValue(false);

  const lockRef = useRef<LottieView>(null);
  const playLock = useCallback(() => lockRef.current?.play(), []);

  useFrameCallback(info => {
    'worklet';
    const now = info.timestamp;
    if (mount0.value < 0) mount0.value = now;
    if (t0.value < 0) t0.value = now - skip * 1000;
    const dt = Math.min(0.05, last.value < 0 ? 0 : (now - last.value) / 1000);
    last.value = now;
    const tt = clock((now - t0.value) / 1000);
    const sn = (now - t0.value) / 1000 - skip + (reducedMotion ? 10 : 0);
    // the bubble's pulse: a stiff spring, kicked by the step-up, the padlock and (on the web) taps
    pulseV.value += kick.value;
    kick.value = 0;
    pulseV.value += (-120 * pulse.value - 20 * pulseV.value) * dt;
    pulse.value += pulseV.value * dt;
    if (fromV != null && !stepped.value && sn > STEP_PULSE_AT && !reducedMotion) {
      stepped.value = true;
      pulseV.value += 0.8;
    }
    if (lockMode && !lockPlayed.value && tt > LOCK_PLAY_AT && !reducedMotion) {
      lockPlayed.value = true;
      runOnJS(playLock)();
    }
    t.value = tt;
    since.value = sn;
    real.value = (now - mount0.value) / 1000;
    vk.value = reducedMotion ? 0 : Math.exp(-3 * real.value);
  });

  // playKey: play again from the start (the web's reset())
  const firstKey = useRef(playKey);
  useEffect(() => {
    if (firstKey.current === playKey) return;
    firstKey.current = playKey;
    t0.value = -1;
    last.value = -1;
    pulse.value = 0;
    pulseV.value = 0;
    stepped.value = false;
    lockPlayed.value = false;
    lockRef.current?.reset();
  }, [playKey, t0, last, pulse, pulseV, stepped, lockPlayed]);

  /* ---- uniforms ---- */
  const fluidW = W * k;
  const fluidH = H * k;
  const fluidU = useDerivedValue(() => fluidUniforms(cfg, t.value, since.value, vk.value, pulse.value, fluidW, fluidH, dpr));
  const orbU = useDerivedValue(() => ({ uO: orbUniforms(cfg, t.value, since.value), uTap: 0.25 / PR }));

  /* ---- labels and gain pill ---- */
  const ends = useMemo(() => {
    if (!fontMgr) return null;
    return [
      { para: makePara(fontMgr, '0', END.size, 400, END.color), at: anchor.lo },
      { para: makePara(fontMgr, '100', END.size, 400, END.color), at: anchor.hi },
    ];
  }, [fontMgr, anchor]);
  const endsOp = useDerivedValue(() => endsOpacity(cfg, t.value));
  const gain = useMemo(() => (fontMgr && fromV != null ? makePara(fontMgr, `+${value - fromV}%`, GAIN.size, 700, GAIN.color) : null), [fontMgr, fromV, value]);
  const gainW = gain ? gain.width + 2 * GAIN.padX : 0;
  const gainOp = useDerivedValue(() => gainState(since.value).op);
  const gainTf = useDerivedValue(() => {
    const s = scoreState(cfg, t.value, 0);
    return [{ translateX: s.bx - gainW / 2 }, { translateY: s.by + gainState(since.value).dy - GAIN.h / 2 }];
  });

  /* ---- padlock: in the score block's place, so it fades, scales and pulses with it ---- */
  const lockStyle = useAnimatedStyle(() => {
    const s = scoreState(cfg, t.value, pulse.value);
    return {
      opacity: s.op,
      transform: [{ translateX: s.bx - LOCK_SIZE / 2 }, { translateY: s.by - LOCK_SIZE / 2 }, { scale: s.scale }],
    };
  });
  const onLockFinish = useCallback(
    (cancelled: boolean) => {
      if (!cancelled) kick.value += 0.9; // it clicks shut and the bubble answers with a small pulse
    },
    [kick],
  );
  useEffect(() => {
    // reduced motion: the padlock rests already locked
    if (lockMode && reducedMotion) lockRef.current?.play(75, 75);
  }, [lockMode, reducedMotion]);

  const ready = !!(fontMgr && digitFont && pctFont);

  return (
    <View style={{ width: W, height: H }} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {fluidEffect ? (
        <Canvas
          style={{
            position: 'absolute',
            left: (W - fluidW) / 2,
            top: (H - fluidH) / 2,
            width: fluidW,
            height: fluidH,
            transform: [{ scale: 1 / k }],
          }}
        >
          <Rect x={0} y={0} width={fluidW} height={fluidH}>
            <Shader source={fluidEffect} uniforms={fluidU} />
          </Rect>
        </Canvas>
      ) : null}
      <Canvas style={StyleSheet.absoluteFill}>
        {orbEffect && orbImg && shadowImg ? (
          <Rect x={0} y={0} width={W} height={H}>
            <Shader source={orbEffect} uniforms={orbU}>
              <ImageShader image={orbImg} tx="decal" ty="decal" fit="none" sampling={SAMPLING} />
              <ImageShader image={shadowImg} tx="decal" ty="decal" fit="none" sampling={SAMPLING} />
            </Shader>
          </Rect>
        ) : null}
        {ready && !lockMode ? (
          <ScoreText cfg={cfg} fontMgr={fontMgr!} digitFont={digitFont!} pctFont={pctFont!} t={t} since={since} pulse={pulse} />
        ) : null}
        {fontMgr && tagKey ? <Tag tag={tagKey} fontMgr={fontMgr} anchor={anchor.tag} t={t} real={real} /> : null}
        {ends ? (
          <Group opacity={endsOp}>
            {ends.map(({ para, at }, i) => (
              <Paragraph
                key={i}
                paragraph={para.p}
                x={Math.round(at[0] - para.width / 2)}
                y={at[1] + END.baseline - para.baseline}
                width={Math.ceil(para.width) + 1}
              />
            ))}
          </Group>
        ) : null}
        {gain ? (
          <Group transform={gainTf} opacity={gainOp}>
            <RoundedRect x={0} y={0} width={gainW} height={GAIN.h} r={GAIN.h / 2} color={GAIN.bg} />
            <Paragraph paragraph={gain.p} x={GAIN.padX} y={GAIN.baseline - gain.baseline} width={Math.ceil(gain.width) + 1} />
          </Group>
        ) : null}
      </Canvas>
      {lockMode ? (
        <Animated.View style={[styles.lock, lockStyle]}>
          <LottieView ref={lockRef} source={LOCK_JSON} autoPlay={false} loop={false} onAnimationFinish={onLockFinish} style={styles.fill} resizeMode="contain" />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  lock: { position: 'absolute', left: 0, top: 0, width: LOCK_SIZE, height: LOCK_SIZE },
  fill: { width: '100%', height: '100%' },
});

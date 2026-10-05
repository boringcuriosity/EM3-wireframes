/* Layout B, the final screen: the tick names what was logged, the gain stands alone, one line says what it is.

   Web (win-moment.js, layout B and its CSS), centred on the screen (.c top 50%, translateY(-50%)), 197.4px tall:
     .logged  chip 44px tall: a 30px white disc with a 16px tick, a 10px gap, "{meal} logged" 600 16/20
     .n       28px under it, 700 96px, line-height .9 (86.4px), letter-spacing -3px, tabular digits
     .pc      the "%": .4em (38.4px), raised to the top of the number's line, opacity .85, .06em in from the digits
     .say     14px under, 400 17/25, white at .9

   Measured in Chrome at 402x874 (the box tops relative to the block): chip 0, disc 7, number line 72,
   % 72 (38.4 tall), line 172.4. RN Text has no line-height trick for "line-height .9", so the number sits in a
   86.4px row and is pulled up by its half-leading, worked out from Roboto's ascent and descent (1900 and 500 per
   2048): (86.4 - 1.1719 * 96) / 2 = -13.05px. The % box is 38.4 * 1.1719 tall with its baseline 32.3px below
   the row's top, the same as Chrome. */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { TICK_DASH, contentOpacity, dataIn, discScale, tickOffset, CONTENT_AT, IN_N, IN_SAY } from './timeline';

const APath = Animated.createAnimatedComponent(Path);

export type Fonts = { regular: string; medium: string; semibold: string; bold: string };

/* Roboto, hhea */
const ASC = 1900 / 2048;
const LH = 2400 / 2048;
const N_SIZE = 96;
const N_LINE = 86.4;
const PC_SIZE = 38.4;
const PC_BASE = 32.3; // the %'s baseline below the number row's top, from Chrome

export const QUEUED_LINE = "Saved on your phone. Your score updates when you're back online.";
export const DONE_LINE = 'added to your sufficiency score';

type Props = {
  meal: string;
  count: number; // the number shown now (counts up)
  queued: boolean;
  fonts: Fonts;
  w: SharedValue<number>;
  ex: SharedValue<number>;
  reduced: boolean;
};

export function Content({ meal, count, queued, fonts, w, ex, reduced }: Props) {
  // reduced motion: everything is in place and the whole block fades with the plate (see index.tsx)
  const wl = (v: number) => {
    'worklet';
    return reduced ? 10 : v - CONTENT_AT;
  };
  const block = useAnimatedStyle(() => ({ opacity: reduced ? 1 : contentOpacity(wl(w.value), ex.value) }));
  const disc = useAnimatedStyle(() => ({ transform: [{ scale: discScale(wl(w.value)) }] }));
  const tick = useAnimatedProps(() => ({ strokeDashoffset: tickOffset(wl(w.value)) }));
  const n = useAnimatedStyle(() => {
    const k = dataIn(wl(w.value), IN_N);
    return { opacity: k.op, transform: [{ translateY: k.dy }] };
  });
  const say = useAnimatedStyle(() => {
    const k = dataIn(wl(w.value), IN_SAY);
    return { opacity: k.op, transform: [{ translateY: k.dy }] };
  });

  return (
    <Animated.View style={[styles.block, block]} pointerEvents="none">
      <View style={styles.logged}>
        <Animated.View style={[styles.disc, disc]}>
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <APath
              d="M20 6L9 17l-5-5"
              fill="none"
              stroke="#1E8A5C"
              strokeWidth={3.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={[TICK_DASH, TICK_DASH]}
              animatedProps={tick}
            />
          </Svg>
        </Animated.View>
        <Text style={[styles.loggedText, { fontFamily: fonts.semibold }]} numberOfLines={1}>
          {meal} logged
        </Text>
      </View>
      <Animated.View style={[styles.nRow, n]}>
        <Text style={[styles.n, { fontFamily: fonts.bold }]} allowFontScaling={false}>
          +{count}
        </Text>
        <Text style={[styles.pc, { fontFamily: fonts.bold }]} allowFontScaling={false}>
          %
        </Text>
      </Animated.View>
      <Animated.Text style={[styles.say, { fontFamily: fonts.regular }, say]} numberOfLines={queued ? 2 : 1}>
        {queued ? QUEUED_LINE : DONE_LINE}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  block: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  logged: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    paddingLeft: 6,
    paddingRight: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
  },
  disc: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  loggedText: { fontSize: 16, lineHeight: 20, letterSpacing: 0.25, color: '#FFFFFF', includeFontPadding: false },
  nRow: { marginTop: 28, height: N_LINE, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  n: {
    marginTop: (N_LINE - LH * N_SIZE) / 2,
    fontSize: N_SIZE,
    letterSpacing: -3,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  pc: {
    marginTop: PC_BASE - ASC * PC_SIZE,
    marginLeft: 0.06 * PC_SIZE,
    fontSize: PC_SIZE,
    color: '#FFFFFF',
    opacity: 0.85,
    includeFontPadding: false,
  },
  say: {
    marginTop: 14,
    maxWidth: 342,
    fontSize: 17,
    lineHeight: 25,
    letterSpacing: 0.25,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.9)',
    includeFontPadding: false,
  },
});

/* The status chip that sits in the gauge's open gap, between 0 and 100.

   From the web's .tag CSS (GoodFlip Figma chips, node 6875:9957): 22px tall, 8px radius, 12px Roboto, a 1px
   inside border drawn as a conic gradient behind a linear-gradient fill on the padding box. Each chip is pinned to
   its Figma width (68 / 98 / 106 / 115); "Log your meals" and "Gathering data" size to their content.

   CSS -> Skia:
     conic-gradient(from 90deg, ...)  -> SweepGradient at the box centre; Skia's 0 is CSS's 90deg (3 o'clock) and
                                         both run clockwise, so the stop angles map straight to deg/360
     linear-gradient(Adeg, ...)       -> LinearGradient along (sin A, -cos A) through the padding box's centre,
                                         over the CSS gradient-line length |w sin A| + |h cos A|
   Position: the web's tx0/ty0, snapped to whole pixels; it rises 6px, scales from .96 and un-blurs as it lands. */

import React, { useMemo } from 'react';
import { Blur, Circle, Group, LinearGradient, Paint, Paragraph, Path, RoundedRect, Skia, SweepGradient, vec } from '@shopify/react-native-skia';
import type { SkTypefaceFontProvider } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { makePara, TAG_TEXT } from './layout';
import type { TagKey } from './layout';
import { tagState } from './timeline';

interface Look {
  ink: string;
  angle: number;
  fill: string[];
  fillAt: number[];
  line: string[];
  lineAt: number[]; // degrees
  width?: number;
}

const NEUTRAL: Look = {
  ink: '#667085',
  angle: 124.82,
  fill: ['#f2f4f7', '#f9fafb', '#f9fafb', '#f2f4f7'],
  fillAt: [3, 20.1, 79.8, 94.3],
  line: ['#f2f4f7', '#e4e7ec', '#f2f4f7', '#f2f4f7', '#e4e7ec', '#f2f4f7', '#f2f4f7'],
  lineAt: [0, 6.87, 23.84, 177.28, 188.13, 209.95, 360],
};

const LOOKS: Record<TagKey, Look> = {
  solid: {
    ink: '#039855',
    angle: 112.36,
    fill: ['#d1fadf', '#ecfdf3', '#ecfdf3', '#d1fadf'],
    fillAt: [3, 20.1, 79.9, 94.4],
    line: ['#32d583', '#039855', '#32d583', '#32d583', '#039855', '#32d583', '#32d583'],
    lineAt: [0, 11.51, 36.77, 175.4, 193.58, 224.26, 360],
    width: 68,
  },
  grow: {
    ink: '#dc6803',
    angle: 120.65,
    fill: ['#fef0c7', '#fffaeb', '#fffaeb', '#fef0c7'],
    fillAt: [3, 20.1, 79.8, 94.3],
    line: ['#fdb022', '#dc6803', '#fdb022', '#fdb022', '#dc6803', '#fdb022', '#fdb022'],
    lineAt: [0, 8.04, 27.41, 176.8, 189.51, 214.06, 360],
    width: 98,
  },
  attention: {
    ink: '#d92d20',
    angle: 122.66,
    fill: ['#fee4e2', '#fef3f2', '#fef3f2', '#fee4e2'],
    fillAt: [3, 20.1, 79.8, 94.3],
    line: ['#f97066', '#d92d20', '#f97066', '#f97066', '#d92d20', '#f97066', '#f97066'],
    lineAt: [0, 7.44, 25.61, 177.04, 188.81, 212.01, 360],
    width: 106,
  },
  none: { ...NEUTRAL, width: 115 },
  gathering: NEUTRAL,
  log: NEUTRAL,
};

export const TAG_H = 22;
const PAD = 8;
const BORDER = 1;
const SPIN = 12; // the gathering spinner
const SPIN_GAP = 6;

/* the CSS linear-gradient line for a box */
function cssLinear(angleDeg: number, x: number, y: number, w: number, h: number) {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;
  const cx = x + w / 2;
  const cy = y + h / 2;
  return { start: vec(cx - dx * half, cy - dy * half), end: vec(cx + dx * half, cy + dy * half) };
}

/* the web's .spin: a 12px ring with a 1.5px #e4e7ec border and a #475467 top edge, turning once a second */
const spinTop = (() => {
  const p = Skia.Path.Make();
  const r = SPIN / 2 - 0.75;
  p.addArc({ x: -r, y: -r, width: 2 * r, height: 2 * r }, -135, 90);
  return p;
})();

export interface TagProps {
  tag: TagKey;
  fontMgr: SkTypefaceFontProvider;
  anchor: number[]; // tag centre (dp, unsnapped), from timeline.anchors()
  t: SharedValue<number>; // score clock
  real: SharedValue<number>; // real seconds, for the spinner
}

export function Tag({ tag, fontMgr, anchor, t, real }: TagProps) {
  const look = LOOKS[tag];
  const text = useMemo(() => makePara(fontMgr, TAG_TEXT[tag], 12, 400, look.ink), [fontMgr, tag, look.ink]);
  const spinner = tag === 'gathering';
  const contentW = text.width + (spinner ? SPIN_GAP + SPIN : 0);
  const w = look.width ?? contentW + 2 * (PAD + BORDER);
  const h = TAG_H;
  const x0 = Math.round(anchor[0] - w / 2);
  const y0 = Math.round(anchor[1] - h / 2);
  const fill = cssLinear(look.angle, BORDER, BORDER, w - 2 * BORDER, h - 2 * BORDER);
  const textX = (w - contentW) / 2;

  const transform = useDerivedValue(() => {
    const s = tagState(t.value);
    return [{ translateX: x0 + w / 2 }, { translateY: y0 + s.dy + h / 2 }, { scale: s.scale }, { translateX: -w / 2 }, { translateY: -h / 2 }];
  });
  const opacity = useDerivedValue(() => tagState(t.value).op);
  const blur = useDerivedValue(() => Math.max(0.01, tagState(t.value).blur));
  const spin = useDerivedValue(() => [
    { translateX: textX + text.width + SPIN_GAP + SPIN / 2 },
    { translateY: h / 2 },
    { rotate: (real.value % 1) * 2 * Math.PI },
  ]);

  return (
    <Group
      transform={transform}
      layer={
        <Paint opacity={opacity}>
          <Blur blur={blur} />
        </Paint>
      }
    >
      {/* the 1px border: the conic gradient on the whole box, under the fill */}
      <RoundedRect x={0} y={0} width={w} height={h} r={8}>
        <SweepGradient c={vec(w / 2, h / 2)} colors={look.line} positions={look.lineAt.map(d => d / 360)} />
      </RoundedRect>
      <RoundedRect x={BORDER} y={BORDER} width={w - 2 * BORDER} height={h - 2 * BORDER} r={8 - BORDER}>
        <LinearGradient start={fill.start} end={fill.end} colors={look.fill} positions={look.fillAt.map(p => p / 100)} />
      </RoundedRect>
      <Paragraph paragraph={text.p} x={textX} y={15 - text.baseline} width={Math.ceil(text.width) + 1} />
      {spinner ? (
        <Group transform={spin}>
          <Circle cx={0} cy={0} r={SPIN / 2 - 0.75} style="stroke" strokeWidth={1.5} color="#e4e7ec" />
          <Path path={spinTop} style="stroke" strokeWidth={1.5} color="#475467" />
        </Group>
      ) : null}
    </Group>
  );
}

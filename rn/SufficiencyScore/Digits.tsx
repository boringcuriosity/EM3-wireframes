/* The number and "Sufficient", centred on the bubble.

   Web: .score (opacity, blur, scale about its centre, following the bubble's breath) holding .num (slot-machine
   digits + "%") and .word. Each digit column is a strip of digits that spins down and lands, left to right: a
   column of 1em, overflow hidden, masked top and bottom (linear-gradient transparent, #000 12%, #000 88%,
   transparent), the strip blurred a touch while it spins.

   Skia: per column, a layer clipped to the column; inside it a blurred layer with the two strip digits that can
   be in view; then the gradient mask drawn dstIn. The strip is k % 10 at row k, so only floor(off) and the row
   after it are ever visible.

   Step-up mode (from): the number counts instead of spinning (the web replaces the slot with plain text), so it is
   drawn as glyphs re-centred every frame. */

import React, { useMemo } from 'react';
import { Blur, Glyphs, Group, LinearGradient, Paint, Paragraph, Rect, Text, vec } from '@shopify/react-native-skia';
import type { SkFont, SkTypefaceFontProvider } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { INK, makePara, NUM, numberLine, PCT, WORD } from './layout';
import { filledAt, scoreState, slotState } from './timeline';
import type { Cfg } from './timeline';

const MASK = ['rgba(0,0,0,0)', 'rgba(0,0,0,1)', 'rgba(0,0,0,1)', 'rgba(0,0,0,0)'];
const MASK_AT = [0, 0.12, 0.88, 1];

interface ColumnProps {
  j: number;
  digit: number;
  x: number;
  top: number;
  colW: number;
  font: SkFont;
  t: SharedValue<number>;
}

function Column({ j, digit, x, top, colW, font, t }: ColumnProps) {
  const n = (2 + j) * 10 + digit; // strip length - 1, as the web builds it
  const em = NUM.size;
  const a = useDerivedValue(() => String(Math.floor(slotState(t.value, j, n).off) % 10));
  const b = useDerivedValue(() => String((Math.floor(slotState(t.value, j, n).off) + 1) % 10));
  const strip = useDerivedValue(() => {
    const off = slotState(t.value, j, n).off;
    return [{ translateY: -(off - Math.floor(off)) * em }];
  });
  const blur = useDerivedValue(() => Math.max(0.01, slotState(t.value, j, n).blur));
  const rect = { x, y: top, width: colW, height: em };
  return (
    <Group clip={rect} layer>
      <Group
        transform={strip}
        layer={
          <Paint>
            <Blur blur={blur} />
          </Paint>
        }
      >
        <Text x={x} y={top + NUM.baseline} text={a} font={font} color={INK} />
        <Text x={x} y={top + NUM.baseline + em} text={b} font={font} color={INK} />
      </Group>
      <Rect x={x} y={top} width={colW} height={em} blendMode="dstIn">
        <LinearGradient start={vec(0, top)} end={vec(0, top + em)} colors={MASK} positions={MASK_AT} />
      </Rect>
    </Group>
  );
}

export interface ScoreTextProps {
  cfg: Cfg;
  fontMgr: SkTypefaceFontProvider;
  digitFont: SkFont; // Roboto 500, 36
  pctFont: SkFont; // Roboto 400, 14.4
  t: SharedValue<number>;
  since: SharedValue<number>;
  pulse: SharedValue<number>;
}

export function ScoreText({ cfg, fontMgr, digitFont, pctFont, t, since, pulse }: ScoreTextProps) {
  const word = useMemo(() => makePara(fontMgr, 'Sufficient', WORD.size, 400, `rgba(29,41,57,${WORD.opacity})`, WORD.ls), [fontMgr]);
  const digitIds = useMemo(() => digitFont.getGlyphIDs('0123456789'), [digitFont]);
  const digitAdv = useMemo(() => digitFont.getGlyphWidths([digitIds[0]])[0], [digitFont, digitIds]);
  const pctAdv = useMemo(() => pctFont.getGlyphWidths(pctFont.getGlyphIDs('%'))[0], [pctFont]);

  const stepUp = cfg.from != null;
  const digits = String(cfg.score).split('').map(Number);
  const line = numberLine(digits.length, digitAdv, pctAdv);

  // the whole block: centred on the bubble, fading in out of a blur, scaling with the bubble's pulse
  const transform = useDerivedValue(() => {
    const s = scoreState(cfg, t.value, pulse.value);
    return [{ translateX: s.bx }, { translateY: s.by }, { scale: s.scale }];
  });
  const opacity = useDerivedValue(() => scoreState(cfg, t.value, pulse.value).op);
  const blur = useDerivedValue(() => Math.max(0.01, scoreState(cfg, t.value, pulse.value).blur));

  // step-up: the counting number, re-centred as it gains a digit
  const countGlyphs = useDerivedValue(() => {
    if (!stepUp) return [];
    const s = String(Math.round(filledAt(cfg, t.value, since.value)));
    const l = numberLine(s.length, digitAdv, pctAdv);
    const out: { id: number; pos: { x: number; y: number } }[] = [];
    for (let i = 0; i < s.length; i++) {
      out.push({ id: digitIds[s.charCodeAt(i) - 48], pos: { x: l.left + i * l.colW, y: l.top + NUM.baseline } });
    }
    return out;
  });
  const countPctX = useDerivedValue(() => {
    if (!stepUp) return line.pctX;
    const s = String(Math.round(filledAt(cfg, t.value, since.value)));
    return numberLine(s.length, digitAdv, pctAdv).pctX;
  });

  return (
    <Group
      transform={transform}
      layer={
        <Paint opacity={opacity}>
          <Blur blur={blur} />
        </Paint>
      }
    >
      {stepUp ? (
        <Glyphs font={digitFont} glyphs={countGlyphs} color={INK} />
      ) : (
        digits.map((d, j) => (
          <Column key={j} j={j} digit={d} x={line.left + j * line.colW} top={line.top} colW={line.colW} font={digitFont} t={t} />
        ))
      )}
      <Text x={countPctX} y={line.top + PCT.baseline} text="%" font={pctFont} color={INK} />
      <Paragraph paragraph={word.p} x={-word.width / 2} y={line.top + WORD.baseline - word.baseline} width={Math.ceil(word.width) + 1} />
    </Group>
  );
}

/* Text layout for the score, matched to how Chrome lays out the web version's DOM.

   The vertical numbers below were measured in Chrome from liquid-score/index.html (embed mode) with a baseline
   probe, because CSS line boxes round Roboto's ascent and descent to whole pixels:
     .num   36px, line-height 1: digit baseline 30px below the line's top
     .num i (the %), 14.4px raised .95em: baseline 16.328px below the number line's top
     .word  14px, line-height 1, 2px under the number: baseline 50px below the block's top (block is 52px tall)
     .tag   22px chip: text baseline 15px below its top
     .end   (0 and 100) 14px: baseline 12px below the label's top
     gain   13px bold, line-height 16 + 3px padding: baseline 15.5px below the pill's top
   Horizontally everything is computed from the font (so it follows any number), with CSS letter-spacing:
     .num letter-spacing -.03em = -1.08px, inherited as px by the % as well; .word .01em = .14px. */

import { Skia } from '@shopify/react-native-skia';
import type { SkParagraph, SkTypefaceFontProvider } from '@shopify/react-native-skia';

export const INK = '#1d2939'; // Cloud Drop's --ink
export const NUM = { size: 36, ls: -1.08, baseline: 30, gap: 2 };
export const PCT = { size: 14.4, baseline: 16.328 };
export const WORD = { size: 14, ls: 0.14, baseline: 50, opacity: 0.92 };
export const BLOCK_H = 52;
export const LOCK_SIZE = 76;
export const END = { size: 14, baseline: 12, color: '#7a7f8c' };
export const GAIN = { size: 13, baseline: 15.5, padX: 9, h: 22, bg: '#ECFDF3', color: '#039855' };

/* Roboto's descent (hhea 500/2048). SkParagraph rounds its line height and puts the baseline one descent above
   the line's bottom, so baseline = lineHeight - descent. */
const DESCENT = 500 / 2048;

export interface Para {
  p: SkParagraph;
  width: number;
  baseline: number; // from the paragraph's top
}

export function makePara(fm: SkTypefaceFontProvider, text: string, size: number, weight: number, color: string, letterSpacing = 0): Para {
  const b = Skia.ParagraphBuilder.Make({}, fm);
  b.pushStyle({
    color: Skia.Color(color),
    fontFamilies: ['Roboto'],
    fontSize: size,
    fontStyle: { weight },
    letterSpacing,
  });
  b.addText(text);
  b.pop();
  const p = b.build();
  p.layout(10000);
  const width = p.getMaxIntrinsicWidth();
  p.layout(Math.ceil(width) + 1);
  const line = p.getLineMetrics()[0];
  const lh = line ? line.height : p.getHeight();
  return { p, width, baseline: lh - DESCENT * size };
}

/* The number line, relative to the bubble's centre (the score block is centred on it): nd digit columns, a 2px
   gap, then the %. colW is a digit's advance plus the letter-spacing (Roboto's digits are tabular). */
export function numberLine(nd: number, digitAdv: number, pctAdv: number) {
  'worklet';
  const colW = digitAdv + NUM.ls;
  const pctW = pctAdv + NUM.ls;
  const w = nd * colW + NUM.gap + pctW;
  const left = -w / 2;
  return { colW, left, pctX: left + nd * colW + NUM.gap, top: -BLOCK_H / 2 };
}

/* status tags (the web's TAGS) */
export type TagKey = 'solid' | 'grow' | 'attention' | 'none' | 'gathering' | 'log';
export const TAG_TEXT: Record<TagKey, string> = {
  solid: 'Solid Day',
  grow: 'Room To Grow',
  attention: 'Needs Attention',
  none: 'No Data Available',
  gathering: 'Gathering data',
  log: 'Log your meals',
};
export const tagFor = (score: number): TagKey => (score >= 70 ? 'solid' : score >= 50 ? 'grow' : 'attention');

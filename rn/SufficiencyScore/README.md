# SufficiencyScore

The "Cloud Drop" nutrition sufficiency score for React Native. It is a port of
`app/public/liquid-score/index.html` in embedded mode, set up the way `v7/r3/heroes/cloud.js` embeds it
(`embed=1&y=.03&v=Cloud Drop`, a 300px tall hero at full width).

Stack: react-native 0.77.3 (old architecture, Hermes), React 18.3.1, @shopify/react-native-skia 1.12.4,
react-native-reanimated 3.19.0, lottie-react-native 6.7.2. It adds no other dependencies.

## Usage

```tsx
import SufficiencyScore from '../SufficiencyScore';

<SufficiencyScore score={54} />                       // full intro, "Room To Grow"
<SufficiencyScore score={72} from={54} />             // step-up after a log: counts 54 to 72, "+18", one pulse
<SufficiencyScore score={0} lock="lit" />             // no plan yet: mist, padlock, glint
<SufficiencyScore score={38} tag="log" playKey={n} /> // a given tag; bump playKey to replay
```

| prop | type | default | meaning |
|---|---|---|---|
| `score` | number | required | 0 to 100, rounded. Ignored when locked. |
| `from` | number | none | Step-up mode: no intro. The number counts from `from` to `score`, a "+n" pill rises and fades, the bubble pulses once. |
| `lock` | `'lit' \| 'quiet'` | none | No plan yet. Mist palette, no number, word or tag. The padlock locks, then a glint runs once along the empty orbs, and the bubble pulses when the lock clicks shut. `lit` keeps a mint halo, `quiet` does not. |
| `tag` | `'solid' \| 'grow' \| 'attention' \| 'none' \| 'log' \| 'gathering'` | from score | Status chip. Without it: 70 and up is solid, 50 and up is grow, anything lower is attention. |
| `playKey` | number | 0 | Change it to play again from the start. |
| `reducedMotion` | boolean | false | Skips straight to the settled score (the web's `reset(10)`). The idle drift keeps running, as it does on the web. |
| `width` | number | window width | |
| `height` | number | 300 | The gauge keeps its designed pixel size whatever the height (SIZE = .75 × 874 / height, as on the web). |

The component does not take touches (`pointerEvents="none"`), the same as the iframe on the web, so taps go to
whatever wraps it. It is hidden from accessibility, so the host should label the hero itself.

## Files

| file | what it holds |
|---|---|
| `index.tsx` | The component: two canvases, the padlock, the frame callback (clock and pulse), and the derived uniforms. |
| `timeline.ts` | `frame()` and `clock()` ported as worklets: easing, the bubble, the pour, the orbs, the text timings, the palettes and the variant blend. |
| `shaders/fluid.ts` | The main fragment shader in SkSL, with the Cloud Drop constants folded in. |
| `shaders/orbs.ts` | The orb pass in SkSL: all 30 orbs in one draw. |
| `Digits.tsx` | Number, % and "Sufficient": the slot-machine columns, or the counting number in step-up mode. |
| `Tags.tsx` | The status chip: its gradients, its entrance, and the gathering spinner. |
| `layout.ts` | Text metrics matched to Chrome, paragraph helper, tag names. |
| `assets/orb.png` | orb.svg rasterised by Chrome exactly as the web draws it: a 128px orb centred in a 256px tile. |
| `assets/orb-shadow.png` | That tile's alpha, box-mipmapped and sampled trilinearly at LOD 4.2 (the shadow the web reads with its mip bias). |
| `assets/lock.json` | The padlock Lottie (`window.GF_LOCK` from v7/r3/assets/lock-anim.js). |
| `assets/fonts/` | Roboto 400, 500 and 700, the same static instances Google Fonts serves the web page (v51). |

## How each web piece maps

| web | here |
|---|---|
| WebGL fragment shader `FS` | `shaders/fluid.ts`, a Skia RuntimeEffect. `vec` becomes `float`, `mat2` becomes `float2x2` (both are column-major), `gl_FragCoord` becomes `main(xy)` with y flipped and normalised by height. Constants are folded: uLocal 1, uGreenIn 0, uGauge 1, tide, seg, quad 0, ring 1. The SDF union reduces to the bubble alone, because the pearls' SDF radius is `r*(1-orbMix)` = 0, macro drops are 0 and there are no tap drops. Its normal is analytic instead of a finite difference. |
| `pow(neg, 2.)` in the band | written as `z*z`. Chrome evaluates it as a square, but SkSL on a GPU may return NaN. |
| embed output `vec4(col - m, 1 - m)` and the round edge fade | kept exactly, so both canvases are transparent and exact over white. |
| canvas DPR `min(devicePixelRatio, 2)` | the fluid canvas is laid out at `dpr / PixelRatio` of the hero and scaled up with a view transform. To use 1.5x on low-end devices, set `MAX_FLUID_DPR = 1.5` in index.tsx. |
| orb program `pr2` (30 textured quads, premultiplied blend) | `shaders/orbs.ts`: one rect over the hero that walks the 30 tiles in order and composites them the same way (`s + acc*(1-s.a)`). It keeps the same grey mix, dimming and green shadow. |
| `texture2D(uT, uv, 1.8)` (mip bias for the shadow) | Skia has no LOD bias, so the shadow is baked into `orb-shadow.png`. |
| mipmapped orb texture | four bilinear taps half a device pixel apart, because Skia does not pick mip levels for a child shader sampled at explicit coordinates. |
| `frame()` and `clock()` | `timeline.ts` worklets run by `useFrameCallback`. Every prop is a `useDerivedValue`, so the animation causes no React renders. The intro runs at 2.3x on an 11.5s score clock, then the idle runs at 1x. |
| `vCur` lerping from the "Orbs" variant at 3/s | kept (`vk = e^-3t`). It is visible in step-up mode as a first second where the rim and glow are deeper green, the same as the web. |
| pulse spring `pulseV += (-120p - 20v)dt` | the same, in the frame callback. Kicks: +0.8 on step-up at 0.5s, +0.9 when the padlock completes. |
| `.slot` columns (strip, 1em window, gradient mask, blur ≤ 1.2px) | `Digits.tsx`: per column a clipped layer with the two digits that can be in view, a blurred inner layer, and a `dstIn` gradient rect. |
| `.score` opacity, blur (1-op)×8 and scale (.92+.08op)(1+pulse) | a Group layer with opacity and Blur, translated to the bubble every frame. |
| `.tag` (linear fill on the padding box, conic border on the border box) | `Tags.tsx`: an outer RoundedRect r8 with a SweepGradient (CSS `from 90deg` is Skia's 0, both run clockwise), an inner r7 with a LinearGradient on the CSS gradient line. Widths 68/98/106/115, auto for log and gathering. The position is snapped to whole pixels as on the web. |
| `.end` 0 and 100 | Paragraphs, snapped, at 0.55 opacity when locked. |
| gain pill | a RoundedRect and a bold 13px Paragraph that rises 58 to 80px above the bubble and fades as sin(πk). |
| lottie padlock | `lottie-react-native` in an Animated.View at the score block's place, with the same opacity and scale. It plays when the score clock passes 6.1. |

Text: the word, tag, labels and pill are SkParagraphs. These shape and kern the way Chrome does: for example
"Room To Grow" is 78.73 wide against Chrome's 78.734, and plain glyph advances would give 79.66. The digits use a
SkFont with linear metrics and subpixel positioning. The vertical offsets (digit baseline 30, % 16.328,
word 50, tag 15, labels 12) were measured in Chrome with a baseline probe. They are in `layout.ts`.

## Verification done

- Both SkSL sources compile in CanvasKit (`RuntimeEffect.Make`). The fluid shader has 62 uniform floats and the orb shader 121.
- Frames were rendered offscreen in CanvasKit using these exact shaders and `timeline.ts`, and compared side by side
  with headless Chrome running the web page on a virtual clock, at the same moments. Checked: the intro bloom (1s),
  the bubble (2s), the arrival (3s), settled (6s), locked (1.5s and 4s, glint included), and step-up (0.4s and 3s).
  The bubble, glow, ring, aura, orb placement, orb greying and shadows match closely.
- TypeScript: `tsc --strict` is clean against the real typings of skia 1.12.4, reanimated 3.19.0,
  lottie-react-native 6.7.2 and react-native 0.77.3.
- Babel: every file transforms with `react-native-reanimated/plugin` (Babel 7), giving 39 worklets.
- Layout against Chrome's DOM, at score 54: digit columns x 169.89 (Chrome 169.87), % x 210.65 (210.65),
  tag 146,228 (146,228), labels 98/276,240 (same).

## Known differences

- The score text's white glow (`text-shadow 0 1px 12px rgba(255,255,255,.6)`) is left out. It is white on a near-white bubble.
- The padlock fades and scales with the score block, but it does not blur in, because RN views have no blur filter.
- CSS applies `filter: blur()` before its transform. Skia applies a layer's blur in the scaled space, so it differs slightly during the 0.4s entrance.
- The web reads orb shadows at a slightly different mip level for big and small orbs (about 3.9 and 4.5). Here both use 4.2.
- With `reducedMotion`, the start-up variant blend is skipped, and so are the step-up count and the padlock animation: they appear finished.
- `playKey` replays the intro, the step-up count and the padlock, but not the one-time variant blend, the same as the web's "Play again".
- Taps (pop ripple, tap drops) are not ported. The embedded hero has `pointer-events: none` on the web as well.

## Device run

Ran on the iPhone 17 Pro simulator and an Android 15 emulator on 1 Oct 2026: intro, settled, locked and step-up all
render as on the web. Still to check on real phones: GPU cost of the fluid at 2x on low-end Android (use the 1.5x
switch above if it is too slow), and Paragraph baselines on device. See `../HANDOFF.md`.

## Integration (harness)

The module has no `node_modules` of its own. It resolves its peers from the app.

1. Import it: `import SufficiencyScore from '../SufficiencyScore';` (from `rn/ScoreLab/App.tsx` or similar).
2. Metro (`rn/ScoreLab/metro.config.js`): add the folder and resolve peers from the app:
   ```js
   const path = require('path');
   config.watchFolders = [path.resolve(__dirname, '../SufficiencyScore')];
   config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];
   ```
   `.ttf`, `.png` and `.json` are already in Metro's default asset and source extensions.
3. Babel: the app's `babel.config.js` must include `'react-native-reanimated/plugin'` (last). The worklets in
   `timeline.ts`, `layout.ts`, `Digits.tsx`, `Tags.tsx` and `index.tsx` need it, and a project-wide `babel.config.js`
   also covers watch folders.
4. Assets are loaded with `require()` inside the module, so there is nothing to link:
   `assets/orb.png`, `assets/orb-shadow.png`, `assets/lock.json`, and `assets/fonts/Roboto-{Regular,Medium,Bold}.ttf`.
   The fonts are loaded by Skia, so they do not need to be registered as native fonts.
5. Native: `@shopify/react-native-skia`, `react-native-reanimated` and `lottie-react-native` need `pod install` on iOS.

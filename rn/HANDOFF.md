# Sufficiency Score for React Native: developer handoff

The Cloud Drop score from the Eat prototype, rebuilt for the GoodFlip app's stack. The web version is the source of
truth: https://em3-wireframes.vercel.app/liquid-score/ (and in context in the PRD at /v7/nutrition-sufficiency.html).

## What is in this folder

| Folder | What it is |
|---|---|
| `SufficiencyScore/` | The component. Drop this into the app. 540 KB, no native code of its own. Start with its `README.md`. |
| `WinMoment/` | The win moment (Rise): liquid floods up from the Log button, the gain lands as "+N%", hands over to the score. No Skia, about 0 MB. Start with its `README.md`. |
| `ScoreLab/` | A small test app on the same versions as GoodFlip, with buttons for every state. Start with its `SETUP.md`. |

## Stack it was built for

React Native 0.77.3, React 18.3.1, Hermes, old architecture. `@shopify/react-native-skia` 1.12.4,
`react-native-reanimated` 3.19, `lottie-react-native` 6.7.2. No new dependencies beyond what GoodFlip already has
(Skia is the one to confirm).

## Using it

```tsx
import SufficiencyScore from './SufficiencyScore';

<SufficiencyScore score={54} tag="solid" />                 // normal day
<SufficiencyScore score={67} from={54} tag="solid" />       // after a log: holds 54, shows +13, counts up
<SufficiencyScore score={0} lock="lit" />                   // locked state with the padlock animation
<SufficiencyScore score={54} playKey={n} />                 // change playKey to replay the intro
```

Props: `score`, `from?`, `lock?: 'lit' | 'quiet'`, `tag?`, `playKey?`, `reducedMotion?`, `width?`, `height?` (300).
Tags: `solid`, `grow`, `attention`, `none`, `log`, `gathering`.

## What has been checked

Run on the iPhone 17 Pro simulator and an Android 15 (API 35) emulator on 1 Oct 2026:

- Intro: cloud, spiral, drop, bubble, orbs rising, digits counting, tag. Smooth on iOS.
- Settled at 54 with the Solid Day tag: matches the web on both platforms.
- Step-up 54 to 67: holds 54, the +13 pill rises, counts to 67, extra orbs fill. Seamless on iOS.
- Locked: the padlock Lottie plays in the bubble, then the grey orbs come in (checked on Android).
- Offscreen renders of the shaders were compared frame by frame against the web and match closely.

## Android felt slow: is that real?

Update: a release build (`ScoreLab-android.apk`) runs smoothly on a real Android phone, so the slowness was the
emulator. The notes below still apply to low-end devices.

Most likely it is the emulator, not the component. The emulator draws the GPU through the Mac and this machine was
under heavy load during the test (load average 11 to 40), so timing there is not representative. iOS on the same
machine was smooth.

It still needs a real device check, and the cost to watch is the fluid shader, which renders the bubble every frame at
up to 2x pixel density. To check and tune:

1. Run `ScoreLab` in release mode on a mid and a low-end Android phone (`npx react-native run-android --mode release`).
   Debug builds are much slower and should not be judged.
2. Watch the intro and a step-up with the GPU rendering profile on (Developer options).
3. If frames drop, open `SufficiencyScore/index.tsx` and set `MAX_FLUID_DPR = 1.5` (or 1). The orbs and text stay
   sharp because they are drawn on a separate full-density canvas; only the soft bubble renders smaller.
4. If it is still heavy on the lowest devices, pass `reducedMotion` there: it skips the intro and shows the settled
   score.

## Known differences from the web

Small and listed in full in `SufficiencyScore/README.md`. In short: the orb shadow is pre-baked into an image, the
white glow behind the number is left out (white on near-white), the padlock fades in without a blur, and the tap
ripples are not ported (the score ignores taps on the web too).

## Gotchas found on the first device run (already fixed)

- Skia 1.12.4: `SkFont.setSubpixel` must be given a number and `setLinearMetrics` a boolean. The wrong type aborts the
  app natively with no JS error.
- Android in development only: if the component lives outside the app folder, Metro serves its images and fonts at
  `/assets/../...` and Android folds that path, so they 404 and only the bubble shows. `ScoreLab/metro.config.js` has
  the fix. This does not affect release builds, and goes away once the component sits inside the app.
- Xcode 26 and Android SDK 35 needed small build fixes for RN 0.77. They are in `ScoreLab/SETUP.md`.

## Win moment

`WinMoment/` is the Rise win moment, built with react-native-svg and Reanimated only, so it adds no graphics library.
New dependency: `react-native-haptic-feedback` for the taps (light on press, success when the gain lands). In ScoreLab
the "Log flow" tab runs the whole thing: logger, win, then the day view with the score stepping up by the same "+N%".
Gains are shown in % everywhere, to match the score.

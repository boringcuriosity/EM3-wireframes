# WinMoment

The moment between tapping "Log n items" and landing back on the day: the Rise animation with layout B, ported
from the web prototype (`app/public/v7/r3/assets/win-moment.js`). No Skia: react-native-svg + Reanimated only.

## Usage

```tsx
const win = useRef<WinMomentHandle>(null);

<WinMoment ref={win} />                                   // mount once, full screen, above the logger

win.current?.begin(buttonRect, ['Dal tadka', 'Jeera rice']);   // on press: liquid wells out of the button while it saves
win.current?.win({ gain: 3, meal: 'Lunch', n: 2 }, () => goToDay({ from: 54, score: 57 }));   // save landed
win.current?.cancel();                                    // save failed
```

`win()` pays off no sooner than 0.7s after `begin()`, holds about 2.8s, drains to white, then calls the callback.
Hand the gain to the day view as `from` / `score` on `SufficiencyScore` so its "+3%" pill picks up where this left off.
`queued: true` shows the offline copy.

## How it maps to the web

| Web | Here |
|---|---|
| Canvas: blob, liquid, edge line, bubbles, sparkles | One react-native-svg canvas, paths as animated props from one UI-thread frame callback |
| Food chips riding up | RN views, Reanimated styles |
| Layout B content, count-up | RN views and text (`Content.tsx`), "+N%" with a small raised % |
| `buzz()` | `haptics.ts`: light tap on press, soft on the surge, success when the gain lands |
| Reduced motion | No flood: the content fades in |

## Size and cost

About 0 MB: code only. The one new dependency is `react-native-haptic-feedback` (small, old-architecture safe),
which GoodFlip does not have yet. It runs for about 3.5s and then unmounts its work.

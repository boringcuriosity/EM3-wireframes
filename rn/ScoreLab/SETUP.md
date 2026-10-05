# ScoreLab setup

A bare React Native harness for `../SufficiencyScore`, with versions pinned to the GoodFlip app (`/Users/shaheer/Documents/GF/MyTatva-RN`).

## Versions

| Thing | Version | Note |
|---|---|---|
| react-native | 0.77.3 | same as GoodFlip |
| react | 18.3.1 | same |
| Hermes | on | `hermesEnabled=true` |
| Architecture | OLD (Paper/bridge) | `newArchEnabled=false` (android/gradle.properties), `ENV['RCT_NEW_ARCH_ENABLED']='0'` at the top of ios/Podfile |
| react-native-reanimated | 3.19.0 | babel plugin is last in babel.config.js |
| lottie-react-native | 6.7.2 | patched (see fixes) |
| react-native-svg | 15.6.0 | patched (see fixes) |
| @shopify/react-native-skia | 1.12.4 | last 1.x line |
| Android SDK | minSdk 26, compile/target 35, build-tools 35.0.0 | NDK 27.1.12297006 (RN 0.77 template default; GoodFlip uses 28.0.13004108) |
| Kotlin | 2.0.21 | same |
| Toolchain used | Xcode 26.4.1, CocoaPods 1.17.0 (brew), JDK 17, Node 25 | |

## Run it

The commands below assume you are in `/Users/shaheer/Documents/EM3/rn/ScoreLab`.

```sh
# 0. once, after cloning or after npm install (postinstall runs patch-package)
npm install
cd ios && pod install && cd ..          # Podfile forces RCT_NEW_ARCH_ENABLED=0

# 1. Metro (keep it running in its own terminal)
npx react-native start --reset-cache

# 2a. iOS: boot the simulator, then build and launch
xcrun simctl boot "iPhone 17 Pro"; open -a Simulator
npx react-native run-ios --simulator "iPhone 17 Pro"
#    what was actually verified (same result, explicit):
#    xcodebuild -workspace ios/ScoreLab.xcworkspace -scheme ScoreLab -configuration Debug \
#      -sdk iphonesimulator -destination 'name=iPhone 17 Pro' -derivedDataPath ios/build
#    xcrun simctl install booted ios/build/Build/Products/Debug-iphonesimulator/ScoreLab.app
#    xcrun simctl launch booted org.reactjs.native.example.ScoreLab

# 2b. Android: start the emulator, then build and launch
~/Library/Android/sdk/emulator/emulator -avd ScoreLab_API35 -no-audio &
npx react-native run-android
#    what was actually verified (same result, explicit):
#    (cd android && ./gradlew app:assembleDebug -PreactNativeArchitectures=arm64-v8a)
#    adb reverse tcp:8081 tcp:8081
#    adb install -r android/app/build/outputs/apk/debug/app-debug.apk
#    adb shell am start -n com.scorelab/.MainActivity

# Screenshots
xcrun simctl io booted screenshot ios.png
adb exec-out screencap -p > android.png
```

## Swapping in the real component

In `App.tsx`, find the block marked `COMPONENT UNDER TEST` and replace the placeholder with:

```ts
import SufficiencyScore from '../SufficiencyScore';
const ScoreUnderTest: React.ComponentType<SufficiencyScoreProps> = SufficiencyScore;
```

The props contract (`SufficiencyScoreProps`) is exported from App.tsx: `score`, `from?`, `lock?: 'lit'|'quiet'`, `tag?: 'solid'|'grow'|'attention'|'none'|'log'|'gathering'`, `playKey?`, `reducedMotion?`, `width?`, `height?`. The harness passes the full window width and a height of 300. Every control press bumps `playKey`.

## Metro and ../SufficiencyScore

`metro.config.js`:
- `watchFolders: [../SufficiencyScore]`, so Metro bundles and hot-reloads the sibling folder. This is added only if the folder exists when Metro starts. **Restart Metro if the folder was created after Metro started.**
- `resolver.nodeModulesPaths: [ScoreLab/node_modules]`, so bare imports from the component (which has no node_modules of its own) resolve from the app.
- `resolver.resolveRequest` forces `react`, `react-native`, `react-native-reanimated`, `@shopify/react-native-skia`, `lottie-react-native` and `react-native-svg` to resolve as if imported from ScoreLab's root. Even if the component folder ever gets its own node_modules, these stay single copies.
- `babel.config.js` is a project-wide config, so the Reanimated worklet plugin also transforms files in `../SufficiencyScore`.
- Verified with an offline `react-native bundle` of an entry that imports `../SufficiencyScore`. It bundled, with exactly one `react/index.js` and one `react-native/index.js`.

## Non-obvious fixes

1. **iOS, fmt consteval error (Xcode 16.3+ / 26).** RN 0.77 ships fmt 11.0.2. New Apple clang fails with `call to consteval function ... is not a constant expression` in `fmt/format-inl.h`. Fix: `post_install` in `ios/Podfile` patches `Pods/fmt/include/fmt/base.h` to force `FMT_USE_CONSTEVAL 0`. It is idempotent and re-applies on every `pod install`.
2. **Old arch on iOS.** `ENV['RCT_NEW_ARCH_ENABLED'] = '0'` sits at the top of the Podfile, so a plain `pod install` is old arch without needing the env var.
3. **Android, lottie-react-native 6.7.2 does not compile against RN 0.77** (`ReadableArray.getMap()` is now nullable). Kotlin errors in `LottieAnimationViewPropertyManager.kt`. Fix: GoodFlip's own patch, with its committed `android/build/` artefacts stripped, is in `patches/lottie-react-native+6.7.2.patch` and applied by `patch-package` on `postinstall`.
4. **Android, react-native-svg 15.6.0.** GoodFlip's source-only patch (old-arch `paper/` ManagerDelegates and `VirtualView.java`) was copied to `patches/react-native-svg+15.6.0.patch` to match production. It was applied before the second build, so it was not separately proven necessary in this harness.
5. **Android SDK pieces were missing.** These were installed with sdkmanager: `platforms;android-35`, `build-tools;35.0.0`, `ndk;27.1.12297006`, `cmake;3.22.1`, `system-images;android-35;google_apis;arm64-v8a`.
6. **Emulator.** The pre-existing `Pixel_8` AVD (Android 37 Play Store preview, 16 KB pages, 2 GB RAM) kept restarting system_server, so APK installs failed. A new AVD, `ScoreLab_API35` (API 35 google_apis arm64, 4 GB RAM), works. On a busy Mac the first boot can show "System UI isn't responding" or "Gboard isn't responding". Tap Wait. `adb shell settings put global hide_error_dialogs 1` suppresses them.
7. **Edge-to-edge on Android 15.** targetSdk 35 forces edge-to-edge, and RN's `SafeAreaView` only insets on iOS. The harness pads by `StatusBar.currentHeight` on Android.
8. **Debug bundle load timeouts.** On a heavily loaded host, Android sometimes showed "Unable to load script" even with Metro up. A force-stop and relaunch fixed it. Check `curl localhost:8081/status` and `adb reverse --list`.

## Running the real component (added after first device run)

- `App.tsx` now renders `../SufficiencyScore`.
- Android dev: assets from `../SufficiencyScore` load at `/assets/../SufficiencyScore/...`, which Android's HTTP client folds to `/SufficiencyScore/...` (404, so orbs, text and padlock vanish). `metro.config.js` rewrites it back via `server.rewriteRequestUrl`. Release builds are unaffected.
- Skia 1.12.4: `SkFont.setSubpixel` takes a number on the JSI side, `setLinearMetrics` a boolean. Passing the wrong type aborts the app natively.

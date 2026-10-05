/**
 * ScoreLab: harness for the SufficiencyScore and WinMoment React Native components.
 * Two tabs: "Score" (the score lab, every state of ../SufficiencyScore) and "Log flow" (LogFlow.tsx: a mock
 * logger whose button plays ../WinMoment and lands on a day view with the score stepping up).
 *
 * Until ../SufficiencyScore exists, a placeholder proves the native stack works:
 * a Skia RuntimeEffect shader driven by a Reanimated frame callback, plus a Lottie view.
 * To switch to the real component, edit the block marked "COMPONENT UNDER TEST".
 */
import React, {useCallback, useRef, useState} from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  Settings,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {Canvas, Fill, Shader, Skia} from '@shopify/react-native-skia';
import {
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import WinMoment from '../WinMoment';
import type {WinMomentHandle} from '../WinMoment';
import LogFlow from './LogFlow';
import type {WinOpts} from './LogFlow';
import CoinToastScreen from './src/flipcoin/CoinToastScreen';
import GlobalCoinAnimation from './src/flipcoin/GlobalCoinAnimation';

// ---------------------------------------------------------------------------
// Props contract shared with ../SufficiencyScore
// ---------------------------------------------------------------------------
export type ScoreTag =
  | 'solid'
  | 'grow'
  | 'attention'
  | 'none'
  | 'log'
  | 'gathering';

export interface SufficiencyScoreProps {
  score: number;
  from?: number;
  lock?: 'lit' | 'quiet';
  tag?: ScoreTag;
  playKey?: number;
  reducedMotion?: boolean;
  width?: number;
  height?: number;
}

// ===========================================================================
// COMPONENT UNDER TEST
// To use the real component, uncomment the import and change the assignment:
//
//   import SufficiencyScore from '../SufficiencyScore';
//   const ScoreUnderTest: React.ComponentType<SufficiencyScoreProps> = SufficiencyScore;
//
// ===========================================================================
import SufficiencyScore from '../SufficiencyScore';
const ScoreUnderTest: React.ComponentType<SufficiencyScoreProps> = SufficiencyScore as any;
// ===========================================================================

const HERO_HEIGHT = 300;

// Animated gradient shader, proves Skia RuntimeEffect + Reanimated uniforms.
const effect = Skia.RuntimeEffect.Make(`
uniform float2 res;
uniform float time;
uniform float level; // 0..1, from score

half4 main(float2 pos) {
  float2 uv = pos / res;
  float wave = 0.04 * sin(uv.x * 9.0 + time * 2.2) + 0.02 * sin(uv.x * 17.0 - time * 3.1);
  float surface = 1.0 - level + wave;
  half3 top = half3(1.0, 1.0, 1.0);
  half3 deep = mix(half3(0.10, 0.75, 0.62), half3(0.05, 0.40, 0.55), uv.y);
  float fill = smoothstep(surface - 0.006, surface + 0.006, uv.y);
  float sheen = 0.08 * sin(time + uv.x * 3.0);
  return half4(mix(top, deep + sheen, fill), 1.0);
}`)!;

function Placeholder({
  score,
  from,
  lock,
  tag,
  playKey,
  reducedMotion,
  width = 360,
  height = HERO_HEIGHT,
}: SufficiencyScoreProps) {
  const time = useSharedValue(0);
  const level = useSharedValue(score / 100);

  useFrameCallback(frame => {
    if (!reducedMotion) {
      time.value += (frame.timeSincePreviousFrame ?? 16) / 1000;
    }
    // Ease the liquid level toward the target score.
    level.value += (score / 100 - level.value) * 0.08;
  });

  const uniforms = useDerivedValue(() => ({
    res: [width, height],
    time: time.value,
    level: level.value,
  }));

  return (
    <View style={{width, height}}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Fill>
          <Shader source={effect} uniforms={uniforms} />
        </Fill>
      </Canvas>
      <View style={styles.overlay} pointerEvents="none">
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.meta}>
          from {from ?? '-'} · lock {lock ?? '-'} · tag {tag ?? '-'}
        </Text>
        <Text style={styles.meta}>
          playKey {playKey ?? 0} · reducedMotion {String(!!reducedMotion)}
        </Text>
      </View>
      <LottieView
        key={playKey}
        source={require('./assets/pulse.json')}
        autoPlay={!reducedMotion}
        loop
        style={styles.lottie}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Harness screen
// ---------------------------------------------------------------------------
const PRESETS = [0, 12, 54, 88, 100];
const TAGS: ScoreTag[] = ['solid', 'grow', 'attention', 'none', 'log', 'gathering'];

function Button({label, onPress, active}: {label: string; onPress: () => void; active?: boolean}) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.btn, active && styles.btnActive, pressed && styles.btnPressed]}>
      <Text style={[styles.btnText, active && styles.btnTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ScoreScreen() {
  const {width} = useWindowDimensions();
  const [props, setProps] = useState<SufficiencyScoreProps>({score: 54, tag: 'solid', playKey: 0});

  const set = useCallback(
    (patch: Partial<SufficiencyScoreProps>) =>
      setProps(p => ({...p, ...patch, playKey: (p.playKey ?? 0) + 1})),
    [],
  );

  return (
    <View style={styles.flex}>
      <ScoreUnderTest {...props} width={width} height={HERO_HEIGHT} />
      <ScrollView contentContainerStyle={styles.controls}>
        <View style={styles.row}>
          <Button label="Replay" onPress={() => set({})} />
          {PRESETS.map(s => (
            <Button
              key={s}
              label={String(s)}
              active={props.score === s && props.from === undefined && !props.lock}
              onPress={() => set({score: s, from: undefined, lock: undefined})}
            />
          ))}
        </View>
        <View style={styles.row}>
          <Button label="Locked lit" active={props.lock === 'lit'} onPress={() => set({lock: 'lit'})} />
          <Button label="Locked quiet" active={props.lock === 'quiet'} onPress={() => set({lock: 'quiet'})} />
          <Button
            label="Step-up 54→67"
            active={props.from === 54 && props.score === 67}
            onPress={() => set({from: 54, score: 67, lock: undefined})}
          />
        </View>
        <View style={styles.row}>
          {TAGS.map(t => (
            <Button key={t} label={t} active={props.tag === t} onPress={() => set({tag: t})} />
          ))}
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Reduced motion</Text>
          <Switch value={!!props.reducedMotion} onValueChange={v => set({reducedMotion: v})} />
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// App: a top toggle between the score lab and the log flow (../WinMoment)
// ---------------------------------------------------------------------------
type Tab = 'score' | 'log' | 'coin';

export default function App() {
  const [tab, setTab] = useState<Tab>(Platform.OS === 'ios' && Settings.get('coinTab') == 1 ? 'coin' : 'log'); // eslint-disable-line eqeqeq
  const win = useRef<WinMomentHandle>(null);
  // test hook: launch the iOS simulator app with `-wmReduced 1` to start with reduced motion on
  const [opts, setOpts] = useState<WinOpts>({reduced: Platform.OS === 'ios' && Settings.get('wmReduced') == 1}); // eslint-disable-line eqeqeq
  return (
    <View style={styles.flex}>
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {/* on the Coin toast tab the toggle moves to the bottom so the top of the screen is plain white, as under the real toast */}
        <View style={[styles.tabs, tab === 'coin' && styles.tabsBottom]} accessibilityRole="tablist">
          {(['score', 'log', 'coin'] as Tab[]).map(k => (
            <Pressable
              key={k}
              accessibilityRole="tab"
              accessibilityState={{selected: tab === k}}
              onPress={() => setTab(k)}
              style={[styles.tab, tab === k && styles.tabOn]}>
              <Text style={[styles.tabText, tab === k && styles.tabTextOn]}>{k === 'score' ? 'Score' : k === 'log' ? 'Log flow' : 'Coin toast'}</Text>
            </Pressable>
          ))}
        </View>
        {tab === 'score' ? <ScoreScreen /> : tab === 'log' ? <LogFlow win={win} opts={opts} setOpts={setOpts} /> : <CoinToastScreen />}
      </SafeAreaView>
      {/* the win moment covers the whole window, status bar included, as the web's overlay covers the phone */}
      <WinMoment ref={win} reducedMotion={opts.reduced ? true : undefined} />
      {/* GoodFlip mounts GlobalCoinAnimation at the app root, window-sized, no safe-area padding */}
      <GlobalCoinAnimation />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: '#FFFFFF'},
  tabsBottom: {position: 'absolute', left: 0, right: 0, bottom: 34, marginBottom: 8},
  tabs: {flexDirection: 'row', gap: 4, margin: 8, marginBottom: 0, padding: 4, borderRadius: 12, backgroundColor: '#F2F4F7'},
  tab: {flex: 1, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center'},
  tabOn: {backgroundColor: '#FFFFFF', shadowColor: '#101828', shadowOpacity: 0.08, shadowRadius: 3, shadowOffset: {width: 0, height: 1}, elevation: 1},
  tabText: {fontSize: 14, color: '#667085', fontFamily: 'Roboto-Medium'},
  tabTextOn: {color: '#101828'},
  // targetSdk 35 forces edge-to-edge on Android 15; SafeAreaView only insets iOS.
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },
  overlay: {...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center'},
  score: {fontSize: 64, fontWeight: '700', color: '#10302B'},
  meta: {fontSize: 12, color: '#10302B'},
  lottie: {position: 'absolute', top: 12, right: 12, width: 48, height: 48},
  controls: {padding: 16, gap: 8},
  row: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center'},
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C9D6D3',
  },
  btnActive: {backgroundColor: '#10302B', borderColor: '#10302B'},
  btnPressed: {opacity: 0.6},
  btnText: {fontSize: 14, color: '#10302B'},
  btnTextActive: {color: '#FFFFFF'},
  label: {fontSize: 14, color: '#10302B'},
});

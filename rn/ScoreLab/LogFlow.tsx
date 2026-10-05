/**
 * Log flow: a mock logger whose button plays the win moment (../WinMoment) and lands on a day view where the
 * score steps up (../SufficiencyScore in step-up mode), so the moment's "+3%" hands over to the score's "+3%".
 *
 *   tap "Log 2 items" -> begin() from the button's rect -> a simulated 600ms save -> win({gain 3, meal Lunch, n 2})
 *   -> the moment drains into white -> onDone shows the day view (54 -> 57) -> "Log again" resets.
 */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Platform, Pressable, Settings, StyleSheet, Switch, Text, View, useWindowDimensions} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import SufficiencyScore from '../SufficiencyScore';
import {measureInWindow} from '../WinMoment';
import type {WinMomentHandle} from '../WinMoment';

const GREEN = '#299D6B';
const LIP = '#2A805A';
const INK = '#101828';
const MUTED = '#667085';
const LINE = '#EAECF0';

const FOODS = [
  {name: 'Dal tadka', portion: '1 bowl', kcal: 180},
  {name: 'Jeera rice', portion: '1 cup', kcal: 210},
];
const SAVE_MS = 600;
const GAIN = 3;
const FROM = 54;

export type WinOpts = {reduced: boolean};

type Props = {
  win: React.RefObject<WinMomentHandle>;
  opts: WinOpts;
  setOpts: (o: WinOpts) => void;
};

export default function LogFlow({win, opts, setOpts}: Props) {
  const [screen, setScreen] = useState<'log' | 'day'>('log');
  const [queued, setQueued] = useState(false);
  const queuedRef = useRef(false);
  queuedRef.current = queued;
  const [busy, setBusy] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const btn = useRef<View>(null);
  const {width} = useWindowDimensions();

  const log = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const rect = await measureInWindow(btn.current);
    win.current?.begin(
      rect,
      FOODS.map(f => f.name),
    );
    // the save: the charge plays while it runs
    setTimeout(() => {
      win.current?.win({gain: GAIN, meal: 'Lunch', n: FOODS.length, queued: queuedRef.current}, () => {
        setScreen('day');
        setPlayKey(k => k + 1);
        setBusy(false);
      });
    }, SAVE_MS);
  }, [busy, win]);

  /* test hook (iOS simulator, no tap tool): launch with `-wmAuto 1` (and `-wmQueued 1`) to log by itself
     1.5s after the logger appears, the web's ?auto=1. Settings reads launch arguments through NSUserDefaults. */
  const auto = Platform.OS === 'ios' && Settings.get('wmAuto') == 1; // eslint-disable-line eqeqeq
  useEffect(() => {
    if (!auto || screen !== 'log') return;
    if (Settings.get('wmQueued') == 1) { // eslint-disable-line eqeqeq
      queuedRef.current = true;
      setQueued(true);
    }
    const id = setTimeout(() => btn.current && log(), 1500);
    return () => clearTimeout(id);
  }, [auto, screen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (screen === 'day') {
    return (
      <View style={styles.page}>
        <View style={styles.head}>
          <Text style={styles.title}>Today</Text>
          <Text style={styles.sub}>Your nutrition sufficiency</Text>
        </View>
        {/* queued: the save has not reached the server, so the score holds where it was */}
        {queued ? (
          <SufficiencyScore key={playKey} score={FROM} tag="grow" width={width} height={300} />
        ) : (
          <SufficiencyScore key={playKey} from={FROM} score={FROM + GAIN} tag="grow" width={width} height={300} />
        )}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lunch</Text>
          <Text style={styles.cardSub}>
            {FOODS.map(f => f.name).join(', ')}
            {queued ? '. Sends when you are back online.' : ''}
          </Text>
        </View>
        <View style={styles.foot}>
          <Pressable accessibilityRole="button" onPress={() => setScreen('log')} style={({pressed}) => [styles.secondary, pressed && styles.pressed]}>
            <Text style={styles.secondaryText}>Log again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.head}>
        <Text style={styles.title}>Lunch</Text>
        <Text style={styles.sub}>Today</Text>
      </View>
      <View style={styles.list}>
        {FOODS.map(f => (
          <View key={f.name} style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.food}>{f.name}</Text>
              <Text style={styles.portion}>
                {f.portion} · {f.kcal} kcal
              </Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.options}>
        <View style={styles.opt}>
          <Text style={styles.optText}>Queued (offline)</Text>
          <Switch value={queued} onValueChange={setQueued} trackColor={{true: GREEN}} />
        </View>
        <View style={styles.opt}>
          <Text style={styles.optText}>Reduced motion</Text>
          <Switch value={opts.reduced} onValueChange={v => setOpts({...opts, reduced: v})} trackColor={{true: GREEN}} />
        </View>
      </View>
      <View style={styles.foot}>
        <PrimaryButton ref={btn} label={`Log ${FOODS.length} items`} onPress={log} />
      </View>
    </View>
  );
}

/* GoodFlip's primary: #299D6B, 48 tall, radius 12, with its 4px lip that the button sinks into when pressed
   (web: box-shadow 0 4px 0 #2A805A, :active translateY(4px), .2s ease-out). */
const PrimaryButton = React.forwardRef<View, {label: string; onPress: () => void}>(function PrimaryButton({label, onPress}, ref) {
  const down = useSharedValue(0);
  const face = useAnimatedStyle(() => ({transform: [{translateY: down.value * 4}]}));
  const ease = {duration: 200, easing: Easing.out(Easing.quad)};
  return (
    <View style={styles.lipWrap}>
      <View style={styles.lip} />
      <Animated.View style={face}>
        <Pressable
          ref={ref}
          accessibilityRole="button"
          onPressIn={() => (down.value = withTiming(1, ease))}
          onPressOut={() => (down.value = withTiming(0, ease))}
          onPress={onPress}
          style={styles.primary}>
          <Text style={styles.primaryText}>{label}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  flex: {flex: 1},
  page: {flex: 1, backgroundColor: '#FFFFFF'},
  head: {paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8},
  title: {fontSize: 22, lineHeight: 28, color: INK, fontFamily: 'Roboto-Bold'},
  sub: {marginTop: 2, fontSize: 13, lineHeight: 18, color: MUTED, fontFamily: 'Roboto-Regular'},
  list: {marginTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderColor: LINE},
  row: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: LINE},
  food: {fontSize: 15, lineHeight: 22, color: INK, fontFamily: 'Roboto-Medium'},
  portion: {marginTop: 2, fontSize: 13, lineHeight: 18, color: MUTED, fontFamily: 'Roboto-Regular'},
  options: {marginTop: 24, paddingHorizontal: 16, gap: 8},
  opt: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch'},
  optText: {fontSize: 14, color: MUTED, fontFamily: 'Roboto-Regular'},
  foot: {position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'android' ? 48 : 24, backgroundColor: '#FFFFFF'}, // Android 15 is edge-to-edge: clear the gesture bar
  lipWrap: {height: 52},
  lip: {position: 'absolute', left: 0, right: 0, top: 4, height: 48, borderRadius: 12, backgroundColor: LIP},
  primary: {height: 48, borderRadius: 12, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center'},
  primaryText: {fontSize: 15, color: '#FFFFFF', fontFamily: 'Roboto-Bold'},
  secondary: {height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#D0D5DD', alignItems: 'center', justifyContent: 'center'},
  secondaryText: {fontSize: 15, color: INK, fontFamily: 'Roboto-Medium'},
  pressed: {opacity: 0.7},
  card: {marginHorizontal: 16, marginTop: 8, padding: 16, borderRadius: 12, backgroundColor: '#F6FEF9'},
  cardTitle: {fontSize: 15, lineHeight: 22, color: INK, fontFamily: 'Roboto-Medium'},
  cardSub: {marginTop: 2, fontSize: 13, lineHeight: 18, color: MUTED, fontFamily: 'Roboto-Regular'},
});

// Harness screen for the FlipCoin toast: plain white, a Play button near the bottom.
// Play emits the same DeviceEventEmitter event GoodFlip's socket handler emits (COIN_CREDITED).
// Launch arg `-coinAuto 1` (iOS) fires Play every 4 s, starting 2 s after mount, for capture without tapping.
import React, {useEffect, useState} from 'react';
import {DeviceEventEmitter, Platform, Pressable, Settings, StyleSheet, Text, View} from 'react-native';
import {COIN_CREDITED} from './constants';

export default function CoinToastScreen() {
  const [n, setN] = useState(0);
  const play = () => {
    setN(v => v + 1);
    DeviceEventEmitter.emit(COIN_CREDITED, {});
  };
  useEffect(() => {
    if (!(Platform.OS === 'ios' && Settings.get('coinAuto') == 1)) return; // eslint-disable-line eqeqeq
    let iv: ReturnType<typeof setInterval>;
    const t = setTimeout(() => {
      play();
      iv = setInterval(play, 4000);
    }, 2000);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, []);
  return (
    <View style={styles.screen}>
      {/* tap marker: changes in the same commit that mounts the toast, so video frames can find t=0 */}
      <Text style={styles.marker}>Plays: {n}</Text>
      <Pressable onPress={play} style={({pressed}) => [styles.btn, pressed && styles.pressed]}>
        <Text style={styles.btnText}>Play</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 120, gap: 12},
  marker: {fontSize: 12, color: '#98A2B3', fontFamily: 'Roboto-Regular'},
  btn: {height: 48, paddingHorizontal: 40, borderRadius: 24, backgroundColor: '#10302B', alignItems: 'center', justifyContent: 'center'},
  pressed: {opacity: 0.7},
  btnText: {fontSize: 16, color: '#FFFFFF', fontFamily: 'Roboto-Medium'},
});

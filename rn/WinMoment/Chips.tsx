/* The logged foods ride up in the water and burst into sparkle at the surface (web: rise(), "chips").

   Each chip is a pill (500 13/16, padding 6/12, white at .2 with a white .45 hairline) that starts 30px above the
   button's centre once the payoff starts, eases up toward 130px under the burst centre (12px less for each next
   chip), drifting sideways by up to 30px, and fades out over the last quarter of its 0.9s ride while it swells by
   15%. Its 8 sparkle dots are drawn in the overlay's SVG (see Sparkles below), so they sit under the text layer
   the same way the web's canvas sits under its DOM chips. */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { Path } from 'react-native-svg';

import { chipState, liquid, sparklePath } from './timeline';
import type { Geo } from './timeline';

const APath = Animated.createAnimatedComponent(Path);

type ChipProps = {
  name: string;
  j: number;
  geo: Geo;
  chips: number[];
  t: SharedValue<number>;
  w: SharedValue<number>;
  ex: SharedValue<number>;
  font: string;
};

export function Chip({ name, j, geo, chips, t, w, ex, font }: ChipProps) {
  const width = useSharedValue(0); // the web's offsetWidth, to centre the chip on its x
  const style = useAnimatedStyle(() => {
    const L = liquid(geo, t.value, w.value, ex.value);
    const s = chipState(geo, chips, j, w.value, L.drain);
    return {
      opacity: width.value > 0 ? s.op : 0,
      transform: [{ translateX: s.cx - width.value / 2 }, { translateY: s.cy }, { scale: s.scale }],
    };
  });
  return (
    <Animated.View style={[styles.chip, style]} onLayout={e => (width.value = e.nativeEvent.layout.width)} pointerEvents="none">
      <Text style={[styles.text, { fontFamily: font }]} numberOfLines={1}>
        {name}
      </Text>
    </Animated.View>
  );
}

export function Sparkles({ j, geo, chips, w }: { j: number; geo: Geo; chips: number[]; w: SharedValue<number> }) {
  const props = useAnimatedProps(() => {
    const s = sparklePath(geo, chips, j, w.value);
    return { d: s.d, fillOpacity: s.op };
  });
  return <APath fill="#FFFFFF" animatedProps={props} />;
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    left: 0,
    top: 0,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  text: { fontSize: 13, lineHeight: 16, letterSpacing: 0.25, color: '#FFFFFF', includeFontPadding: false },
});

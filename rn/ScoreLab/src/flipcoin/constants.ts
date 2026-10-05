// Inlined from GoodFlip src/constants/Matrics.js and colors.ts (identical maths, only what the toast uses).
import {Dimensions} from 'react-native';
import {s, vs, ms, mvs} from 'react-native-size-matters';

const window = Dimensions.get('window');
const screenHeight = window.height;
const screenWidth = window.width;

export const Matrics = {
  screenHeight: screenWidth < screenHeight ? screenHeight : screenWidth,
  screenWidth: screenWidth < screenHeight ? screenWidth : screenHeight,
  s,
  vs,
  ms,
  mvs,
};

export const colors = {
  labelDarkGray: '#313131',
  illuminating_emerald: '#299D6B',
  honeydew: '#E6FAF1',
  onco: {
    goldenYellow: '#F5D736',
    YELLOW_05: '#FFFBEE',
    activeBlack: '#1A1C1E',
  },
};

// globalStyles.ROBOTO_BODY_BOLD_3 (ROBOTO_BASE + Roboto-Bold 12/14.4)
const ROBOTO_BASE = {letterSpacing: 0.25, color: colors.onco.activeBlack};
export const globalStyles = {
  ROBOTO_BODY_BOLD_3: {
    ...ROBOTO_BASE,
    fontFamily: 'Roboto-Bold',
    fontSize: Matrics.mvs(12),
    lineHeight: Matrics.mvs(14.4),
  },
};

export const COIN_CREDITED = 'coin-credited';

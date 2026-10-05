// Copy of GoodFlip src/components/molecules/FlipcoinBadge.tsx (logic and styles unchanged).
import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, Image as FastImage} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Matrics, colors, globalStyles} from './constants';

// Harness: GoodFlip's props type lives elsewhere; FastImage is swapped for RN Image (static icon only).
type FlipcoinBadgeProps = {
  text?: string;
  children?: React.ReactNode;
  shape?: 'pill' | 'circle' | 'vertical' | 'animated';
  iconSize?: number;
  textStyle?: any;
  containerStyle?: any;
  showIcon?: boolean;
  flipcoinIcon?: any;
};
const iconSource = (icon: any) => (typeof icon === 'string' ? {uri: icon} : icon);

const ANIMATED_BORDER_RADIUS = Matrics.mvs(12);
const ANIMATED_BORDER_WIDTH = Matrics.mvs(1.5);
const ANIMATED_BADGE_WIDTH = Matrics.screenWidth - Matrics.s(32); // 16px gap from right edge

const FlipcoinBadge: React.FC<FlipcoinBadgeProps> = ({
  text,
  children,
  shape = 'pill',
  iconSize = Matrics.mvs(20),
  textStyle,
  containerStyle,
  showIcon = true,
  flipcoinIcon = '',
}) => {
  const isCircle = shape === 'circle';
  const isVertical = shape === 'vertical';
  const isAnimated = shape === 'animated';
  const borderRadius = isCircle ? Matrics.mvs(50) : Matrics.mvs(20);
  const borderWidth = isCircle ? Matrics.mvs(1) : Matrics.mvs(1.5);
  const verticalBorderWidth = isVertical ? Matrics.mvs(2) : Matrics.mvs(0);

  const animatedOverlayWidth = useRef(
    new Animated.Value(ANIMATED_BADGE_WIDTH),
  ).current;
  useEffect(() => {
    if (isAnimated) {
      animatedOverlayWidth.setValue(ANIMATED_BADGE_WIDTH);
      Animated.timing(animatedOverlayWidth, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: false,
      }).start();
    }
  }, [isAnimated, animatedOverlayWidth]);

  // Animated variant: full-width with left-to-right reveal
  if (isAnimated) {
    const innerRadius = ANIMATED_BORDER_RADIUS - ANIMATED_BORDER_WIDTH;
    return (
      <View
        style={[
          styles.animatedOuter,
          containerStyle,
          {width: ANIMATED_BADGE_WIDTH, borderRadius: ANIMATED_BORDER_RADIUS},
        ]}>
        {/* Gradient border (green to yellow) */}
        <LinearGradient
          colors={[colors.illuminating_emerald, colors.onco.goldenYellow]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={[
            styles.animatedBorderGradient,
            {
              borderRadius: ANIMATED_BORDER_RADIUS,
              padding: ANIMATED_BORDER_WIDTH,
            },
          ]}>
          <View style={[styles.animatedInnerWrap, {borderRadius: innerRadius}]}>
            <LinearGradient
              colors={[colors.honeydew, colors.onco.YELLOW_05]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={[styles.animatedGradient, {borderRadius: innerRadius}]}
            />
            <Animated.View
              style={[
                styles.animatedOverlayWrapper,
                {width: animatedOverlayWidth, borderRadius: innerRadius},
              ]}
              pointerEvents="none">
              <View
                style={[styles.animatedOverlay, {borderRadius: innerRadius}]}
              />
            </Animated.View>
            <View style={styles.animatedContent} pointerEvents="none">
              {showIcon && flipcoinIcon ? (
                <FastImage
                  source={iconSource(flipcoinIcon)}
                  style={[styles.icon, {width: iconSize, height: iconSize}]}
                  resizeMode="contain"
                />
              ) : null}
              {children ? (
                <Text
                  numberOfLines={1}
                  style={[styles.text, textStyle]}
                  ellipsizeMode="tail">
                  {children}
                </Text>
              ) : text ? (
                <Text
                  numberOfLines={1}
                  style={[styles.text, textStyle]}
                  ellipsizeMode="tail">
                  {text}
                </Text>
              ) : null}
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Vertical variant: semi-circular shape with vertical gradient on left
  if (isVertical) {
    return (
      <View style={[styles.outerContainer, containerStyle]}>
        <View style={styles.verticalContainer}>
          {/* Vertical Gradient Line on Left */}
          <LinearGradient
            colors={[colors.illuminating_emerald, colors.onco.goldenYellow]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={[
              styles.verticalGradientLine,
              {
                width: verticalBorderWidth,
              },
            ]}
          />
          {/* Background Gradient */}
          <LinearGradient
            colors={[colors.honeydew, colors.onco.YELLOW_05]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={[
              styles.verticalBackground,
              {
                borderTopRightRadius: Matrics.mvs(50),
                borderBottomRightRadius: Matrics.mvs(50),
              },
            ]}>
            <View style={styles.verticalContentContainer}>
              {showIcon && flipcoinIcon ? (
                <FastImage
                  source={iconSource(flipcoinIcon)}
                  style={[styles.icon, {width: iconSize, height: iconSize}]}
                  resizeMode="contain"
                />
              ) : null}
              {children ? (
                <Text
                  numberOfLines={1}
                  style={[styles.text, styles.verticalText, textStyle]}>
                  {children}
                </Text>
              ) : text ? (
                <Text
                  numberOfLines={1}
                  style={[styles.text, styles.verticalText, textStyle]}>
                  {text}
                </Text>
              ) : null}
            </View>
          </LinearGradient>
        </View>
      </View>
    );
  }

  const stretchToContainer = !isCircle;

  return (
    <View style={[styles.outerContainer, containerStyle]}>
      {/* Gradient Border */}
      <LinearGradient
        colors={[colors.illuminating_emerald, colors.onco.goldenYellow]} // Green to yellow gradient for border
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={[
          styles.gradientBorder,
          stretchToContainer && styles.gradientBorderStretch,
          {
            borderRadius,
            padding: borderWidth,
          },
        ]}>
        {/* Gradient Background */}
        <LinearGradient
          colors={[colors.honeydew, colors.onco.YELLOW_05]} // Light green to light yellow background
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={[
            styles.innerContainer,
            stretchToContainer && styles.innerContainerStretch,
            {
              borderRadius: borderRadius - borderWidth,
              padding: isCircle ? Matrics.vs(2) : Matrics.vs(4),
            },
          ]}>
          <View style={styles.contentContainer}>
            {showIcon && flipcoinIcon ? (
              <FastImage
                source={iconSource(flipcoinIcon)}
                style={[styles.icon, {width: iconSize, height: iconSize}]}
                resizeMode="contain"
              />
            ) : null}
            {children ? (
              <Text
                numberOfLines={1}
                style={[styles.text, isCircle && styles.circleText, textStyle]}>
                {children}
              </Text>
            ) : text ? (
              <Text
                numberOfLines={1}
                style={[styles.text, isCircle && styles.circleText, textStyle]}>
                {text}
              </Text>
            ) : null}
          </View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
};

export default FlipcoinBadge;

const styles = StyleSheet.create({
  outerContainer: {
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  gradientBorder: {
    alignSelf: 'flex-start',
    flexShrink: 0,
    // Gradient border effect created by padding
  },
  gradientBorderStretch: {
    width: '100%',
    alignSelf: 'stretch',
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  innerContainerStretch: {
    width: '100%',
    alignSelf: 'stretch',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Matrics.s(4),
    flexShrink: 0,
  },
  // Vertical variant styles
  verticalContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  verticalGradientLine: {
    alignSelf: 'stretch',
  },
  verticalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Matrics.s(10),
    minHeight: Matrics.vs(60),
  },
  verticalContentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // gap: Matrics.s(6),
  },
  icon: {
    // Icon size is controlled by iconSize prop
  },
  text: {
    ...globalStyles.ROBOTO_BODY_BOLD_3,
    fontSize: Matrics.mvs(14),
    color: colors.labelDarkGray,
    fontWeight: '600',
    flexShrink: 0,
    includeFontPadding: false,
  },
  circleText: {
    fontSize: Matrics.mvs(12),
  },
  verticalText: {
    fontSize: Matrics.mvs(12),
  },
  // Animated variant styles
  animatedOuter: {
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  animatedBorderGradient: {
    width: '100%',
  },
  animatedInnerWrap: {
    overflow: 'hidden',
  },
  animatedGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  animatedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Matrics.s(6),
    alignSelf: 'flex-start',
    paddingHorizontal: Matrics.s(16),
    paddingVertical: Matrics.vs(12),
    zIndex: 1,
  },
  animatedOverlayWrapper: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  animatedOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: ANIMATED_BADGE_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

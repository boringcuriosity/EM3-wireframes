// Copy of GoodFlip src/components/organisms/CoinAnimation/GlobalCoinAnimation.tsx.
// Changes: imports adapted; flipCoinIcon comes from the coin image embedded in the Lottie JSON instead of Redux remote config.
import React, {useEffect, useState, useRef} from 'react';
import {View, StyleSheet, DeviceEventEmitter} from 'react-native';
import LottieView from 'lottie-react-native';
import {COIN_CREDITED, Matrics} from './constants';
import FlipcoinBadge from './FlipcoinBadge';

const REPEAT_COUNT = 1;
const flipCoinIcon = require('./flipcoin_icon.png');

const GlobalCoinAnimation: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef<LottieView>(null);
  const playCountRef = useRef(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handleCoinCredited = (_data?: any) => {
      playCountRef.current = 0;
      setIsVisible(true);

      timer = setTimeout(() => {
        if (animationRef.current) {
          animationRef.current.play();
        }
      }, 100);
    };

    const subscription = DeviceEventEmitter.addListener(
      COIN_CREDITED,
      handleCoinCredited,
    );

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  const handleAnimationFinish = () => {
    playCountRef.current += 1;

    if (playCountRef.current < REPEAT_COUNT) {
      animationRef.current?.play();
    } else {
      setIsVisible(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.content}>
        <LottieView
          ref={animationRef}
          source={require('./flipcoin_animation.json')}
          speed={0.6}
          loop={false}
          style={styles.animation}
          onAnimationFinish={handleAnimationFinish}
          onAnimationFailure={error => {
            console.log('[GlobalCoinAnimation] Animation failed:', error);
          }}
        />
        <FlipcoinBadge
          shape="animated"
          text="You have earned FlipCoins"
          showIcon={true}
          containerStyle={styles.badgeContainer}
          flipcoinIcon={flipCoinIcon}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -Matrics.mvs(60),
    left: 0,
    right: 0,
    paddingHorizontal: Matrics.s(16),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  animation: {
    width: '100%',
    height: Matrics.mvs(160),
  },
  badgeContainer: {
    marginTop: -Matrics.vs(15),
  },
});

export default GlobalCoinAnimation;

// utils/animationUtils.ts
import { Animated, Easing } from 'react-native';

export const animationUtils = {
  fadeIn: (
    fadeAnim: Animated.Value,
    duration: number = 1000,
  ): Animated.CompositeAnimation => {
    return Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  },

  scaleSpring: (
    scaleAnim: Animated.Value,
    toValue: number = 1,
  ): Animated.CompositeAnimation => {
    return Animated.spring(scaleAnim, {
      toValue,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    });
  },

  scalePress: (scaleAnim: Animated.Value, isPressed: boolean): void => {
    Animated.spring(scaleAnim, {
      toValue: isPressed ? 0.98 : 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  },

  parallelAnimations: (
    animations: Animated.CompositeAnimation[],
  ): Animated.CompositeAnimation => {
    return Animated.parallel(animations);
  },
};

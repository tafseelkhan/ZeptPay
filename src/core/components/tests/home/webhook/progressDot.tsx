// onboarding/components/ProgressDots.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface ProgressDotsProps {
  total: number;
  current: number;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({
  total,
  current,
}) => {
  const animations = useRef(
    Array(total)
      .fill(0)
      .map(() => ({
        scale: new Animated.Value(1),
        opacity: new Animated.Value(0.3),
      })),
  ).current;

  useEffect(() => {
    // Reset all dots
    animations.forEach((anim, index) => {
      const isActive = index === current - 1;

      Animated.parallel([
        Animated.spring(anim.scale, {
          toValue: isActive ? 1.4 : 1,
          useNativeDriver: true,
          tension: 200,
          friction: 10,
        }),
        Animated.spring(anim.opacity, {
          toValue: isActive ? 1 : 0.3,
          useNativeDriver: true,
          tension: 200,
          friction: 10,
        }),
      ]).start();
    });
  }, [current, animations]);

  return (
    <View style={styles.container}>
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              transform: [{ scale: anim.scale }],
              opacity: anim.opacity,
            },
            current - 1 === index && styles.activeDot,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  },
  activeDot: {
    backgroundColor: '#FF3B30',
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: -2,
  },
});

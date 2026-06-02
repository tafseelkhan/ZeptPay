// onboarding/components/AnimatedStep.tsx
import React from 'react';
import { Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface AnimatedStepProps {
  children: React.ReactNode;
  slideAnim: Animated.Value;
  isActive: boolean;
  index: number;
  currentStep: number;
}

export const AnimatedStep: React.FC<AnimatedStepProps> = ({
  children,
  slideAnim,
  isActive,
}) => {
  // RIGHT SLIDE ONLY
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [width, 0],
  });

  if (!isActive) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // NO position: 'absolute' - YEH HATAYA
  },
});
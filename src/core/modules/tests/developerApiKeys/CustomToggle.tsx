// components/CustomToggle.tsx
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';

interface CustomToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'normal' | 'large';
}

const CustomToggle: React.FC<CustomToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
  size = 'normal',
}) => {
  const [animatedValue] = useState(new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const trackWidth = size === 'large' ? 56 : 44;
  const trackHeight = size === 'large' ? 32 : 24;
  const thumbSize = size === 'large' ? 28 : 20;
  const thumbPosition = size === 'large' ? 2 : 2;
  const activePosition = size === 'large' ? 26 : 22;

  const toggleColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#10B981'],
  });

  const togglePosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [thumbPosition, activePosition],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.toggleTrack,
          {
            width: trackWidth,
            height: trackHeight,
            borderRadius: trackHeight / 2,
            backgroundColor: toggleColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.toggleThumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              left: togglePosition,
              top: (trackHeight - thumbSize) / 2,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggleTrack: {
    position: 'relative',
  },
  toggleThumb: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default CustomToggle;

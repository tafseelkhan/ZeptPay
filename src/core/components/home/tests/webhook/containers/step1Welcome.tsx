// onboarding/screens/Step1Welcome.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import LottieView from 'lottie-react-native';
import type { StepProps } from '../../../../../types/WebhooksType';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useTheme } from '../../../../../contexts/theme/ThemeContext'; // Import theme hook

const { width, height } = Dimensions.get('window');

// Haptic feedback options
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

// Custom Progress Dots Component with theme support
const ProgressDots: React.FC<{ total: number; current: number; isDark: boolean }> = ({
  total,
  current,
  isDark,
}) => {
  return (
    <View style={progressStyles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            progressStyles.dot,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' },
            index === current - 1 && progressStyles.activeDot,
            index === current - 1 && { backgroundColor: isDark ? '#ffffff' : '#ff0000' },
          ]}
        />
      ))}
    </View>
  );
};

const progressStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
});

// Custom Onboarding Button Component with theme support
const OnboardingButton: React.FC<{
  onPress: () => void;
  title: string;
  disabled?: boolean;
  isDark: boolean;
}> = ({ onPress, title, disabled = false, isDark }) => {
  return (
    <TouchableOpacity
      style={[
        buttonStyles.button,
        { backgroundColor: isDark ? '#1E293B' : '#ffffff' }
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[
        buttonStyles.buttonText,
        { color: isDark ? '#ffffff' : '#ff0000' }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Gill Sans',
  },
});

export const Step1Welcome: React.FC<StepProps> = ({
  onNext,
  currentStep,
  totalSteps,
}) => {
  // Get theme from context
  const { isDark, resolvedTheme } = useTheme();

  // Haptic feedback function with different intensity levels
  const triggerHeavyHaptic = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
  };

  const handlePressWithHaptics = () => {
    triggerHeavyHaptic();
    setTimeout(() => {
      onNext();
    }, 100);
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#0F172A' : '#ffffff' }
    ]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Lottie Animation as background */}
      <LottieView
        source={require('../../../../animations/lotties/Teacher girl woman tapping phone.json')}
        autoPlay
        loop
        style={StyleSheet.absoluteFill}
      />

      {/* Content Container */}
      <View style={styles.contentContainer}>
        <Text style={[
          styles.welcomeText,
          { color: isDark ? '#ffffff' : '#ff0000' }
        ]}>
          Welcome to the{'\n'}Webhook Services
        </Text>
      </View>

      {/* Bottom Container */}
      <SafeAreaView style={styles.bottomContainer}>
        <ProgressDots 
          total={totalSteps} 
          current={currentStep} 
          isDark={isDark}
        />
        <OnboardingButton
          onPress={() => {
            triggerHeavyHaptic();
            setTimeout(() => {
              onNext();
            }, 100);
          }}
          title="Continue"
          isDark={isDark}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lottieAnimation: {
    width,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 150,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: 'Gill Sans',
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
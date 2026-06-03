// onboarding/screens/Step2Instructions.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import type { StepProps } from '../../../types/WebhooksType';
import { useTheme } from '../../../contexts/theme/ThemeContext';

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

export const Step2Instructions: React.FC<StepProps> = ({
  onNext,
  currentStep,
  totalSteps,
}) => {
  // Get theme from context
  const { isDark } = useTheme();

  const triggerHeavyHaptic = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
  };

  const handleContinue = () => {
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
      
      {/* Lottie Animation as background - Fixed position */}
      <View style={StyleSheet.absoluteFill}>
        <LottieView
          source={require('../../../../animations/lotties/Girl doing remote job using laptop.json')}
          autoPlay
          loop
          style={styles.lottieBackground}
        />
      </View>

      {/* Scrollable Content - Only text content scrolls, animation stays fixed */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={[
              styles.title,
              { color: isDark ? '#ff8888' : '#ff4444' }
            ]}>
              How Webhooks Work
            </Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={[
              styles.description,
              { color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(57, 57, 57, 0.9)' }
            ]}>
              Webhooks send real-time updates to your server automatically when
              important events happen in your account. Get instant notifications
              for payments, subscriptions, refunds, disputes, and more without
              any delay.!?
            </Text>
          </View>

          {/* Additional Info Card */}
          <View style={[
            styles.infoCard,
            { 
              backgroundColor: isDark ? 'rgba(255,59,48,0.2)' : 'rgba(255,59,48,0.15)',
              borderColor: isDark ? 'rgba(255,59,48,0.5)' : 'rgba(255,59,48,0.3)'
            }
          ]}>
            <View style={styles.infoRow}>
              <Icon name="flash" size={16} color={isDark ? '#ff8888' : '#ff6666'} />
              <Text style={[
                styles.infoText,
                { color: isDark ? '#ffaaaa' : '#ff6666' }
              ]}> 100ms average response time</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="shield-lock"
                size={16}
                color={isDark ? '#ff8888' : '#ff6666'}
              />
              <Text style={[
                styles.infoText,
                { color: isDark ? '#ffaaaa' : '#ff6666' }
              ]}> Encrypted payload delivery</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="autorenew"
                size={16}
                color={isDark ? '#ff8888' : '#ff6666'}
              />
              <Text style={[
                styles.infoText,
                { color: isDark ? '#ffaaaa' : '#ff6666' }
              ]}> Automatic retry on failure</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Container - Fixed position */}
      <SafeAreaView style={styles.bottomContainer}>
        <ProgressDots 
          total={totalSteps} 
          current={currentStep} 
          isDark={isDark}
        />
        <OnboardingButton 
          onPress={handleContinue} 
          title="Next" 
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
  lottieBackground: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: height * 0.15, // Top se space
    paddingBottom: 120, // Bottom container ke liye space
  },
  content: {
    paddingHorizontal: 24,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Gill Sans',
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  descriptionContainer: {
    marginBottom: 30,
  },
  description: {
    fontSize: 14, // Thoda bada kiya readability ke liye
    lineHeight: 24,
    fontWeight: '300',
    backgroundColor: 'transparent',
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: 190, // 350 se kam kiya (ab scroll hoga)
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoText: {
    fontSize: 12, // Thoda bada kiya
    fontWeight: '300',
    marginLeft: 12,
    flex: 1,
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
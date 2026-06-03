// onboarding/screens/Step3Events.tsx
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
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
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

// Custom Onboarding Button Component with theme support and loading state
const OnboardingButton: React.FC<{
  onPress: () => void;
  title: string;
  disabled?: boolean;
  isLoading?: boolean;
  isDark: boolean;
}> = ({ onPress, title, disabled = false, isLoading = false, isDark }) => {
  return (
    <TouchableOpacity
      style={[
        buttonStyles.button,
        { backgroundColor: isDark ? '#1E293B' : '#ffffff' },
        disabled && buttonStyles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={isDark ? '#ffffff' : '#ff0000'} size="small" />
      ) : (
        <Text style={[
          buttonStyles.buttonText,
          { color: isDark ? '#ffffff' : '#ff0000' }
        ]}>
          {title}
        </Text>
      )}
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Gill Sans',
  },
});

interface Step3EventsProps extends StepProps {
  onGetStarted: () => void;
  isLoading?: boolean;
}

export const Step3Events: React.FC<Step3EventsProps> = ({
  onGetStarted,
  currentStep,
  totalSteps,
  isLoading = false,
}) => {
  // Get theme from context
  const { isDark } = useTheme();

  const triggerHeavyHaptic = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
  };

  const handleGetStarted = () => {
    triggerHeavyHaptic();
    setTimeout(() => {
      onGetStarted();
    }, 100);
  };

  const events = [
    'payment.created',
    'payment.succeeded',
    'subscription.updated',
    'refund.processed',
    'dispute.opened',
    'customer.created',
    'invoice.paid',
    'charge.refunded',
  ];

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

      {/* Lottie Animation as background - Fixed */}
      <View style={StyleSheet.absoluteFill}>
        <LottieView
          source={require('../../../../animations/lotties/A Woman experiences modern metaverse technology.json')}
          autoPlay
          loop
          style={styles.lottieBackground}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Badge - Top */}
          <View style={[
            styles.badgeContainer,
            { 
              backgroundColor: isDark ? 'rgba(255,59,48,0.2)' : 'rgba(255,59,48,0.2)',
              borderColor: isDark ? 'rgba(255,59,48,0.5)' : 'rgba(255,59,48,0.3)'
            }
          ]}>
            <Text style={styles.badgeText}>
              <Feather name="plus" size={16} color="#ff6666" />
              {' 114+ Events'}
            </Text>
          </View>

          {/* Title */}
          <Text style={[
            styles.title,
            { color: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.94)' }
          ]}>
            114+ <Text style={styles.highlight}>Webhook</Text>
          </Text>

          <Text style={[
            styles.eventTitle,
            { color: isDark ? 'rgba(255, 255, 255, 0.8)' : '#000000b9' }
          ]}>
            Events Available
          </Text>

          {/* Description */}
          <Text style={[
            styles.description,
            { color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(57, 57, 57, 0.8)' }
          ]}>
            Listen to a wide range of events including payments, subscriptions,
            customer updates, refunds, disputes, and other system events.
          </Text>

          {/* Events Grid - Payment Events */}
          <View style={styles.paymentEventsContainer}>
            <View style={styles.eventsGrid}>
              {events.map((event, index) => (
                <View key={index} style={[
                  styles.eventChip,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' }
                ]}>
                  <View style={[
                    styles.eventDot,
                    { backgroundColor: isDark ? '#ff8888' : '#ff3a3078' }
                  ]} />
                  <Text style={[
                    styles.eventText,
                    { color: isDark ? '#ff8888' : '#ff3a30' }
                  ]}>{event}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Container with Progress Dots and Get Started Button */}
      <SafeAreaView style={styles.bottomContainer}>
        <ProgressDots 
          total={totalSteps} 
          current={currentStep} 
          isDark={isDark}
        />
        <OnboardingButton
          onPress={handleGetStarted}
          title="Get Started"
          isLoading={isLoading}
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
    paddingBottom: 120,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  badgeText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '400',
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '300',
    marginBottom: 16,
  },
  highlight: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  description: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '300',
    marginBottom: 30,
  },
  paymentEventsContainer: {
    marginTop: 230, // Changed from 300 to make it scrollable
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  eventText: {
    fontSize: 10,
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
  },
});
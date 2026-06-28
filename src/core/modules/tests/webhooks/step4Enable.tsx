// onboarding/screens/Step4Enable.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useTheme } from '../../../contexts/theme/ThemeContext';

const { width, height } = Dimensions.get('window');

// Define navigation types
type RootStackParamList = {
  Developers: undefined;
};

// Haptic feedback options
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

// Custom Onboarding Button Component with theme support
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

interface Step4EnableProps {
  onEnable: () => void;
}

export const Step4Enable: React.FC<Step4EnableProps> = ({ onEnable }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isDark } = useTheme(); // Get theme from context
  
  const triggerWarningHaptic = () => {
    ReactNativeHapticFeedback.trigger('notificationWarning', hapticOptions);
  };

  const handleEnable = () => {
    triggerWarningHaptic();
    setTimeout(() => {
      onEnable();
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

      {/* Lottie Animation as background - Fixed */}
      <View style={StyleSheet.absoluteFill}>
        <LottieView
          source={require('../../../../core/components/animations/lotties/Female creative artist with ideas.json')}
          autoPlay
          loop
          style={styles.lottieBackground}
        />
      </View>

      {/* Warning Icon */}
      <View style={styles.iconContainer}>
        <View style={[
          styles.warningIcon,
          { 
            backgroundColor: '#FF3B30',
            borderColor: isDark ? '#1E293B' : '#ffffff',
            shadowColor: '#FF3B30',
          }
        ]}>
          <Text style={styles.warningIconText}>!</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[
          styles.title,
          { 
            color: isDark ? '#ff8888' : '#ff6060ce',
            textShadowColor: isDark ? 'rgba(255, 136, 136, 0.3)' : 'rgba(255, 22, 22, 0.3)',
          }
        ]}>
          Webhook Not Enabled
        </Text>
        <Text style={[
          styles.message,
          { 
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.61)',
            textShadowColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)',
          }
        ]}>
          It looks like webhook is not enabled yet.{'\n'}
          Please enable webhook to start receiving events.
        </Text>

        {/* Help Card */}
        <View style={[
          styles.helpCard,
          { 
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255,255,255,0.1)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255,255,255,0.1)',
          }
        ]}>
          <Text style={[
            styles.helpTitle,
            { color: isDark ? '#ffaa88' : 'rgba(255, 140, 46, 0.86)' }
          ]}>
            Why enable webhooks?
          </Text>
          <View style={styles.helpItem}>
            <Text style={[
              styles.helpBullet,
              { color: isDark ? '#ffaaaa' : '#ff948f' }
            ]}>•</Text>
            <Text style={[
              styles.helpText,
              { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(112, 112, 112, 0.77)' }
            ]}>
              Real-time payment updates
            </Text>
          </View>
          <View style={styles.helpItem}>
            <Text style={[
              styles.helpBullet,
              { color: isDark ? '#ffaaaa' : '#ff948f' }
            ]}>•</Text>
            <Text style={[
              styles.helpText,
              { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(112, 112, 112, 0.77)' }
            ]}>
              Instant subscription notifications
            </Text>
          </View>
          <View style={styles.helpItem}>
            <Text style={[
              styles.helpBullet,
              { color: isDark ? '#ffaaaa' : '#ff948f' }
            ]}>•</Text>
            <Text style={[
              styles.helpText,
              { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(112, 112, 112, 0.77)' }
            ]}>
              Automatic refund alerts
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Button */}
      <SafeAreaView style={styles.bottomContainer}>
        <OnboardingButton 
          onPress={handleEnable} 
          title="Enable Webhook →" 
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
  iconContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  warningIcon: {
    width: 50,
    height: 50,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    marginTop: -20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  warningIconText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    marginTop: -50,
  },
  title: {
    fontSize: 18,
    fontWeight: '200',
    marginBottom: 12,
    marginTop: 80,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  message: {
    fontSize: 12,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  helpCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 20, // Changed from 300 to make it visible
    borderWidth: 1,
  },
  helpTitle: {
    fontSize: 15,
    marginLeft: 50,
    fontWeight: '300',
    marginBottom: 12,
  },
  helpItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  helpBullet: {
    width: 20,
    fontSize: 16,
  },
  helpText: {
    flex: 1,
    fontSize: 12,
    marginLeft: 50,
    lineHeight: 20,
  },
  bottomContainer: {
    alignItems: 'center',
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
});
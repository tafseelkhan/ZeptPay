// screens/auth/AuthScreen.tsx (Updated version)
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import type {
  Country,
  CountryCode,
  TranslationLanguageCodeMap,
} from 'react-native-country-picker-modal';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/theme/ThemeContext';

// Import separated code
import {
  formatPhoneForAPI,
  formatPhoneForDisplay,
  validatePhoneNumber,
  validateOTP,
} from '../../utils/auth/signupPhoneUtils';
import {
  handleSignup,
  handleVerifyOTP,
  handleResendOTP,
  handleApiError,
} from '../../services/auth/signupAuthService';

// Types
type AuthMode = 'signup' | 'verify';
type SignupStep = 'basic' | 'details';

interface FormErrors {
  name?: string;
  phone?: string;
  country?: string;
  otp?: string;
}

interface SignupData {
  name: string;
  phone: string;
  country: string;
  isDeveloper: boolean;
}

interface VerifyOTPData {
  otp: string[];
}

interface SimpleCountry {
  callingCode: string[];
  cca2: CountryCode;
  currency: string[];
  flag: string;
  name: string;
  region: string;
  subregion: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  DeveloperHome: undefined;
  UserHome: undefined;
  Terms: undefined;
  Privacy: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const APP_NAME = 'ZeptPay';

// App Logo Component with theme
const AppLogo: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <View style={styles.logoContainer}>
    <Image
      source={require('../../../assets/images/zeptPay.png')}
      style={styles.logoImage}
      resizeMode="contain"
    />
    <Text style={[styles.appName, isDark && styles.textDark]}>{APP_NAME}</Text>
    <Text style={[styles.appTagline, isDark && styles.textMutedDark]}>
      Fast & Secure Payments
    </Text>
  </View>
);

// Login Link Component with theme
const LoginLink: React.FC<{ onPress: () => void; isDark: boolean }> = ({
  onPress,
  isDark,
}) => (
  <View style={[styles.loginContainer, isDark && styles.borderDark]}>
    <Text style={[styles.loginText, isDark && styles.textMutedDark]}>
      Already have an account?{' '}
    </Text>
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.loginLink}>Login</Text>
    </TouchableOpacity>
  </View>
);

// Custom Toggle Switch Component with theme
const CustomToggle: React.FC<{
  value: boolean;
  onValueChange: (value: boolean) => void;
  isDark: boolean;
}> = ({ value, onValueChange, isDark }) => {
  const [animatedValue] = useState(new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      tension: 80,
      friction: 12,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const toggleColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? '#4B5563' : '#E5E7EB', '#3B82F6'],
  });

  const togglePosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 26],
  });

  return (
    <TouchableOpacity onPress={() => onValueChange(!value)} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.customToggleTrack,
          {
            backgroundColor: toggleColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.customToggleThumb,
            {
              transform: [{ translateX: togglePosition }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// OTP Input Component with theme
const OtpInput: React.FC<{
  value: string[];
  onChange: (otp: string[]) => void;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
  isDark: boolean;
}> = ({ value, onChange, onComplete, disabled = false, isDark }) => {
  const inputsRef = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    if (disabled) return;

    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...value];

    if (digit) {
      newOtp[index] = digit;
      onChange(newOtp);

      if (index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    } else {
      newOtp[index] = '';
      onChange(newOtp);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (value[index] === '' && index > 0) {
        const newOtp = [...value];
        newOtp[index - 1] = '';
        onChange(newOtp);
        inputsRef.current[index - 1]?.focus();
      } else if (value[index] !== '') {
        const newOtp = [...value];
        newOtp[index] = '';
        onChange(newOtp);
      }
    }
  };

  const setInputRef = (index: number) => (ref: TextInput | null) => {
    inputsRef.current[index] = ref;
  };

  useEffect(() => {
    if (!disabled && value.every(digit => digit !== '')) {
      onComplete?.(value.join(''));
    }
  }, [value, disabled]);

  return (
    <View style={styles.otpContainer}>
      {value.map((digit, index) => (
        <TextInput
          key={index}
          ref={setInputRef(index)}
          style={[
            styles.otpInput,
            isDark && styles.otpInputDark,
            digit && styles.otpInputFilled,
            digit && isDark && styles.otpInputFilledDark,
          ]}
          value={digit}
          onChangeText={text => handleChange(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          editable={!disabled}
          selectTextOnFocus
          autoFocus={index === 0}
          textAlign="center"
          placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
        />
      ))}
    </View>
  );
};

const AuthScreen: React.FC = () => {
  const { isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [signupStep, setSignupStep] = useState<SignupStep>('basic');
  const [signupData, setSignupData] = useState<SignupData>({
    name: '',
    phone: '',
    country: 'India',
    isDeveloper: false,
  });
  const [verifyData, setVerifyData] = useState<VerifyOTPData>({
    otp: ['', '', '', '', '', ''],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [contactInfo, setContactInfo] = useState<string>('');
  const [fullPhoneNumber, setFullPhoneNumber] = useState<string>('');

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [country, setCountry] = useState<SimpleCountry>({
    callingCode: ['91'],
    cca2: 'IN',
    currency: ['INR'],
    flag: 'flag-in',
    name: 'India',
    region: 'Asia',
    subregion: 'Southern Asia',
  });

  const phoneInputRef = useRef<TextInput>(null);
  const nameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (authMode === 'verify' && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [authMode, timer]);

  // Update phone number display (with space for UI, without space for API)
  useEffect(() => {
    if (signupData.phone) {
      const displayPhone = formatPhoneForDisplay(
        country.callingCode[0],
        signupData.phone,
      );
      const apiPhone = formatPhoneForAPI(
        country.callingCode[0],
        signupData.phone,
      );
      setContactInfo(displayPhone);
      setFullPhoneNumber(apiPhone);
    } else {
      setContactInfo('');
      setFullPhoneNumber('');
    }
  }, [signupData.phone, country]);

  const validateBasicForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!signupData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!signupData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhoneNumber(signupData.phone)) {
      newErrors.phone = 'Enter valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectCountry = (selectedCountry: Country) => {
    const simpleCountry: SimpleCountry = {
      callingCode: selectedCountry.callingCode,
      cca2: selectedCountry.cca2 as CountryCode,
      currency: selectedCountry.currency || [],
      flag: 'flag-' + selectedCountry.cca2.toLowerCase(),
      name:
        typeof selectedCountry.name === 'string'
          ? selectedCountry.name
          : (selectedCountry.name as TranslationLanguageCodeMap)?.common ||
            selectedCountry.cca2,
      region: selectedCountry.region,
      subregion: selectedCountry.subregion,
    };

    setCountry(simpleCountry);
    setSignupData(prev => ({
      ...prev,
      country: simpleCountry.name,
    }));
    setShowCountryPicker(false);
  };

  const handleNextStep = () => {
    if (validateBasicForm()) {
      setSignupStep('details');
    }
  };

  const handleBackToBasic = () => {
    setSignupStep('basic');
  };

  // ✅ SIGNUP - Send phone WITHOUT space
  const handleSignupSubmit = async (): Promise<void> => {
    if (!signupData.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    // Format WITHOUT space: +919983141558
    const phoneWithoutSpace = formatPhoneForAPI(
      country.callingCode[0],
      signupData.phone,
    );

    setLoading(true);
    try {
      const payload = {
        name: signupData.name.trim(),
        phone: phoneWithoutSpace,
        country: signupData.country.trim(),
        isDeveloper: signupData.isDeveloper,
      };

      console.log('📞 Sending signup payload:', payload);
      const result = await handleSignup(payload);

      if (result.success) {
        console.log('✅ Signup response:', result.data);
        setFullPhoneNumber(phoneWithoutSpace);
        setAuthMode('verify');
        setTimer(60);
        setErrors(prev => ({ ...prev, otp: undefined }));
        setVerifyData({ otp: ['', '', '', '', '', ''] });

        if (result.data?.otp) {
          console.log('🔢 Development OTP:', result.data.otp);
        }
      } else {
        Alert.alert('Error', result.error || 'Signup failed');
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Signup failed');
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ VERIFY OTP - Send phone WITHOUT space
  const handleVerifyOTPSubmit = async (): Promise<void> => {
    const otpString = verifyData.otp.join('');

    if (!validateOTP(verifyData.otp)) {
      setErrors({ otp: 'Please enter 6-digit OTP' });
      return;
    }

    setLoading(true);
    try {
      const result = await handleVerifyOTP(fullPhoneNumber, otpString);

      if (result.success) {
        console.log('✅ Verify response:', result.data);

        if (result.data?.user.isDeveloper) {
          navigation.navigate('DeveloperHome');
        } else {
          navigation.navigate('UserHome');
        }

        resetForms();
      } else {
        Alert.alert('Error', result.error || 'OTP verification failed');
        setVerifyData({ otp: ['', '', '', '', '', ''] });
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'OTP verification failed');
      Alert.alert('Error', errorMessage);
      setVerifyData({ otp: ['', '', '', '', '', ''] });
    } finally {
      setLoading(false);
    }
  };

  // ✅ RESEND OTP - Send phone WITHOUT space
  const handleResendOTPSubmit = async (): Promise<void> => {
    if (timer > 0) return;

    setResendLoading(true);
    try {
      const result = await handleResendOTP(fullPhoneNumber);

      if (result.success) {
        console.log('✅ Resend response:', result.data);
        setTimer(60);
        setVerifyData({ otp: ['', '', '', '', '', ''] });
        setErrors(prev => ({ ...prev, otp: undefined }));

        if (result.data?.otp) {
          console.log('🔢 New development OTP:', result.data.otp);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to resend OTP');
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to resend OTP');
      Alert.alert('Error', errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const resetForms = (): void => {
    setSignupData({
      name: '',
      phone: '',
      country: 'India',
      isDeveloper: false,
    });
    setVerifyData({
      otp: ['', '', '', '', '', ''],
    });
    setErrors({});
    setCountry({
      callingCode: ['91'],
      cca2: 'IN',
      currency: ['INR'],
      flag: 'flag-in',
      name: 'India',
      region: 'Asia',
      subregion: 'Southern Asia',
    });
    setContactInfo('');
    setFullPhoneNumber('');
    setAuthMode('signup');
    setSignupStep('basic');
  };

  const handleSignupChange = (
    field: keyof SignupData,
    value: string | boolean,
  ): void => {
    setSignupData(prev => ({ ...prev, [field]: value }));

    if (field === 'name' && errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    } else if (field === 'phone' && errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    } else if (field === 'country' && errors.country) {
      setErrors(prev => ({ ...prev, country: undefined }));
    }
  };

  const handlePhoneChange = (value: string): void => {
    const numericValue = value.replace(/[^0-9]/g, '');
    handleSignupChange('phone', numericValue);
  };

  const handleOtpChange = (otp: string[]) => {
    setVerifyData({ otp });
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: undefined }));
    }
  };

  const handleOtpComplete = (otp: string) => {
    handleVerifyOTPSubmit();
  };

  const DeveloperToggle = () => (
    <>
      <View style={styles.toggleContainer}>
        <View style={styles.toggleLabelContainer}>
          <Icon
            name="code-slash"
            size={20}
            color={isDark ? '#60A5FA' : '#1E40AF'}
          />
          <Text style={[styles.toggleLabel, isDark && styles.textDark]}>
            I am a Developer
          </Text>
        </View>
        <CustomToggle
          value={signupData.isDeveloper}
          onValueChange={value => handleSignupChange('isDeveloper', value)}
          isDark={isDark}
        />
      </View>

      {signupData.isDeveloper ? (
        <View
          style={[styles.developerInfo, isDark && styles.developerInfoDark]}
        >
          <Icon
            name="information-circle-outline"
            size={16}
            color={isDark ? '#60A5FA' : '#2563EB'}
          />
          <Text
            style={[styles.developerInfoText, isDark && styles.textMutedDark]}
          >
            Developers/Businesses integrating ZeptPay APIs
          </Text>
        </View>
      ) : (
        <View
          style={[styles.developerInfo, isDark && styles.developerInfoDark]}
        >
          <Icon
            name="person-outline"
            size={16}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
          <Text
            style={[styles.developerInfoText, isDark && styles.textMutedDark]}
          >
            Normal users (no API access needed)
          </Text>
        </View>
      )}
    </>
  );

  const renderBasicForm = (): React.ReactNode => (
    <>
      <AppLogo isDark={isDark} />
      <Text style={[styles.title, isDark && styles.textDark]}>
        Create Account
      </Text>
      <Text style={[styles.subtitle, isDark && styles.textMutedDark]}>
        Enter your details to get started
      </Text>

      <View style={styles.inputGroup}>
        <View style={styles.labelContainer}>
          <Icon
            name="person-outline"
            size={16}
            color={isDark ? '#60A5FA' : '#1E40AF'}
          />
          <Text style={[styles.label, isDark && styles.textDark]}>
            Full Name *
          </Text>
        </View>
        <TextInput
          ref={nameInputRef}
          style={[
            styles.input,
            isDark && styles.inputDark,
            errors.name && styles.inputError,
          ]}
          placeholder="Enter your full name"
          placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
          value={signupData.name}
          onChangeText={text => handleSignupChange('name', text)}
          editable={!loading}
          returnKeyType="next"
          autoCapitalize="words"
          onSubmitEditing={() => phoneInputRef.current?.focus()}
        />
        {errors.name ? (
          <Text style={styles.errorText}>{errors.name}</Text>
        ) : null}
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelContainer}>
          <Icon
            name="call-outline"
            size={16}
            color={isDark ? '#60A5FA' : '#1E40AF'}
          />
          <Text style={[styles.label, isDark && styles.textDark]}>
            Phone Number *
          </Text>
        </View>
        <View style={styles.phoneInputContainer}>
          <TouchableOpacity
            style={[
              styles.countryCodeButton,
              isDark && styles.countryCodeButtonDark,
            ]}
            onPress={() => setShowCountryPicker(true)}
          >
            <Text style={[styles.countryCodeText, isDark && styles.textDark]}>
              +{country.callingCode[0]}
            </Text>
            <Icon
              name="chevron-down"
              size={14}
              color={isDark ? '#60A5FA' : '#1E40AF'}
            />
          </TouchableOpacity>
          <TextInput
            ref={phoneInputRef}
            style={[
              styles.phoneInput,
              isDark && styles.inputDark,
              errors.phone && styles.inputError,
            ]}
            placeholder="1234567890"
            placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
            value={signupData.phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            maxLength={15}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={handleNextStep}
          />
        </View>
        {signupData.phone ? (
          <Text style={[styles.phonePreview, isDark && styles.textMutedDark]}>
            Phone: +{country.callingCode[0]} {signupData.phone}
          </Text>
        ) : null}
        {errors.phone ? (
          <Text style={styles.errorText}>{errors.phone}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleNextStep}
        disabled={loading}
      >
        <View style={styles.buttonGradient}>
          <Icon
            name="arrow-forward"
            size={20}
            color="#FFF"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Next</Text>
        </View>
      </TouchableOpacity>

      <LoginLink onPress={navigateToLogin} isDark={isDark} />
    </>
  );

  const renderDetailsForm = (): React.ReactNode => (
    <>
      <AppLogo isDark={isDark} />
      <Text style={[styles.title, isDark && styles.textDark]}>
        Complete Profile
      </Text>
      <Text style={[styles.subtitle, isDark && styles.textMutedDark]}>
        Tell us more about yourself
      </Text>

      <View style={styles.inputGroup}>
        <View style={styles.labelContainer}>
          <Icon
            name="globe-outline"
            size={16}
            color={isDark ? '#60A5FA' : '#1E40AF'}
          />
          <Text style={[styles.label, isDark && styles.textDark]}>
            Country *
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.countryInput,
            isDark && styles.countryInputDark,
            errors.country && styles.inputError,
          ]}
          onPress={() => setShowCountryPicker(true)}
        >
          <View style={styles.countryInputContent}>
            <Text
              style={[styles.selectedCountryName, isDark && styles.textDark]}
            >
              {country.name}
            </Text>
          </View>
          <Icon
            name="chevron-down"
            size={16}
            color={isDark ? '#60A5FA' : '#1E40AF'}
          />
        </TouchableOpacity>
        {errors.country ? (
          <Text style={styles.errorText}>{errors.country}</Text>
        ) : null}
      </View>

      <DeveloperToggle />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignupSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.buttonGradient}>
            <Icon
              name="checkmark-circle"
              size={20}
              color="#FFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Create Account</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackToBasic}
        disabled={loading}
      >
        <Icon
          name="arrow-back"
          size={16}
          color={isDark ? '#60A5FA' : '#3B82F6'}
        />
        <Text style={[styles.backButtonText, isDark && { color: '#60A5FA' }]}>
          Back
        </Text>
      </TouchableOpacity>

      <Text style={[styles.note, isDark && styles.textMutedDark]}>
        <Icon
          name="shield-checkmark-outline"
          size={14}
          color={isDark ? '#9CA3AF' : '#64748B'}
        />{' '}
        You'll receive an OTP on your phone for verification
      </Text>

      <LoginLink onPress={navigateToLogin} isDark={isDark} />
    </>
  );

  const renderVerifyForm = (): React.ReactNode => (
    <>
      <AppLogo isDark={isDark} />
      <Text style={[styles.title, isDark && styles.textDark]}>Verify OTP</Text>
      <Text style={[styles.subtitle, isDark && styles.textMutedDark]}>
        Code sent to {contactInfo || 'your phone number'}
      </Text>

      <OtpInput
        value={verifyData.otp}
        onChange={handleOtpChange}
        onComplete={handleOtpComplete}
        disabled={loading}
        isDark={isDark}
      />
      {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerifyOTPSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.buttonGradient}>
            <Icon
              name="checkmark-circle"
              size={20}
              color="#FFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Verify OTP</Text>
          </View>
        )}
      </TouchableOpacity>

      <View
        style={[styles.resendContainer, isDark && styles.resendContainerDark]}
      >
        <Text style={[styles.resendText, isDark && styles.textMutedDark]}>
          <Icon
            name="time-outline"
            size={14}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
          Didn't receive code?
        </Text>
        <TouchableOpacity
          onPress={handleResendOTPSubmit}
          disabled={timer > 0 || resendLoading}
        >
          {resendLoading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Text
              style={[styles.resendButton, timer > 0 && styles.resendDisabled]}
            >
              {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => resetForms()}
        disabled={loading}
      >
        <Icon
          name="arrow-back"
          size={16}
          color={isDark ? '#60A5FA' : '#3B82F6'}
        />
        <Text style={[styles.backButtonText, isDark && { color: '#60A5FA' }]}>
          Back to Signup
        </Text>
      </TouchableOpacity>

      <LoginLink onPress={navigateToLogin} isDark={isDark} />
    </>
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.containerDark]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0F172A' : '#FFFFFF'}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, isDark && styles.containerDark]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentContainer}>
            {authMode === 'signup'
              ? signupStep === 'basic'
                ? renderBasicForm()
                : renderDetailsForm()
              : renderVerifyForm()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CountryPicker
        visible={showCountryPicker}
        countryCode={country.cca2}
        withFilter
        withFlag
        withCallingCode
        withCallingCodeButton
        withAlphaFilter
        withCloseButton
        onSelect={handleSelectCountry}
        onClose={() => setShowCountryPicker(false)}
        theme={{
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          fontSize: 16,
          onBackgroundTextColor: isDark ? '#FFFFFF' : '#000000',
          primaryColor: '#3B82F6',
          filterPlaceholderTextColor: isDark ? '#9CA3AF' : '#9CA3AF',
          activeOpacity: 0.7,
        }}
        containerButtonStyle={{ display: 'none' }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  containerDark: { backgroundColor: '#0F172A' },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logoImage: { width: 80, height: 80, marginBottom: 15 },
  appName: {
    fontSize: 15,
    fontWeight: '400',
    color: '#2563EB',
    marginBottom: 5,
  },
  appTagline: { fontSize: 10, color: '#6B7280', fontWeight: '200' },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 20,
  },
  textDark: { color: '#FFFFFF' },
  textMutedDark: { color: '#9CA3AF' },
  borderDark: { borderTopColor: '#374151' },
  inputGroup: { marginBottom: 20 },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginLeft: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  inputDark: {
    borderColor: '#374151',
    backgroundColor: '#1F2937',
    color: '#FFFFFF',
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 5, marginLeft: 5 },
  phoneInputContainer: { flexDirection: 'row', alignItems: 'center' },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  countryCodeButtonDark: { borderColor: '#374151', backgroundColor: '#1F2937' },
  countryCodeText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginRight: 6,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  phonePreview: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  countryInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countryInputDark: { borderColor: '#374151', backgroundColor: '#1F2937' },
  countryInputContent: { flexDirection: 'row', alignItems: 'center' },
  selectedCountryName: { fontSize: 16, color: '#111827', fontWeight: '500' },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  toggleLabelContainer: { flexDirection: 'row', alignItems: 'center' },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  customToggleTrack: { width: 52, height: 28, borderRadius: 14, padding: 2 },
  customToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  developerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  developerInfoDark: { backgroundColor: '#1E293B' },
  developerInfoText: { fontSize: 12, color: '#374151', marginLeft: 8, flex: 1 },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  otpInput: {
    width: 52,
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '600',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    textAlign: 'center',
  },
  otpInputDark: {
    borderColor: '#374151',
    backgroundColor: '#1F2937',
    color: '#FFFFFF',
  },
  otpInputFilled: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    backgroundColor: '#EFF6FF',
  },
  otpInputFilledDark: { backgroundColor: '#1E3A5F', borderColor: '#60A5FA' },
  button: { borderRadius: 12, marginTop: 10, overflow: 'hidden' },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
  },
  buttonIcon: { marginRight: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  note: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  loginText: { fontSize: 14, color: '#6B7280' },
  loginLink: { fontSize: 14, color: '#3B82F6', fontWeight: '600' },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  resendContainerDark: { backgroundColor: '#1F2937' },
  resendText: { fontSize: 14, color: '#6B7280', marginRight: 8 },
  resendButton: { fontSize: 14, color: '#3B82F6', fontWeight: '600' },
  resendDisabled: { color: '#9CA3AF' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 12,
  },
  backButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default AuthScreen;

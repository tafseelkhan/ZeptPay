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
} from 'react-native';
import axios, { AxiosError } from 'axios';
import CountryPicker from 'react-native-country-picker-modal';
import type {
  Country,
  CountryCode,
  TranslationLanguageCodeMap,
} from 'react-native-country-picker-modal';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/theme/ThemeContext';

// Types
type AuthMode = 'login' | 'verify';

interface FormErrors {
  phone?: string;
  otp?: string;
}

interface LoginData {
  phone: string;
}

interface VerifyOTPData {
  otp: string[];
}

interface LoginResponse {
  message: string;
}

interface VerifyOTPResponse {
  message: string;
  token: string;
  user: {
    _id: string;
    name: string;
    phone: string;
    country: string;
    isDeveloper: boolean;
    balance: number;
  };
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

const API_BASE_URL = 'http://172.20.10.12:7000/api';
const APP_NAME = 'ZeptPay';

// ✅ Phone Formatter - NO SPACE (matches backend storage)
const formatPhoneForAPI = (
  callingCode: string,
  phoneNumber: string,
): string => {
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  const code = callingCode.replace('+', '');
  // Send WITHOUT space: +919983141558
  return `+${code}${cleanedNumber}`;
};

// ✅ Format phone for display (WITH space)
const formatPhoneForDisplay = (
  callingCode: string,
  phoneNumber: string,
): string => {
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  const code = callingCode.replace('+', '');
  return `+${code} ${cleanedNumber}`;
};

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

// Signup Link Component with theme
const SignupLink: React.FC<{ onPress: () => void; isDark: boolean }> = ({
  onPress,
  isDark,
}) => (
  <View style={[styles.signupContainer, isDark && styles.borderDark]}>
    <Text style={[styles.signupText, isDark && styles.textMutedDark]}>
      Don't have an account?{' '}
    </Text>
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.signupLink}>Sign Up</Text>
    </TouchableOpacity>
  </View>
);

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

const saveAuthData = async (token: string, userData: any): Promise<void> => {
  try {
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    await AsyncStorage.setItem('userId', userData._id);
    console.log('✅ Auth data saved successfully');
  } catch (error) {
    console.error('❌ Error saving auth data:', error);
    throw error;
  }
};

const LoginScreen: React.FC = () => {
  const { isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loginData, setLoginData] = useState<LoginData>({ phone: '' });
  const [verifyData, setVerifyData] = useState<VerifyOTPData>({
    otp: ['', '', '', '', '', ''],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [phoneForResend, setPhoneForResend] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<string>('');

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

  useEffect(() => {
    if (authMode === 'verify' && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [authMode, timer]);

  // Update display with space, but store without space for API
  useEffect(() => {
    if (loginData.phone) {
      const displayPhone = formatPhoneForDisplay(
        country.callingCode[0],
        loginData.phone,
      );
      const apiPhone = formatPhoneForAPI(
        country.callingCode[0],
        loginData.phone,
      );
      setContactInfo(displayPhone);
      setPhoneForResend(apiPhone);
    } else {
      setContactInfo('');
      setPhoneForResend('');
    }
  }, [loginData.phone, country]);

  const validatePhoneForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!loginData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,}$/.test(loginData.phone.replace(/\D/g, ''))) {
      newErrors.phone = `Enter valid ${
        country.callingCode[0] === '91' ? '10' : 'valid'
      } digit phone number`;
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
    setShowCountryPicker(false);
  };

  // ✅ LOGIN - Send phone WITHOUT space
  const handleLogin = async (): Promise<void> => {
    if (!validatePhoneForm()) return;

    setLoading(true);
    try {
      // Format WITHOUT space: +919983141558
      const formattedPhone = formatPhoneForAPI(
        country.callingCode[0],
        loginData.phone.trim(),
      );

      setPhoneForResend(formattedPhone);

      const payload = { phone: formattedPhone };
      console.log('📞 Sending login payload:', payload);

      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        payload,
      );

      setAuthMode('verify');
      setTimer(60);
      setErrors(prev => ({ ...prev, otp: undefined }));
      Alert.alert('Success', 'OTP sent successfully to your phone');
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error(
        'Login error:',
        axiosError.response?.data || axiosError.message,
      );

      if (axiosError.response?.data?.message?.includes('not found')) {
        Alert.alert('User Not Found', 'Please sign up first', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Up', onPress: () => navigation.navigate('SignUp') },
        ]);
      } else {
        handleApiError(axiosError, 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ VERIFY OTP - Send phone WITHOUT space
  const handleVerifyOTP = async (): Promise<void> => {
    const otpString = verifyData.otp.join('');
    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter 6-digit OTP' });
      return;
    }

    setLoading(true);
    try {
      const payload = { phone: phoneForResend, otp: otpString };
      console.log('🔐 Verifying OTP for phone:', phoneForResend);

      const response = await axios.post<VerifyOTPResponse>(
        `${API_BASE_URL}/auth/verify-otp-login`,
        payload,
      );

      await saveAuthData(response.data.token, response.data.user);

      if (response.data.user.isDeveloper) {
        navigation.navigate('DeveloperHome');
      } else {
        navigation.navigate('UserHome');
      }

      resetForms();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      handleApiError(axiosError, 'OTP verification failed');
      setVerifyData({ otp: ['', '', '', '', '', ''] });
    } finally {
      setLoading(false);
    }
  };

  // ✅ RESEND OTP - Send phone WITHOUT space
  const handleResendOTP = async (): Promise<void> => {
    if (timer > 0) return;

    setResendLoading(true);
    try {
      const payload = { phone: phoneForResend };
      console.log('📞 Resending OTP for phone:', phoneForResend);

      await axios.post(`${API_BASE_URL}/auth/resend-otp-login`, payload);

      setTimer(60);
      setVerifyData({ otp: ['', '', '', '', '', ''] });
      setErrors(prev => ({ ...prev, otp: undefined }));
      Alert.alert('Success', 'OTP resent successfully');
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error(
        'Resend OTP error:',
        axiosError.response?.data || axiosError.message,
      );

      let errorMessage = 'Failed to resend OTP';
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate('SignUp');
  };

  const handleApiError = (
    error: AxiosError<{ message: string }>,
    defaultMessage: string,
  ): void => {
    console.error('API Error:', error.response?.data || error.message);

    let errorMessage = defaultMessage;

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message.includes('Network Error')) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Request timeout. Please try again.';
    }

    Alert.alert('Error', errorMessage);
  };

  const resetForms = (): void => {
    setLoginData({ phone: '' });
    setVerifyData({ otp: ['', '', '', '', '', ''] });
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
    setAuthMode('login');
    setPhoneForResend('');
  };

  const handlePhoneChange = (value: string): void => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setLoginData(prev => ({ ...prev, phone: numericValue }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
  };

  const handleOtpChange = (otp: string[]) => {
    setVerifyData({ otp });
    if (errors.otp) setErrors(prev => ({ ...prev, otp: undefined }));
  };

  const handleOtpComplete = (otp: string) => {
    handleVerifyOTP();
  };

  const renderPhoneForm = (): React.ReactNode => (
    <>
      <AppLogo isDark={isDark} />
      <Text style={[styles.title, isDark && styles.textDark]}>
        Welcome Back
      </Text>
      <Text style={[styles.subtitle, isDark && styles.textMutedDark]}>
        Enter your phone number to continue
      </Text>

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
            value={loginData.phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            maxLength={15}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
        </View>
        {loginData.phone ? (
          <Text style={[styles.phonePreview, isDark && styles.textMutedDark]}>
            Phone: +{country.callingCode[0]} {loginData.phone}
          </Text>
        ) : null}
        {errors.phone ? (
          <Text style={styles.errorText}>{errors.phone}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.buttonGradient}>
            <Icon
              name="log-in-outline"
              size={20}
              color="#FFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Login</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={[styles.note, isDark && styles.textMutedDark]}>
        <Icon
          name="shield-checkmark-outline"
          size={14}
          color={isDark ? '#9CA3AF' : '#64748B'}
        />{' '}
        You'll receive an OTP on your phone for verification
      </Text>

      <SignupLink onPress={navigateToSignup} isDark={isDark} />
    </>
  );

  const renderVerifyForm = (): React.ReactNode => (
    <>
      <AppLogo isDark={isDark} />
      <Text style={[styles.title, isDark && styles.textDark]}>Verify OTP</Text>
      <Text style={[styles.subtitle, isDark && styles.textMutedDark]}>
        Code sent to {contactInfo}
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
        onPress={handleVerifyOTP}
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
          onPress={handleResendOTP}
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
          Back to Login
        </Text>
      </TouchableOpacity>

      <SignupLink onPress={navigateToSignup} isDark={isDark} />
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
            {authMode === 'login' ? renderPhoneForm() : renderVerifyForm()}
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  signupText: { fontSize: 14, color: '#6B7280' },
  signupLink: { fontSize: 14, color: '#3B82F6', fontWeight: '600' },
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

export default LoginScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
  FlatList,
  Switch,
  PermissionsAndroid,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CountryPicker, {
  CountryCode,
  Country,
  DEFAULT_THEME,
} from 'react-native-country-picker-modal';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  launchImageLibrary,
  launchCamera,
  ImageLibraryOptions,
  CameraOptions,
} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import { Config } from 'react-native-config';

const API_BASE_URL = Config.API_AXIOS_BASE_URL;
const GOOGLE_API_KEY = Config.GOOGLE_SERVICES_ACCOUNT_KEY;

const { height, width } = Dimensions.get('window');

const BUSINESS_TYPES = [
  { label: 'Select business type', value: '' },
  { label: 'Individual', value: 'Individual' },
  { label: 'Company', value: 'Company' },
  { label: 'LLP', value: 'LLP' },
  { label: 'Private Ltd', value: 'Private Ltd' },
  { label: 'Public Ltd', value: 'Public Ltd' },
  { label: 'Partnership', value: 'Partnership' },
  { label: 'Sole Proprietorship', value: 'Sole Proprietorship' },
];

const BUSINESS_CATEGORIES = [
  { label: 'Select category', value: '' },
  { label: 'E-commerce', value: 'ecommerce' },
  { label: 'SaaS', value: 'saas' },
  { label: 'FinTech', value: 'fintech' },
  { label: 'Gaming', value: 'gaming' },
  { label: 'Education', value: 'education' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Entertainment', value: 'entertainment' },
];

interface ImageData {
  uri: string;
  base64: string;
  type: string;
  name: string;
}

interface FormData {
  developerName: string;
  developerEmail: string;
  companyName: string;
  businessType: string;
  website: string;
  phone: string;
  country: string;
  logo: ImageData | null;
  taxId: string;
  registrationNumber: string;
  identityProof: ImageData | null;
  selfie: ImageData | null;
  addressProof: ImageData | null;
  nationality: string;
  dob: Date | null;
  businessAddress: string;
  homeAddress: string;
  appName: string;
  appStoreUrl: string;
  businessCategory: string;
  termsAccepted: boolean;
  internationalPaymentsAccepted: boolean;
  notes: string;
  airCapturedEnabled: boolean;
  airCapturedPurpose: string;
}

interface StepValidations {
  step1: boolean;
  step2: boolean;
  step3: boolean;
  step4: boolean;
}

interface UserData {
  id: string;
  name: string;
  phone?: string;
  isLive: boolean;
  country?: string;
  isDeveloper: boolean;
}

interface Prediction {
  place_id: string;
  description: string;
}

const getCountryCode = (countryName: string): CountryCode => {
  if (!countryName) return 'IN';
  const countryMap: { [key: string]: CountryCode } = {
    India: 'IN',
    'United States': 'US',
    USA: 'US',
    'United Kingdom': 'GB',
    UK: 'GB',
    Canada: 'CA',
    Australia: 'AU',
    Germany: 'DE',
    France: 'FR',
    Japan: 'JP',
    China: 'CN',
    Brazil: 'BR',
    'South Africa': 'ZA',
    Italy: 'IT',
    Spain: 'ES',
    Mexico: 'MX',
    Russia: 'RU',
    'South Korea': 'KR',
    Singapore: 'SG',
    UAE: 'AE',
    'United Arab Emirates': 'AE',
    'Saudi Arabia': 'SA',
    Netherlands: 'NL',
    Sweden: 'SE',
    Switzerland: 'CH',
    Norway: 'NO',
    Denmark: 'DK',
    Finland: 'FI',
    Belgium: 'BE',
    Austria: 'AT',
    Ireland: 'IE',
    'New Zealand': 'NZ',
    Portugal: 'PT',
    Greece: 'GR',
    Poland: 'PL',
    'Czech Republic': 'CZ',
    Hungary: 'HU',
    Turkey: 'TR',
    Israel: 'IL',
    Egypt: 'EG',
    Nigeria: 'NG',
    Kenya: 'KE',
    Pakistan: 'PK',
    Bangladesh: 'BD',
    'Sri Lanka': 'LK',
    Nepal: 'NP',
    Afghanistan: 'AF',
  };
  const code = countryMap[countryName];
  if (code) return code;
  const found = Object.entries(countryMap).find(
    ([name]) =>
      countryName.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(countryName.toLowerCase()),
  );
  return found ? (found[1] as CountryCode) : 'IN';
};

const DeveloperOnboardingForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [googleModalVisible, setGoogleModalVisible] = useState<boolean>(false);
  const [currentAddressField, setCurrentAddressField] = useState<
    'business' | 'home'
  >('business');
  const [showBusinessTypeModal, setShowBusinessTypeModal] =
    useState<boolean>(false);
  const [showBusinessCategoryModal, setShowBusinessCategoryModal] =
    useState<boolean>(false);
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);
  const [showNationalityPicker, setShowNationalityPicker] =
    useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string>('');

  // ✅ Google Search States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showPredictions, setShowPredictions] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    developerName: '',
    developerEmail: '',
    companyName: '',
    businessType: '',
    website: '',
    phone: '',
    country: '',
    logo: null,
    taxId: '',
    registrationNumber: '',
    identityProof: null,
    selfie: null,
    addressProof: null,
    nationality: '',
    dob: null,
    businessAddress: '',
    homeAddress: '',
    appName: '',
    appStoreUrl: '',
    businessCategory: '',
    termsAccepted: false,
    internationalPaymentsAccepted: false,
    notes: '',
    airCapturedEnabled: false,
    airCapturedPurpose: '',
  });

  const [stepValidations, setStepValidations] = useState<StepValidations>({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    checkUserStatus();
  }, []);

  useEffect(() => {
    validateCurrentStep();
  }, [formData, currentStep, isLive]);

  const checkUserStatus = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      setAuthToken(token || '');
      const response = await axios.get(`${API_BASE_URL}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data?.success && response.data.user) {
        const user = response.data.user;
        setUserData(user);
        setIsLive(user.isLive || false);
        if (user.name) handleInputChange('developerName', user.name);
        if (user.phone) handleInputChange('phone', user.phone);
        if (user.country) {
          handleInputChange('country', user.country);
          handleInputChange('nationality', user.country);
        }
      }
    } catch (error) {
      console.error('Error fetching user status:', error);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        validateStep1();
        break;
      case 2:
        validateStep2();
        break;
      case 3:
        validateStep3();
        break;
      case 4:
        validateStep4();
        break;
    }
  };

  const validateStep1 = () => {
    const requiredFields: (keyof FormData)[] = [
      'developerName',
      'developerEmail',
      'companyName',
      'businessType',
      'country',
    ];
    if (isLive) requiredFields.push('website', 'phone');
    const isValid = requiredFields.every(field => {
      const value = formData[field];
      return typeof value === 'string' && value.trim().length > 0;
    });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.developerEmail)) {
      setErrors(prev => ({ ...prev, developerEmail: 'Invalid email format' }));
      setStepValidations(prev => ({ ...prev, step1: false }));
      return;
    }
    if (isLive) {
      const businessEmailRegex =
        /@(?!gmail|yahoo|hotmail|outlook)[a-zA-Z0-9.-]+\.(com|in|org|net)$/i;
      if (!businessEmailRegex.test(formData.developerEmail)) {
        setErrors(prev => ({
          ...prev,
          developerEmail: 'Please use a business email',
        }));
        setStepValidations(prev => ({ ...prev, step1: false }));
        return;
      }
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.developerEmail;
      return newErrors;
    });
    setStepValidations(prev => ({ ...prev, step1: isValid }));
  };

  const validateStep2 = () => {
    const requiredFields: (keyof FormData)[] = [
      'logo',
      'identityProof',
      'selfie',
      'addressProof',
    ];
    const hasAllImages = requiredFields.every(
      field => formData[field] !== null,
    );
    setStepValidations(prev => ({ ...prev, step2: hasAllImages }));
  };

  const validateStep3 = () => {
    const businessAddressValid = formData.businessAddress.trim().length > 0;
    const homeAddressValid = formData.homeAddress.trim().length > 0;
    setStepValidations(prev => ({
      ...prev,
      step3: businessAddressValid && homeAddressValid,
    }));
  };

  const validateStep4 = () => {
    if (!isLive) {
      setStepValidations(prev => ({ ...prev, step4: true }));
      return;
    }
    setStepValidations(prev => ({
      ...prev,
      step4: formData.termsAccepted && formData.internationalPaymentsAccepted,
    }));
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to select images',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to camera to take selfie',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  const pickImage = async (fieldName: keyof FormData) => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photos.',
        );
        return;
      }
      const options: ImageLibraryOptions = {
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.5,
      };
      launchImageLibrary(options, response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
          Alert.alert('Error', 'Failed to pick image');
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          const imageData: ImageData = {
            uri: asset.uri || '',
            base64: asset.base64 || '',
            type: asset.type || 'image/jpeg',
            name: `image_${Date.now()}.jpg`,
          };
          setFormData(prev => ({ ...prev, [fieldName]: imageData }));
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takeSelfie = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please allow access to camera.');
        return;
      }
      const options: CameraOptions = {
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.5,
        saveToPhotos: false,
      };
      launchCamera(options, response => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          console.log('Camera Error: ', response.errorMessage);
          Alert.alert('Error', 'Failed to take selfie');
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          const imageData: ImageData = {
            uri: asset.uri || '',
            base64: asset.base64 || '',
            type: asset.type || 'image/jpeg',
            name: `selfie_${Date.now()}.jpg`,
          };
          setFormData(prev => ({ ...prev, selfie: imageData }));
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to take selfie');
    }
  };

  // ✅ Google Places Search Function
  const searchPlaces = async (text: string) => {
    if (text.length < 2) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        {
          params: {
            input: text,
            key: GOOGLE_API_KEY,
            types: 'geocode',
            language: 'en',
          },
        },
      );

      if (response.data.predictions) {
        setPredictions(response.data.predictions);
        setShowPredictions(true);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setPredictions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // ✅ Get Place Details
  const getPlaceDetails = async (placeId: string) => {
    setSearchLoading(true);
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id: placeId,
            key: GOOGLE_API_KEY,
            fields: 'formatted_address',
          },
        },
      );

      if (response.data.result?.formatted_address) {
        const fullAddress = response.data.result.formatted_address;
        if (currentAddressField === 'business') {
          setFormData(prev => ({ ...prev, businessAddress: fullAddress }));
        } else {
          setFormData(prev => ({ ...prev, homeAddress: fullAddress }));
        }
        setGoogleModalVisible(false);
        setShowPredictions(false);
        setSearchQuery('');
        setPredictions([]);
      } else {
        Alert.alert('Error', 'Could not get address details');
      }
    } catch (error) {
      console.error('Place details error:', error);
      Alert.alert('Error', 'Failed to get address details');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleInputChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  const handleCountrySelect = (country: Country) => {
    setFormData(prev => ({ ...prev, country: String(country.name) }));
    setShowCountryPicker(false);
  };
  const handleNationalitySelect = (country: Country) => {
    setFormData(prev => ({ ...prev, nationality: String(country.name) }));
    setShowNationalityPicker(false);
  };
  const handleBusinessTypeSelect = (value: string) => {
    handleInputChange('businessType', value);
    setShowBusinessTypeModal(false);
  };
  const handleBusinessCategorySelect = (value: string) => {
    handleInputChange('businessCategory', value);
    setShowBusinessCategoryModal(false);
  };

  const nextStep = () => {
    if (
      currentStep < 4 &&
      stepValidations[`step${currentStep}` as keyof StepValidations]
    ) {
      setCurrentStep(prev => prev + 1);
    }
  };
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (
      !stepValidations.step1 ||
      !stepValidations.step2 ||
      !stepValidations.step3
    ) {
      Alert.alert('Validation Error', 'Please complete all required fields');
      return;
    }
    if (isLive && !stepValidations.step4) {
      Alert.alert('Validation Error', 'Please accept terms and conditions');
      return;
    }
    setSubmitting(true);
    try {
      const submissionData = {
        developerName: formData.developerName,
        developerEmail: formData.developerEmail,
        companyName: formData.companyName,
        businessType: formData.businessType,
        website: formData.website || undefined,
        phone: formData.phone || undefined,
        logoUrl: formData.logo?.base64,
        country: formData.country,
        taxId: formData.taxId || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        identityProofUrl: formData.identityProof?.base64,
        selfieUrl: formData.selfie?.base64,
        addressProofUrl: formData.addressProof?.base64,
        nationality: formData.nationality || undefined,
        dob: formData.dob || undefined,
        businessAddress: formData.businessAddress || undefined,
        homeAddress: formData.homeAddress || undefined,
        appName: formData.appName || undefined,
        appStoreUrl: formData.appStoreUrl || undefined,
        businessCategory: formData.businessCategory || undefined,
        termsAccepted: formData.termsAccepted,
        internationalPaymentsAccepted: formData.internationalPaymentsAccepted,
        notes: formData.notes || undefined,
        airCapturedEnabled: formData.airCapturedEnabled,
        airCapturedPurpose: formData.airCapturedPurpose || undefined,
        metadata: {
          mode: isLive ? 'live' : 'test',
          submittedAt: new Date().toISOString(),
          platform: Platform.OS,
          userId: userData?.id,
        },
      };
      const response = await axios.post(
        `${API_BASE_URL}/api/developer/create`,
        submissionData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        },
      );
      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          isLive ? 'Application Submitted!' : 'Test Submission Successful!',
          isLive
            ? 'Your developer application has been submitted for review.'
            : 'Your test application has been created successfully!',
          [{ text: 'OK', onPress: () => resetForm() }],
        );
      }
    } catch (error: any) {
      let errorMessage = 'Network error. Please check your connection.';
      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error occurred';
      } else if (error.request) {
        errorMessage = 'No response from server. Please try again.';
      }
      Alert.alert('Submission Failed', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      developerName: userData?.name || '',
      developerEmail: '',
      companyName: '',
      businessType: '',
      website: '',
      phone: userData?.phone || '',
      country: userData?.country || '',
      logo: null,
      taxId: '',
      registrationNumber: '',
      identityProof: null,
      selfie: null,
      addressProof: null,
      nationality: userData?.country || '',
      dob: null,
      businessAddress: '',
      homeAddress: '',
      appName: '',
      appStoreUrl: '',
      businessCategory: '',
      termsAccepted: false,
      internationalPaymentsAccepted: false,
      notes: '',
      airCapturedEnabled: false,
      airCapturedPurpose: '',
    });
    setCurrentStep(1);
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return 'Personal Info';
      case 2:
        return 'Verification';
      case 3:
        return 'Address';
      case 4:
        return 'Business Details';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading user data...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Developer</Text>
              <Text style={styles.headerSubtitle}>Onboarding</Text>
            </View>
            <View
              style={[
                styles.modeBadge,
                isLive ? styles.liveModeBadge : styles.testModeBadge,
              ]}
            >
              <View
                style={[
                  styles.modeDot,
                  isLive ? styles.liveModeDot : styles.testModeDot,
                ]}
              />
              <Text
                style={[
                  styles.modeBadgeText,
                  isLive ? styles.liveModeText : styles.testModeText,
                ]}
              >
                {isLive ? 'LIVE MODE' : 'TEST MODE'}
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            {[1, 2, 3, 4].map(step => (
              <TouchableOpacity
                key={step}
                style={styles.progressStep}
                onPress={() => {
                  if (step <= currentStep) setCurrentStep(step);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.progressDot,
                    step < currentStep && styles.progressDotCompleted,
                    step === currentStep && styles.progressDotCurrent,
                  ]}
                >
                  {step < currentStep ? (
                    <Icon name="check" size={16} color="#fff" />
                  ) : (
                    <Text
                      style={[
                        styles.progressDotText,
                        step === currentStep && styles.progressDotTextCurrent,
                      ]}
                    >
                      {step}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.progressLabel,
                    step <= currentStep && styles.progressLabelActive,
                  ]}
                >
                  {getStepTitle(step)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Step 1 */}
            {currentStep === 1 && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    style={styles.stepIconGradient}
                  >
                    <Icon name="person" size={24} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.stepTitle}>Basic Information</Text>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Full Name <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Icon
                      name="person-outline"
                      size={20}
                      color="#6366F1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.developerName}
                      onChangeText={text =>
                        handleInputChange('developerName', text)
                      }
                      placeholder="Enter full name"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Email <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Icon
                      name="email"
                      size={20}
                      color="#6366F1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.developerEmail}
                      onChangeText={text =>
                        handleInputChange('developerEmail', text)
                      }
                      placeholder="name@company.com"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.developerEmail && (
                    <Text style={styles.errorText}>
                      {errors.developerEmail}
                    </Text>
                  )}
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Company Name <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Icon
                      name="business"
                      size={20}
                      color="#6366F1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.companyName}
                      onChangeText={text =>
                        handleInputChange('companyName', text)
                      }
                      placeholder="Company name"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Business Type <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowBusinessTypeModal(true)}
                  >
                    <Icon name="work" size={20} color="#6366F1" />
                    <Text
                      style={[
                        styles.pickerButtonText,
                        !formData.businessType &&
                          styles.pickerButtonPlaceholder,
                      ]}
                    >
                      {formData.businessType
                        ? BUSINESS_TYPES.find(
                            item => item.value === formData.businessType,
                          )?.label
                        : 'Select business type'}
                    </Text>
                    <Icon name="arrow-drop-down" size={24} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Country <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowCountryPicker(true)}
                  >
                    <FontAwesome5 name="globe" size={18} color="#6366F1" />
                    <Text
                      style={[
                        styles.pickerButtonText,
                        !formData.country && styles.pickerButtonPlaceholder,
                      ]}
                    >
                      {formData.country || 'Select country'}
                    </Text>
                    <Icon name="arrow-drop-down" size={24} color="#94A3B8" />
                  </TouchableOpacity>
                  <CountryPicker
                    visible={showCountryPicker}
                    countryCode={getCountryCode(formData.country)}
                    withFilter
                    withFlag
                    withCountryNameButton
                    withAlphaFilter
                    onSelect={handleCountrySelect}
                    onClose={() => setShowCountryPicker(false)}
                    theme={DEFAULT_THEME}
                    containerButtonStyle={styles.hiddenPicker}
                  />
                </View>
                {isLive && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        Website <Text style={styles.required}>*</Text>
                      </Text>
                      <View style={styles.inputWrapper}>
                        <Icon
                          name="link"
                          size={20}
                          color="#6366F1"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          value={formData.website}
                          onChangeText={text =>
                            handleInputChange('website', text)
                          }
                          placeholder="https://example.com"
                          placeholderTextColor="#94A3B8"
                          keyboardType="url"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        Phone <Text style={styles.required}>*</Text>
                      </Text>
                      <View style={styles.inputWrapper}>
                        <Icon
                          name="phone"
                          size={20}
                          color="#6366F1"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          value={formData.phone}
                          onChangeText={text =>
                            handleInputChange('phone', text)
                          }
                          placeholder="+1 (555) 123-4567"
                          placeholderTextColor="#94A3B8"
                          keyboardType="phone-pad"
                        />
                      </View>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <LinearGradient
                    colors={['#EC4899', '#F43F5E']}
                    style={styles.stepIconGradient}
                  >
                    <Icon name="verified" size={24} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.stepTitle}>KYC / Legal Documents</Text>
                </View>
                {[
                  {
                    label: 'Company Logo',
                    field: 'logo' as const,
                    sub: 'Company logo for branding',
                  },
                  {
                    label: 'Identity Proof',
                    field: 'identityProof' as const,
                    sub: "Passport / Driver's License / National ID",
                  },
                  {
                    label: 'Selfie',
                    field: 'selfie' as const,
                    isSelfie: true,
                    sub: 'Take a selfie holding your ID',
                  },
                  {
                    label: 'Address Proof',
                    field: 'addressProof' as const,
                    sub: 'Utility bill / Bank statement / Rental agreement',
                  },
                ].map((item, index) => (
                  <View key={index} style={styles.uploadSection}>
                    <Text style={styles.label}>
                      {item.label} <Text style={styles.required}>*</Text>
                    </Text>
                    {item.sub && (
                      <Text style={styles.subLabel}>{item.sub}</Text>
                    )}
                    {formData[item.field] ? (
                      <View style={styles.previewContainer}>
                        <Image
                          source={{
                            uri: (formData[item.field] as ImageData).uri,
                          }}
                          style={styles.previewImage}
                        />
                        <TouchableOpacity
                          style={styles.changeButton}
                          onPress={() =>
                            item.isSelfie ? takeSelfie() : pickImage(item.field)
                          }
                        >
                          <Text style={styles.changeButtonText}>Change</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleInputChange(item.field, null)}
                        >
                          <Icon name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() =>
                          item.isSelfie ? takeSelfie() : pickImage(item.field)
                        }
                      >
                        <Icon name="cloud-upload" size={24} color="#6366F1" />
                        <Text style={styles.uploadButtonText}>
                          Upload {item.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nationality</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowNationalityPicker(true)}
                  >
                    <FontAwesome5 name="flag" size={18} color="#6366F1" />
                    <Text
                      style={[
                        styles.pickerButtonText,
                        !formData.nationality && styles.pickerButtonPlaceholder,
                      ]}
                    >
                      {formData.nationality || 'Select nationality (Optional)'}
                    </Text>
                    <Icon name="arrow-drop-down" size={24} color="#94A3B8" />
                  </TouchableOpacity>
                  <CountryPicker
                    visible={showNationalityPicker}
                    countryCode={getCountryCode(formData.nationality)}
                    withFilter
                    withFlag
                    withCountryNameButton
                    withAlphaFilter
                    onSelect={handleNationalitySelect}
                    onClose={() => setShowNationalityPicker(false)}
                    theme={DEFAULT_THEME}
                    containerButtonStyle={styles.hiddenPicker}
                  />
                </View>
                {isLive && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Tax ID (Optional)</Text>
                      <View style={styles.inputWrapper}>
                        <Icon
                          name="receipt"
                          size={20}
                          color="#6366F1"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          value={formData.taxId}
                          onChangeText={text =>
                            handleInputChange('taxId', text)
                          }
                          placeholder="Tax Identification Number"
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        Registration Number (Optional)
                      </Text>
                      <View style={styles.inputWrapper}>
                        <Icon
                          name="confirmation-number"
                          size={20}
                          color="#6366F1"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          value={formData.registrationNumber}
                          onChangeText={text =>
                            handleInputChange('registrationNumber', text)
                          }
                          placeholder="Company Registration Number"
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Step 3 - Address */}
            {currentStep === 3 && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <LinearGradient
                    colors={['#06B6D4', '#3B82F6']}
                    style={styles.stepIconGradient}
                  >
                    <Icon name="location-on" size={24} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.stepTitle}>Address Information</Text>
                </View>

                <View style={styles.addressSection}>
                  <View style={styles.addressHeader}>
                    <View style={styles.addressTitleContainer}>
                      <Icon name="business" size={20} color="#6366F1" />
                      <Text style={styles.addressTitle}>
                        Business Address <Text style={styles.required}>*</Text>
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.googleButton}
                      onPress={() => {
                        setCurrentAddressField('business');
                        setGoogleModalVisible(true);
                      }}
                    >
                      <Icon name="search" size={16} color="#3B82F6" />
                      <Text style={styles.googleButtonText}>Search</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputWrapper}>
                    <Icon
                      name="place"
                      size={20}
                      color="#6366F1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={formData.businessAddress}
                      onChangeText={text =>
                        handleInputChange('businessAddress', text)
                      }
                      placeholder="Full business address"
                      placeholderTextColor="#94A3B8"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                <View style={styles.addressSection}>
                  <View style={styles.addressHeader}>
                    <View style={styles.addressTitleContainer}>
                      <Icon name="home" size={20} color="#6366F1" />
                      <Text style={styles.addressTitle}>
                        Home Address <Text style={styles.required}>*</Text>
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.googleButton}
                      onPress={() => {
                        setCurrentAddressField('home');
                        setGoogleModalVisible(true);
                      }}
                    >
                      <Icon name="search" size={16} color="#3B82F6" />
                      <Text style={styles.googleButtonText}>Search</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputWrapper}>
                    <Icon
                      name="place"
                      size={20}
                      color="#6366F1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={formData.homeAddress}
                      onChangeText={text =>
                        handleInputChange('homeAddress', text)
                      }
                      placeholder="Full home address"
                      placeholderTextColor="#94A3B8"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <LinearGradient
                    colors={['#10B981', '#14B8A6']}
                    style={styles.stepIconGradient}
                  >
                    <Icon name="apps" size={24} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.stepTitle}>
                    App & Payment Information
                  </Text>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    App Name {isLive && <Text style={styles.required}>*</Text>}
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Icon
                      name="phone-android"
                      size={20}
                      color="#6366F1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.appName}
                      onChangeText={text => handleInputChange('appName', text)}
                      placeholder={
                        isLive ? 'Your app name' : 'App name (Optional)'
                      }
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    App Store URL{' '}
                    {isLive && <Text style={styles.required}>*</Text>}
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Icon
                      name="link"
                      size={20}
                      color="#6366F1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.appStoreUrl}
                      onChangeText={text =>
                        handleInputChange('appStoreUrl', text)
                      }
                      placeholder={
                        isLive
                          ? 'https://apps.apple.com/app/id...'
                          : 'App URL (Optional)'
                      }
                      placeholderTextColor="#94A3B8"
                      keyboardType="url"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Business Category{' '}
                    {isLive && <Text style={styles.required}>*</Text>}
                  </Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowBusinessCategoryModal(true)}
                  >
                    <Icon name="widgets" size={20} color="#6366F1" />
                    <Text
                      style={[
                        styles.pickerButtonText,
                        !formData.businessCategory &&
                          styles.pickerButtonPlaceholder,
                      ]}
                    >
                      {formData.businessCategory
                        ? BUSINESS_CATEGORIES.find(
                            item => item.value === formData.businessCategory,
                          )?.label
                        : isLive
                        ? 'Select category'
                        : 'Select category (Optional)'}
                    </Text>
                    <Icon name="arrow-drop-down" size={24} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
                {isLive && (
                  <>
                    <View style={styles.switchGroup}>
                      <View style={styles.switchRow}>
                        <View style={styles.switchLabelContainer}>
                          <Icon name="check-circle" size={20} color="#6366F1" />
                          <Text style={styles.switchLabel}>
                            Accept Terms & Conditions{' '}
                            <Text style={styles.required}>*</Text>
                          </Text>
                        </View>
                        <Switch
                          value={formData.termsAccepted}
                          onValueChange={value =>
                            handleInputChange('termsAccepted', value)
                          }
                          trackColor={{ false: '#E2E8F0', true: '#6366F1' }}
                          thumbColor={Platform.OS === 'android' ? '#fff' : ''}
                          ios_backgroundColor="#E2E8F0"
                        />
                      </View>
                      <Text style={styles.switchDescription}>
                        I agree to the Terms of Service and Privacy Policy
                      </Text>
                    </View>
                    <View style={styles.switchGroup}>
                      <View style={styles.switchRow}>
                        <View style={styles.switchLabelContainer}>
                          <Icon name="language" size={20} color="#6366F1" />
                          <Text style={styles.switchLabel}>
                            Enable International Payments{' '}
                            <Text style={styles.required}>*</Text>
                          </Text>
                        </View>
                        <Switch
                          value={formData.internationalPaymentsAccepted}
                          onValueChange={value =>
                            handleInputChange(
                              'internationalPaymentsAccepted',
                              value,
                            )
                          }
                          trackColor={{ false: '#E2E8F0', true: '#6366F1' }}
                          thumbColor={Platform.OS === 'android' ? '#fff' : ''}
                          ios_backgroundColor="#E2E8F0"
                        />
                      </View>
                      <Text style={styles.switchDescription}>
                        Allow receiving payments from international customers
                      </Text>
                    </View>
                  </>
                )}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Additional Notes (Optional)</Text>
                  <View style={styles.inputWrapper}>
                    <Icon
                      name="note"
                      size={20}
                      color="#6366F1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={formData.notes}
                      onChangeText={text => handleInputChange('notes', text)}
                      placeholder="Any additional information"
                      placeholderTextColor="#94A3B8"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={prevStep}
                disabled={submitting}
              >
                <Icon name="arrow-back" size={20} color="#6366F1" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            {currentStep < 4 ? (
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  !stepValidations[
                    `step${currentStep}` as keyof StepValidations
                  ] && styles.buttonDisabled,
                ]}
                onPress={nextStep}
                disabled={
                  !stepValidations[
                    `step${currentStep}` as keyof StepValidations
                  ]
                }
              >
                <Text style={styles.nextButtonText}>Continue</Text>
                <Icon name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!stepValidations.step1 ||
                    !stepValidations.step2 ||
                    !stepValidations.step3 ||
                    (isLive && !stepValidations.step4)) &&
                    styles.buttonDisabled,
                  isLive ? styles.liveSubmitButton : styles.testSubmitButton,
                ]}
                onPress={handleSubmit}
                disabled={
                  submitting ||
                  !stepValidations.step1 ||
                  !stepValidations.step2 ||
                  !stepValidations.step3 ||
                  (isLive && !stepValidations.step4)
                }
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>
                      {isLive ? 'Submit Application' : 'Submit Test'}
                    </Text>
                    <Icon name="send" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* ✅ Google Places Modal - Manual Search */}
          <Modal
            animationType="slide"
            transparent
            visible={googleModalVisible}
            onRequestClose={() => setGoogleModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setGoogleModalVisible(false)}
            >
              <View style={[styles.modalContent, { height: height * 0.7 }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Search{' '}
                    {currentAddressField === 'business' ? 'Business' : 'Home'}{' '}
                    Address
                  </Text>
                  <TouchableOpacity
                    onPress={() => setGoogleModalVisible(false)}
                  >
                    <Icon name="close" size={22} color="#333" />
                  </TouchableOpacity>
                </View>

                {/* Search Input */}
                <View style={styles.searchInputContainer}>
                  <Icon
                    name="search"
                    size={20}
                    color="#94A3B8"
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Type address, city or landmark..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={text => {
                      setSearchQuery(text);
                      searchPlaces(text);
                    }}
                    autoFocus
                  />
                  {searchLoading && (
                    <ActivityIndicator
                      size="small"
                      color="#6366F1"
                      style={styles.searchLoader}
                    />
                  )}
                </View>

                {/* Predictions List */}
                {showPredictions && predictions.length > 0 && (
                  <ScrollView
                    style={styles.predictionsList}
                    keyboardShouldPersistTaps="handled"
                  >
                    {predictions.map(item => (
                      <TouchableOpacity
                        key={item.place_id}
                        style={styles.predictionItem}
                        onPress={() => getPlaceDetails(item.place_id)}
                      >
                        <Icon name="location-on" size={20} color="#6366F1" />
                        <Text style={styles.predictionText}>
                          {item.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {showPredictions &&
                  predictions.length === 0 &&
                  searchQuery.length > 2 &&
                  !searchLoading && (
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>No results found</Text>
                    </View>
                  )}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Business Type Modal */}
          <Modal
            animationType="slide"
            transparent
            visible={showBusinessTypeModal}
            onRequestClose={() => setShowBusinessTypeModal(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowBusinessTypeModal(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Business Type</Text>
                  <TouchableOpacity
                    onPress={() => setShowBusinessTypeModal(false)}
                  >
                    <Icon name="close" size={22} color="#333" />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={BUSINESS_TYPES}
                  keyExtractor={item => item.value}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleBusinessTypeSelect(item.value)}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          formData.businessType === item.value &&
                            styles.dropdownItemTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {formData.businessType === item.value && (
                        <Icon name="check" size={18} color="#6366F1" />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Business Category Modal */}
          <Modal
            animationType="slide"
            transparent
            visible={showBusinessCategoryModal}
            onRequestClose={() => setShowBusinessCategoryModal(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowBusinessCategoryModal(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Select Business Category
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowBusinessCategoryModal(false)}
                  >
                    <Icon name="close" size={22} color="#333" />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={BUSINESS_CATEGORIES}
                  keyExtractor={item => item.value}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleBusinessCategorySelect(item.value)}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          formData.businessCategory === item.value &&
                            styles.dropdownItemTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {formData.businessCategory === item.value && (
                        <Icon name="check" size={18} color="#6366F1" />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1 },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6366F1',
    letterSpacing: -0.5,
    marginTop: -4,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveModeBadge: { backgroundColor: '#DCFCE7' },
  testModeBadge: { backgroundColor: '#FEF3C7' },
  modeDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  liveModeDot: { backgroundColor: '#22C55E' },
  testModeDot: { backgroundColor: '#F59E0B' },
  modeBadgeText: { fontSize: 12, fontWeight: '600' },
  liveModeText: { color: '#22C55E' },
  testModeText: { color: '#F59E0B' },
  progressContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressStep: { flex: 1, alignItems: 'center' },
  progressDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDotCompleted: { backgroundColor: '#6366F1' },
  progressDotCurrent: {
    backgroundColor: '#6366F1',
    borderWidth: 3,
    borderColor: '#C7D2FE',
  },
  progressDotText: { fontSize: 16, fontWeight: '600', color: '#94A3B8' },
  progressDotTextCurrent: { color: '#FFFFFF' },
  progressLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  progressLabelActive: { color: '#6366F1' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  stepContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  stepIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepTitle: { fontSize: 18, fontWeight: '500', color: '#1E293B' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#475569', marginBottom: 8 },
  required: { color: '#EF4444' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    minHeight: 52,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E293B',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  inputIcon: { paddingHorizontal: 12 },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    height: 52,
  },
  pickerButtonText: { flex: 1, fontSize: 15, color: '#1E293B', marginLeft: 12 },
  pickerButtonPlaceholder: { color: '#94A3B8' },
  hiddenPicker: { display: 'none' },
  uploadSection: { marginBottom: 24 },
  subLabel: { fontSize: 12, color: '#64748B', marginBottom: 10 },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    paddingVertical: 14,
    gap: 10,
  },
  uploadButtonText: { fontSize: 14, color: '#6366F1', fontWeight: '500' },
  previewContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewImage: { width: 56, height: 56, borderRadius: 12 },
  changeButton: {
    marginLeft: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#6366F1',
    borderRadius: 10,
  },
  changeButtonText: { fontSize: 12, color: '#fff', fontWeight: '500' },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  addressSection: {
    marginBottom: 28,
    padding: 18,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
  },
  googleButtonText: { fontSize: 12, color: '#3B82F6', fontWeight: '500' },
  switchGroup: {
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  switchLabel: { fontSize: 14, fontWeight: '500', color: '#475569' },
  switchDescription: { fontSize: 12, color: '#64748B', marginLeft: 30 },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#6366F1',
    marginRight: 12,
    flex: 1,
    gap: 8,
  },
  backButtonText: { fontSize: 14, fontWeight: '500', color: '#6366F1' },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#6366F1',
    borderRadius: 14,
    flex: 2,
    gap: 8,
  },
  nextButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    flex: 1,
    gap: 8,
  },
  liveSubmitButton: { backgroundColor: '#22C55E' },
  testSubmitButton: { backgroundColor: '#F59E0B' },
  submitButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  buttonDisabled: { opacity: 0.5 },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B' },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: { fontSize: 15, color: '#1E293B' },
  dropdownItemTextSelected: { color: '#6366F1', fontWeight: '500' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
  // ✅ Google Search Styles
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: { marginRight: 10 },
  searchLoader: { marginLeft: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#1E293B', paddingVertical: 10 },
  predictionsList: {
    maxHeight: height * 0.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  predictionText: { flex: 1, fontSize: 14, color: '#1E293B' },
  noResultsContainer: { padding: 20, alignItems: 'center' },
  noResultsText: { fontSize: 14, color: '#94A3B8' },
});

export default DeveloperOnboardingForm;

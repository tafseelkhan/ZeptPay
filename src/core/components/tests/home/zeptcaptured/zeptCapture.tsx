// screens/DeveloperOnboardingForm.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

// Import Step Components
import Step1PersonalInfo from '../../../../modules/tests/zeptcaptured/onboarding/Step1PersonalInfo';
import Step2Verification from '../../../../modules/tests/zeptcaptured/onboarding/Step2Verification';
import Step3Address from '../../../../modules/tests/zeptcaptured/onboarding/Step3Address';
import Step4BusinessDetails from '../../../../modules/tests/zeptcaptured/onboarding/Step4BusinessDetails';

// Import Services & Utils
import {
  fetchUserData,
  submitDeveloperApp,
  searchAddress,
  getAddressDetails,
  validateEmail,
} from '../../../../services/tests/zeptcaptured/developerService';
import {
  requestStoragePermission,
  requestCameraPermission,
  getImagePickerOptions,
  getCameraOptions,
  createImageData,
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  getStepTitle,
  BUSINESS_TYPES,
  BUSINESS_CATEGORIES,
} from '../../../../utils/tests/zeptcaptured/developerUtils';

const { height } = Dimensions.get('window');

// Define the form data interface matching DeveloperFormData expectations
interface FormData {
  developerName: string;
  developerEmail: string;
  companyName: string;
  businessType: string;
  website: string;
  phone: string;
  country: string;
  logo: any | null;
  taxId: string;
  registrationNumber: string;
  identityProof: any | null;
  selfie: any | null;
  addressProof: any | null;
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
  zeptCapturedPurpose: string;
  zeptCapturedEnabled: boolean; // Added this missing property
}

// Define prediction item interface
interface PredictionItem {
  place_id: string;
  description: string;
}

const DeveloperOnboardingForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  // Modal States
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

  // Google Search States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
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
    zeptCapturedPurpose: '',
    zeptCapturedEnabled: false, // Initialize the missing property
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const result = await fetchUserData();

      if (result.success && result.user) {
        const user = result.user;
        setUserData(user);
        setIsLive(user.isLive || false);
        setFormData((prev: FormData) => ({
          ...prev,
          developerName: user.name || '',
          phone: user.phone || '',
          country: user.country || '',
          nationality: user.country || '',
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: FormData) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Real-time email validation
    if (field === 'developerEmail') {
      const emailError = validateEmail(value, isLive);
      if (emailError) {
        setErrors((prev: Record<string, string>) => ({
          ...prev,
          developerEmail: emailError,
        }));
      } else {
        setErrors((prev: Record<string, string>) => {
          const newErrors = { ...prev };
          delete newErrors.developerEmail;
          return newErrors;
        });
      }
    }
  };

  const pickImage = async (fieldName: string) => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please allow access to your photos.');
      return;
    }

    const options = getImagePickerOptions();
    launchImageLibrary(options, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', 'Failed to pick image');
        return;
      }
      if (response.assets && response.assets[0]) {
        const imageData = createImageData(response.assets[0]);
        handleInputChange(fieldName, imageData);
      }
    });
  };

  const takeSelfie = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please allow access to camera.');
      return;
    }

    const options = getCameraOptions();
    launchCamera(options, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', 'Failed to take selfie');
        return;
      }
      if (response.assets && response.assets[0]) {
        const imageData = createImageData(response.assets[0]);
        handleInputChange('selfie', imageData);
      }
    });
  };

  const handleCountrySelect = (country: any) => {
    handleInputChange('country', String(country.name));
    setShowCountryPicker(false);
  };

  const handleNationalitySelect = (country: any) => {
    handleInputChange('nationality', String(country.name));
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

  const handleOpenAddressModal = (type: 'business' | 'home') => {
    setCurrentAddressField(type);
    setGoogleModalVisible(true);
    setSearchQuery('');
    setPredictions([]);
  };

  const handleSearchPlaces = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    setSearchLoading(true);
    const results = await searchAddress(text);
    setPredictions(results);
    setShowPredictions(true);
    setSearchLoading(false);
  };

  const handleSelectPlace = async (placeId: string) => {
    setSearchLoading(true);
    try {
      const address = await getAddressDetails(placeId);
      if (address) {
        if (currentAddressField === 'business') {
          handleInputChange('businessAddress', address);
        } else {
          handleInputChange('homeAddress', address);
        }
        setGoogleModalVisible(false);
        setShowPredictions(false);
        setSearchQuery('');
        setPredictions([]);
      } else {
        Alert.alert('Error', 'Could not get address details');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get address details');
    } finally {
      setSearchLoading(false);
    }
  };

  const getStepValidation = (step: number): boolean => {
    switch (step) {
      case 1:
        return validateStep1(formData, isLive);
      case 2:
        return validateStep2(formData);
      case 3:
        return validateStep3(formData);
      case 4:
        return validateStep4(formData, isLive);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 4 && getStepValidation(currentStep)) {
      setCurrentStep((prev: number) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev: number) => prev - 1);
  };

  const handleSubmit = async () => {
    if (
      !getStepValidation(1) ||
      !getStepValidation(2) ||
      !getStepValidation(3)
    ) {
      Alert.alert('Validation Error', 'Please complete all required fields');
      return;
    }

    if (isLive && !getStepValidation(4)) {
      Alert.alert('Validation Error', 'Please accept terms and conditions');
      return;
    }

    setSubmitting(true);
    const result = await submitDeveloperApp(formData, isLive);

    if (result.success) {
      Alert.alert(
        isLive ? 'Application Submitted!' : 'Test Submission Successful!',
        isLive
          ? 'Your developer application has been submitted for review.'
          : 'Your test application has been created successfully!',
        [{ text: 'OK', onPress: () => resetForm() }],
      );
    } else {
      Alert.alert('Submission Failed', result.error);
    }
    setSubmitting(false);
  };

  const resetForm = () => {
    setFormData((prev: FormData) => ({
      ...prev,
      developerName: userData?.name || '',
      phone: userData?.phone || '',
      country: userData?.country || '',
      nationality: userData?.country || '',
      logo: null,
      identityProof: null,
      selfie: null,
      addressProof: null,
      businessAddress: '',
      homeAddress: '',
      appName: '',
      appStoreUrl: '',
      businessCategory: '',
      termsAccepted: false,
      internationalPaymentsAccepted: false,
      notes: '',
    }));
    setCurrentStep(1);
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
          {/* Header */}
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

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {[1, 2, 3, 4].map(step => (
              <TouchableOpacity
                key={step}
                style={styles.progressStep}
                onPress={() => step <= currentStep && setCurrentStep(step)}
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

          {/* Step Components */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {currentStep === 1 && (
              <Step1PersonalInfo
                formData={formData}
                errors={errors}
                isLive={isLive}
                showCountryPicker={showCountryPicker}
                showBusinessTypeModal={showBusinessTypeModal}
                onInputChange={handleInputChange}
                onShowCountryPicker={setShowCountryPicker}
                onShowBusinessTypeModal={setShowBusinessTypeModal}
                onCountrySelect={handleCountrySelect}
                onBusinessTypeSelect={handleBusinessTypeSelect}
              />
            )}

            {currentStep === 2 && (
              <Step2Verification
                formData={formData}
                isLive={isLive}
                showNationalityPicker={showNationalityPicker}
                onInputChange={handleInputChange}
                onShowNationalityPicker={setShowNationalityPicker}
                onNationalitySelect={handleNationalitySelect}
                onPickImage={pickImage}
                onTakeSelfie={takeSelfie}
              />
            )}

            {currentStep === 3 && (
              <Step3Address
                formData={formData}
                onInputChange={handleInputChange}
                onOpenAddressModal={handleOpenAddressModal}
              />
            )}

            {currentStep === 4 && (
              <Step4BusinessDetails
                formData={formData}
                isLive={isLive}
                showBusinessCategoryModal={showBusinessCategoryModal}
                onInputChange={handleInputChange}
                onShowBusinessCategoryModal={setShowBusinessCategoryModal}
                onBusinessCategorySelect={handleBusinessCategorySelect}
              />
            )}
          </ScrollView>

          {/* Footer Buttons */}
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
                  !getStepValidation(currentStep) && styles.buttonDisabled,
                ]}
                onPress={nextStep}
                disabled={!getStepValidation(currentStep)}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
                <Icon name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!getStepValidation(1) ||
                    !getStepValidation(2) ||
                    !getStepValidation(3) ||
                    (isLive && !getStepValidation(4))) &&
                    styles.buttonDisabled,
                  isLive ? styles.liveSubmitButton : styles.testSubmitButton,
                ]}
                onPress={handleSubmit}
                disabled={
                  submitting ||
                  !getStepValidation(1) ||
                  !getStepValidation(2) ||
                  !getStepValidation(3) ||
                  (isLive && !getStepValidation(4))
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

          {/* Google Places Modal */}
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
                    value={searchQuery}
                    onChangeText={handleSearchPlaces}
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

                {showPredictions && predictions.length > 0 && (
                  <ScrollView
                    style={styles.predictionsList}
                    keyboardShouldPersistTaps="handled"
                  >
                    {predictions.map((item: PredictionItem) => (
                      <TouchableOpacity
                        key={item.place_id}
                        style={styles.predictionItem}
                        onPress={() => handleSelectPlace(item.place_id)}
                      >
                        <Icon name="location-on" size={20} color="#6366F1" />
                        <Text style={styles.predictionText}>
                          {item.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
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
});

export default DeveloperOnboardingForm;

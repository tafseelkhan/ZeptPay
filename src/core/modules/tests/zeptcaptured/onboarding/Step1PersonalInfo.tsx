// components/onboarding/Step1PersonalInfo.tsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CountryPicker, { CountryCode } from 'react-native-country-picker-modal';
import LinearGradient from 'react-native-linear-gradient';
import { getCountryCode } from '../../../../services/tests/zeptcaptured/developerService';

interface Step1Props {
  formData: any;
  errors: Record<string, string>;
  isLive: boolean;
  showCountryPicker: boolean;
  showBusinessTypeModal: boolean;
  onInputChange: (field: string, value: any) => void;
  onShowCountryPicker: (show: boolean) => void;
  onShowBusinessTypeModal: (show: boolean) => void;
  onCountrySelect: (country: any) => void;
  onBusinessTypeSelect: (value: string) => void;
}

const Step1PersonalInfo: React.FC<Step1Props> = ({
  formData,
  errors,
  isLive,
  showCountryPicker,
  showBusinessTypeModal,
  onInputChange,
  onShowCountryPicker,
  onShowBusinessTypeModal,
  onCountrySelect,
  onBusinessTypeSelect,
}) => {
  return (
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
            onChangeText={text => onInputChange('developerName', text)}
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
            onChangeText={text => onInputChange('developerEmail', text)}
            placeholder="name@company.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {errors.developerEmail && (
          <Text style={styles.errorText}>{errors.developerEmail}</Text>
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
            onChangeText={text => onInputChange('companyName', text)}
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
          onPress={() => onShowBusinessTypeModal(true)}
        >
          <Icon name="work" size={20} color="#6366F1" />
          <Text
            style={[
              styles.pickerButtonText,
              !formData.businessType && styles.pickerButtonPlaceholder,
            ]}
          >
            {formData.businessType || 'Select business type'}
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
          onPress={() => onShowCountryPicker(true)}
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
          onSelect={onCountrySelect}
          onClose={() => onShowCountryPicker(false)}
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
                onChangeText={text => onInputChange('website', text)}
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
                onChangeText={text => onInputChange('phone', text)}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24 },
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
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 6 },
});

export default Step1PersonalInfo;

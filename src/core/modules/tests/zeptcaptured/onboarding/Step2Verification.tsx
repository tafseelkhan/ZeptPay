// components/onboarding/Step2Verification.tsx
import React from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import CountryPicker from 'react-native-country-picker-modal';
import { getCountryCode } from '../../../services/zeptcaptured/developerService';
import { ImageData } from '../../../../utils/tests/zeptcaptured/developerUtils';

interface Step2Props {
  formData: any;
  isLive: boolean;
  showNationalityPicker: boolean;
  onInputChange: (field: string, value: any) => void;
  onShowNationalityPicker: (show: boolean) => void;
  onNationalitySelect: (country: any) => void;
  onPickImage: (fieldName: string) => void;
  onTakeSelfie: () => void;
}

const Step2Verification: React.FC<Step2Props> = ({
  formData,
  isLive,
  showNationalityPicker,
  onInputChange,
  onShowNationalityPicker,
  onNationalitySelect,
  onPickImage,
  onTakeSelfie,
}) => {
  const renderUploadSection = (
    label: string,
    field: string,
    isSelfie: boolean = false,
    subText?: string,
  ) => (
    <View style={styles.uploadSection}>
      <Text style={styles.label}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      {subText && <Text style={styles.subLabel}>{subText}</Text>}
      {formData[field] ? (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: (formData[field] as ImageData).uri }}
            style={styles.previewImage}
          />
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => (isSelfie ? onTakeSelfie() : onPickImage(field))}
          >
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onInputChange(field, null)}
          >
            <Icon name="close" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => (isSelfie ? onTakeSelfie() : onPickImage(field))}
        >
          <Icon name="cloud-upload" size={24} color="#6366F1" />
          <Text style={styles.uploadButtonText}>Upload {label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
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

      {renderUploadSection(
        'Company Logo',
        'logo',
        false,
        'Company logo for branding',
      )}
      {renderUploadSection(
        'Identity Proof',
        'identityProof',
        false,
        "Passport / Driver's License / National ID",
      )}
      {renderUploadSection(
        'Selfie',
        'selfie',
        true,
        'Take a selfie holding your ID',
      )}
      {renderUploadSection(
        'Address Proof',
        'addressProof',
        false,
        'Utility bill / Bank statement / Rental agreement',
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nationality</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => onShowNationalityPicker(true)}
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
          onSelect={onNationalitySelect}
          onClose={() => onShowNationalityPicker(false)}
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
                onChangeText={text => onInputChange('taxId', text)}
                placeholder="Tax Identification Number"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Registration Number (Optional)</Text>
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
                onChangeText={text => onInputChange('registrationNumber', text)}
                placeholder="Company Registration Number"
                placeholderTextColor="#94A3B8"
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
  subLabel: { fontSize: 12, color: '#64748B', marginBottom: 10 },
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
  uploadSection: { marginBottom: 24 },
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
});

export default Step2Verification;

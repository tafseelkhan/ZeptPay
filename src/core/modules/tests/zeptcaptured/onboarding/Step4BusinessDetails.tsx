// components/onboarding/Step4BusinessDetails.tsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { BUSINESS_CATEGORIES } from '../../../../utils/tests/zeptcaptured/developerUtils';

interface Step4Props {
  formData: any;
  isLive: boolean;
  showBusinessCategoryModal: boolean;
  onInputChange: (field: string, value: any) => void;
  onShowBusinessCategoryModal: (show: boolean) => void;
  onBusinessCategorySelect: (value: string) => void;
}

const Step4BusinessDetails: React.FC<Step4Props> = ({
  formData,
  isLive,
  showBusinessCategoryModal,
  onInputChange,
  onShowBusinessCategoryModal,
  onBusinessCategorySelect,
}) => {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <LinearGradient
          colors={['#10B981', '#14B8A6']}
          style={styles.stepIconGradient}
        >
          <Icon name="apps" size={24} color="#fff" />
        </LinearGradient>
        <Text style={styles.stepTitle}>App & Payment Information</Text>
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
            onChangeText={text => onInputChange('appName', text)}
            placeholder={isLive ? 'Your app name' : 'App name (Optional)'}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          App Store URL {isLive && <Text style={styles.required}>*</Text>}
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
            onChangeText={text => onInputChange('appStoreUrl', text)}
            placeholder={
              isLive ? 'https://apps.apple.com/app/id...' : 'App URL (Optional)'
            }
            placeholderTextColor="#94A3B8"
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Business Category {isLive && <Text style={styles.required}>*</Text>}
        </Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => onShowBusinessCategoryModal(true)}
        >
          <Icon name="widgets" size={20} color="#6366F1" />
          <Text
            style={[
              styles.pickerButtonText,
              !formData.businessCategory && styles.pickerButtonPlaceholder,
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
                onValueChange={value => onInputChange('termsAccepted', value)}
                trackColor={{ false: '#E2E8F0', true: '#6366F1' }}
                thumbColor={Platform.OS === 'android' ? '#fff' : ''}
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
                  onInputChange('internationalPaymentsAccepted', value)
                }
                trackColor={{ false: '#E2E8F0', true: '#6366F1' }}
                thumbColor={Platform.OS === 'android' ? '#fff' : ''}
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
            onChangeText={text => onInputChange('notes', text)}
            placeholder="Any additional information"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>
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
});

export default Step4BusinessDetails;

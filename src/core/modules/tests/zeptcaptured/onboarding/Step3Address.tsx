// components/onboarding/Step3Address.tsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

interface Step3Props {
  formData: any;
  onInputChange: (field: string, value: any) => void;
  onOpenAddressModal: (type: 'business' | 'home') => void;
}

const Step3Address: React.FC<Step3Props> = ({
  formData,
  onInputChange,
  onOpenAddressModal,
}) => {
  return (
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
            onPress={() => onOpenAddressModal('business')}
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
            onChangeText={text => onInputChange('businessAddress', text)}
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
            onPress={() => onOpenAddressModal('home')}
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
            onChangeText={text => onInputChange('homeAddress', text)}
            placeholder="Full home address"
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
  required: { color: '#EF4444' },
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
});

export default Step3Address;

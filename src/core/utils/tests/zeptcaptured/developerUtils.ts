// utils/developerUtils.ts
import { PermissionsAndroid, Platform } from 'react-native';
import { ImageLibraryOptions, CameraOptions } from 'react-native-image-picker';

export interface ImageData {
  uri: string;
  base64: string;
  type: string;
  name: string;
}

export const BUSINESS_TYPES = [
  { label: 'Select business type', value: '' },
  { label: 'Individual', value: 'Individual' },
  { label: 'Company', value: 'Company' },
  { label: 'LLP', value: 'LLP' },
  { label: 'Private Ltd', value: 'Private Ltd' },
  { label: 'Public Ltd', value: 'Public Ltd' },
  { label: 'Partnership', value: 'Partnership' },
  { label: 'Sole Proprietorship', value: 'Sole Proprietorship' },
];

export const BUSINESS_CATEGORIES = [
  { label: 'Select category', value: '' },
  { label: 'E-commerce', value: 'ecommerce' },
  { label: 'SaaS', value: 'saas' },
  { label: 'FinTech', value: 'fintech' },
  { label: 'Gaming', value: 'gaming' },
  { label: 'Education', value: 'education' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Entertainment', value: 'entertainment' },
];

// ✅ Request Storage Permission
export const requestStoragePermission = async (): Promise<boolean> => {
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

// ✅ Request Camera Permission
export const requestCameraPermission = async (): Promise<boolean> => {
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

// ✅ Get Image Picker Options
export const getImagePickerOptions = (): ImageLibraryOptions => ({
  mediaType: 'photo',
  includeBase64: true,
  quality: 0.5,
});

// ✅ Get Camera Options
export const getCameraOptions = (): CameraOptions => ({
  mediaType: 'photo',
  includeBase64: true,
  quality: 0.5,
  saveToPhotos: false,
});

// ✅ Create Image Data Object
export const createImageData = (asset: any): ImageData => ({
  uri: asset.uri || '',
  base64: asset.base64 || '',
  type: asset.type || 'image/jpeg',
  name: `image_${Date.now()}.jpg`,
});

// ✅ Validate Step 1 (Personal Info)
export const validateStep1 = (formData: any, isLive: boolean) => {
  const requiredFields = [
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

  return isValid;
};

// ✅ Validate Step 2 (Documents)
export const validateStep2 = (formData: any) => {
  const requiredFields = ['logo', 'identityProof', 'selfie', 'addressProof'];
  const hasAllImages = requiredFields.every(field => formData[field] !== null);
  return hasAllImages;
};

// ✅ Validate Step 3 (Address)
export const validateStep3 = (formData: any) => {
  const businessAddressValid = formData.businessAddress?.trim().length > 0;
  const homeAddressValid = formData.homeAddress?.trim().length > 0;
  return businessAddressValid && homeAddressValid;
};

// ✅ Validate Step 4 (Business Details)
export const validateStep4 = (formData: any, isLive: boolean) => {
  if (!isLive) return true;
  return formData.termsAccepted && formData.internationalPaymentsAccepted;
};

// ✅ Get Step Title
export const getStepTitle = (step: number): string => {
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

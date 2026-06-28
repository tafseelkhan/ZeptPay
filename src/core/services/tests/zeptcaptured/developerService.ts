// services/developer/developerService.ts
import {
  submitDeveloperAppAPI,
  searchPlacesAPI,
  getPlaceDetailsAPI,
  DeveloperFormData,
} from '../../../../api/tests/features/private/zeptcapturePrivateSlice';
import { getUserDataAPI } from '../../../../api/tests/features/private/userdataPrivateSlice';
import { CountryCode } from 'react-native-country-picker-modal';
import { Platform } from 'react-native';

// ✅ Get User Data Service
export const fetchUserData = async () => {
  try {
    const response = await getUserDataAPI();
    if (response?.success && response.user) {
      return { success: true, user: response.user };
    }
    return { success: false, error: 'No user data found' };
  } catch (error: any) {
    console.error(
      'Error fetching user:',
      error.response?.data || error.message,
    );
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch user data',
    };
  }
};

// ✅ Submit Developer Application Service
export const submitDeveloperApp = async (
  formData: DeveloperFormData,
  isLive: boolean,
) => {
  try {
    const submissionData = {
      ...formData,
      metadata: {
        mode: isLive ? 'live' : 'test',
        submittedAt: new Date().toISOString(),
        platform: Platform.OS,
        userId: formData.metadata?.userId,
      },
    };

    const response = await submitDeveloperAppAPI(submissionData);
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Submission error:', error.response?.data || error.message);
    let errorMessage = 'Network error. Please check your connection.';

    if (error.response) {
      errorMessage = error.response.data?.message || 'Server error occurred';
    } else if (error.request) {
      errorMessage = 'No response from server. Please try again.';
    }

    return { success: false, error: errorMessage };
  }
};

// ✅ Search Address Service
export const searchAddress = async (query: string) => {
  try {
    if (query.length < 2) return [];
    const predictions = await searchPlacesAPI(query);
    return predictions;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

// ✅ Get Address Details Service
export const getAddressDetails = async (placeId: string) => {
  try {
    const address = await getPlaceDetailsAPI(placeId);
    return address;
  } catch (error) {
    console.error('Place details error:', error);
    throw error;
  }
};

// ✅ Validate Email Format
export const validateEmail = (
  email: string,
  isLive: boolean = false,
): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }

  if (isLive) {
    const businessEmailRegex =
      /@(?!gmail|yahoo|hotmail|outlook)[a-zA-Z0-9.-]+\.(com|in|org|net)$/i;
    if (!businessEmailRegex.test(email)) {
      return 'Please use a business email';
    }
  }

  return null;
};

// ✅ Fix: Return proper CountryCode type
export const getCountryCode = (countryName: string): CountryCode => {
  if (!countryName) return 'IN';

  const countryMap: Record<string, CountryCode> = {
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

  // Try to find by partial match
  const found = Object.entries(countryMap).find(
    ([name]) =>
      countryName.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(countryName.toLowerCase()),
  );

  return found ? found[1] : 'IN';
};

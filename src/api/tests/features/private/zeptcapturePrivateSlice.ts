// services/api/developerApi.ts
import axios from 'axios';
import { Config } from 'react-native-config';
import { API_BASE_URL } from '../../connections/snippet/apiBaseUrl';
import { API_ENDPOINTS } from '../../connections/snippet/apiEndpoints';
import { getToken } from '../../connections/token/tokenSlice';
import { GOOGLE_API_KEY, MAPS_BASE_URL } from '../../constants/mapConfig';

export interface DeveloperFormData {
  developerName: string;
  developerEmail: string;
  companyName: string;
  businessType: string;
  website?: string;
  phone?: string;
  logoUrl?: string;
  country: string;
  taxId?: string;
  registrationNumber?: string;
  identityProofUrl?: string;
  selfieUrl?: string;
  addressProofUrl?: string;
  nationality?: string;
  dob?: Date | null;
  businessAddress?: string;
  homeAddress?: string;
  appName?: string;
  appStoreUrl?: string;
  businessCategory?: string;
  termsAccepted: boolean;
  internationalPaymentsAccepted: boolean;
  notes?: string;
  zeptCapturedEnabled: boolean;
  zeptCapturedPurpose?: string;
  metadata?: {
    mode: string;
    submittedAt: string;
    platform: string;
    userId?: string;
  };
}

export interface Prediction {
  place_id: string;
  description: string;
}

// ✅ Submit Developer Application
export const submitDeveloperAppAPI = async (
  data: DeveloperFormData,
): Promise<any> => {
  const token = await getToken();
  const response = await axios.post(
    `${API_BASE_URL}${API_ENDPOINTS.DEVELOPER_APPLICATION}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    },
  );
  return response.data;
};

// ✅ Google Places Search
export const searchPlacesAPI = async (query: string): Promise<Prediction[]> => {
  const response = await axios.get(`${MAPS_BASE_URL}/place/autocomplete/json`, {
    params: {
      input: query,
      key: GOOGLE_API_KEY,
      types: 'geocode',
      language: 'en',
    },
  });
  return response.data.predictions || [];
};

// ✅ Get Place Details
export const getPlaceDetailsAPI = async (placeId: string): Promise<string> => {
  const response = await axios.get(`${MAPS_BASE_URL}/place/details/json`, {
    params: {
      place_id: placeId,
      key: GOOGLE_API_KEY,
      fields: 'formatted_address',
    },
  });
  return response.data.result?.formatted_address || '';
};

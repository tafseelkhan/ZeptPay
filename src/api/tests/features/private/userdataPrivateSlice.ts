import axios from 'axios';
import { API_BASE_URL } from '../../connections/snippet/apiBaseUrl';
import { API_ENDPOINTS } from '../../connections/snippet/apiEndpoints';
import { getToken } from '../../connections/token/tokenSlice';

export interface UserResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string;
    country: string;
    balance: number;
    avatar?: string;
    isLive: boolean;
    isDeveloper?: boolean;
  };
}

// ✅ Get User Data
export const getUserDataAPI = async (): Promise<UserResponse> => {
  const token = getToken();
  const response = await axios.get(
    `${API_BASE_URL}${API_ENDPOINTS.USER_DATA}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data;
};

// Fetch user information
export const fetchUserInfo = async (): Promise<any> => {
  try {
    console.log('📡 Fetching user info...');
    const token = await getToken();
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.USER_INFO}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

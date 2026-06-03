import axios from 'axios';
import { API_ENDPOINTS } from '../../connections/snippet/apiEndpoints';
import { API_BASE_URL } from '../../connections/snippet/apiBaseUrl';
import { getToken } from '../../connections/token/tokenSlice';

export interface VerifyTokenResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    isDeveloper: boolean;
    name?: string;
  };
}

/**
 * Verify user token with backend
 */
export const verifyToken = async (): Promise<VerifyTokenResponse> => {
  try {
    const token = await getToken();
    console.log('📦 Token being sent to backend:', token);

    if (!token) {
      console.warn('⚠️ No token found before API call!');
      return { success: false };
    }

    const res = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.AUTH_CHECK}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ Token verification response:', res.data);
    return {
      success: res.data.success,
      user: res.data.user,
    };
  } catch (error: any) {
    console.error(
      '❌ Token verification failed:',
      error?.response?.data || error,
    );
    return { success: false };
  }
};

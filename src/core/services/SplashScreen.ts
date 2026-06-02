import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - tu apni URL daal dena
const API_BASE_URL = 'http://172.20.10.12:7000/api';

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
export const verifyToken = async (token: string): Promise<VerifyTokenResponse> => {
  try {
    console.log("📦 Token being sent to backend:", token);

    if (!token) {
      console.warn("⚠️ No token found before API call!");
      return { success: false };
    }

    const res = await axios.get(`${API_BASE_URL}/auth/check`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ Token verification response:", res.data);
    return { 
      success: res.data.success, 
      user: res.data.user 
    };
  } catch (error: any) {
    console.error("❌ Token verification failed:", error?.response?.data || error);
    return { success: false };
  }
};

/**
 * Get stored token from AsyncStorage
 */
export const getStoredToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    console.log('🔍 Token found in storage:', token ? 'Yes' : 'No');
    return token;
  } catch (error) {
    console.error('❌ Error getting token from storage:', error);
    return null;
  }
};

/**
 * Clear session (logout)
 */
export const clearSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('authToken');
    console.log('🗑️ Session cleared');
  } catch (error) {
    console.error('❌ Error clearing session:', error);
  }
};

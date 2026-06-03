// api/apiKeysApi.ts
import axios from 'axios';
import { API_BASE_URL } from '../../connections/snippet/apiBaseUrl';
import { API_ENDPOINTS } from '../../connections/snippet/apiEndpoints';
import { getToken } from '../../connections/token/tokenSlice';

// Fetch user API keys
export const fetchUserApiKeys = async () => {
  const token = await getToken();
  try {
    console.log('📡 Sending API request...');
    console.log('URL:', `${API_BASE_URL}${API_ENDPOINTS.API_KEYS_USER}`);

    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.API_KEYS_USER}`,
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
    if (error.response) {
      throw {
        status: error.response.status,
        message:
          error.response.data?.message || `Error ${error.response.status}`,
      };
    } else if (error.request) {
      throw {
        status: 0,
        message:
          'Cannot connect to server. Please check your internet connection.',
      };
    } else {
      throw {
        status: 0,
        message: error.message || 'An unexpected error occurred.',
      };
    }
  }
};

// Toggle API Key status
export const toggleApiKeyStatus = async (
  apiKeyId: string,
  currentStatus: boolean,
) => {
  const token = await getToken();
  try {
    const response = await axios.patch(
      `${API_BASE_URL}${API_ENDPOINTS.API_KEY_TOGGLE(apiKeyId)}`,
      { isActive: !currentStatus },
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
    if (error.response) {
      throw {
        status: error.response.status,
        message:
          error.response.data?.message || `Error ${error.response.status}`,
      };
    } else if (error.request) {
      throw {
        status: 0,
        message:
          'Cannot connect to server. Please check your internet connection.',
      };
    } else {
      throw {
        status: 0,
        message: error.message || 'An unexpected error occurred.',
      };
    }
  }
};

// Toggle Permission
export const togglePermission = async (
  apiKeyId: string,
  permissionPath: string,
  currentValue: boolean,
) => {
  const token = await getToken();
  try {
    console.log('🔄 Toggling permission:', permissionPath);
    console.log('Current value:', currentValue);
    console.log(
      'URL:',
      `${API_BASE_URL}${API_ENDPOINTS.API_KEY_PERMISSION_TOGGLE(apiKeyId)}`,
    );

    const updatePayload: any = {};
    const pathParts = permissionPath.split('.');

    let current = updatePayload;
    for (let i = 0; i < pathParts.length - 1; i++) {
      current[pathParts[i]] = {};
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = !currentValue;

    const response = await axios.patch(
      `${API_BASE_URL}${API_ENDPOINTS.API_KEY_PERMISSION_TOGGLE(apiKeyId)}`,
      updatePayload,
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
    if (error.response) {
      throw {
        status: error.response.status,
        message:
          error.response.data?.message || `Error ${error.response.status}`,
      };
    } else if (error.request) {
      throw {
        status: 0,
        message:
          'Cannot connect to server. Please check your internet connection.',
      };
    } else {
      throw {
        status: 0,
        message: error.message || 'An unexpected error occurred.',
      };
    }
  }
};

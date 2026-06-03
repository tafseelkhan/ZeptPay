// services/apiKeysService.ts
import { ApiKey, ApiKeysResponse } from '../../../types/DeveloperType';
import {
  fetchUserApiKeys,
  toggleApiKeyStatus,
  togglePermission,
} from '../../../../api/tests/features/private/developerApiKeyPrivateSlice';

export interface FetchApiKeysResult {
  success: boolean;
  data?: ApiKeysResponse;
  error?: string;
  status?: number;
}

// Fetch all API keys data
export const fetchAllApiKeys = async (): Promise<FetchApiKeysResult> => {
  try {
    const data = await fetchUserApiKeys();
    return {
      success: true,
      data: data,
    };
  } catch (err: any) {
    console.error('Fetch error:', err);

    let errorMessage = 'Failed to load API keys.';
    let statusCode = err.status;

    if (err.status === 401) {
      errorMessage = 'Session expired. Please login again.';
    } else if (err.status === 404) {
      errorMessage = 'API endpoint not found. Please check the server.';
    } else if (err.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (err.message) {
      errorMessage = err.message;
    }

    return {
      success: false,
      error: errorMessage,
      status: statusCode,
    };
  }
};

// Toggle API key status
export const toggleApiKey = async (
  apiKeyId: string,
  currentStatus: boolean,
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await toggleApiKeyStatus(apiKeyId, currentStatus);

    return {
      success: true,
      message:
        response?.message ||
        `API key has been ${
          !currentStatus ? 'activated' : 'deactivated'
        } successfully.`,
    };
  } catch (err: any) {
    console.error('Toggle error:', err);

    let errorMessage = 'Failed to toggle API key status.';

    if (err.status === 400) {
      errorMessage = 'Invalid request. Please check the parameters.';
    } else if (err.status === 401) {
      errorMessage = 'Session expired. Please login again.';
    } else if (err.status === 404) {
      errorMessage = 'API key not found.';
    } else if (err.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (err.message) {
      errorMessage = err.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Toggle permission
export const toggleApiKeyPermission = async (
  apiKeyId: string,
  permissionPath: string,
  currentValue: boolean,
): Promise<{ success: boolean; error?: string }> => {
  try {

    await togglePermission(apiKeyId, permissionPath, currentValue);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Permission toggle error:', error);
    return {
      success: false,
      error: 'Failed to toggle permission. Please try again.',
    };
  }
};

// Get other active keys count for same mode
export const getOtherActiveKeysCount = (
  keys: ApiKey[],
  currentKeyId: string,
  mode: 'test' | 'live',
): number => {
  return keys.filter(k => k._id !== currentKeyId && k.mode === mode && k.isActive)
    .length;
};

// Format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Mask sensitive keys
export const maskKey = (key: string): string => {
  if (!key) return '';
  const parts = key.split('_');
  if (parts.length > 2) {
    return `${parts[0]}_${parts[1]}_••••${parts[parts.length - 1].slice(-6)}`;
  }
  return key;
};

// Get mode color
export const getModeColor = (mode: 'test' | 'live'): string => {
  return mode === 'live' ? '#EF4444' : '#10B981';
};

// Get status color
export const getStatusColor = (isActive: boolean): string => {
  return isActive ? '#10B981' : '#6B7280';
};

// Get permission icon based on payment method
export const getPaymentMethodIcon = (method: string): string => {
  const icons: Record<string, string> = {
    card: 'credit-card',
    zeptpay: 'payments',
    upi: 'qrcode',
    netBanking: 'university',
    wallet: 'wallet',
    autopay: 'autorenew',
    banktransfer: 'exchange-alt',
    qrpayment: 'qrcode-scan',
  };
  return icons[method] || 'circle';
};

// Get payment method description
export const getPaymentMethodDescription = (method: string): string => {
  const descriptions: Record<string, string> = {
    card: 'Credit/Debit card payments',
    zeptpay: 'AirX Pay wallet',
    upi: 'UPI payments',
    netBanking: 'Net banking',
    wallet: 'Digital wallet',
    autopay: 'Recurring payments',
    banktransfer: 'Bank transfers',
    qrpayment: 'QR code payments',
  };
  return descriptions[method] || `${method} payments`;
};
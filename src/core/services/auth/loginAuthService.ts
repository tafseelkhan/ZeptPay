// services/auth/authService.ts
import {
  loginAPI,
  verifyOTPLoginAPI,
  resendOTPLoginAPI,
  LoginData,
  saveLoginAuthData,
  VerifyOTPData,
} from '../../../api/tests/features/private/authPrivateSlice';

// ✅ Login Service
export const handleLogin = async (
  data: LoginData,
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await loginAPI(data);
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);

    // Check if user not found
    if (error.response?.data?.message?.includes('not found')) {
      return {
        success: false,
        error: 'USER_NOT_FOUND',
        data: { message: error.response.data.message },
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || 'Login failed',
    };
  }
};

// ✅ Verify OTP Service
export const handleVerifyOTPLogin = async (
  phone: string,
  otp: string,
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await verifyOTPLoginAPI({ phone, otp });

    // Save token and user data
    await saveLoginAuthData(response.token);

    return { success: true, data: response };
  } catch (error: any) {
    console.error('Verify OTP error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'OTP verification failed',
    };
  }
};

// ✅ Resend OTP Service
export const handleResendOTPLogin = async (
  phone: string,
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await resendOTPLoginAPI({ phone });
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Resend OTP error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to resend OTP',
    };
  }
};

// ✅ API Error Handler
export const handleApiError = (error: any, defaultMessage: string): string => {
  console.error('API Error:', error.response?.data || error.message);

  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message.includes('Network Error')) {
    return 'Network error. Please check your connection.';
  } else if (error.message.includes('timeout')) {
    return 'Request timeout. Please try again.';
  }

  return defaultMessage;
};

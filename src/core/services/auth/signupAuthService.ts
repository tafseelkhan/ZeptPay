// services/authService.ts
import {
  signupAPI,
  verifyOTPAPI,
  resendOTPAPI,
  SignupData,
  saveSignupAuthData,
} from '../../../api/tests/features/private/authPrivateSlice';

export const handleSignup = async (
  data: SignupData,
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await signupAPI(data);
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Signup error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Signup failed',
    };
  }
};

export const handleVerifyOTP = async (
  phone: string,
  otp: string,
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await verifyOTPAPI({ phone, otp });
    await saveSignupAuthData(response.token);
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Verify error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'OTP verification failed',
    };
  }
};

export const handleResendOTP = async (
  phone: string,
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await resendOTPAPI({ phone });
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Resend error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to resend OTP',
    };
  }
};

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

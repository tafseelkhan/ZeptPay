import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../../connections/snippet/apiBaseUrl';
import { API_ENDPOINTS } from '../../connections/snippet/apiEndpoints';
import { setToken } from '../../connections/token/tokenSlice';

export interface SignupData {
  name: string;
  phone: string;
  country: string;
  isDeveloper: boolean;
}

export interface SignupResponse {
  message: string;
  otp?: string;
}

export interface VerifyOTPData {
  phone: string;
  otp: string;
}

export interface VerifyOTPResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    phone: string;
    country: string;
    isDeveloper: boolean;
    balance: number;
    isLive: boolean;
  };
}

export interface ResendOTPData {
  phone: string;
}

// Login API

export interface LoginData {
  phone: string;
}

export interface LoginResponse {
  message: string;
}

export interface VerifyOTPData {
  phone: string;
  otp: string;
}

export interface ResendOTPData {
  phone: string;
}

export const signupAPI = async (data: SignupData): Promise<SignupResponse> => {
  const response = await axios.post<SignupResponse>(
    `${API_BASE_URL}${API_ENDPOINTS.SIGNUP}`,
    data,
  );
  return response.data;
};

export const verifyOTPAPI = async (
  data: VerifyOTPData,
): Promise<VerifyOTPResponse> => {
  const response = await axios.post<VerifyOTPResponse>(
    `${API_BASE_URL}${API_ENDPOINTS.VERIFY_OTP_SIGNUP}`,
    data,
  );
  return response.data;
};

export const resendOTPAPI = async (
  data: ResendOTPData,
): Promise<{ message: string; otp?: string }> => {
  const response = await axios.post(
    `${API_BASE_URL}${API_ENDPOINTS.RESEND_OTP_SIGNUP}`,
    data,
  );
  return response.data;
};

// ✅ Login API - Send OTP
export const loginAPI = async (data: LoginData): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(
    `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`,
    data,
  );
  return response.data;
};

// ✅ Verify OTP API
export const verifyOTPLoginAPI = async (
  data: VerifyOTPData,
): Promise<VerifyOTPResponse> => {
  const response = await axios.post<VerifyOTPResponse>(
    `${API_BASE_URL}${API_ENDPOINTS.VERIFY_OTP_LOGIN}`,
    data,
  );
  return response.data;
};

// ✅ Resend OTP API
export const resendOTPLoginAPI = async (
  data: ResendOTPData,
): Promise<{ message: string }> => {
  const response = await axios.post(
    `${API_BASE_URL}${API_ENDPOINTS.RESEND_OTP_LOGIN}`,
    data,
  );
  return response.data;
};

export const saveSignupAuthData = async (token: string): Promise<void> => {
  try {
    await setToken(token);

    console.log('✅ Auth data saved successfully');
  } catch (error) {
    console.error('❌ Error saving auth data:', error);
    throw error;
  }
};

export const saveLoginAuthData = async (token: string): Promise<void> => {
  try {
    await setToken(token);
    console.log('✅ Auth data saved successfully');
  } catch (error) {
    console.error('❌ Error saving auth data:', error);
    throw error;
  }
};

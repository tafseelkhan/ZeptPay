// utils/phoneUtils.ts

// Phone Formatter - NO SPACE (matches backend storage)
export const formatPhoneForAPI = (
  callingCode: string,
  phoneNumber: string,
): string => {
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  const code = callingCode.replace('+', '');
  // Send WITHOUT space: +919983141558
  return `+${code}${cleanedNumber}`;
};

// Format phone for display (WITH space)
export const formatPhoneForDisplay = (
  callingCode: string,
  phoneNumber: string,
): string => {
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  const code = callingCode.replace('+', '');
  return `+${code} ${cleanedNumber}`;
};

// Validate phone number
export const validatePhoneNumber = (phone: string): boolean => {
  return /^\d{10,}$/.test(phone.replace(/\D/g, ''));
};

// Validate OTP
export const validateOTP = (otp: string[]): boolean => {
  return otp.length === 6 && otp.every(digit => digit !== '');
};

// Clean phone number (remove non-digits)
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

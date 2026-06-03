// utils/phoneUtils.ts

// ✅ Format phone for API - NO SPACE
export const formatPhoneForAPI = (
  callingCode: string,
  phoneNumber: string,
): string => {
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  const code = callingCode.replace('+', '');
  return `+${code}${cleanedNumber}`;
};

// ✅ Format phone for display - WITH space
export const formatPhoneForDisplay = (
  callingCode: string,
  phoneNumber: string,
): string => {
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  const code = callingCode.replace('+', '');
  return `+${code} ${cleanedNumber}`;
};

// ✅ Validate Phone Number
export const validatePhoneNumber = (
  phone: string,
  callingCode: string = '91',
): boolean => {
  const cleanedNumber = phone.replace(/\D/g, '');

  if (callingCode === '91') {
    // Indian numbers: 10 digits
    return /^\d{10}$/.test(cleanedNumber);
  }

  // International numbers: minimum 7 digits, maximum 15 digits
  return /^\d{7,15}$/.test(cleanedNumber);
};

// ✅ Validate OTP
export const validateOTP = (otp: string[]): boolean => {
  return otp.length === 6 && otp.every(digit => digit !== '');
};

// ✅ Clean Phone Number (remove non-digits)
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

// ✅ Get Validation Error Message
export const getPhoneValidationError = (
  phone: string,
  callingCode: string = '91',
): string | null => {
  const cleanedNumber = phone.replace(/\D/g, '');

  if (!phone.trim()) {
    return 'Phone number is required';
  }

  if (callingCode === '91' && cleanedNumber.length !== 10) {
    return 'Enter valid 10-digit phone number';
  }

  if (
    callingCode !== '91' &&
    (cleanedNumber.length < 7 || cleanedNumber.length > 15)
  ) {
    return `Enter valid ${
      cleanedNumber.length < 7 ? 'minimum 7' : 'maximum 15'
    } digit phone number`;
  }

  return null;
};

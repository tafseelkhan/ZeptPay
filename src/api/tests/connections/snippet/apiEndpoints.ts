/**
 * Copyright (c) 2026-present, TizzyGo, Inc. and its affiliates.
 * All rights reserved.
 */

export const API_ENDPOINTS = {
  // Verify User endpoints
  AUTH_CHECK: '/auth/check',

  // Auth endpoints
  SIGNUP: '/auth/signup',
  VERIFY_OTP_SIGNUP: '/auth/verify-otp-signup',
  RESEND_OTP_SIGNUP: '/auth/resend-otp-signup',
  LOGIN: '/auth/login',
  VERIFY_OTP_LOGIN: '/auth/verify-otp-login',
  RESEND_OTP_LOGIN: '/auth/resend-otp-login',

  // User endpoints
  USER_DATA: '/api/auth/user',
  USER_INFO: '/api/test-live/api-keys/user',

  // ZeptCaptured endpoints
  DEVELOPER_APPLICATION: '/api/developer/create',

  // Webhooks endpoints
  WEBHOOK_ME: '/api/webhook/core/me',
  WEBHOOK_EVENTS: '/api/webhook/core/events',
  WEBHOOK_CREATE: '/api/webhook/core/create',
  WEBHOOK_UPDATE: '/api/webhook/core/update',
  WEBHOOK_STATUS: '/api/webhook/core/status',

  // Developer API Keys endpoints
  API_KEYS_USER: '/api/test-live/api-keys/user',
  API_KEY_TOGGLE: (apiKeyId: string) =>
    `/api/test-live/api-keys/${apiKeyId}/toggle`,
  API_KEY_PERMISSION_TOGGLE: (apiKeyId: string) =>
    `/api/test-live/api-keys/${apiKeyId}/permissions`,
};

/**
 * @API_ENDPOINTS contains the API endpoint paths used in the application.
 */

/**
 */

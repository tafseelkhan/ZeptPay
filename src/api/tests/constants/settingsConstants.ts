// src/services/zeptpay/settings/constants/settingsConstants.ts

export const APP_VERSION = '0.0.0';
export const BUILD_NUMBER = '0';
export const COPYRIGHT_YEAR = '2026';
export const APP_NAME = 'ZeptPay';

export const SETTINGS_SECTIONS = {
  ACCOUNT: 'Account',
  APPEARANCE: 'Appearance',
  NOTIFICATIONS: 'Notifications',
  DATA_STORAGE: 'Data & Storage',
  PRIVACY_SECURITY: 'Privacy & Security',
  SUPPORT: 'Support',
} as const;

export const SETTING_ITEMS = {
  EDIT_PROFILE: 'Edit Profile',
  SECURITY: 'Security',
  PRIVACY: 'Privacy',
  BIOMETRIC: 'Biometric Login',
  DARK_MODE: 'Dark Mode',
  THEME_COLOR: 'Theme Color',
  FONT_SIZE: 'Font Size',
  PUSH_NOTIFICATIONS: 'Push Notifications',
  EMAIL_ALERTS: 'Email Alerts',
  SOUND: 'Sound',
  VIBRATION: 'Vibration',
  AUTO_SYNC: 'Auto Sync',
  AUTO_SAVE: 'Auto Save',
  DATA_SAVER: 'Data Saver',
  CLEAR_CACHE: 'Clear Cache',
  LOCATION_SERVICES: 'Location Services',
  PRIVACY_MODE: 'Privacy Mode',
  AUTO_PLAY: 'Auto-Play Media',
  ACTIVITY_STATUS: 'Activity Status',
  HELP_CENTER: 'Help Center',
  CONTACT_US: 'Contact Us',
  RATE_APP: 'Rate App',
  ABOUT: 'About',
  AIR_CAPTURE: 'AirCapture',
  WEBHOOK: 'Webhook',
  SHARE_APP: 'Share App',
  FEEDBACK: 'Feedback',
} as const;

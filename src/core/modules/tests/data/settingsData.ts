// src/services/zeptpay/settings/data/settingsData.ts
import { SettingSectionType } from '../../../utils/tests/settings/settingsUtils';
import {
  SETTINGS_SECTIONS,
  SETTING_ITEMS,
} from '../../../../api/tests/constants/settingsConstants';

export const getSettingsOptions = (handlers: {
  handleNavigation: (screenName: string) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  emailAlerts: boolean;
  setEmailAlerts: (value: boolean) => void;
  sound: boolean;
  setSound: (value: boolean) => void;
  vibration: boolean;
  setVibration: (value: boolean) => void;
  sync: boolean;
  setSync: (value: boolean) => void;
  autoSave: boolean;
  setAutoSave: (value: boolean) => void;
  dataSaver: boolean;
  setDataSaver: (value: boolean) => void;
  location: boolean;
  setLocation: (value: boolean) => void;
  privacyMode: boolean;
  setPrivacyMode: (value: boolean) => void;
  autoPlay: boolean;
  setAutoPlay: (value: boolean) => void;
  biometric: boolean;
  setBiometric: (value: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}): SettingSectionType[] => {
  return [
    {
      title: SETTINGS_SECTIONS.ACCOUNT,
      icon: 'person',
      items: [
        {
          name: SETTING_ITEMS.EDIT_PROFILE,
          icon: 'person-circle',
          type: 'navigation',
          description: 'Update your personal information',
          premium: false,
          screenName: 'EditProfile',
          onPress: () => handlers.handleNavigation('EditProfile'),
        },
        {
          name: SETTING_ITEMS.SECURITY,
          icon: 'shield-checkmark',
          type: 'navigation',
          description: 'Two-factor authentication & password',
          badge: 'Secure',
          premium: false,
          screenName: 'Security',
          onPress: () => handlers.handleNavigation('Security'),
        },
        {
          name: SETTING_ITEMS.PRIVACY,
          icon: 'lock-closed',
          type: 'navigation',
          description: 'Control your data & visibility',
          premium: false,
          screenName: 'Privacy',
          onPress: () => handlers.handleNavigation('Privacy'),
        },
        {
          name: SETTING_ITEMS.BIOMETRIC,
          icon: 'finger-print',
          type: 'toggle',
          description: 'Use fingerprint or face ID',
          value: handlers.biometric,
          premium: true,
          onValueChange: handlers.setBiometric,
        },
      ],
    },
    {
      title: SETTINGS_SECTIONS.APPEARANCE,
      icon: 'color-palette',
      items: [
        {
          name: SETTING_ITEMS.DARK_MODE,
          icon: 'moon',
          type: 'toggle',
          description: 'Switch between light and dark theme',
          value: handlers.isDarkMode,
          onValueChange: handlers.setIsDarkMode,
        },
        {
          name: SETTING_ITEMS.THEME_COLOR,
          icon: 'brush',
          type: 'navigation',
          description: 'Choose your accent color',
          badge: 'Blue',
          screenName: 'Theme',
          onPress: () => handlers.handleNavigation('Theme'),
        },
        {
          name: SETTING_ITEMS.FONT_SIZE,
          icon: 'text',
          type: 'navigation',
          description: 'Adjust text size for readability',
          screenName: 'FontSize',
          onPress: () => handlers.handleNavigation('FontSize'),
        },
      ],
    },
    {
      title: SETTINGS_SECTIONS.NOTIFICATIONS,
      icon: 'notifications',
      items: [
        {
          name: SETTING_ITEMS.PUSH_NOTIFICATIONS,
          icon: 'notifications',
          type: 'toggle',
          description: 'Receive app notifications',
          value: handlers.notifications,
          onValueChange: handlers.setNotifications,
        },
        {
          name: SETTING_ITEMS.EMAIL_ALERTS,
          icon: 'mail',
          type: 'toggle',
          description: 'Get updates via email',
          value: handlers.emailAlerts,
          onValueChange: handlers.setEmailAlerts,
        },
        {
          name: SETTING_ITEMS.SOUND,
          icon: 'volume-high',
          type: 'toggle',
          description: 'Play sound for notifications',
          value: handlers.sound,
          onValueChange: handlers.setSound,
        },
        {
          name: SETTING_ITEMS.VIBRATION,
          icon: 'phone-portrait',
          type: 'toggle',
          description: 'Vibrate for notifications',
          value: handlers.vibration,
          onValueChange: handlers.setVibration,
        },
      ],
    },
    {
      title: SETTINGS_SECTIONS.DATA_STORAGE,
      icon: 'server',
      items: [
        {
          name: SETTING_ITEMS.AUTO_SYNC,
          icon: 'sync',
          type: 'toggle',
          description: 'Automatically sync your data',
          value: handlers.sync,
          onValueChange: handlers.setSync,
        },
        {
          name: SETTING_ITEMS.AUTO_SAVE,
          icon: 'save',
          type: 'toggle',
          description: 'Save changes automatically',
          value: handlers.autoSave,
          onValueChange: handlers.setAutoSave,
        },
        {
          name: SETTING_ITEMS.DATA_SAVER,
          icon: 'cellular',
          type: 'toggle',
          description: 'Reduce data usage',
          value: handlers.dataSaver,
          onValueChange: handlers.setDataSaver,
        },
        {
          name: SETTING_ITEMS.CLEAR_CACHE,
          icon: 'trash',
          type: 'navigation',
          description: 'Free up storage space',
          badge: '1.8 GB',
          screenName: 'Cache',
          onPress: () => handlers.handleNavigation('Cache'),
        },
      ],
    },
    {
      title: SETTINGS_SECTIONS.PRIVACY_SECURITY,
      icon: 'shield',
      items: [
        {
          name: SETTING_ITEMS.LOCATION_SERVICES,
          icon: 'location',
          type: 'toggle',
          description: 'Allow access to your location',
          value: handlers.location,
          onValueChange: handlers.setLocation,
        },
        {
          name: SETTING_ITEMS.PRIVACY_MODE,
          icon: 'eye-off',
          type: 'toggle',
          description: 'Hide sensitive information',
          value: handlers.privacyMode,
          onValueChange: handlers.setPrivacyMode,
        },
        {
          name: SETTING_ITEMS.AUTO_PLAY,
          icon: 'play-circle',
          type: 'toggle',
          description: 'Auto-play videos and GIFs',
          value: handlers.autoPlay,
          onValueChange: handlers.setAutoPlay,
        },
        {
          name: SETTING_ITEMS.ACTIVITY_STATUS,
          icon: 'time',
          type: 'navigation',
          description: 'Control who sees your activity',
          screenName: 'Activity',
          onPress: () => handlers.handleNavigation('Activity'),
        },
      ],
    },
    {
      title: SETTINGS_SECTIONS.SUPPORT,
      icon: 'help-circle',
      items: [
        {
          name: SETTING_ITEMS.HELP_CENTER,
          icon: 'help-buoy',
          type: 'navigation',
          description: 'Get help with the app',
          screenName: 'HelpCenter',
          onPress: () => handlers.handleNavigation('HelpCenter'),
        },
        {
          name: SETTING_ITEMS.CONTACT_US,
          icon: 'chatbubble',
          type: 'navigation',
          description: 'Get in touch with support',
          screenName: 'Contact',
          onPress: () => handlers.handleNavigation('Contact'),
        },
        {
          name: SETTING_ITEMS.RATE_APP,
          icon: 'star',
          type: 'navigation',
          description: 'Share your feedback on store',
          screenName: 'Rate',
          onPress: () => handlers.handleNavigation('Rate'),
        },
        {
          name: SETTING_ITEMS.ABOUT,
          icon: 'information-circle',
          type: 'navigation',
          description: 'App version and information',
          screenName: 'About',
          onPress: () => handlers.handleNavigation('About'),
        },
      ],
    },
  ];
};

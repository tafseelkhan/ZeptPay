// src/services/zeptpay/settings/utils/settingsUtils.ts
import {
  SETTINGS_SECTIONS,
  SETTING_ITEMS,
} from '../../../../api/tests/constants/settingsConstants';

export interface SettingItemType {
  name: string;
  icon: string;
  type?: 'toggle' | 'navigation' | 'info';
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  description?: string;
  badge?: string;
  premium?: boolean;
  screenName?: string;
  onPress?: () => void;
}

export interface SettingSectionType {
  title: string;
  icon: string;
  items: SettingItemType[];
}

// Filter settings based on search query
export const filterSettingsBySearch = (
  sections: SettingSectionType[],
  query: string,
): any[] => {
  if (!query.trim()) return [];

  const allSettings = sections.flatMap(section =>
    section.items.map(item => ({
      ...item,
      sectionTitle: section.title,
    })),
  );

  return allSettings.filter(
    item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase()),
  );
};

// Format user name for avatar
export const getAvatarInitials = (name: string): string => {
  return name?.charAt(0)?.toUpperCase() || 'U';
};

// Format balance with currency
export const formatBalance = (
  balance: number,
  currencySymbol: string,
): string => {
  return `${currencySymbol}${balance?.toLocaleString() || '0'}`;
};

// Get mode badge info
export const getModeInfo = (isLive: boolean) => {
  return {
    label: isLive ? 'LIVE' : 'TEST',
    icon: isLive ? 'rocket-outline' : 'flask-outline',
    color: isLive ? '#EF4444' : '#10B981',
  };
};

// Get cache size display
export const getCacheSizeDisplay = (sizeInBytes?: number): string => {
  if (!sizeInBytes) return '0 MB';
  const mb = sizeInBytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex =
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

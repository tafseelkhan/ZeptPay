// utils/apiKeysUtils.ts
import { ApiKey } from '../../../types/DeveloperType';

// Generate confirmation message for toggle
export const getToggleConfirmationMessage = (
  keyName: string,
  currentStatus: boolean,
  mode: string,
  otherActiveKeysCount: number,
): string => {
  const action = currentStatus ? 'deactivate' : 'activate';
  let message = `Are you sure you want to ${action} the "${keyName}" key?`;

  if (!currentStatus) {
    if (otherActiveKeysCount > 0) {
      message += `\n\n⚠️ Note: Activating this ${mode} key will deactivate ${otherActiveKeysCount} other ${mode} key(s).`;
    }
  } else {
    message += `\n\n⚠️ Note: This key will no longer work for API requests.`;
  }

  return message;
};

// Get theme colors based on dark mode
export const getThemeColors = (isDark: boolean) => {
  return {
    background: isDark ? '#0F172A' : '#F9FAFB',
    cardBackground: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F1F5F9' : '#1F2937',
    textSecondary: isDark ? '#94A3B8' : '#6B7280',
    textTertiary: isDark ? '#64748B' : '#9CA3AF',
    border: isDark ? '#334155' : '#E5E7EB',
    borderLight: isDark ? '#1E293B' : '#F3F4F6',
    primary: '#3B82F6',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    headerBackground: '#3B82F6',
  };
};

// Calculate stats for display
export const getApiKeyStats = (
  keys: ApiKey[],
  isLive: boolean,
): { total: number; active: number; modeKeys: number } => {
  return {
    total: keys.length,
    active: keys.filter(k => k.isActive).length,
    modeKeys: keys.filter(k => k.mode === (isLive ? 'live' : 'test')).length,
  };
};

// Get API key type badge style
export const getKeyTypeBadgeStyle = (type: 'public' | 'secret') => {
  return {
    public: {
      backgroundColor: '#D1FAE5',
      textColor: '#374151',
      label: 'Public',
    },
    secret: {
      backgroundColor: '#FEE2E2',
      textColor: '#374151',
      label: 'Secret',
    },
  }[type];
};

// Validate if key is available
export const isKeyAvailable = (key: string): boolean => {
  return key.length > 0 && key !== 'Not available';
};

// Get permission display name
export const getPermissionDisplayName = (permissionKey: string): string => {
  const names: Record<string, string> = {
    enabled: 'Enable',
    supportsCurrencyConversion: 'Currency Conversion',
    paymentIntents: 'Payment Intents',
    customers: 'Customers',
    refunds: 'Refunds',
    webhooks: 'Webhooks',
    payouts: 'Payouts',
    transfers: 'Transfers',
    connect: 'Connect',
    subscriptions: 'Subscriptions',
  };
  return names[permissionKey] || permissionKey;
};

// Get permission description
export const getPermissionDescription = (permissionKey: string): string => {
  const descriptions: Record<string, string> = {
    enabled: 'Enable this payment method',
    supportsCurrencyConversion: 'Auto-convert currencies',
    paymentIntents: 'Use payment intents API',
    customers: 'Manage customers',
    refunds: 'Process refunds',
    webhooks: 'Receive webhook events',
    payouts: 'Process payouts to bank accounts',
    transfers: 'Transfer funds between accounts',
    connect: 'Connect with third-party services',
    subscriptions: 'Manage subscriptions',
  };
  return descriptions[permissionKey] || '';
};

// Get permission icon color
export const getPermissionIconColor = (permissionKey: string): string => {
  const colors: Record<string, string> = {
    enabled: '#3B82F6',
    supportsCurrencyConversion: '#8B5CF6',
    paymentIntents: '#EC4899',
    customers: '#EC4899',
    refunds: '#F59E0B',
    webhooks: '#8B5CF6',
    payouts: '#EF4444',
    transfers: '#F59E0B',
    connect: '#CC00FF',
    subscriptions: '#10B981',
  };
  return colors[permissionKey] || '#6B7280';
};

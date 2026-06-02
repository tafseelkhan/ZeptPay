import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../contexts/theme/ThemeContext';
import BottomNavigation from '../../../home/test/BottomNavigation';

const { width } = Dimensions.get('window');

// Define types based on your API response
interface PaymentMethod {
  enabled: boolean;
}

interface PaymentMethods {
  card: PaymentMethod;
  zeptpay: PaymentMethod;
  upi: PaymentMethod;
  netBanking: PaymentMethod;
  wallet: PaymentMethod;
  autopay: PaymentMethod;
  banktransfer: PaymentMethod;
  qrpayment: PaymentMethod;
}

interface Payments {
  enabled: boolean;
  supportsCurrencyConversion: boolean;
  paymentIntents: boolean;
}

interface Permissions {
  payments: Payments;
  paymentMethods: PaymentMethods;
  customers: { enabled: boolean };
  refunds: { enabled: boolean };
  webhooks: { enabled: boolean };
  payouts: { enabled: boolean };
  transfers: { enabled: boolean };
  connect: { enabled: boolean };
  subscriptions: { enabled: boolean };
}

interface ApiKey {
  _id: string;
  keyName: string;
  mode: 'test' | 'live';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publicKey: string;
  secretKey: string;
  label?: string;
  permissions?: Permissions;
}

interface UserInfo {
  id: string;
  name: string;
  phone: string;
  isDeveloper: boolean;
  isLive: boolean;
}

interface ApiKeysResponse {
  user: UserInfo;
  keys: ApiKey[];
}

// AsyncStorage key for auth token
const AUTH_TOKEN_KEY = 'authToken';

// Custom Toggle Switch Component (Larger) - Theme aware
const CustomToggle: React.FC<{
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'normal' | 'large';
}> = ({ value, onValueChange, disabled = false, size = 'normal' }) => {
  const [animatedValue] = useState(new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const trackWidth = size === 'large' ? 56 : 44;
  const trackHeight = size === 'large' ? 32 : 24;
  const thumbSize = size === 'large' ? 28 : 20;
  const thumbPosition = size === 'large' ? 2 : 2;
  const activePosition = size === 'large' ? 26 : 22;

  const toggleColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#10B981'],
  });

  const togglePosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [thumbPosition, activePosition],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.toggleTrack,
          {
            width: trackWidth,
            height: trackHeight,
            borderRadius: trackHeight / 2,
            backgroundColor: toggleColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.toggleThumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              left: togglePosition,
              top: (trackHeight - thumbSize) / 2,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Get token from AsyncStorage
const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// API call function
const fetchUserApiKeys = async (token: string) => {
  try {
    console.log('📡 Sending API request...');
    console.log('URL:', `http://172.20.10.12:7000/api/test-live/api-keys/user`);

    const response = await axios.get(
      `http://172.20.10.12:7000/api/test-live/api-keys/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw {
        status: error.response.status,
        message:
          error.response.data?.message || `Error ${error.response.status}`,
      };
    } else if (error.request) {
      throw {
        status: 0,
        message:
          'Cannot connect to server. Please check your internet connection.',
      };
    } else {
      throw {
        status: 0,
        message: error.message || 'An unexpected error occurred.',
      };
    }
  }
};

// Toggle API Key function
const toggleApiKeyStatus = async (
  apiKeyId: string,
  token: string,
  currentStatus: boolean,
) => {
  try {
    const response = await axios.patch(
      `http://172.20.10.12:7000/api/test-live/api-keys/${apiKeyId}/toggle`,
      { isActive: !currentStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw {
        status: error.response.status,
        message:
          error.response.data?.message || `Error ${error.response.status}`,
      };
    } else if (error.request) {
      throw {
        status: 0,
        message:
          'Cannot connect to server. Please check your internet connection.',
      };
    } else {
      throw {
        status: 0,
        message: error.message || 'An unexpected error occurred.',
      };
    }
  }
};

// Toggle Permission function with API integration
const togglePermission = async (
  apiKeyId: string,
  permissionPath: string,
  currentValue: boolean,
  token: string,
) => {
  try {
    console.log('🔄 Toggling permission:', permissionPath);
    console.log('Current value:', currentValue);
    console.log(
      'URL:',
      `http://172.20.10.12:7000/api/test-live/api-keys/${apiKeyId}/permissions`,
    );

    const updatePayload: any = {};
    const pathParts = permissionPath.split('.');

    let current = updatePayload;
    for (let i = 0; i < pathParts.length - 1; i++) {
      current[pathParts[i]] = {};
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = !currentValue;

    const response = await axios.patch(
      `http://172.20.10.12:7000/api/test-live/api-keys/${apiKeyId}/permissions`,
      updatePayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw {
        status: error.response.status,
        message:
          error.response.data?.message || `Error ${error.response.status}`,
      };
    } else if (error.request) {
      throw {
        status: 0,
        message:
          'Cannot connect to server. Please check your internet connection.',
      };
    } else {
      throw {
        status: 0,
        message: error.message || 'An unexpected error occurred.',
      };
    }
  }
};

const ApiKeysScreen: React.FC = () => {
  const { isDark, resolvedTheme } = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [apiKeysData, setApiKeysData] = useState<ApiKeysResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [togglingKeyId, setTogglingKeyId] = useState<string | null>(null);
  const [togglingPermission, setTogglingPermission] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<string>('developers');

  // Theme-based colors
  const themeColors = {
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

  const fetchApiKeys = async () => {
    try {
      setError(null);
      setLoading(true);

      const token = await getAuthToken();

      if (!token) {
        setError('Authentication required. Please login first.');
        setLoading(false);
        return;
      }

      const data = await fetchUserApiKeys(token);
      setApiKeysData(data);
    } catch (err: any) {
      console.error('Fetch error:', err);

      if (err.status === 401) {
        setError('Session expired. Please login again.');
      } else if (err.status === 404) {
        setError('API endpoint not found. Please check the server.');
      } else if (err.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.message || 'Failed to load API keys.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApiKeys();
  };

  const handleToggleApiKey = async (
    apiKeyId: string,
    currentStatus: boolean,
  ) => {
    try {
      setTogglingKeyId(apiKeyId);

      const token = await getAuthToken();

      if (!token) {
        Alert.alert('Error', 'Authentication required. Please login first.');
        return;
      }

      const keyToToggle = apiKeysData?.keys.find(k => k._id === apiKeyId);
      const newStatus = !currentStatus;

      setApiKeysData(prev => {
        if (!prev || !keyToToggle) return prev;

        if (newStatus) {
          return {
            ...prev,
            keys: prev.keys
              .map(key => {
                if (key.mode === keyToToggle.mode) {
                  return { ...key, isActive: false };
                }
                return key;
              })
              .map(key =>
                key._id === apiKeyId ? { ...key, isActive: newStatus } : key,
              ),
          };
        } else {
          return {
            ...prev,
            keys: prev.keys.map(key =>
              key._id === apiKeyId ? { ...key, isActive: newStatus } : key,
            ),
          };
        }
      });

      const response = await toggleApiKeyStatus(apiKeyId, token, currentStatus);
      fetchApiKeys();

      Alert.alert(
        'Success',
        response?.message ||
          `API key has been ${
            !currentStatus ? 'activated' : 'deactivated'
          } successfully.`,
        [{ text: 'OK' }],
      );
    } catch (err: any) {
      console.error('Toggle error:', err);
      fetchApiKeys();

      let errorMessage = 'Failed to toggle API key status.';

      if (err.status === 400) {
        errorMessage = 'Invalid request. Please check the parameters.';
      } else if (err.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (err.status === 404) {
        errorMessage = 'API key not found.';
      } else if (err.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setTogglingKeyId(null);
    }
  };

  const handleTogglePermission = async (
    apiKeyId: string,
    permissionPath: string,
    currentValue: boolean,
    permissionName: string,
  ) => {
    try {
      setTogglingPermission(`${apiKeyId}-${permissionPath}`);

      const token = await getAuthToken();

      if (!token) {
        Alert.alert('Error', 'Authentication required. Please login first.');
        return;
      }

      setApiKeysData(prev => {
        if (!prev) return prev;

        const updatedKeys = prev.keys.map(key => {
          if (key._id === apiKeyId && key.permissions) {
            const newPermissions = { ...key.permissions };
            const pathParts = permissionPath.split('.');

            if (pathParts.length === 2) {
              const [parent, child] = pathParts;
              if (newPermissions[parent as keyof Permissions]) {
                (newPermissions[parent as keyof Permissions] as any)[child] =
                  !currentValue;
              }
            }

            return { ...key, permissions: newPermissions };
          }
          return key;
        });

        return { ...prev, keys: updatedKeys };
      });

      await togglePermission(apiKeyId, permissionPath, currentValue, token);
      fetchApiKeys();
    } catch (error) {
      console.error('Permission toggle error:', error);
      fetchApiKeys();
      Alert.alert('Error', 'Failed to toggle permission. Please try again.', [
        { text: 'OK' },
      ]);
    } finally {
      setTogglingPermission(null);
    }
  };

  const confirmToggle = (
    apiKeyId: string,
    currentStatus: boolean,
    keyName: string,
  ) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    const apiKey = apiKeysData?.keys.find(k => k._id === apiKeyId);
    const mode = apiKey?.mode || '';

    let message = `Are you sure you want to ${action} the "${keyName}" key?`;

    if (!currentStatus) {
      const otherActiveKeys =
        apiKeysData?.keys.filter(
          k => k._id !== apiKeyId && k.mode === mode && k.isActive,
        ) || [];

      if (otherActiveKeys.length > 0) {
        message += `\n\n⚠️ Note: Activating this ${mode} key will deactivate ${otherActiveKeys.length} other ${mode} key(s).`;
      }
    } else {
      message += `\n\n⚠️ Note: This key will no longer work for API requests.`;
    }

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} API Key`,
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: currentStatus ? 'destructive' : 'default',
          onPress: () => handleToggleApiKey(apiKeyId, currentStatus),
        },
      ],
    );
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await Clipboard.setString(text);
      Alert.alert('Copied!', `${type} copied to clipboard.`, [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard', [{ text: 'OK' }]);
    }
  };

  const toggleKeyExpansion = (keyId: string) => {
    setExpandedKey(expandedKey === keyId ? null : keyId);
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    const parts = key.split('_');
    if (parts.length > 2) {
      return `${parts[0]}_${parts[1]}_••••${parts[parts.length - 1].slice(-6)}`;
    }
    return key;
  };

  const getModeColor = (mode: 'test' | 'live') => {
    return mode === 'live' ? '#EF4444' : '#10B981';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#10B981' : '#6B7280';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Permission Row Component with theme
  const PermissionRow: React.FC<{
    label: string;
    value: boolean;
    onToggle: () => void;
    disabled?: boolean;
    icon?: React.ReactNode;
    description?: string;
  }> = ({ label, value, onToggle, disabled, icon, description }) => {
    return (
      <View
        style={[
          styles.permissionRow,
          { borderBottomColor: themeColors.borderLight },
        ]}
      >
        <View style={styles.permissionRowLeft}>
          {icon && (
            <View
              style={[
                styles.permissionRowIcon,
                { backgroundColor: themeColors.borderLight },
              ]}
            >
              {icon}
            </View>
          )}
          <View style={styles.permissionRowText}>
            <Text
              style={[styles.permissionRowLabel, { color: themeColors.text }]}
            >
              {label}
            </Text>
            {description && (
              <Text
                style={[
                  styles.permissionRowDescription,
                  { color: themeColors.textSecondary },
                ]}
              >
                {description}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.permissionRowRight}>
          <View
            style={[
              styles.permissionStatusBadge,
              value
                ? styles.permissionEnabledBadge
                : styles.permissionDisabledBadge,
            ]}
          >
            <Text
              style={[
                styles.permissionStatusText,
                { color: value ? '#10B981' : '#6B7280' },
              ]}
            >
              {value ? 'ON' : 'OFF'}
            </Text>
          </View>
          <CustomToggle
            value={value}
            onValueChange={onToggle}
            disabled={disabled}
            size="large"
          />
        </View>
      </View>
    );
  };

  // Permission Card Component with theme
  const PermissionCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    color?: string;
  }> = ({ title, icon, children, color = '#3B82F6' }) => {
    return (
      <View
        style={[
          styles.permissionCard,
          {
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.border,
          },
        ]}
      >
        <View
          style={[
            styles.permissionCardHeader,
            {
              borderBottomColor: color + '20',
              backgroundColor: themeColors.borderLight,
            },
          ]}
        >
          <View
            style={[
              styles.permissionCardIcon,
              { backgroundColor: color + '15' },
            ]}
          >
            {icon}
          </View>
          <Text
            style={[styles.permissionCardTitle, { color: themeColors.text }]}
          >
            {title}
          </Text>
        </View>
        <View style={styles.permissionCardContent}>{children}</View>
      </View>
    );
  };

  const renderPermissionsData = (apiKey: ApiKey) => {
    const permissions = apiKey.permissions;
    if (!permissions) return null;

    const isToggling = (path: string) =>
      togglingPermission === `${apiKey._id}-${path}`;

    return (
      <View style={styles.permissionsContainer}>
        <View
          style={[
            styles.permissionsHeader,
            {
              backgroundColor: themeColors.cardBackground,
              borderColor: themeColors.border,
            },
          ]}
        >
          <View style={styles.permissionsHeaderLeft}>
            <View
              style={[
                styles.permissionsHeaderIcon,
                { backgroundColor: '#EFF6FF' },
              ]}
            >
              <Icon name="security" size={24} color="#3B82F6" />
            </View>
            <View>
              <Text
                style={[
                  styles.permissionsHeaderTitle,
                  { color: themeColors.text },
                ]}
              >
                Permissions & Access
              </Text>
              <Text
                style={[
                  styles.permissionsHeaderSubtitle,
                  { color: themeColors.textSecondary },
                ]}
              >
                Configure what this key can do
              </Text>
            </View>
          </View>
        </View>

        {apiKey.label && (
          <View
            style={[
              styles.labelCard,
              { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
            ]}
          >
            <View
              style={[styles.labelCardIcon, { backgroundColor: '#FDE68A' }]}
            >
              <Icon name="info" size={20} color="#F59E0B" />
            </View>
            <View style={styles.labelCardContent}>
              <Text style={[styles.labelCardTitle, { color: '#92400E' }]}>
                Key Label
              </Text>
              <Text style={[styles.labelCardText, { color: '#92400E' }]}>
                {apiKey.label}
              </Text>
            </View>
          </View>
        )}

        <PermissionCard
          title="Payments"
          icon={<FontAwesome5 name="credit-card" size={18} color="#3B82F6" />}
          color="#3B82F6"
        >
          <PermissionRow
            label="Enable Payments"
            value={permissions.payments?.enabled}
            onToggle={() =>
              handleTogglePermission(
                apiKey._id,
                'payments.enabled',
                permissions.payments?.enabled,
                'Payments',
              )
            }
            disabled={isToggling('payments.enabled')}
            icon={<Feather name="toggle-right" size={16} color="#3B82F6" />}
            description="Process payments with this key"
          />
          <PermissionRow
            label="Currency Conversion"
            value={permissions.payments?.supportsCurrencyConversion}
            onToggle={() =>
              handleTogglePermission(
                apiKey._id,
                'payments.supportsCurrencyConversion',
                permissions.payments?.supportsCurrencyConversion,
                'Currency Conversion',
              )
            }
            disabled={isToggling('payments.supportsCurrencyConversion')}
            icon={
              <FontAwesome5 name="exchange-alt" size={14} color="#8B5CF6" />
            }
            description="Auto-convert currencies"
          />
          <PermissionRow
            label="Payment Intents"
            value={permissions.payments?.paymentIntents}
            onToggle={() =>
              handleTogglePermission(
                apiKey._id,
                'payments.paymentIntents',
                permissions.payments?.paymentIntents,
                'Payment Intents',
              )
            }
            disabled={isToggling('payments.paymentIntents')}
            icon={<Icon name="track-changes" size={16} color="#EC4899" />}
            description="Use payment intents API"
          />
        </PermissionCard>

        {permissions.paymentMethods && (
          <PermissionCard
            title="Payment Methods"
            icon={
              <MaterialCommunityIcons
                name="credit-card-multiple"
                size={20}
                color="#8B5CF6"
              />
            }
            color="#8B5CF6"
          >
            {Object.entries(permissions.paymentMethods).map(([key, value]) => {
              const getIcon = (method: string) => {
                switch (method) {
                  case 'card':
                    return (
                      <FontAwesome5
                        name="credit-card"
                        size={14}
                        color="#3B82F6"
                      />
                    );
                  case 'zeptpay':
                    return <Icon name="payments" size={16} color="#10B981" />;
                  case 'upi':
                    return (
                      <MaterialCommunityIcons
                        name="qrcode"
                        size={16}
                        color="#8B5CF6"
                      />
                    );
                  case 'netBanking':
                    return (
                      <FontAwesome5
                        name="university"
                        size={14}
                        color="#EC4899"
                      />
                    );
                  case 'wallet':
                    return (
                      <MaterialCommunityIcons
                        name="wallet"
                        size={16}
                        color="#F59E0B"
                      />
                    );
                  case 'autopay':
                    return <Icon name="autorenew" size={16} color="#6366F1" />;
                  case 'banktransfer':
                    return (
                      <FontAwesome5
                        name="exchange-alt"
                        size={14}
                        color="#14B8A6"
                      />
                    );
                  case 'qrpayment':
                    return (
                      <MaterialCommunityIcons
                        name="qrcode-scan"
                        size={16}
                        color="#F97316"
                      />
                    );
                  default:
                    return <Feather name="circle" size={14} color="#6B7280" />;
                }
              };

              const getDescription = (method: string) => {
                const descriptions: Record<string, string> = {
                  card: 'Credit/Debit card payments',
                  zeptpay: 'AirX Pay wallet',
                  upi: 'UPI payments',
                  netBanking: 'Net banking',
                  wallet: 'Digital wallet',
                  autopay: 'Recurring payments',
                  banktransfer: 'Bank transfers',
                  qrpayment: 'QR code payments',
                };
                return descriptions[method] || `${method} payments`;
              };

              return (
                <PermissionRow
                  key={key}
                  label={key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())}
                  value={value.enabled}
                  onToggle={() =>
                    handleTogglePermission(
                      apiKey._id,
                      `paymentMethods.${key}.enabled`,
                      value.enabled,
                      key,
                    )
                  }
                  disabled={isToggling(`paymentMethods.${key}.enabled`)}
                  icon={getIcon(key)}
                  description={getDescription(key)}
                />
              );
            })}
          </PermissionCard>
        )}

        <PermissionCard
          title="Additional Features"
          icon={<Ionicons name="options" size={20} color="#EC4899" />}
          color="#EC4899"
        >
          {permissions.customers && (
            <PermissionRow
              label="Customers"
              value={permissions.customers.enabled}
              onToggle={() =>
                handleTogglePermission(
                  apiKey._id,
                  'customers.enabled',
                  permissions.customers.enabled,
                  'Customers',
                )
              }
              disabled={isToggling('customers.enabled')}
              icon={<Icon name="people" size={16} color="#EC4899" />}
              description="Manage customers"
            />
          )}
          {permissions.refunds && (
            <PermissionRow
              label="Refunds"
              value={permissions.refunds.enabled}
              onToggle={() =>
                handleTogglePermission(
                  apiKey._id,
                  'refunds.enabled',
                  permissions.refunds.enabled,
                  'Refunds',
                )
              }
              disabled={isToggling('refunds.enabled')}
              icon={<Icon name="refresh" size={16} color="#F59E0B" />}
              description="Process refunds"
            />
          )}
          {permissions.webhooks && (
            <PermissionRow
              label="Webhooks"
              value={permissions.webhooks.enabled}
              onToggle={() =>
                handleTogglePermission(
                  apiKey._id,
                  'webhooks.enabled',
                  permissions.webhooks.enabled,
                  'Webhooks',
                )
              }
              disabled={isToggling('webhooks.enabled')}
              icon={<Icon name="webhook" size={16} color="#8B5CF6" />}
              description="Receive webhook events"
            />
          )}
          {permissions.payouts && (
            <PermissionRow
              label="Payouts"
              value={permissions.payouts.enabled}
              onToggle={() =>
                handleTogglePermission(
                  apiKey._id,
                  'payouts.enabled',
                  permissions.payouts.enabled,
                  'Payouts',
                )
              }
              disabled={isToggling('payouts.enabled')}
              icon={
                <MaterialCommunityIcons
                  name="contactless-payment"
                  size={16}
                  color="#EF4444"
                />
              }
              description="Process payouts to bank accounts"
            />
          )}
          {permissions.transfers && (
            <PermissionRow
              label="Transfers"
              value={permissions.transfers.enabled}
              onToggle={() =>
                handleTogglePermission(
                  apiKey._id,
                  'transfers.enabled',
                  permissions.transfers.enabled,
                  'Transfers',
                )
              }
              disabled={isToggling('transfers.enabled')}
              icon={<Icon name="swap-horiz" size={16} color="#F59E0B" />}
              description="Transfer funds between accounts"
            />
          )}
          {permissions.connect && (
            <PermissionRow
              label="Connect"
              value={permissions.connect.enabled}
              onToggle={() =>
                handleTogglePermission(
                  apiKey._id,
                  'connect.enabled',
                  permissions.connect.enabled,
                  'Connect',
                )
              }
              disabled={isToggling('connect.enabled')}
              icon={<Icon name="link" size={16} color="#cc00ff" />}
              description="Connect with third-party services"
            />
          )}
          {permissions.subscriptions && (
            <PermissionRow
              label="Subscriptions"
              value={permissions.subscriptions.enabled}
              onToggle={() =>
                handleTogglePermission(
                  apiKey._id,
                  'subscriptions.enabled',
                  permissions.subscriptions.enabled,
                  'Subscriptions',
                )
              }
              disabled={isToggling('subscriptions.enabled')}
              icon={<Icon name="subscriptions" size={16} color="#10B981" />}
              description="Manage subscriptions"
            />
          )}
        </PermissionCard>
      </View>
    );
  };

  const renderApiKeyCard = (apiKey: ApiKey) => {
    const isExpanded = expandedKey === apiKey._id;
    const modeColor = getModeColor(apiKey.mode);
    const statusColor = getStatusColor(apiKey.isActive);
    const isToggling = togglingKeyId === apiKey._id;

    const otherActiveKeys =
      apiKeysData?.keys.filter(
        k => k._id !== apiKey._id && k.mode === apiKey.mode && k.isActive,
      ) || [];

    return (
      <View
        key={apiKey._id}
        style={[
          styles.apiKeyCard,
          {
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.apiKeyHeader}
          onPress={() => toggleKeyExpansion(apiKey._id)}
          activeOpacity={0.7}
        >
          <View style={styles.apiKeyHeaderLeft}>
            <View
              style={[styles.modeIndicator, { backgroundColor: modeColor }]}
            />
            <View style={styles.apiKeyInfo}>
              <Text style={[styles.apiKeyName, { color: themeColors.text }]}>
                {apiKey.keyName}
              </Text>
              <View style={styles.apiKeyMeta}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${statusColor}15` },
                  ]}
                >
                  <View
                    style={[styles.statusDot, { backgroundColor: statusColor }]}
                  />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {apiKey.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
                <Text
                  style={[styles.dateText, { color: themeColors.textTertiary }]}
                >
                  Created: {formatDate(apiKey.createdAt)}
                </Text>
              </View>
            </View>
          </View>
          <Icon
            name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color={themeColors.textSecondary}
          />
        </TouchableOpacity>

        {!isExpanded && (
          <View style={styles.collapsedView}>
            <View style={styles.keyRow}>
              <Feather name="key" size={14} color={themeColors.textSecondary} />
              <Text
                style={[styles.keyLabel, { color: themeColors.textSecondary }]}
              >
                Public:
              </Text>
              <Text
                style={[
                  styles.keyMaskedValue,
                  {
                    color: themeColors.text,
                    backgroundColor: themeColors.borderLight,
                    borderColor: themeColors.border,
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {maskKey(apiKey.publicKey) || 'Not available'}
              </Text>
            </View>
            <View style={styles.keyRow}>
              <Feather
                name="lock"
                size={14}
                color={themeColors.textSecondary}
              />
              <Text
                style={[styles.keyLabel, { color: themeColors.textSecondary }]}
              >
                Secret:
              </Text>
              <Text
                style={[
                  styles.keyMaskedValue,
                  {
                    color: themeColors.text,
                    backgroundColor: themeColors.borderLight,
                    borderColor: themeColors.border,
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {maskKey(apiKey.secretKey) || 'Not available'}
              </Text>
            </View>
          </View>
        )}

        {isExpanded && (
          <View
            style={[
              styles.expandedView,
              { borderTopColor: themeColors.border },
            ]}
          >
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: themeColors.textSecondary },
                ]}
              >
                Key ID
              </Text>
              <View
                style={[
                  styles.keyValueBox,
                  {
                    backgroundColor: themeColors.borderLight,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text
                  style={[styles.keyIdValue, { color: themeColors.text }]}
                  selectable
                >
                  {apiKey._id}
                </Text>
                <TouchableOpacity
                  style={[styles.copyButton, { backgroundColor: '#EFF6FF' }]}
                  onPress={() => copyToClipboard(apiKey._id, 'Key ID')}
                >
                  <Feather name="copy" size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="key" size={16} color="#10B981" />
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Public Key
                </Text>
                <View style={[styles.typeBadge, styles.publicBadge]}>
                  <Text style={styles.typeBadgeText}>Public</Text>
                </View>
              </View>
              <View
                style={[
                  styles.keyValueBox,
                  {
                    backgroundColor: themeColors.borderLight,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text
                  style={[styles.keyValue, { color: themeColors.text }]}
                  selectable
                  numberOfLines={50}
                >
                  {apiKey.publicKey || 'Not available'}
                </Text>
                {apiKey.publicKey && (
                  <TouchableOpacity
                    style={[styles.copyButton, { backgroundColor: '#EFF6FF' }]}
                    onPress={() =>
                      copyToClipboard(apiKey.publicKey, 'Public Key')
                    }
                  >
                    <Feather name="copy" size={16} color="#3B82F6" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="lock" size={16} color="#EF4444" />
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Secret Key
                </Text>
                <View style={[styles.typeBadge, styles.secretBadge]}>
                  <Text style={styles.typeBadgeText}>Secret</Text>
                </View>
              </View>
              <View
                style={[
                  styles.keyValueBox,
                  {
                    backgroundColor: themeColors.borderLight,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text
                  style={[styles.keyValue, { color: themeColors.text }]}
                  selectable
                  numberOfLines={50}
                >
                  {apiKey.secretKey || 'Not available'}
                </Text>
                {apiKey.secretKey && (
                  <TouchableOpacity
                    style={[styles.copyButton, { backgroundColor: '#EFF6FF' }]}
                    onPress={() =>
                      copyToClipboard(apiKey.secretKey, 'Secret Key')
                    }
                  >
                    <Feather name="copy" size={16} color="#3B82F6" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {renderPermissionsData(apiKey)}

            <View
              style={[
                styles.keyActivationSection,
                {
                  backgroundColor: themeColors.cardBackground,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <View style={styles.keyActivationHeader}>
                <Icon
                  name={apiKey.isActive ? 'toggle-on' : 'toggle-off'}
                  size={24}
                  color={apiKey.isActive ? '#10B981' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.keyActivationTitle,
                    { color: themeColors.text },
                  ]}
                >
                  Key Status
                </Text>
              </View>

              <View style={styles.keyActivationCard}>
                <View style={styles.keyActivationLeft}>
                  <Text
                    style={[
                      styles.keyActivationLabel,
                      { color: themeColors.text },
                    ]}
                  >
                    {apiKey.isActive ? 'Active Key' : 'Inactive Key'}
                  </Text>
                  <Text
                    style={[
                      styles.keyActivationDescription,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    {apiKey.isActive
                      ? 'This key can process API requests'
                      : 'This key cannot process API requests'}
                  </Text>

                  {!apiKey.isActive && otherActiveKeys.length > 0 && (
                    <View
                      style={[
                        styles.activationWarning,
                        { backgroundColor: '#FFFBEB' },
                      ]}
                    >
                      <Icon name="warning" size={16} color="#F59E0B" />
                      <Text
                        style={[
                          styles.activationWarningText,
                          { color: '#92400E' },
                        ]}
                      >
                        Activating will disable {otherActiveKeys.length} other{' '}
                        {apiKey.mode} key(s)
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.keyActivationRight}>
                  {isToggling ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : (
                    <>
                      <CustomToggle
                        value={apiKey.isActive}
                        onValueChange={() =>
                          confirmToggle(
                            apiKey._id,
                            apiKey.isActive,
                            apiKey.keyName,
                          )
                        }
                        disabled={isToggling}
                        size="large"
                      />
                      <View
                        style={[
                          styles.keyActivationBadge,
                          apiKey.isActive
                            ? styles.keyActiveBadge
                            : styles.keyInactiveBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.keyActivationBadgeText,
                            { color: apiKey.isActive ? '#10B981' : '#6B7280' },
                          ]}
                        >
                          {apiKey.isActive ? 'ON' : 'OFF'}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>

            <View
              style={[
                styles.modeInfoCard,
                {
                  backgroundColor: themeColors.borderLight,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.modeInfoIcon,
                  { backgroundColor: modeColor + '15' },
                ]}
              >
                <MaterialCommunityIcons
                  name={apiKey.mode === 'live' ? 'rocket-launch' : 'test-tube'}
                  size={20}
                  color={modeColor}
                />
              </View>
              <View style={styles.modeInfoContent}>
                <Text
                  style={[styles.modeInfoTitle, { color: themeColors.text }]}
                >
                  {apiKey.mode === 'live' ? 'Live Mode' : 'Test Mode'}
                </Text>
                <Text
                  style={[
                    styles.modeInfoDescription,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  {apiKey.mode === 'live'
                    ? 'Real transactions with actual funds'
                    : 'Test transactions with virtual funds'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.securityWarningCard,
                { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
              ]}
            >
              <Icon name="security" size={20} color="#F59E0B" />
              <View style={styles.securityWarningContent}>
                <Text
                  style={[styles.securityWarningTitle, { color: '#92400E' }]}
                >
                  Security Notice
                </Text>
                <Text
                  style={[styles.securityWarningText, { color: '#92400E' }]}
                >
                  Never share your secret key. Keep it confidential and secure.
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: themeColors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={[styles.loadingTitle, { color: themeColors.text }]}>
            Loading API Keys
          </Text>
          <Text
            style={[
              styles.loadingSubtitle,
              { color: themeColors.textSecondary },
            ]}
          >
            Fetching your secure credentials...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !apiKeysData) {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: themeColors.background }]}
      >
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: themeColors.text }]}>
            Unable to Load
          </Text>
          <Text
            style={[styles.errorText, { color: themeColors.textSecondary }]}
          >
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchApiKeys}
            activeOpacity={0.7}
          >
            <Feather name="refresh-cw" size={18} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        edges={['top', 'left', 'right']}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
              progressBackgroundColor={themeColors.cardBackground}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <View style={styles.headerBackground} />
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <View style={styles.headerLeft}>
                  <View style={styles.headerIcon}>
                    <MaterialCommunityIcons
                      name="key-chain-variant"
                      size={28}
                      color="#FFFFFF"
                    />
                  </View>
                  <View>
                    <Text style={styles.title}>API Keys</Text>
                    <Text style={styles.subtitle}>
                      Manage your secure credentials
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.refreshButton,
                    { backgroundColor: themeColors.cardBackground },
                  ]}
                  onPress={onRefresh}
                  activeOpacity={0.7}
                >
                  <Feather name="refresh-cw" size={22} color="#3B82F6" />
                </TouchableOpacity>
              </View>

              {apiKeysData && (
                <View
                  style={[
                    styles.userInfoCard,
                    { backgroundColor: themeColors.cardBackground },
                  ]}
                >
                  <View style={styles.userHeader}>
                    <View
                      style={[
                        styles.userAvatar,
                        { backgroundColor: '#EFF6FF' },
                      ]}
                    >
                      <Icon name="person" size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.userDetails}>
                      <Text
                        style={[styles.userName, { color: themeColors.text }]}
                      >
                        {apiKeysData.user.name}
                      </Text>
                      <View style={styles.userMeta}>
                        <View style={styles.userMetaItem}>
                          <Feather
                            name="phone"
                            size={14}
                            color={themeColors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.userMetaText,
                              { color: themeColors.textSecondary },
                            ]}
                          >
                            {apiKeysData.user.phone}
                          </Text>
                        </View>
                        <View style={styles.userMetaItem}>
                          <Icon
                            name="code"
                            size={14}
                            color={themeColors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.userMetaText,
                              { color: themeColors.textSecondary },
                            ]}
                          >
                            {apiKeysData.user.isDeveloper
                              ? 'Developer Account'
                              : 'Standard Account'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.modeSelector,
                      { borderTopColor: themeColors.border },
                    ]}
                  >
                    <View style={styles.modeSelectorLabel}>
                      <Icon
                        name="mode"
                        size={16}
                        color={themeColors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.modeSelectorText,
                          { color: themeColors.textSecondary },
                        ]}
                      >
                        Current Mode:
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.currentModeBadge,
                        apiKeysData.user.isLive
                          ? styles.liveMode
                          : styles.testMode,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={
                          apiKeysData.user.isLive
                            ? 'rocket-launch'
                            : 'test-tube'
                        }
                        size={14}
                        color="#FFFFFF"
                      />
                      <Text style={styles.currentModeText}>
                        {apiKeysData.user.isLive ? 'LIVE' : 'TEST'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {apiKeysData && apiKeysData.keys.length > 0 && (
            <View
              style={[
                styles.statsBar,
                { backgroundColor: themeColors.cardBackground },
              ]}
            >
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: themeColors.text }]}>
                  {apiKeysData.keys.length}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Total Keys
                </Text>
              </View>
              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: themeColors.border },
                ]}
              />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: themeColors.text }]}>
                  {apiKeysData.keys.filter(k => k.isActive).length}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Active
                </Text>
              </View>
              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: themeColors.border },
                ]}
              />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: themeColors.text }]}>
                  {
                    apiKeysData.keys.filter(
                      k =>
                        k.mode === (apiKeysData.user.isLive ? 'live' : 'test'),
                    ).length
                  }
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  {apiKeysData.user.isLive ? 'Live' : 'Test'} Keys
                </Text>
              </View>
            </View>
          )}

          {apiKeysData && (
            <View style={styles.keysSection}>
              <View style={styles.sectionHeaderLarge}>
                <Icon name="list-alt" size={20} color={themeColors.text} />
                <Text
                  style={[
                    styles.sectionTitleLarge,
                    { color: themeColors.text },
                  ]}
                >
                  Your API Keys
                </Text>
                <View
                  style={[styles.keyCountBadge, { backgroundColor: '#EFF6FF' }]}
                >
                  <Text style={styles.keyCountText}>
                    {apiKeysData.keys.length}
                  </Text>
                </View>
              </View>

              {apiKeysData.keys.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="key-remove"
                    size={64}
                    color={themeColors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.emptyStateTitle,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    No API Keys Found
                  </Text>
                  <Text
                    style={[
                      styles.emptyStateText,
                      { color: themeColors.textTertiary },
                    ]}
                  >
                    You don't have any{' '}
                    {apiKeysData.user.isLive ? 'live' : 'test'} mode API keys.
                  </Text>
                </View>
              ) : (
                <View style={styles.keysList}>
                  {apiKeysData.keys.map(renderApiKeyCard)}
                </View>
              )}
            </View>
          )}

          <View style={styles.footerSpacer} />
        </ScrollView>

        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

// Styles remain with dynamic colors handled inline
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  loadingSubtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
    maxWidth: width * 0.8,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  headerSection: {
    paddingBottom: 20,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#3B82F6',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userInfoCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  userMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userMetaText: {
    fontSize: 13,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  modeSelectorLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeSelectorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveMode: {
    backgroundColor: '#EF4444',
  },
  testMode: {
    backgroundColor: '#10B981',
  },
  currentModeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
  },
  keysSection: {
    marginTop: 20,
  },
  sectionHeaderLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleLarge: {
    fontSize: 18,
    fontWeight: '600',
  },
  keyCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  keyCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  keysList: {
    gap: 12,
    paddingHorizontal: 20,
  },
  apiKeyCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  apiKeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  apiKeyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  modeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  apiKeyInfo: {
    flex: 1,
  },
  apiKeyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  apiKeyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
  },
  collapsedView: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  keyLabel: {
    fontSize: 13,
    fontWeight: '500',
    minWidth: 60,
  },
  keyMaskedValue: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'monospace',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  expandedView: {
    padding: 20,
    gap: 20,
    borderTopWidth: 1,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  publicBadge: {
    backgroundColor: '#D1FAE5',
  },
  secretBadge: {
    backgroundColor: '#FEE2E2',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  keyValueBox: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  keyIdValue: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  keyValue: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleTrack: {
    position: 'relative',
  },
  toggleThumb: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  permissionsContainer: {
    gap: 16,
  },
  permissionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  permissionsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permissionsHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionsHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  permissionsHeaderSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  labelCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  labelCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelCardContent: {
    flex: 1,
  },
  labelCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  labelCardText: {
    fontWeight: '200',
    fontSize: 10,
  },
  permissionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  permissionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
  },
  permissionCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionCardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  permissionCardContent: {
    padding: 12,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  permissionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  permissionRowIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionRowText: {
    flex: 1,
  },
  permissionRowLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  permissionRowDescription: {
    fontSize: 11,
  },
  permissionRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permissionStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  permissionEnabledBadge: {
    backgroundColor: '#D1FAE5',
  },
  permissionDisabledBadge: {
    backgroundColor: '#F3F4F6',
  },
  permissionStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  keyActivationSection: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  keyActivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  keyActivationTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  keyActivationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keyActivationLeft: {
    flex: 1,
  },
  keyActivationLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  keyActivationDescription: {
    fontSize: 12,
    marginBottom: 8,
  },
  activationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
  },
  activationWarningText: {
    fontSize: 11,
    flex: 1,
  },
  keyActivationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  keyActivationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  keyActiveBadge: {
    backgroundColor: '#D1FAE5',
  },
  keyInactiveBadge: {
    backgroundColor: '#F3F4F6',
  },
  keyActivationBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modeInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  modeInfoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeInfoContent: {
    flex: 1,
  },
  modeInfoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  modeInfoDescription: {
    fontSize: 12,
  },
  securityWarningCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    alignItems: 'center',
  },
  securityWarningContent: {
    flex: 1,
  },
  securityWarningTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  securityWarningText: {
    fontSize: 12,
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerSpacer: {
    height: 40,
  },
});

export default ApiKeysScreen;

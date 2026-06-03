// screens/ApiKeysScreen.tsx
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
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../contexts/theme/ThemeContext';
import BottomNavigation from '../BottomNavigation';

// Import types
import { ApiKey, ApiKeysResponse } from '../../../../types/DeveloperType';

// Import services
import {
  fetchAllApiKeys,
  toggleApiKey,
  toggleApiKeyPermission,
  getOtherActiveKeysCount,
  formatDate,
  maskKey,
  getModeColor,
  getStatusColor,
  getPaymentMethodIcon,
  getPaymentMethodDescription,
} from '../../../../services/tests/developerApiKeys/apiKeysService';

// Import utils
import {
  getToggleConfirmationMessage,
  getThemeColors,
  getApiKeyStats,
  isKeyAvailable,
} from '../../../../utils/tests/developerApiKeys/apiKeysUtils';

// Import this components modules
import CustomToggle from '../../../../modules/tests/developerApiKeys/CustomToggle';
import PermissionRow from '../../../../modules/tests/developerApiKeys/PermissionRow';
import PermissionCard from '../../../../modules/tests/developerApiKeys/PermissionCard';

const { width } = Dimensions.get('window');

const ApiKeysScreen: React.FC = () => {
  const { isDark } = useTheme();
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

  const themeColors = getThemeColors(isDark);

  const fetchApiKeys = async () => {
    try {
      setError(null);
      setLoading(true);

      const result = await fetchAllApiKeys();

      if (result.success && result.data) {
        setApiKeysData(result.data);
      } else {
        setError(result.error || 'Failed to load API keys.');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load API keys.');
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

      const keyToToggle = apiKeysData?.keys.find(k => k._id === apiKeyId);
      if (!keyToToggle) return;

      const newStatus = !currentStatus;

      // Optimistic update
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

      const result = await toggleApiKey(apiKeyId, currentStatus);

      if (result.success) {
        await fetchApiKeys(); // Refresh to get latest data
        Alert.alert(
          'Success',
          result.message || 'API key status updated successfully.',
        );
      } else {
        await fetchApiKeys(); // Revert optimistic update
        Alert.alert(
          'Error',
          result.error || 'Failed to toggle API key status.',
        );
      }
    } catch (err: any) {
      console.error('Toggle error:', err);
      await fetchApiKeys();
      Alert.alert(
        'Error',
        'Failed to toggle API key status. Please try again.',
      );
    } finally {
      setTogglingKeyId(null);
    }
  };

  const handleTogglePermission = async (
    apiKeyId: string,
    permissionPath: string,
    currentValue: boolean,
  ) => {
    try {
      setTogglingPermission(`${apiKeyId}-${permissionPath}`);

      // Optimistic update
      setApiKeysData(prev => {
        if (!prev) return prev;

        const updatedKeys = prev.keys.map(key => {
          if (key._id === apiKeyId && key.permissions) {
            const newPermissions = { ...key.permissions };
            const pathParts = permissionPath.split('.');

            if (pathParts.length === 2) {
              const [parent, child] = pathParts;
              if (newPermissions[parent as keyof typeof newPermissions]) {
                (newPermissions[parent as keyof typeof newPermissions] as any)[
                  child
                ] = !currentValue;
              }
            }

            return { ...key, permissions: newPermissions };
          }
          return key;
        });

        return { ...prev, keys: updatedKeys };
      });

      const result = await toggleApiKeyPermission(
        apiKeyId,
        permissionPath,
        currentValue,
      );

      if (!result.success) {
        await fetchApiKeys(); // Revert on error
        Alert.alert('Error', result.error || 'Failed to toggle permission.');
      }
    } catch (error) {
      console.error('Permission toggle error:', error);
      await fetchApiKeys();
      Alert.alert('Error', 'Failed to toggle permission. Please try again.');
    } finally {
      setTogglingPermission(null);
    }
  };

  const confirmToggle = (
    apiKeyId: string,
    currentStatus: boolean,
    keyName: string,
    mode: 'test' | 'live',
  ) => {
    const otherActiveKeysCount = apiKeysData
      ? getOtherActiveKeysCount(apiKeysData.keys, apiKeyId, mode)
      : 0;

    const message = getToggleConfirmationMessage(
      keyName,
      currentStatus,
      mode,
      otherActiveKeysCount,
    );

    Alert.alert(
      `${currentStatus ? 'Deactivate' : 'Activate'} API Key`,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: currentStatus ? 'Deactivate' : 'Activate',
          style: currentStatus ? 'destructive' : 'default',
          onPress: () => handleToggleApiKey(apiKeyId, currentStatus),
        },
      ],
    );
  };

  const copyToClipboard = async (text: string, type: string) => {
    if (!text) return;
    try {
      await Clipboard.setString(text);
      Alert.alert('Copied!', `${type} copied to clipboard.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const toggleKeyExpansion = (keyId: string) => {
    setExpandedKey(expandedKey === keyId ? null : keyId);
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
          themeColors={themeColors}
        >
          <PermissionRow
            label="Enable Payments"
            value={permissions.payments?.enabled}
            onToggle={() =>
              handleTogglePermission(
                apiKey._id,
                'payments.enabled',
                permissions.payments?.enabled,
              )
            }
            disabled={isToggling('payments.enabled')}
            icon={<Feather name="toggle-right" size={16} color="#3B82F6" />}
            description="Process payments with this key"
            themeColors={themeColors}
          />
          <PermissionRow
            label="Currency Conversion"
            value={permissions.payments?.supportsCurrencyConversion}
            onToggle={() =>
              handleTogglePermission(
                apiKey._id,
                'payments.supportsCurrencyConversion',
                permissions.payments?.supportsCurrencyConversion,
              )
            }
            disabled={isToggling('payments.supportsCurrencyConversion')}
            icon={
              <FontAwesome5 name="exchange-alt" size={14} color="#8B5CF6" />
            }
            description="Auto-convert currencies"
            themeColors={themeColors}
          />
          <PermissionRow
            label="Payment Intents"
            value={permissions.payments?.paymentIntents}
            onToggle={() =>
              handleTogglePermission(
                apiKey._id,
                'payments.paymentIntents',
                permissions.payments?.paymentIntents,
              )
            }
            disabled={isToggling('payments.paymentIntents')}
            icon={<Icon name="track-changes" size={16} color="#EC4899" />}
            description="Use payment intents API"
            themeColors={themeColors}
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
            themeColors={themeColors}
          >
            {Object.entries(permissions.paymentMethods).map(([key, value]) => {
              const getIcon = () => {
                const iconName = getPaymentMethodIcon(key);
                if (key === 'card')
                  return (
                    <FontAwesome5 name={iconName} size={14} color="#3B82F6" />
                  );
                if (key === 'zeptpay')
                  return <Icon name={iconName} size={16} color="#10B981" />;
                if (key === 'upi')
                  return (
                    <MaterialCommunityIcons
                      name={iconName}
                      size={16}
                      color="#8B5CF6"
                    />
                  );
                if (key === 'netBanking')
                  return (
                    <FontAwesome5 name={iconName} size={14} color="#EC4899" />
                  );
                if (key === 'wallet')
                  return (
                    <MaterialCommunityIcons
                      name={iconName}
                      size={16}
                      color="#F59E0B"
                    />
                  );
                if (key === 'autopay')
                  return <Icon name={iconName} size={16} color="#6366F1" />;
                if (key === 'banktransfer')
                  return (
                    <FontAwesome5 name={iconName} size={14} color="#14B8A6" />
                  );
                if (key === 'qrpayment')
                  return (
                    <MaterialCommunityIcons
                      name={iconName}
                      size={16}
                      color="#F97316"
                    />
                  );
                return <Feather name="circle" size={14} color="#6B7280" />;
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
                    )
                  }
                  disabled={isToggling(`paymentMethods.${key}.enabled`)}
                  icon={getIcon()}
                  description={getPaymentMethodDescription(key)}
                  themeColors={themeColors}
                />
              );
            })}
          </PermissionCard>
        )}

        <PermissionCard
          title="Additional Features"
          icon={<Ionicons name="options" size={20} color="#EC4899" />}
          color="#EC4899"
          themeColors={themeColors}
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
                )
              }
              disabled={isToggling('customers.enabled')}
              icon={<Icon name="people" size={16} color="#EC4899" />}
              description="Manage customers"
              themeColors={themeColors}
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
                )
              }
              disabled={isToggling('refunds.enabled')}
              icon={<Icon name="refresh" size={16} color="#F59E0B" />}
              description="Process refunds"
              themeColors={themeColors}
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
                )
              }
              disabled={isToggling('webhooks.enabled')}
              icon={<Icon name="webhook" size={16} color="#8B5CF6" />}
              description="Receive webhook events"
              themeColors={themeColors}
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
              themeColors={themeColors}
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
                )
              }
              disabled={isToggling('transfers.enabled')}
              icon={<Icon name="swap-horiz" size={16} color="#F59E0B" />}
              description="Transfer funds between accounts"
              themeColors={themeColors}
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
                )
              }
              disabled={isToggling('connect.enabled')}
              icon={<Icon name="link" size={16} color="#CC00FF" />}
              description="Connect with third-party services"
              themeColors={themeColors}
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
                )
              }
              disabled={isToggling('subscriptions.enabled')}
              icon={<Icon name="subscriptions" size={16} color="#10B981" />}
              description="Manage subscriptions"
              themeColors={themeColors}
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
                {isKeyAvailable(apiKey.publicKey) && (
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
                {isKeyAvailable(apiKey.secretKey) && (
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
                            apiKey.mode,
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

  const stats = apiKeysData
    ? getApiKeyStats(apiKeysData.keys, apiKeysData.user.isLive)
    : { total: 0, active: 0, modeKeys: 0 };

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
                  {stats.total}
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
                  {stats.active}
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
                  {stats.modeKeys}
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

// Styles (keep all the styles from original)
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

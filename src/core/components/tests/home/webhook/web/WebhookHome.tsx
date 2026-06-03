// WebhookScreen.tsx (Final)
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
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../../../contexts/theme/ThemeContext';

// Import types
import { WebhookEvent, WebhookData, UserInfo } from '../../../../../types/WebhooksType';

// Import services
import {
  fetchAllWebhookData,
  createNewWebhook,
  updateWebhookEventsService,
  toggleWebhookStatusService,
  getSelectedEventsCount,
  formatDate,
  maskKey,
  getModeColor,
} from '../../../../../services/tests/webhooks/webhookService';

// Import utils
import {
  isEventSelected,
  toggleEventInSelection,
  isValidUrl,
  isValidLocalUrl,
} from '../../../../../utils/tests/webhooks/webhookUtils';

const { width } = Dimensions.get('window');

const WebhookScreen: React.FC = () => {
  const { isDark, resolvedTheme } = useTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [webhook, setWebhook] = useState<WebhookData | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [eventCategories, setEventCategories] = useState<WebhookEvent[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<boolean>(false);
  const [updatingEvents, setUpdatingEvents] = useState<boolean>(false);
  const [expandedWebhook, setExpandedWebhook] = useState<string | null>(null);

  // Modal states
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');
  const [localUrl, setLocalUrl] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: isDark ? '#111827' : '#F9FAFB',
    },
    centered: {
      backgroundColor: isDark ? '#111827' : '#F9FAFB',
    },
    loadingTitle: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    loadingSubtitle: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    errorTitle: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    errorText: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    userInfoCard: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    },
    userName: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    userMetaText: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    modeSelectorText: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    emptyStateCard: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    },
    emptyStateTitle: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    emptyStateText: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    webhookCard: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderColor: isDark ? '#374151' : '#F3F4F6',
    },
    webhookName: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    dateText: {
      color: isDark ? '#9CA3AF' : '#9CA3AF',
    },
    keyLabel: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    keyMaskedValue: {
      color: isDark ? '#F9FAFB' : '#374151',
      backgroundColor: isDark ? '#374151' : '#F9FAFB',
      borderColor: isDark ? '#4B5563' : '#E5E7EB',
    },
    sectionTitle: {
      color: isDark ? '#D1D5DB' : '#4B5563',
    },
    keyValueBox: {
      backgroundColor: isDark ? '#374151' : '#F9FAFB',
      borderColor: isDark ? '#4B5563' : '#E5E7EB',
    },
    keyValue: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    modeInfoCard: {
      backgroundColor: isDark ? '#374151' : '#F9FAFB',
      borderColor: isDark ? '#4B5563' : '#E5E7EB',
    },
    modeInfoTitle: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    modeInfoDescription: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    keyActivationSection: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    keyActivationTitle: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    keyActivationLabel: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    keyActivationDescription: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    datesCard: {
      backgroundColor: isDark ? '#374151' : '#F9FAFB',
      borderColor: isDark ? '#4B5563' : '#E5E7EB',
    },
    dateLabel: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    dateValue: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    dateDivider: {
      backgroundColor: isDark ? '#4B5563' : '#E5E7EB',
    },
    modalContent: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    },
    modalTitle: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    modalHeader: {
      borderBottomColor: isDark ? '#374151' : '#F3F4F6',
    },
    inputLabel: {
      color: isDark ? '#D1D5DB' : '#374151',
    },
    input: {
      backgroundColor: isDark ? '#374151' : '#F9FAFB',
      borderColor: isDark ? '#4B5563' : '#E5E7EB',
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    inputHint: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    modalCategoryTitle: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    modalEventName: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    modalEventDescription: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    modalFooter: {
      borderTopColor: isDark ? '#374151' : '#F3F4F6',
    },
    modalCancelButton: {
      backgroundColor: isDark ? '#374151' : '#F3F4F6',
    },
    modalCancelButtonText: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    eventCategoryCard: {
      backgroundColor: isDark ? '#374151' : '#F9FAFB',
      borderColor: isDark ? '#4B5563' : '#E5E7EB',
    },
    eventCategoryTitle: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    eventCategoryCount: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    eventCategoryContent: {
      borderTopColor: isDark ? '#4B5563' : '#E5E7EB',
    },
    eventName: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    eventDescription: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    eventRow: {
      borderBottomColor: isDark ? '#4B5563' : '#F3F4F6',
    },
    securityWarningCard: {
      backgroundColor: isDark ? '#422B00' : '#FFFBEB',
      borderColor: isDark ? '#78350F' : '#FDE68A',
    },
    securityWarningTitle: {
      color: isDark ? '#FDE68A' : '#92400E',
    },
    securityWarningText: {
      color: isDark ? '#FDE68A' : '#92400E',
    },
    labelCard: {
      backgroundColor: isDark ? '#422B00' : '#FEF3C7',
      borderColor: isDark ? '#78350F' : '#FDE68A',
    },
    labelCardTitle: {
      color: isDark ? '#FDE68A' : '#92400E',
    },
    labelCardText: {
      color: isDark ? '#FDE68A' : '#92400e',
    },
    labelCardIcon: {
      backgroundColor: isDark ? '#78350F' : '#FDE68A',
    },
    typeBadgeText: {
      color: isDark ? '#D1D5DB' : '#374151',
    },
    copyButton: {
      backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2',
    },
  };

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      const { userInfo, webhook, eventCategories } =
        await fetchAllWebhookData();

      setUserInfo(userInfo);
      setEventCategories(eventCategories);

      if (webhook) {
        setWebhook(webhook);
        setSelectedEvents(webhook.events || []);
      } else {
        setWebhook(null);
        setSelectedEvents([]);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCreateWebhook = async () => {
    if (!url?.trim()) {
      Alert.alert('Error', 'Production URL is required');
      return;
    }

    if (!isValidUrl(url)) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    if (localUrl && !isValidLocalUrl(localUrl)) {
      Alert.alert('Error', 'Please enter a valid local URL');
      return;
    }

    if (!selectedEvents || selectedEvents.length === 0) {
      Alert.alert('Error', 'Please select at least one event');
      return;
    }

    try {
      setCreating(true);
      const newWebhook = await createNewWebhook(url, localUrl, selectedEvents);

      setWebhook(newWebhook);
      setSelectedEvents(newWebhook?.events || []);
      setModalVisible(false);
      setUrl('');
      setLocalUrl('');
      Alert.alert('Success', 'Webhook created successfully');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create webhook');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!webhook) return;

    try {
      setTogglingStatus(true);
      setWebhook(prev => (prev ? { ...prev, isActive: !prev.isActive } : null));

      const newStatus = await toggleWebhookStatusService(webhook.isActive);

      Alert.alert(
        'Success',
        `Webhook ${newStatus ? 'activated' : 'deactivated'} successfully`,
      );
    } catch (error: any) {
      setWebhook(prev => (prev ? { ...prev, isActive: !prev.isActive } : null));
      Alert.alert('Error', error?.message || 'Failed to toggle webhook status');
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleEventToggle = (eventName: string) => {
    if (!eventName) return;
    setSelectedEvents(prev =>
      toggleEventInSelection(prev, eventName, eventCategories),
    );
  };

  const handleSaveEvents = async () => {
    if (!webhook) return;

    try {
      setUpdatingEvents(true);
      await updateWebhookEventsService(selectedEvents);

      setWebhook(prev => (prev ? { ...prev, events: selectedEvents } : null));
      Alert.alert('Success', 'Webhook events updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to update events');
    } finally {
      setUpdatingEvents(false);
    }
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

  const toggleWebhookExpansion = (webhookId: string) => {
    setExpandedWebhook(expandedWebhook === webhookId ? null : webhookId);
  };

  // Custom Toggle Switch Component
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
      outputRange: ['#E5E7EB', '#EF4444'],
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

  // Event Category Card Component
  const EventCategoryCard: React.FC<{
    category: WebhookEvent;
    selectedEvents: WebhookEvent[];
    onEventToggle: (eventName: string) => void;
    color?: string;
  }> = ({ category, selectedEvents, onEventToggle, color = '#EF4444' }) => {
    const [expanded, setExpanded] = useState(false);

    if (!category) return null;

    return (
      <View style={[styles.eventCategoryCard, dynamicStyles.eventCategoryCard]}>
        <TouchableOpacity
          style={styles.eventCategoryHeader}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          <View style={styles.eventCategoryHeaderLeft}>
            <View
              style={[
                styles.eventCategoryIcon,
                { backgroundColor: `${color}15` },
              ]}
            >
              <Icon name="category" size={20} color={color} />
            </View>
            <View>
              <Text
                style={[
                  styles.eventCategoryTitle,
                  dynamicStyles.eventCategoryTitle,
                ]}
              >
                {category.category_display || category.category}
              </Text>
              <Text
                style={[
                  styles.eventCategoryCount,
                  dynamicStyles.eventCategoryCount,
                ]}
              >
                {category.events?.length || 0} events
              </Text>
            </View>
          </View>
          <Icon
            name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color="#6B7280"
          />
        </TouchableOpacity>

        {expanded && (
          <View
            style={[
              styles.eventCategoryContent,
              dynamicStyles.eventCategoryContent,
            ]}
          >
            {category.events?.map(event => (
              <TouchableOpacity
                key={event?.name || Math.random().toString()}
                style={[styles.eventRow, dynamicStyles.eventRow]}
                onPress={() => event?.name && onEventToggle(event.name)}
                activeOpacity={0.7}
              >
                <View style={styles.eventRowLeft}>
                  <Icon
                    name={
                      isEventSelected(selectedEvents, event?.name || '')
                        ? 'check-box'
                        : 'check-box-outline-blank'
                    }
                    size={24}
                    color={
                      isEventSelected(selectedEvents, event?.name || '')
                        ? '#EF4444'
                        : '#9CA3AF'
                    }
                  />
                  <View style={styles.eventRowText}>
                    <Text style={[styles.eventName, dynamicStyles.eventName]}>
                      {event?.title || event?.name}
                    </Text>
                    <Text
                      style={[
                        styles.eventDescription,
                        dynamicStyles.eventDescription,
                      ]}
                    >
                      {event?.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.centered, dynamicStyles.centered]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={[styles.loadingTitle, dynamicStyles.loadingTitle]}>
            Loading Webhook
          </Text>
          <Text style={[styles.loadingSubtitle, dynamicStyles.loadingSubtitle]}>
            Fetching your webhook configuration...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !webhook) {
    return (
      <SafeAreaView style={[styles.centered, dynamicStyles.centered]}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color="#EF4444" />
          <Text style={[styles.errorTitle, dynamicStyles.errorTitle]}>
            Unable to Load
          </Text>
          <Text style={[styles.errorText, dynamicStyles.errorText]}>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchData}
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
        style={[styles.container, dynamicStyles.container]}
        edges={['top', 'left', 'right']}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#EF4444']}
              tintColor="#EF4444"
              progressBackgroundColor={isDark ? '#1F2937' : '#FFFFFF'}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View
              style={[styles.headerBackground, { backgroundColor: '#EF4444' }]}
            />
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <View style={styles.headerLeft}>
                  <View style={styles.headerIcon}>
                    <MaterialCommunityIcons
                      name="webhook"
                      size={28}
                      color="#FFFFFF"
                    />
                  </View>
                  <View>
                    <Text style={styles.title}>Webhook</Text>
                    <Text style={styles.subtitle}>
                      Configure your webhook endpoints
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={onRefresh}
                  activeOpacity={0.7}
                >
                  <Feather name="refresh-cw" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {userInfo && (
                <View style={[styles.userInfoCard, dynamicStyles.userInfoCard]}>
                  <View style={styles.userHeader}>
                    <View style={styles.userAvatar}>
                      <Icon name="person" size={24} color="#EF4444" />
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={[styles.userName, dynamicStyles.userName]}>
                        {userInfo.name || userInfo.email}
                      </Text>
                      <View style={styles.userMeta}>
                        <View style={styles.userMetaItem}>
                          <Feather name="phone" size={14} color="#6B7280" />
                          <Text
                            style={[
                              styles.userMetaText,
                              dynamicStyles.userMetaText,
                            ]}
                          >
                            {userInfo.phone || 'Not provided'}
                          </Text>
                        </View>
                        <View style={styles.userMetaItem}>
                          <Icon name="code" size={14} color="#6B7280" />
                          <Text
                            style={[
                              styles.userMetaText,
                              dynamicStyles.userMetaText,
                            ]}
                          >
                            {userInfo.isDeveloper
                              ? 'Developer Account'
                              : 'Standard Account'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modeSelector}>
                    <View style={styles.modeSelectorLabel}>
                      <Icon name="mode" size={16} color="#6B7280" />
                      <Text
                        style={[
                          styles.modeSelectorText,
                          dynamicStyles.modeSelectorText,
                        ]}
                      >
                        Current Mode:
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.currentModeBadge,
                        userInfo.isLive ? styles.liveMode : styles.testMode,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={userInfo.isLive ? 'rocket-launch' : 'test-tube'}
                        size={14}
                        color="#FFFFFF"
                      />
                      <Text style={styles.currentModeText}>
                        {userInfo.isLive ? 'LIVE' : 'TEST'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {!webhook ? (
            <View style={styles.emptyStateContainer}>
              <View
                style={[styles.emptyStateCard, dynamicStyles.emptyStateCard]}
              >
                <MaterialCommunityIcons
                  name="webhook"
                  size={80}
                  color="#EF4444"
                />
                <Text
                  style={[
                    styles.emptyStateTitle,
                    dynamicStyles.emptyStateTitle,
                  ]}
                >
                  No Webhook Configured
                </Text>
                <Text
                  style={[styles.emptyStateText, dynamicStyles.emptyStateText]}
                >
                  You haven't set up a webhook endpoint yet. Webhooks allow you
                  to receive real-time notifications about events in your
                  account.
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => setModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Icon name="add" size={24} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>Create Webhook</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.content}>
              <View style={[styles.webhookCard, dynamicStyles.webhookCard]}>
                <TouchableOpacity
                  style={styles.webhookHeader}
                  onPress={() => toggleWebhookExpansion(webhook._id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.webhookHeaderLeft}>
                    <View
                      style={[
                        styles.modeIndicator,
                        { backgroundColor: getModeColor(webhook.mode) },
                      ]}
                    />
                    <View style={styles.webhookInfo}>
                      <Text
                        style={[styles.webhookName, dynamicStyles.webhookName]}
                      >
                        Webhook
                      </Text>
                      <View style={styles.webhookMeta}>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: webhook.isActive
                                ? '#D1FAE5'
                                : isDark
                                ? '#374151'
                                : '#F3F4F6',
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.statusDot,
                              {
                                backgroundColor: webhook.isActive
                                  ? '#10B981'
                                  : '#6B7280',
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color: webhook.isActive ? '#10B981' : '#6B7280',
                              },
                            ]}
                          >
                            {webhook.isActive ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                        <Text style={[styles.dateText, dynamicStyles.dateText]}>
                          Created: {formatDate(webhook.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Icon
                    name={
                      expandedWebhook === webhook._id
                        ? 'keyboard-arrow-up'
                        : 'keyboard-arrow-down'
                    }
                    size={24}
                    color="#6B7280"
                  />
                </TouchableOpacity>

                {expandedWebhook !== webhook._id && (
                  <View style={styles.collapsedView}>
                    <View style={styles.keyRow}>
                      <Feather name="link" size={14} color="#6B7280" />
                      <Text style={[styles.keyLabel, dynamicStyles.keyLabel]}>
                        URL:
                      </Text>
                      <Text
                        style={[
                          styles.keyMaskedValue,
                          dynamicStyles.keyMaskedValue,
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {webhook.url}
                      </Text>
                    </View>
                    <View style={styles.keyRow}>
                      <Feather name="key" size={14} color="#6B7280" />
                      <Text style={[styles.keyLabel, dynamicStyles.keyLabel]}>
                        Webhook:
                      </Text>
                      <Text
                        style={[
                          styles.keyMaskedValue,
                          dynamicStyles.keyMaskedValue,
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {maskKey(webhook.webhook)}
                      </Text>
                    </View>
                  </View>
                )}

                {expandedWebhook === webhook._id && (
                  <View style={styles.expandedView}>
                    {webhook.mode && (
                      <View
                        style={[
                          styles.modeInfoCard,
                          dynamicStyles.modeInfoCard,
                        ]}
                      >
                        <View
                          style={[
                            styles.modeInfoIcon,
                            {
                              backgroundColor:
                                getModeColor(webhook.mode) + '15',
                            },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={
                              webhook.mode === 'live'
                                ? 'rocket-launch'
                                : 'test-tube'
                            }
                            size={20}
                            color={getModeColor(webhook.mode)}
                          />
                        </View>
                        <View style={styles.modeInfoContent}>
                          <Text
                            style={[
                              styles.modeInfoTitle,
                              dynamicStyles.modeInfoTitle,
                            ]}
                          >
                            {webhook.mode === 'live'
                              ? 'Live Mode'
                              : 'Test Mode'}
                          </Text>
                          <Text
                            style={[
                              styles.modeInfoDescription,
                              dynamicStyles.modeInfoDescription,
                            ]}
                          >
                            {webhook.mode === 'live'
                              ? 'Real webhook events with actual data'
                              : 'Test webhook events with test data'}
                          </Text>
                        </View>
                      </View>
                    )}

                    {webhook.label && (
                      <View style={[styles.labelCard, dynamicStyles.labelCard]}>
                        <View
                          style={[
                            styles.labelCardIcon,
                            dynamicStyles.labelCardIcon,
                          ]}
                        >
                          <Icon name="info" size={20} color="#F59E0B" />
                        </View>
                        <View style={styles.labelCardContent}>
                          <Text
                            style={[
                              styles.labelCardTitle,
                              dynamicStyles.labelCardTitle,
                            ]}
                          >
                            Webhook Label
                          </Text>
                          <Text
                            style={[
                              styles.labelCardText,
                              dynamicStyles.labelCardText,
                            ]}
                          >
                            {webhook.label}
                          </Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Feather name="link" size={16} color="#10B981" />
                        <Text
                          style={[
                            styles.sectionTitle,
                            dynamicStyles.sectionTitle,
                          ]}
                        >
                          Production URL
                        </Text>
                      </View>
                      <View
                        style={[styles.keyValueBox, dynamicStyles.keyValueBox]}
                      >
                        <Text
                          style={[styles.keyValue, dynamicStyles.keyValue]}
                          selectable
                          numberOfLines={2}
                        >
                          {webhook.url}
                        </Text>
                        <TouchableOpacity
                          style={[styles.copyButton, dynamicStyles.copyButton]}
                          onPress={() =>
                            copyToClipboard(webhook.url, 'Production URL')
                          }
                        >
                          <Feather name="copy" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {webhook.localUrl && (
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Feather name="home" size={16} color="#8B5CF6" />
                          <Text
                            style={[
                              styles.sectionTitle,
                              dynamicStyles.sectionTitle,
                            ]}
                          >
                            Local URL
                          </Text>
                          <View style={[styles.typeBadge, styles.publicBadge]}>
                            <Text
                              style={[
                                styles.typeBadgeText,
                                dynamicStyles.typeBadgeText,
                              ]}
                            >
                              Dev
                            </Text>
                          </View>
                        </View>
                        <View
                          style={[
                            styles.keyValueBox,
                            dynamicStyles.keyValueBox,
                          ]}
                        >
                          <Text
                            style={[styles.keyValue, dynamicStyles.keyValue]}
                            selectable
                            numberOfLines={2}
                          >
                            {webhook.localUrl}
                          </Text>
                          <TouchableOpacity
                            style={[
                              styles.copyButton,
                              dynamicStyles.copyButton,
                            ]}
                            onPress={() =>
                              copyToClipboard(webhook.localUrl!, 'Local URL')
                            }
                          >
                            <Feather name="copy" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Feather name="lock" size={16} color="#EF4444" />
                        <Text
                          style={[
                            styles.sectionTitle,
                            dynamicStyles.sectionTitle,
                          ]}
                        >
                          Webhook Key
                        </Text>
                        <View style={[styles.typeBadge, styles.secretBadge]}>
                          <Text
                            style={[
                              styles.typeBadgeText,
                              dynamicStyles.typeBadgeText,
                            ]}
                          >
                            Secret
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[styles.keyValueBox, dynamicStyles.keyValueBox]}
                      >
                        <Text
                          style={[styles.keyValue, dynamicStyles.keyValue]}
                          selectable
                          numberOfLines={10}
                        >
                          {webhook.webhook}
                        </Text>
                        <TouchableOpacity
                          style={[styles.copyButton, dynamicStyles.copyButton]}
                          onPress={() =>
                            copyToClipboard(webhook.webhook, 'Webhook Secret')
                          }
                        >
                          <Feather name="copy" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Icon name="event" size={16} color="#3B82F6" />
                        <Text
                          style={[
                            styles.sectionTitle,
                            dynamicStyles.sectionTitle,
                          ]}
                        >
                          Events
                        </Text>
                        <View style={styles.keyCountBadge}>
                          <Text style={styles.keyCountText}>
                            {getSelectedEventsCount(selectedEvents)} selected
                          </Text>
                        </View>
                      </View>

                      <View style={styles.categoriesContainer}>
                        {eventCategories.map(category => (
                          <EventCategoryCard
                            key={category?._id || Math.random().toString()}
                            category={category}
                            selectedEvents={selectedEvents}
                            onEventToggle={handleEventToggle}
                            color="#EF4444"
                          />
                        ))}
                      </View>

                      {JSON.stringify(selectedEvents) !==
                        JSON.stringify(webhook.events) && (
                        <TouchableOpacity
                          style={styles.saveEventsButton}
                          onPress={handleSaveEvents}
                          disabled={updatingEvents}
                        >
                          {updatingEvents ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <Feather name="save" size={16} color="#FFFFFF" />
                              <Text style={styles.saveEventsButtonText}>
                                Save Changes
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>

                    <View
                      style={[
                        styles.keyActivationSection,
                        dynamicStyles.keyActivationSection,
                      ]}
                    >
                      <View style={styles.keyActivationHeader}>
                        <Icon
                          name={webhook.isActive ? 'toggle-on' : 'toggle-off'}
                          size={24}
                          color={webhook.isActive ? '#10B981' : '#6B7280'}
                        />
                        <Text
                          style={[
                            styles.keyActivationTitle,
                            dynamicStyles.keyActivationTitle,
                          ]}
                        >
                          Webhook Status
                        </Text>
                      </View>

                      <View style={styles.keyActivationCard}>
                        <View style={styles.keyActivationLeft}>
                          <Text
                            style={[
                              styles.keyActivationLabel,
                              dynamicStyles.keyActivationLabel,
                            ]}
                          >
                            {webhook.isActive
                              ? 'Active Webhook'
                              : 'Inactive Webhook'}
                          </Text>
                          <Text
                            style={[
                              styles.keyActivationDescription,
                              dynamicStyles.keyActivationDescription,
                            ]}
                          >
                            {webhook.isActive
                              ? 'This webhook will receive events'
                              : 'This webhook will not receive any events'}
                          </Text>
                        </View>

                        <View style={styles.keyActivationRight}>
                          {togglingStatus ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                          ) : (
                            <>
                              <CustomToggle
                                value={webhook.isActive}
                                onValueChange={handleToggleStatus}
                                size="large"
                              />
                              <View
                                style={[
                                  styles.keyActivationBadge,
                                  webhook.isActive
                                    ? styles.keyActiveBadge
                                    : styles.keyInactiveBadge,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.keyActivationBadgeText,
                                    {
                                      color: webhook.isActive
                                        ? '#10B981'
                                        : '#6B7280',
                                    },
                                  ]}
                                >
                                  {webhook.isActive ? 'ON' : 'OFF'}
                                </Text>
                              </View>
                            </>
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={[styles.datesCard, dynamicStyles.datesCard]}>
                      <View style={styles.dateRow}>
                        <Icon name="calendar-today" size={16} color="#6B7280" />
                        <Text
                          style={[styles.dateLabel, dynamicStyles.dateLabel]}
                        >
                          Created:
                        </Text>
                        <Text
                          style={[styles.dateValue, dynamicStyles.dateValue]}
                        >
                          {formatDate(webhook.createdAt)}
                        </Text>
                      </View>
                      <View
                        style={[styles.dateDivider, dynamicStyles.dateDivider]}
                      />
                      <View style={styles.dateRow}>
                        <Icon name="update" size={16} color="#6B7280" />
                        <Text
                          style={[styles.dateLabel, dynamicStyles.dateLabel]}
                        >
                          Updated:
                        </Text>
                        <Text
                          style={[styles.dateValue, dynamicStyles.dateValue]}
                        >
                          {formatDate(webhook.updatedAt)}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.securityWarningCard,
                        dynamicStyles.securityWarningCard,
                      ]}
                    >
                      <Icon name="security" size={20} color="#F59E0B" />
                      <View style={styles.securityWarningContent}>
                        <Text
                          style={[
                            styles.securityWarningTitle,
                            dynamicStyles.securityWarningTitle,
                          ]}
                        >
                          Security Notice
                        </Text>
                        <Text
                          style={[
                            styles.securityWarningText,
                            dynamicStyles.securityWarningText,
                          ]}
                        >
                          Never share your webhook secret. Keep it confidential
                          and secure.
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={styles.footerSpacer} />
        </ScrollView>

        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, dynamicStyles.modalContent]}>
              <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
                <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>
                  Create Webhook
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                <View style={styles.modalBody}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
                      Production URL <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={[styles.input, dynamicStyles.input]}
                      value={url}
                      onChangeText={setUrl}
                      placeholder="https://api.yourdomain.com/webhook"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Text style={[styles.inputHint, dynamicStyles.inputHint]}>
                      Your production endpoint that will receive webhook events
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
                      Local URL (Optional)
                    </Text>
                    <TextInput
                      style={[styles.input, dynamicStyles.input]}
                      value={localUrl}
                      onChangeText={setLocalUrl}
                      placeholder="http://localhost:3000/webhook"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Text style={[styles.inputHint, dynamicStyles.inputHint]}>
                      For local development and testing
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
                      Initial Events
                    </Text>
                    <Text style={[styles.inputHint, dynamicStyles.inputHint]}>
                      Select events to receive (you can change this later)
                    </Text>

                    <View style={styles.modalEventsContainer}>
                      {eventCategories.map(category => (
                        <View
                          key={category?._id || Math.random().toString()}
                          style={styles.modalCategory}
                        >
                          <Text
                            style={[
                              styles.modalCategoryTitle,
                              dynamicStyles.modalCategoryTitle,
                            ]}
                          >
                            {category?.category_display || category?.category}
                          </Text>
                          {category?.events?.map(event => (
                            <TouchableOpacity
                              key={event?.name || Math.random().toString()}
                              style={styles.modalEventRow}
                              onPress={() =>
                                event?.name && handleEventToggle(event.name)
                              }
                              activeOpacity={0.7}
                            >
                              <Icon
                                name={
                                  isEventSelected(
                                    selectedEvents,
                                    event?.name || '',
                                  )
                                    ? 'check-box'
                                    : 'check-box-outline-blank'
                                }
                                size={24}
                                color={
                                  isEventSelected(
                                    selectedEvents,
                                    event?.name || '',
                                  )
                                    ? '#EF4444'
                                    : '#9CA3AF'
                                }
                              />
                              <View style={styles.modalEventText}>
                                <Text
                                  style={[
                                    styles.modalEventName,
                                    dynamicStyles.modalEventName,
                                  ]}
                                >
                                  {event?.title || event?.name}
                                </Text>
                                <Text
                                  style={[
                                    styles.modalEventDescription,
                                    dynamicStyles.modalEventDescription,
                                  ]}
                                >
                                  {event?.description}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={[styles.modalFooter, dynamicStyles.modalFooter]}>
                  <TouchableOpacity
                    style={[
                      styles.modalCancelButton,
                      dynamicStyles.modalCancelButton,
                    ]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text
                      style={[
                        styles.modalCancelButtonText,
                        dynamicStyles.modalCancelButtonText,
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalCreateButton,
                      (!url?.trim() ||
                        !selectedEvents ||
                        selectedEvents.length === 0 ||
                        creating) &&
                        styles.modalCreateButtonDisabled,
                    ]}
                    onPress={handleCreateWebhook}
                    disabled={
                      !url?.trim() ||
                      !selectedEvents ||
                      selectedEvents.length === 0 ||
                      creating
                    }
                  >
                    {creating ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalCreateButtonText}>
                        Create Webhook
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

// Styles remain the same as original
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
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#EF4444',
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
    paddingBottom: 40,
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
    width: 40,
    height: 40,
    marginLeft: -8,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
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
    marginTop: 10,
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
    backgroundColor: '#FEF2F2',
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
    borderTopColor: '#F3F4F6',
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
  emptyStateContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  emptyStateCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
  },
  webhookCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  webhookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  webhookHeaderLeft: {
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
  webhookInfo: {
    flex: 1,
  },
  webhookName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  webhookMeta: {
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
    minWidth: 45,
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
    borderTopColor: '#F3F4F6',
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
  },
  keyValueBox: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    fontSize: 10,
    fontWeight: '200',
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
    backgroundColor: '#F3F4F6',
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
  datesCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '500',
    width: 65,
  },
  dateValue: {
    fontSize: 13,
    flex: 1,
  },
  dateDivider: {
    height: 1,
    marginVertical: 8,
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
  eventsSection: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  categoriesContainer: {
    gap: 12,
    marginTop: 8,
  },
  eventCategoryCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  eventCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  eventCategoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventCategoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCategoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  eventCategoryCount: {
    fontSize: 12,
  },
  eventCategoryContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  eventRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  eventRowText: {
    flex: 1,
  },
  eventName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  eventDescription: {
    fontSize: 12,
  },
  keyCountBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  keyCountText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#EF4444',
  },
  saveEventsButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  saveEventsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  inputHint: {
    fontSize: 12,
    marginTop: 4,
  },
  modalEventsContainer: {
    marginTop: 12,
  },
  modalCategory: {
    marginBottom: 16,
  },
  modalCategoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  modalEventText: {
    flex: 1,
  },
  modalEventName: {
    fontSize: 14,
    marginBottom: 2,
  },
  modalEventDescription: {
    fontSize: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalCreateButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  modalCreateButtonDisabled: {
    opacity: 0.5,
  },
  modalCreateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerSpacer: {
    height: 40,
  },
});

export default WebhookScreen;

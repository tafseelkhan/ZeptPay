// screens/zeptpay/SettingsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Modal,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getCurrencySymbol } from '../../../../utils/tests/settings/currencyUtils';
import { useTheme } from '../../../../contexts/theme/ThemeContext';
import BottomNavigation from '../BottomNavigation';
import { useSettings } from '../../../../hooks/tests/useSettings';
import { getSettingsOptions } from '../../../../modules/tests/data/settingsData';
import {
  filterSettingsBySearch,
  getAvatarInitials,
  formatBalance,
  getModeInfo,
} from '../../../../utils/tests/settings/settingsUtils';
import {
  APP_VERSION,
  BUILD_NUMBER,
  COPYRIGHT_YEAR,
  APP_NAME,
} from '../../../../../api/tests/constants/settingsConstants';

const { width, height } = Dimensions.get('window');

const SettingsScreen = () => {
  const { isDark, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState<string>('settings');

  const {
    loading,
    userData,
    searchModalVisible,
    setSearchModalVisible,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    showMenu,
    setShowMenu,
    notifications,
    setNotifications,
    autoSave,
    setAutoSave,
    privacyMode,
    setPrivacyMode,
    sync,
    setSync,
    location,
    setLocation,
    dataSaver,
    setDataSaver,
    autoPlay,
    setAutoPlay,
    biometric,
    setBiometric,
    emailAlerts,
    setEmailAlerts,
    sound,
    setSound,
    vibration,
    setVibration,
    isDarkMode,
    setIsDarkMode,
    handleNavigation,
    handleLogout,
  } = useSettings();

  // Theme colors
  const theme = {
    background: isDark ? '#0F172A' : '#F9FAFB',
    surface: isDark ? '#1E293B' : '#FFFFFF',
    surface2: isDark ? '#334155' : '#F8F9FA',
    surface3: isDark ? '#0F172A' : '#F1F5F9',
    text: isDark ? '#F1F5F9' : '#1F2937',
    textSecondary: isDark ? '#94A3B8' : '#6B7280',
    textTertiary: isDark ? '#64748B' : '#9CA3AF',
    border: isDark ? '#334155' : '#E5E5E5',
    borderLight: isDark ? '#1E293B' : '#F3F4F6',
    primary: '#6366F1',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    premium: '#F59E0B',
    switchOn: isDark ? '#8B5CF6' : '#6366F1',
    switchOff: isDark ? '#444444' : '#E5E5E5',
    modalBackground: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
    cardShadow: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
  };

  const navigateToScreen = (screenName: string) => {
    handleNavigation(screenName as any);
  };

  const settingsOptions = getSettingsOptions({
    handleNavigation: navigateToScreen,
    notifications,
    setNotifications,
    emailAlerts,
    setEmailAlerts,
    sound,
    setSound,
    vibration,
    setVibration,
    sync,
    setSync,
    autoSave,
    setAutoSave,
    dataSaver,
    setDataSaver,
    location,
    setLocation,
    privacyMode,
    setPrivacyMode,
    autoPlay,
    setAutoPlay,
    biometric,
    setBiometric,
    isDarkMode,
    setIsDarkMode,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = filterSettingsBySearch(settingsOptions, query);
    setSearchResults(results);
  };

  // User Profile Component
  const UserProfile = () => {
    if (loading) {
      return (
        <View
          style={[
            styles.userProfile,
            {
              backgroundColor: theme.surface,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 40,
            },
          ]}
        >
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      );
    }

    const currencySymbol = getCurrencySymbol(userData?.user.country || '');
    const modeInfo = getModeInfo(userData?.user?.isLive || false);
    const avatarInitial = getAvatarInitials(userData?.user?.name || 'User');

    return (
      <View
        style={[
          styles.userProfile,
          { backgroundColor: theme.surface, shadowColor: theme.cardShadow },
        ]}
      >
        <View style={styles.userInfo}>
          <View
            style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}
          >
            {userData?.user?.avatar ? (
              <Image
                source={{ uri: userData.user?.avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={[styles.avatarText, { color: theme.primary }]}>
                {avatarInitial}
              </Text>
            )}
          </View>
          <View style={styles.userText}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {userData?.user?.name || 'User'}
            </Text>
            <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
              {userData?.user?.email || 'user@example.com'}
            </Text>
            <View style={styles.userMetaRow}>
              <View style={styles.userMetaBadge}>
                <Icon
                  name="call-outline"
                  size={12}
                  color={theme.textSecondary}
                />
                <Text
                  style={[styles.userMetaText, { color: theme.textSecondary }]}
                >
                  {userData?.user?.phone || 'N/A'}
                </Text>
              </View>
              <View style={styles.userMetaBadge}>
                <Icon
                  name="location-outline"
                  size={12}
                  color={theme.textSecondary}
                />
                <Text
                  style={[styles.userMetaText, { color: theme.textSecondary }]}
                >
                  {userData?.user?.country || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.primary }]}
            onPress={() => handleNavigation('EditProfile')}
          >
            <Icon name="pencil" size={16} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[styles.statsContainer, { backgroundColor: theme.surface2 }]}
        >
          <View style={styles.statItem}>
            <MaterialIcons
              name="account-balance-wallet"
              size={24}
              color={theme.success}
            />
            <Text style={[styles.statValue, { color: theme.text }]}>
              {formatBalance(userData?.user?.balance || 0, currencySymbol)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Balance
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: theme.border }]}
          />
          <View style={styles.statItem}>
            <Icon name={modeInfo.icon} size={24} color={modeInfo.color} />
            <Text style={[styles.statValue, { color: theme.text }]}>
              {modeInfo.label}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Mode
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Search Modal Component
  const SearchModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={searchModalVisible}
      onRequestClose={() => setSearchModalVisible(false)}
    >
      <View
        style={[
          styles.searchModalContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <View
          style={[
            styles.searchHeader,
            { backgroundColor: theme.surface, borderBottomColor: theme.border },
          ]}
        >
          <View
            style={[
              styles.searchInputContainer,
              { backgroundColor: theme.surface2, borderColor: theme.border },
            ]}
          >
            <Icon name="search" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search settings..."
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus={true}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Icon
                  name="close-circle"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
            <Text style={[styles.searchCancel, { color: theme.primary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.searchResults}>
          {searchQuery === '' ? (
            <View style={styles.emptySearch}>
              <Icon
                name="search-outline"
                size={64}
                color={theme.textTertiary}
              />
              <Text
                style={[styles.emptySearchText, { color: theme.textSecondary }]}
              >
                Search for settings, preferences, and more
              </Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.emptySearch}>
              <Icon
                name="alert-circle-outline"
                size={64}
                color={theme.textTertiary}
              />
              <Text
                style={[styles.emptySearchText, { color: theme.textSecondary }]}
              >
                No results found for "{searchQuery}"
              </Text>
            </View>
          ) : (
            searchResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.searchResultItem,
                  {
                    backgroundColor: theme.surface,
                    borderBottomColor: theme.border,
                  },
                ]}
                onPress={() => {
                  setSearchModalVisible(false);
                  setSearchQuery('');
                  result.onPress?.();
                }}
              >
                <View
                  style={[
                    styles.searchResultIcon,
                    { backgroundColor: theme.primary + '15' },
                  ]}
                >
                  <Icon name={result.icon} size={22} color={theme.primary} />
                </View>
                <View style={styles.searchResultText}>
                  <Text
                    style={[styles.searchResultTitle, { color: theme.text }]}
                  >
                    {result.name}
                  </Text>
                  <Text
                    style={[
                      styles.searchResultDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {result.description}
                  </Text>
                  <Text
                    style={[
                      styles.searchResultSection,
                      { color: theme.textTertiary },
                    ]}
                  >
                    {result.sectionTitle}
                  </Text>
                </View>
                <Icon
                  name="chevron-forward"
                  size={20}
                  color={theme.textTertiary}
                />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  // Setting Item Component
  const SettingItem: React.FC<{ item: any; isLast: boolean }> = ({
    item,
    isLast,
  }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { borderBottomColor: theme.border, backgroundColor: theme.surface },
        isLast && styles.lastItem,
      ]}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
      activeOpacity={0.6}
    >
      <View style={styles.itemLeft}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                item.type === 'toggle' && item.value
                  ? theme.switchOn + '20'
                  : item.premium
                  ? theme.premium + '15'
                  : theme.primary + '15',
            },
          ]}
        >
          <Icon
            name={item.icon}
            size={20}
            color={
              item.type === 'toggle' && item.value
                ? theme.switchOn
                : item.premium
                ? theme.premium
                : theme.primary
            }
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.settingItemText, { color: theme.text }]}>
              {item.name}
            </Text>
            {item.premium && (
              <View
                style={[
                  styles.premiumBadge,
                  { backgroundColor: theme.premium + '20' },
                ]}
              >
                <Text style={[styles.premiumText, { color: theme.premium }]}>
                  PRO
                </Text>
              </View>
            )}
          </View>
          {item.description && (
            <Text
              style={[
                styles.settingItemDescription,
                { color: theme.textSecondary },
              ]}
            >
              {item.description}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.itemRight}>
        {item.badge && !item.premium && (
          <View
            style={[styles.badge, { backgroundColor: theme.primary + '15' }]}
          >
            <Text style={[styles.badgeText, { color: theme.primary }]}>
              {item.badge}
            </Text>
          </View>
        )}
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{ false: theme.switchOff, true: theme.switchOn }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={theme.switchOff}
          />
        ) : (
          <Icon name="chevron-forward" size={20} color={theme.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  // Setting Section Component
  const SettingSection: React.FC<{ section: any }> = ({ section }) => (
    <View
      style={[
        styles.section,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View
        style={[
          styles.sectionHeader,
          { backgroundColor: theme.surface2, borderBottomColor: theme.border },
        ]}
      >
        <Icon name={section.icon} size={20} color={theme.primary} />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {section.title}
        </Text>
      </View>
      <View style={styles.sectionContent}>
        {section.items.map((item: any, index: number) => (
          <SettingItem
            key={index}
            item={item}
            isLast={index === section.items.length - 1}
          />
        ))}
      </View>
    </View>
  );

  // Three Dots Menu Component
  const ThreeDotsMenu = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showMenu}
      onRequestClose={() => setShowMenu(false)}
    >
      <Pressable
        style={[
          styles.modalOverlay,
          { backgroundColor: theme.modalBackground },
        ]}
        onPress={() => setShowMenu(false)}
      >
        <View style={styles.bottomSheetContainer}>
          <Pressable
            style={[
              styles.bottomSheetContent,
              { backgroundColor: theme.surface, maxHeight: height * 0.7 },
            ]}
            onPress={e => e.stopPropagation()}
          >
            <View
              style={[styles.dragHandle, { backgroundColor: theme.border }]}
            />
            <View
              style={[
                styles.bottomSheetHeader,
                { borderBottomColor: theme.border, borderBottomWidth: 1 },
              ]}
            >
              <Text style={[styles.bottomSheetTitle, { color: theme.text }]}>
                Quick Actions
              </Text>
              <TouchableOpacity
                onPress={() => setShowMenu(false)}
                style={[
                  styles.closeButton,
                  { backgroundColor: theme.surface2 },
                ]}
              >
                <Icon name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.bottomSheetScroll}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.bottomSheetScrollContent}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  handleNavigation('ZeptCaptured');
                }}
              >
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: '#6366F1' + '15' },
                  ]}
                >
                  <Icon name="cloud-upload" size={22} color="#6366F1" />
                </View>
                <View style={styles.menuText}>
                  <Text style={[styles.menuItemText, { color: theme.text }]}>
                    AirCapture
                  </Text>
                  <Text
                    style={[
                      styles.menuItemDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Capture and upload files instantly from any screen
                  </Text>
                </View>
                <Icon
                  name="chevron-forward"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
              <View
                style={[styles.menuDivider, { backgroundColor: theme.border }]}
              />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  handleNavigation('Webhook');
                }}
              >
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: '#10B981' + '15' },
                  ]}
                >
                  <Icon name="link" size={22} color="#10B981" />
                </View>
                <View style={styles.menuText}>
                  <Text style={[styles.menuItemText, { color: theme.text }]}>
                    Webhook
                  </Text>
                  <Text
                    style={[
                      styles.menuItemDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Configure webhook integrations and automations
                  </Text>
                </View>
                <Icon
                  name="chevron-forward"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      <View
        style={[
          styles.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Settings
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: theme.surface2 }]}
              onPress={() => setSearchModalVisible(true)}
            >
              <Icon name="search" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: theme.surface2 }]}
              onPress={() => setShowMenu(true)}
            >
              <Icon
                name="ellipsis-vertical"
                size={22}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Manage your app preferences and account
        </Text>
      </View>

      <SearchModal />
      <ThreeDotsMenu />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <UserProfile />
        {settingsOptions.map((section, index) => (
          <SettingSection key={index} section={section} />
        ))}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.shareButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.primary + '20',
              },
            ]}
            onPress={() => handleNavigation('ShareApp')}
          >
            <Icon name="share-social" size={20} color={theme.primary} />
            <Text style={[styles.actionButtonText, { color: theme.primary }]}>
              Share App
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.feedbackButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.success + '20',
              },
            ]}
            onPress={() => handleNavigation('Feedback')}
          >
            <Icon name="chatbubble-ellipses" size={20} color={theme.success} />
            <Text style={[styles.actionButtonText, { color: theme.success }]}>
              Feedback
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: theme.danger + '10',
              borderColor: theme.danger + '20',
            },
          ]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Icon name="log-out-outline" size={20} color={theme.danger} />
          <Text style={[styles.logoutButtonText, { color: theme.danger }]}>
            Logout
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            App Version {APP_VERSION} • Build {BUILD_NUMBER}
          </Text>
          <Text style={[styles.footerCopyright, { color: theme.textTertiary }]}>
            © {COPYRIGHT_YEAR} {APP_NAME}. All rights reserved.
          </Text>
          <View style={styles.privacyLinks}>
            <TouchableOpacity onPress={() => handleNavigation('PrivacyPolicy')}>
              <Text style={[styles.privacyLink, { color: theme.primary }]}>
                Privacy Policy
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.privacyLinkSeparator,
                { color: theme.textSecondary },
              ]}
            >
              {' '}
              •{' '}
            </Text>
            <TouchableOpacity
              onPress={() => handleNavigation('TermsOfService')}
            >
              <Text style={[styles.privacyLink, { color: theme.primary }]}>
                Terms of Service
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </SafeAreaView>
  );
};

// Styles remain the same as your original styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: { fontSize: 14, fontWeight: '500' },
  searchModalContainer: { flex: 1 },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    marginRight: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16 },
  searchCancel: { fontSize: 16, fontWeight: '600' },
  searchResults: { flex: 1 },
  emptySearch: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptySearchText: { fontSize: 16, textAlign: 'center', paddingHorizontal: 40 },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  searchResultIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  searchResultText: { flex: 1 },
  searchResultTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  searchResultDescription: { fontSize: 13, marginBottom: 4 },
  searchResultSection: { fontSize: 11 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  bottomSheetContainer: { width: '100%', maxHeight: '70%' },
  bottomSheetContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  bottomSheetTitle: { fontSize: 18, fontWeight: '700' },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetScroll: { maxHeight: 400 },
  bottomSheetScrollContent: { paddingBottom: 20 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: { flex: 1 },
  menuItemText: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  menuItemDescription: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  menuDivider: { height: 1, marginHorizontal: 20 },
  content: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 20 },
  userProfile: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: { width: 70, height: 70, borderRadius: 35 },
  avatarText: { fontSize: 32, fontWeight: '700' },
  userText: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  userEmail: { fontSize: 14, marginBottom: 8 },
  userMetaRow: { flexDirection: 'row', gap: 12 },
  userMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userMetaText: { fontSize: 11 },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  editButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  statsContainer: { flexDirection: 'row', borderRadius: 16, padding: 16 },
  statItem: { flex: 1, alignItems: 'center', gap: 6 },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 11, fontWeight: '500' },
  statDivider: { width: 1, height: 40 },
  section: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginLeft: 12 },
  sectionContent: { paddingVertical: 4 },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  lastItem: { borderBottomWidth: 0 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  settingItemText: { fontSize: 16, fontWeight: '600', flex: 1 },
  settingItemDescription: { fontSize: 13, fontWeight: '500' },
  premiumBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  premiumText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  actionButtons: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
    elevation: 1,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  shareButton: {},
  feedbackButton: {},
  actionButtonText: { fontSize: 15, fontWeight: '600' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 10,
    marginBottom: 24,
    borderWidth: 1,
  },
  logoutButtonText: { fontSize: 16, fontWeight: '700' },
  footer: { alignItems: 'center', gap: 6 },
  footerText: { fontSize: 13, fontWeight: '500' },
  footerCopyright: { fontSize: 12, fontWeight: '500' },
  privacyLinks: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  privacyLink: { fontSize: 12, fontWeight: '600' },
  privacyLinkSeparator: {
    fontSize: 12,
    fontWeight: '500',
    marginHorizontal: 4,
  },
  bottomPadding: { height: 80 },
});

export default SettingsScreen;

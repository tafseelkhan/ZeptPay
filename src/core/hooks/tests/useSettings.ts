// src/services/zeptpay/settings/hooks/useSettings.ts
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  getUserDataAPI,
  UserResponse,
} from '../../../api/tests/features/private/userdataPrivateSlice';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Login: undefined;
  EditProfile: undefined;
  Security: undefined;
  Privacy: undefined;
  Theme: undefined;
  HelpCenter: undefined;
  Contact: undefined;
  Rate: undefined;
  About: undefined;
  Activity: undefined;
  FontSize: undefined;
  Cache: undefined;
  ZeptCaptured: undefined;
  Webhook: undefined;
  ShareApp: undefined;
  Feedback: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
};

export const useSettings = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [searchModalVisible, setSearchModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  // Toggle states
  const [notifications, setNotifications] = useState<boolean>(true);
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const [sync, setSync] = useState<boolean>(true);
  const [location, setLocation] = useState<boolean>(true);
  const [dataSaver, setDataSaver] = useState<boolean>(false);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const [biometric, setBiometric] = useState<boolean>(false);
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [sound, setSound] = useState<boolean>(true);
  const [vibration, setVibration] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await getUserDataAPI();
      setUserData(user);
    } catch (error: any) {
      console.error('Error loading user data:', error);
      let errorMessage = 'Failed to load user data';
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        navigation.navigate('Login');
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (screenName?: keyof RootStackParamList) => {
    if (!screenName) return;
    // @ts-ignore
    navigation.navigate(screenName);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout from this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          navigation.navigate('Login');
        },
      },
    ]);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  return {
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
    loadUserData,
  };
};

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  Platform,
  Alert,
  AppState,
  Appearance,
  StatusBar as RNStatusBar,
  ColorSchemeName,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../../types/SettingsType';

type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  isDark: boolean;
  resolvedTheme: ColorScheme;
  systemColorScheme: ColorScheme;
  refreshThemeFromAPI: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// API URL - use your environment variables or config
const API_URL = 'http://172.20.10.12:7000'; // Replace with your config

// Helper function to safely get color scheme
const getSafeColorScheme = (): ColorScheme => {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
};

// Android Navigation Bar helper (pure React Native)
const setAndroidNavigationBar = async (
  backgroundColor: string,
  buttonStyle: 'light' | 'dark',
) => {
  if (Platform.OS === 'android') {
    try {
      // Option 1: Use react-native-navigation-bar (recommended)
      // Install: npm install react-native-navigation-bar
      // import NavigationBar from 'react-native-navigation-bar';
      // await NavigationBar.setColor(backgroundColor);
      // await NavigationBar.setButtonStyle(buttonStyle);

      // Option 2: Use NativeModules directly (limited functionality)
      const { NativeModules } = require('react-native');
      const { StatusBarManager } = NativeModules;

      console.log('Set navigation bar color:', backgroundColor);
      console.log('Set button style:', buttonStyle);

      // Note: NativeModules doesn't directly support navigation bar color
      // You need to install a dedicated package for full functionality
    } catch (error) {
      console.error('Error setting navigation bar:', error);
    }
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemTheme, setSystemTheme] = useState<ColorScheme>(
    getSafeColorScheme(),
  );

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Handle null/undefined by defaulting to 'light'
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });

    return () => subscription.remove();
  }, []);

  // App state change listener (when app comes to foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        refreshThemeFromAPI(); // Refresh theme when app becomes active
      }
    });

    return () => subscription.remove();
  }, []);

  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';

  // Apply theme to UI elements
  useEffect(() => {
    applyTheme();
  }, [resolvedTheme, isDark]);

  const applyTheme = async () => {
    try {
      const bg = isDark ? '#0F172A' : '#FFFFFF';
      const barStyle = isDark ? 'light-content' : 'dark-content';

      // iOS Status Bar
      if (Platform.OS === 'ios') {
        RNStatusBar.setBarStyle(barStyle);
      }

      // Android Status Bar & Navigation Bar
      if (Platform.OS === 'android') {
        RNStatusBar.setBackgroundColor(bg);
        RNStatusBar.setBarStyle(barStyle);
        await setAndroidNavigationBar(bg, isDark ? 'light' : 'dark');
      }
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  };

  // Load theme on startup
  const loadTheme = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ First load from AsyncStorage (fast, offline)
      const savedTheme = await AsyncStorage.getItem('app-theme');
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme as ThemeMode);
      }

      // 2️⃣ Then try to load from API (if logged in)
      await refreshThemeFromAPI();
    } catch (error) {
      console.error('Error loading theme:', error);
      setError('Failed to load theme');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // ✅ FETCH THEME FROM BACKEND
  const refreshThemeFromAPI = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token, skipping API theme fetch');
        return;
      }

      console.log('🔍 Fetching theme from API...');

      const response = await fetch(`${API_URL}/api/user/theme`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 API Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);

      if (
        data.success &&
        data.theme &&
        ['light', 'dark', 'system'].includes(data.theme)
      ) {
        console.log('🎨 Setting theme from API:', data.theme);
        setThemeState(data.theme);
        await AsyncStorage.setItem('app-theme', data.theme);
      }
    } catch (err) {
      console.error('❌ Error fetching theme from API:', err);
      // Don't show error to user, just use local theme
    }
  };

  // ✅ UPDATE THEME (Local + Backend API)
  const handleSetTheme = async (newTheme: ThemeMode): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Optimistic update (instant UI response)
      setThemeState(newTheme);
      await AsyncStorage.setItem('app-theme', newTheme);

      // 2️⃣ Sync with backend API
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        console.log('🔄 Syncing theme with backend...');

        const response = await fetch(`${API_URL}/api/user/theme`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ theme: newTheme }),
        });

        console.log('📡 Update API Status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Backend response:', data);

        if (!data.success) {
          throw new Error(data.message || 'Theme update failed on server');
        }

        // Success - verify with backend response
        if (data.theme && data.theme !== newTheme) {
          // Backend might have normalized the theme
          setThemeState(data.theme);
          await AsyncStorage.setItem('app-theme', data.theme);
        }

        console.log('🎉 Theme updated successfully!');
      } else {
        console.log('👤 No user token, theme saved locally only');
      }
    } catch (err: any) {
      console.error('❌ Error setting theme:', err);

      // Show user-friendly error
      const errorMsg = err.message.includes('Network')
        ? 'Network error. Theme saved locally.'
        : 'Server error. Theme saved locally.';

      setError(errorMsg);

      Alert.alert('Theme Updated', errorMsg, [
        { text: 'OK', onPress: () => setError(null) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const value: ThemeContextType = {
    theme,
    setTheme: handleSetTheme,
    isDark,
    resolvedTheme,
    systemColorScheme: systemTheme,
    refreshThemeFromAPI,
    loading,
    error,
  };

  return (
    <ThemeContext.Provider value={value}>
      {/* StatusBar is now handled directly in React Native */}
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};

import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Platform,
  Text,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useTheme } from '../../../contexts/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Haptic options
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const BottomNavigation = ({
  activeTab,
  setActiveTab,
}: BottomNavigationProps) => {
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const tabs = [
    { id: 'zeptpay', label: 'Home', screen: 'DeveloperHome', type: 'image' },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      screen: 'Subscriptions',
      type: 'material',
    },
    {
      id: 'invoice',
      label: 'Invoice',
      screen: 'Invoice',
      icon: 'receipt-outline',
    },
    {
      id: 'developers',
      label: 'Developers',
      screen: 'Developers',
      icon: 'code-slash',
    },
    {
      id: 'settings',
      label: 'Settings',
      screen: 'SettingScreen',
      icon: 'settings-outline',
    },
  ];

  // ✅ Auto-sync active tab based on current screen
  useEffect(() => {
    const currentScreen = route.name;
    
    // Map screen names to tab IDs
    const screenToTabMap: Record<string, string> = {
      'DeveloperHome': 'zeptpay',
      'Subscriptions': 'subscriptions',
      'Invoice': 'invoice',
      'Developers': 'developers',
      'SettingScreen': 'settings',
    };
    
    const matchedTab = screenToTabMap[currentScreen];
    if (matchedTab && matchedTab !== activeTab) {
      setActiveTab(matchedTab);
    }
  }, [route.name, activeTab, setActiveTab]);

  // Animated flex values
  const flexAnims = useRef(
    tabs.reduce((acc, tab) => {
      acc[tab.id] = new Animated.Value(activeTab === tab.id ? 2.5 : 1);
      return acc;
    }, {} as Record<string, Animated.Value>),
  ).current;

  useEffect(() => {
    const animations = tabs.map(tab =>
      Animated.spring(flexAnims[tab.id], {
        toValue: activeTab === tab.id ? 2.5 : 1,
        useNativeDriver: false,
        bounciness: 4,
        speed: 12,
      }),
    );
    Animated.parallel(animations).start();
  }, [activeTab]);

  // ✅ STRONG HAPTIC FUNCTION
  const triggerStrongHaptic = () => {
    console.log('STRONG HAPTIC TRIGGERED 💪');

    if (Platform.OS === 'android') {
      ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
    } else {
      ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
    }
  };

  // ✅ Tab press handler with strong haptic
  const handleTabPress = (tabName: string, screenName: string) => {
    console.log('Tab pressed:', tabName);
    triggerStrongHaptic();
    setActiveTab(tabName);
    // @ts-ignore
    navigation.navigate(screenName);
  };

  const colors = {
    primary: isDark ? '#60A5FA' : '#3b82f6',
    activeText: '#FFFFFF',
    inactive: isDark ? '#94A3B8' : '#64748B',
    background: isDark ? '#1E293B' : '#FFFFFF',
    border: isDark ? '#1E293B' : '#E2E8F0',
  };

  return (
    <View
      style={[
        styles.bottomNav,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View style={styles.navContent}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;

          return (
            <Animated.View
              key={tab.id}
              style={[styles.navButtonContainer, { flex: flexAnims[tab.id] }]}
            >
              <TouchableOpacity
                onPress={() => handleTabPress(tab.id, tab.screen)}
                activeOpacity={0.8}
                style={[
                  styles.navButton,
                  isActive && { backgroundColor: colors.primary },
                ]}
              >
                <View style={styles.tabContent}>
                  {tab.id === 'zeptpay' ? (
                    <Image
                      source={require('../../../../assets/images/zeptPay.png')}
                      style={[
                        styles.navIconImage,
                      ]}
                      resizeMode="contain"
                    />
                  ) : tab.type === 'material' ? (
                    <MaterialIcons
                      name="subscriptions"
                      size={22}
                      color={isActive ? colors.activeText : colors.inactive}
                    />
                  ) : (
                    <Icon
                      name={tab.icon as any}
                      size={22}
                      color={isActive ? colors.activeText : colors.inactive}
                    />
                  )}

                  {isActive && (
                    <Text
                      style={[styles.tabLabel, { color: colors.activeText }]}
                      numberOfLines={1}
                    >
                      {tab.label}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  navContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 10,
    alignItems: 'center',
  },
  navButtonContainer: {
    marginHorizontal: 4,
  },
  navButton: {
    height: 45,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabLabel: {
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 12,
  },
  navIconImage: {
    width: 20,
    height: 20,
  },
});

export default BottomNavigation;
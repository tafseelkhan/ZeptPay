import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from '../screens/animations/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
// import UserHomeScreen from '../screens/Home/UserHomeScreen';
import DeveloperHomeScreen from '../screens/tests/home/dev/developerHomeScreen';
import WebhookHomeScreen from '../screens/tests/home/webhook/webhookHomeScreen';
import ZeptCapturedScreen from '../screens/tests/home/zeptcaptured/zeptcaptured';
import WebhookScreen from '../screens/tests/home/webhook/webhookScreen';
import DeveloperScreen from '../screens/tests/home/dev/developerApiKeys';
import SettingScreen from '../screens/tests/home/settings/settingScreen';

// ✅ Complete RootStackParamList with all screens
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  UserHome: undefined;
  DeveloperHome: undefined;
  WebhookHomeScreen: undefined;
  ZeptCaptured: undefined;
  Webhook: undefined;
  Developers: undefined;
  SettingScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        {/* <Stack.Screen name="UserHome" component={UserHomeScreen} /> */}
        <Stack.Screen name="DeveloperHome" component={DeveloperHomeScreen} />
        <Stack.Screen name="WebhookHomeScreen" component={WebhookHomeScreen} />
        <Stack.Screen name="ZeptCaptured" component={ZeptCapturedScreen} />
        <Stack.Screen name="Webhook" component={WebhookScreen} />
        <Stack.Screen name="Developers" component={DeveloperScreen} />
        <Stack.Screen name="SettingScreen" component={SettingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

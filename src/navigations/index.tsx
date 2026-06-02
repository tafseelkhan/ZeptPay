import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from '../screens/animations/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
// import UserHomeScreen from '../screens/Home/UserHomeScreen';
import DeveloperHomeScreen from '../screens/home/test/dev/DeveloperHomeScreen';
import WebhookHomeScreen from '../screens/home/test/webhook/WebhookHomeScreen';
import AirCapturedScreen from '../screens/home/test/aircaptured/AirCaputred';
import WebhookScreen from '../screens/home/test/webhook/WebhookScreen';
import DeveloperScreen from '../screens/home/test/dev/Developer';
import SettingScreen from '../screens/home/test/settings/SettingScreen';

// ✅ Complete RootStackParamList with all screens
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  UserHome: undefined;
  DeveloperHome: undefined;
  WebhookHomeScreen: undefined;
  AirCaptured: undefined;
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
        <Stack.Screen name="AirCaptured" component={AirCapturedScreen} />
        <Stack.Screen name="Webhook" component={WebhookScreen} />
        <Stack.Screen name="Developers" component={DeveloperScreen} />
        <Stack.Screen name="SettingScreen" component={SettingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

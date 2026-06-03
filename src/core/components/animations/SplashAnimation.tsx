import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { SoundService } from '../../services/animations/soundService';
import { AuthService } from '../../services/animations/authService';
import { animationUtils } from '../../utils/animations/animationUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  SignUp: undefined;
  DeveloperHome: undefined;
  UserHome: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ZeptPay() {
  const { isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const soundService = useRef(SoundService.getInstance());
  const [isPressed, setIsPressed] = useState(false);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const lottieAnim = useRef(new Animated.Value(0)).current;

  // Colors based on theme
  const backgroundColor = isDark ? '#0F172A' : '#FFFFFF';
  const primaryColor = isDark ? '#34D399' : '#10B981';
  const subtitleColor = isDark ? '#94A3B8' : '#6b7280';

  // Load sound on mount
  useEffect(() => {
    const loadSound = async () => {
      await soundService.current.loadSound(
        require('../../../assets/sounds/splash_sound.mp3'),
      );
    };

    loadSound();

    return () => {
      soundService.current.releaseSound();
    };
  }, []);

  const playSound = () => {
    soundService.current.playSound();
  };

  const handleTap = () => {
    playSound();
    setIsPressed(true);
    setTimeout(() => {
      setIsPressed(false);
    }, 200);
  };

  // Start animations on mount
  useEffect(() => {
    animationUtils
      .parallelAnimations([
        animationUtils.fadeIn(fadeAnim, 1000),
        animationUtils.scaleSpring(logoScaleAnim, 1),
        Animated.timing(lottieAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
      .start();
  }, []);

  // Handle press animation
  useEffect(() => {
    animationUtils.scalePress(scaleAnim, isPressed);
  }, [isPressed]);

  // Auth check
  useEffect(() => {
    let isMounted = true;

    const checkAuthAndNavigate = async () => {
      try {
        const token = await AuthService.getToken();

        if (!token) {
          if (isMounted) navigation.navigate('SignUp');
          return;
        }

        const result = await AuthService.verifyAndGetUserType();

        if (result.isValid) {
          if (result.isDeveloper) {
            if (isMounted) navigation.navigate('DeveloperHome');
          } else {
            if (isMounted) navigation.navigate('UserHome');
          }
        } else {
          await AuthService.clearAuthData();
          if (isMounted) navigation.navigate('SignUp');
        }
      } catch (error) {
        if (isMounted) navigation.navigate('SignUp');
      }
    };

    const timeoutId = setTimeout(() => {
      checkAuthAndNavigate();
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [navigation]);

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={[styles.container, { backgroundColor }]}>
        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View style={[styles.logoContainer]}>
            <Image
              source={require('../../../assets/images/zeptPay.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.lottieContainer,
              {
                opacity: lottieAnim,
              },
            ]}
          >
            <LottieView
              source={require('../../../assets/lotties/Welcome.json')}
              autoPlay
              loop
              style={styles.lottie}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.Text
            style={[
              styles.tagline,
              {
                color: isPressed ? primaryColor : subtitleColor,
                transform: [{ scale: isPressed ? 1.02 : 1 }],
              },
            ]}
          >
            Tap anywhere to hearing
          </Animated.Text>

          <Animated.Text
            style={[
              styles.footerText,
              {
                color: subtitleColor,
                opacity: fadeAnim,
              },
            ]}
          >
            Built with Flixora ❤️
          </Animated.Text>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 160,
    height: 160,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  lottieContainer: {
    width: 200,
    height: 100,
    marginTop: 10,
    marginBottom: 20,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 15,
    fontWeight: '300',
    textAlign: 'center',
    position: 'absolute',
    bottom: 40,
  },
});

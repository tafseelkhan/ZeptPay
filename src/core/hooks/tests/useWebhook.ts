// onboarding/hooks/useOnboarding.ts
import { useState, useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  OnboardingStep,
  WebhookStatusResponse,
} from '../types/WebhooksType';

export const useOnboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const navigateToStep = useCallback(
    (newStep: OnboardingStep) => {
      setIsTransitioning(true);

      // Start animation
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 0, // Instant reset
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(newStep);
        setIsTransitioning(false);
      });
    },
    [slideAnim],
  );

  const nextStep = useCallback(() => {
    if (currentStep < 4 && !isTransitioning) {
      navigateToStep((currentStep + 1) as OnboardingStep);
    }
  }, [currentStep, isTransitioning, navigateToStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 1 && !isTransitioning) {
      navigateToStep((currentStep - 1) as OnboardingStep);
    }
  }, [currentStep, isTransitioning, navigateToStep]);

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('authToken'); // or whatever your token key is
    } catch (error) {
      console.error('Failed to get token from storage:', error);
      return null;
    }
  }, []);

  const checkWebhookStatus = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      const token = await getToken();

      if (!token) {
        console.error('No token found');
        return false;
      }

      const response = await fetch(
        'http://172.20.10.12:7000/api/webhook/status',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WebhookStatusResponse = await response.json();
      return data.enabled;
    } catch (error) {
      console.error('Failed to fetch webhook status:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  const handleGetStarted = useCallback(
    async (navigation: any) => {
      const isEnabled = await checkWebhookStatus();

      if (isEnabled) {
        navigation.navigate('WebhookHomeScreen');
      } else {
        navigateToStep(4);
      }
    },
    [checkWebhookStatus, navigateToStep],
  );

  return {
    currentStep,
    isLoading,
    isTransitioning,
    slideAnim,
    nextStep,
    previousStep,
    handleGetStarted,
  };
};

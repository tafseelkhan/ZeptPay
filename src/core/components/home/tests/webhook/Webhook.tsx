// onboarding/OnboardingFlow.tsx - WITHOUT ANIMATION
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useOnboarding } from '../../../../hooks/useWebhook';
import { Step1Welcome } from './containers/step1Welcome';
import { Step2Instructions } from './containers/step2Instructions';
import { Step3Events } from './containers/step3Events';
import { Step4Enable } from './containers/step4Enable';

interface OnboardingFlowProps {
  navigation: any;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ navigation }) => {
  const {
    currentStep,
    isLoading,
    isTransitioning,
    nextStep,
    handleGetStarted,
  } = useOnboarding();

  const handleEnableWebhook = () => {
    navigation.navigate('Developers');
  };

  React.useEffect(() => {
    console.log('Current Step:', currentStep);
  }, [currentStep]);

  // Simple render based on currentStep
  if (currentStep === 1) {
    return (
      <View style={styles.container}>
        <Step1Welcome
          onNext={nextStep}
          currentStep={1}
          totalSteps={4}
          isTransitioning={isTransitioning}
        />
      </View>
    );
  }

  if (currentStep === 2) {
    return (
      <View style={styles.container}>
        <Step2Instructions
          onNext={nextStep}
          currentStep={2}
          totalSteps={4}
          isTransitioning={isTransitioning}
        />
      </View>
    );
  }

  if (currentStep === 3) {
    return (
      <View style={styles.container}>
        <Step3Events
          onNext={nextStep}
          onGetStarted={() => handleGetStarted(navigation)}
          currentStep={3}
          totalSteps={4}
          isLoading={isLoading}
          isTransitioning={isTransitioning}
        />
      </View>
    );
  }

  if (currentStep === 4) {
    return (
      <View style={styles.container}>
        <Step4Enable onEnable={handleEnableWebhook} />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default OnboardingFlow;
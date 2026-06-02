// types/onboarding.types.ts
export interface WebhookStatusResponse {
  success: boolean;
  enabled: boolean;
}

export type OnboardingStep = 1 | 2 | 3 | 4;

export interface StepProps {
  onNext: () => void;
  currentStep: OnboardingStep;
  totalSteps: number;
  isTransitioning?: boolean;
}
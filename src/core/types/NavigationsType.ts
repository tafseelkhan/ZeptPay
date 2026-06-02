export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  Terms: undefined;
  UserHome: undefined;
  PaymentScreen: undefined;
  DeveloperHome: undefined;
  Privacy: undefined;
  VerifyOTP: {
    userId: string;
    phone: string;
    name: string;
  };
  // Expand as more screens join the stack
};

export type PaymentMethod = 
  | 'card'
  | 'zeptpay'
  | 'upi'
  | 'netbanking'
  | 'wallet'
  | 'autopay'
  | 'banktransfer'
  | 'qrpayment';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'captured' 
  | 'succeeded' 
  | 'failed' 
  | 'cancelled';

export type AutoPayFrequency = 'daily' | 'weekly' | 'monthly';

export interface SavedPaymentMethod {
  _id: string;
  zeptpayAccountId: string;
  paymentMethod: PaymentMethod;
  gateway: {
    provider: string;
    customerId: string;
    paymentMethodToken: string;
  };
  details: any;
  isDefault: boolean;
  isActive: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  zeptpayTransactionId?: string;
  paymentMethod: PaymentMethod;
  nextPaymentDate?: string;
  frequency?: AutoPayFrequency;
    qrCodeId?: string;
  qrData?: string;
  expiresAt?: string;
}

// API Response Types
export interface ApiPaymentResponse {
  message: string;
  transaction: {
    _id: string;
    zeptpayTransactionId: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    payer?: { name: string; email: string };
    receiver?: { name: string; email: string };
    gatewayResponse: {
      gatewayTransactionId: string;
      status: string;
    };
    paidAt: string;
  };
  savedMethod?: SavedPaymentMethod;
  flow?: any;
}

// User Country Data Type
export interface UserCountryData {
  success: boolean;
  country: string;
  countryName: string;
  currency: string;
  timezone: string;
  ip?: string;
}

// Country Data
export interface CountryData {
  name: string;
  currency: string;
  symbol: string;
  banks: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  wallets: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  upiSupported: boolean;
  netbankingSupported: boolean;
}

export interface BankFieldsData {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc?: string;
  branch: string;
  accountType: string;
  upiId?: string;
  routingNumber?: string;
  swiftCode?: string;
  sortCode?: string;
  iban?: string;
  branchCode?: string;
}

export interface CardFieldsData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

// PaymentSheetProps Interface
export interface PaymentSheetProps {
  amount: number;
  currency?: string;
  customerId?: string;
  merchantName?: string;
  onPaymentSuccess: (paymentIntent: PaymentIntent) => void;
  onPaymentFailed: (error: string) => void;
  onClose?: () => void;
  testMode?: boolean;
  allowedMethods?: PaymentMethod[];
  theme?: 'light' | 'dark';
}

// Payment Method Details
export interface PaymentMethodDetails {
  id: PaymentMethod;
  name: string;
  icon: string;
  iconLibrary: 'materialcommunity' | 'antdesign';
  color: string;
  gradient: [string, string];
  accentColor: string;
  supported: boolean;
}
// Add this interface to your types/payments.ts file
export interface QRPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  qrData: string; // QR code data string
  amount: number;
  currency: string;
  theme: 'light' | 'dark';
  qrCodeId?: string;
  expiresAt?: string;
  onSimulateScan: () => void;
  merchantName: string;
  isLoading: boolean;
  countryData: {
    name: string;
    currency: string;
    symbol: string;
  };
}

export interface QRPaymentData {
  qrId: string;
  qrData: string;
  payload: string;
  expiresAt: string;
}
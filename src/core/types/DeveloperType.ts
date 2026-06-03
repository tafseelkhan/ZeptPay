// types/apiKeys.types.ts
export interface PaymentMethod {
  enabled: boolean;
}

export interface PaymentMethods {
  card: PaymentMethod;
  zeptpay: PaymentMethod;
  upi: PaymentMethod;
  netBanking: PaymentMethod;
  wallet: PaymentMethod;
  autopay: PaymentMethod;
  banktransfer: PaymentMethod;
  qrpayment: PaymentMethod;
}

export interface Payments {
  enabled: boolean;
  supportsCurrencyConversion: boolean;
  paymentIntents: boolean;
}

export interface Permissions {
  payments: Payments;
  paymentMethods: PaymentMethods;
  customers: { enabled: boolean };
  refunds: { enabled: boolean };
  webhooks: { enabled: boolean };
  payouts: { enabled: boolean };
  transfers: { enabled: boolean };
  connect: { enabled: boolean };
  subscriptions: { enabled: boolean };
}

export interface ApiKey {
  _id: string;
  keyName: string;
  mode: 'test' | 'live';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publicKey: string;
  secretKey: string;
  label?: string;
  permissions?: Permissions;
}

export interface UserInfo {
  id: string;
  name: string;
  phone: string;
  isDeveloper: boolean;
  isLive: boolean;
}

export interface ApiKeysResponse {
  user: UserInfo;
  keys: ApiKey[];
}

export interface ApiKey {
  _id: string;
  keyName: string;
  mode: 'test' | 'live';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserInfo {
  id: string;
  name: string;
  phone: string;
  isDeveloper: boolean;
  isLive: boolean;
}

export interface ApiKeysResponse {
  user: UserInfo;
  keys: ApiKey[];
}

export interface ApiError {
  message: string;
}
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
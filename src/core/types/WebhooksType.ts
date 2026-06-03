// types/webhook.types.ts
export interface WebhookEvent {
  _id: string;
  category: string;
  category_display?: string;
  events: {
    name: string;
    title?: string;
    description: string;
  }[];
}

export interface WebhookData {
  _id: string;
  developerUserId: string;
  url: string;
  localUrl?: string;
  webhook: string;
  events: WebhookEvent[];
  mode?: 'test' | 'live';
  label?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
  isDeveloper: boolean;
  isLive: boolean;
}

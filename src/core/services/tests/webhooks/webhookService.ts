// services/webhookService.ts
import {
  WebhookEvent,
  WebhookData,
  UserInfo,
} from '../../../types/WebhooksType';
import {
  fetchWebhook,
  fetchWebhookEvents,
  createWebhook,
  updateWebhookEvents,
  toggleWebhookStatus,
} from '../../../../api/tests/features/private/webhooksPrivateSlice';
import { fetchUserInfo } from '../../../../api/tests/features/private/userdataPrivateSlice';

export interface FetchDataResult {
  userInfo: UserInfo | null;
  webhook: WebhookData | null;
  eventCategories: WebhookEvent[];
}

// Fetch all webhook related data
export const fetchAllWebhookData = async (): Promise<FetchDataResult> => {
  const [userData, webhookData, eventsData] = await Promise.all([
    fetchUserInfo(),
    fetchWebhook(),
    fetchWebhookEvents(),
  ]);

  return {
    userInfo: userData.data || userData.user,
    webhook: webhookData?.data || null,
    eventCategories: eventsData.data || [],
  };
};

// Create new webhook
export const createNewWebhook = async (
  url: string,
  localUrl: string,
  events: WebhookEvent[],
): Promise<WebhookData> => {
  const response = await createWebhook(url, localUrl, events);

  if (!response?.success) {
    throw new Error('Failed to create webhook');
  }

  return response.data;
};

// Update webhook events
export const updateWebhookEventsService = async (
  events: WebhookEvent[],
): Promise<void> => {
  const response = await updateWebhookEvents(events);

  if (!response?.success) {
    throw new Error('Failed to update events');
  }
};

// Toggle webhook status
export const toggleWebhookStatusService = async (
  currentStatus: boolean,
): Promise<boolean> => {
  const newStatus = !currentStatus;
  const response = await toggleWebhookStatus(newStatus);

  if (!response?.success) {
    throw new Error('Failed to toggle webhook status');
  }

  return newStatus;
};

// Get selected events count
export const getSelectedEventsCount = (
  selectedEvents: WebhookEvent[],
): number => {
  if (!selectedEvents || !Array.isArray(selectedEvents)) return 0;

  let count = 0;
  selectedEvents.forEach(category => {
    if (category?.events && Array.isArray(category.events)) {
      count += category.events.length;
    }
  });
  return count;
};

// Format date for display
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
};

// Mask sensitive keys
export const maskKey = (key: string): string => {
  if (!key) return '';
  if (key.length > 30) {
    return `${key.substring(0, 20)}...${key.substring(key.length - 6)}`;
  }
  return key;
};

// Get mode color
export const getModeColor = (mode?: 'test' | 'live'): string => {
  return mode === 'live' ? '#EF4444' : '#10B981';
};

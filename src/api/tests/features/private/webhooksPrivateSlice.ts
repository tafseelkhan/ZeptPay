// api/webhookApi.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WebhookEvent,
  WebhookData,
  UserInfo,
} from '../../../../core/types/WebhooksType';
import { API_BASE_URL } from '../../connections/snippet/apiBaseUrl';
import { getToken } from '../../connections/token/tokenSlice';
import { API_ENDPOINTS } from '../../connections/snippet/apiEndpoints';

// Fetch webhook configuration
export const fetchWebhook = async (): Promise<any> => {
  try {
    const token = await getToken();
    console.log('📡 Fetching webhook...');
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.WEBHOOK_ME}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { success: true, data: null };
    }
    throw error;
  }
};

// Fetch available webhook events
export const fetchWebhookEvents = async (): Promise<any> => {
  try {
    console.log('📡 Fetching webhook events...');
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.WEBHOOK_EVENTS}`,
      {
        timeout: 10000,
      },
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Create new webhook
export const createWebhook = async (
  url: string,
  localUrl: string,
  events: WebhookEvent[],
): Promise<any> => {
  try {
    console.log('📡 Creating webhook...');
    const token = await getToken();
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.WEBHOOK_CREATE}`,
      { url, localUrl, events },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Update webhook events
export const updateWebhookEvents = async (
  events: WebhookEvent[],
): Promise<any> => {
  try {
    console.log('📡 Updating webhook events...');
    const token = await getToken();
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.WEBHOOK_UPDATE}`,
      { events },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Toggle webhook status
export const toggleWebhookStatus = async (isActive: boolean): Promise<any> => {
  try {
    console.log('📡 Toggling webhook status...');
    const token = await getToken();
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.WEBHOOK_STATUS}`,
      { isActive },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

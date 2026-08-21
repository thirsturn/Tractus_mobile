import api from './api';
import type { NotificationResponse } from '../types';

export const notificationService = {
  getUserNotifications: async (): Promise<NotificationResponse[]> => {
    const response = await api.get<NotificationResponse[]>('/notifications');
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },
};

export default notificationService;

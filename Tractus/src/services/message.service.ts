import api from './api';
import type { MessageRequest, MessageResponse } from '../types';

const messageService = {
  sendMessage: async (recipientUsername: string, content: string): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>('/messages', {
      recipientUsername,
      content,
    } as MessageRequest);
    return response.data;
  },

  getUserConversations: async (): Promise<MessageResponse[]> => {
    const response = await api.get<MessageResponse[]>('/messages/conversations');
    return response.data;
  },

  getConversation: async (username: string): Promise<MessageResponse[]> => {
    const response = await api.get<MessageResponse[]>(`/messages/conversation/${username}`);
    return response.data;
  },
};

export default messageService;

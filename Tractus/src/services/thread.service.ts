import api from './api';
import type { ThreadResponse } from '../types';

const threadService = {
  getThreadsBySpace: async (spaceId: number): Promise<ThreadResponse[]> => {
    return await api.get<ThreadResponse[]>(`/threads/space/${spaceId}`);
  },
  
  createThread: async (threadData: { title: string; spaceId: number; content?: string; imageUrl?: string }): Promise<ThreadResponse> => {
    return await api.post<ThreadResponse>('/threads', threadData);
  }
};

export default threadService;

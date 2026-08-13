import api from './api';
import type { ThreadResponse } from '../types';

const threadService = {
  getThreadsBySpace: async (spaceId: number): Promise<ThreadResponse[]> => {
    const response = await api.get<ThreadResponse[]>(`/threads/space/${spaceId}`);
    return response.data;
  },
  
  createThread: async (threadData: { title: string; spaceId: number; content?: string; userId: number; imageUri?: string }): Promise<ThreadResponse> => {
    const formData = new FormData();
    formData.append('title', threadData.title);
    formData.append('spaceId', threadData.spaceId.toString());
    formData.append('userId', threadData.userId.toString());
    if (threadData.content) formData.append('content', threadData.content);
    
    if (threadData.imageUri) {
      // React Native FormData requires { uri, name, type } for files
      const filename = threadData.imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('image', {
        uri: threadData.imageUri,
        name: filename,
        type,
      } as any);
    }

    const response = await api.post<ThreadResponse>('/threads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getThreadById: async (id: number): Promise<ThreadResponse> => {
    const response = await api.get<ThreadResponse>(`/threads/${id}`);
    return response.data;
  }
};

export default threadService;

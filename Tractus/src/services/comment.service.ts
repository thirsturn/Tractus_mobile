import api from './api';
import type { CommentResponse } from '../types';

const commentService = {
  getCommentsByThread: async (threadId: number): Promise<CommentResponse[]> => {
    const response = await api.get<CommentResponse[]>(`/comments/thread/${threadId}`);
    return response.data;
  },

  createComment: async (data: { content: string; userId: number; threadId: number; parentCommentId?: number }): Promise<CommentResponse> => {
    const response = await api.post<CommentResponse>('/comments', data);
    return response.data;
  }
};

export default commentService;

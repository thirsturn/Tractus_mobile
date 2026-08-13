import api from './api';
import type { VoteResponse, VoteType } from '../types';

const voteService = {
  getThreadVotes: async (threadId: number): Promise<VoteResponse[]> => {
    const response = await api.get<VoteResponse[]>(`/thread-votes/thread/${threadId}`);
    return response.data;
  },
  getCommentVotes: async (commentId: number): Promise<VoteResponse[]> => {
    const response = await api.get<VoteResponse[]>(`/comment-votes/comment/${commentId}`);
    return response.data;
  },
  castThreadVote: async (data: { userId: number; targetId: number; voteType: VoteType }): Promise<VoteResponse> => {
    const response = await api.post<VoteResponse>('/thread-votes', data);
    return response.data;
  },
  castCommentVote: async (data: { userId: number; targetId: number; voteType: VoteType }): Promise<VoteResponse> => {
    const response = await api.post<VoteResponse>('/comment-votes', data);
    return response.data;
  }
};

export default voteService;

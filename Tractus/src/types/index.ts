export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  profileImageUrl?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  followerCount?: number;
  followingCount?: number;
  following?: boolean;
}

export interface ThreadResponse {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  author: User;
  spaceId: number;
  commentCount?: number;
}

export interface SpaceResponse {
  id: number;
  name: string;
  description?: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  author: User;
  threadId: number;
  parentCommentId?: number;
  createdAt: string;
  replies?: CommentResponse[];
}

export type VoteType = 'UP' | 'DOWN';

export interface VoteResponse {
  id: number;
  userId: number;
  targetId: number;
  voteType: VoteType;
}

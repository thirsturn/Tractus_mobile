import api from './api';
import type { User } from '../types';
import imageService from './image.service';

export interface UserUpdateData {
  bio?: string;
  location?: string;
  website?: string;
  currentPassword?: string;
  password?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
}

const userService = {
  getUserByUsername: async (username: string): Promise<User> => {
    const response = await api.get<User>(`/users/${username}`);
    return response.data;
  },

  updateUser: async (id: number, data: UserUpdateData): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  uploadAvatar: async (id: number, uri: string): Promise<User> => {
    // 1. Upload image to get URL
    const { url } = await imageService.uploadImage(uri);

    // 2. Update user profile with new image URL
    return await userService.updateUser(id, { profileImageUrl: url });
  },

  uploadCover: async (id: number, uri: string): Promise<User> => {
    // 1. Upload image to get URL
    const { url } = await imageService.uploadImage(uri);

    // 2. Update user profile with new cover image URL
    return await userService.updateUser(id, { coverImageUrl: url });
  },

  followUser: async (username: string): Promise<void> => {
    await api.post(`/users/${username}/follow`);
  },

  unfollowUser: async (username: string): Promise<void> => {
    await api.delete(`/users/${username}/follow`);
  }
};

export default userService;

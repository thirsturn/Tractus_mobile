import api from './api';
import type { User } from '../types';

export interface RegisterData {
  username: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
}

const authService = {
  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (userData: RegisterData): Promise<User> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

export default authService;

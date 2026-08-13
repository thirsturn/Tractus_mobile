import api from './api';
import type { User } from '../types';

const authService = {
  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  register: async (userData: any): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

export default authService;

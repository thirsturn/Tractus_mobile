import api from './api';
import type { SpaceResponse } from '../types';

const spaceService = {
  getAllSpaces: async (): Promise<SpaceResponse[]> => {
    const response = await api.get<SpaceResponse[]>('/spaces');
    return response.data;
  }
};

export default spaceService;

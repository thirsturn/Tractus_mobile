import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LOCAL_IP = 'tall-carpets-fry.loca.lt';

const api = axios.create({
  baseURL: `https://${LOCAL_IP}/api`, 
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Navigation logout logic should be handled by a context in React Native
    }
    return Promise.reject(error);
  }
);

export default api;

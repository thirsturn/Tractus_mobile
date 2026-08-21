import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your computer's local IP address (e.g. 192.168.1.X) so your phone can reach the backend
export const LOCAL_IP = '10.252.219.91'; // Update this!

const api = axios.create({
  baseURL: `http://${LOCAL_IP}:8081/api`, 
  headers: {
    'Content-Type': 'application/json',
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

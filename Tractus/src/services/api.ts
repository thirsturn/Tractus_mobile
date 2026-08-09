import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'http://10.10.22.161:8081/api';

class Api {
  private async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token');
  }

  private async getHeaders(isFormData = false): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const token = await this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get<T>(url: string): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) throw new Error(`GET ${url} failed: ${response.status}`);
    return response.json();
  }

  async post<T>(url: string, data: any, options: RequestInit = {}): Promise<T> {
    const isFormData = data instanceof FormData;
    const headers = await this.getHeaders(isFormData);
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        ...headers,
        ...((options.headers as Record<string, string>) || {}),
      },
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`POST ${url} failed: ${response.status}`);
    return response.json();
  }

  async put<T>(url: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`PUT ${url} failed: ${response.status}`);
    return response.json();
  }
}

export default new Api();

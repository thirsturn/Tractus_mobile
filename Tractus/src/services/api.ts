export const API_BASE_URL = 'http://10.10.22.161:8081/api';

class Api {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`GET ${url} failed`);
    return response.json();
  }

  async post<T>(url: string, data: any, options: RequestInit = {}): Promise<T> {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    });
    if (!response.ok) throw new Error(`POST ${url} failed`);
    return response.json();
  }

  async put<T>(url: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`PUT ${url} failed`);
    return response.json();
  }
}

export default new Api();

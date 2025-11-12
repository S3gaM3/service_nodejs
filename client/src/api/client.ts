import axios from 'axios';
import type { LoginResponse, RegisterResponse, UsersResponse, UserResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена к запросам
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/users/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (
    fullName: string,
    dateOfBirth: string,
    email: string,
    password: string,
    role?: 'admin' | 'user'
  ): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/users/register', {
      fullName,
      dateOfBirth,
      email,
      password,
      role,
    });
    return response.data;
  },
};

export const usersAPI = {
  getAll: async (): Promise<UsersResponse> => {
    const response = await apiClient.get<UsersResponse>('/users');
    return response.data;
  },

  getById: async (id: string): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/users/${id}`);
    return response.data;
  },

  block: async (id: string): Promise<UserResponse> => {
    const response = await apiClient.patch<UserResponse>(`/users/${id}/block`);
    return response.data;
  },
};

export default apiClient;


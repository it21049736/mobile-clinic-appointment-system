import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

// No default Content-Type: axios sets JSON for objects and multipart (with boundary) for FormData.
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 20000,
});

let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = /\/auth\/(login|register)$/.test(error.config?.url || '');
    if (error.response?.status === 401 && !isAuthCall && onUnauthorized) {
      onUnauthorized();
    }
    const data = error.response?.data;
    const normalized = new Error(data?.message || error.message);
    normalized.status = error.response?.status;
    normalized.errors = data?.errors;
    return Promise.reject(normalized);
  }
);

export default api;

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ Verificá esta línea

const api = axios.create({
  baseURL: 'https://rentmatch-backend.onrender.com/api',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token'); // Acá puede estar el error
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error obteniendo token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      } catch (e) {
        console.error('Error limpiando storage:', e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
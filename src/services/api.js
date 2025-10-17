import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://rentmatch-backend.onrender.com/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para agregar el token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token agregado a la petición');
      } else {
        console.warn('⚠️ No se encontró token de autenticación');
      }
    } catch (error) {
      console.error('❌ Error al obtener token:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta exitosa:', response.config.url);
    return response;
  },
  async (error) => {
    console.error('❌ Error en la petición:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    return Promise.reject(error);
  }
);

export default api;
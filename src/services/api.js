import axios from 'axios';
import { API_URL } from '@env';

console.log('🔗 API_URL cargada:', API_URL); // Para debug

const api = axios.create({
  baseURL: API_URL || 'http://192.168.1.36:5000/api',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Variable para cachear el último token leído (con timestamp)
let cachedToken = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 1000; // 1 segundo

// Interceptor para agregar el token
api.interceptors.request.use(
  async (config) => {
    try {
      // ✅ CAMBIAR 'authToken' por 'token'
      const now = Date.now();
      
      // Si el cache tiene más de 1 segundo, refrescar
      if (!cachedToken || (now - cacheTimestamp) > CACHE_DURATION) {
        cachedToken = await AsyncStorage.getItem('token'); // ✅ AQUÍ: 'token' no 'authToken'
        cacheTimestamp = now;
        console.log('🔄 Token refrescado desde AsyncStorage');
      }
      
      if (cachedToken) {
        config.headers.Authorization = `Bearer ${cachedToken}`;
        
        // ✅ LOG: Mostrar el exp del token para verificar
        try {
          const payload = JSON.parse(atob(cachedToken.split('.')[1]));
          const exp = new Date(payload.exp * 1000);
          const iat = new Date(payload.iat * 1000);
          console.log('✅ Token agregado a la petición');
          console.log('📅 Emitido:', iat.toLocaleString());
          console.log('🕐 Expira:', exp.toLocaleString());
        } catch (e) {
          console.log('✅ Token agregado a la petición');
        }
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
    
    // ✅ Si el error es 401 o 403, limpiar cache y storage
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('⚠️ Token inválido o expirado, limpiando...');
      cachedToken = null;
      cacheTimestamp = 0;
      await AsyncStorage.removeItem('token'); // ✅ AQUÍ también: 'token' no 'authToken'
      await AsyncStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

export default api;
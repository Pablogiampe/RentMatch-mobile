import axios from 'axios'

// Configuración base de axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Reemplaza XXX con la IP de tu computadora
  timeout: 10000, // 10 segundos de timeout
  headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json', // Cambiado de multipart/form-data
        },
})

// Interceptor para requests (opcional)
api.interceptors.request.use(
  (config) => {
    console.log('Request:', config.method?.toUpperCase(), config.url)
    // Aquí puedes agregar tokens de autenticación si los necesitas
    // const token = await AsyncStorage.getItem('authToken')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('Response error:', error.message)
    console.error('Error details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    })
    return Promise.reject(error)
  }
)

export default api
"use client"

import { createContext, useState, useEffect, useContext } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStoredSession()
  }, [])

  const checkStoredSession = async () => {
    try {
      // ✅ Usar 'token' en lugar de 'authToken' para que coincida con api.js
      const token = await AsyncStorage.getItem('token')
      const userData = await AsyncStorage.getItem('user')
      
      if (token && userData) {
        // ✅ Verificar si el token expiró
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          const exp = payload.exp * 1000
          
          if (Date.now() >= exp) {
            console.log('⚠️ Token expirado, limpiando storage...')
            await AsyncStorage.removeItem('token')
            await AsyncStorage.removeItem('user')
            setLoading(false)
            return
          }
        } catch (e) {
          console.error('Error al verificar token:', e)
        }

        const user = JSON.parse(userData)
        setUser(user)
        setSession({ user, token })
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error checking session:', error)
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('Iniciando login con:', { email, password });

      const response = await fetch('https://rentmatch-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Datos recibidos:', data);

      if (!response.ok) {
        return { data: null, error: { message: data.message || 'Error en el login' } };
      }

      // ✅ Guardar con las claves correctas: 'token' y 'user'
      await AsyncStorage.setItem('token', data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      // ✅ Esperar un poco para asegurar que se guardó
      await new Promise(resolve => setTimeout(resolve, 100));

      // ✅ Verificar que se guardó
      const savedToken = await AsyncStorage.getItem('token');
      console.log('✅ Token guardado?', savedToken === data.access_token ? 'SÍ ✅' : 'NO ❌');

      setUser(data.user);
      setSession({ user: data.user, token: data.access_token });

      return { data, error: null };
    } catch (error) {
      console.error('Error en el login:', error);
      return { data: null, error: { message: error.message || 'Error de conexión' } };
    }
  };

  const signOut = async () => {
    try {
      setUser(null)
      setSession(null)
      
      // ✅ Limpiar con las claves correctas
      await AsyncStorage.removeItem('token')
      await AsyncStorage.removeItem('user')

      return { error: null }
    } catch (error) {
      return { error: { message: error.message || 'Error al cerrar sesión' } }
    }
  }

  const forgotPassword = async (email) => {
    try {
      console.log('Iniciando proceso de recuperación de contraseña con:', { email });

      const response = await fetch('https://rentmatch-backend.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('Datos recibidos:', data);

      if (!response.ok) {
        return { data: null, error: { message: data.message || 'Error al solicitar recuperación de contraseña' } };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error en el proceso de recuperación de contraseña:', error);
      return { data: null, error: { message: error.message || 'Error de conexión' } };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
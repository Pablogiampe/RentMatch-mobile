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
      const token = await AsyncStorage.getItem('token')
      const userData = await AsyncStorage.getItem('user')
  
      if (token && userData) {
        setSession(token)
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error('Error checking session:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('Iniciando login con:', { email, password });

      const response = await fetch('http://192.168.1.36:5000/api/mobile-auth/login-mobile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Datos recibidos:', data);

      if (!response.ok) {
        const errorMessage = typeof data === 'string' ? data : JSON.stringify(data);
        return { data: null, error: { message: errorMessage || 'Error en el login' } };
      }

      // ✅ Guardar en AsyncStorage pero NO actualizar el estado aún
      await AsyncStorage.setItem('token', data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      // ✅ Retornar los datos para que LoginScreen maneje la animación
      return { data, error: null };
    } catch (error) {
      console.error('Error en signIn:', error);
      const errorMessage = error.message || JSON.stringify(error);
      return { data: null, error: { message: errorMessage } };
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
    checkStoredSession,
    signOut,
    forgotPassword,
    setSession, // ✅ Agregar
    setUser,    // ✅ Agregar
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
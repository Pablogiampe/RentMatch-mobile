"use client"

import { createContext, useState, useEffect, useContext } from "react"
import api from "../services/api"
import { supabase } from "../services/supabase"
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStoredSession()
  }, [])

  // ✅ Función corregida
  const checkStoredSession = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken')
      const userData = await AsyncStorage.getItem('userData')
      
      if (token && userData) {
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

      // ✅ Guardar datos correctamente
      await AsyncStorage.setItem('authToken', data.access_token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));

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
      
      // ✅ Limpiar ambos items
      await AsyncStorage.removeItem('authToken')
      await AsyncStorage.removeItem('userData')

      return { error: null }
    } catch (error) {
      return { error: { message: error.message || 'Error al cerrar sesión' } }
    }
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { data, error }
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
    resetPassword,
    updatePassword,
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

"use client"

import { createContext, useState, useEffect, useContext } from "react"
import api from "../services/api"
import { supabase } from "../services/supabase"

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay una sesión guardada localmente
    const checkStoredSession = async () => {
      try {
        // Aquí podrías verificar un token almacenado localmente
        // Por ejemplo, usando AsyncStorage
        // const token = await AsyncStorage.getItem('authToken')
        // if (token) {
        //   // Verificar el token con tu backend
        //   const response = await fetch('http://localhost:5000/api/auth/verify', {
        //     headers: { Authorization: `Bearer ${token}` }
        //   })
        //   if (response.ok) {
        //     const userData = await response.json()
        //     setUser(userData.user)
        //     setSession({ user: userData.user, token })
        //   }
        // }
        setLoading(false)
      } catch (error) {
        console.error('Error checking session:', error)
        setLoading(false)
      }
    }

    checkStoredSession()
  }, [])

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

      console.log('Respuesta del servidor:', response);

      const data = await response.json();
      console.log('Datos recibidos:', data);

      if (!response.ok) {
        console.log('Error en la respuesta del servidor:', data);
        return { data: null, error: { message: data.message || 'Error en el login' } };
      }

      setUser(data.user || data);
      setSession(data.session || { user: data.user || data });

      return { data, error: null };
    } catch (error) {
      console.error('Error en el login:', error);
      return { data: null, error: { message: error.message || 'Error de conexión' } };
    }
  };

  const signOut = async () => {
    try {
      // Opcional: llamar al endpoint de logout de tu backend
      // await fetch('http://localhost:5000/api/auth/logout', {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${session?.token}` }
      // })

      // Limpiar el estado local
      setUser(null)
      setSession(null)
      
      // Opcional: limpiar AsyncStorage
      // await AsyncStorage.removeItem('authToken')

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

      console.log('Respuesta del servidor:', response);

      const data = await response.json();
      console.log('Datos recibidos:', data);

      if (!response.ok) {
        console.log('Error en la respuesta del servidor:', data);
        return { data: null, error: { message: data.message || 'Error al solicitar recuperación de contraseña' } };
      }

      console.log('Recuperación de contraseña exitosa:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error en el proceso de recuperación de contraseña:', error);
      return { data: null, error: { message: error.message || 'Error de conexión' } };
    }
  };

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const response = await signIn(email, password);
      // Manejar respuesta exitosa
    } catch (error) {
      console.error('Login error:', error);
      // Mostrar error al usuario de manera más específica
      if (error.message === 'Network request failed') {
        setError('Error de conexión. Verifica tu conexión a internet.');
      } else {
        setError('Error al iniciar sesión. Verifica tus credenciales.');
      }
    } finally {
      setLoading(false);
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
    forgotPassword, // 👈 Agregado aquí
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

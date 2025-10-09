"use client"

import { createContext, useState, useEffect, useContext } from "react"
import api from "../services/api"

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
      const response = await api.post('/auth/login', {
        email,
        password,
      })

      const data = response.data

      // Si el login es exitoso, actualizar el estado del usuario y sesión
      setUser(data.user || data)
      setSession(data.session || { user: data.user || data })

      return { data, error: null }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        data: null, 
        error: { 
          message: error.response?.data?.message || error.message || 'Error de conexión' 
        } 
      }
    }
  }

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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

"use client"

import React, { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../services/api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const userStr = await AsyncStorage.getItem("user")

      if (token && userStr) {
        const userData = JSON.parse(userStr)
        setUser(userData)
        setIsAuthenticated(true)
      }
    } catch (err) {
      console.error("Error al verificar autenticación:", err)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      console.log("Intentando login con:", email)
      const response = await api.post("/auth/login", { email, password })

      console.log("Datos recibidos:", response.data)

      // ✅ FIX: El backend devuelve access_token, no token
      const token = response.data.access_token
      const userData = response.data.user

      if (!token) {
        throw new Error("No se recibió token del servidor")
      }

      console.log("✅ Login exitoso")
      console.log("🔑 Token recibido:", token.substring(0, 50) + "...")
      console.log("👤 Usuario:", userData.email)

      // ✅ Guardar token y usuario
      await AsyncStorage.setItem("token", token)
      await AsyncStorage.setItem("user", JSON.stringify(userData))

      // ✅ Verificar que se guardó correctamente
      const savedToken = await AsyncStorage.getItem("token")
      console.log("✅ Token guardado correctamente?", savedToken ? "SÍ" : "NO")

      setUser(userData)
      setIsAuthenticated(true)

      return { success: true }
    } catch (err) {
      console.error("❌ Error en signIn:", err.response?.data || err.message)
      const errorMessage = err.response?.data?.message || "Error al iniciar sesión"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem("token")
      await AsyncStorage.removeItem("user")
      setUser(null)
      setIsAuthenticated(false)
    } catch (err) {
      console.error("Error al cerrar sesión:", err)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
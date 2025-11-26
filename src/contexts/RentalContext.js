"use client"

import React, { createContext, useState, useContext, useCallback } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { useAuth } from "./AuthContext"

const RentalContext = createContext()

export const RentalProvider = ({ children }) => {
  const { user } = useAuth()
  const [activeRentals, setActiveRentals] = useState([])
  const [rentalHistory, setRentalHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadRentals = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No hay usuario, no se cargan alquileres')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('📡 Cargando alquileres para usuario:', user.id)
      const token = await AsyncStorage.getItem('token')
      
      if (!token) {
        console.log('⚠️ No hay token')
        return
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }

      const baseURL = "https://rentmatch-backend.onrender.com"

      // 1. Cargar Alquileres Activos
      // Usamos el endpoint bajo /mobile-user que suele usar el token para identificar al usuario
      const activeResponse = await axios.post(
        `${baseURL}/api/mobile-user/profile`,
        {},
        config
      )

      console.log('✅ Respuesta alquileres activos:', activeResponse.data)

      if (activeResponse.data && Array.isArray(activeResponse.data.data)) {
        setActiveRentals(activeResponse.data.data)
      } else if (Array.isArray(activeResponse.data)) {
        setActiveRentals(activeResponse.data)
      } else {
        setActiveRentals([])
      }

      // 2. Cargar Historial
      try {
        const historyResponse = await axios.get(
          `${baseURL}/api/mobile-user/traer-historial`,
          config
        )
        
        if (historyResponse.data && Array.isArray(historyResponse.data.data)) {
          setRentalHistory(historyResponse.data.data)
        } else if (Array.isArray(historyResponse.data)) {
          setRentalHistory(historyResponse.data)
        }
      } catch (historyError) {
        console.log('ℹ️ No se pudo cargar el historial:', historyError.message)
        setRentalHistory([])
      }

    } catch (error) {
      console.error('❌ Error al cargar alquileres:', error)
      console.error('Detalles:', error.response?.data || error.message)
      setError(error.response?.data?.message || 'Error al cargar los alquileres')
      setActiveRentals([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  return (
    <RentalContext.Provider value={{ activeRentals, rentalHistory, loading, error, loadRentals }}>
      {children}
    </RentalContext.Provider>
  )
}

export const useRental = () => {
  const ctx = useContext(RentalContext)
  if (!ctx) throw new Error("useRental debe ser usado dentro de un RentalProvider")
  return ctx
}
// ...existing code...
"use client"

import React, { createContext, useState, useContext } from "react"
import api from '../services/api'

const RentalContext = createContext()

// Servicio local
const rentalService = {
  getRentalHistory: async () => {
    // El backend toma el userId del token; no necesita query param
    const url = `/mobile-user/traer-historial`
    console.log('➡️ GET', (api.defaults?.baseURL || '') + url)
    const res = await api.get(url)
    // El backend responde { success: true, data: [...] }
    const rentals = Array.isArray(res.data?.data) ? res.data.data : []
    return rentals
  },
}

export const RentalProvider = ({ children }) => {
  const [activeRentals, setActiveRentals] = useState([])
  const [rentalHistory, setRentalHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // userId es opcional, no se usa (lo toma el backend del token)
  const loadRentals = async (_userId) => {
    try {
      setLoading(true)
      setError(null)

      const allRentals = await rentalService.getRentalHistory()

      const active = allRentals.filter(r =>
        r.status === 'active' || r.status === 'activo' ||
        !r.end_date || new Date(r.end_date) > new Date()
      )
      const history = allRentals.filter(r =>
        r.status === 'completed' || r.status === 'finalizado' ||
        (r.end_date && new Date(r.end_date) <= new Date())
      )

      setActiveRentals(active)
      setRentalHistory(history)
    } catch (e) {
      console.error('Error al cargar alquileres:', e)
      setError('No se pudieron cargar los alquileres. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

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
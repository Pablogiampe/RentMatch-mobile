"use client"

import React, { createContext, useState, useContext } from "react"
import api from '../services/api'

const RentalContext = createContext()

const rentalService = {
  getRentalHistory: async () => {
    const url = `/mobile-user/traer-historial`
    console.log('➡️ GET', (api.defaults?.baseURL || '') + url)
    const res = await api.get(url)
    const rentals = Array.isArray(res.data?.data) ? res.data.data : []
    return rentals
  },
}

export const RentalProvider = ({ children }) => {
  const [activeRentals, setActiveRentals] = useState([])
  const [rentalHistory, setRentalHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadRentals = async () => {
    try {
      setLoading(true)
      setError(null)

      const allRentals = await rentalService.getRentalHistory()

      // Filtrar solo las propiedades activas
      const active = allRentals.filter(r =>
        r.status === 'active' || r.status === 'activo'
      )
      // Filtrar solo el historial
      const history = allRentals.filter(r =>
        r.status === 'completed' || r.status === 'finalizado'|| r.status === 'pending_deposit'
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
"use client"

import React, { createContext, useState, useContext, useCallback } from "react"
import api from '../services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { all } from "axios"

const RentalContext = createContext()

const rentalService = {
  getRentalHistory: async () => {
    const url = `/mobile-user/traer-historial`
    
    // ✅ Obtener el token y el user_id
    const token = await AsyncStorage.getItem('token')
    const userStr = await AsyncStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    
    console.log('\n🔍 ===== DEBUG INFO =====')
    console.log('Token existe?', token ? '✅ SÍ' : '❌ NO')
    console.log('User ID:', user?.id)
    console.log('URL completa:', api.defaults.baseURL + url)
    console.log('🔍 =======================\n')
    
    try {
      // ✅ Hacer la petición manualmente con headers visibles
      const res = await api.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('\n✅ ===== RESPUESTA EXITOSA =====')
      console.log('Status:', res.status)
      console.log('Success:', res.data.success)
      console.log('Cantidad de registros:', res.data.data?.length)
      
      // ✅ Mostrar TODO el primer registro
      if (res.data.data && res.data.data.length > 0) {
        console.log('\n📝 PRIMER REGISTRO COMPLETO:')
        console.log(JSON.stringify(res.data.data[0], null, 2))
        
        console.log('\n🔑 CAMPOS CLAVE:')
        console.log('  - id:', res.data.data[0].id)
        console.log('  - contract_id:', res.data.data[0].contract_id)
        console.log('  - property_id:', res.data.data[0].property_id)
        console.log('  - address:', res.data.data[0].address)
        console.log('  - address_line:', res.data.data[0].address_line)
        console.log('  - city:', res.data.data[0].city)
        console.log('  - neighborhood:', res.data.data[0].neighborhood)
        console.log('  - property_type:', res.data.data[0].property_type)
        console.log('  - rent_amount:', res.data.data[0].rent_amount)
      }
      console.log('✅ ================================\n')
      
      return res.data?.data || []
    } catch (error) {
      console.error('\n❌ ===== ERROR =====')
      console.error('Status:', error.response?.status)
      console.error('Message:', error.response?.data?.message || error.message)
      console.error('Headers enviados:', error.config?.headers)
      console.error('❌ ===================\n')
      throw error
    }
  },
}

export const RentalProvider = ({ children }) => {
  const [activeRentals, setActiveRentals] = useState([])
  const [rentalHistory, setRentalHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadRentals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const allRentals = await rentalService.getRentalHistory()
      
      console.log('\n📊 ===== RESUMEN =====')
      console.log('Total recibidos:', allRentals.length)
      console.log('Primer alquiler tiene address?', allRentals[0]?.address ? '✅ SÍ' : '❌ NO')
      console.log('📊 ====================\n')

      // ✅ Filtrar activos
      const active = allRentals.filter(r => {
        const status = String(r.status || '').toLowerCase()
        return ['active', 'activo', 'signed', 'in_progress'].includes(status)
      })

      // ✅ Filtrar historial
      const history = allRentals.filter(r => {
        const status = String(r.status || '').toLowerCase()
        return ['completed', 'finalizado', 'pending_deposit', 'cancelled', 'canceled'].includes(status)
      })
console.log ('deposito pagado' ,history  )
      console.log('Activos:', active.length)
      console.log('Historial:', history.length)

      setActiveRentals(active)
      setRentalHistory(history)
    } catch (e) {
      console.error('❌ Error al cargar alquileres:', e)
      setError('No se pudieron cargar los alquileres. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }, [])

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
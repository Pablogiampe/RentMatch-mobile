"use client"
import { NavigationContainer } from "@react-navigation/native"
import { View, ActivityIndicator, Animated, Dimensions, Easing, StyleSheet } from "react-native"
import { useAuth } from "../contexts/AuthContext"
import AuthStack from "./AuthStack"
import AppStack from "./AppStack"
import MainStack from "./MainStack"
import { useEffect, useRef, useState } from "react"

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function Navigation() {
  const { session, loading, checkStoredSession } = useAuth()
  const [showOverlay, setShowOverlay] = useState(false)
  const overlayAnim = useRef(new Animated.Value(0)).current // ✅ Empieza en 0 (visible)

  useEffect(() => {
    checkStoredSession()
  }, [])

  useEffect(() => {
    if (session && !loading) {
      // ✅ Mostrar overlay naranja cuando hay sesión
      setShowOverlay(true)
      overlayAnim.setValue(0) // ✅ Asegurar que empieza cubriendo toda la pantalla
      
      // ✅ Deslizar hacia arriba después de un pequeño delay
      setTimeout(() => {
        Animated.timing(overlayAnim, {
          toValue: -SCREEN_HEIGHT, // ✅ Se desliza hacia arriba
          duration: 700,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          setShowOverlay(false)
        })
      }, 300) // ✅ Aumentar el delay para dar tiempo al AppStack a renderizar
    }
  }, [session, loading])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A1F" />
      </View>
    )
  }

  return (
    <>
      <NavigationContainer>
        {session ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
      
      {/* ✅ Overlay naranja global */}
      {showOverlay && (
        <Animated.View
          pointerEvents="none" // ✅ No bloquear interacciones
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: SCREEN_HEIGHT,
            backgroundColor: '#FF5A1F',
            zIndex: 9999,
            transform: [{ translateY: overlayAnim }],
          }}
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#fff',
  },
})
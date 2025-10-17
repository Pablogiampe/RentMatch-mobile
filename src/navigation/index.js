"use client"
import { NavigationContainer } from "@react-navigation/native"
import { View, ActivityIndicator, StyleSheet } from "react-native"
import { useAuth } from "../contexts/AuthContext"
import AuthStack from "./AuthStack"
import AppStack from "./AppStack"

export default function Navigation() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }
  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  )
}
const styles = StyleSheet.create({ loadingContainer:{ flex:1, justifyContent:"center", alignItems:"center" }})
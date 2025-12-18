import { StatusBar } from "expo-status-bar"
import { AuthProvider } from "./src/contexts/AuthContext"
import Navigation from "./src/navigation"
import * as SystemUI from 'expo-system-ui'
import { Platform } from 'react-native'

export default function App() {
 if (Platform.OS === 'android') {
    SystemUI.setBackgroundColorAsync("black").catch(console.warn)
  }
  return (
    <AuthProvider>
      <Navigation />
      <StatusBar style="auto" backgroundColor="transparent" translucent />
    </AuthProvider>
  )
}
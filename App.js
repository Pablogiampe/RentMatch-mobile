import { StatusBar } from "expo-status-bar"
import { AuthProvider } from "./src/contexts/AuthContext"
import Navigation from "./src/navigation"
import * as SystemUI from 'expo-system-ui'
import { Platform, Text, View } from 'react-native'
// ✅ Importa desde @env
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from '@env'

// ✅ DEBUG: Log antes de iniciar la app
console.log('🔍 ENV CHECK (App.js):', {
  url: EXPO_PUBLIC_SUPABASE_URL,
  hasKey: !!EXPO_PUBLIC_SUPABASE_ANON_KEY
})

// ✅ Validación antes de renderizar
if (!EXPO_PUBLIC_SUPABASE_URL || !EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red', textAlign: 'center' }}>
        ❌ ERROR: Variables de entorno no configuradas
      </Text>
      <Text style={{ marginTop: 10, textAlign: 'center' }}>
        URL: {EXPO_PUBLIC_SUPABASE_URL || 'MISSING'}{'\n'}
        Key: {EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'EXISTS' : 'MISSING'}
      </Text>
      <Text style={{ marginTop: 20, textAlign: 'center', fontSize: 12 }}>
        Verifica tu archivo .env y babel.config.js
      </Text>
    </View>
  )
}

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
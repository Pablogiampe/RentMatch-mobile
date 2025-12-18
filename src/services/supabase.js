import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
// ✅ Importación directa desde @env (configurado en babel.config.js)
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from '@env'

// Validación robusta
if (!EXPO_PUBLIC_SUPABASE_URL || !EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Variables de entorno faltantes:', {
    url: EXPO_PUBLIC_SUPABASE_URL,
    key: EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Existe' : '❌ Falta'
  })
  throw new Error(
    '❌ Supabase configuration missing!\n' +
    `URL: ${EXPO_PUBLIC_SUPABASE_URL ? '✅' : '❌ Missing'}\n` +
    `Key: ${EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌ Missing'}\n` +
    'Check your .env file and babel.config.js'
  )
}

console.log('🔗 Supabase URL:', EXPO_PUBLIC_SUPABASE_URL)
console.log('🔑 Supabase Key exists:', !!EXPO_PUBLIC_SUPABASE_ANON_KEY)

export const supabase = createClient(
  EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)

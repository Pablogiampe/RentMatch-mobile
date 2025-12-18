import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ✅ Validación robusta con fallback
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Logging para debug (solo en desarrollo)
if (__DEV__) {
  console.log('🔗 Supabase URL:', supabaseUrl);
  console.log('🔑 Supabase Key exists:', !!supabaseAnonKey);
}

// Validación antes de crear el cliente
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `Supabase credentials missing:
    URL: ${supabaseUrl ? '✅' : '❌'}
    Key: ${supabaseAnonKey ? '✅' : '❌'}
  `;
  console.error(errorMsg);

  // En producción, lanza un error más informativo
  throw new Error('Supabase configuration is missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

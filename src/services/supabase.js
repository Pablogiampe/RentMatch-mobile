import "react-native-url-polyfill/auto"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"

// Supabase configuration
const supabaseUrl = "https://tyheaqrxtccgvsrcqkqt.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5aGVhcXJ4dGNjZ3ZzcmNxa3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NzU0NjQsImV4cCI6MjA3MjM1MTQ2NH0.uxzt4On8JEAZZrHVu-wH9VmWuT9aCvLgLEBoxG_LF8U"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

import { StatusBar } from "expo-status-bar"
import { AuthProvider } from "./src/contexts/AuthContext"
import Navigation from "./src/navigation"
import * as SystemUI from 'expo-system-ui';

export default function App() {
  SystemUI.setBackgroundColorAsync("black");

  return (
    <AuthProvider>
      <Navigation />
      <StatusBar style="auto" />
    </AuthProvider>
  )
}

"use client"

import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import InicioSesion from "../../../RentMatch_mobile/assets/InicioSesion"
import { useAuth } from "../../contexts/AuthContext"

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    setLoading(true)

    try {
      console.log('Intentando login con:', email)

      // Usar la lógica de signIn desde AuthContext
      const { data, error } = await signIn(email, password)

      if (error) {
        console.error('Error en el login:', error.message)
        Alert.alert('Error', error.message)
        return
      }

      console.log('Login exitoso:', data)
      Alert.alert("Éxito", "Login exitoso!")
      // Aquí podrías navegar a la pantalla principal

    } catch (error) {
      console.error('Error inesperado:', error)
      Alert.alert("Error", "Ocurrió un error inesperado. Inténtalo de nuevo.")
    }

    setLoading(false)
  }

  return (

    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <InicioSesion style={{ position: "absolute", top: 0, left: 0, }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Para continuar</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Correo Electronico"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
                multiline={false}
                scrollEnabled={true}
                textContentType="emailAddress"
              />
            </View>
            <View style={styles.inputPasswordContainer}>

              <TextInput
                style={styles.inputPassword}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
                multiline={false}
                scrollEnabled={true}
                textContentType="password"
              />
              <TouchableOpacity style={styles.passwordButton} onPress={() => navigation.navigate("ForgotPassword")} disabled={loading}>
                <Text style={styles.forgotPassword}>Recuperar</Text>
              </TouchableOpacity>
            </View>



            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ingresar</Text>}
            </TouchableOpacity>


          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF5A1F",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
    marginBottom: 40,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
    overflow: "hidden",
    textOverflow: "horizontal",
  },
  inputPasswordContainer: {
    height: 48, // Altura fija del contenedor
    marginBottom: 20,
    display: "flex",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(105, 138, 238, 0.5)", 
    borderRadius: 8,
    backgroundColor: "#F1F4FF",
    alignItems: 'center', // Centra verticalmente el contenido
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  input: {
    height: 48, // Altura fija
    borderWidth: 1,
    
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    
    backgroundColor: "#F1F4FF",
    borderWidth: 1,
  borderColor: "rgba(105, 138, 238, 0.5)", // Opacidad 50%
    borderRadius: 8,
    // Propiedades para scroll horizontal
    textAlignVertical: 'center', // Android
    includeFontPadding: false, // Android
  },
  inputPassword: {
    height: 48,
    width: "75%",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'center',
    includeFontPadding: false, 
    overflow: 'hidden', 
  },
  passwordButton: {
    justifyContent: "flex-end",
    marginBlockStart: responsiveHeight(1),
    alignItems: "center",
  },
  forgotPassword: {
    color: "#1F41BB",
    fontWeight: "600",

    justifyContent: "flex-end",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    marginBlockEnd: responsiveHeight(1),
  },
  button: {
    backgroundColor: "#B4BEE2",
    borderWidth: 1,
    borderColor: "#B4BEE2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,

    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#3f3d3dff",
    fontSize: responsiveFontSize(2.3),
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  footerLink: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
})

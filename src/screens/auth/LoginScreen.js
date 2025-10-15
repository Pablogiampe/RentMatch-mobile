"use client"

import React, { useState, useEffect } from "react"
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
  Animated, // ← Agrega esta línea
} from "react-native"
import Checkbox from 'expo-checkbox'; // ← Agrega esta línea
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import InicioSesion from "../../../RentMatch_mobile/assets/InicioSesion"
import { useAuth } from "../../contexts/AuthContext"
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  // Valores animados para el checkbox
  const checkboxScale = useState(new Animated.Value(1))[0]
  const checkboxOpacity = useState(new Animated.Value(0.7))[0]

  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    console.log("Show Password:", showPassword)
  }, [showPassword])
  

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

  // Función para animar cuando se presiona
  const animateCheckboxPress = () => {
    Animated.sequence([
      // Escala down
      Animated.timing(checkboxScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      // Escala up
      Animated.timing(checkboxScale, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      // Vuelve al tamaño normal
      Animated.timing(checkboxScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  // Función para animar la opacidad
  const animateCheckboxOpacity = (isChecked) => {
    Animated.timing(checkboxOpacity, {
      toValue: isChecked ? 1 : 0.7,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }

  // Función que maneja el cambio de estado
  const handleShowPasswordToggle = () => {
    animateCheckboxPress()
    animateCheckboxOpacity(!showPassword)
    setShowPassword(!showPassword)
  }

  if (!fontsLoaded) {
    return null;
  }

  return (

    <KeyboardAvoidingView  style={styles.container}>
      <InicioSesion style={{ position: "absolute", top: 0, left: 0, }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Para continuar ingresa tu cuenta de inquilino</Text>

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
                secureTextEntry={!showPassword}
                editable={!loading}
                multiline={false}
                scrollEnabled={true}
                textContentType="password"
              />
              <TouchableOpacity 
                style={styles.passwordButton} 
                onPress={() => navigation.navigate("ForgotPassword")} 
                disabled={loading}
              >
                <Text style={styles.forgotPassword}>Recuperar</Text>
              </TouchableOpacity>
            </View>

            {/* Checkbox para mostrar contraseña */}
            <View style={styles.checkboxContainer}>
              <Animated.View
                style={{
                  transform: [{ scale: checkboxScale }],
                  opacity: checkboxOpacity,
                }}
              >
                <Checkbox
                  style={styles.checkbox}
                  value={showPassword}
                  onValueChange={handleShowPasswordToggle}
                  color={showPassword ? '#FF5A1F' : '#B4BEE2'}
                />
              </Animated.View>
              <TouchableOpacity 
                onPress={handleShowPasswordToggle}
                style={styles.checkboxTouchable}
              >
                <Text style={styles.checkboxLabel}>Mostrar contraseña</Text>
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
    fontSize: responsiveFontSize(4),
    fontWeight: "bold",
    color: "#FF5A1F",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: responsiveFontSize(2.3),
    color: "#000000",
    fontWeight: "500",
    marginBottom: responsiveHeight(3),
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
    overflow: "hidden",
    textOverflow: "horizontal",
         shadowColor: "#000000ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    
    shadowRadius: 4,
    elevation: 5,
  },
  inputPasswordContainer: {
    height: 48, // Altura fija del contenedor
    display: "flex",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(105, 138, 238, 0.5)", 
    borderRadius: 8,
    backgroundColor: "#F1F4FF",
    alignItems: 'center', 
       shadowColor: "#8e8a8aff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    
    shadowRadius: 4,
    elevation: 3,
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
    color: "#5c5858ff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
        fontWeight: "600",
      fontSize: responsiveFontSize(1.8),
    backgroundColor: "#F1F4FF",
    borderWidth: 1,
  borderColor: "rgba(105, 138, 238, 0.5)", // Opacidad 50%
    borderRadius: 8,
         shadowColor: "#000000ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    
    shadowRadius: 4,
    elevation: 5,
    // Propiedades para scroll horizontal
    textAlignVertical: 'center', // Android
    includeFontPadding: false, // Android
  },
  inputPassword: {
    height: 48,
    width: "75%",
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#5c5858ff",
    fontWeight: "600",
    fontSize: responsiveFontSize(1.8),
    textAlignVertical: 'center',
    includeFontPadding: false, 
    overflow: 'hidden', 
  },
  passwordButton: {
    justifyContent: "flex-end",
    marginBlockStart: responsiveHeight(1),
    marginLeft: responsiveWidth(2),
    alignItems: "center",
  },
  forgotPassword: {
    color: "#1F41BB",
    fontWeight: "600",

    justifyContent: "flex-end",
    fontSize: responsiveFontSize(1.75),
    fontWeight: "600",
    textAlign: "right",
    marginBlockEnd: responsiveHeight(1),
  },
  button: {
    backgroundColor: "#B4BEE2",
    borderWidth: 1,
    borderColor: "#B4BEE2",
    shadowColor: "#000000ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    height: responsiveHeight(6.5),

    borderRadius: 8,
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(1.5),
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: responsiveFontSize(2.4),
    color: "#3f3d3dff",
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(1),
  },
  checkbox: {
    marginRight: responsiveWidth(2),
    width: responsiveWidth(5),
    height: responsiveWidth(5),
  },
  checkboxTouchable: {
    flex: 1,
    paddingVertical: responsiveHeight(1),
  },
  checkboxLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: responsiveFontSize(1.8),
    color: '#666',

    marginLeft: responsiveWidth(1),
  },
})

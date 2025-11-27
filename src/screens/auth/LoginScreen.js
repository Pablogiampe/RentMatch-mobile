"use client"

import React, { useState, useEffect, useRef } from "react"
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
  Animated,
  Dimensions,
  Easing,
} from "react-native"
import Checkbox from 'expo-checkbox'; // ← Agrega esta línea
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import InicioSesion from "../../../RentMatch_mobile/assets/InicioSesion"
import { useAuth } from "../../contexts/AuthContext"
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

const LoginScreen = ({ navigation }) => {
  // const [email, setEmail] = useState("daviddf2497@gmail.com")
  // const [password, setPassword] = useState("123123123")
    const [email, setEmail] = useState("pablo.giampetruzzi@davinci.edu.ar")
  const [password, setPassword] = useState("Pablin100")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, setSession, setUser } = useAuth()

  // Valores animados para el checkbox
  const checkboxScale = useState(new Animated.Value(1))[0]
  const checkboxOpacity = useState(new Animated.Value(0.7))[0]
  // Referencias para los TextInput
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const { height: SCREEN_HEIGHT } = Dimensions.get("window")
  const fillAnim = useRef(new Animated.Value(0)).current
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    console.log("Show Password:", showPassword)
  }, [showPassword])

  useEffect(() => {
    // por si se vuelve a esta pantalla, resetear
    fillAnim.setValue(0)
  }, [])

  useEffect(() => {
    // Resetear animación cuando el componente se monta
    fillAnim.setValue(0)
  }, [])

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    setLoading(true)

    try {
      console.log('Intentando login con:', email)

      const { data, error } = await signIn(email, password)

      if (error) {
        console.error('Error en el login:', error.message)
        Alert.alert('Error', error.message)
        setLoading(false)
        return
      }

      console.log('Login exitoso:', data)
      
      // ✅ Iniciar animación primero
      Animated.timing(fillAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        // ✅ Actualizar el estado de auth
        setSession(data.access_token)
        setUser(data.user)
        setLoading(false)
        
        // ✅ Navegar normalmente dentro del mismo stack
        navigation.navigate('HomeScreen')
      })

    } catch (error) {
      console.error('Error inesperado:', error)
      Alert.alert("Error", "Ocurrió un error inesperado. Inténtalo de nuevo.")
      setLoading(false)
    }
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
    <KeyboardAvoidingView style={styles.container}>
      <InicioSesion style={{ position: "absolute", top: 0, left: 0, }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Bienvenido a RentMatch </Text>
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
                // ✅ Nuevas props para el botón del teclado
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                ref={emailRef}
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
                // ✅ Nuevas props para el botón del teclado
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                ref={passwordRef}
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
              {loading ? <ActivityIndicator
                color="#314979ff"
                size="large"
                style={{ alignSelf: 'center', marginVertical: responsiveHeight(0.5) }}
              /> : <Text style={styles.buttonText}>Ingresar</Text>}
            </TouchableOpacity>


          </View>
        </View>
      </ScrollView>

      {/* Overlay naranja que crece hasta altura total */}
      <Animated.View
        pointerEvents="none"
        style={[styles.footer, { height: fillAnim }]}
      />
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
    fontSize: responsiveFontSize(3.9),
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
    overflow: "hidden",
    marginBottom: 20,
    textOverflow: "horizontal",
    shadowColor: "#8e8a8aff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,

    shadowRadius: 4,
    elevation: 3,
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
    height: responsiveHeight(5.5),

    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: responsiveFontSize(2.4),
    marginVertical: responsiveHeight(1),
    color: "#3f3d3dff",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FF5A1F",
    zIndex: 9999,
    elevation: 9999,
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

export default LoginScreen

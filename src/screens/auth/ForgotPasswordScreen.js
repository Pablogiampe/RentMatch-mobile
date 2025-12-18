"use client"

import { useState, useRef } from "react"
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
import { useAuth } from "../../contexts/AuthContext"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import Recuperacion from "../../../RentMatch_mobile/assets/Recuperacion"
const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { forgotPassword } = useAuth()
  const emailRef = useRef(null);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor ingresa tu email")
      return
    }

    console.log("[ForgotPassword] start", { email })
    setLoading(true)
    try {
      const { error } = await forgotPassword(email)
      console.log("[ForgotPassword] response", { error })
      if (error) {
        Alert.alert("Error", error.message || "No se pudo enviar el email")
      } else {
        Alert.alert(
          "Email enviado",
          "Revisa tu correo para restablecer tu contraseña",
          [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        )
      }
    } catch (e) {
      console.log("[ForgotPassword] exception", e)
      Alert.alert("Error", "Ocurrió un error inesperado")
    } finally {
      setLoading(false)
      console.log("[ForgotPassword] end")
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container}>
      <Recuperacion style={{ position: "absolute", width: "100%", height: "100%" }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Recuperar tu contraseña</Text>
          <Text style={styles.subtitle}>Ingresa tu correo electronico para que te enviemos un codigo</Text>

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

                placeholderTextColor="#5c5858ff"
                textContentType="emailAddress"
                // returnKeyType="done"
                // onSubmitEditing={}
                ref={emailRef}
              />
            </View>



            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continuar</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.buttonText, { color: "#FF5A1F", fontSize: responsiveFontSize(2), margin: "auto" }]}>Volver</Text>}
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
    borderWidth: 1,
    borderColor: "rgba(105, 138, 238, 0.5)",
    borderRadius: 8,
    shadowColor: "#8e8a8aff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,

    shadowRadius: 4,
    elevation: 3,
  },
  inputPasswordContainer: {
    height: 48, // Altura fija del contenedor
    display: "flex",
    flexDirection: "row",
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
    borderWidth: 1,
    color: "#5c5858ff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontWeight: "600",
    fontSize: responsiveFontSize(1.8),
    backgroundColor: "#F1F4FF",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "rgba(105, 138, 238, 0.2)",
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
    fontSize: responsiveFontSize(1.7),
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

export default ForgotPasswordScreen

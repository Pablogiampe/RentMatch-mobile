"use client"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import IconComponent from "../../../RentMatch_mobile/assets/icons"
import IncidenciasSvg from "../../../RentMatch_mobile/assets/IncidenciasSvg"
export default function IncidenciasScreen() {
  const navigation = useNavigation()
  const route = useRoute()

  // si querés pasar título desde otra pantalla: route.params?.title
  const propertyTitle = route.params?.title || "Departamento en Belgrano"

  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("") // string simple para evitar dependencia extra
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [agree, setAgree] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // ajustar header si querés back button nativo
    navigation.setOptions?.({
      headerShown: false,
    })
  }, [])

  const validateAndSubmit = () => {
    if (!reason.trim()) return Alert.alert("Falta razón", "Completá el campo Razón.")
    if (!description.trim()) return Alert.alert("Falta descripción", "Completá la descripción.")
    if (!date.trim()) return Alert.alert("Falta fecha", "Seleccioná una fecha.")
    if (!contactName.trim()) return Alert.alert("Falta nombre", "Completá tu nombre.")
    if (!contactEmail.trim()) return Alert.alert("Falta email", "Completá tu email.")
    if (!agree) return Alert.alert("Aceptar términos", "Aceptá los términos y condiciones para enviar.")

    setSubmitting(true)

    // Simulación de envío
    setTimeout(() => {
      setSubmitting(false)
      Alert.alert("Enviado", "Tu incidencia fue enviada correctamente.")
      navigation.goBack?.()
    }, 900)
  }

  return (
    <KeyboardAvoidingView  >
      <IncidenciasSvg />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack?.()}>
            <IconComponent name="back-arrow" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Solicitar Peritaje</Text>
          <View style={styles.topSpacer} />
        </View>

        <View style={styles.card}>
          <Text style={styles.propertyTitle}>{propertyTitle}</Text>

          <Text style={styles.label}>Razón</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            style={styles.input}
            placeholderTextColor="#9BA3C7"
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textarea]}
            placeholderTextColor="#9BA3C7"
            multiline
          />
          <View style={styles.inputPasswordContainer}>
            <TextInput
              style={styles.inputPassword}

              multiline={false}
              scrollEnabled={true}
              // ✅ Nuevas props para el botón del teclado
              returnKeyType="done"
            />
          </View>
           <View style={styles.inputPasswordContainer}>
            <TextInput
              style={styles.inputPassword}
              placeholder="Contraseña"
              multiline={false}
              scrollEnabled={true} 
              // ✅ Nuevas props para el botón del teclado
              returnKeyType="done"
            />
          </View>
          <Text style={styles.label}>Fecha</Text>
          <TouchableOpacity style={styles.input} onPress={() => {
            // uso simple: abrir prompt para ingresar fecha rápido
            // podés reemplazar por DatePicker nativo si lo preferís
            const today = new Date().toLocaleDateString()
            setDate(prev => prev || today)
            Alert.alert("Seleccionar fecha", "Fecha fijada a hoy (puedes reemplazar por DatePicker).")
          }}>
            <Text style={date ? styles.inputText : styles.inputPlaceholder}>
              {date || "Seleccionar fecha"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Información de contacto</Text>

          <TextInput
            value={contactName}
            onChangeText={setContactName}
            style={styles.input}
            placeholderTextColor="#9BA3C7"
          />
          <TextInput
            value={contactEmail}
            onChangeText={setContactEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            placeholderTextColor="#9BA3C7"
          />
          <TextInput
            value={contactPhone}
            onChangeText={setContactPhone}
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor="#9BA3C7"
          />

          <TouchableOpacity style={styles.termsRow} onPress={() => setAgree(!agree)} activeOpacity={0.8}>
            <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
              {agree && <IconComponent name="check" />}
            </View>
            <Text style={styles.termsText}>Estoy de acuerdo con los términos y condiciones</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={validateAndSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitText}>{submitting ? "Enviando..." : "Enviar"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "none" },
  container: {
    padding: responsiveWidth(4),
    alignItems: "center",
    backgroundColor: "none",
    height: "100%",

  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
    marginTop: responsiveHeight(4),
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    color: "red",
    alignItems: "center",
  },
  topTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: responsiveFontSize(2.2),
    fontWeight: "600",
    color: "#0B0B0C",
  },
  topSpacer: { width: 36 },
  card: {
    width: "100%",
    height: "100%",
    backgroundColor: "none",
    borderRadius: 10,
    padding: responsiveWidth(2),

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
  propertyTitle: {
    textAlign: "center",
    fontSize: responsiveFontSize(2.4),
    fontWeight: "700",
    marginBottom: responsiveHeight(2),
    color: "#111213",
  },
  label: {
    fontSize: responsiveFontSize(1.6),
    color: "#222",
    marginBottom: responsiveHeight(0.5),
  },
  input: {
    backgroundColor: "#F5F8FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D8E0FF",
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1.6),
    marginBottom: responsiveHeight(1.4),
  },
  inputText: {
    color: "#111",
  },
  inputPlaceholder: {
    color: "#9BA3C7",
  },
  textarea: {
    minHeight: responsiveHeight(12),
    textAlignVertical: "top",
  },
  sectionTitle: {
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(0.5),
    fontWeight: "600",
    color: "#444",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: responsiveHeight(1.2),
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E86B3A",
    marginRight: responsiveWidth(2),
    backgroundColor: "#fff",

    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#FF5A1F",
    borderColor: "#FF5A1F",
  },
  termsText: {
    flex: 1,
    fontSize: responsiveFontSize(1.5),
    color: "#333",
  },
  submitButton: {
    marginTop: responsiveHeight(1.5),
    backgroundColor: "#FF5A1F",
    paddingVertical: responsiveHeight(1.8),
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: responsiveFontSize(1.9),
  },
})
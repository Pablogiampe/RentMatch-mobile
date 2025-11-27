"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import * as ImagePicker from "expo-image-picker"
import IconComponent from "../../../RentMatch_mobile/assets/icons"
import { useAuth } from "../../contexts/AuthContext"

const ORANGE = "#FF5A1F"

const InitialStateScreen = ({ route, navigation }) => {
  const { token, session } = useAuth()
  const activeToken = token || session

  // ELIMINADO: const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [images, setImages] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const initialRef = useRef({ description: "", imagesLen: 0 })
  const isDirty =
    description !== initialRef.current.description ||
    images.length !== initialRef.current.imagesLen

  const propertyTitle = route?.params?.title || "Propiedad"
  const contractId = route?.params?.contract_id
  const rentalData = route?.params?.rentalData || {}
  
  const address = rentalData.address || ""
  const neighborhood = rentalData.neighborhood || ""
  const fullAddress = [address, neighborhood].filter(Boolean).join(", ")

  const confirmLeaveIfDirty = (onProceed) => {
    if (!isDirty) {
      onProceed()
      return
    }
    Alert.alert(
      "Salir",
      "Tenés cambios sin guardar. ¿Guardar como borrador o descartar?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Descartar", style: "destructive", onPress: onProceed },
        { text: "Guardar borrador", onPress: () => { handleSaveDraft(); onProceed() } },
      ]
    )
  }

  const handleBack = () => confirmLeaveIfDirty(() => navigation.goBack())

  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", (e) => {
      if (!isDirty) return
      e.preventDefault()
      confirmLeaveIfDirty(() => navigation.dispatch(e.data.action))
    })
    return unsub
  }, [navigation, isDirty])

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tus fotos para subir imágenes.")
      return false
    }
    return true
  }

  const handlePickImage = async () => {
    const ok = await requestPermission()
    if (!ok) return
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    })
    if (!result.canceled) {
      const uri = result.assets[0]?.uri
      if (uri) setImages((prev) => [...prev, { uri, id: Date.now().toString() }])
    }
  }

  const removeImage = (id) => setImages((prev) => prev.filter((i) => i.id !== id))

  const handleSaveDraft = () => {
    Alert.alert("Borrador guardado", "Se guardó el registro inicial como borrador.")
  }

  const handleSubmit = async () => {
    if (!contractId) {
      return Alert.alert("Error", "No se encontró el contrato asociado.")
    }
    // ELIMINADO: if (!title.trim()) return Alert.alert("Falta título", "Por favor ingresá un título.")
    if (!description.trim()) return Alert.alert("Falta descripción", "Por favor ingresá una descripción.")

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("contract_id", String(contractId))
      
      // RESTAURADO: Enviamos valores por defecto para campos que el backend requiere
      formData.append("title", "Estado Inicial")
      formData.append("description", description)
      formData.append("room", "General")
      formData.append("state", "media")

      // Append images
      images.forEach((img) => {
        const filename = img.uri.split('/').pop()
        const match = /\.(\w+)$/.exec(filename)
        const type = match ? `image/${match[1]}` : `image/jpeg`
        
        // CAMBIO: Volvemos a usar 'images' para coincidir con IncidenciasScreen
        formData.append('images', {
          uri: img.uri,
          name: filename,
          type,
        })
      })

      console.log("🚀 Enviando estado inicial...", { contractId, imagesCount: images.length })

      const response = await fetch("https://rentmatch-backend.onrender.com/api/mobile-Inicial/inicialState", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${activeToken}`,
          // Content-Type se establece automáticamente con FormData
        },
        body: formData
      })

      // CAMBIO: Leer texto primero para evitar el crash si devuelve HTML
      const responseText = await response.text()
      console.log("📩 Respuesta cruda servidor:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        // Si falla el parseo, es porque devolvió HTML u otra cosa
        console.error("Error al parsear JSON:", e)
        throw new Error(`Error del servidor (${response.status}): La respuesta no es un JSON válido.`)
      }

      console.log("📩 Respuesta parseada:", response.status, data)

      if (!response.ok) {
        throw new Error(data.message || "No se pudo enviar el registro.")
      }

      Alert.alert("Registro enviado", "El estado inicial se ha registrado correctamente.", [
        { 
          text: "OK", 
          onPress: () => {
            // Limpiar formulario
            // ELIMINADO: setTitle("")
            setDescription("")
            setImages([])
            setTimeout(() => navigation.goBack(), 100)
          } 
        }
      ])

    } catch (error) {
      console.error("❌ Error submit:", error)
      Alert.alert("Error", error.message || "Ocurrió un error al enviar.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.back} onPress={handleBack}>
              <IconComponent name="back-arrow" />
            </TouchableOpacity>
            <Text style={styles.topTitle}>Registro Estado Inicial</Text>
            <View style={styles.topSpacer} />
          </View>

          <View style={styles.card}>
            <View style={styles.headerInfo}>
              <Text style={styles.propertyTitle}>{propertyTitle}</Text>
              {fullAddress ? <Text style={styles.propertyAddress}>{fullAddress}</Text> : null}
            </View>

            {/* Descripcion */}
            <Text style={styles.label}>Descripción</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descripción detallada del estado..."
                placeholderTextColor="#9BA3C7"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            {/* Imagenes */}
            <Text style={styles.label}>Evidencia fotográfica</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage}>
              <View style={styles.uploadIconBox}>
                <IconComponent name="upload" />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.uploadTitle}>Subir fotos</Text>
                <Text style={styles.helperText}>
                  Agregá fotos para documentar el estado
                </Text>
              </View>
              <Text style={{color: ORANGE, fontSize: 24}}>+</Text>
            </TouchableOpacity>

            {/* Galeria */}
            {images.length > 0 && (
              <View style={styles.gallery}>
                {images.map((img) => (
                  <View key={img.id} style={styles.thumbWrap}>
                    <Image source={{ uri: img.uri }} style={styles.thumb} />
                    <TouchableOpacity style={styles.removePill} onPress={() => removeImage(img.id)}>
                      <Text style={styles.removeText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Botones */}
            <TouchableOpacity style={styles.draftBtn} onPress={handleSaveDraft}>
              <Text style={styles.draftText}>Guardar Borrador</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Enviar Registro</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: responsiveWidth(4),
    flexGrow: 1,
    paddingBottom: responsiveHeight(10),
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
    alignItems: "center",
  },
  topTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: responsiveFontSize(2.2),
    fontWeight: "600",
    color: "#0B0B0C",
    fontFamily: "Poppins_600SemiBold",
  },
  topSpacer: { width: 36 },
  
  card: {
    width: "100%",
    backgroundColor: "transparent",
    borderRadius: 10,
    padding: responsiveWidth(2),
  },
  headerInfo: {
    alignItems: 'center',
    marginBottom: responsiveHeight(3),
  },
  propertyTitle: {
    textAlign: "center",
    fontSize: responsiveFontSize(2.4),
    fontWeight: "700",
    color: "#111213",
    fontFamily: "Poppins_700Bold",
    marginBottom: 4,
  },
  propertyAddress: {
    textAlign: "center",
    fontSize: responsiveFontSize(1.6),
    color: "#666",
    fontFamily: "Poppins_400Regular",
  },
  label: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: 'Poppins_600SemiBold',
    color: "#222",
    marginBottom: responsiveHeight(0.8),
    marginTop: responsiveHeight(1),
  },
  
  inputContainer: {
    height: 48,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(105, 138, 238, 0.5)",
    borderRadius: 8,
    backgroundColor: "#F1F4FF",
    alignItems: "center",
    shadowColor: "#8e8a8aff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: responsiveHeight(2),
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    color: "#5c5858ff",
    fontWeight: "600",
    fontSize: responsiveFontSize(1.8),
    fontFamily: "Poppins_400Regular",
  },
  textAreaContainer: {
    height: undefined,
    minHeight: responsiveHeight(12),
    alignItems: "flex-start",
    paddingVertical: responsiveHeight(1),
  },
  textArea: {
    textAlignVertical: "top",
    height: "100%",
  },

  uploadBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4EC",
    borderWidth: 1,
    borderColor: "#FFD6BF",
    borderRadius: 12,
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },
  uploadIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveWidth(3),
  },
  uploadTitle: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: "700",
    color: "#FF5A1F",
    fontFamily: "Poppins_600SemiBold",
  },
  helperText: {
    fontSize: responsiveFontSize(1.4),
    color: "#666",
    fontFamily: "Poppins_400Regular",
  },

  gallery: { flexDirection: "row", flexWrap: "wrap", gap: responsiveWidth(2), marginBottom: responsiveHeight(2) },
  thumbWrap: { position: "relative" },
  thumb: { width: responsiveWidth(26), height: responsiveWidth(26), borderRadius: 8 },
  removePill: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: ORANGE,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fff"
  },
  removeText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  draftBtn: { alignItems: "center", paddingVertical: responsiveHeight(1.6), marginBottom: responsiveHeight(1) },
  draftText: { fontSize: responsiveFontSize(1.8), fontWeight: "600", color: "#666", fontFamily: "Poppins_600SemiBold" },

  submitBtn: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: responsiveHeight(1.8),
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: responsiveHeight(4),
  },
  submitText: {
    color: "#fff",
    fontSize: responsiveFontSize(2.2),
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
  },
})
export default InitialStateScreen
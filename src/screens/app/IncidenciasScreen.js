import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from "react-native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import * as ImagePicker from "expo-image-picker"
import IconComponent from "../../../RentMatch_mobile/assets/icons"
import IncidenciasSvg from "../../../RentMatch_mobile/assets/IncidenciasSvg"
import { useAuth } from "../../contexts/AuthContext"
import CustomAlert from "../../components/CustomAlert"
import { supabase } from "../../services/supabase"

const ORANGE = "#FF5A1F"

const IncidenciasScreen = ({ route, navigation }) => {
  const { token, session } = useAuth()
  const activeToken = token || session
  
  const contractId = route?.params?.contract_id
  const propertyTitle = route?.params?.title || "Propiedad"

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [urgency, setUrgency] = useState(null)
  const [images, setImages] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // Estado para CustomAlert
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    onClose: null
  })

  const showAlert = (title, message, onClose = null) => {
    setAlertConfig({ visible: true, title, message, onClose })
  }

  const hideAlert = () => {
    const callback = alertConfig.onClose
    setAlertConfig({ visible: false, title: "", message: "", onClose: null })
    if (callback) callback()
  }

  const isDirty =
    !!title.trim() ||
    !!description.trim() ||
    urgency !== null ||
    images.length > 0

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      showAlert("Permiso requerido", "Necesitamos acceso a tus fotos para subir imágenes.")
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

  const confirmLeaveIfDirty = (onProceed) => {
    if (isDirty) {
      onProceed()
      return
    }
    onProceed()
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

  // --- FUNCIÓN PARA SUBIR A SUPABASE (VERSIÓN ARRAYBUFFER) ---
  const uploadImageToSupabase = async (uri) => {
    try {
      // 1. Usamos fetch para obtener el archivo como ArrayBuffer
      // Esto evita el uso de 'Blob' que suele fallar en RN/Hermes
      const response = await fetch(uri)
      const arrayBuffer = await response.arrayBuffer()
      
      // 2. Generar nombre y ruta
      const filename = uri.split('/').pop()
      const ext = filename.split('.').pop() || 'jpg'
      // Ruta: incidents/nombre_archivo
      const path = `incidents/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`

      // 3. Subir al bucket 'mobile' usando ArrayBuffer
      // Es importante especificar el contentType
      const { error } = await supabase.storage
        .from('mobile') 
        .upload(path, arrayBuffer, {
          contentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
          upsert: false
        })

      if (error) throw error

      // 4. Obtener URL pública
      const { data } = supabase.storage
        .from('mobile')
        .getPublicUrl(path)

      return data.publicUrl
    } catch (error) {
      console.error('Error subiendo imagen a Supabase:', error)
      return null
    }
  }

  const handleSubmit = async () => {
    if (!contractId) {
      return showAlert("Error", "No se encontró el contrato asociado.")
    }
    if (!title.trim()) return showAlert("Falta título", "Por favor ingresá un título (Razón).")
    if (!description.trim()) return showAlert("Falta descripción", "Por favor ingresá una descripción.")
    if (!urgency) return showAlert("Falta urgencia", "Por favor seleccioná un nivel de urgencia.")

    setSubmitting(true)

    const urgencyMap = {
      low: "Bajo",
      medium: "Media", 
      high: "Alta"
    }

    try {
      // 1. Subir imágenes a Supabase primero
      let uploadedUrls = []
      if (images.length > 0) {
        const uploadPromises = images.map(img => uploadImageToSupabase(img.uri))
        const results = await Promise.all(uploadPromises)
        uploadedUrls = results.filter(url => url !== null)
      }

      // 2. Preparar descripción concatenando las URLs
      let finalDescription = description
      if (uploadedUrls.length > 0) {
        finalDescription += `\n\n[FOTOS_ADJUNTAS]\n${uploadedUrls.join('\n')}`
      }

      const formData = new FormData()
      formData.append("contract_id", String(contractId))
      formData.append("razon", title)
      formData.append("descripcion", finalDescription)
      
      if (urgencyMap[urgency]) {
        formData.append("urgency", urgencyMap[urgency])
      }
      
      console.log("🚀 Enviando incidencia...", {
        contract_id: contractId,
        razon: title,
        urgency: urgencyMap[urgency] || "Default",
        imagesCount: uploadedUrls.length
      })

      const response = await fetch("https://rentmatch-backend.onrender.com/api/mobile-reporter/incidents", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${activeToken}`
        },
        body: formData
      })

      const data = await response.json()
      console.log("📩 Respuesta servidor:", response.status, data)

      if (!response.ok) {
        throw new Error(data.message || "No se pudo enviar el reporte.")
      }

      // Limpiar formulario
      setTitle("")
      setDescription("")
      setUrgency(null)
      setImages([])

      showAlert(
        "Reporte enviado", 
        "La incidencia se ha registrado correctamente.",
        () => setTimeout(() => navigation.goBack(), 100)
      )

    } catch (error) {
      console.error("❌ Error submit:", error)
      showAlert("Error", error.message || "Ocurrió un error al enviar.")
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
        {/* Fondo SVG */}
        <View style={styles.backgroundSvg}>
          <IncidenciasSvg />
        </View>

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
            <Text style={styles.topTitle}>Reportar Incidencia</Text>
            <View style={styles.topSpacer} />
          </View>

          <View style={styles.card}>
            <Text style={styles.propertyTitle}>{propertyTitle}</Text>

            {/* Titulo */}
            <Text style={styles.label}>Título</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ej: Cañería rota"
                placeholderTextColor="#9BA3C7"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Descripcion */}
            <Text style={styles.label}>Descripción</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describí el problema con detalle..."
                placeholderTextColor="#9BA3C7"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            {/* Urgencia */}
            <Text style={styles.label}>Nivel de Urgencia</Text>
            <View style={styles.segment}>
              { [
                { key: "low", label: "Bajo", color: "#4CAF50" },
                { key: "medium", label: "Media", color: "#FFC107" },
                { key: "high", label: "Alta", color: "#F44336" },
              ].map((opt) => {
                const active = urgency === opt.key
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.segmentBtn, 
                      active && { backgroundColor: opt.color, borderColor: opt.color }
                    ]}
                    onPress={() => setUrgency(opt.key)}
                  >
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Imagenes */}
            <Text style={styles.label}>Evidencia fotográfica</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage}>
              <View style={styles.uploadIconBox}>
                <IconComponent name="upload" style={{ color: ORANGE, fontSize: 24 }} />
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

            {/* Submit */}
            <TouchableOpacity 
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Enviar Reporte</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        <CustomAlert 
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={hideAlert}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  backgroundSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
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
  propertyTitle: {
    textAlign: "center",
    fontSize: responsiveFontSize(2.4),
    fontWeight: "700",
    marginBottom: responsiveHeight(3),
    color: "#111213",
    fontFamily: "Poppins_700Bold",
  },
  label: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: 'Poppins_600SemiBold',
    color: "#222",
    marginBottom: responsiveHeight(0.8),
    marginTop: responsiveHeight(1),
  },
  
  // Estilos de Inputs unificados con Peritaje
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
    marginBottom: responsiveHeight(1),
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

  // Upload Box estilo Card
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
    borderRadius: 20, // Redondo
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveWidth(3),
  },
  uploadTitle: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: "700",
    color: ORANGE, // Color naranja como en la imagen
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

  // Segment Control
  segment: {
    flexDirection: "row",
    gap: responsiveWidth(3),
    marginBottom: responsiveHeight(2),
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: responsiveHeight(1.2),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4E6EB",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  segmentText: {
    fontSize: responsiveFontSize(1.6),
    color: "#666",
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
  segmentTextActive: {
    color: "#fff",
  },

  // Submit Button
  submitBtn: {
    marginTop: responsiveHeight(2),
    backgroundColor: ORANGE,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: responsiveHeight(1.8),
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    color: "#fff",
    fontSize: responsiveFontSize(2.2),
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
  },
})

export default IncidenciasScreen
"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from "react-native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import * as ImagePicker from "expo-image-picker"

const ORANGE = "#FF5A1F"

const InitialStateScreen = ({ route, navigation }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [room, setRoom] = useState("")
  const [urgency, setUrgency] = useState("media")
  const [images, setImages] = useState([])

  const initialRef = useRef({ title: "", description: "", room: "", urgency: "media", imagesLen: 0 })
  const isDirty =
    title !== initialRef.current.title ||
    description !== initialRef.current.description ||
    room !== initialRef.current.room ||
    urgency !== initialRef.current.urgency ||
    images.length !== initialRef.current.imagesLen

  const propertyTitle = route?.params?.title || "Departamento en Belgrano"

  const confirmLeaveIfDirty = (onProceed) => {
    if (!isDirty) return onProceed()
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

  const handleSubmit = () => {
    Alert.alert("Enviar Registro", "TODO: enviar datos al backend.")
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerCenter}>Registro estado inicial</Text>
      </View>

      <Text style={styles.propertyTitle}>{propertyTitle}</Text>

      <Text style={styles.label}>Titulo</Text>
      <TextInput
        style={[styles.input, { height: responsiveHeight(5.2) }]}
        placeholder="Ej: Inventario y condiciones"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, { height: responsiveHeight(16), textAlignVertical: "top" }]}
        placeholder="Descripción detallada del estado"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Habitacion</Text>
      <TextInput
        style={[styles.input, { height: responsiveHeight(5.2) }]}
        placeholder="Ej: Sala de estar, Dormitorio, Cocina"
        value={room}
        onChangeText={setRoom}
      />

      <Text style={styles.sectionTitle}>Imágenes</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage}>
        <Text style={styles.uploadIcon}>⬆️</Text>
        <Text style={styles.uploadText}>Subir foto</Text>
        <Text style={styles.helperText}>Agregá fotos para que podamos entender mejor la situación</Text>
      </TouchableOpacity>

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

      <Text style={styles.sectionTitle}>Urgencia</Text>
      <View style={styles.segment}>
        {["baja", "media", "alta"].map((u) => (
          <TouchableOpacity
            key={u}
            style={[styles.segmentBtn, urgency === u && styles.segmentActive]}
            onPress={() => setUrgency(u)}
          >
            <Text style={[styles.segmentText, urgency === u && styles.segmentTextActive]}>
              {u.charAt(0).toUpperCase() + u.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.draftBtn} onPress={handleSaveDraft}>
        <Text style={styles.draftText}>Guardar Borrador</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Enviar Registro</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: responsiveWidth(6), backgroundColor: "#fff" },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: responsiveHeight(1) },
  backBtn: { paddingVertical: responsiveHeight(0.5), paddingHorizontal: responsiveWidth(1) },
  backIcon: { fontSize: responsiveFontSize(3), color: "#1a1a1a" },
  headerCenter: { flex: 1, textAlign: "center", fontWeight: "700", fontSize: responsiveFontSize(2.2), color: "#1a1a1a" },
  propertyTitle: { textAlign: "center", fontSize: responsiveFontSize(2.1), color: "#333", marginBottom: responsiveHeight(2) },

  label: { fontSize: responsiveFontSize(1.8), fontWeight: "600", color: "#1a1a1a", marginBottom: responsiveHeight(1) },
  input: {
    borderWidth: 1,
    borderColor: "rgba(105,138,238,0.5)",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: responsiveHeight(2),
    backgroundColor: "#F1F4FF",
    fontSize: responsiveFontSize(1.8),
  },

  sectionTitle: { fontSize: responsiveFontSize(1.9), fontWeight: "700", color: "#1a1a1a", marginBottom: responsiveHeight(1) },
  helperText: { fontSize: responsiveFontSize(1.4), color: "#666", textAlign: "center", marginTop: responsiveHeight(0.7) },

  uploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingVertical: responsiveHeight(4),
    alignItems: "center",
    marginBottom: responsiveHeight(2),
  },
  uploadIcon: { fontSize: responsiveFontSize(3.8), marginBottom: responsiveHeight(1) },
  uploadText: { fontSize: responsiveFontSize(1.8), fontWeight: "600", color: "#1a1a1a" },

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
  },
  removeText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  segment: { flexDirection: "row", gap: responsiveWidth(4), marginBottom: responsiveHeight(3) },
  segmentBtn: { flex: 1, paddingVertical: responsiveHeight(1.2), borderRadius: 8, backgroundColor: "#F1F4FF", alignItems: "center" },
  segmentActive: { backgroundColor: ORANGE },
  segmentText: { fontSize: responsiveFontSize(1.7), color: "#1a1a1a", fontWeight: "600" },
  segmentTextActive: { color: "#fff" },

  draftBtn: { alignItems: "center", paddingVertical: responsiveHeight(1.6) },
  draftText: { fontSize: responsiveFontSize(1.8), fontWeight: "600", color: "#1a1a1a" },

  submitBtn: { backgroundColor: ORANGE, borderRadius: 10, alignItems: "center", paddingVertical: responsiveHeight(1.8), marginBottom: responsiveHeight(4) },
  submitText: { color: "#fff", fontSize: responsiveFontSize(1.9), fontWeight: "700" },
})
export default InitialStateScreen
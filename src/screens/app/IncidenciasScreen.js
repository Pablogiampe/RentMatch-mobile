"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from "react-native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"

const ORANGE = "#FF5A1F"

const IncidenciasScreen = ({ route, navigation }) => {
  const propertyTitle = route?.params?.title || "Departamento en Belgrano"

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [room, setRoom] = useState("")
  const [urgency, setUrgency] = useState(null) // "low" | "medium" | "high" | null
  const [imageAdded, setImageAdded] = useState(false)

  const isDirty =
    !!title.trim() ||
    !!description.trim() ||
    !!room.trim() ||
    urgency !== null ||
    imageAdded

  const handleUploadImage = () => {
    setImageAdded(true)
    Alert.alert("Subir foto", "TODO: Integrar selector de imágenes (expo-image-picker).")
  }

  const handleSaveDraft = () => {
    Alert.alert("Borrador guardado", "Se guardó como borrador.")
  }

  const confirmLeaveIfDirty = (onProceed) => {
    if (!isDirty) {
      onProceed()
      return
    }
    Alert.alert(
      "Salir",
      "Tenés cambios sin guardar. ¿Querés guardarlos como borrador o descartar lo escrito?",
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

  const handleSubmit = () => {
    Alert.alert("Enviar Reporte", "TODO: enviar reporte a la API.")
  }

  const previousIncidents = [
    { id: "#12345", title: "Incidente #12345", subtitle: "Ventana rota en la cocina" },
    { id: "#67890", title: "Incidente #67890", subtitle: "Vaso roto" },
  ]

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Headers */}
      <Text style={styles.smallHeader}>Nuevo incidente</Text>
      <Text style={styles.screenTitle}>{propertyTitle}</Text>

      {/* Titulo */}
      <Text style={styles.label}>Titulo</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribí un título"
        placeholderTextColor="#9AA2B1"
        value={title}
        onChangeText={setTitle}
      />

      {/* Descripcion */}
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Agregá una descripción"
        placeholderTextColor="#9AA2B1"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Habitación */}
      <Text style={styles.label}>Habitacion</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Cocina, Living, Dormitorio..."
        placeholderTextColor="#9AA2B1"
        value={room}
        onChangeText={setRoom}
      />

      {/* Imagenes */}
      <Text style={styles.sectionHeader}>Imagenes</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={handleUploadImage}>
        <Text style={styles.uploadTitle}>Subir foto</Text>
        <Text style={styles.helperText}>
          Agregue fotos para que podamos entender{"\n"}mejor la situación
        </Text>
        <View style={styles.uploadIconBox}>
          <Text style={styles.uploadIcon}>⬆️</Text>
        </View>
      </TouchableOpacity>

      {/* Urgencia */}
      <Text style={styles.sectionHeader}>Urgencia</Text>
      <View style={styles.segment}>
        {[
          { key: "low", label: "Baja" },
          { key: "medium", label: "Media" },
          { key: "high", label: "Alta" },
        ].map((opt) => {
          const active = urgency === opt.key
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.segmentBtn, active && styles.segmentActive]}
              onPress={() => setUrgency(opt.key)}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Incidentes Previos */}
      <Text style={styles.prevHeader}>Incidentes Previos</Text>
      {previousIncidents.map((item) => (
        <View key={item.id} style={styles.prevItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.prevTitle}>{item.title}</Text>
            <Text style={styles.prevSubtitle}>{item.subtitle}</Text>
          </View>
          <View style={styles.dot} />
        </View>
      ))}

      {/* Submit */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Enviar Reporte</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: responsiveWidth(6),
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
  },
  backBtn: {
    paddingVertical: responsiveHeight(0.5),
    paddingHorizontal: responsiveWidth(1),
  },
  backIcon: {
    fontSize: responsiveFontSize(3),
    color: "#1a1a1a",
  },
  smallHeader: {
    textAlign: "center",
    color: "#60666F",
    fontWeight: "600",
    fontSize: responsiveFontSize(1.7),
    marginTop: responsiveHeight(0.5),
  },
  screenTitle: {
    fontSize: responsiveFontSize(2.4),
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: responsiveHeight(2),
  },
  label: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: responsiveHeight(1),
  },
  input: {
    backgroundColor: "#F1F4FF",
    borderRadius: 10,
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1.6),
    marginBottom: responsiveHeight(2),
    color: "#1a1a1a",
    fontSize: responsiveFontSize(1.8),
  },
  textArea: {
    height: responsiveHeight(16),
    textAlignVertical: "top",
  },
  sectionHeader: {
    fontSize: responsiveFontSize(1.9),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: responsiveHeight(1),
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: "#E4E6EB",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: responsiveHeight(4),
    alignItems: "center",
    marginBottom: responsiveHeight(3),
  },
  uploadTitle: {
    fontSize: responsiveFontSize(1.9),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: responsiveHeight(0.8),
  },
  helperText: {
    fontSize: responsiveFontSize(1.5),
    color: "#666",
    textAlign: "center",
    marginBottom: responsiveHeight(1.6),
    lineHeight: responsiveHeight(2.2),
  },
  uploadIconBox: {
    backgroundColor: "#FFF5F0",
    paddingVertical: responsiveHeight(0.8),
    paddingHorizontal: responsiveWidth(3),
    borderRadius: 8,
  },
  uploadIcon: {
    fontSize: responsiveFontSize(2.4),
    color: ORANGE,
  },
  segment: {
    flexDirection: "row",
    gap: responsiveWidth(3),
    marginBottom: responsiveHeight(3),
  },
  segmentBtn: {
    flex: 0,
    paddingVertical: responsiveHeight(1.2),
    paddingHorizontal: responsiveWidth(4),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E4E6EB",
    backgroundColor: "#fff",
  },
  segmentActive: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  segmentText: {
    fontSize: responsiveFontSize(1.7),
    color: "#1a1a1a",
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#fff",
  },
  prevHeader: {
    fontSize: responsiveFontSize(1.9),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: responsiveHeight(1),
  },
  prevItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveHeight(1.4),
  },
  prevTitle: {
    fontSize: responsiveFontSize(1.7),
    fontWeight: "600",
    color: "#1a1a1a",
  },
  prevSubtitle: {
    fontSize: responsiveFontSize(1.5),
    color: "#6B7280",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ORANGE,
    marginLeft: responsiveWidth(2),
  },
  submitBtn: {
    marginTop: responsiveHeight(2),
    backgroundColor: ORANGE,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: responsiveHeight(1.8),
    marginBottom: responsiveHeight(4),
  },
  submitText: {
    color: "#fff",
    fontSize: responsiveFontSize(1.9),
    fontWeight: "700",
  },
})

export default IncidenciasScreen
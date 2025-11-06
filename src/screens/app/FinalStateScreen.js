"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"

const FinalStateScreen = ({ route, navigation }) => {
  const [hasDamage, setHasDamage] = useState(true)
  // Track initial value to detect changes
  const initialHasDamageRef = useRef(true)
  // Mark dirty if user tried to upload video (hasta que se integre subida real)
  const [videoSelected, setVideoSelected] = useState(false)
  const isDirty = hasDamage !== initialHasDamageRef.current || videoSelected
  const [step] = useState(2)
  const totalSteps = 10
  const title = route?.params?.title || "Departamento en Belgrano"
  const room = route?.params?.room || "Sala de estar"

  const handleUploadVideo = () => {
    setVideoSelected(true)
    Alert.alert(
      "Subir video",
      "TODO: integrar carga de video (por ejemplo, expo-image-picker)."
    )
  }

  const handleSaveDraft = () => {
    Alert.alert("Borrador guardado", "Se guardó el estado actual como borrador.")
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
        { text: "Descartar", style: "destructive", onPress: () => onProceed() },
        { text: "Guardar borrador", onPress: () => { handleSaveDraft(); onProceed() } },
      ]
    )
  }

  const handleBack = () => confirmLeaveIfDirty(() => navigation.goBack())

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!isDirty) return
      e.preventDefault()
      confirmLeaveIfDirty(() => navigation.dispatch(e.data.action))
    })
    return unsubscribe
  }, [navigation, isDirty])

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Botón de volver */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.screenTitle}>Estado final de la propiedad</Text>
      <Text style={styles.subtitle}>{title}</Text>

      <Text style={styles.stepText}>{step} de {totalSteps}</Text>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${(step / totalSteps) * 100}%` }]} />
      </View>

      <Text style={styles.sectionTitle}>{room}</Text>

      <Text style={styles.label}>Alguna modificación/daño nuevo?</Text>
      <View style={styles.segment}>
        <TouchableOpacity
          style={[styles.segmentBtn, !hasDamage && styles.segmentActive]}
          onPress={() => setHasDamage(false)}
        >
          <Text style={[styles.segmentText, !hasDamage && styles.segmentTextActive]}>No</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, hasDamage && styles.segmentActive]}
          onPress={() => setHasDamage(true)}
        >
          <Text style={[styles.segmentText, hasDamage && styles.segmentTextActive]}>Si</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>Video</Text>
      <Text style={styles.helperText}>
        Para ofrecer una visión más detallada del estado final, subí un video mostrando la propiedad.
      </Text>

      <TouchableOpacity style={styles.uploadBox} onPress={handleUploadVideo}>
        <Text style={styles.uploadIcon}>🎥</Text>
        <Text style={styles.uploadText}>Subir video</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.draftBtn} onPress={handleSaveDraft}>
        <Text style={styles.draftText}>Guardar Borrador</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.nextBtn} onPress={() => Alert.alert("Continuar", "TODO: Navegar al siguiente paso.")}>
        <Text style={styles.nextText}>Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const ORANGE = "#FF5A1F"

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
  screenTitle: {
    fontSize: responsiveFontSize(2.6),
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginTop: responsiveHeight(1),
  },
  subtitle: {
    fontSize: responsiveFontSize(2),
    color: "#333",
    textAlign: "center",
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(2),
  },
  stepText: {
    fontSize: responsiveFontSize(1.6),
    color: "#555",
    marginBottom: responsiveHeight(1),
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: responsiveHeight(3),
    width: responsiveWidth(20),
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: ORANGE,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: responsiveHeight(2),
  },
  label: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: responsiveHeight(1),
  },
  segment: {
    flexDirection: "row",
    gap: responsiveWidth(4),
    marginBottom: responsiveHeight(3),
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: responsiveHeight(1.2),
    borderRadius: 8,
    backgroundColor: "#F1F4FF",
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: ORANGE,
  },
  segmentText: {
    fontSize: responsiveFontSize(1.8),
    color: "#1a1a1a",
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#fff",
  },
  sectionHeader: {
    fontSize: responsiveFontSize(2),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: responsiveHeight(1),
  },
  helperText: {
    fontSize: responsiveFontSize(1.6),
    color: "#666",
    textAlign: "center",
    marginBottom: responsiveHeight(2),
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingVertical: responsiveHeight(5),
    alignItems: "center",
    marginBottom: responsiveHeight(4),
  },
  uploadIcon: {
    fontSize: responsiveFontSize(4),
    marginBottom: responsiveHeight(1),
  },
  uploadText: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: "600",
    color: "#1a1a1a",
  },
  draftBtn: {
    alignItems: "center",
    paddingVertical: responsiveHeight(1.8),
  },
  draftText: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: "600",
    color: "#1a1a1a",
  },
  nextBtn: {
    marginTop: responsiveHeight(1),
    backgroundColor: ORANGE,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: responsiveHeight(1.8),
    marginBottom: responsiveHeight(4),
  },
  nextText: {
    color: "#fff",
    fontSize: responsiveFontSize(1.9),
    fontWeight: "700",
  },
})
export default FinalStateScreen
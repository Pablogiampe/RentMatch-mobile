// IMPORTANTE: Instalar dependencia primero:
// expo install react-native-calendars

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
  Modal,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import { Calendar } from "react-native-calendars"
import IconComponent from "../../../RentMatch_mobile/assets/icons"
import IncidenciasSvg from "../../../RentMatch_mobile/assets/IncidenciasSvg"
import { useAuth } from "../../contexts/AuthContext"
import CustomAlert from "../../components/CustomAlert"

const PeritajeScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { user, token, session } = useAuth()
  const activeToken = token || session

  const contractId = route.params?.contract_id || route.params?.contractId
  const propertyTitle = route.params?.title || "Propiedad"

  // Estados del formulario
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDateForTime, setSelectedDateForTime] = useState(null)
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [agree, setAgree] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedTime, setSelectedTime] = useState(null)
  const [lastPeritaje, setLastPeritaje] = useState(null)

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

  useEffect(() => {
    console.log("🔍 PeritajeScreen Params:", route.params)
    console.log("🔍 Contract ID detectado:", contractId)
  }, [])

  useEffect(() => {
    navigation.setOptions?.({
      headerShown: false,
    })
  }, [])

  useEffect(() => {
    // cargar último peritaje del contrato actual
    const fetchLastForContract = async () => {
      if (!activeToken || !user?.id || !contractId) return
      try {
        const response = await fetch("https://rentmatch-backend.onrender.com/api/mobile-Expertise/GetExpertiseByTenant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${activeToken}`,
          },
          body: JSON.stringify({ tenant_id: user.id }),
        })
        const data = await response.json()
        if (response.ok && Array.isArray(data?.data)) {
          const list = data.data
            .filter(p => p.contract_id === contractId)
            .map(p => ({ ...p, dateObj: new Date(p.date || p.created_at) }))
            .sort((a, b) => b.dateObj - a.dateObj)
          setLastPeritaje(list[0] || null)
        }
      } catch (e) {
        // silencioso
      }
    }
    fetchLastForContract()
  }, [activeToken, user?.id, contractId])

  const getAvailableTimes = (dateString) => {
    const occupiedTimes = {
      '2024-01-15': ['10:00', '14:00'],
      '2024-01-16': ['11:00', '15:00'],
    }
    
    const allTimes = [
      "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "13:00", "13:30",
      "14:00", "14:30", "15:00", "15:30", "16:00"
    ]

    return allTimes.map(time => ({
      time,
      occupied: occupiedTimes[dateString]?.includes(time) || false
    }))
  }

  const getAvailableDates = () => {
    const marked = {}
    const today = new Date()
    for (let i = 1; i <= 30; i++) {
      const futureDate = new Date(today)
      futureDate.setDate(today.getDate() + i)
      if (futureDate.getDay() !== 0) {
        const dateString = futureDate.toISOString().split('T')[0]
        marked[dateString] = {
          marked: true,
          dotColor: '#FF5A1F',
          customStyles: {
            container: {
              backgroundColor: '#FFF4EC',
              borderRadius: 8,
            },
            text: {
              color: '#FF5A1F',
              fontWeight: '600',
            }
          }
        }
      }
    }
    return marked
  }

  const markedDates = getAvailableDates()

  const onDateSelect = (day) => {
    setSelectedDateForTime(day.dateString)
  }

  const onTimeSelect = (slot) => {
    if (slot.occupied) {
      showAlert("Horario ocupado", "Este horario ya está reservado. Por favor elegí otro.")
      return
    }
    
    setSelectedTime(slot.time)
  }

  const confirmTimeSelection = () => {
    if (!selectedTime || !selectedDateForTime) return

    const selectedDate = new Date(selectedDateForTime)
    const formatted = selectedDate.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
    setDate(formatted)
    setTime(selectedTime)
    setShowCalendar(false)
    setSelectedDateForTime(null)
    setSelectedTime(null)
  }

  const handleBackInTimeSelection = () => {
    setSelectedDateForTime(null)
    setSelectedTime(null)
  }

  const handleCloseCalendar = () => {
    setShowCalendar(false)
    setSelectedDateForTime(null)
    setSelectedTime(null)
    setTime("")
  }

  const animateCheckboxPress = () => {
    Animated.sequence([
      Animated.timing(checkboxScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(checkboxScale, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(checkboxScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const animateCheckboxOpacity = (isChecked) => {
    Animated.timing(checkboxOpacity, {
      toValue: isChecked ? 1 : 0.7,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }

  const handleAgreeToggle = () => {
    animateCheckboxPress()
    animateCheckboxOpacity(!agree)
    setAgree(!agree)
  }

  const validateAndSubmit = async () => {
    if (!reason.trim()) return showAlert("Falta razón", "Completá el campo Razón.")
    if (!description.trim()) return showAlert("Falta descripción", "Completá la descripción.")
    if (!date.trim() || !time.trim()) return showAlert("Falta fecha y horario", "Seleccioná fecha y horario.")
    if (!contactName.trim()) return showAlert("Falta nombre", "Completá tu nombre.")
    if (!contactEmail.trim()) return showAlert("Falta email", "Completá tu email.")
    if (!contactPhone.trim()) return showAlert("Falta teléfono", "Completá tu teléfono.")
    if (agree) return showAlert("Aceptar términos", "Aceptá los términos y condiciones para enviar.")

    if (!contractId) {
      return showAlert("Error", "No se encontró el contrato asociado.")
    }

    if (!user?.id) {
      return showAlert("Error", "No se encontró información del usuario.")
    }

    if (!activeToken) {
      return showAlert("Sesión expirada", "No se encontró el token de seguridad. Por favor cerrá sesión y volvé a ingresar.")
    }

    setSubmitting(true)

    try {
      const [day, month, year] = date.split('/')
      const dateTimeISO = `${year}-${month}-${day}T${time}:00Z`

      const payload = {
        contract_id: contractId,
        contractId: contractId, 
        tenant_id: user.id,
        tenantId: user.id,
        reason: reason.trim(),
        description: description.trim(),
        date: dateTimeISO,
        phone: contactPhone.trim(),
        email: contactEmail.trim(),
      }

      console.log("Enviando peritaje payload:", JSON.stringify(payload, null, 2))

      const response = await fetch(`https://rentmatch-backend.onrender.com/api/mobile-Expertise/expertice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`)
      }

      console.log("Peritaje creado exitosamente:", data)
      
      showAlert(
        "¡Solicitud enviada!",
        "Tu solicitud de peritaje fue registrada correctamente. Te contactaremos pronto.",
        () => setTimeout(() => navigation.goBack?.(), 100)
      )

    } catch (error) {
      console.error("Error al enviar peritaje:", error)
      showAlert(
        "Error al enviar",
        error.message || "No se pudo enviar la solicitud. Intentá de nuevo más tarde."
      )
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (user?.full_name && !contactName) {
      setContactName(user.full_name)
    }
    if (user?.email && !contactEmail) {
      setContactEmail(user.email)
    }
    if (user?.phone && !contactPhone) {
      setContactPhone(user.phone)
    }
  }, [user])

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* Fondo posicionado absolutamente para no interferir con el scroll */}
        <View style={styles.backgroundSvg}>
          <IncidenciasSvg />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.back} onPress={() => navigation.goBack?.()}>
              <IconComponent name="back-arrow" />
            </TouchableOpacity>
            <Text style={styles.topTitle}>Solicitar Peritaje</Text>
            <View style={styles.topSpacer} />
          </View>

          <View style={styles.card}>
            <Text style={styles.propertyTitle}>{propertyTitle}</Text>

            {/* NUEVO: último peritaje del contrato si existe */}
            {lastPeritaje && (
              <View style={{
                backgroundColor: "#FFF4EC",
                borderColor: "#FFD6BF",
                borderWidth: 1,
                borderRadius: 10,
                padding: responsiveWidth(3),
                marginBottom: responsiveHeight(1.5),
              }}>
                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: responsiveFontSize(1.7), color: "#1F2937" }}>
                  Último peritaje
                </Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: responsiveFontSize(1.5), color: "#6B7280", marginTop: 4 }}>
                  {new Date(lastPeritaje.date || lastPeritaje.created_at).toLocaleDateString("es-AR")}
                  {lastPeritaje.reason ? ` · ${lastPeritaje.reason}` : ""}
                </Text>
              </View>
            )}

            <Text style={styles.label}>Razón</Text>
            {/* input con estilo de contraseña */}
            <View style={styles.inputPasswordContainer}>
              <TextInput
                value={reason}
                onChangeText={setReason}
                style={styles.inputPassword}
                placeholder="Ingresá la razón"
                placeholderTextColor="#9BA3C7"
                returnKeyType="next"
              />
            </View>

            <Text style={styles.label}>Descripción</Text>
            {/* multiline con mismo contenedor */}
            <View style={[styles.inputPasswordContainer, styles.inputMultilineContainer]}>
              <TextInput
                value={description}
                onChangeText={setDescription}
                style={[styles.inputPassword, styles.inputMultiline]}
                placeholder="Contanos el detalle"
                placeholderTextColor="#9BA3C7"
                multiline
                returnKeyType="default"
              />
            </View>

            <Text style={styles.label}>Fecha y Horario</Text>
            <TouchableOpacity
              style={styles.inputPasswordContainer}
              onPress={() => setShowCalendar(true)}
              activeOpacity={0.9}
            >
              <Text style={date && time ? styles.inputText : styles.inputPlaceholder}>
                {date && time ? `${date} - ${time}` : "Seleccionar fecha y horario"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Información de contacto</Text>

            <View style={styles.inputPasswordContainer}>
              <TextInput
                value={contactName}
                onChangeText={setContactName}
                style={styles.inputPassword}
                placeholder="Nombre y apellido"
                placeholderTextColor="#9BA3C7"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputPasswordContainer}>
              <TextInput
                value={contactEmail}
                onChangeText={setContactEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.inputPassword}
                placeholder="Correo electrónico"
                placeholderTextColor="#9BA3C7"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputPasswordContainer}>
              <TextInput
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
                style={styles.inputPassword}
                placeholder="Teléfono"
                placeholderTextColor="#9BA3C7"
                returnKeyType="done"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={validateAndSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitText}>{submitting ? "Enviando..." : "Enviar"}</Text>
            </TouchableOpacity>
          </View>

          {/* Modal Calendario con selector de horario integrado */}
          <Modal
            visible={showCalendar}
            transparent
            animationType="fade"
            onRequestClose={handleCloseCalendar}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={handleCloseCalendar}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={styles.calendarContainer}>
                  <View style={styles.calendarHeader}>
                    {selectedDateForTime && (
                      <TouchableOpacity 
                        onPress={handleBackInTimeSelection}
                        style={styles.backButton}
                      >
                        <IconComponent name="back-arrow" />
                      </TouchableOpacity>
                    )}
                    <Text style={styles.calendarTitle}>
                      {selectedDateForTime ? "Seleccionar horario" : "Seleccionar fecha"}
                    </Text>
                    <TouchableOpacity onPress={handleCloseCalendar}>
                      <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {!selectedDateForTime ? (
                    <>
                      <Calendar
                        onDayPress={onDateSelect}
                        markedDates={markedDates}
                        minDate={new Date().toISOString().split('T')[0]}
                        maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        theme={{
                          backgroundColor: '#ffffff',
                          calendarBackground: '#ffffff',
                          textSectionTitleColor: '#b6c1cd',
                          selectedDayBackgroundColor: '#FF5A1F',
                          selectedDayTextColor: '#ffffff',
                          todayTextColor: '#FF5A1F',
                          dayTextColor: '#2d4150',
                          textDisabledColor: '#d9e1e8',
                          dotColor: '#FF5A1F',
                          selectedDotColor: '#ffffff',
                          arrowColor: '#FF5A1F',
                          monthTextColor: '#2d4150',
                          textMonthFontWeight: '700',
                          textDayFontSize: responsiveFontSize(1.8),
                          textMonthFontSize: responsiveFontSize(2),
                          textDayHeaderFontSize: responsiveFontSize(1.6),
                        }}
                        markingType="custom"
                        hideExtraDays
                      />
                      <View style={styles.calendarFooter}>
                        <Text style={styles.calendarHint}>
                          📅 Disponibles de lunes a sábado
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.timePickerSubtitle}>
                        Tocá para elegir tu horario (10:00 - 16:00)
                      </Text>
                      
                      <ScrollView 
                        style={styles.timeListScroll}
                        contentContainerStyle={styles.timeListContainer}
                        showsVerticalScrollIndicator={false}
                      >
                        {getAvailableTimes(selectedDateForTime).map((slot) => (
                          <TouchableOpacity
                            key={slot.time}
                            style={[
                              styles.timeSlotRow,
                              selectedTime === slot.time && styles.timeSlotRowSelected,
                              slot.occupied && styles.timeSlotRowOccupied,
                            ]}
                            onPress={() => onTimeSelect(slot)}
                            disabled={slot.occupied}
                            activeOpacity={0.7}
                          >
                            <View style={styles.timeSlotRowContent}>
                              <View style={styles.timeSlotRowTextContainer}>
                                <Text
                                  style={[
                                    styles.timeSlotRowText,
                                    selectedTime === slot.time && styles.timeSlotRowTextSelected,
                                    slot.occupied && styles.timeSlotRowTextOccupied,
                                  ]}
                                >
                                  {slot.time}
                                </Text>
                                {slot.occupied && (
                                  <Text style={styles.timeSlotRowOccupiedLabel}>No disponible</Text>
                                )}
                              </View>
                              {selectedTime === slot.time && (
                                <Text style={styles.timeSlotRowCheck}>✓</Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      <TouchableOpacity
                        style={[
                          styles.confirmTimeButton,
                          !selectedTime && styles.confirmTimeButtonDisabled
                        ]}
                        onPress={confirmTimeSelection}
                        disabled={!selectedTime}
                      >
                        <Text style={styles.confirmTimeText}>Confirmar horario</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
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
  page: { flex: 1, backgroundColor: "#fff" },
  backgroundSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  scrollContent: {
    padding: responsiveWidth(4),
    alignItems: "center",
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
    backgroundColor: "transparent",
    borderRadius: 10,
    padding: responsiveWidth(2),
  },
  inputPasswordContainer: {
    height: 48,
    display: "flex",
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
    marginBottom: responsiveHeight(1.4),
    paddingRight: responsiveWidth(2),
  },
  inputPassword: {
    height: 48,
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#5c5858ff",
    fontWeight: "600",
    fontSize: responsiveFontSize(1.8),
    textAlignVertical: "center",
    includeFontPadding: false,
    overflow: "hidden",
  },
  inputMultilineContainer: {
    height: undefined,
    minHeight: responsiveHeight(12),
    alignItems: "flex-start",
    paddingVertical: responsiveHeight(0.6),
  },
  inputMultiline: {
    height: "100%",
    minHeight: responsiveHeight(10),
    textAlignVertical: "top",
  },
  inputText: { color: "#5c5858ff", fontWeight: "600", fontSize: responsiveFontSize(1.8), paddingHorizontal: 12 },
  inputPlaceholder: { color: "#9BA3C7", fontWeight: "600", fontSize: responsiveFontSize(1.8), paddingHorizontal: 12 },
  propertyTitle: {
    textAlign: "center",
    fontSize: responsiveFontSize(2.4),
    fontWeight: "700",
    marginBottom: responsiveHeight(2),
    color: "#111213",
  },
  label: {
    fontSize: responsiveFontSize(1.8),
    
    fontFamily: 'Poppins_600SemiBold',
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
  textarea: {
    minHeight: responsiveHeight(12),
    textAlignVertical: "top",
  },
  sectionTitle: {
    marginTop: responsiveHeight(1),
        fontFamily: 'Poppins_600SemiBold',
fontSize: responsiveFontSize(2),
    marginBottom: responsiveHeight(0.5),
    color: "#444",
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
    fontSize: responsiveFontSize(1.6),
    color: '#666',
    marginLeft: responsiveWidth(1),
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
    fontSize: responsiveFontSize(2.4),
  },
  calendarIcon: {
    marginRight: responsiveWidth(2),
    color: '#9BA3C7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: responsiveWidth(90),
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: responsiveWidth(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(2),
  },
  calendarTitle: {
    fontSize: responsiveFontSize(2),
    fontWeight: '700',
    color: '#111213',
  },
  closeButton: {
    fontSize: responsiveFontSize(3),
    color: '#999',
    fontWeight: '300',
  },
  calendarFooter: {
    marginTop: responsiveHeight(2),
    paddingTop: responsiveHeight(2),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  calendarHint: {
    fontSize: responsiveFontSize(1.5),
    color: '#666',
    textAlign: 'center',
  },
  timePickerContainer: {
    width: responsiveWidth(90),
    maxHeight: responsiveHeight(60),
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: responsiveWidth(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(1),
  },
  timePickerTitle: {
    fontSize: responsiveFontSize(2),
    fontWeight: '700',
    color: '#111213',
  },
  timePickerSubtitle: {
    fontSize: responsiveFontSize(1.6),
    color: '#666',
    marginBottom: responsiveHeight(1.5),
    marginTop: responsiveHeight(0.5),
    textAlign: 'center',
    fontWeight: '500',
  },
  timeListScroll: {
    maxHeight: responsiveHeight(45),
  },
  timeListContainer: {
    paddingVertical: responsiveHeight(0.5),
    paddingHorizontal: responsiveWidth(18),

  },
  timeSlotRow: {
    width: '100%',
    backgroundColor: '#FFF4EC',
    borderWidth: 2,
    borderColor: '#FFD6BF',
    borderRadius: 10,
    paddingVertical: responsiveHeight(1.2),
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(0.8),
  },
  timeSlotRowSelected: {
    backgroundColor: '#FF5A1F',
    borderColor: '#FF5A1F',
    shadowColor: '#FF5A1F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  timeSlotRowOccupied: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.5,
  },
  timeSlotRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlotRowTextContainer: {
    alignItems: 'center',
  },
  timeSlotRowText: {
    fontSize: responsiveFontSize(1.9),
    fontWeight: '700',
    color: '#FF5A1F',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  timeSlotRowTextSelected: {
    color: '#fff',
  },
  timeSlotRowTextOccupied: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  timeSlotRowOccupiedLabel: {
    fontSize: responsiveFontSize(1.2),
    color: '#999',
    marginTop: 2,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
  timeSlotRowCheck: {
    fontSize: responsiveFontSize(2.4),
    color: '#fff',
    fontWeight: '700',
    position: 'absolute',
    right: 0,
  },
  confirmTimeButton: {
    marginTop: responsiveHeight(2),
    backgroundColor: '#FF5A1F',
    paddingVertical: responsiveHeight(1.8),
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#FF5A1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmTimeButtonDisabled: {
    backgroundColor: '#CCC',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  confirmTimeText: {
    color: '#fff',
    fontSize: responsiveFontSize(2),
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  backButton: {
    padding: 4,
  },
})
export default PeritajeScreen
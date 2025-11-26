// IMPORTANTE: Instalar dependencia primero:
// expo install react-native-calendars

"use client"
import { useState, useEffect, useRef } from "react"
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
  Modal,
  Animated,
  Dimensions,
} from "react-native"
import Checkbox from 'expo-checkbox'
import { useNavigation, useRoute } from "@react-navigation/native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import { Calendar } from "react-native-calendars"
import IconComponent from "../../../RentMatch_mobile/assets/icons"
import IncidenciasSvg from "../../../RentMatch_mobile/assets/IncidenciasSvg"
import { useAuth } from "../../contexts/AuthContext"

const ITEM_HEIGHT = responsiveHeight(6)
const { height: SCREEN_HEIGHT } = Dimensions.get('window')

const PeritajeScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  // Extraemos tanto token como session por si acaso
  const { user, token, session } = useAuth()
  // Usamos el que esté disponible
  const activeToken = token || session

  // Recibir contract_id desde params o usar default
  const contractId = route.params?.contract_id || route.params?.contractId
  const propertyTitle = route.params?.title || "Propiedad"

  // DEBUG: Verificar qué llega al entrar a la pantalla
  useEffect(() => {
    console.log("🔍 PeritajeScreen Params:", route.params)
    console.log("🔍 Contract ID detectado:", contractId)
  }, [])

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
  const scrollViewRef = useRef(null)
  const scrollY = useRef(new Animated.Value(0)).current
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0)

  // Valores animados para el checkbox
  const checkboxScale = useState(new Animated.Value(1))[0]
  const checkboxOpacity = useState(new Animated.Value(0.7))[0]

  useEffect(() => {
    // ajustar header si querés back button nativo
    navigation.setOptions?.({
      headerShown: false,
    })
  }, [])

  // Horarios disponibles con algunos ocupados (simulado)
  const getAvailableTimes = (dateString) => {
    // Simular horarios ocupados según la fecha
    const occupiedTimes = {
      // Ejemplo: algunos días tienen horarios ocupados
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

  // Generar fechas disponibles (próximos 30 días, sin domingos)
  const getAvailableDates = () => {
    const marked = {}
    const today = new Date()
    for (let i = 1; i <= 30; i++) {
      const futureDate = new Date(today)
      futureDate.setDate(today.getDate() + i)
      // Excluir domingos (0)
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

  const onTimeSelect = (selectedTime) => {
    if (selectedTime.occupied) {
      Alert.alert("Horario ocupado", "Este horario ya está reservado. Por favor elegí otro.")
      return
    }
    
    const selectedDate = new Date(selectedDateForTime)
    const formatted = selectedDate.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
    setDate(formatted)
    setTime(selectedTime.time)
    setShowCalendar(false)
    setSelectedDateForTime(null)
  }

  const handleScrollEnd = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y
    const index = Math.round(offsetY / ITEM_HEIGHT)
    setCurrentScrollIndex(index)
  }

  const TimePickerWheel = ({ times, onSelect }) => {
    return (
      <View style={styles.wheelContainer}>
        <View style={styles.wheelOverlay}>
          <View style={styles.wheelHighlight} />
        </View>
        <Animated.ScrollView
          ref={scrollViewRef}
          style={styles.wheelScroll}
          contentContainerStyle={styles.wheelContent}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { 
              useNativeDriver: true,
              listener: (event) => {
                const offsetY = event.nativeEvent.contentOffset.y
                const index = Math.round(offsetY / ITEM_HEIGHT)
                setCurrentScrollIndex(index)
              }
            }
          )}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleScrollEnd}
        >
          {/* Espaciadores para centrar */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
          
          {times.map((slot, index) => {
            const inputRange = [
              (index - 3) * ITEM_HEIGHT,
              (index - 2) * ITEM_HEIGHT,
              (index - 1) * ITEM_HEIGHT,
              index * ITEM_HEIGHT,
              (index + 1) * ITEM_HEIGHT,
              (index + 2) * ITEM_HEIGHT,
              (index + 3) * ITEM_HEIGHT,
            ]

            const scale = scrollY.interpolate({
              inputRange,
              outputRange: [0.7, 0.8, 0.9, 1.1, 0.9, 0.8, 0.7],
              extrapolate: 'clamp',
            })

            const opacity = scrollY.interpolate({
              inputRange,
              outputRange: [0.3, 0.4, 0.6, 1, 0.6, 0.4, 0.3],
              extrapolate: 'clamp',
            })
            
            return (
              <TouchableOpacity
                key={slot.time}
                style={[
                  styles.wheelItem,
                  slot.occupied && styles.wheelItemOccupied,
                ]}
                onPress={() => {
                  if (!slot.occupied) {
                    scrollViewRef.current?.scrollTo({
                      y: index * ITEM_HEIGHT,
                      animated: true
                    })
                    setTimeout(() => onSelect(slot), 300)
                  }
                }}
                disabled={slot.occupied}
                activeOpacity={0.8}
              >
                <Animated.View style={{ transform: [{ scale }], opacity }}>
                  <Text
                    style={[
                      styles.wheelItemText,
                      slot.occupied && styles.wheelItemTextOccupied,
                    ]}
                  >
                    {slot.occupied ? '🚫' : '🕐'} {slot.time}
                  </Text>
                  {slot.occupied && (
                    <Text style={styles.wheelOccupiedLabel}>Ocupado</Text>
                  )}
                </Animated.View>
              </TouchableOpacity>
            )
          })}
          
          {/* Espaciadores para centrar */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
        </Animated.ScrollView>
      </View>
    )
  }

  const handleBackInTimeSelection = () => {
    setSelectedDateForTime(null)
  }

  const handleCloseCalendar = () => {
    setShowCalendar(false)
    setSelectedDateForTime(null)
    setTime("")
  }

  // Función para animar cuando se presiona el checkbox
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

  // Función para animar la opacidad del checkbox
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
    if (!reason.trim()) return Alert.alert("Falta razón", "Completá el campo Razón.")
    if (!description.trim()) return Alert.alert("Falta descripción", "Completá la descripción.")
    if (!date.trim() || !time.trim()) return Alert.alert("Falta fecha y horario", "Seleccioná fecha y horario.")
    if (!contactName.trim()) return Alert.alert("Falta nombre", "Completá tu nombre.")
    if (!contactEmail.trim()) return Alert.alert("Falta email", "Completá tu email.")
    if (!contactPhone.trim()) return Alert.alert("Falta teléfono", "Completá tu teléfono.")
    if (!agree) return Alert.alert("Aceptar términos", "Aceptá los términos y condiciones para enviar.")

    if (!contractId) {
      return Alert.alert("Error", "No se encontró el contrato asociado.")
    }

    if (!user?.id) {
      return Alert.alert("Error", "No se encontró información del usuario.")
    }

    // Validación extra para el token
    if (!activeToken) {
      return Alert.alert("Sesión expirada", "No se encontró el token de seguridad. Por favor cerrá sesión y volvé a ingresar.")
    }

    setSubmitting(true)

    try {
      // Convertir fecha y hora al formato ISO
      const [day, month, year] = date.split('/')
      const dateTimeISO = `${year}-${month}-${day}T${time}:00Z`

      // FIX: Enviamos ambas variantes de las claves (snake_case y camelCase)
      // para asegurar que el backend encuentre el dato.
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
          'Authorization': `Bearer ${activeToken}`, // Usamos activeToken
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`)
      }

      console.log("Peritaje creado exitosamente:", data)
      
      Alert.alert(
        "¡Solicitud enviada!",
        "Tu solicitud de peritaje fue registrada correctamente. Te contactaremos pronto.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack?.()
          }
        ]
      )

    } catch (error) {
      console.error("Error al enviar peritaje:", error)
      Alert.alert(
        "Error al enviar",
        error.message || "No se pudo enviar la solicitud. Intentá de nuevo más tarde."
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Pre-cargar datos del usuario si están disponibles
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
    <KeyboardAvoidingView>
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

          <View style={styles.checkboxContainer}>
            <Animated.View
              style={{
                transform: [{ scale: checkboxScale }],
                opacity: checkboxOpacity,
              }}
            >
              <Checkbox
                style={styles.checkbox}
                value={agree}
                onValueChange={handleAgreeToggle}
                color={agree ? '#FF5A1F' : '#B4BEE2'}
              />
            </Animated.View>
            <TouchableOpacity
              onPress={handleAgreeToggle}
              style={styles.checkboxTouchable}
            >
              <Text style={styles.checkboxLabel}>Estoy de acuerdo con los términos y condiciones</Text>
            </TouchableOpacity>
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
                    Deslizá para elegir tu horario (10:00 - 16:00)
                  </Text>
                  <TimePickerWheel 
                    times={getAvailableTimes(selectedDateForTime)}
                    onSelect={onTimeSelect}
                  />
                  <TouchableOpacity
                    style={styles.confirmTimeButton}
                    onPress={() => {
                      const times = getAvailableTimes(selectedDateForTime)
                      onTimeSelect(times[currentScrollIndex])
                    }}
                  >
                    <Text style={styles.confirmTimeText}>✓ Confirmar horario</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
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
    marginBottom: responsiveHeight(1.4), // espacio entre campos
    paddingRight: responsiveWidth(2),
  },
  inputPassword: {
    height: 48,
    width: "100%",              // ocupa todo el ancho
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#5c5858ff",
    fontWeight: "600",
    fontSize: responsiveFontSize(1.8),
    textAlignVertical: "center",
    includeFontPadding: false,
    overflow: "hidden",
  },
  // multiline dentro del mismo contenedor
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
  // textos para la fila de fecha
  inputText: { color: "#5c5858ff", fontWeight: "600", fontSize: responsiveFontSize(1.8), paddingHorizontal: 12 },
  inputPlaceholder: { color: "#9BA3C7", fontWeight: "600", fontSize: responsiveFontSize(1.8), paddingHorizontal: 12 },
  // (opcional) los estilos "input" y "textarea" antiguos pueden quedar sin uso
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
  clockIcon: {
    marginRight: responsiveWidth(2),
    color: '#9BA3C7',
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
  wheelContainer: {
    height: responsiveHeight(35),
    position: 'relative',
    marginVertical: responsiveHeight(1),
  },
  wheelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    pointerEvents: 'none',
  },
  wheelHighlight: {
    width: '90%',
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(255, 90, 31, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF5A1F',
  },
  wheelScroll: {
    flex: 1,
  },
  wheelContent: {
    paddingHorizontal: responsiveWidth(4),
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: responsiveHeight(1),
  },
  wheelItemSelected: {
    // El highlight ya está en overlay
  },
  wheelItemOccupied: {
    opacity: 0.4,
  },
  wheelItemText: {
    fontSize: responsiveFontSize(2),
    fontWeight: '600',
    color: '#2d4150',
    textAlign: 'center',
  },
  wheelItemTextSelected: {
    fontSize: responsiveFontSize(2.4),
    color: '#FF5A1F',
    fontWeight: '700',
  },
  wheelItemTextOccupied: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  wheelOccupiedLabel: {
    fontSize: responsiveFontSize(1.2),
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
  },
  confirmTimeButton: {
    backgroundColor: '#FF5A1F',
    paddingVertical: responsiveHeight(1.8),
    paddingHorizontal: responsiveWidth(8),
    borderRadius: 12,
    marginTop: responsiveHeight(2),
    alignItems: 'center',
    shadowColor: '#FF5A1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  confirmTimeText: {
    color: '#fff',
    fontSize: responsiveFontSize(1.9),
    fontWeight: '700',
  },
  // Eliminar estilos antiguos de lista:
  // timeList, timeSlot, timeSlotSelected, timeSlotOccupied, etc.
})
export default PeritajeScreen
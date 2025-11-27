"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import { useAuth } from "../../contexts/AuthContext"
import Home from "../../../RentMatch_mobile/assets/home"
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins"

const ORANGE = "#FF5A1F"
const CARD_BORDER = "rgba(105, 138, 238, 0.3)"

const ProfileScreen = ({ navigation }) => {
  const { user } = useAuth()

  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  })

  const TABS = [
    { key: "datos", label: "Datos" },
    { key: "verificacion", label: "Verificación" },
    { key: "seguridad", label: "Seguridad" },
  ]
  const [activeTab, setActiveTab] = useState("datos")

  // Helper para separar nombre y apellido
  const getNames = (fullName) => {
    if (!fullName) return { first: "", last: "" }
    const parts = fullName.trim().split(" ")
    const first = parts[0] || ""
    const last = parts.slice(1).join(" ") || ""
    return { first, last }
  }

  const { first: initialFirst, last: initialLast } = getNames(user?.full_name)

  // Datos personales
  const [firstName, setFirstName] = useState(initialFirst)
  const [lastName, setLastName] = useState(initialLast)
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  
  const datosInitial = useRef({ 
    firstName: initialFirst, 
    lastName: initialLast, 
    email: user?.email || "", 
    phone: user?.phone || "" 
  })

  // Sincronizar estado cuando carga el usuario
  useEffect(() => {
    if (user) {
      const { first, last } = getNames(user.full_name)
      setFirstName(first)
      setLastName(last)
      setEmail(user.email || "")
      setPhone(user.phone || "")
      
      datosInitial.current = { 
        firstName: first, 
        lastName: last, 
        email: user.email || "", 
        phone: user.phone || "" 
      }
    }
  }, [user])

  // Verificación
  const [dniStatus, setDniStatus] = useState("Pendiente") // Pendiente | Verificado | Rechazado
  const verifInitial = useRef({ dniStatus })

  // Seguridad
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [publicProfile, setPublicProfile] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const seguridadInitial = useRef({
    currentPassword,
    newPassword,
    confirmPassword,
    publicProfile,
    emailNotifications,
  })

  // Dirty detection per tab
  const isDatosDirty = () => {
    const init = datosInitial.current
    return (
      init.firstName !== firstName ||
      init.lastName !== lastName ||
      init.email !== email ||
      init.phone !== phone
    )
  }
  const isVerifDirty = () => {
    const init = verifInitial.current
    return init.dniStatus !== dniStatus
  }
  const isSeguridadDirty = () => {
    const init = seguridadInitial.current
    return (
      init.currentPassword !== currentPassword ||
      init.newPassword !== newPassword ||
      init.confirmPassword !== confirmPassword ||
      init.publicProfile !== publicProfile ||
      init.emailNotifications !== emailNotifications
    )
  }

  const getActiveDirty = useCallback(() => {
    if (activeTab === "datos") return isDatosDirty()
    if (activeTab === "verificacion") return isVerifDirty()
    if (activeTab === "seguridad") return isSeguridadDirty()
    return false
  }, [activeTab, firstName, lastName, email, phone, dniStatus, currentPassword, newPassword, confirmPassword, publicProfile, emailNotifications])

  const saveCurrentTab = () => {
    if (activeTab === "datos") {
      datosInitial.current = { firstName, lastName, email, phone }
      Alert.alert("Guardado", "Datos personales actualizados.")
    } else if (activeTab === "verificacion") {
      verifInitial.current = { dniStatus }
      Alert.alert("Guardado", "Estado de verificación actualizado.")
    } else if (activeTab === "seguridad") {
      seguridadInitial.current = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        publicProfile,
        emailNotifications,
      }
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      Alert.alert("Guardado", "Preferencias de seguridad actualizadas.")
    }
  }

  const discardCurrentTab = () => {
    if (activeTab === "datos") {
      const init = datosInitial.current
      setFirstName(init.firstName)
      setLastName(init.lastName)
      setEmail(init.email)
      setPhone(init.phone)
    } else if (activeTab === "verificacion") {
      const init = verifInitial.current
      setDniStatus(init.dniStatus)
    } else if (activeTab === "seguridad") {
      const init = seguridadInitial.current
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPublicProfile(init.publicProfile)
      setEmailNotifications(init.emailNotifications)
    }
  }

  const confirmIfDirty = (onProceed) => {
    if (!getActiveDirty()) {
      onProceed()
      return
    }
    Alert.alert(
      "Cambios sin guardar",
      "Tenés cambios sin guardar. ¿Qué querés hacer?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Descartar",
            style: "destructive",
            onPress: () => { discardCurrentTab(); onProceed() },
        },
        {
          text: "Guardar",
          onPress: () => { saveCurrentTab(); onProceed() },
        },
      ]
    )
  }

  const handleChangeTab = (key) => {
    if (key === activeTab) return
    confirmIfDirty(() => setActiveTab(key))
  }

  const handleBack = () => {
    confirmIfDirty(() => navigation.goBack())
  }

  useEffect(() => {
    const unsub = navigation?.addListener?.("beforeRemove", (e) => {
      if (!getActiveDirty()) return
      e.preventDefault()
      confirmIfDirty(() => navigation.dispatch(e.data.action))
    })
    return unsub
  }, [navigation, getActiveDirty])

  if (!fontsLoaded) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={ORANGE} /></View>
  }

  // Render sections
  const SectionCard = ({ title, children, danger }) => (
    <View style={[styles.card, danger && styles.cardDanger]}>
      {title && (
        <Text style={[styles.cardTitle, danger && styles.cardTitleDanger]}>
          {title}
        </Text>
      )}
      {children}
    </View>
  )

  const renderDatos = () => (
    <View>
      <SectionCard title="Información personal">
        <View style={styles.inputRow}>
          <View style={styles.inputCol}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Nombre"
              placeholderTextColor="#9AA2B1"
            />
          </View>
          <View style={styles.inputCol}>
            <Text style={styles.label}>Apellido</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Apellido"
              placeholderTextColor="#9AA2B1"
            />
          </View>
        </View>
        <Text style={styles.label}>Correo electrónico</Text>
        <View style={styles.inlineBadgeRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9AA2B1"
          />
          <View style={styles.statusBadgeSuccess}>
            <Text style={styles.statusBadgeText}>Verificado</Text>
          </View>
        </View>
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+54 ..."
            keyboardType="phone-pad"
            placeholderTextColor="#9AA2B1"
        />
        <TouchableOpacity
          style={[styles.primaryBtn, { marginTop: responsiveHeight(1) }]}
          onPress={saveCurrentTab}
        >
          <Text style={styles.primaryBtnText}>Guardar cambios</Text>
        </TouchableOpacity>
      </SectionCard>

      <SectionCard title="Eliminar cuenta" danger>
        <Text style={styles.dangerText}>
          Al eliminar tu cuenta, se borrarán todos tus datos y perfiles. Esta acción no se puede deshacer.
        </Text>
        <TouchableOpacity
          style={styles.dangerBtn}
          onPress={() => Alert.alert("Eliminar cuenta", "TODO: Confirmar y ejecutar eliminación.")}
        >
          <Text style={styles.dangerBtnText}>Eliminar mi cuenta</Text>
        </TouchableOpacity>
      </SectionCard>
    </View>
  )

  const renderVerificacion = () => (
    <View>
      <SectionCard title="Verificación de identidad">
        <Text style={styles.bodyText}>
          Verificar tu identidad aumenta la confianza y mejora tus chances de ser contactado.
        </Text>
        <View style={styles.dniRow}>
          <View style={styles.dniIconBox}>
            <Text style={{ fontSize: responsiveFontSize(2) }}>🆔</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dniLabel}>DNI</Text>
            <Text style={styles.dniStatusText}>Estado: {dniStatus}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              dniStatus === "Pendiente" && styles.statusPending,
              dniStatus === "Verificado" && styles.statusVerified,
              dniStatus === "Rechazado" && styles.statusRejected,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeTextSmall,
                dniStatus === "Pendiente" && { color: "#8A6B00" },
                dniStatus === "Verificado" && { color: "#0A7040" },
                dniStatus === "Rechazado" && { color: "#8A1111" },
              ]}
            >
              {dniStatus}
            </Text>
          </View>
        </View>
        <Text style={[styles.bodyText, { marginBottom: responsiveHeight(2) }]}>
          Verificación con DNI argentino: validaremos tu identidad mediante nuestro proveedor seguro. Suele tardar pocos minutos.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            if (dniStatus === "Verificado") {
              Alert.alert("Información", "Ya está verificado.")
              return
            }
            Alert.alert("Verificar identidad", "TODO: flujo KYC.")
          }}
        >
          <Text style={styles.primaryBtnText}>Verificar mi identidad con DNI</Text>
        </TouchableOpacity>
        {dniStatus !== "Verificado" && (
          <TouchableOpacity
            style={[styles.secondaryBtn, { marginTop: responsiveHeight(1.2) }]}
            onPress={() => {
              setDniStatus("Verificado")
              Alert.alert("Verificado", "Estado actualizado a Verificado (demo).")
            }}
          >
            <Text style={styles.secondaryBtnText}>Marcar como verificado (demo)</Text>
          </TouchableOpacity>
        )}
      </SectionCard>
    </View>
  )

  const renderSeguridad = () => (
    <View>
      <SectionCard title="Cambiar contraseña">
        <Text style={styles.label}>Contraseña actual</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholder="••••••"
          placeholderTextColor="#9AA2B1"
        />
        <Text style={styles.label}>Nueva contraseña</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="••••••"
          placeholderTextColor="#9AA2B1"
        />
        <Text style={styles.label}>Confirmar nueva contraseña</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="••••••"
          placeholderTextColor="#9AA2B1"
        />
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => Alert.alert("Actualizar", "TODO: validar y actualizar contraseña.")}
        >
          <Text style={styles.primaryBtnText}>Actualizar contraseña</Text>
        </TouchableOpacity>
      </SectionCard>

      <SectionCard title="Configuración de privacidad">
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Perfil público</Text>
            <Text style={styles.toggleSubtitle}>Permití que los propietarios vean tu perfil</Text>
          </View>
          <Switch
            trackColor={{ false: "#d1d5db", true: "#FFB590" }}
            thumbColor={publicProfile ? ORANGE : "#f4f4f5"}
            value={publicProfile}
            onValueChange={setPublicProfile}
          />
        </View>
        <View style={styles.toggleDivider} />
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Notificaciones por email</Text>
            <Text style={styles.toggleSubtitle}>Recibí notificaciones de nuevos contactos</Text>
          </View>
          <Switch
            trackColor={{ false: "#d1d5db", true: "#FFB590" }}
            thumbColor={emailNotifications ? ORANGE : "#f4f4f5"}
            value={emailNotifications}
            onValueChange={setEmailNotifications}
          />
        </View>
        <TouchableOpacity
          style={[styles.secondaryBtn, { marginTop: responsiveHeight(2) }]}
          onPress={saveCurrentTab}
        >
          <Text style={styles.secondaryBtnText}>Guardar preferencias</Text>
        </TouchableOpacity>
      </SectionCard>
    </View>
  )

  return (
    <View style={styles.screen}>
      <Home style={{ position: "absolute", top: 0, left: 0 }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back + Title */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Mi Cuenta</Text>
        </View>
        <Text style={styles.subtitle}>
          Gestioná tu información personal, verificación y seguridad
        </Text>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map((t) => {
            const active = t.key === activeTab
            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
                onPress={() => handleChangeTab(t.key)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Content */}
        {activeTab === "datos" && renderDatos()}
        {activeTab === "verificacion" && renderVerificacion()}
        {activeTab === "seguridad" && renderSeguridad()}

        <View style={{ height: responsiveHeight(4) }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: responsiveWidth(5),
    paddingTop: responsiveHeight(6), // Increased top padding for header
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
  },
  backBtn: {
    paddingVertical: responsiveHeight(0.4),
    paddingRight: responsiveWidth(2),
    marginRight: responsiveWidth(1),
  },
  backIcon: {
    fontSize: responsiveFontSize(3),
    color: "#1a1a1a",
    fontFamily: 'Poppins_600SemiBold',
  },
  screenTitle: {
    fontSize: responsiveFontSize(2.6),
    fontFamily: 'Poppins_700Bold',
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: responsiveFontSize(1.6),
    color: "#5B616A",
    marginBottom: responsiveHeight(2),
    fontFamily: 'Poppins_400Regular',
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 4,
    marginBottom: responsiveHeight(2),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: responsiveHeight(1.2),
    borderRadius: 8,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: ORANGE,
  },
  tabText: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: 'Poppins_600SemiBold',
    color: "#374151",
  },
  tabTextActive: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    borderWidth: 1,
    borderColor: CARD_BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDanger: {
    borderColor: "#FECACA",
    backgroundColor: "#FFF8F8",
  },
  cardTitle: {
    fontSize: responsiveFontSize(1.9),
    fontFamily: 'Poppins_700Bold',
    color: "#1A1A1A",
    marginBottom: responsiveHeight(1.5),
  },
  cardTitleDanger: {
    color: "#B91C1C",
  },
  label: {
    fontSize: responsiveFontSize(1.5),
    fontFamily: 'Poppins_600SemiBold',
    color: "#1f2937",
    marginBottom: responsiveHeight(0.6),
  },
  input: {
    backgroundColor: "#F1F4FF",
    borderWidth: 1,
    borderColor: "rgba(105, 138, 238, 0.5)",
    borderRadius: 8,
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1.2),
    fontSize: responsiveFontSize(1.7),
    color: "#111827",
    marginBottom: responsiveHeight(1.8),
    fontFamily: 'Poppins_400Regular',
  },
  inputRow: {
    flexDirection: "row",
    gap: responsiveWidth(3),
  },
  inputCol: {
    flex: 1,
  },
  inlineBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveWidth(2),
    marginBottom: responsiveHeight(1.8),
  },
  statusBadgeSuccess: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.8),
    borderRadius: 30,
  },
  statusBadgeText: {
    fontSize: responsiveFontSize(1.3),
    fontFamily: 'Poppins_600SemiBold',
    color: "#065F46",
  },
  primaryBtn: {
    backgroundColor: ORANGE,
    borderRadius: 10,
    paddingVertical: responsiveHeight(1.6),
    alignItems: "center",
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: responsiveFontSize(1.7),
    fontFamily: 'Poppins_700Bold',
  },
  secondaryBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: ORANGE,
    borderRadius: 10,
    paddingVertical: responsiveHeight(1.4),
    alignItems: "center",
  },
  secondaryBtnText: {
    color: ORANGE,
    fontSize: responsiveFontSize(1.6),
    fontFamily: 'Poppins_600SemiBold',
  },
  dangerBtn: {
    backgroundColor: "#FDE1E1",
    borderRadius: 8,
    paddingVertical: responsiveHeight(1.3),
    paddingHorizontal: responsiveWidth(4),
    alignSelf: "flex-start",
    marginTop: responsiveHeight(1.2),
  },
  dangerBtnText: {
    color: "#B91C1C",
    fontFamily: 'Poppins_600SemiBold',
    fontSize: responsiveFontSize(1.5),
  },
  dangerText: {
    fontSize: responsiveFontSize(1.5),
    color: "#7F1D1D",
    fontFamily: 'Poppins_400Regular',
  },
  bodyText: {
    fontSize: responsiveFontSize(1.5),
    color: "#4B5563",
    lineHeight: responsiveHeight(2.4),
    marginBottom: responsiveHeight(1.6),
    fontFamily: 'Poppins_400Regular',
  },
  dniRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: responsiveWidth(3),
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: responsiveHeight(1.8),
  },
  dniIconBox: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: responsiveWidth(3),
  },
  dniLabel: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: 'Poppins_700Bold',
    color: "#1F2937",
  },
  dniStatusText: {
    fontSize: responsiveFontSize(1.3),
    color: "#6B7280",
    marginTop: responsiveHeight(0.2),
    fontFamily: 'Poppins_400Regular',
  },
  statusBadge: {
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.6),
    borderRadius: 30,
  },
  statusPending: {
    backgroundColor: "#FEF9C3",
  },
  statusVerified: {
    backgroundColor: "#D1FAE5",
  },
  statusRejected: {
    backgroundColor: "#FEE2E2",
  },
  statusBadgeTextSmall: {
    fontSize: responsiveFontSize(1.2),
    fontFamily: 'Poppins_600SemiBold',
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveHeight(1.2),
  },
  toggleTitle: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: 'Poppins_600SemiBold',
    color: "#111827",
  },
  toggleSubtitle: {
    fontSize: responsiveFontSize(1.3),
    color: "#6B7280",
    marginTop: responsiveHeight(0.3),
    fontFamily: 'Poppins_400Regular',
  },
  toggleDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: responsiveHeight(1),
  },
})

export default ProfileScreen

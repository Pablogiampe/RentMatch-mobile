import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StatusBar } from "react-native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import { useAuth } from "../../contexts/AuthContext"
import IconComponent from "../../../RentMatch_mobile/assets/icons"
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins"
import { useRoute } from "@react-navigation/native" // + leer params

const ORANGE = "#FF5A1F"

const PeritajesScreen = ({ navigation }) => {
  const { token, session, user } = useAuth()
  const activeToken = token || session
  const [peritajes, setPeritajes] = useState([])
  const [loading, setLoading] = useState(true)
  const route = useRoute() // +

  // Params desde Home (se pasan cuando abrís "Peritajes" desde el carrusel)
  const passedContractId = route.params?.contract_id || route.params?.contractId
  const passedTitle = route.params?.title
  const passedRental = route.params?.rentalData

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  })

  useEffect(() => {
    if (activeToken && user?.id) {
      fetchPeritajes()
    }
  }, [activeToken, user])

  const fetchPeritajes = async () => {
    try {
      console.log("🔄 Obteniendo peritajes para tenant:", user.id)
      const response = await fetch("https://rentmatch-backend.onrender.com/api/mobile-Expertise/GetExpertiseByTenant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          tenant_id: user.id
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Error al obtener peritajes")
      }

      console.log("📦 Peritajes recibidos:", JSON.stringify(data, null, 2))

      // Extraer el array de datos (la respuesta es { success: true, data: [...] })
      const peritajesList = data.data || []

      const mappedData = peritajesList.map(item => ({
        id: item.id,
        // Usamos el 'reason' como título principal ya que describe la solicitud
        property: item.reason || "Solicitud de Peritaje",
        // Al no tener dirección, mostramos el ID del contrato recortado
        address: item.contract_id ? `Contrato: ...${item.property}` : "Sin contrato asociado",
        date: item.date || item.created_at,
        status: "pending", // El backend no devuelve estado aún, asumimos pendiente
        type: "Solicitud",
        inspector: "A asignar",
        issues: null,
        description: item.description
      }))

      setPeritajes(mappedData)
    } catch (error) {
      console.error("❌ Error fetching peritajes:", error)
      Alert.alert("Error", "No se pudieron cargar los peritajes.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return { bg: "#DCFCE7", text: "#166534", label: "Completado" } // Verde suave
      case "scheduled":
        return { bg: "#FEF9C3", text: "#854D0E", label: "Programado" } // Amarillo suave
      case "pending":
        return { bg: "#FEE2E2", text: "#991B1B", label: "Pendiente" } // Rojo suave
      default:
        return { bg: "#F3F4F6", text: "#374151", label: "Desconocido" } // Gris
    }
  }

  const handleNewPeritaje = () => {
    // Navegar a formulario de nuevo peritaje con el contrato actual
    const contractIdToUse = passedContractId || passedRental?.contract_id || passedRental?.id
    if (!contractIdToUse) {
      Alert.alert("Seleccioná un alquiler", "Volvé al Home y elegí un alquiler activo para solicitar el peritaje.")
      return
    }

    navigation.navigate("Peritaje", {
      contract_id: contractIdToUse,
      contractId: contractIdToUse, // compat con PeritajeScreen
      title: passedTitle || passedRental?.property_type || "Propiedad",
      rentalData: passedRental,
    })
  }

  const handlePeritajePress = (peritaje) => {
    // Navegar a detalle del peritaje
    navigation.navigate("DetallePeritaje", { peritajeId: peritaje.id })
  }

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={ORANGE} />
        <Text style={styles.loadingText}>Cargando peritajes...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <IconComponent name="back-arrow" style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Peritajes</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats Cards */}
     

      {/* Lista de Peritajes */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Historial de Peritajes</Text>

        {peritajes.length === 0 ? (
          <View style={styles.emptyState}>
             <IconComponent name="inspection" width={70} height={70} style={styles.cardIcon} />
            <Text style={styles.emptyTitle}>No tenés peritajes aún</Text>
            <Text style={styles.emptyText}>
              Solicitá tu primer peritaje usando el botón de abajo
            </Text>
          </View>
        ) : (
          peritajes.map((peritaje) => {
            const statusInfo = getStatusStyle(peritaje.status)
            return (
              <TouchableOpacity
                key={peritaje.id}
                style={styles.peritajeCard}
                onPress={() => handlePeritajePress(peritaje)}
                activeOpacity={0.7}
              >
                {/* Header Card */}
                <View style={styles.cardHeader}>
                  <View style={styles.idContainer}>
                                     <Text style={styles.peritajeId}>{peritaje.property}</Text>

                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Text style={[styles.statusText, { color: statusInfo.text }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                {/* Property Info */}

                <View style={styles.divider} />

                {/* Details */}
                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fecha</Text>
                    <Text style={styles.detailValue}>
                      {new Date(peritaje.date).toLocaleDateString("es-AR")}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Perito</Text>
                    <Text style={styles.detailValue}>{peritaje.inspector}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        )}
        <View style={{ height: responsiveHeight(10) }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleNewPeritaje}>
        <Text style={styles.fabIcon}>+</Text>
        <Text style={styles.fabText}>Solicitar Peritaje</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA", // Fondo gris claro para resaltar las cards blancas
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: responsiveHeight(2),
    fontSize: responsiveFontSize(1.8),
    color: "#6B7280",
    fontFamily: 'Poppins_400Regular',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: responsiveWidth(5),
    paddingTop: responsiveHeight(6),
    paddingBottom: responsiveHeight(2),
    backgroundColor: "#F5F7FA",
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
 
  },
  backIcon: {
    fontSize: 20,
    color: "#1F2937",
  },
  headerTitle: {
    fontSize: responsiveFontSize(2.2),
    fontFamily: 'Poppins_700Bold',
    color: "#1F2937",
  },
  placeholder: {
    width: 40,
  },
  statsRow: {
    flexDirection: "row",
    gap: responsiveWidth(3),
    paddingHorizontal: responsiveWidth(5),
    marginBottom: responsiveHeight(3),
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: responsiveWidth(4),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: responsiveFontSize(2.8),
    fontFamily: 'Poppins_700Bold',
    color: ORANGE,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: responsiveFontSize(1.4),
    color: "#6B7280",
    fontFamily: 'Poppins_400Regular',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: responsiveWidth(5),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(2),
    fontFamily: 'Poppins_700Bold',
    color: "#1F2937",
    marginBottom: responsiveHeight(2),
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: responsiveHeight(8),
  },
  emptyIcon: {
    fontSize: responsiveFontSize(6),
    marginBottom: responsiveHeight(2),
  },
  emptyTitle: {
    fontSize: responsiveFontSize(2),
    fontFamily: 'Poppins_700Bold',
    color: "#b4a912ff",
    marginBottom: responsiveHeight(1),
  },
  emptyText: {
    fontSize: responsiveFontSize(1.6),
    color: "#6B7280",
    textAlign: "center",
    fontFamily: 'Poppins_400Regular',
    lineHeight: 24,
  },
  peritajeCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: responsiveWidth(5),
    marginBottom: responsiveHeight(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  idContainer: {
    paddingVertical: 4,
    borderRadius: 8,
  },
  peritajeId: {
      fontSize: responsiveFontSize(2),
    fontFamily: 'Poppins_700Bold',
    color: "#1F2937",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: 'Poppins_600SemiBold',
  },
  propertyName: {
    fontSize: responsiveFontSize(2),
    fontFamily: 'Poppins_700Bold',
    color: "#1F2937",
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: responsiveFontSize(1.6),
    color: "#6B7280",
    fontFamily: 'Poppins_400Regular',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailRow: {
    // alignItems: 'center',
  },
  detailLabel: {
    fontSize: responsiveFontSize(1.4),
    color: "#9CA3AF",
    fontFamily: 'Poppins_400Regular',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: 'Poppins_600SemiBold',
    color: "#374151",
  },
  fab: {
    position: "absolute",
    bottom: responsiveHeight(4),
    right: responsiveWidth(5),
    left: responsiveWidth(5),
    backgroundColor: ORANGE,
    borderRadius: 16,
    paddingVertical: responsiveHeight(2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabIcon: {
    fontSize: responsiveFontSize(3),
    color: "#fff",
    fontWeight: "bold",
    marginTop: -2,
  },
  fabText: {
    fontSize: responsiveFontSize(2),
    fontFamily: 'Poppins_700Bold',
    color: "#fff",
  },
})

export default PeritajesScreen
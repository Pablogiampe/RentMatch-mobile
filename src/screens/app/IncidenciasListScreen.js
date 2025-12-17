import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from "react-native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import IconComponent from "../../../RentMatch_mobile/assets/icons"
import IncidenciasSvg from "../../../RentMatch_mobile/assets/IncidenciasSvg"
import { useAuth } from "../../contexts/AuthContext"
import CustomAlert from "../../components/CustomAlert"

const ORANGE = "#FF5A1F"

const IncidenciasListScreen = ({ route, navigation }) => {
  const { token, session } = useAuth()
  const activeToken = token || session
  
  const contractId = route?.params?.contract_id
  const propertyTitle = route?.params?.title || "Propiedad"

  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
  })

  const showAlert = (title, message) => {
    setAlertConfig({ visible: true, title, message })
  }

  const hideAlert = () => {
    setAlertConfig({ visible: false, title: "", message: "" })
  }

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    if (!contractId) {
      showAlert("Error", "No se encontró el contrato asociado.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        `https://rentmatch-backend.onrender.com/api/mobile-reporter/incidents?contract_id=${contractId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${activeToken}`,
            "Content-Type": "application/json"
          }
        }
      )

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "No se pudieron cargar las incidencias.")
      }

      if (data.success && Array.isArray(data.data)) {
        setIncidents(data.data)
      }
    } catch (error) {
      console.error("❌ Error cargando incidencias:", error)
      showAlert("Error", error.message || "Ocurrió un error al cargar las incidencias.")
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (urgency) => {
    const colors = {
      "Bajo": "#4CAF50",
      "Media": "#FFC107",
      "Alta": "#F44336"
    }
    return colors[urgency] || "#999"
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-AR", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric" 
    })
  }

  const handleNewIncident = () => {
    navigation.navigate("IncidenciasHomeScreen", {
      contract_id: contractId,
      title: propertyTitle
    })
  }

  const renderIncidentCard = (incident) => {
    const hasImages = incident.incident_attachments?.length > 0
    const firstImage = hasImages ? incident.incident_attachments[0] : null

    return (
      <TouchableOpacity 
        key={incident.id} 
        style={styles.card}
        onPress={() => {
          // Navegar a detalles si quieres implementarlo después
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {incident.title}
            </Text>
            <Text style={styles.cardDate}>{formatDate(incident.created_at)}</Text>
          </View>
          <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(incident.urgency) }]}>
            <Text style={styles.urgencyText}>{incident.urgency}</Text>
          </View>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {incident.description || "Sin descripción"}
        </Text>

        {hasImages && (
          <View style={styles.cardImageContainer}>
            <Image 
              source={{ uri: `https://rentmatch-backend.onrender.com/${firstImage.file_url}` }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            {incident.incident_attachments.length > 1 && (
              <View style={styles.imageCountBadge}>
                <Text style={styles.imageCountText}>
                  +{incident.incident_attachments.length - 1}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, incident.status === "open" && styles.statusOpen]}>
            <Text style={styles.statusText}>
              {incident.status === "open" ? "Abierto" : "Cerrado"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.backgroundSvg}>
        <IncidenciasSvg />
      </View>

      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <IconComponent name="back-arrow" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Mis Incidencias</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleNewIncident}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.propertyTitle}>{propertyTitle}</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Cargando incidencias...</Text>
        </View>
      ) : incidents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay incidencias reportadas</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleNewIncident}>
            <Text style={styles.emptyButtonText}>Reportar primera incidencia</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {incidents.map(renderIncidentCard)}
        </ScrollView>
      )}

      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
      />
    </View>
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
  topBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(4),
    marginTop: responsiveHeight(4),
    marginBottom: responsiveHeight(1),
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ORANGE,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  propertyTitle: {
    textAlign: "center",
    fontSize: responsiveFontSize(2),
    fontWeight: "600",
    marginBottom: responsiveHeight(2),
    color: "#111213",
    fontFamily: "Poppins_600SemiBold",
    paddingHorizontal: responsiveWidth(4),
  },
  scrollContent: {
    padding: responsiveWidth(4),
    paddingBottom: responsiveHeight(10),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: responsiveHeight(2),
    fontSize: responsiveFontSize(1.8),
    color: "#666",
    fontFamily: "Poppins_400Regular",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(8),
  },
  emptyText: {
    fontSize: responsiveFontSize(2),
    color: "#666",
    textAlign: "center",
    marginBottom: responsiveHeight(3),
    fontFamily: "Poppins_400Regular",
  },
  emptyButton: {
    backgroundColor: ORANGE,
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(6),
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: responsiveFontSize(1.8),
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: responsiveHeight(1),
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: responsiveWidth(2),
  },
  cardTitle: {
    fontSize: responsiveFontSize(1.9),
    fontWeight: "700",
    color: "#111213",
    fontFamily: "Poppins_700Bold",
    marginBottom: 4,
  },
  cardDate: {
    fontSize: responsiveFontSize(1.4),
    color: "#666",
    fontFamily: "Poppins_400Regular",
  },
  urgencyBadge: {
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: 12,
  },
  urgencyText: {
    color: "#fff",
    fontSize: responsiveFontSize(1.3),
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
  cardDescription: {
    fontSize: responsiveFontSize(1.6),
    color: "#444",
    marginBottom: responsiveHeight(1.5),
    fontFamily: "Poppins_400Regular",
    lineHeight: 20,
  },
  cardImageContainer: {
    position: "relative",
    width: "100%",
    height: responsiveHeight(20),
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: responsiveHeight(1),
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  imageCountBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCountText: {
    color: "#fff",
    fontSize: responsiveFontSize(1.4),
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  statusBadge: {
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
  },
  statusOpen: {
    backgroundColor: "#E3F2FD",
  },
  statusText: {
    fontSize: responsiveFontSize(1.3),
    color: "#666",
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
  },
})

export default IncidenciasListScreen

import { useEffect, useState, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal, FlatList, Dimensions, Animated, Easing } from "react-native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import IconComponent from "../../../RentMatch_mobile/assets/icons"
import IncidenciasSvg from "../../../RentMatch_mobile/assets/IncidenciasSvg"
import { useAuth } from "../../contexts/AuthContext"
import CustomAlert from "../../components/CustomAlert"

const ORANGE = "#FF5A1F"
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const BASE_URL = "https://rentmatch-backend.onrender.com/"

const IncidenciasListScreen = ({ route, navigation }) => {
  const { token, session } = useAuth()
  const activeToken = token || session
  
  const contractId = route?.params?.contract_id
  const propertyTitle = route?.params?.title || "Propiedad"
  const rentalData = route?.params?.rentalData || {}
  const propertyAddress = rentalData.address || ""

  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterUrgency, setFilterUrgency] = useState("Todos")
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
  })

  // Animación filtros
  const slideAnim = useRef(new Animated.Value(0)).current
  const [containerWidth, setContainerWidth] = useState(0)
  const filters = ["Todos", "Bajo", "Media", "Alta"]

  // Estados para el visor de imágenes
  const [viewerVisible, setViewerVisible] = useState(false)
  const [selectedAttachments, setSelectedAttachments] = useState([])
  const [initialIndex, setInitialIndex] = useState(0)

  // Animación Scrollbar
  const scrollY = useRef(new Animated.Value(0)).current
  const [contentHeight, setContentHeight] = useState(1)
  const [visibleHeight, setVisibleHeight] = useState(1)

  // --- CORRECCIÓN: Validar scrollable height ---
  const scrollableHeight = contentHeight - visibleHeight
  const isScrollable = scrollableHeight > 0

  // Calcular altura y posición del indicador solo si es scrollable
  const indicatorHeight = isScrollable 
    ? (visibleHeight / contentHeight) * visibleHeight 
    : 0

  const indicatorTranslateY = isScrollable 
    ? scrollY.interpolate({
        inputRange: [0, scrollableHeight],
        outputRange: [0, visibleHeight - indicatorHeight],
        extrapolate: 'clamp'
      })
    : new Animated.Value(0) // Valor dummy si no hay scroll

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
        `https://rentmatch-backend.onrender.com/api/Mobile-Reporter/Getincidents`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${activeToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contract_id: contractId
          })
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
      "Alta": "#F44336",
      "Todos": ORANGE
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

  const getImageUrl = (fileUrl) => {
    if (!fileUrl) return null
    if (fileUrl.startsWith('http')) return fileUrl
    const cleanPath = fileUrl.replace(/\\/g, '/')
    const baseUrl = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`
    const path = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath
    return `${baseUrl}${path}`
  }

  const handleNewIncident = () => {
    navigation.navigate("Incidencias", {
      contract_id: contractId,
      title: propertyTitle
    })
  }

  const openImageViewer = (attachments, index) => {
    setSelectedAttachments(attachments)
    setInitialIndex(index)
    setViewerVisible(true)
  }

  const handleFilterPress = (urgency, index) => {
    setFilterUrgency(urgency)
    if (containerWidth > 0) {
      const buttonWidth = (containerWidth - 8) / filters.length
      Animated.timing(slideAnim, {
        toValue: index * buttonWidth,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start()
    }
  }

  const filteredIncidents = incidents.filter(incident => {
    if (filterUrgency === "Todos") return true
    return incident.urgency === filterUrgency
  })

  // --- NUEVA FUNCIÓN: Extraer fotos de la descripción ---
  const parseIncidentData = (incident) => {
    let description = incident.description || "";
    let extractedImages = [];

    // Buscar marca [FOTOS_ADJUNTAS]
    if (description.includes("[FOTOS_ADJUNTAS]")) {
      const parts = description.split("[FOTOS_ADJUNTAS]");
      description = parts[0].trim(); // La descripción real limpia
      
      const urlsPart = parts[1];
      if (urlsPart) {
        // Separar por saltos de línea y limpiar espacios
        const urls = urlsPart.split('\n').map(u => u.trim()).filter(u => u.length > 0);
        extractedImages = urls.map((url, index) => ({
          id: `desc_img_${incident.id}_${index}`, // ID único temporal
          file_url: url,
          media_type: 'image/jpeg' // Asumimos imagen
        }));
      }
    }

    // Combinar con adjuntos que vengan del backend (si hay)
    const existingAttachments = incident.incident_attachments || [];
    const allImages = [...existingAttachments, ...extractedImages];

    return {
      cleanDescription: description,
      allImages
    };
  }

  const renderIncidentCard = (incident) => {
    // Usamos la función para obtener datos limpios y todas las fotos
    const { cleanDescription, allImages } = parseIncidentData(incident);
    const hasImages = allImages.length > 0;
    
    return (
      <TouchableOpacity 
        key={incident.id} 
        style={styles.card}
        activeOpacity={0.9}
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

        <Text style={styles.cardDescription} numberOfLines={3}>
          {cleanDescription || "Sin descripción"}
        </Text>

        {/* Carrusel de miniaturas */}
        {hasImages && (
          <View style={styles.attachmentsContainer}>
            <Text style={styles.attachmentLabel}>Adjuntos:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailsScroll}>
              {allImages.map((att, index) => {
                const imageUrl = getImageUrl(att.file_url)
                return (
                  <TouchableOpacity 
                    key={att.id} 
                    onPress={() => openImageViewer(allImages, index)}
                    style={styles.thumbnailContainer}
                  >
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={styles.thumbnail} 
                      resizeMode="cover"
                      onError={(e) => console.log("Error cargando imagen:", imageUrl)}
                    />
                    {/* Overlay para videos o si falla la carga */}
                    {att.media_type?.includes('video') && (
                      <View style={styles.videoIconOverlay}>
                        <IconComponent name="play" style={{ color: '#fff', fontSize: 12 }} />
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        )}

   
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
      {propertyAddress ? (
        <Text style={styles.propertyAddress}>{propertyAddress}</Text>
      ) : null}

      {/* ✅ Barra de Filtros Animada */}
      <View 
        style={styles.filterBarContainer} 
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View 
          style={[
            styles.activeFilterBackground,
            { 
              width: containerWidth > 0 ? (containerWidth - 8) / filters.length : 0,
              transform: [{ translateX: slideAnim }]
            }
          ]} 
        />

        {filters.map((urgency, index) => {
          const isActive = filterUrgency === urgency
          const activeColor = getUrgencyColor(urgency)
          
          return (
            <TouchableOpacity
              key={urgency}
              style={styles.filterBarButton}
              onPress={() => handleFilterPress(urgency, index)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterBarText,
                isActive && { color: activeColor, fontFamily: "Poppins_700Bold" }
              ]}>
                {urgency}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Cargando incidencias...</Text>
        </View>
      ) : filteredIncidents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {incidents.length === 0 
              ? "No hay incidencias reportadas" 
              : `No hay incidencias con urgencia ${filterUrgency}`}
          </Text>
          {incidents.length === 0 && (
            <TouchableOpacity style={styles.emptyButton} onPress={handleNewIncident}>
              <Text style={styles.emptyButtonText}>Reportar primera incidencia</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        /* Contenedor relativo para posicionar la scrollbar */
        <View style={{ flex: 1 }}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false} // Ocultar la nativa
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            onContentSizeChange={(w, h) => setContentHeight(h)}
            onLayout={(e) => setVisibleHeight(e.nativeEvent.layout.height)}
          >
            {filteredIncidents.map(renderIncidentCard)}
          </ScrollView>

          {/* Scrollbar Personalizada - Solo se muestra si hay scroll */}
          {isScrollable && (
            <View style={styles.customScrollbarTrack}>
              <Animated.View 
                style={[
                  styles.customScrollbarThumb,
                  {
                    height: indicatorHeight,
                    transform: [{ translateY: indicatorTranslateY }]
                  }
                ]}
              />
            </View>
          )}
        </View>
      )}

      {/* Modal Visor de Imágenes */}
      <Modal 
        visible={viewerVisible} 
        transparent={true} 
        onRequestClose={() => setViewerVisible(false)}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setViewerVisible(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            <FlatList
                data={selectedAttachments}
                horizontal
                pagingEnabled
                initialScrollIndex={initialIndex}
                getItemLayout={(data, index) => (
                    {length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index}
                )}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={styles.fullScreenImageContainer}>
                        <Image 
                            source={{ uri: getImageUrl(item.file_url) }} 
                            style={styles.fullScreenImage} 
                            resizeMode="contain"
                        />
                    </View>
                )}
                onScrollToIndexFailed={(info) => {}}
            />
        </View>
      </Modal>

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
    fontSize: responsiveFontSize(2.2),
    fontWeight: "700",
    marginBottom: 4,
    color: "#111213",
    fontFamily: "Poppins_700Bold",
    paddingHorizontal: responsiveWidth(4),
  },
  propertyAddress: {
    textAlign: "center",
    fontSize: responsiveFontSize(1.6),
    color: "#666",
    fontFamily: "Poppins_400Regular",
    marginBottom: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(4),
  },
  filterBarContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    height: 44,
    position: "relative",
  },
  activeFilterBackground: {
    position: "absolute",
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterBarButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  filterBarText: {
    fontSize: responsiveFontSize(1.6),
    color: "#666",
    fontFamily: "Poppins_700Bold",
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
  attachmentsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  attachmentLabel: {
    fontSize: responsiveFontSize(1.4),
    color: "#999",
    marginBottom: 8,
    fontFamily: "Poppins_600SemiBold",
  },
  thumbnailsScroll: {
    flexDirection: 'row',
  },
  thumbnailContainer: {
    marginRight: 10,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f0f0f0',
  },
  thumbnail: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0',
  },
  videoIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 12,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  fullScreenImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  customScrollbarTrack: {
    position: 'absolute',
    right: 2,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'transparent',
  },
  customScrollbarThumb: {
    width: 4,
    backgroundColor: ORANGE,
    borderRadius: 2,
    opacity: 0.8,
  },
})

export default IncidenciasListScreen

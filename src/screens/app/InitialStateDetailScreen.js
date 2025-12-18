import { useState, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, FlatList, Dimensions, Animated } from "react-native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import IconComponent from "../../../RentMatch_mobile/assets/icons"
import Home from "../../../RentMatch_mobile/assets/home"

const ORANGE = "#FF5A1F"
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const BASE_URL = "https://rentmatch-backend.onrender.com/"

// Constantes para el carrusel (Igual que Home)
const CARD_WIDTH = responsiveWidth(88)
const SPACING = responsiveWidth(4)
const SNAP_INTERVAL = CARD_WIDTH + SPACING
const INSET_X = (responsiveWidth(100) - CARD_WIDTH) / 2

const InitialStateDetailScreen = ({ route, navigation }) => {
  const initialState = route?.params?.initialState || {}
  const propertyTitle = route?.params?.title || "Propiedad"
  const rentalData = route?.params?.rentalData || {}
  
  const address = rentalData.address || ""
  const neighborhood = rentalData.neighborhood || ""
  const fullAddress = [address, neighborhood].filter(Boolean).join(", ")

  // Estados para el visor de imágenes
  const [viewerVisible, setViewerVisible] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [initialIndex, setInitialIndex] = useState(0)
  
  const scrollX = useRef(new Animated.Value(0)).current

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("es-AR", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric" 
    })
  }

  const getImageUrl = (fileUrl) => {
    // ✅ FIX: Validación robusta para evitar crash si fileUrl es null, undefined o no es texto
    if (!fileUrl || typeof fileUrl !== 'string') return null
    
    if (fileUrl.startsWith('http')) return fileUrl
    // Si viene solo el nombre del archivo, construimos la URL de Supabase
    return `https://tyheaqrxtccgvsrcqkqt.supabase.co/storage/v1/object/public/mobile/initialstate/${fileUrl}`
  }

  // Lógica para extraer imágenes de la descripción (igual que en Incidencias)
  const parseInitialStateData = () => {
    let description = initialState.description || "";
    let extractedImages = [];

    // Buscar marca [FOTOS_ADJUNTAS]
    if (description.includes("[FOTOS_ADJUNTAS]")) {
      const parts = description.split("[FOTOS_ADJUNTAS]");
      description = parts[0].trim(); 
      
      const urlsPart = parts[1];
      if (urlsPart) {
        const urls = urlsPart.split('\n').map(u => u.trim()).filter(u => u.length > 0);
        extractedImages = urls.map((url, index) => ({
          id: `desc_img_${index}`,
          file_url: url
        }));
      }
    }

    // Combinar con adjuntos que vengan del backend (si hubiera en el futuro)
    const existingAttachments = initialState.attachments || [];
    
    // Normalizar adjuntos existentes para asegurar que tengan la estructura { file_url: ... }
    const normalizedExisting = existingAttachments.map((att, i) => {
      if (typeof att === 'string') return { id: `exist_${i}`, file_url: att };
      return att;
    }).filter(item => item && item.file_url); // ✅ FIX: Filtrar nulos para evitar crash en el render

    const allImages = [...normalizedExisting, ...extractedImages];

    return {
      cleanDescription: description,
      allImages
    };
  }

  const { cleanDescription, allImages } = parseInitialStateData();

  const openImageViewer = (index) => {
    setSelectedImages(allImages)
    setInitialIndex(index)
    setViewerVisible(true)
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Home style={{ position: "absolute", top: 0, left: 0 }} />

      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <IconComponent name="back-arrow" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Detalle Estado Inicial</Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Galería de Fotos Principal (Carousel estilo Home) */}
        {allImages.length > 0 && (
          <View style={styles.carouselContainer}>
            <Animated.FlatList
              data={allImages}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SNAP_INTERVAL}
              decelerationRate="fast"
              snapToAlignment="center"
              contentContainerStyle={{
                paddingHorizontal: INSET_X,
                gap: SPACING,
              }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
              renderItem={({ item, index }) => {
                // ✅ FIX: Protección extra por si el item llega vacío
                if (!item || !item.file_url) return null; 
                
                return (
                <TouchableOpacity 
                  style={styles.carouselItem}
                  onPress={() => openImageViewer(index)}
                  activeOpacity={0.95}
                >
                  <Image 
                    source={{ uri: getImageUrl(item.file_url) }} 
                    style={styles.carouselImage} 
                    resizeMode="cover"
                  />
                  <View style={styles.imageIndexBadge}>
                    <Text style={styles.imageIndexText}>{index + 1}/{allImages.length}</Text>
                  </View>
                </TouchableOpacity>
              )}}
            />
            
            {/* Indicadores de Paginación (Dots) */}
            <View style={styles.paginationContainer}>
              {allImages.map((_, index) => {
                const inputRange = [
                  (index - 1) * SNAP_INTERVAL,
                  index * SNAP_INTERVAL,
                  (index + 1) * SNAP_INTERVAL,
                ]

                const dotWidth = scrollX.interpolate({
                  inputRange,
                  outputRange: [6, 20, 6],
                  extrapolate: 'clamp',
                })

                const dotColor = scrollX.interpolate({
                  inputRange,
                  outputRange: ['#E5E7EB', '#FF5A1F', '#E5E7EB'],
                  extrapolate: 'clamp',
                })

                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.paginationDot,
                      { 
                        width: dotWidth, 
                        backgroundColor: dotColor 
                      }
                    ]}
                  />
                )
              })}
            </View>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.headerInfo}>
            <Text style={styles.propertyTitle}>{propertyTitle}</Text>
            {fullAddress ? <Text style={styles.propertyAddress}>{fullAddress}</Text> : null}
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>Registrado el {formatDate(initialState.created_at)}</Text>
            </View>
          </View>

          <Text style={styles.label}>Descripción General</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              {cleanDescription || "Sin descripción detallada."}
            </Text>
          </View>
        </View>
      </ScrollView>

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
                data={selectedImages}
                horizontal
                pagingEnabled
                initialScrollIndex={initialIndex}
                getItemLayout={(data, index) => (
                    {length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index}
                )}
                keyExtractor={(item, index) => index.toString()}
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
                onScrollToIndexFailed={() => {}}
            />
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: responsiveHeight(5),
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
    marginTop: responsiveHeight(4),
    paddingHorizontal: responsiveWidth(4),
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  
  // Carousel Styles
  carouselContainer: {
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(2),
  },
  carouselItem: {
    width: CARD_WIDTH,
    height: responsiveHeight(32),
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  imageIndexBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageIndexText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveHeight(2),
    gap: 6,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: responsiveWidth(5),
    marginHorizontal: responsiveWidth(4),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: responsiveHeight(2),
  },
  headerInfo: {
    alignItems: 'center',
    marginBottom: responsiveHeight(3),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: responsiveHeight(2),
  },
  propertyTitle: {
    textAlign: "center",
    fontSize: responsiveFontSize(2.4),
    fontWeight: "700",
    color: "#111213",
    fontFamily: "Poppins_700Bold",
    marginBottom: 4,
  },
  propertyAddress: {
    textAlign: "center",
    fontSize: responsiveFontSize(1.6),
    color: "#666",
    fontFamily: "Poppins_400Regular",
    marginBottom: responsiveHeight(1),
  },
  dateBadge: {
    backgroundColor: "#FFF4EC",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  dateText: {
    color: ORANGE,
    fontSize: responsiveFontSize(1.4),
    fontFamily: "Poppins_500Medium",
  },
  label: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: 'Poppins_600SemiBold',
    color: "#222",
    marginBottom: responsiveHeight(1),
    marginTop: responsiveHeight(1),
  },
  descriptionBox: {
    backgroundColor: "#F9FAFB",
    padding: responsiveWidth(4),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  descriptionText: {
    fontSize: responsiveFontSize(1.6),
    color: "#4B5563",
    fontFamily: "Poppins_400Regular",
    lineHeight: 24,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
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
})

export default InitialStateDetailScreen
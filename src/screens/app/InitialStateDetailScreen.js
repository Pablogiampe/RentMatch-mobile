"use client"

import { useState, useRef, useMemo, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  FlatList,
  Dimensions,
  Animated,
} from "react-native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import IconComponent from "../../../RentMatch_mobile/assets/icons"
import Home from "../../../RentMatch_mobile/assets/home"

const ORANGE = "#FF5A1F"
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

const CARD_WIDTH = responsiveWidth(80)
const SPACING = responsiveWidth(5)
const SNAP_INTERVAL = CARD_WIDTH + SPACING
const INSET_X = (responsiveWidth(7) - CARD_WIDTH) / 2

const PropertyHeader = ({ propertyType, displayTitle, createdAt }) => {
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  return (
    <View style={styles.headerInfo}>
      <View style={styles.propertyBadge}>
        <Text style={styles.propertyType}>{propertyType || "Propiedad"}</Text>
      </View>

      <Text style={styles.propertyTitle} numberOfLines={2}>
        {displayTitle}
      </Text>

      {createdAt && (
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>Registrado el {formatDate(createdAt)}</Text>
        </View>
      )}
    </View>
  )
}

const DescriptionSection = ({ description }) => {
  if (!description) return null

  return (
    <View style={styles.descriptionSection}>
      <View style={styles.sectionHeader}>
        <IconComponent name="document" width={20} height={20} color={ORANGE} />
        <Text style={styles.sectionTitle}>Descripción General</Text>
      </View>
      <View style={styles.descriptionBox}>
        <Text style={styles.descriptionText}>{description || "Sin descripción detallada."}</Text>
      </View>
    </View>
  )
}

const CarouselImageItem = ({ item, index, totalImages, onPress, getImageUrl }) => {
  if (!item?.file_url) return null

  return (
    <TouchableOpacity style={styles.carouselItem} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: getImageUrl(item.file_url) }} style={styles.carouselImage} resizeMode="cover" />
      <View style={styles.imageOverlay}>
        <View style={styles.imageIndexBadge}>
          <Text style={styles.imageIndexText}>
            {index + 1}/{totalImages}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const PhotoCarousel = ({ images, getImageUrl, onImagePress }) => {
  const scrollX = useRef(new Animated.Value(0)).current

  if (!images?.length) return null

  return (
    <View style={styles.carouselSection}>
      <View style={styles.sectionHeader}>
        <IconComponent name="image" width={20} height={20} color={ORANGE} />
        <Text style={styles.sectionTitle}>Archivos adjuntos</Text>
      </View>

      <View style={styles.carouselContainer}>
        <Animated.FlatList
          data={images}
          keyExtractor={(item, index) => `image_${index}`}
          horizontal
          nestedScrollEnabled={true} // habilita scroll anidado dentro del ScrollView
          showsHorizontalScrollIndicator={false}
          snapToInterval={SNAP_INTERVAL}
          decelerationRate="fast"
          snapToAlignment="start"
          bounces={false}
          // side spacers to center items cross‑platform
          ListHeaderComponent={<View style={{ width: INSET_X }} />}
          ListFooterComponent={<View style={{ width: INSET_X }} />}
          // use separator instead of gap for precise measurement
          ItemSeparatorComponent={() => <View style={{ width: SPACING }} />}
          // keep Animated scroll for dots
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          // fixed layout so snapping is exact
          getItemLayout={(data, index) => ({
            length: SNAP_INTERVAL,
            offset: SNAP_INTERVAL * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <CarouselImageItem
              item={item}
              index={index}
              totalImages={images.length}
              onPress={() => onImagePress(index)}
              getImageUrl={getImageUrl}
            />
          )}
        />

        <View style={styles.paginationContainer}>
          {images.map((_, index) => {
            const inputRange = [(index - 1) * SNAP_INTERVAL, index * SNAP_INTERVAL, (index + 1) * SNAP_INTERVAL]
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            })
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: "clamp",
            })
            return (
              <Animated.View
                key={`dot_${index}`}
                style={[
                  styles.paginationDot,
                  {
                    width: dotWidth,
                    opacity,
                  },
                ]}
              />
            )
          })}
        </View>
      </View>
    </View>
  )
}

const ImageViewerModal = ({ visible, images, initialIndex, onClose, getImageUrl }) => {
  return (
    <Modal visible={visible} transparent onRequestClose={onClose} animationType="fade" statusBarTranslucent>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <FlatList
          data={images}
          horizontal
          pagingEnabled
          initialScrollIndex={initialIndex}
          getItemLayout={(data, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          keyExtractor={(item, index) => `fullscreen_${index}`}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.fullScreenImageContainer}>
              <Image source={{ uri: getImageUrl(item.file_url) }} style={styles.fullScreenImage} resizeMode="contain" />
            </View>
          )}
          onScrollToIndexFailed={() => {}}
        />
      </View>
    </Modal>
  )
}

const InitialStateDetailScreen = ({ route, navigation }) => {
  const initialState = route?.params?.initialState || {}
  const propertyTitle = route?.params?.title || "Propiedad"
  const rentalData = route?.params?.rentalData || {}

  const [viewerVisible, setViewerVisible] = useState(false)
  const [initialIndex, setInitialIndex] = useState(0)

  const displayTitle = useMemo(() => {
    const address = rentalData.address || ""
    const neighborhood = rentalData.neighborhood || ""
    const fullAddress = [address, neighborhood].filter(Boolean).join(", ")
    return fullAddress || propertyTitle
  }, [rentalData.address, rentalData.neighborhood, propertyTitle])

  const getImageUrl = useCallback((fileUrl) => {
    if (!fileUrl || typeof fileUrl !== "string") return null
    if (fileUrl.startsWith("http")) return fileUrl
    return `https://tyheaqrxtccgvsrcqkqt.supabase.co/storage/v1/object/public/mobile/initialstate/${fileUrl}`
  }, [])

  const { cleanDescription, allImages } = useMemo(() => {
    let description = initialState.description || ""
    let extractedImages = []

    if (description.includes("[FOTOS_ADJUNTAS]")) {
      const parts = description.split("[FOTOS_ADJUNTAS]")
      description = parts[0].trim()
      const urlsPart = parts[1]
      if (urlsPart) {
        const urls = urlsPart
          .split("\n")
          .map((u) => u.trim())
          .filter((u) => u.length > 0)
        extractedImages = urls.map((url, index) => ({ id: `desc_img_${index}`, file_url: url }))
      }
    }

    const existingAttachments = initialState.attachments || []
    const normalizedExisting = existingAttachments
      .map((att, i) => (typeof att === "string" ? { id: `exist_${i}`, file_url: att } : att))
      .filter((item) => item?.file_url)

    const allImages = [...normalizedExisting, ...extractedImages]
    return { cleanDescription: description, allImages }
  }, [initialState.description, initialState.attachments])

  const handleOpenImageViewer = useCallback((index) => {
    setInitialIndex(index)
    setViewerVisible(true)
  }, [])

  const handleCloseViewer = useCallback(() => {
    setViewerVisible(false)
  }, [])

  return (
    <View style={styles.container}>
      <Home style={styles.backgroundImage} />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <IconComponent name="back-arrow" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Estado Inicial</Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        directionalLockEnabled={true} // bloquea el scroll a vertical cuando corresponde
      >
        <View style={styles.card}>
          <PropertyHeader
            propertyType={rentalData.property_type}
            displayTitle={displayTitle}
            createdAt={initialState.created_at}
          />

          <DescriptionSection description={cleanDescription} />

          <PhotoCarousel images={allImages} getImageUrl={getImageUrl} onImagePress={handleOpenImageViewer} />
        </View>
      </ScrollView>

      <ImageViewerModal
        visible={viewerVisible}
        images={allImages}
        initialIndex={initialIndex}
        onClose={handleCloseViewer}
        getImageUrl={getImageUrl}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContent: {
    paddingBottom: responsiveHeight(6),
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: responsiveHeight(5),
    marginBottom: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1.5),
    backgroundColor: "transparent",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
   
  },
  topTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: responsiveFontSize(2.3),
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "Poppins_700Bold",
    letterSpacing: -0.3,
  },
  topSpacer: {
    width: 40,
  },
  card: {
    backgroundColor: "#ffffffff",
    borderRadius: 24,
    padding: responsiveWidth(5.5),
    marginHorizontal: responsiveWidth(4),
    marginTop: responsiveHeight(0.5),
    // orange accent border + shadow
    borderWidth: 1.5,
    borderColor: ORANGE + "33", // ~20% opacity
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  headerInfo: {
    alignItems: "center",
    marginBottom: responsiveHeight(3),
    paddingBottom: responsiveHeight(2),
    borderBottomWidth: 2,
    borderBottomColor: "#FFF4EC",
  },
  propertyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4EC",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 8,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: ORANGE + "40",
  },
  propertyType: {
    fontSize: responsiveFontSize(1.45),
    fontWeight: "700",
    color: ORANGE,
    fontFamily: "Poppins_700Bold",
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },
  propertyTitle: {
    textAlign: "center",
    fontSize: responsiveFontSize(2.1),
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "Poppins_700Bold",
    marginBottom: 12,
    lineHeight: responsiveFontSize(2.8),
    paddingHorizontal: responsiveWidth(2),
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ORANGE + "12",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 7,
    borderWidth: 1,
    borderColor: ORANGE + "25",
  },
  dateText: {
    color: ORANGE,
    fontSize: responsiveFontSize(1.35),
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    letterSpacing: 0.2,
  },
  descriptionSection: {
    marginTop: responsiveHeight(0.5),
    marginBottom: responsiveHeight(3),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: responsiveHeight(1.5),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(1.95),
    fontFamily: "Poppins_600SemiBold",
    color: "#1F2937",
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  descriptionBox: {
    backgroundColor: "#F8FAFC",
    padding: responsiveWidth(4.5),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8EAF0",
  },
  descriptionText: {
    fontSize: responsiveFontSize(1.6),
    color: "#475569",
    fontFamily: "Poppins_400Regular",
    lineHeight: responsiveFontSize(2.5),
    letterSpacing: 0.1,
  },
  carouselSection: {
    marginTop: responsiveHeight(1),
  },
  carouselContainer: {
    marginVertical: responsiveHeight(1.5),
    justifyContent: "flex-start",
    alignItems: "start",
  },
  carouselItem: {
    width: CARD_WIDTH, // keep in sync with SNAP_INTERVAL
    // height: "fit-content",
    height: responsiveHeight(25),
        justifyContent: "flex-start",
    alignItems: "flex-start",
    marginLeft: responsiveWidth(0),
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: ORANGE + "25",
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 12,
  },
  imageIndexBadge: {
    backgroundColor: ORANGE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  imageIndexText: {
    color: "#FFFFFF",
    fontSize: responsiveFontSize(1.3),
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.3,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: responsiveHeight(2),
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: ORANGE,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ORANGE,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    lineHeight: 28,
  },
  fullScreenImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  fullScreenImage: {
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_HEIGHT * 0.85,
  },
})

export default InitialStateDetailScreen

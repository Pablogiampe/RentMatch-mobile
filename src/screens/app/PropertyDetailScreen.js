import React from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, Image } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import IconComponent from "../../../RentMatch_mobile/assets/icons"
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins"

// Importamos las imágenes
const houseImage = require("../../../RentMatch_mobile/assets/casa.png")
const aptImage = require("../../../RentMatch_mobile/assets/departament.png")

const { width } = Dimensions.get('window')

const PropertyDetailScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { rentalData } = route.params || {}
  
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  })

  if (!fontsLoaded || !rentalData) return null

  const formatCurrency = (value, currency = "ARS") => {
    try {
      return new Intl.NumberFormat("es-AR", { 
        style: "currency", 
        currency, 
        maximumFractionDigits: 0 
      }).format(value)
    } catch {
      return `${currency} ${value}`
    }
  }

  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "")

  const title = rentalData.property_type ? capitalize(rentalData.property_type) : "Propiedad"
  const address = rentalData.address || "Sin dirección"
  const neighborhood = rentalData.neighborhood || ""
  const city = rentalData.city || ""
  
  // Lógica para elegir la imagen
  const getHeaderImage = () => {
    const type = rentalData.property_type ? rentalData.property_type.toLowerCase() : ""
    if (type.includes("departamento")) {
      return aptImage
    }
    return houseImage
  }

  // Tamaño fijo para la imagen
  const IMAGE_SIZE = 250

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF5A1F" />
      
      {/* Header Background Colorido */}
      <View style={styles.headerBackground} />

      {/* Botón Volver Flotante */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <IconComponent color="white" name="back-arrow" style={styles.backIcon} />
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.spacer} />

        {/* Tarjeta Principal Flotante */}
        <View style={styles.mainCard}>
          
          {/* Imagen Flotante Superpuesta (Icono) Estática */}
          <View style={[
            styles.floatingImageContainer,
            {
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              top: -IMAGE_SIZE / 2,
              borderRadius: IMAGE_SIZE / 2,
            }
          ]}>
            <Image 
              source={getHeaderImage()} 
              style={styles.floatingImage}
            />
          </View>

          {/* Encabezado de la Tarjeta */}
          <View style={styles.titleSection}>
            {/* Dirección como Título Principal */}
            <Text style={styles.addressTitle}>{address}</Text>
            <Text style={styles.citySubtitle}>
              {[ city].filter(Boolean).join(", ")}
            </Text>

            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{title}</Text>
            </View>
            
            <Text style={styles.priceText}>
              {formatCurrency(rentalData.rent_amount, rentalData.rent_currency)}
            </Text>
            <Text style={styles.priceLabel}>por mes</Text>
          </View>

          <View style={styles.divider} />
          
          {/* Grilla de Estadísticas Visuales (2x2) */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#E0F2FE' }]}>
                <Text style={{fontSize: 24}}>🛏️</Text>
              </View>
              <View>
                <Text style={styles.statValue}>{rentalData.rooms || 0}</Text>
                <Text style={styles.statLabel}>Ambientes</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#DCFCE7' }]}>
                <Text style={{fontSize: 24}}>🚿</Text>
              </View>
              <View>
                <Text style={styles.statValue}>{rentalData.bathrooms || 0}</Text>
                <Text style={styles.statLabel}>Baños</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Text style={{fontSize: 24}}>🛋️</Text>
              </View>
              <View>
                <Text style={styles.statValue}>{rentalData.furnished ? "Sí" : "No"}</Text>
                <Text style={styles.statLabel}>Amoblado</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Text style={{fontSize: 24}}>🐾</Text>
              </View>
              <View>
                <Text style={styles.statValue}>{rentalData.pets_allowed ? "Sí" : "No"}</Text>
                <Text style={styles.statLabel}>Mascotas</Text>
              </View>
            </View>
          </View>

          {/* Sección de Comodidades */}
          {rentalData.amenities && rentalData.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Comodidades</Text>
              <View style={styles.amenitiesContainer}>
                {rentalData.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityChip}>
                    <Text style={styles.amenityText}>✨ {amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Sección de Notas */}
          {rentalData.notes ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notas adicionales</Text>
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{rentalData.notes}</Text>
              </View>
            </View>
          ) : null}

        </View>
        
        <View style={{ height: responsiveHeight(5) }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  headerBackground: {
    height: responsiveHeight(45), // Ocupa casi la mitad de la pantalla
    backgroundColor: "#FF5A1F",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    position: 'absolute',
    top: responsiveHeight(6),
    left: responsiveWidth(5),
    zIndex: 10,
    padding: 10,
    borderRadius: 12,
  },
  backIcon: {
    color: '#FFf',
    fontSize: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: responsiveHeight(10),
  },
  spacer: {
    height: responsiveHeight(35), // Empuja la tarjeta bien abajo para obligar el scroll
  },
  mainCard: {
    backgroundColor: '#fff',
    marginHorizontal: responsiveWidth(5),
    borderRadius: 24,
    padding: responsiveWidth(6),
    paddingTop: responsiveHeight(16), // Espacio grande para la imagen gigante
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: responsiveHeight(2),
    position: 'relative',
    minHeight: responsiveHeight(60), // Asegura altura para scrollear
  },
  floatingImageContainer: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    backgroundColor: 'transparent', // Sin fondo blanco para que sea solo la imagen
  },
  floatingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: responsiveHeight(3),
  },
  addressTitle: {
    fontSize: responsiveFontSize(2.6),
    fontFamily: 'Poppins_700Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  citySubtitle: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  typeBadge: {
    backgroundColor: '#FFF4EC',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFD6BF',
  },
  typeText: {
    color: '#FF5A1F',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: responsiveFontSize(2),
  },
  priceText: {
    fontSize: responsiveFontSize(5),
    fontFamily: 'Poppins_700Bold',
    color: '#111827',
    lineHeight: responsiveFontSize(6),
    textAlign: 'center',
  },
  priceLabel: {
    fontSize: responsiveFontSize(1.8),
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: responsiveHeight(2),
  },
  // Nueva Grilla 2x2
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: responsiveWidth(3),
    marginBottom: responsiveHeight(4),
  },
  statCard: {
    width: '48%', // Casi la mitad para hacer 2 columnas
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveHeight(1.5),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: 'Poppins_700Bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: responsiveFontSize(1.4),
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
  },
  section: {
    marginBottom: responsiveHeight(4),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(2.2),
    fontFamily: 'Poppins_700Bold',
    color: '#1F2937',
    marginBottom: responsiveHeight(2),
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  amenityText: {
    color: '#4B5563',
    fontSize: responsiveFontSize(1.6),
    fontFamily: 'Poppins_600SemiBold',
  },
  notesBox: {
    backgroundColor: '#FFF8F1', // Fondo naranja muy suave
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5A1F',
  },
  notesText: {
    color: '#4B5563',
    fontSize: responsiveFontSize(1.6),
    fontFamily: 'Poppins_400Regular',
    lineHeight: 26,
  },
})

export default PropertyDetailScreen

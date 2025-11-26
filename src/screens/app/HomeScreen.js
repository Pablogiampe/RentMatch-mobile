import { useState, useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, ActivityIndicator, RefreshControl, FlatList, Alert } from "react-native"
import IconComponent from "../../../RentMatch_mobile/assets/icons"
import { useAuth } from "../../contexts/AuthContext"
import { useRental } from "../../contexts/RentalContext"
import Home from "../../../RentMatch_mobile/assets/home"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins"
import { useNavigation } from "@react-navigation/native"

// Constantes para el carrusel
const CARD_WIDTH = responsiveWidth(88)
const SPACING = responsiveWidth(4)
const SNAP_INTERVAL = CARD_WIDTH + SPACING
const SIDE_SPACER = (responsiveWidth(100) - CARD_WIDTH) / 2
  
const HomeScreen= () => {
  const { user, signOut } = useAuth()
  const rentalContext = useRental()
  const navigation = useNavigation()
  
  // Estado para el alquiler seleccionado (Contexto actual)
  const [selectedRental, setSelectedRental] = useState(null)
  // Nuevo estado para controlar el índice activo visualmente
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef(null)
  const scrollX = useRef(new Animated.Value(0)).current // Referencia para animación fluida

  // ✅ FIX: Leer datos directamente del nivel raíz (como viene en Postman)
  const getProp = (r) => {
    return {
      type: r.property_type || "Propiedad",
      address: r.address || "Sin dirección",
      neighborhood: r.neighborhood || "Sin barrio",
      city: r.city || "Sin ciudad",
      rooms: r.rooms || 0,
      bathrooms: r.bathrooms || 0,
      price: r.rent_amount || 0,
      currency: r.rent_currency || "ARS",
      furnished: r.furnished || false,
      pets_allowed: r.pets_allowed || false,
      amenities: r.amenities || [],
      notes: r.notes || "",
    }
  }
  
  const {
    activeRentals = [],
    rentalHistory = [],
    loading = false,
    error = null,
    loadRentals,
  } = rentalContext || {}

  const formatDate = (d) => {
    if (!d) return "—"
    try {
      return new Date(d).toLocaleDateString("es-AR", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return "—"
    }
  }
  
  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "")
  
  const formatCurrency = (value, currency = "ARS") => {
    if (value == null || value === 0) return "—"
    try {
      return new Intl.NumberFormat("es-AR", { 
        style: "currency", 
        currency, 
        maximumFractionDigits: 0 
      }).format(value)
    } catch {
      return `${currency} ${Number(value).toLocaleString("es-AR")}`
    }
  }
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [showArrow, setShowArrow] = useState(true)
  // const [activeTab, setActiveTab] = useState("active") // ELIMINADO: Ya no necesitamos tabs
  const [refreshing, setRefreshing] = useState(false)

  // Aumentamos la altura inicial a 12% para evitar el notch/cámara
  const animatedHeight = useRef(new Animated.Value(responsiveHeight(9))).current
  const arrowRotation = useRef(new Animated.Value(0)).current
  const scrollY = useRef(0)

  const handleSignOut = async () => {
    await signOut()
  }

  const onRefresh = async () => {
    try {
      setRefreshing(true)
      await loadRentals?.()
    } finally {
      setRefreshing(false)
    }
  }

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  })

  useEffect(() => {
    if (user?.id) {
      console.log("🏠 HomeScreen: Cargando alquileres para usuario:", user.id)
      loadRentals()
    }
  }, [user?.id, loadRentals])

  // Efecto para seleccionar el primer alquiler por defecto cuando cargan
  useEffect(() => {
    if (activeRentals && activeRentals.length > 0 && !selectedRental) {
      setSelectedRental(activeRentals[0])
      setActiveIndex(0)
    }
  }, [activeRentals])

  // Debug: verificar estado de alquileres
  useEffect(() => {
    console.log('\n📋 ===== ESTADO ALQUILERES =====')
    console.log('Activos:', activeRentals.length)
    console.log('Historial:', rentalHistory.length)
    console.log('Loading:', loading)
    console.log('Error:', error)
    if (activeRentals.length > 0) {
      console.log('Primer activo:', JSON.stringify(activeRentals[0], null, 2))
    }
    console.log('📋 ================================\n')
  }, [activeRentals, rentalHistory, loading, error])

  if (!fontsLoaded) {
    return null
  }

  if (!rentalContext) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: RentalContext no está disponible</Text>
          <Text style={styles.errorSubText}>Asegúrate de envolver tu app con RentalProvider</Text>
        </View>
      </View>
    )
  }

  const firstName = user?.full_name?.split(" ")[0]

  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y
    scrollY.current = currentScrollY
  }

  const toggleExpand = () => {
    const newExpandedState = !isExpanded
    setIsExpanded(newExpandedState)

    Animated.parallel([
      Animated.spring(animatedHeight, {
        // Expandido a 60% para ver menú, Colapsado a 12% para seguridad notch
        toValue: newExpandedState ? responsiveHeight(50) : responsiveHeight(9),
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(arrowRotation, {
        toValue: newExpandedState ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const arrowRotate = arrowRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  })
  
  // const rentalsToShow = activeTab === "active" ? activeRentals : rentalHistory // ELIMINADO

  // Función auxiliar para navegar con el contexto del alquiler seleccionado
  const handleAction = (screenName) => {
    if (!selectedRental) {
      Alert.alert("Selección requerida", "Por favor, selecciona un alquiler activo arriba para continuar.")
      return
    }
    
    // 👇 AQUÍ es donde se define el parámetro del contrato
    const contractId = selectedRental.contract_id || selectedRental.id
    const title = selectedRental.property_type 
      ? `${capitalize(selectedRental.property_type)}` 
      : "Propiedad"

    console.log(`🚀 Navegando a ${screenName} con contrato: ${contractId}`)

    navigation.navigate(screenName, { 
      contract_id: contractId,
      title: title,
      rentalData: selectedRental // Pasamos todo el objeto por si acaso
    })
  }

  // Manejar el scroll del carrusel para actualizar la selección automáticamente
  const handleScrollEnd = (event) => {
    if (!activeRentals || activeRentals.length === 0) return
    
    const x = event.nativeEvent.contentOffset.x
    // Ajuste fino para el cálculo del índice
    const index = Math.round(x / SNAP_INTERVAL)
    
    // Asegurar que el índice esté dentro de los límites
    const safeIndex = Math.max(0, Math.min(index, activeRentals.length - 1))
    
    setActiveIndex(safeIndex) // Actualizamos el índice visual

    const rental = activeRentals[safeIndex]
    
    // Solo actualizar si cambió
    if (rental && (!selectedRental || (rental.contract_id !== selectedRental.contract_id && rental.id !== selectedRental.id))) {
      setSelectedRental(rental)
    }
  }

  return (
    <View style={styles.container}>
      <Home style={{ position: "absolute", top: 0, left: 0 }} />
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            height: animatedHeight,
            borderBottomLeftRadius: responsiveWidth(50),
            borderBottomRightRadius: responsiveWidth(50),
          },
        ]}
      >
        <View style={styles.headerCircle} />

        {/* El botón de flecha se movió fuera para que pueda sobresalir */}

        {isExpanded && (
          <View style={styles.menuContent}>
            <View style={styles.row}>
              <TouchableOpacity style={{...styles.logoutButton, width: "33%"}} onPress={() => navigation.navigate("Profile")}>
                <View style={{ ...styles.iconContainer, backgroundColor: "#f2edee" }}>
                  <IconComponent name="profile" />
                </View>
                <Text style={styles.logoutText}>Mi perfil</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={{...styles.logoutButton, width: "50%"}} onPress={() => handleAction("Incidencias")}>
                <View style={{ ...styles.iconContainer, backgroundColor: "#e91c1cff" }}>
                  <IconComponent name="calendar" />
                </View>
                <Text style={styles.logoutText}>Reportar Incidencias</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{...styles.logoutButton, width: "50%"}} onPress={() => handleAction("FinalState")}>
                <View style={{ ...styles.iconContainer, backgroundColor: "#7781e0" }}>
                  <IconComponent name="home" />
                </View>
                <Text style={styles.logoutText}>Estado final</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
               <TouchableOpacity style={styles.logoutButton} onPress={() => handleAction("Peritaje")}>
                <View style={{ ...styles.iconContainer, backgroundColor: "#f5c951" }}>
                  <IconComponent name="inspection" />
                </View>
                <Text style={styles.logoutText}>Solicitar peritaje</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={() => handleAction("InitialState")}>
                <View style={{ ...styles.iconContainer, backgroundColor: "#DCFCE7" }}>
                  <IconComponent name="form-icon" />
                </View>
                <Text style={styles.logoutText}>Estado inicial</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                <View style={{ ...styles.iconContainer, backgroundColor: "white", borderRadius: 50 }}>
                  <IconComponent name="logout" />
                </View>
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Botón de flecha FLOTANTE fuera del header para sobresalir */}
      {showArrow && (
        <Animated.View 
          style={[
            styles.arrowButtonContainer, 
            { 
              top: animatedHeight, // Sigue la altura del header
              transform: [{ translateY: -responsiveWidth(7) }] // Sube la mitad de su altura para quedar centrado en el borde
            }
          ]}
        >
          <TouchableOpacity style={styles.arrowButton} onPress={toggleExpand} activeOpacity={0.9}>
            <Animated.Text style={[styles.arrowIcon, { transform: [{ rotate: arrowRotate }] }]}>
              <IconComponent name="arrow-down" />
            </Animated.Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF5A1F"]}
            tintColor="#FF5A1F"
          />
        }
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Hola, {firstName || "Usuario"}</Text>
            <Text style={styles.question}>¿Qué deseas hacer hoy?</Text>
          </View>

          {/* Carrusel de Alquileres Activos */}
          {loading ? (
            <View style={styles.loadingActiveRentals}>
              <ActivityIndicator size="large" color="#FF5A1F" />
              <Text style={styles.loadingText}>Cargando alquileres...</Text>
            </View>
          ) : activeRentals && activeRentals.length > 0 ? (
            <View style={styles.activeRentalsSection}>
              <Text style={styles.sectionTitleSmall}>Alquileres({activeRentals.length})</Text>
              <FlatList
                ref={flatListRef}
                data={activeRentals}
                keyExtractor={(item, index) => item.contract_id || item.id || `rental-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled={true}
                
                // Configuración de Snapping (Carousel)
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                snapToAlignment="start"
                contentContainerStyle={{
                  gap: SPACING,
                  paddingBottom: responsiveHeight(1),
                }}
                
                // Evento de scroll para animación fluida de los dots
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                scrollEventThrottle={16}

                onMomentumScrollEnd={handleScrollEnd}
                onScrollEndDrag={handleScrollEnd}

                renderItem={({ item, index }) => { // Agregamos index aquí
                  const p = getProp(item)
                  const title = `${capitalize(p.type)}`
                  const ubicacion = [p.address, p.neighborhood].filter(Boolean).join(", ")
                  
                  // Usamos el índice para determinar si es el seleccionado visualmente
                  const isSelected = index === activeIndex

                  return (
                    <TouchableOpacity
                      style={[
                        styles.rentalCarouselCard,
                        isSelected && styles.selectedRentalCard
                      ]}
                      activeOpacity={1}
                      onPress={() => {
                        // Si tocan uno lateral, scrollear hacia él
                        if (!isSelected) {
                          if (flatListRef.current) {
                            flatListRef.current.scrollToOffset({
                              offset: index * SNAP_INTERVAL,
                              animated: true
                            })
                            setActiveIndex(index)
                            setSelectedRental(item)
                          }
                        }
                      }}
                    >
                      <View style={styles.cardRow}>
                        <View style={styles.cardInfo}>
                          <Text style={styles.carouselCardTitle} numberOfLines={1}>{title}</Text>
                          <Text style={styles.carouselCardLocation} numberOfLines={1}>📍 {ubicacion}</Text>
                        </View>
                        
                        <View style={styles.cardPriceContainer}>
                          <Text style={styles.carouselCardPrice}>{formatCurrency(p.price, p.currency)}</Text>
                          {isSelected && (
                            <View style={styles.selectedTag}>
                              <Text style={styles.selectedTagText}>Activo</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  )
                }}
              />
              
              {/* Indicadores de Paginación (Dots) con Transición Fluida */}
              <View style={styles.paginationContainer}>
                {activeRentals.map((_, index) => {
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
          ) : (
            <View style={styles.noActiveRentals}>
              <Text style={styles.noActiveRentalsText}>No tienes alquileres activos</Text>
            </View>
          )}

          {/* Welcome banner */}
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeBadge}>
              <Text style={styles.welcomeBadgeText}>Nuevo</Text>
            </View>
            <Text style={styles.welcomeTitle}>Todo en un solo lugar</Text>
            <Text style={styles.welcomeSubtitle}>
              Reportá incidencias, gestioná estados y mirá tus alquileres activos.
            </Text>
          </View>

          {/* Options Grid */}
          <View style={styles.optionsGrid}>
            <TouchableOpacity style={styles.optionCard} onPress={() => handleAction("Incidencias")}>
              <View style={{ ...styles.iconContainer, backgroundColor: "#FFE3E3" }}>
                <IconComponent name="calendar" />
              </View>
              <Text style={styles.optionTitle}>Reportar</Text>
              <Text style={styles.optionSubtitle}>Incidencias</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => handleAction("InitialState")}>
              <View style={{ ...styles.iconContainer, backgroundColor: "#E6E8FF" }}>
                <IconComponent name="home" />
              </View>
              <Text style={styles.optionTitle}>Registrar</Text>
              <Text style={styles.optionSubtitle}>Estado inicial</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => handleAction("Peritaje")}>
              <View style={{ ...styles.iconContainer, backgroundColor: "#FFF2CC" }}>
                <IconComponent name="inspection" />
              </View>
              <Text style={styles.optionTitle}>Solicitar</Text>
              <Text style={styles.optionSubtitle}>Peritaje</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => handleAction("FinalState")}>
              <View style={{ ...styles.iconContainer, backgroundColor: "#DCFCE7" }}>
                <IconComponent name="form-icon" />
              </View>
              <Text style={styles.optionTitle}>Registrar</Text>
              <Text style={styles.optionSubtitle}>Estado final</Text>
            </TouchableOpacity>
          </View>

          {/* Botones de Acciones Secundarias (Historial y Peritajes) */}
          <View style={styles.secondaryActionsContainer}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => {
                const params = selectedRental ? {
                  contract_id: selectedRental.contract_id || selectedRental.id,
                  title: selectedRental.property_type ? `${capitalize(selectedRental.property_type)}` : "Propiedad",
                  rentalData: selectedRental
                } : {}
                navigation.navigate('RentalHistory', params)
              }} 
            >
              <View style={styles.secondaryButtonIcon}>
                <IconComponent name="home" style={{ color: '#6B7280', fontSize: 20 }} />
              </View>
              <View style={styles.secondaryButtonContent}>
                <Text style={styles.secondaryButtonTitle}>Historial de Alquileres</Text>
                <Text style={styles.secondaryButtonSubtitle}>Ver contratos finalizados</Text>
              </View>
              <IconComponent name="arrow-right" style={{ color: '#9CA3AF', fontSize: 16 }} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => {
                const params = selectedRental ? {
                  contract_id: selectedRental.contract_id || selectedRental.id,
                  title: selectedRental.property_type ? `${capitalize(selectedRental.property_type)}` : "Propiedad",
                  rentalData: selectedRental
                } : {}
                navigation.navigate('Peritajes', params)
              }}
            >
              <View style={styles.secondaryButtonIcon}>
                <IconComponent name="inspection" style={{ color: '#6B7280', fontSize: 20 }} />
              </View>
              <View style={styles.secondaryButtonContent}>
                <Text style={styles.secondaryButtonTitle}>Mis Peritajes</Text>
                <Text style={styles.secondaryButtonSubtitle}>Consultar estado de solicitudes</Text>
              </View>
              <IconComponent name="arrow-right" style={{ color: '#9CA3AF', fontSize: 16 }} />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: "hidden",
  },
  headerCircle: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: responsiveHeight(70),
    backgroundColor: "#FF5A1F",
  },
  headerTopRow: {
    position: "absolute",
    top: responsiveHeight(3),
    left: responsiveWidth(5),
    right: responsiveWidth(5),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: responsiveFontSize(2.2),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  sectionTitleSmall: {
    fontSize: responsiveFontSize(2),
    marginLeft: responsiveWidth(2),
    color: "#1f2937e3",
      fontFamily: "Poppins_600SemiBold",
  },
  headerIconBtn: {
    width: responsiveWidth(9),
    height: responsiveWidth(9),
    borderRadius: responsiveWidth(4.5),
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconEmoji: {
    fontSize: responsiveFontSize(2.2),
  },
  arrowButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",

    zIndex: 1001, // Por encima del header
  },
  arrowButton: {
    width: responsiveWidth(14),
    height: responsiveWidth(14),
    borderRadius: responsiveWidth(7),
    backgroundColor: "#FF5A1F", // Mismo naranja para parecer integrado
    borderWidth: 4, // Borde blanco grueso para separar visualmente
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  arrowIcon: {
    fontSize: responsiveFontSize(3),
    color: "#fff",
    fontWeight: "bold",
  },
  menuContent: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    top: responsiveHeight(8),
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: responsiveWidth(6),
    zIndex: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: responsiveWidth(6),
    marginBottom: responsiveHeight(2),
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: responsiveHeight(10),
  },
  content: {
    flex: 1,
    paddingHorizontal: responsiveWidth(5),
  },
  header: {
    marginBottom: responsiveHeight(3),
  },
  greeting: {
    fontSize: responsiveFontSize(2.8),
    fontFamily: "Poppins_600SemiBold",
    marginTop: responsiveHeight(3),
    color: "#4B4B4D",
    marginHorizontal: "auto",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  question: {
    fontSize: responsiveFontSize(2.8),
    color: "#4B4B4D",
    fontFamily: "Poppins_600SemiBold",
    marginHorizontal: "auto",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeCard: {
    backgroundColor: "#FFF4EC",
    borderColor: "#FFD6BF",
    borderWidth: 1,
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(4),
    borderRadius: 12,
    marginBottom: responsiveHeight(3),
  },
  welcomeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFE6D6",
    paddingHorizontal: responsiveWidth(2.5),
    paddingVertical: responsiveHeight(0.4),
    borderRadius: 20,
    marginBottom: responsiveHeight(0.8),
  },
  welcomeBadgeText: {
    color: "#B45309",
    fontWeight: "700",
    fontSize: responsiveFontSize(1.2),
  },
  welcomeTitle: {
    color: "#1F2937",
    fontSize: responsiveFontSize(2.1),
    fontWeight: "700",
  },
  welcomeSubtitle: {
    color: "#6B7280",
    fontSize: responsiveFontSize(1.5),
    marginTop: responsiveHeight(0.5),
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: responsiveHeight(4),
  },
  optionCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: responsiveWidth(4),
    alignItems: "center",
    marginBottom: responsiveHeight(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: responsiveWidth(13),
    height: responsiveWidth(13),
    borderRadius: responsiveWidth(6.5),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
  },
  optionTitle: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: "Poppins_600SemiBold",
    color: "#4B4B4D",
    textAlign: "center",
  },
  optionSubtitle: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: "Poppins_600SemiBold",
    color: "#4B4B4D",
    textAlign: "center",
  },
  activeRentalsSection: {
    marginBottom: responsiveHeight(3),
  },
  rentalCarouselCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(2.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    opacity: 0.6, // Un poco transparente cuando no está seleccionado
    transform: [{ scale: 0.95 }], // Un poco más chico
  },
  selectedRentalCard: {
    borderColor: "#FF5A1F",
    borderWidth: 1.5,
    backgroundColor: "#FFF8F6",
    shadowColor: "#FF5A1F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    opacity: 1, // Totalmente visible
    transform: [{ scale: 1 }], // Tamaño normal
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    paddingRight: responsiveWidth(2),
  },
  cardPriceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: responsiveWidth(25),
  },
  carouselCardTitle: {
    fontSize: responsiveFontSize(2),
    fontFamily: 'Poppins_600SemiBold',
    color: "#1F2937",
    marginBottom: 2,
  },
  carouselCardLocation: {
    fontSize: responsiveFontSize(1.5),
    fontFamily: 'Poppins_400Regular',
    color: "#6B7280",
  },
  carouselCardPrice: {
    fontSize: responsiveFontSize(2),
    fontFamily: 'Poppins_700Bold',
    color: "#FF5A1F",
    marginBottom: 4,
  },
  selectedTag: {
    backgroundColor: "#FF5A1F",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selectedTagText: {
    color: "#fff",
    fontSize: responsiveFontSize(1.2),
    fontFamily: 'Poppins_600SemiBold',
  },
  tapToSelectText: {
    color: "#9CA3AF",
    fontSize: responsiveFontSize(1.2),
    fontFamily: 'Poppins_400Regular',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveHeight(1.5),
    gap: 6,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: '#FF5A1F',
  },
  
  paginationDotInactive: {
    width: 6,
    backgroundColor: '#E5E7EB',
  },
  secondaryActionsContainer: {
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(4),
    gap: responsiveHeight(2),
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: responsiveWidth(4),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  secondaryButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveWidth(3),
  },
  secondaryButtonContent: {
    flex: 1,
  },
  secondaryButtonTitle: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: 'Poppins_600SemiBold',
    color: '#374151',
  },
  secondaryButtonSubtitle: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: 'Poppins_400Regular',
    color: '#9CA3AF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveHeight(4),
  },
  errorText: {
    fontSize: responsiveFontSize(2),
    color: '#FF5A1F',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    marginBottom: responsiveHeight(1),
  },
  errorSubText: {
    fontSize: responsiveFontSize(1.6),
    color: '#666',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: responsiveHeight(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingActiveRentals: {
    padding: responsiveHeight(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: responsiveHeight(2),
    fontSize: responsiveFontSize(1.8),
    color: '#666',
    fontFamily: 'Poppins_400Regular',
  },
  errorIcon: {
    fontSize: responsiveFontSize(6),
    color: '#FF5A1F',
    marginBottom: responsiveHeight(1),
  },
  retryButton: {
    backgroundColor: '#FF5A1F',
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(6),
    borderRadius: 8,
    marginTop: responsiveHeight(2),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize(1.8),
    fontFamily: 'Poppins_600SemiBold',
  },
  emptyContainer: {
    padding: responsiveHeight(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: responsiveFontSize(8),
    color: '#B4BEE2',
    marginBottom: responsiveHeight(2),
  },
  emptyText: {
    fontSize: responsiveFontSize(1.8),
    color: '#666',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
  noActiveRentals: {
    padding: responsiveHeight(3),
    alignItems: 'center',
    marginBottom: responsiveHeight(2),
  },
  noActiveRentalsText: {
    fontSize: responsiveFontSize(1.6),
    color: '#999',
    fontFamily: 'Poppins_400Regular',
  },
})
export default HomeScreen
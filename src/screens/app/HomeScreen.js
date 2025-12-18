import { useState, useRef, useEffect, useMemo } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, ActivityIndicator, RefreshControl, FlatList, PanResponder } from "react-native"
import IconComponent from "../../../RentMatch_mobile/assets/icons"
import { useAuth } from "../../contexts/AuthContext"
import { useRental } from "../../contexts/RentalContext"
import Home from "../../../RentMatch_mobile/assets/home"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins"
import { useNavigation } from "@react-navigation/native"
import CustomAlert from "../../components/CustomAlert"

const ORANGE = "#FF5A1F"

// Constantes para el carrusel
const CARD_WIDTH = responsiveWidth(85)
const SPACING = responsiveWidth(3)
const SNAP_INTERVAL = CARD_WIDTH + SPACING
const INSET_X = (responsiveWidth(100) - CARD_WIDTH) / 2
  
const HomeScreen= () => {
  const { user, signOut, token, session } = useAuth()
  const rentalContext = useRental()
  const navigation = useNavigation()
  
  // Estado para el alquiler seleccionado (Contexto actual)
  const [selectedRental, setSelectedRental] = useState(null)
  // Nuevo estado para controlar el índice activo visualmente
  const [activeIndex, setActiveIndex] = useState(0)

  // Estado para CustomAlert
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: ""
  })

  const showAlert = (title, message) => {
    setAlertConfig({ visible: true, title, message })
  }

  const hideAlert = () => {
    setAlertConfig({ ...alertConfig, visible: false })
  }

  // Lógica para validar si se puede acceder al Estado Final (5 días antes del fin de contrato)
  const finalStateStatus = useMemo(() => {
    if (!selectedRental || !selectedRental.end_date) return { enabled: false, days: null }

    const endDate = new Date(selectedRental.end_date)
    const today = new Date()
    // Normalizar horas para comparar solo fechas
    endDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    const diffTime = endDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Habilitar si faltan 5 días o menos (o si ya pasó la fecha)
    return {
      enabled: diffDays <= 5,
      days: diffDays
    }
  }, [selectedRental])

  // Helper: calcula disponibilidad del Estado Final para cualquier alquiler
  const getFinalStateStatus = (rental) => {
    if (!rental || !rental.end_date) return { enabled: false, days: null }
    const endDate = new Date(rental.end_date)
    const today = new Date()
    endDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    const diffTime = endDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return { enabled: diffDays <= 5, days: diffDays }
  }
  
  const [nextPeritaje, setNextPeritaje] = useState(null) // Estado para el próximo peritaje
  const flatListRef = useRef(null)
  const scrollX = useRef(new Animated.Value(0)).current // Referencia para animación fluida

  // Detectar el ítem visible para actualizar selección
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (!viewableItems || viewableItems.length === 0) return
    const first = viewableItems[0]
    if (first?.index == null) return
    const i = first.index
    setActiveIndex(i)
    const rental = activeRentals[i]
    if (rental) setSelectedRental(rental)
  }).current

  // ✅ FIX: Leer datos directamente del nivel raíz (como viene en Postman)
  const getProp = (r) => {
    return {
      type: r.property_type || "Propiedad",
      address: r.address || r.property || r.property_address || "Sin dirección",
      neighborhood: r.neighborhood || r.barrio || "",
      city: r.city || r.localidad || "",
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

  // MOVIDO: Definimos toggleExpand ANTES del PanResponder para evitar errores de referencia
  const toggleExpand = () => {
    const newExpandedState = !isExpanded
    setIsExpanded(newExpandedState)

    Animated.parallel([
      Animated.spring(animatedHeight, {
        // Aumentamos a 70% para que entren las 4 filas cómodamente
        toValue: newExpandedState ? responsiveHeight(62) : responsiveHeight(9),
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

  // Configuración del PanResponder para detectar gestos de deslizamiento
  // USAMOS useMemo en lugar de useRef para que se actualice cuando cambia isExpanded
  const panResponder = useMemo(() => 
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // ✅ Agrega validación
        if (!gestureState) return false
        return Math.abs(gestureState.dy) > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!gestureState) return
        
        if (gestureState.dy > 50 && !isExpanded) {
          toggleExpand()
        } else if (gestureState.dy < -50 && isExpanded) {
          toggleExpand()
        }
      },
    }),
    [isExpanded, toggleExpand] // ✅ Agrega todas las dependencias
  )

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

  // Efecto para cargar el próximo peritaje
  useEffect(() => {
    const fetchNextPeritaje = async () => {
      if (!user?.id) return
      const activeToken = token || session
      if (!activeToken) return

      try {
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
        
        if (response.ok && data.data && Array.isArray(data.data)) {
          const now = new Date()
          now.setHours(0, 0, 0, 0) // Ignorar hora para comparar fechas

          // Filtrar futuros y ordenar por fecha ascendente
          const upcoming = data.data
            .map(item => ({
              ...item,
              dateObj: new Date(item.date || item.created_at)
            }))
            .filter(item => item.dateObj >= now)
            .sort((a, b) => a.dateObj - b.dateObj)

          if (upcoming.length > 0) {
            setNextPeritaje(upcoming[0])
          } else {
            setNextPeritaje(null)
          }
        }
      } catch (error) {
        console.log("Error fetching next peritaje:", error)
      }
    }

    fetchNextPeritaje()
  }, [user, token, session])

  // Efecto para seleccionar el primer alquiler por defecto cuando cargan
  useEffect(() => {
    if (activeRentals && activeRentals.length > 0 && !selectedRental) {
      setSelectedRental(activeRentals[0])
      setActiveIndex(0)
    }
  }, [activeRentals])

  // Refrescar selección cuando cambia el índice activo
  useEffect(() => {
    if (activeRentals && activeRentals[activeIndex]) {
      setSelectedRental(activeRentals[activeIndex])
    }
  }, [activeIndex, activeRentals])

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

  const arrowRotate = arrowRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  })
  
  // Rental actualmente visible en el carrusel (fallbacks seguros)
  const currentRental = selectedRental || activeRentals[activeIndex] || (activeRentals && activeRentals[0]) || null
  // FIX: no uses useMemo aquí para no cambiar el orden de hooks entre renders tempranos
  const finalStatus = getFinalStateStatus(currentRental)

  // Función auxiliar para navegar con el contexto del alquiler seleccionado o el visible
  const handleAction = async (screenName, rentalParam = null) => {
    const rental = rentalParam || currentRental
    if (!rental) {
      showAlert("Selección requerida", "Por favor, selecciona un alquiler activo arriba para continuar.")
      return
    }

    const contractId = rental.contract_id || rental.id
    const title = rental.property_type ? `${capitalize(rental.property_type)}` : "Propiedad"

    if (screenName === "InitialState") {
      const existingState = await checkInitialState(contractId)
      if (existingState) {
        navigation.navigate("InitialStateDetail", {
          initialState: existingState,
          rentalData: rental,
          title,
        })
      } else {
        navigation.navigate("InitialState", {
          contract_id: contractId,
          title,
          rentalData: rental,
        })
      }
      return
    }

    navigation.navigate(screenName, {
      contract_id: contractId,
      title,
      rentalData: rental,
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
      console.log("🔄 Cambio de alquiler seleccionado:", rental.address || "Sin dirección") // <--- LOG PARA VERIFICAR
      setSelectedRental(rental)
    }
  }

  const checkInitialState = async (contractId) => {
    try {
      const activeToken = token || session
      const response = await fetch("https://rentmatch-backend.onrender.com/api/mobile-Inicial/InicialState", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`
        },
      })

      const data = await response.json()
            console.log("Error verificando estado inicial:", data)

      // Si devuelve datos y success es true
      if (response.ok && data.success && Array.isArray(data.data)) {
        // 1. Filtrar por el contrato actual (por seguridad, aunque el backend debería hacerlo)
        const contractStates = data.data.filter(item => item.contract_id === contractId)
        
        if (contractStates.length > 0) {
          // 2. Ordenar por fecha de creación descendente (el más nuevo primero)
          // Asumimos que created_at viene en formato ISO o compatible
          contractStates.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          
          // 3. Devolver el último registro (el más reciente)
          return contractStates[0]
        }
      }
      return null
    } catch (error) {
      console.log("Error verificando estado inicial:", error)
      return null
    }
  }

  return (
    <View style={styles.container}>
      <Home style={{ position: "absolute", top: 0, left: 0 }} />
      <Animated.View
        {...panResponder.panHandlers} // 👈 Agregamos los detectores de gestos aquí
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
            {/* Fila 1: Perfil (Centro) */}
            <View style={styles.menuRow}>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Profile")}>
                <View style={styles.menuIconContainer}>
                  <IconComponent name="profile" style={styles.menuIcon} />
                </View>
                <Text style={styles.menuItemText}>Mi perfil</Text>
              </TouchableOpacity>
            </View>

            {/* Fila 2: Acciones (Separadas para la parte ancha) */}
            <View style={[styles.menuRow, { gap: responsiveWidth(25) }]}>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleAction("IncidenciasList", currentRental)}>
                <View style={styles.menuIconContainer}>
                  <IconComponent name="calendar" width={39} height={39} />
                </View>
                <Text style={styles.menuItemText}>Incidencias</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => handleAction("Peritajes", currentRental)}>
                <View style={styles.menuIconContainer}>
                  <IconComponent name="inspection" width={38} height={38} style={styles.menuIcon} />
                </View>
                <Text style={styles.menuItemText}>Peritaje</Text>
              </TouchableOpacity>
            </View>

            {/* Fila 3: Estados (Más juntas para cerrar la curva) */}
            <View style={[styles.menuRow, { gap: responsiveWidth(8) }]}>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleAction("InitialState", currentRental)}>
                <View style={styles.menuIconContainer}>
                  <IconComponent name="home" width={38} height={38} style={styles.menuIcon} />
                </View>
                <Text style={styles.menuItemText}>Estado{"\n"}inicial</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, !finalStatus.enabled && { opacity: 0.5 }]}
                onPress={() => {
                  if (finalStatus.enabled) {
                    handleAction("FinalState", currentRental)
                  } else {
                    showAlert("Aún no disponible", `El estado final se habilita 5 días antes de finalizar el contrato.\n\nFaltan ${finalStatus.days} días.`)
                  }
                }}
              >
                <View style={[styles.menuIconContainer, !finalStatus.enabled && { backgroundColor: '#E5E7EB' }]}>
                  <IconComponent name="form-icon" width={38} height={38} style={[styles.menuIcon, !finalStatus.enabled && { color: '#9CA3AF' }]} />
                </View>
                <Text style={styles.menuItemText}>Estado{"\n"}final</Text>
              </TouchableOpacity>
            </View>

            {/* Fila 4: Salir (Centro, arriba de la flecha) */}
            <View style={styles.menuRow}>
              <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
                <View style={styles.menuIconContainer}>
                  <IconComponent name="logout" style={styles.menuIcon} />
                </View>
                <Text style={styles.menuItemText}>Salir</Text>
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
            {/* CAMBIO: Usar Animated.View en lugar de Animated.Text para rotar SVGs correctamente */}
            <Animated.View style={[styles.arrowIcon, { transform: [{ rotate: arrowRotate }] }]}>
              <IconComponent name="arrow-down" />
            </Animated.View>
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
                      progressViewOffset={responsiveHeight(10)}

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
                // Forzar re-render al cambiar selección
                extraData={{ activeIndex, selectedRentalId: selectedRental?.id || selectedRental?.contract_id }}
                // Configuración de Snapping (Carousel)
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                snapToAlignment="start"
                contentContainerStyle={{
                  gap: SPACING,
                  paddingBottom: responsiveHeight(1),
                }}
                // Track ítem visible para sincronizar selección
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
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
                  const ubicacion = [p.address].filter(Boolean).join(", ")
                  
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

                      {/* Nuevo botón para ver detalle */}
                      <TouchableOpacity 
                        style={[
                          styles.viewDetailButton,
                          isSelected && styles.viewDetailButtonSelected
                        ]}
                        onPress={() => navigation.navigate('PropertyDetail', { rentalData: item })}
                      >
                        <Text style={[
                          styles.viewDetailText,
                          isSelected && styles.viewDetailTextSelected
                        ]}>Ver detalle</Text>
                        <IconComponent name="arrow-right" style={[
                          styles.viewDetailIcon,
                          isSelected && styles.viewDetailTextSelected
                        ]} />
                      </TouchableOpacity>

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
              <Text style={styles.welcomeBadgeText}>
                {nextPeritaje ? "Próximo Peritaje" : "Nuevo"}
              </Text>
            </View>
            <Text style={styles.welcomeTitle}>
              {nextPeritaje ? "Agendado en tu calendario" : "Todo en un solo lugar"}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {nextPeritaje 
                ? `Tu próximo peritaje es el ${new Date(nextPeritaje.date || nextPeritaje.created_at).toLocaleDateString("es-AR")}`
                : "Reportá incidencias, gestioná estados y mirá tus alquileres activos."
              }
            </Text>
          </View>

          {/* Options Grid */}
          <View style={styles.optionsGrid}>
            <TouchableOpacity style={styles.optionCard} onPress={() => handleAction("IncidenciasList", currentRental)}>
              <View style={{ ...styles.iconContainer, backgroundColor: "#FFE3E3" }}>
                <IconComponent name="calendar" width={33} height={33} />
              </View>
              <Text style={styles.optionTitle}>Incidencias</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => handleAction("InitialState", currentRental)}>
              <View style={{ ...styles.iconContainer, backgroundColor: "#E6E8FF" }}>
                <IconComponent name="home" width={32} height={32} />
              </View>
              <Text style={styles.optionTitle}>Estado inicial</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => handleAction("Peritajes", currentRental)}>
              <View style={{ ...styles.iconContainer, backgroundColor: "#FFF2CC" }}>
                <IconComponent name="inspection" width={35} height={35} />
              </View>
              <Text style={styles.optionTitle}>Peritajes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, !finalStatus.enabled && { backgroundColor: "#F9FAFB", borderColor: "#F3F4F6" }]}
              onPress={() => {
                if (finalStatus.enabled) {
                  handleAction("FinalState", currentRental)
                } else {
                  showAlert("Aún no disponible", `El registro de estado final se habilitará 5 días antes de finalizar el contrato.\n\nFaltan ${finalStatus.days} días.`)
                }
              }}
            >
              <View style={{ ...styles.iconContainer, backgroundColor: finalStatus.enabled ? "#DCFCE7" : "#E5E7EB" }}>
                <IconComponent name="form-icon" width={32} height={32} style={!finalStatus.enabled ? { color: "#9CA3AF" } : {}} />
              </View>
              <Text style={[styles.optionTitle, !finalStatus.enabled && { color: "#9CA3AF" }]}>Estado Final</Text>
              <Text style={[styles.optionSubtitle, !finalStatus.enabled && { color: "#9CA3AF", fontSize: responsiveFontSize(1.4) }]}>
                {finalStatus.enabled ? "" : `En ${finalStatus.days} días`}
              </Text>
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
                <IconComponent name="rental-icon" style={{ color: '#6B7280', fontSize: 20 }} />
              </View>
              <View style={styles.secondaryButtonContent}>
                <Text style={styles.secondaryButtonTitle}>Historial de Alquileres</Text>
                <Text style={styles.secondaryButtonSubtitle}>Ver contratos finalizados</Text>
              </View>
              <IconComponent name="arrow-right" style={{ color: '#9CA3AF', fontSize: 16 }} />
            </TouchableOpacity>

       
          </View>

        </View>
      </ScrollView>

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
    height: responsiveHeight(65),
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
    top: responsiveHeight(8),
    left: 0,
    right: 0,
    bottom: responsiveHeight(12), // Espacio inferior para la flecha
    paddingHorizontal: responsiveWidth(4),
    zIndex: 5,
    justifyContent: "space-between", // Distribuye las filas verticalmente
    alignItems: "center",
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
  },
  menuItem: {
    alignItems: "center",
    width: responsiveWidth(28), // Aumentado para dar más margen al texto
  },
  menuIconContainer: {
    width: responsiveWidth(18), // Aumentado de 14 a 18
    height: responsiveWidth(18),
    borderRadius: responsiveWidth(9),
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8, // Sombra más pronunciada
  },
  menuIcon: {
    color: "#FF5A1F",
    fontSize: responsiveFontSize(3.8),
     // Icono más grande (antes 3)
  },
  menuItemText: {
    color: "#fff",
    fontSize: responsiveFontSize(1.7), // Texto ligeramente más grande
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "Poppins_600SemiBold",
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
    gap: responsiveWidth(1),
    marginBottom: responsiveHeight(4),
  },
  optionCard: {
    width: responsiveHeight(19.5),
    height: responsiveHeight(14.2),
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: responsiveWidth(4),
    alignItems: "center",
    marginBottom: responsiveHeight(1),
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
  // Estilos nuevos para el botón de detalle
  viewDetailButton: {
    marginTop: responsiveHeight(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewDetailButtonSelected: {
    backgroundColor: '#FF5A1F', // Naranja cuando está seleccionado
  },
  viewDetailText: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: 'Poppins_600SemiBold',
    color: '#4B5563',
    marginRight: 4,
  },
  viewDetailTextSelected: {
    color: '#fff', // Texto blanco cuando está seleccionado
  },
  viewDetailIcon: {
    fontSize: responsiveFontSize(1.4),
    color: '#4B5563',
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
    backgroundColor: '#b94dc720',
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
    backgroundColor: ORANGE,
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  fullScreenImageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: "100%",
    height: "80%",
  },
})
export default HomeScreen

import { useState, useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, ActivityIndicator, RefreshControl } from "react-native"
import IconComponent from "../../../RentMatch_mobile/assets/icons"
import { useAuth } from "../../contexts/AuthContext"
import { useRental } from "../../contexts/RentalContext"
import Home from "../../../RentMatch_mobile/assets/home"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins"
import { useNavigation } from "@react-navigation/native"
  
const HomeScreen= () => {
  const { user, signOut } = useAuth()
  const rentalContext = useRental()
  const navigation = useNavigation()

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
  const [activeTab, setActiveTab] = useState("active")
  const [refreshing, setRefreshing] = useState(false)

  const animatedHeight = useRef(new Animated.Value(responsiveHeight(7))).current
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
      console.log("Cargando alquileres para el usuario:", user.id)
      loadRentals()
    }
  }, [user?.id])

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
        toValue: newExpandedState ? responsiveHeight(60) : responsiveHeight(7),
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
  
  const rentalsToShow = activeTab === "active" ? activeRentals : rentalHistory

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

        {/* Top bar inside header */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate("Profile")}
            activeOpacity={0.8}
          >
            <Text style={styles.headerIconEmoji}>👤</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>RentMatch</Text>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => {}}>
            <IconComponent name="bell" />
          </TouchableOpacity>
        </View>

        {showArrow && (
          <Animated.View style={[styles.arrowButtonContainer]}>
            <TouchableOpacity style={styles.arrowButton} onPress={toggleExpand} activeOpacity={0.85}>
              <Animated.Text style={[styles.arrowIcon, { transform: [{ rotate: arrowRotate }] }]}>
                <IconComponent name="arrow-down" />
              </Animated.Text>
            </TouchableOpacity>
          </Animated.View>
        )}

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
              <TouchableOpacity style={{...styles.logoutButton, width: "50%"}} onPress={() => navigation.navigate("Incidencias")}>
                <View style={{ ...styles.iconContainer, backgroundColor: "#e91c1cff" }}>
                  <IconComponent name="calendar" />
                </View>
                <Text style={styles.logoutText}>Reportar Incidencias</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{...styles.logoutButton, width: "50%"}} onPress={() => navigation.navigate("FinalState")}>
                <View style={{ ...styles.iconContainer, backgroundColor: "#7781e0" }}>
                  <IconComponent name="home" />
                </View>
                <Text style={styles.logoutText}>Estado final</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
               <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate("Peritaje")}>
                <View style={{ ...styles.iconContainer, backgroundColor: "#f5c951" }}>
                  <IconComponent name="inspection" />
                </View>
                <Text style={styles.logoutText}>Solicitar peritaje</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate("InitialState")}>
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

          <View style={styles.optionsGrid}>
            <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("Incidencias")}>
              <View style={{ ...styles.iconContainer, backgroundColor: "#FFE3E3" }}>
                <IconComponent name="calendar" />
              </View>
              <Text style={styles.optionTitle}>Reportar</Text>
              <Text style={styles.optionSubtitle}>Incidencias</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("InitialState")}>
              <View style={{ ...styles.iconContainer, backgroundColor: "#E6E8FF" }}>
                <IconComponent name="home" />
              </View>
              <Text style={styles.optionTitle}>Registrar</Text>
              <Text style={styles.optionSubtitle}>Estado inicial</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("Peritaje")}>
              <View style={{ ...styles.iconContainer, backgroundColor: "#FFF2CC" }}>
                <IconComponent name="inspection" />
              </View>
              <Text style={styles.optionTitle}>Solicitar</Text>
              <Text style={styles.optionSubtitle}>Peritaje</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("FinalState")}>
              <View style={{ ...styles.iconContainer, backgroundColor: "#DCFCE7" }}>
                <IconComponent name="form-icon" />
              </View>
              <Text style={styles.optionTitle}>Registrar</Text>
              <Text style={styles.optionSubtitle}>Estado final</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rentalsSection}>
            <Text style={styles.sectionTitle}>Mis Alquileres</Text>

            <View style={styles.tabsContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                onPress={() => setActiveTab('active')}
              >
                <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                  Activos ({activeRentals.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                onPress={() => setActiveTab('history')}
              >
                <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                  Historial ({rentalHistory.length})
                </Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF5A1F" />
                <Text style={styles.loadingText}>Cargando alquileres...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <IconComponent name="alert-circle" style={styles.errorIcon} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => loadRentals?.()}
                >
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : rentalsToShow.length === 0 ? (
              <View style={styles.emptyContainer}>
                <IconComponent name="home" style={styles.emptyIcon} />
                <Text style={styles.emptyText}>
                  {activeTab === 'active'
                    ? 'No tienes alquileres activos'
                    : 'No hay historial de alquileres'}
                </Text>
              </View>
            ) : (
              rentalsToShow.map((rental) => {
                const p = getProp(rental)
                const title = `${capitalize(p.type)} · ${p.neighborhood}`
                const ubicacion = [p.address, p.neighborhood, p.city].filter(Boolean).join(", ")
                const status = rental?.status?.toLowerCase?.() || ""
                const statusStyle =
                  status === "active"
                    ? styles.statusActive
                    : status === "pending"
                    ? styles.statusPending
                    : status === "completed" || status === "finished"
                    ? styles.statusDone
                    : styles.statusDefault

                return (
                  <View key={rental.contract_id || rental.id} style={styles.rentalCard}>
                    <View style={styles.rentalHeaderRow}>
                      <Text style={styles.rentalTitle}>{title}</Text>
                      <View style={[styles.statusChip, statusStyle]}>
                        <Text style={styles.statusChipText}>{capitalize(rental.status)}</Text>
                      </View>
                    </View>
                    <Text style={styles.rentalLocation}>Ubicación: {ubicacion}</Text>
                    <Text style={styles.rentalDate}>Fecha Inicio: {formatDate(rental.start_date)}</Text>
                    {rental.end_date && (
                      <Text style={styles.rentalDate}>Fecha Fin: {formatDate(rental.end_date)}</Text>
                    )}
                    <Text style={styles.rentalPrice}>Presupuesto: {formatCurrency(p.price, p.currency)}</Text>
                    <Text style={styles.rentalDetails}>Ambientes: {p.rooms}</Text>
                    <Text style={styles.rentalDetails}>Baños: {p.bathrooms}</Text>
                    {p.furnished && <Text style={styles.rentalDetails}>✅ Amueblado</Text>}
                    {p.pets_allowed && <Text style={styles.rentalDetails}>🐕 Mascotas permitidas</Text>}
                    {p.amenities.length > 0 && (
                      <Text style={styles.rentalDetails}>Amenities: {p.amenities.join(", ")}</Text>
                    )}
                    {p.notes && <Text style={styles.rentalNotes}>Nota: {p.notes}</Text>}

                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity style={styles.outlineBtn} onPress={() => {}}>
                        <Text style={styles.outlineBtnText}>Ver detalles</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.notificationButton}>
                        <IconComponent name="bell" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              })
            )}
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
    bottom: responsiveHeight(1),
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  arrowButton: {
    width: responsiveWidth(16),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(4px)",
  },
  arrowIcon: {
    fontSize: responsiveFontSize(5),
    color: "#fefefeff",
    fontWeight: "bold",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
    paddingHorizontal: responsiveWidth(6),
  },
  header: {
    marginBottom: responsiveHeight(3),
  },
  greeting: {
    fontSize: responsiveFontSize(2.8),
    fontFamily: "Poppins_600SemiBold",
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
  rentalsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(2.6),
    fontWeight: "600",
    color: "#333",
    marginBottom: responsiveHeight(2),
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F4FF",
    borderRadius: 8,
    padding: 4,
    marginBottom: responsiveHeight(2),
  },
  tab: {
    flex: 1,
    paddingVertical: responsiveHeight(1),
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#B4BEE2",
  },
  tabText: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: "Poppins_600SemiBold",
  },
  activeTabText: {
    color: "#333",
    fontFamily: "Poppins_600SemiBold",
  },
  rentalCard: {
    marginBottom: responsiveHeight(2),
    backgroundColor: "#F1F4FF",
    borderRadius: 12,
    padding: responsiveWidth(4),
    paddingBottom: responsiveHeight(6),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  rentalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: responsiveHeight(0.5),
  },
  statusChip: {
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: 20,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: "700",
  },
  statusActive: {
    backgroundColor: "#E6F9EF",
    borderColor: "#A7F3D0",
  },
  statusPending: {
    backgroundColor: "#FEF9C3",
    borderColor: "#FDE68A",
  },
  statusDone: {
    backgroundColor: "#E5E7EB",
    borderColor: "#D1D5DB",
  },
  statusDefault: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  rentalTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "600",
    color: "#333",
    marginBottom: responsiveHeight(0.5),
    fontFamily: "Poppins_600SemiBold",
  },
  rentalLocation: {
    fontSize: responsiveFontSize(1.6),
    color: "#666",
    marginBottom: responsiveHeight(0.5),
    fontFamily: "Poppins_400Regular",
  },
  rentalDate: {
    fontSize: responsiveFontSize(1.6),
    color: "#666",
    marginBottom: responsiveHeight(0.5),
    fontFamily: "Poppins_400Regular",
  },
  rentalPrice: {
    fontSize: responsiveFontSize(1.8),
    color: "#FF5A1F",
    fontWeight: "600",
    marginBottom: responsiveHeight(0.5),
    fontFamily: "Poppins_600SemiBold",
  },
  rentalDetails: {
    fontSize: responsiveFontSize(1.6),
    color: "#666",
    marginBottom: responsiveHeight(0.3),
    fontFamily: "Poppins_400Regular",
  },
  rentalNotes: {
    fontSize: responsiveFontSize(1.5),
    color: "#999",
    fontStyle: "italic",
    marginTop: responsiveHeight(0.5),
    fontFamily: "Poppins_400Regular",
  },
  cardActionsRow: {
    position: "absolute",
    bottom: responsiveHeight(1.5),
    left: responsiveWidth(4),
    right: responsiveWidth(4),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  outlineBtn: {
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(4),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },
  outlineBtnText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: responsiveFontSize(1.6),
  },
  actionButtons: {
    position: "absolute",
    bottom: responsiveHeight(2),
    right: responsiveWidth(4),
    flexDirection: "row",
  },
  notificationButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    backgroundColor: "#FF5A1F",
    borderRadius: responsiveWidth(5),
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveWidth(2),
  },
  logoutButton: {
    backgroundColor: "#FF5A1F",
    fontFamily: "Poppins_600SemiBold",
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: responsiveFontSize(2),
    fontWeight: "600",
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
})
export default HomeScreen
"use client"
import { useState, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from "react-native"
import IconComponent from "../../../RentMatch_mobile/assets/icons" // Asegúrate de que esta ruta sea correcta
import { useAuth } from "../../contexts/AuthContext" // Asegúrate de que esta ruta sea correcta
import Home from "../../../RentMatch_mobile/assets/home"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins"

export default function HomeScreen() {
  const { user, signOut } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showArrow, setShowArrow] = useState(true) // ✅ Cambiar de false a true
  // 1. CAMBIO: El valor inicial ahora es más chico
  const animatedHeight = useRef(new Animated.Value(responsiveHeight(5))).current
  const arrowRotation = useRef(new Animated.Value(0)).current
  const scrollY = useRef(0)

  const handleSignOut = async () => {
    await signOut()
  }

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  })

  if (!fontsLoaded) {
    return null
  }

  const firstName = user?.full_name.split(" ")[0]

  // ✅ 2. Simplificar el handleScroll completamente
  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y
    scrollY.current = currentScrollY
    // ✅ Ya no necesitamos animaciones aquí - la flecha siempre está visible
  }

  const toggleExpand = () => {
    const newExpandedState = !isExpanded
    setIsExpanded(newExpandedState)

    Animated.parallel([
      Animated.spring(animatedHeight, {
        // 2. CAMBIO: El valor contraído ahora es 10
        toValue: newExpandedState ? responsiveHeight(60) : responsiveHeight(5),
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

  return (
    <View style={styles.container}>
      <Home style={{ position: "absolute", top: 0, left: 0, }} />
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

        {showArrow && (
          <Animated.View style={[styles.arrowButtonContainer]}>
            <TouchableOpacity style={styles.arrowButton} onPress={toggleExpand} activeOpacity={0.7}>
              <Animated.Text style={[styles.arrowIcon, { transform: [{ rotate: arrowRotate }] }]}>

                <IconComponent name="arrow-down" />
              </Animated.Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {isExpanded && (
          <View style={styles.menuContent}>
            <View style={styles.row}>
              <TouchableOpacity style={{...styles.logoutButton, width: "33%"}} onPress={handleSignOut}>
                <View style={{ ...styles.iconContainer, backgroundColor: "#DCFCE7" }}>
                  <IconComponent name="form-icon" />
                </View>
                <Text style={styles.logoutText}>Alquileres</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{...styles.logoutButton, width: "33%"}} onPress={handleSignOut}>
                <View style={{ ...styles.iconContainer, backgroundColor: "#DCFCE7" }}>
                  <IconComponent name="form-icon" />
                </View>
                <Text style={styles.logoutText}>Mis Datos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{...styles.logoutButton, width: "33%"}} onPress={handleSignOut}>
                <View style={{ ...styles.iconContainer, backgroundColor: "#DCFCE7" }}>
                  <IconComponent name="form-icon" />
                </View>
                <Text style={styles.logoutText}>Mis Datos</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={{...styles.logoutButton, width: "50%"}} onPress={handleSignOut}>
                <View style={{ ...styles.iconContainer, backgroundColor: "#DCFCE7" }}>
                  <IconComponent name="form-icon" />
                </View>
                <Text style={styles.logoutText}>Reportar Incidencias</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{...styles.logoutButton, width: "50%"}} onPress={handleSignOut}>
                <View style={{ ...styles.iconContainer, backgroundColor: "#DCFCE7" }}>
                  <IconComponent name="form-icon" />
                </View>
                <Text style={styles.logoutText}>Estado final</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                <View style={{ ...styles.iconContainer, backgroundColor: "#DCFCE7" }}>
                  <IconComponent name="form-icon" />
                </View>
                <Text style={styles.logoutText}>Solicitar peritaje</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                <View style={{ ...styles.iconContainer, backgroundColor: "#DCFCE7" }}>
                  <IconComponent name="form-icon" />
                </View>
                <Text style={styles.logoutText}>Estado inicial</Text>
              </TouchableOpacity>
              
            </View>
             <View style={styles.row}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                <View style={{ ...styles.iconContainer, backgroundColor: "#DCFCE7" }}>
                  <IconComponent name="form-icon" />
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
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Hola, {firstName || "Usuario"}</Text>
            <Text style={styles.question}>¿Qué deseas hacer hoy?</Text>
          </View>

          {/* ... El resto de tu contenido no cambia ... */}
          <View style={styles.optionsGrid}>
            <TouchableOpacity style={styles.optionCard}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>⚠️</Text>
              </View>
              <Text style={styles.optionTitle}>Reportar</Text>
              <Text style={styles.optionSubtitle}>Incidencias</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>📋</Text>
              </View>
              <Text style={styles.optionTitle}>Registrar</Text>
              <Text style={styles.optionSubtitle}>Estado inicial</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>📄</Text>
              </View>
              <Text style={styles.optionTitle}>Solicitar</Text>
              <Text style={styles.optionSubtitle}>peritaje</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard}>
              <View style={{ ...styles.iconContainer, backgroundColor: "#DCFCE7" }}>
                <IconComponent name="form-icon" />
              </View>
              <Text style={styles.optionTitle}>Registrar</Text>
              <Text style={styles.optionSubtitle}>estado final</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rentalsSection}>
            <Text style={styles.sectionTitle}>Mis Alquileres</Text>

            <View style={styles.tabsContainer}>
              <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                <Text style={[styles.tabText, styles.activeTabText]}>Activos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                <Text style={styles.tabText}>Historial</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rentalCard}>
              <Text style={styles.rentalTitle}>Apartamento en Belgrano</Text>
              <Text style={styles.rentalDate}>Publicado hace 3 días</Text>
              <Text style={styles.rentalPrice}>Presupuesto: $350.000/mes</Text>
              <Text style={styles.rentalLocation}>Ubicación: Belgrano</Text>
              <Text style={styles.rentalDetails}>Ambientes: 2</Text>
              <Text style={styles.rentalContacts}>Contactos: 5 propietarios</Text>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.notificationButton}>
                  <Text style={styles.actionIcon}>🔔</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chatButton}>
                  <Text style={styles.actionIcon}>💬</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  arrowButtonContainer: {
    position: "absolute",
    bottom: responsiveHeight(1), // Pequeño ajuste para que se vea mejor
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  arrowButton: {
    width: responsiveWidth(15),
    height: responsiveWidth(6),
    borderRadius: responsiveWidth(6),
    justifyContent: "center",
    alignItems: "center",

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
    top: responsiveHeight(8), // Ajustado para que el contenido aparezca un poco más arriba
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
  firstRow: {
    width: "33%",
  },
  secondRow: {
    width: "50%",
  },
  thirdRow: {
    width: "50%",
  },

  menuPlaceholder: {
    fontSize: responsiveFontSize(2),
    color: "#fff",
    textAlign: "center",
    fontFamily: "Poppins_600SemiBold",
  },
  scrollContent: {
    flexGrow: 1,
    // 3. CAMBIO: El padding ahora coincide con la nueva altura
    paddingTop: responsiveHeight(10),
  },
  content: {
    flex: 1,
    paddingHorizontal: responsiveWidth(6),
  },
  header: {
    marginBottom: responsiveHeight(3),
  },
  // ... El resto de tus estilos no cambian
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
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: responsiveHeight(4),
  },
  optionCard: {
    width: "48%",
    backgroundColor: "#B4BEE2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: responsiveWidth(4),
    alignItems: "center",
    marginBottom: responsiveHeight(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: responsiveWidth(6),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
  },
  iconText: {
    fontSize: responsiveFontSize(3),
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
    backgroundColor: "#F8F9FF",
    borderRadius: 12,
    padding: responsiveWidth(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  rentalTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "600",
    color: "#333",
    marginBottom: responsiveHeight(0.5),
  },
  rentalDate: {
    fontSize: responsiveFontSize(1.6),
    color: "#666",
    marginBottom: responsiveHeight(1),
  },
  rentalPrice: {
    fontSize: responsiveFontSize(1.8),
    color: "#333",
    fontWeight: "500",
    marginBottom: responsiveHeight(0.3),
  },
  rentalLocation: {
    fontSize: responsiveFontSize(1.8),
    color: "#333",
    marginBottom: responsiveHeight(0.3),
  },
  rentalDetails: {
    fontSize: responsiveFontSize(1.8),
    color: "#333",
    marginBottom: responsiveHeight(0.3),
  },
  rentalContacts: {
    fontSize: responsiveFontSize(1.8),
    color: "#333",
    marginBottom: responsiveHeight(1),
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
  chatButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    backgroundColor: "#B4BEE2",
    borderRadius: responsiveWidth(5),
    justifyContent: "center",
    alignItems: "center",
  },
  actionIcon: {
    fontSize: responsiveFontSize(2.5),
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
})
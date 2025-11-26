import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"

const ORANGE = "#FF5A1F"

const PeritajesScreen = ({ navigation }) => {
  const [peritajes, setPeritajes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPeritajes()
  }, [])

  const fetchPeritajes = async () => {
    try {
      // TODO: Llamar a tu API
      // const response = await api.get('/peritajes')
      // setPeritajes(response.data)
      
      // Mock data temporal
      setTimeout(() => {
        setPeritajes([
          {
            id: "PER-001",
            property: "Departamento en Belgrano",
            address: "Av. Cabildo 2450",
            date: "2024-11-20",
            status: "completed", // completed | pending | scheduled
            type: "Ingreso",
            inspector: "Juan Pérez",
            issues: 2,
          },
          {
            id: "PER-002",
            property: "Casa en Palermo",
            address: "Costa Rica 4500",
            date: "2024-11-15",
            status: "completed",
            type: "Egreso",
            inspector: "María González",
            issues: 0,
          },
          {
            id: "PER-003",
            property: "Departamento en Belgrano",
            address: "Av. Cabildo 2450",
            date: "2024-11-25",
            status: "scheduled",
            type: "Periódico",
            inspector: "Carlos Ruiz",
            issues: null,
          },
        ])
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error("Error fetching peritajes:", error)
      setLoading(false)
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return { bg: "#E6F9EF", text: "#10B981", label: "Completado" }
      case "scheduled":
        return { bg: "#FEF9C3", text: "#F59E0B", label: "Programado" }
      case "pending":
        return { bg: "#FEE2E2", text: "#EF4444", label: "Pendiente" }
      default:
        return { bg: "#F3F4F6", text: "#6B7280", label: "Desconocido" }
    }
  }

  const handleNewPeritaje = () => {
    // Navegar a formulario de nuevo peritaje
    navigation.navigate("NuevoPeritaje")
  }

  const handlePeritajePress = (peritaje) => {
    // Navegar a detalle del peritaje
    navigation.navigate("DetallePeritaje", { peritajeId: peritaje.id })
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={ORANGE} />
        <Text style={styles.loadingText}>Cargando peritajes...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Peritajes</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{peritajes.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {peritajes.filter(p => p.status === "completed").length}
          </Text>
          <Text style={styles.statLabel}>Completados</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {peritajes.filter(p => p.status === "scheduled").length}
          </Text>
          <Text style={styles.statLabel}>Programados</Text>
        </View>
      </View>

      {/* Lista de Peritajes */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Historial de Peritajes</Text>

        {peritajes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
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
              >
                {/* Header Card */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.peritajeId}>{peritaje.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                      <Text style={[styles.statusText, { color: statusInfo.text }]}>
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{peritaje.type}</Text>
                  </View>
                </View>

                {/* Property Info */}
                <Text style={styles.propertyName}>{peritaje.property}</Text>
                <Text style={styles.propertyAddress}>📍 {peritaje.address}</Text>

                {/* Details */}
                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fecha:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(peritaje.date).toLocaleDateString("es-AR")}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Perito:</Text>
                    <Text style={styles.detailValue}>{peritaje.inspector}</Text>
                  </View>
                  {peritaje.issues !== null && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Observaciones:</Text>
                      <Text
                        style={[
                          styles.detailValue,
                          peritaje.issues > 0 ? styles.issuesWarning : styles.issuesOk,
                        ]}
                      >
                        {peritaje.issues === 0 ? "Sin observaciones" : `${peritaje.issues} detectadas`}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Arrow */}
                <View style={styles.cardArrow}>
                  <Text style={styles.arrowIcon}>→</Text>
                </View>
              </TouchableOpacity>
            )
          })
        )}
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
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: responsiveHeight(2),
    fontSize: responsiveFontSize(1.8),
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: responsiveWidth(6),
    paddingTop: responsiveHeight(6),
    paddingBottom: responsiveHeight(2),
  },
  backBtn: {
    padding: responsiveWidth(2),
  },
  backIcon: {
    fontSize: responsiveFontSize(3),
    color: "#1a1a1a",
  },
  headerTitle: {
    fontSize: responsiveFontSize(2.4),
    fontWeight: "700",
    color: "#1a1a1a",
  },
  placeholder: {
    width: responsiveWidth(10),
  },
  statsRow: {
    flexDirection: "row",
    gap: responsiveWidth(3),
    paddingHorizontal: responsiveWidth(6),
    marginBottom: responsiveHeight(3),
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F1F4FF",
    borderRadius: 12,
    padding: responsiveWidth(4),
    alignItems: "center",
  },
  statNumber: {
    fontSize: responsiveFontSize(2.8),
    fontWeight: "700",
    color: ORANGE,
    marginBottom: responsiveHeight(0.5),
  },
  statLabel: {
    fontSize: responsiveFontSize(1.5),
    color: "#666",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: responsiveWidth(6),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(1.9),
    fontWeight: "700",
    color: "#1a1a1a",
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
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: responsiveHeight(1),
  },
  emptyText: {
    fontSize: responsiveFontSize(1.6),
    color: "#666",
    textAlign: "center",
    lineHeight: responsiveHeight(2.5),
  },
  peritajeCard: {
    backgroundColor: "#F1F4FF",
    borderRadius: 12,
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    position: "relative",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveHeight(1.5),
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveWidth(2),
  },
  peritajeId: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: "700",
    color: "#1a1a1a",
  },
  statusBadge: {
    paddingHorizontal: responsiveWidth(2.5),
    paddingVertical: responsiveHeight(0.4),
    borderRadius: 12,
  },
  statusText: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: "600",
  },
  typeBadge: {
    backgroundColor: ORANGE,
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: 8,
  },
  typeText: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: "600",
    color: "#fff",
  },
  propertyName: {
    fontSize: responsiveFontSize(1.9),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: responsiveHeight(0.5),
  },
  propertyAddress: {
    fontSize: responsiveFontSize(1.5),
    color: "#666",
    marginBottom: responsiveHeight(1.5),
  },
  cardDetails: {
    gap: responsiveHeight(0.8),
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: responsiveFontSize(1.5),
    color: "#666",
  },
  detailValue: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: "600",
    color: "#1a1a1a",
  },
  issuesWarning: {
    color: "#EF4444",
  },
  issuesOk: {
    color: "#10B981",
  },
  cardArrow: {
    position: "absolute",
    right: responsiveWidth(4),
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  arrowIcon: {
    fontSize: responsiveFontSize(2.4),
    color: ORANGE,
  },
  fab: {
    position: "absolute",
    bottom: responsiveHeight(3),
    right: responsiveWidth(6),
    left: responsiveWidth(6),
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: responsiveHeight(2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveWidth(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: responsiveFontSize(3),
    color: "#fff",
    fontWeight: "700",
  },
  fabText: {
    fontSize: responsiveFontSize(1.9),
    fontWeight: "700",
    color: "#fff",
  },
})

export default PeritajesScreen
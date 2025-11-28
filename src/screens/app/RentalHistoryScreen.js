import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions"
import IconComponent from "../../../RentMatch_mobile/assets/icons"

const RentalHistoryScreen = () => {
  const navigation = useNavigation()

  // DATOS DE PRUEBA (MOCK)
  const history = [
    {
      id: "1",
      property_type: "Departamento",
      address: "Av. Libertador 2400, 4B",
      neighborhood: "Palermo",
      city: "CABA",
      start_date: "2022-03-01",
      end_date: "2024-02-28",
      rent_amount: 450000,
      currency: "ARS",
      status: "Finalizado"
    },
    {
      id: "2",
      property_type: "Casa",
      address: "Calle Falsa 123",
      neighborhood: "Belgrano",
      city: "CABA",
      start_date: "2020-01-15",
      end_date: "2022-01-15",
      rent_amount: 850,
      currency: "USD",
      status: "Finalizado"
    }
  ] 

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (value, currency) => {
    return new Intl.NumberFormat("es-AR", { 
      style: "currency", 
      currency, 
      maximumFractionDigits: 0 
    }).format(value)
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.typeContainer}>
          <IconComponent name="home" style={styles.cardIcon} />
          <Text style={styles.cardType}>{item.property_type}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.cardAddress}>{item.address}</Text>
      <Text style={styles.cardLocation}>{item.neighborhood}, {item.city}</Text>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.label}>Período</Text>
          <Text style={styles.value}>{formatDate(item.start_date)} - {formatDate(item.end_date)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.label}>Alquiler final</Text>
          <Text style={styles.price}>{formatCurrency(item.rent_amount, item.currency)}</Text>
        </View>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <IconComponent name="back-arrow" style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Alquileres</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {history.length > 0 ? (
          <FlatList 
            data={history}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <IconComponent name="home" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>No tienes contratos finalizados</Text>
            <Text style={styles.emptySubText}>Aquí aparecerán tus alquileres anteriores</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(2),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginTop: responsiveHeight(4), // Ajuste para StatusBar
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  backIcon: {
    fontSize: 20,
    color: "#1F2937",
  },
  headerTitle: {
    fontSize: responsiveFontSize(2),
    fontWeight: "600",
    color: "#1F2937",
    fontFamily: "Poppins_600SemiBold",
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: responsiveWidth(5),
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardIcon: {
    fontSize: 16,
    color: "#6B7280",
  },
  cardType: {
    fontSize: responsiveFontSize(1.6),
    color: "#6B7280",
    fontFamily: "Poppins_600SemiBold",
  },
  statusBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: responsiveFontSize(1.4),
    color: "#4B5563",
    fontFamily: "Poppins_600SemiBold",
  },
  cardAddress: {
    fontSize: responsiveFontSize(2),
    color: "#1F2937",
    fontFamily: "Poppins_700Bold",
    marginBottom: 2,
  },
  cardLocation: {
    fontSize: responsiveFontSize(1.6),
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: responsiveFontSize(1.4),
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
    marginBottom: 2,
  },
  value: {
    fontSize: responsiveFontSize(1.6),
    color: "#374151",
    fontFamily: "Poppins_600SemiBold",
  },
  price: {
    fontSize: responsiveFontSize(1.8),
    color: "#FF5A1F",
    fontFamily: "Poppins_700Bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(10),
  },
  emptyIcon: {
    fontSize: responsiveFontSize(6),
    color: "#E5E7EB",
    marginBottom: responsiveHeight(2),
  },
  emptyText: {
    fontSize: responsiveFontSize(2),
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    fontFamily: "Poppins_600SemiBold",
  },
  emptySubText: {
    fontSize: responsiveFontSize(1.6),
    color: "#9CA3AF",
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
  }
})

export default RentalHistoryScreen

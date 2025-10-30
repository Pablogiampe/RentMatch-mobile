import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeScreen from "../screens/app/HomeScreen"
import { RentalProvider } from "../contexts/RentalContext"
import IncidenciasScreen from "../screens/app/IncidenciasScreen"
const Stack = createNativeStackNavigator()
export default function AppStack() {
  return (
    <RentalProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Incidencias" component={IncidenciasScreen} />
      </Stack.Navigator>
    </RentalProvider>
  )
}
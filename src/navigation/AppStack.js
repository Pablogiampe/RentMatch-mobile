import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeScreen from "../screens/app/HomeScreen"
import { RentalProvider } from "../contexts/RentalContext"
import PeritajeScreen from "../screens/app/PeritajeScreen"
import FinalStateScreen from "../screens/app/FinalStateScreen"
import InitialStateScreen from "../screens/app/InitialStateScreen"
import IncidenciasScreen from "../screens/app/IncidenciasScreen" 
import ProfileScreen from "../screens/app/ProfileScreen"
const Stack = createNativeStackNavigator()
export default function AppStack() {
  return (
    <RentalProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Peritaje" component={PeritajeScreen} />
        <Stack.Screen name="FinalState" component={FinalStateScreen}  />
        <Stack.Screen name="InitialState" component={InitialStateScreen}  />
        <Stack.Screen name="Incidencias" component={IncidenciasScreen}  />
        <Stack.Screen name="Profile" component={ProfileScreen}  />

      </Stack.Navigator>
    </RentalProvider>
  )
}
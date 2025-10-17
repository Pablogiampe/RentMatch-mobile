import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeScreen from "../screens/app/HomeScreen"
import { RentalProvider } from "../contexts/RentalContext"

const Stack = createNativeStackNavigator()
export default function AppStack() {
  return (
    <RentalProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </RentalProvider>
  )
}
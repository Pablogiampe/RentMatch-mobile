import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeScreen from "../screens/app/HomeScreen"

const Stack = createNativeStackNavigator()

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Inicio" }} />
    </Stack.Navigator>
  )
}

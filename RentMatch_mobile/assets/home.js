import { View, Dimensions } from "react-native"
import Svg, { Rect, Circle, Ellipse } from "react-native-svg"

const { width, height } = Dimensions.get("window")

const Home = () => {
  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg width="100%" height="100%" viewBox="0 0 428 926" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* Fondo blanco */}
        <Rect width="428" height="926" fill="white" />

        {/* Círculo grande azul claro superior - extendido */}
        <Circle cx="214" cy="-100" r="350" fill="#F8F9FF" />

        {/* Elipse naranja superior - extendida */}
        <Ellipse cx="214" cy="-100" rx="280" ry="200" fill="#FF5A1F" />

        {/* Círculo con stroke superior derecha */}
       

        {/* Rectángulo rotado con stroke */}
        <Rect
          x="50"
          y="300"
          width="120"
          height="120"
          rx="8"
          transform="rotate(-15 110 360)"
          stroke="#F1F4FF"
          strokeWidth="2"
          fill="none"
        />

        {/* Rectángulo simple con stroke */}
        <Rect x="30" y="500" width="100" height="100" rx="8" stroke="#F1F4FF" strokeWidth="2" fill="none" />
      </Svg>
    </View>
  )
}

export default Home

import { View, Dimensions } from "react-native"
import Svg, { Rect, Circle, Ellipse, Defs, LinearGradient, Stop } from "react-native-svg"

const { width, height } = Dimensions.get("window")

const Home = ({ style }) => {
  return (
    <View pointerEvents="none" style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 428 926" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* Gradientes y defs */}
        <Defs>
          <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F8F9FF" stopOpacity="1" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFB089" />
            <Stop offset="1" stopColor="#FF5A1F" />
          </LinearGradient>
        </Defs>

        {/* Fondo principal con degradado suave */}
        <Rect width="428" height="926" fill="url(#bgGrad)" />

        {/* Círculo grande azul claro superior */}
        <Circle cx="214" cy="-100" r="350" fill="#F1F4FF" />

        {/* Acento naranja superior derecho (muy sutil) */}
        <Ellipse cx="430" cy="-20" rx="180" ry="140" fill="url(#accentGrad)" opacity="0.08" />

        {/* Círculo con stroke superior derecha */}
        <Circle cx="410" cy="80" r="56" stroke="#FF5A1F" strokeOpacity="0.18" strokeWidth="2" fill="none" />

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

        {/* Suave apoyo inferior izquierdo */}
        <Ellipse cx="-60" cy="820" rx="220" ry="160" fill="#F1F4FF" opacity="0.7" />

        {/* Aro sutil inferior derecho */}
        <Circle cx="390" cy="860" r="70" stroke="#FF5A1F" strokeOpacity="0.12" strokeWidth="2" fill="none" />
      </Svg>
    </View>
  )
}

export default Home

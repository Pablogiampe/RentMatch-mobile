import { Dimensions } from "react-native"
import Svg, { G, Rect, Circle, Path, Ellipse, Defs, ClipPath } from "react-native-svg"

const Recuperacion = ({ style }) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 428 926"
      preserveAspectRatio="xMidYMid slice" // Agregado para que llene toda la pantalla
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
        style,
      ]}
    >
      <Defs>
        <ClipPath id="clip0_49_351">
          <Rect width="428" height="926" fill="white" />
        </ClipPath>
      </Defs>

      <G clipPath="url(#clip0_49_351)">
        {/* Fondo blanco extendido */}
        <Rect width="600" height="1200" x="-100" y="-100" fill="white" />

        {/* Forma azul claro superior - EXTENDIDA */}
        <Path
          d="M800 -150.5C800 100 600 300 400 300C200 300 -400 100 -400 -150.5C-400 -400 -200 -600 400 -600C600 -600 800 -400 800 -150.5Z"
          fill="#F8F9FF"
        />

        {/* Rectángulo rotado decorativo */}
        <Path
          d="M241.457 70.2224L139.403 425.869L-216.245 323.815L-114.19 -31.8323L241.457 70.2224Z"
          stroke="#F1F4FF"
          strokeWidth="2"
          fill="none"
        />

        {/* Rectángulo simple decorativo */}
        <Rect x="-281" y="641" width="370" height="370" stroke="#F1F4FF" strokeWidth="2" fill="none" />

        {/* Círculo decorativo */}
        <Circle cx="271" cy="77" r="246.5" stroke="#F8F9FF" strokeWidth="3" fill="none" />

        {/* Elipse naranja inferior - EXTENDIDA */}
        <Ellipse cx="212.5" cy="1150" rx="450" ry="350" fill="#FF5A1F" />
      </G>
    </Svg>
  )
}

export default Recuperacion

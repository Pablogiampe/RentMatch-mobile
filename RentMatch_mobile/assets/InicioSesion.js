import { Dimensions } from "react-native"
import Svg, { G, Rect, Circle, Ellipse, Defs, ClipPath } from "react-native-svg"

const InicioSesion = ({ width, height, style }) => {
  // Si no se pasan dimensiones, usar las de la pantalla
  const screenDimensions = Dimensions.get("window")
  const svgWidth = width || screenDimensions.width
  const svgHeight = height || screenDimensions.height

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 428 926"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      style={[{ position: "absolute" }, style]}
    >
      <Defs>
        <ClipPath id="clip0_49_327">
          <Rect width="428" height="926" fill="white" />
        </ClipPath>
      </Defs>

      <G clipPath="url(#clip0_49_327)">
        <Rect width="428" height="926" fill="white" />

        <Rect
          x="-194.462"
          y="576.051"
          width="500"
          height="500"
          transform="rotate(27.0888 -194.462 576.051)"
          stroke="#F1F4FF"
          strokeWidth="2"
          fill="none"
        />

        <Circle cx="271" cy="77" r="350" stroke="#F8F9FF" strokeWidth="3" fill="none" />

        <Ellipse cx="414" cy="-150" rx="450" ry="400" fill="#FF5A1F" />

        <Ellipse cx="206.5" cy="1150" rx="450" ry="350" fill="#FF5A1F" />
      </G>
    </Svg>
  )
}

export default InicioSesion

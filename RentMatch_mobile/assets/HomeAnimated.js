import React from "react";
import { Dimensions } from "react-native";
import Svg, { 
  G, 
  Rect, 
  Circle, 
  Path, 
  Ellipse, 
  Defs, 
  ClipPath 
} from "react-native-svg";

const HomeAnimated = ({ style, orangeHeight = 400 }) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  return (
    <Svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 428 926" 
      preserveAspectRatio="xMidYMid slice"
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
        style
      ]}
    >
      <Defs>
        <ClipPath id="clip0_49_327">
          <Rect width="1000" height="2000" x="-200" y="-200" fill="white"/>
        </ClipPath>
      </Defs>
      
      <G clipPath="url(#clip0_49_327)">
        {/* Fondo blanco extendido */}
        <Rect width="1000" height="2000" x="-200" y="-200" fill="white"/>
        
        {/* Rectángulo naranja ANIMADO - crece desde arriba */}
        <Rect 
          x="-500" 
          y="-200" 
          width="1500" 
          height={orangeHeight} // ← Esta altura cambia con la animación
          fill="#FF5A1F"
        />
        
        {/* Rectángulo naranja para cubrir parte inferior */}
        <Rect 
          x="-500" 
          y="700" 
          width="1500" 
          height="1300" 
          fill="#FF5A1F"
        />
        
        {/* Forma naranja superior - EXTENDIDA */}
        <Path 
          d="M1000 -300C1000 50 600 250 400 250C200 250 -500 50 -500 -300C-500 -600 200 -800 400 -800C600 -800 1000 -600 1000 -300Z" 
          fill="#FF5A1F"
        />
        
        {/* Elipse naranja inferior - EXTRA GRANDE */}
        <Ellipse 
          cx="214" 
          cy="850" 
          rx="800" 
          ry="600" 
          fill="#FF5A1F"
        />
        
        {/* Rectángulo rotado decorativo */}
        <Rect 
          x="-194.462" 
          y="576.051" 
          width="370" 
          height="370" 
          transform="rotate(27.0888 -194.462 576.051)" 
          stroke="#F1F4FF" 
          strokeWidth="2"
          fill="none"
        />
        
        {/* Círculo grande decorativo */}
        <Circle 
          cx="271" 
          cy="40" 
          r="246.5" 
          stroke="#F8F9FF" 
          strokeWidth="3"
          fill="none"
        />
        
        {/* Línea decorativa */}
        <Path 
          d="M134.806 744.905L93.0339 625.658" 
          stroke="#F1F4FF"
          strokeWidth="1"
        />
      </G>
    </Svg>
  );
};

export default HomeAnimated;
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

const InicioSesion = ({ width, height, style }) => {
  // Si no se pasan dimensiones, usar las de la pantalla
  const screenDimensions = Dimensions.get('window');
  const svgWidth = width || screenDimensions.width;
  const svgHeight = height || screenDimensions.height;

  return (
    <Svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={svgWidth} 
      height={svgHeight} 
      viewBox="0 0 428 926" 
      fill="none"
      style={style}
    >
      <Defs>
        <ClipPath id="clip0_49_327">
          <Rect width="428" height="926" fill="white"/>
        </ClipPath>
      </Defs>
      
      <G clipPath="url(#clip0_49_327)">
        <Rect width="428" height="926" fill="white"/>
        
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
        
        <Circle 
          cx="271" 
          cy="77" 
          r="246.5" 
          stroke="#F8F9FF" 
          strokeWidth="3"
          fill="none"
        />
        
        <Path 
          d="M709 -89C709 49.6235 566.85 162 391.5 162C216.15 162 74 49.6235 74 -89C74 -227.623 216.15 -340 391.5 -340C566.85 -340 709 -227.623 709 -89Z" 
          fill="#FF5A1F"
        />
        
        <Ellipse 
          cx="206.5" 
          cy="1025" 
          rx="317.5" 
          ry="251" 
          fill="#FF5A1F"
        />
        
        <Path 
          d="M134.806 744.905L93.0339 625.658" 
          stroke="#F1F4FF"
          strokeWidth="1"
        />
      </G>
    </Svg>
  );
};

export default InicioSesion;

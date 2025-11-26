import React from "react";
import { Dimensions } from "react-native";
import Svg, { G, Rect, Circle, Defs, ClipPath } from "react-native-svg";

const IncidenciasSvg = ({ style }) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  return (
    <Svg
      width="115%"
      height="100%"
      viewBox="0 0 428 926"
      preserveAspectRatio="xMidYMid slice"
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
        <ClipPath id="clip0_1_2">
          <Rect width="428" height="926" rx="50" />
        </ClipPath>
      </Defs>

      <G clipPath="url(#clip0_1_2)">
        <Rect width="428" height="926" rx="50" fill="white" />
        <Rect
          x="-153.167"
          y="626.346"
          width="370"
          height="370"
          transform="rotate(27.0888 -153.167 626.346)"
          stroke="#F1F4FF"
          strokeWidth="2"
          fill="none"
        />
        <Rect
          x="-263.705"
          y="685.295"
          width="370"
          height="370"
          stroke="#F1F4FF"
          strokeWidth="2"
          fill="none"
        />
        <Circle cx="305" cy="106" r="246.5" stroke="#F8F9FF" strokeWidth="3" fill="none" />
        <Circle cx="465.5" cy="-9.5" r="317.5" fill="#F8F9FF" />
      </G>
    </Svg>
  );
};

export default IncidenciasSvg;
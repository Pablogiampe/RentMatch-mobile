import React from "react";
import { View } from "react-native";
import Svg, {
  Path,
  G,
  Rect,
  Ellipse,
  Defs,
  ClipPath,
  Circle,
  Animate,
} from "react-native-svg";

const IconComponent = ({
  name,
  width = 28,
  color = "#FF5A1F",
  height = 28,
  style = [{ marginRight: 0, marginLeft: 0 }],
}) => {
  const renderIcon = () => {
    switch (name) {
      case "form-icon":
        return (
          <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 16 16"
          >
            <G
              fill="none"
              stroke="#279c17"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
            >
              <Rect width="4.5" height="3.5" x="5.75" y="1.75" />
              <Path d="m9.75 12.8 1.5 1.5 3-2.5m-9-9h-2.5v11.5h4.5m6-5v-6.5h-2.5" />
            </G>
          </Svg>
        );

      case "arrow-down":
        return (
          <Svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <Path
              fill="#fff"
              d="M21.886 5.536A1 1 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569l9 13a.998.998 0 0 0 1.644 0l9-13a1 1 0 0 0 .064-1.033M12 17.243L4.908 7h14.184z"
            />
          </Svg>
        );

      case "back-arrow":
        return (
          <Svg xmlns="http://www.w3.org/2000/svg" width={35} height={35} viewBox="0 0 24 24"><Path fill={color} d="m7.825 13l4.9 4.9q.3.3.288.7t-.313.7q-.3.275-.7.288t-.7-.288l-6.6-6.6q-.15-.15-.213-.325T4.426 12t.063-.375t.212-.325l6.6-6.6q.275-.275.688-.275t.712.275q.3.3.3.713t-.3.712L7.825 11H19q.425 0 .713.288T20 12t-.288.713T19 13z"></Path></Svg>
        );
      case "inspection":
        return (
          <Svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 48 48"
          >
            <G fill="none" stroke="black" stroke-width="5.3">
              <Path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M43 33V19H5v22a2 2 0 0 0 2 2h17"
              />
              <Path
                stroke-linejoin="round"
                d="M5 10a2 2 0 0 1 2-2h34a2 2 0 0 1 2 2v9H5z"
              />
              <Path stroke-linecap="round" d="M16 5v8m16-8v8" />
              <Circle cx="30" cy="32" r="7" />
              <Path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m36 37l6 5"
              />
            </G>
          </Svg>
        );

      case "calendar":
        return (
          <Svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
          >
            <G
              fill="none"
              stroke="#f20c0c"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            >
              <Path
                stroke-dasharray="64"
                stroke-dashoffset="64"
                d="M12 3l9 17h-18l9 -17Z"
              >
                <Animate
                  fill="freeze"
                  attributeName="stroke-dashoffset"
                  dur="0.6s"
                  values="64;0"
                />
              </Path>
              <Path stroke-dasharray="6" stroke-dashoffset="6" d="M12 10v4">
                <Animate
                  fill="freeze"
                  attributeName="stroke-dashoffset"
                  begin="0.6s"
                  dur="0.2s"
                  values="6;0"
                />
              </Path>
              <Path stroke-dasharray="2" stroke-dashoffset="2" d="M12 17v0.01">
                <Animate
                  fill="freeze"
                  attributeName="stroke-dashoffset"
                  begin="0.8s"
                  dur="0.2s"
                  values="2;0"
                />
              </Path>
            </G>
          </Svg>
        );

      case "home":
        return (
          <Svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
          >
            <G fill="none" stroke="#0c2b5b" stroke-width="2">
              <Path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.9"
                d="M10 9h4m-4 7h12m-12 4h12m-12 4h4m-6 5h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v22a2 2 0 0 0 2 2"
              />
              <Circle cx="22" cy="9" r=".5" fill="#0c2b5b" />
            </G>
          </Svg>
        );
         case "upload":
        return (
          <Svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><Path fill="#ff561a" d="M19 13a1 1 0 0 0-1 1v.38l-1.48-1.48a2.79 2.79 0 0 0-3.93 0l-.7.7l-2.48-2.48a2.85 2.85 0 0 0-3.93 0L4 12.6V7a1 1 0 0 1 1-1h7a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-5a1 1 0 0 0-1-1M5 20a1 1 0 0 1-1-1v-3.57l2.9-2.9a.79.79 0 0 1 1.09 0l3.17 3.17l4.3 4.3Zm13-1a.9.9 0 0 1-.18.53L13.31 15l.7-.7a.77.77 0 0 1 1.1 0L18 17.21Zm4.71-14.71l-3-3a1 1 0 0 0-.33-.21a1 1 0 0 0-.76 0a1 1 0 0 0-.33.21l-3 3a1 1 0 0 0 1.42 1.42L18 4.41V10a1 1 0 0 0 2 0V4.41l1.29 1.3a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42"/></Svg>
        );
      case 'logout':
        return (<Svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><G fill="#ff0a33"><Path d="M6.5 3.75c-.526 0-1.25.63-1.25 1.821V18.43c0 1.192.724 1.821 1.25 1.821h6.996a.75.75 0 1 1 0 1.5H6.5c-1.683 0-2.75-1.673-2.75-3.321V5.57c0-1.648 1.067-3.321 2.75-3.321h7a.75.75 0 0 1 0 1.5z" /><Path d="M16.53 7.97a.75.75 0 0 0-1.06 0v3.276H9.5a.75.75 0 0 0 0 1.5h5.97v3.284a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0 .22-.532v-.002a.75.75 0 0 0-.269-.575z" /></G></Svg>);
      case 'profile':
        return (<Svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><G fill="none" stroke="#000" stroke-width="5"><Path stroke-linejoin="round" d="M4 18a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><Circle cx="12" cy="7" r="4" /></G></Svg>);
      case 'bell':
        return (<Svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><Path fill="#000" d="M21 19v1H3v-1l2-2v-6c0-3.1 2.03-5.83 5-6.71V4a2 2 0 0 1 2-2a2 2 0 0 1 2 2v.29c2.97.88 5 3.61 5 6.71v6zm-7 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2" /></Svg>);
      default:
        return null;
    }
  };

  return <View style={style}>{renderIcon()}</View>;
};

export default IconComponent;

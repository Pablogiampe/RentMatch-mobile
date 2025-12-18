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
         <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 32 32"><Path fill="#1e7e39" d="M16 2c-1.258 0-2.152.89-2.594 2H5v25h22V4h-8.406C18.152 2.89 17.258 2 16 2m0 2c.555 0 1 .445 1 1v1h3v2h-8V6h3V5c0-.555.445-1 1-1M7 6h3v4h12V6h3v21H7zm14.281 7.281L15 19.562l-3.281-3.28l-1.438 1.437l4 4l.719.687l.719-.687l7-7z"/></Svg>
        );
case "rental-icon":
        return (<Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 15 15"><Path fill="#6632f9" d="M11.5 1H10c-.74 0-1.38.4-1.72 1H3.5l-1 1l1 1l1-1l1 1l1-1l1 1h.78c.34.6.98 1 1.72 1h1.5c.28 0 .5-.22.5-.5v-3c0-.28-.22-.5-.5-.5M11 3.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-1c0-.28.22-.5.5-.5s.5.22.5.5zM12 14V8H3v6H1.5V6.5h12V14zM4.5 9h6c.28 0 .5.22.5.5s-.22.5-.5.5h-6c-.28 0-.5-.22-.5-.5s.22-.5.5-.5m0 4h6c.28 0 .5.22.5.5s-.22.5-.5.5h-6c-.28 0-.5-.22-.5-.5s.22-.5.5-.5m0-2h6c.28 0 .5.22.5.5s-.22.5-.5.5h-6c-.28 0-.5-.22-.5-.5s.22-.5.5-.5"/></Svg>);
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
  <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24"><Path fill="#e9d904ff" d="M11.25 13.5q.95 0 1.6-.65t.65-1.6t-.65-1.6t-1.6-.65t-1.6.65t-.65 1.6t.65 1.6t1.6.65m4.825 4l-2.625-2.625q-.5.325-1.062.475t-1.138.15q-1.775 0-3.012-1.237T7 11.25t1.238-3.012T11.25 7t3.013 1.238T15.5 11.25q0 .575-.162 1.138t-.488 1.062l2.65 2.65zM5 21q-.825 0-1.412-.587T3 19v-4h2v4h4v2zm10 0v-2h4v-4h2v4q0 .825-.587 1.413T19 21zM3 9V5q0-.825.588-1.412T5 3h4v2H5v4zm16 0V5h-4V3h4q.825 0 1.413.588T21 5v4z"/></Svg>
        );

      case "calendar":
        return (
   <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24"><G fill="none"><Path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><Path fill="#f12020cb" d="m13.299 3.148l8.634 14.954a1.5 1.5 0 0 1-1.299 2.25H3.366a1.5 1.5 0 0 1-1.299-2.25l8.634-14.954c.577-1 2.02-1 2.598 0M12 4.898L4.232 18.352h15.536zM12 15a1 1 0 1 1 0 2a1 1 0 0 1 0-2m0-7a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1"/></G></Svg>
        );

      case "home":
        return (
      <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 36 36"><Path fill="#182878" d="M29.29 5H27v2h2v25H7V7h2V5H7a1.75 1.75 0 0 0-2 1.69v25.62A1.7 1.7 0 0 0 6.71 34h22.58A1.7 1.7 0 0 0 31 32.31V6.69A1.7 1.7 0 0 0 29.29 5" class="clr-i-outline clr-i-outline-path-1"/><Path fill="#182878" d="M26 7.33A2.34 2.34 0 0 0 23.67 5h-1.8a4 4 0 0 0-7.75 0h-1.79A2.34 2.34 0 0 0 10 7.33V11h16ZM24 9H12V7.33a.33.33 0 0 1 .33-.33H16V6a2 2 0 0 1 4 0v1h3.67a.33.33 0 0 1 .33.33Z" class="clr-i-outline clr-i-outline-path-2"/><Path fill="#182878" d="M11 14h14v2H11z" class="clr-i-outline clr-i-outline-path-3"/><Path fill="#182878" d="M11 18h14v2H11z" class="clr-i-outline clr-i-outline-path-4"/><Path fill="#182878" d="M11 22h14v2H11z" class="clr-i-outline clr-i-outline-path-5"/><Path fill="#182878" d="M11 26h14v2H11z" class="clr-i-outline clr-i-outline-path-6"/><Path fill="none" d="M0 0h36v36H0z"/></Svg>
        );
         case "upload":
        return (
          <Svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><Path fill="#ff561a" d="M19 13a1 1 0 0 0-1 1v.38l-1.48-1.48a2.79 2.79 0 0 0-3.93 0l-.7.7l-2.48-2.48a2.85 2.85 0 0 0-3.93 0L4 12.6V7a1 1 0 0 1 1-1h7a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-5a1 1 0 0 0-1-1M5 20a1 1 0 0 1-1-1v-3.57l2.9-2.9a.79.79 0 0 1 1.09 0l3.17 3.17l4.3 4.3Zm13-1a.9.9 0 0 1-.18.53L13.31 15l.7-.7a.77.77 0 0 1 1.1 0L18 17.21Zm4.71-14.71l-3-3a1 1 0 0 0-.33-.21a1 1 0 0 0-.76 0a1 1 0 0 0-.33.21l-3 3a1 1 0 0 0 1.42 1.42L18 4.41V10a1 1 0 0 0 2 0V4.41l1.29 1.3a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42"/></Svg>
        );
      case 'logout':
        return (<Svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><G fill="#ff0a33"><Path d="M6.5 3.75c-.526 0-1.25.63-1.25 1.821V18.43c0 1.192.724 1.821 1.25 1.821h6.996a.75.75 0 1 1 0 1.5H6.5c-1.683 0-2.75-1.673-2.75-3.321V5.57c0-1.648 1.067-3.321 2.75-3.321h7a.75.75 0 0 1 0 1.5z" /><Path d="M16.53 7.97a.75.75 0 0 0-1.06 0v3.276H9.5a.75.75 0 0 0 0 1.5h5.97v3.284a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0 .22-.532v-.002a.75.75 0 0 0-.269-.575z" /></G></Svg>);
      case 'profile':
        return (<Svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24"><G fill="none" stroke="#000" stroke-width="5"><Path stroke-linejoin="round" d="M4 18a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><Circle cx="12" cy="7" r="4" /></G></Svg>);
      case 'bell':
        return (<Svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><Path fill="#000" d="M21 19v1H3v-1l2-2v-6c0-3.1 2.03-5.83 5-6.71V4a2 2 0 0 1 2-2a2 2 0 0 1 2 2v.29c2.97.88 5 3.61 5 6.71v6zm-7 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2" /></Svg>);
      default:
        return null;
    }
  };

  return <View style={style}>{renderIcon()}</View>;
};

export default IconComponent;

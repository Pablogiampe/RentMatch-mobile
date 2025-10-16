import React from 'react';
import { View } from 'react-native';
import Svg, { Path, G, Rect, Ellipse, Defs, ClipPath } from 'react-native-svg';

const IconComponent = ({
  name,
  width = 28,
  height = 28,
  style = [{ marginRight: 0, marginLeft: 0 }],
}) => {
  const renderIcon = () => {



    switch (name) {

      case 'form-icon':
        return (<Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 16 16"><G fill="none" stroke="#279c17" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><Rect width="4.5" height="3.5" x="5.75" y="1.75"/><Path d="m9.75 12.8 1.5 1.5 3-2.5m-9-9h-2.5v11.5h4.5m6-5v-6.5h-2.5"/></G></Svg>)
;

      case 'arrow-down':
      return (<Svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><Path fill="#fff" d="M21.886 5.536A1 1 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569l9 13a.998.998 0 0 0 1.644 0l9-13a1 1 0 0 0 .064-1.033M12 17.243L4.908 7h14.184z"/></Svg>);



      default:
        return null;
    }
  };

  return (
    <View style={style}>
      {renderIcon()}
    </View>
  );
};

export default IconComponent;
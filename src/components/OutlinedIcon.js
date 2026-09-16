import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Renders an icon glyph with a stroke that follows the icon's own shape,
// instead of a plain circle around it.
export default function OutlinedIcon({ d, viewBox, size = 17, fill, stroke, strokeWidth = 1.4 }) {
  const parts = viewBox.split(' ').map(Number);
  const vbW = parts[2];
  const vbH = parts[3];

  // The strokeWidth is expressed in pixels, but react-native-svg measures it in
  // viewBox units, so convert using the actual render scale.
  const scale = Math.min(size / vbW, size / vbH);
  const userStrokeWidth = strokeWidth / scale;

  return (
    <Svg width={size} height={size} viewBox={viewBox}>
      <Path
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={userStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
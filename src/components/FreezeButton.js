import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@react-native-vector-icons/fontawesome/static';
import { controlButtonStyle } from '../constants';

// The freeze / unfreeze button. CameraView owns the frozen state (through useFrozenFrame),
// so this button only shows it and reports taps.
export default function FreezeButton({ isFrozen, controlsVisible, onPress }) {
  // Keep the button hidden together with the rest of the controls.
  if (!controlsVisible) return null;

  return (
    // Tapping this button freezes the current frame or returns to the live preview.
    <TouchableOpacity style={[controlButtonStyle, styles.button]} onPress={onPress}>
      {/* Show a different symbol depending on whether the camera is currently frozen. */}
      <FontAwesome name={isFrozen ? 'play' : 'snowflake-o'} size={22} color="white" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
});

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LENS_BUTTON_LEFT, TOP_ROW_TOP, controlButtonStyle } from './constants';

export default function LensButton({ frontDevices, selectedLensId, onLensChange }) {
  // Cycle to the next available front lens. Zoom resets since each lens has its own range.
  // CameraView receives the choice, applies it, and remembers it for the next launch.
  const switchLens = () => {
    const currentIndex = frontDevices.findIndex((d) => d.id === selectedLensId);
    const nextDevice = frontDevices[(currentIndex + 1) % frontDevices.length];

    onLensChange(nextDevice.id);
  };

  // Only show the button when the phone actually has more than one front camera.
  // CameraView already hides it together with the rest of the controls.
  if (frontDevices.length <= 1) return null;

  return (
    // Tapping this button cycles to the next available front lens.
    <TouchableOpacity style={[controlButtonStyle, styles.button]} onPress={switchLens}>
      <Text style={styles.label}>⇄</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: TOP_ROW_TOP,
    left: LENS_BUTTON_LEFT,
  },
  label: {
    color: "white",
    fontSize: 22,
  },
});

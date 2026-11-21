import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from "@react-native-vector-icons/fontawesome/static";
import { SCREEN_MARGIN, TOP_ROW_TOP, controlButtonStyle } from '../constants';

export default function EyeButton({ controlsVisible, onVisibilityChange }) {
  // Hide or show the controls when the eye is pressed.
  const toggleVisibility = () => {
    onVisibilityChange(!controlsVisible);
  };

  return (
    <>
      {/* Keep the eye permanently visible in the top-right corner. */}
      <TouchableOpacity
        style={[controlButtonStyle, styles.button]}
        onPress={toggleVisibility}
        activeOpacity={0.7}
      >
        {/* Show eye-slash while the controls are visible, and eye while they are hidden. */}
        <FontAwesome
          name={controlsVisible ? "eye-slash" : "eye"}
          size={23}
          color="white"
        />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  // Keep the eye permanently in the top-right corner of the mirror preview.
  button: {
    position: "absolute",
    top: TOP_ROW_TOP,
    right: SCREEN_MARGIN,
    zIndex: 20,
    elevation: 20,
  },
});

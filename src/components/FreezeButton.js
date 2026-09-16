import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@react-native-vector-icons/fontawesome/static';

export default function FreezeButton({ isFrozen, onPress }) {
  return (
    // Tapping this button runs the toggleFreeze function passed down from CameraView.
    <TouchableOpacity style={styles.button} onPress={onPress}>
      {/* Show a different symbol depending on whether the camera is currently frozen. */}
      <FontAwesome
        name={isFrozen ? 'play' : 'snowflake-o'}
        size={22}
        color="white"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(82, 82, 82, 0.37)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
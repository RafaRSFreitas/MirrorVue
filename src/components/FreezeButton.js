import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function FreezeButton({ isFrozen, onPress }) {
  return (
    // Tapping this button runs the toggleFreeze function passed down from CameraView.
    <TouchableOpacity style={styles.button} onPress={onPress}>
      {/* Show a different symbol depending on whether the camera is currently frozen. */}
      <Text style={styles.label}>{isFrozen ? '▶' : '❄'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 50,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: 'white',
    fontSize: 22,
  },
});
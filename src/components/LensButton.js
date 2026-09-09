import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function LensButton({ onPress }) {
  return (
    // Tapping this button runs the switchLens function passed down from CameraView.
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.label}>⇄</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top:  40,
    left: 80,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(82, 82, 82, 0.37)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: 'white',
    fontSize: 22,
  },
});
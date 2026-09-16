import React from 'react';
import { StyleSheet, Image } from 'react-native';

// Show the captured frame on top of the camera while frozen.
export default function FrozenFrame({ uri }) {
  return (
    <Image source={{ uri }} style={styles.frame} />
  );
}

const styles = StyleSheet.create({
  frame: {
    ...StyleSheet.absoluteFillObject,
  },
});
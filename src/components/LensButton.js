import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../storageKeys';

export default function LensButton({ frontDevices, selectedLensId, controlsVisible, onLensChange }) {
  // Load the previously selected lens, if any, once the available lenses are known.
  useEffect(() => {
    if (frontDevices.length > 0) {
      AsyncStorage.getItem(STORAGE_KEYS.selectedLensId).then((savedId) => {
        const match = frontDevices.find((d) => d.id === savedId);
        onLensChange(match ? match.id : frontDevices[0].id);
      });
    }
  }, [frontDevices.length]);

  // Cycle to the next available front lens. Zoom resets since each lens has its own range.
  const switchLens = () => {
    const currentIndex = frontDevices.findIndex((d) => d.id === selectedLensId);
    const nextDevice = frontDevices[(currentIndex + 1) % frontDevices.length];

    // Select the new lens and remember the choice for the next launch.
    onLensChange(nextDevice.id);
    AsyncStorage.setItem(STORAGE_KEYS.selectedLensId, nextDevice.id);
  };

  // Keep the button hidden together with the rest of the controls, and only show it
  // when the phone actually has more than one front camera.
  if (!controlsVisible || frontDevices.length <= 1) return null;

  return (
    // Tapping this button cycles to the next available front lens.
    <TouchableOpacity style={styles.button} onPress={switchLens}>
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
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Camera, useCameraPermission } from 'react-native-vision-camera';

export default function CameraView() {
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  if (!hasPermission) {
    // We'll replace this with a proper "please allow camera" screen in the future
    return null;
  }

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device="front"
      isActive={true}
    />
  );
}
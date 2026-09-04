import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Image, LogBox } from 'react-native';
import { Camera, useCameraPermission, useCameraDevice } from 'react-native-vision-camera';
import { File } from 'expo-file-system';
import ZoomSlider from './ZoomSlider';
import FreezeButton from './FreezeButton';

// Ignore these harmless messages that can appear when the camera receives rapid zoom updates.
LogBox.ignoreLogs([
  'Cancelled due to another zoom value being set',
  'CameraControl$OperationCanceledException'
]);

export default function CameraView() {
  // Get the current permission status and the function used to request permission.
  const { hasPermission, requestPermission } = useCameraPermission();

  // Select the phone's front-facing camera for the mirror view.
  const device = useCameraDevice('front');
  
  // Store the zoom value in React state so the Camera re-renders when it changes.
  const [cameraZoom, setCameraZoom] = useState(null);

  // A reference to the Camera component, needed to call takeSnapshot() on it directly.
  const camera = useRef(null);

  // Track whether the preview is currently frozen, and the captured frame to show while it is.
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenUri, setFrozenUri] = useState(null);

  // Store the zoom level just before freezing so we can restore it after unfreezing.
  const zoomBeforeFreezeRef = useRef(null);

  useEffect(() => {
    // Ask the user for camera access when permission has not been granted yet.
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Effect to restore zoom when the camera becomes active again after unfreezing.
  useEffect(() => {
    // Only run when isFrozen becomes false and we have a stored zoom value.
    if (!isFrozen && zoomBeforeFreezeRef.current !== null) {
      const zoomToRestore = zoomBeforeFreezeRef.current;
      // Temporarily set zoom to null. This changes the prop and forces the Camera
      // to reapply the zoom when we set it back shortly after.
      setCameraZoom(null);
      const timer = setTimeout(() => {
        setCameraZoom(zoomToRestore);
        zoomBeforeFreezeRef.current = null;
      }, 100); // Small delay to let the camera finish re‑initialising.
      return () => clearTimeout(timer);
    }
  }, [isFrozen]);

  // Do not render the camera until the app has permission to use it.
  if (!hasPermission) return null;

  // The camera device may take a short time to become available.
  if (!device) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white' }}>Loading camera...</Text>
      </View>
    );
  }

  // Use the camera's supported minimum zoom, or 1x if it does not provide one.
  const minZoom = device.minZoom ?? 1;

  // Limit the slider to 4x zoom because higher digital zoom can reduce image quality.
  const maxZoom = Math.min(device.maxZoom ?? 4, 4); 

  // Capture the current frame when freezing, or clear it and resume the live preview when unfreezing.
  const toggleFreeze = async () => {
    if (isFrozen) {
      // Unfreeze: resume the live preview.
      if (frozenUri) {
        try {
          new File(frozenUri).delete();
        } catch (error) {
          // The file may already be gone, which is fine — there is nothing left to clean up.
        }
      }
      setFrozenUri(null);
      setIsFrozen(false);
    } else {
      // Freeze: store the current zoom level for later restoration.
      zoomBeforeFreezeRef.current = cameraZoom;
      // takeSnapshot() writes the current frame to a temporary file and returns its path.
      const snapshot = await camera.current.takeSnapshot({ quality: 85 });
      setFrozenUri('file://' + snapshot.path);
      setIsFrozen(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Display the front camera and flip it horizontally to create a mirror effect. */}
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!isFrozen}
        mirror={true} 
        // Leave zoom undefined at first so the camera can use its default zoom value.
        zoom={cameraZoom !== null ? cameraZoom : undefined} 
      />

      {/* Show the captured frame on top of the camera while frozen. */}
      {isFrozen && (
        <Image source={{ uri: frozenUri }} style={StyleSheet.absoluteFill} />
      )}

      {/* Update cameraZoom whenever the user moves the zoom slider. */}
      <ZoomSlider 
        minZoom={minZoom} 
        maxZoom={maxZoom} 
        onZoomChange={(newZoom) => setCameraZoom(newZoom)}
      />

      {/* Let the user freeze the current frame or return to the live preview. */}
      <FreezeButton isFrozen={isFrozen} onPress={toggleFreeze} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
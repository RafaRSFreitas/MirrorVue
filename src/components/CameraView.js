import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, LogBox, AppState } from 'react-native';
import { Camera, useCameraPermission, useCameraDevices } from 'react-native-vision-camera';
import ZoomSlider from './ZoomSlider';
import FreezeButton from './FreezeButton';
import FrozenFrame from './FrozenFrame';
import BrightnessSlider from './BrightnessSlider';
import LensButton from './LensButton';
import Menu from './Menu';
import EyeButton from './EyeButton';
import FlashButton from './FlashButton';

// Ignore these harmless messages that can appear when the camera receives rapid zoom updates.
LogBox.ignoreLogs([
'Cancelled due to another zoom value being set',
'CameraControl$OperationCanceledException'
]);

export default function CameraView() {
// Get the current permission status and the function used to request permission.
const { hasPermission, requestPermission } = useCameraPermission();

// Get every camera device on the phone, then keep only the front-facing ones.
const frontDevices = useCameraDevices().filter((d) => d.position === 'front');

// Use the lens picked by LensButton, falling back to the first one found.
const [selectedLensId, setSelectedLensId] = useState(null);
const device = frontDevices.find((d) => d.id === selectedLensId) ?? frontDevices[0];

// A reference to the Camera component, needed by FreezeButton to call takeSnapshot().
const camera = useRef(null);

// The path of the frozen frame, or null while showing the live preview.
const [frozenUri, setFrozenUri] = useState(null);
const isFrozen = frozenUri !== null;

// Track whether the app is currently in the foreground, so the camera can pause in the background.
const [isAppActive, setIsAppActive] = useState(true);

// The camera should only run when it isn't frozen and the app is actually on screen.
const cameraActive = !isFrozen && isAppActive;

// Store the zoom value in React state so the Camera re-renders when it changes.
const [cameraZoom, setCameraZoom] = useState(null);

// Changing this value tells ZoomSlider to return to its initial position
const [zoomResetKey, setZoomResetKey] = useState(0);

// Remember the most recently applied zoom level, so it can be restored after the camera pauses.
const lastZoomRef = useRef(null);

// Track whether the controls are currently visible.
const [controlsVisible, setControlsVisible] = useState(true);

// Track whether the virtual front flash is on, so the brightness slider can follow it.
const [isFlashOn, setIsFlashOn] = useState(false);

useEffect(() => {
// Ask the user for camera access when permission has not been granted yet.
if (!hasPermission) {
requestPermission();
}
}, [hasPermission, requestPermission]);

// Update isAppActive whenever the app moves between the foreground and background.
useEffect(() => {
const subscription = AppState.addEventListener('change', (nextAppState) => {
setIsAppActive(nextAppState === 'active');
});
return () => subscription.remove();
}, []);

// Keep lastZoomRef up to date every time the zoom level actually changes.
useEffect(() => {
if (cameraZoom !== null) {
lastZoomRef.current = cameraZoom;
}
}, [cameraZoom]);

// Effect to restore zoom whenever the camera becomes active again — whether from
// unfreezing, or from the app returning to the foreground.
useEffect(() => {
if (cameraActive && lastZoomRef.current !== null) {
const zoomToRestore = lastZoomRef.current;
// Temporarily set zoom to null. This changes the prop and forces the Camera
// to reapply the zoom when we set it back shortly after.
setCameraZoom(null);
const timer = setTimeout(() => {
setCameraZoom(zoomToRestore);
}, 100); // Small delay to let the camera finish re-initialising.
return () => clearTimeout(timer);
}
}, [cameraActive]);

// When the lens changes, zoom resets since each lens has its own range.
useEffect(() => {
if (selectedLensId === null || !device) return;

// Forget the previous lens's zoom.
lastZoomRef.current = null;

// Start the new lens at its minimum supported zoom.
setCameraZoom(device.minZoom ?? 1);

// Reset the visual zoom slider to its starting position.
setZoomResetKey((currentKey) => currentKey + 1);
}, [selectedLensId]);

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

return ( <View style={styles.container}>
{/* Display the front camera and flip it horizontally to create a mirror effect. */}
<Camera
ref={camera}
style={StyleSheet.absoluteFill}
device={device}
isActive={cameraActive}
mirror={true}
// Leave zoom undefined at first so the camera can use its default zoom value.
zoom={cameraZoom !== null ? cameraZoom : undefined}
/>

  {/* Show the captured frame on top of the camera while frozen. */}
  {frozenUri !== null && <FrozenFrame uri={frozenUri} />}

  {/* Let the user light their face with a virtual front flash. */}
  <FlashButton
    controlsVisible={controlsVisible}
    isFrozen={isFrozen}
    lensId={device.id}
    onFlashChange={setIsFlashOn}
  />

  {/* Display the top-left menu and its navigation options. */}
  {controlsVisible && (
    <Menu />
  )}

  {/* Update cameraZoom whenever the user moves the zoom slider. */}
  {controlsVisible && !isFrozen && (
    <ZoomSlider 
      device={device}
      onZoomChange={(newZoom) => setCameraZoom(newZoom)}
      resetKey={zoomResetKey}
      initialZoom={cameraZoom ?? device.minZoom ?? 1}
    />
  )}

  {/* Let the user freeze the current frame or return to the live preview. */}
  <FreezeButton
    cameraRef={camera}
    controlsVisible={controlsVisible}
    onFrozenChange={setFrozenUri}
  />

  {/* Let the user adjust the screen brightness while the app is open. */}
  {controlsVisible && !isFrozen && <BrightnessSlider flashOn={isFlashOn} />}

  {/* Only show the lens toggle when the phone actually has more than one front camera,
      and hide it while the image is frozen. */}
  {controlsVisible && !isFrozen && (
    <LensButton
      frontDevices={frontDevices}
      selectedLensId={selectedLensId}
      controlsVisible={controlsVisible}
      onLensChange={setSelectedLensId}
    />
  )}

  {/* Keep the eye visible permanently and let it toggle the controls manually. */}
  <EyeButton
    controlsVisible={controlsVisible}
    onVisibilityChange={setControlsVisible}
  />
</View>

);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: 'black',
},
});

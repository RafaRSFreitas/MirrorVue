import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, LogBox, AppState, Linking } from 'react-native';
import { Camera, useCameraPermission, useCameraDevices } from 'react-native-vision-camera';
import ZoomSlider from './ZoomSlider';
import FreezeButton from './FreezeButton';
import FrozenFrame from './FrozenFrame';
import BrightnessSlider from './BrightnessSlider';
import LensButton from './LensButton';
import Menu from './Menu';
import EyeButton from './EyeButton';
import FlashButton from './FlashButton';
import MessageScreen from './MessageScreen';

// Ignore these harmless messages that can appear when the camera receives rapid zoom updates.
LogBox.ignoreLogs([
'Cancelled due to another zoom value being set',
'CameraControl$OperationCanceledException'
]);

export default function CameraView() {
// Get the current permission status and the function used to request permission.
const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();

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

// Keep the current camera startup/runtime failure so we can replace the controls
// with a clear recovery message until the user retries.
const [cameraError, setCameraError] = useState(null);

// True while the user is retrying, so the retry button can give quick feedback.
const [isRetrying, setIsRetrying] = useState(false);

const handleRequestPermission = async () => {
  if (!canRequestPermission) {
    await Linking.openSettings();
    return;
  }

  try {
    await requestPermission();
  } catch (error) {
    // A failed request is not fatal: the panel stays up and the user can tap again.
  }
};

// Retry starting the camera: clear the failure, and bring the message back at once
// if the camera is still not usable, so the button always reacts to the tap.
const handleRetry = () => {
  setIsRetrying(true);
  setCameraError(null);

  setTimeout(() => {
    const cameraInUse = camera.current?.controller?.isUsedByAnotherApp ?? false;
    const cameraReady = camera.current?.controller?.isConnected ?? false;

    if (!cameraReady) {
      setCameraError({ cameraInUse });
    }
    setIsRetrying(false);
  }, 600);
};

const handleCameraError = (error) => {
  const message = error?.message?.toLowerCase() ?? '';

  // CameraX can cancel a zoom update while the session is still starting or pausing.
  // This does not stop the preview, so showing the error screen here would hide a
  // camera that is otherwise working.
  const isCancelledZoomUpdate =
    message.includes('cameracontrol$operationcanceledexception') ||
    message.includes('cameracontrol$operationcancelexception') ||
    message.includes('zoom animation was canceled') ||
    message.includes('camera is not active') ||
    message.includes('cancelled due to another zoom value being set');

  if (isCancelledZoomUpdate) return;

  // Keep the raw error reachable in development, so the generic branch can be diagnosed.
  if (__DEV__) {
    console.warn('Mirror Vue camera error:', error?.message ?? error);
  }

  // These messages are the ones the camera reports when the camera is already
  // owned by another app, or when too many cameras are open at once.
  const cameraInUse =
    message.includes('already in use') ||
    message.includes('in use') ||
    message.includes('maximum number of open cameras');
  setCameraError({ cameraInUse });
};

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

// The camera can report a recoverable problem as an interruption instead of an error,
// and that is how a camera already owned by another app usually shows up. When the
// interruption is over the session restarts on its own, so only react to the start.
const handleInterruptionStart = () => {
  // The controller knows exactly whether the camera is held by another app.
  const cameraInUse = camera.current?.controller?.isUsedByAnotherApp ?? false;
  setCameraError({ cameraInUse });
};

// Explain why permission is needed and offer the appropriate next steps.
if (!hasPermission) {
  return (
    <MessageScreen
      title="Camera permission needed"
      message="Mirror Vue needs camera access to show your mirror. Allow access to continue."
      primaryLabel={canRequestPermission ? 'Allow camera access' : 'Open settings'}
      onPrimaryPress={handleRequestPermission}
      secondaryLabel={canRequestPermission ? 'Open settings' : undefined}
      onSecondaryPress={canRequestPermission ? () => Linking.openSettings() : undefined}
    />
  );
}

// If another app owns the camera, ask the user to close it and try again.
if (cameraError) {
  return (
    <MessageScreen
      title={cameraError.cameraInUse ? 'Camera is in use' : 'Camera unavailable'}
      message={
        isRetrying
          ? 'Retrying\u2026'
          : cameraError.cameraInUse
            ? 'Another app is using the camera. Close that app, then try again.'
            : 'The camera could not start. Try again in a moment.'
      }
      primaryLabel="Retry"
      onPrimaryPress={handleRetry}
    />
  );
}

// The camera device may take a short time to become available.
if (!device) {
  return (
    <MessageScreen
      title="Looking for camera"
      message="The front camera is not available yet. Please wait a moment."
    />
  );
}

return ( <View style={styles.container}>
{/* Display the front camera and flip it horizontally to create a mirror effect. */}
<Camera
ref={camera}
style={StyleSheet.absoluteFill}
device={device}
isActive={cameraActive}
mirrorMode="on"
onError={handleCameraError}
onInterruptionStarted={handleInterruptionStart}
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

import { useState } from 'react';
import { INTERRUPTION_GRACE_MS, RETRY_FEEDBACK_MS } from '../constants';

// Messages that only mean a zoom update was cancelled while the camera session was starting
// or pausing. They do not stop the preview, so showing the error screen for them would hide
// a camera that is otherwise working. (The text is compared in lower case.)
const CANCELLED_ZOOM_MESSAGES = [
  'cameracontrol$operationcanceledexception',
  'cameracontrol$operationcancelexception',
  'zoom animation was canceled',
  'camera is not active',
  'cancelled due to another zoom value being set',
];

// Keeps track of camera failures (camera in use, camera could not start) and of the Retry
// button. CameraView shows a recovery message while cameraError is not null.
// cameraRef is the reference to the Camera component, used to ask the camera how it is doing.
export default function useCameraErrors(cameraRef) {
  // The current camera failure, or null while everything is fine.
  const [cameraError, setCameraError] = useState(null);

  // True while the user is retrying, so the retry button can give quick feedback.
  const [isRetrying, setIsRetrying] = useState(false);

  // Retry starting the camera: clear the failure, and bring the message back at once
  // if the camera is still not usable, so the button always reacts to the tap.
  const handleRetry = () => {
    setIsRetrying(true);
    setCameraError(null);

    setTimeout(() => {
      const cameraInUse = cameraRef.current?.controller?.isUsedByAnotherApp ?? false;
      const cameraReady = cameraRef.current?.controller?.isConnected ?? false;

      if (!cameraReady) {
        setCameraError({ cameraInUse });
      }
      setIsRetrying(false);
    }, RETRY_FEEDBACK_MS);
  };

  // Called by the Camera component whenever it reports an error.
  const handleCameraError = (error) => {
    const message = error?.message?.toLowerCase() ?? '';

    if (CANCELLED_ZOOM_MESSAGES.some((text) => message.includes(text))) return;

    // Keep the raw error reachable in development, so the generic branch can be diagnosed.
    if (__DEV__) {
      console.warn('Mirror Vue camera error:', error?.message ?? error);
    }

    // These messages are the ones the camera reports when the camera is already
    // owned by another app, or when too many cameras are open at once.
    const cameraInUse =
      message.includes('in use') || message.includes('maximum number of open cameras');
    setCameraError({ cameraInUse });
  };

  // Most interruptions, such as calls or notifications, are temporary and the session
  // restarts on its own, so only show the recovery panel for a condition that will not
  // clear by itself. Anything else is left to recover quietly behind the preview.
  const handleInterruptionStart = () => {
    // These flags mean the camera is held by another app or blocked by the system.
    const controller = cameraRef.current?.controller;
    const cameraInUse = controller?.isUsedByAnotherApp ?? false;
    const isBlocked = controller?.isSuspended ?? false;

    if (!cameraInUse && !isBlocked) {
      // Wait a moment, and only report the interruption if it is still not clearing.
      setTimeout(() => {
        const stillOpen = cameraRef.current?.controller?.isConnected ?? false;
        if (!stillOpen) {
          setCameraError({ cameraInUse: false });
        }
      }, INTERRUPTION_GRACE_MS);
      return;
    }

    setCameraError({ cameraInUse });
  };

  return { cameraError, isRetrying, handleRetry, handleCameraError, handleInterruptionStart };
}
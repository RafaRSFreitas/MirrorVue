import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { File } from 'expo-file-system';

// Delete the temporary snapshot file, if it still exists.
const deleteSnapshot = (uri) => {
  if (!uri) return;
  try {
    new File(uri).delete();
  } catch (error) {
    // The file may already be gone, which is fine — there is nothing left to clean up.
  }
};

// Owns everything about the frozen frame, so there is a single source of truth for it.
// CameraView uses frozenUri to pause the camera and show the picture, and the freeze
// button only needs to know isFrozen and to call toggleFreeze.
export default function useFrozenFrame(cameraRef) {
  // The path of the frozen frame, or null while the live preview is showing.
  const [frozenUri, setFrozenUri] = useState(null);

  // The AppState listener below is created only once, so it reads the latest frame from a ref.
  const frozenUriRef = useRef(null);

  // True while a snapshot is being taken, so a quick double tap cannot create two files.
  const isCapturingRef = useRef(false);

  // Unfreeze the preview: delete the captured frame so the live camera returns.
  const unfreeze = () => {
    deleteSnapshot(frozenUriRef.current);
    frozenUriRef.current = null;
    setFrozenUri(null);
  };

  // Freeze the preview: capture the current frame and show it instead of the live camera.
  const freeze = async () => {
    if (isCapturingRef.current) return;
    isCapturingRef.current = true;

    try {
      // takeSnapshot() writes the current frame to a temporary file and returns its path.
      const snapshot = await cameraRef.current.takeSnapshot({ quality: 85 });
      const nextFrozenUri = 'file://' + snapshot.path;
      frozenUriRef.current = nextFrozenUri;
      setFrozenUri(nextFrozenUri);
    } catch (error) {
      // If the snapshot cannot be taken, the live preview simply keeps running.
    } finally {
      isCapturingRef.current = false;
    }
  };

  // If the app returns to the foreground while a frame is frozen, clear the frame
  // so the live preview comes back instead of a stale image.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && frozenUriRef.current !== null) {
        unfreeze();
      }
    });
    return () => subscription.remove();
  }, []);

  // Toggle between the live preview and the captured frame.
  const toggleFreeze = () => {
    if (frozenUri !== null) {
      unfreeze();
    } else {
      freeze();
    }
  };

  return { frozenUri, isFrozen: frozenUri !== null, toggleFreeze };
}

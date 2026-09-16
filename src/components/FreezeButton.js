import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, AppState } from 'react-native';
import { FontAwesome } from '@react-native-vector-icons/fontawesome/static';
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

export default function FreezeButton({ cameraRef, controlsVisible, onFrozenChange }) {
  // Track whether the preview is currently frozen, and the captured frame to show while it is.
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenUri, setFrozenUri] = useState(null);

  // Refs let the AppState listener read and clear the latest freeze state.
  const isFrozenRef = useRef(false);
  const frozenUriRef = useRef(null);

  // Unfreeze the preview: clear the captured frame so the live camera returns.
  const unfreeze = () => {
    deleteSnapshot(frozenUriRef.current);
    frozenUriRef.current = null;
    isFrozenRef.current = false;
    setFrozenUri(null);
    setIsFrozen(false);
  };

  // Freeze the preview: capture the current frame and show it instead of the live camera.
  const freeze = async () => {
    // takeSnapshot() writes the current frame to a temporary file and returns its path.
    const snapshot = await cameraRef.current.takeSnapshot({ quality: 85 });
    const nextFrozenUri = 'file://' + snapshot.path;
    frozenUriRef.current = nextFrozenUri;
    isFrozenRef.current = true;
    setFrozenUri(nextFrozenUri);
    setIsFrozen(true);
  };

  // Tell CameraView the path of the frame being shown, or null when unfrozen, so
  // it can pause the live camera and display the captured frame over it.
  useEffect(() => {
    onFrozenChange?.(frozenUri);
  }, [frozenUri, onFrozenChange]);

  // If the app returns to the foreground while a frame is frozen, clear the frame
  // so the live preview comes back instead of a stale image.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && isFrozenRef.current) {
        unfreeze();
      }
    });
    return () => subscription.remove();
  }, []);

  // Toggle between the live preview and the captured frame.
  const toggleFreeze = () => {
    if (isFrozen) {
      unfreeze();
    } else {
      freeze();
    }
  };

  // Keep the button hidden together with the rest of the controls.
  if (!controlsVisible) return null;

  return (
    // Tapping this button freezes the current frame or returns to the live preview.
    <TouchableOpacity style={styles.button} onPress={toggleFreeze}>
      {/* Show a different symbol depending on whether the camera is currently frozen. */}
      <FontAwesome
        name={isFrozen ? 'play' : 'snowflake-o'}
        size={22}
        color="white"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(82, 82, 82, 0.37)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
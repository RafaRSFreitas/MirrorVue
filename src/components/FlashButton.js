import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontAwesome } from '@react-native-vector-icons/fontawesome/static';
import * as Brightness from 'expo-brightness';

// Thickness of the white frame that lights up around the screen edges.
const FRAME_THICKNESS = 50;

// How long the overlay stays visible after freezing before it is hidden.
const OVERLAY_HIDE_DELAY = 500;

export default function FlashButton({ controlsVisible, isFrozen, lensId }) {
  // Track whether the virtual front flash is currently on.
  const [isOn, setIsOn] = useState(false);

  // Track whether the white overlay is temporarily hidden while the image is frozen.
  const [isOverlayHidden, setIsOverlayHidden] = useState(false);

  // Remember the brightness from before the flash, so it can be restored afterwards.
  const previousBrightness = useRef(null);

  // Track the current lens so the flash can switch off whenever it changes.
  const previousLensId = useRef(lensId);

  // While the flash is on, force the screen to its maximum brightness, then put
  // the previous brightness back once the flash turns off.
  useEffect(() => {
    let isCancelled = false;

    if (isOn) {
      Brightness.getBrightnessAsync().then((currentBrightness) => {
        if (isCancelled) return;
        previousBrightness.current = currentBrightness;
        Brightness.setBrightnessAsync(1);
      });
    } else if (previousBrightness.current !== null) {
      Brightness.setBrightnessAsync(previousBrightness.current);
      previousBrightness.current = null;
    }

    return () => {
      isCancelled = true;
    };
  }, [isOn]);

  // Turn the flash off whenever the user switches to another lens.
  useEffect(() => {
    if (previousLensId.current !== lensId) {
      previousLensId.current = lensId;
      setIsOn(false);
      setIsOverlayHidden(false);
    }
  }, [lensId]);

  // Hide the overlay shortly after freezing while keeping the brightness on, and
  // show it again once the live preview comes back.
  useEffect(() => {
    if (!isFrozen) {
      setIsOverlayHidden(false);
      return undefined;
    }

    if (!isOn) return undefined;

    const timer = setTimeout(() => setIsOverlayHidden(true), OVERLAY_HIDE_DELAY);
    return () => clearTimeout(timer);
  }, [isFrozen]);

  // Toggle the flash, keeping the overlay hidden while the frozen frame is shown.
  const toggleFlash = () => {
    const nextValue = !isOn;
    setIsOn(nextValue);
    setIsOverlayHidden(nextValue && isFrozen);
  };

  return (
    <>
      {/* Light the face with a white frame around the screen edges. It is rendered
          below the other controls so they stay visible and remain usable. */}
      {isOn && !isOverlayHidden && (
        <View pointerEvents="none" style={styles.flashOverlay} />
      )}

      {/* Keep the button to the left of the eye and hide it with the other controls. */}
      {controlsVisible && (
        <TouchableOpacity
          style={styles.button}
          onPress={toggleFlash}
          activeOpacity={0.7}
        >
          <FontAwesome
            name="flash"
            size={23}
            color={isOn ? '#FFD54A' : 'white'}
          />
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // A transparent center with a thick white border creates the light frame.
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderLeftWidth: FRAME_THICKNESS,
    borderRightWidth: FRAME_THICKNESS,
    borderColor: 'white',
  },

  // Place the flash button just to the left of the eye button.
  button: {
    position: 'absolute',
    top: 40,
    right: 82,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(82, 82, 82, 0.37)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
});

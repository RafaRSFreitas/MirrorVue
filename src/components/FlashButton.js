import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
  AppState,
} from "react-native";
import { FontAwesome } from "@react-native-vector-icons/fontawesome/static";
import * as Brightness from "expo-brightness";
import { FLASH_BUTTON_RIGHT, TOP_ROW_TOP, controlButtonStyle } from '../constants';

// Thickness of the white frame that lights up around the screen edges.
const FRAME_THICKNESS = 100;

// How long the overlay stays visible after freezing before it is hidden.
const OVERLAY_HIDE_DELAY = 500;

export default function FlashButton({
  controlsVisible,
  isFrozen,
  lensId,
  onFlashChange,
  visible = true,
}) {
  // Track whether the virtual front flash is currently on.
  const [isOn, setIsOn] = useState(false);

  // Track whether the white overlay is temporarily hidden while the image is frozen.
  const [isOverlayHidden, setIsOverlayHidden] = useState(false);

  // Remember the brightness from before the flash, so it can be restored afterwards.
  const previousBrightness = useRef(null);

  // Track the current lens so the flash can switch off whenever it changes.
  const previousLensId = useRef(lensId);

  // The light follows the screen orientation: top and bottom in portrait,
  // left and right in landscape.
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

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

  // If this button disappears while the flash is on (for example when the camera error
  // screen takes over), put the previous brightness back so it is not left at maximum.
  useEffect(() => {
    return () => {
      if (previousBrightness.current !== null) {
        Brightness.setBrightnessAsync(previousBrightness.current);
      }
    };
  }, []);

  // Turn the flash off whenever the user switches to another lens.
  useEffect(() => {
    if (previousLensId.current !== lensId) {
      previousLensId.current = lensId;
      setIsOn(false);
      setIsOverlayHidden(false);
    }
  }, [lensId]);

  // If the button is hidden because there is no room for it, make sure the light is
  // not left stuck on with no way to turn it off.
  useEffect(() => {
    if (!visible) {
      setIsOn(false);
      setIsOverlayHidden(false);
    }
  }, [visible]);

  // Turn the flash off whenever the app leaves the foreground, so the forced maximum
  // brightness is never left stuck on while the screen is off or the app is hidden.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState !== "active") {
        setIsOn(false);
        setIsOverlayHidden(false);
      }
    });

    return () => subscription.remove();
  }, []);

  // Tell CameraView whenever the flash turns on or off, so other controls such as
  // the brightness slider can follow the brightness that the flash applies.
  useEffect(() => {
    onFlashChange?.(isOn);
  }, [isOn, onFlashChange]);

  // Hide the overlay shortly after freezing while keeping the brightness on, and
  // show it again once the live preview comes back.
  useEffect(() => {
    if (!isFrozen) {
      setIsOverlayHidden(false);
      return undefined;
    }

    if (!isOn) return undefined;

    const timer = setTimeout(
      () => setIsOverlayHidden(true),
      OVERLAY_HIDE_DELAY,
    );
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
      {/* Light the face with white bars along the screen edges. They are rendered
          below the other controls so they stay visible and remain usable. */}
      {isOn && !isOverlayHidden && !isLandscape && (
        <>
          {/* In portrait the light comes from above and below. */}
          <View pointerEvents="none" style={[styles.topBar, { width }]} />
          <View pointerEvents="none" style={[styles.bottomBar, { width }]} />
        </>
      )}

      {isOn && !isOverlayHidden && isLandscape && (
        <>
          {/* In landscape the light comes from the left and right edges. */}
          <View pointerEvents="none" style={[styles.leftBar, { height }]} />
          <View pointerEvents="none" style={[styles.rightBar, { height }]} />
        </>
      )}

      {/* Keep the button to the left of the eye; hide it with the other controls,
          while frozen with the flash off, or when there is no room for it. */}
      {controlsVisible && visible && !(isFrozen && !isOn) && (
        <TouchableOpacity
          style={[controlButtonStyle, styles.button]}
          onPress={toggleFlash}
          activeOpacity={0.7}
        >
          <FontAwesome
            name="flash"
            size={23}
            color={isOn ? "#FFD54A" : "white"}
          />
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Each bar is a direct absolute sibling with explicit dimensions, so it renders
  // reliably no matter how the camera affects the parent layout. The thickness is
  // fixed, while the length is supplied at render time from the screen dimensions.
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: FRAME_THICKNESS,
    backgroundColor: "white",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: FRAME_THICKNESS,
    backgroundColor: "white",
  },
  leftBar: {
    position: "absolute",
    left: 0,
    top: 0,
    width: FRAME_THICKNESS,
    backgroundColor: "white",
  },
  rightBar: {
    position: "absolute",
    right: 0,
    top: 0,
    width: FRAME_THICKNESS,
    backgroundColor: "white",
  },

  // Place the flash button just to the left of the eye button.
  button: {
    position: "absolute",
    top: TOP_ROW_TOP,
    right: FLASH_BUTTON_RIGHT,
    zIndex: 20,
    elevation: 20,
  },
});

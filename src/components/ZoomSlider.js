import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import OutlinedIcon from "./OutlinedIcon";
import { useSliderFade } from "../hooks/useSliderValue";

// --- Width tuning knobs -----------------------------------------------------
// The zoom slider is a right-aligned row: reset icon + gap + track. When the
// container is narrow (e.g. split-screen) the track shrinks first, and only once
// it reaches its floor does the right offset shrink too, so the control fits.
const TRACK_WIDTH = 140; // full-size track
const MIN_TRACK_WIDTH = TRACK_WIDTH / 2; // 70 - track stops shrinking at 50%
const ICON_WIDTH = 30; // reset icon width (styles.iconButton)
const WRAPPER_GAP = 12; // icon-to-track gap (styles.wrapper)
const RIGHT_OFFSET_MAX = 100; // full offset (styles.wrapper.right)
const RIGHT_OFFSET_MIN = 16; // closest the control may sit to the edge
const LEFT_MARGIN = 24; // breathing room on the left

const THUMB_SIZE = 24;

// Work out how wide the track may be, and how far from the right edge the whole
// control should sit, for a given container width.
export function getZoomLayout(containerWidth) {
  const fixed = ICON_WIDTH + WRAPPER_GAP + LEFT_MARGIN;
  const spaceForTrack = containerWidth - RIGHT_OFFSET_MAX - fixed;

  // Plenty of room: keep everything at full size.
  if (spaceForTrack >= TRACK_WIDTH) {
    return { trackWidth: TRACK_WIDTH, rightOffset: RIGHT_OFFSET_MAX };
  }

  // Shrink the track first, keeping the full offset.
  if (spaceForTrack >= MIN_TRACK_WIDTH) {
    return { trackWidth: spaceForTrack, rightOffset: RIGHT_OFFSET_MAX };
  }

  // Track is already at its floor: shrink the right offset instead.
  const overflow = MIN_TRACK_WIDTH - spaceForTrack;
  const rightOffset = Math.max(RIGHT_OFFSET_MIN, RIGHT_OFFSET_MAX - overflow);
  return { trackWidth: MIN_TRACK_WIDTH, rightOffset };
}

// Layout used before the container has been measured.
export const FULL_LAYOUT = {
  trackWidth: TRACK_WIDTH,
  rightOffset: RIGHT_OFFSET_MAX,
};

// FontAwesome 4.7 "search" glyph, converted to y-down screen coordinates.
const SEARCH_PATH =
  "M1152 704q0-185-131.5-316.5T704 256T387.5 387.5T256 704t131.5 316.5T704 1152t316.5-131.5T1152 704m512 832q0 52-38 90t-90 38q-54 0-90-38l-343-342q-179 124-399 124q-143 0-273.5-55.5t-225-150t-150-225t-55.5-273.5t55.5-273.5t150-225t225-150t273.5-55.5t273.5 55.5t225 150t150 225t55.5 273.5q0 220-124 399l343 343q37 37 37 90";
const SEARCH_VIEW_BOX = "0 0 1664 1664";

export default function ZoomSlider({
  minZoom,
  maxZoom,
  zoom,
  updateZoom,
  controlsVisible,
  activeSlider,
  trackWidth = TRACK_WIDTH,
  rightOffset = RIGHT_OFFSET_MAX,
}) {
  // Work out the thumb position from the current zoom, even when the track is resized.
  const maxTranslate = trackWidth - THUMB_SIZE;
  const range = maxZoom - minZoom;
  const translateX = useDerivedValue(() => {
    const progress = range > 0 ? (zoom.value - minZoom) / range : 0;
    return Math.max(0, Math.min(progress, 1)) * maxTranslate;
  });
  const fadeStyle = useSliderFade(controlsVisible, activeSlider, "zoom");

  // This remembers where the thumb was when a new drag started.
  const contextX = useSharedValue(0);

  // When the user begins dragging, save the current thumb position as the starting point.
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      contextX.value = translateX.value;
    })
    .onUpdate((event) => {
      // Add the user's finger movement to the position where the drag began.
      let nextX = contextX.value + event.translationX;

      // Keep the thumb inside the slider track.
      nextX = Math.max(0, Math.min(nextX, maxTranslate));

      // Convert the thumb position into a value between 0 and 1.
      const progress = nextX / maxTranslate;

      // Use that progress value to calculate the camera's current zoom level.
      updateZoom(minZoom + progress * range);
    })
    .onEnd(() => {
      // Send one final update so the camera receives the exact zoom value at the end.
      updateZoom(zoom.value, true);
    });

  // This style moves the thumb as the shared translateX value changes.
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // The fill grows from the left side to show how far the slider has moved.
  const fillStyle = useAnimatedStyle(() => ({
    width: translateX.value + THUMB_SIZE / 2,
  }));

  // Restore the slider to its starting position and apply the minimum zoom.
  const resetZoom = () => {
    updateZoom(minZoom, true);
  };

  // The gesture detector listens for the user's drag, while the animated views display it.
  return (
    <Animated.View
      style={[styles.wrapper, { right: rightOffset }, fadeStyle]}
      pointerEvents={controlsVisible ? "box-none" : "none"}
      importantForAccessibility={controlsVisible ? "auto" : "no-hide-descendants"}
    >
      {/* Reset the zoom back to its starting position when tapped. */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={resetZoom}
        hitSlop={8}
        activeOpacity={0.7}
      >
        <OutlinedIcon
          d={SEARCH_PATH}
          viewBox={SEARCH_VIEW_BOX}
          size={22}
          fill="white"
          stroke="rgba(0, 0, 0, 0.85)"
        />
      </TouchableOpacity>

      <View style={[styles.track, { width: trackWidth }]}>
        <Animated.View style={[styles.fill, fillStyle]} />
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </GestureDetector>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 33,
    right: RIGHT_OFFSET_MAX,
    flexDirection: "row",
    alignItems: "center",
    gap: WRAPPER_GAP,
    zIndex: 10,
  },

  // A reset icon with its own outline, so it stays visible on any background.
  iconButton: {
    width: ICON_WIDTH,
    height: ICON_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  track: {
    width: TRACK_WIDTH,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
  },
  fill: {
    position: "absolute",
    left: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.7)",
  },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.7)",
    left: 0,
  },
});

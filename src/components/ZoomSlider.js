import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import OutlinedIcon from './OutlinedIcon';

const TRACK_WIDTH = 140;
const THUMB_SIZE = 24;
const MAX_TRANSLATE = TRACK_WIDTH - THUMB_SIZE;

// FontAwesome 4.7 "search" glyph, converted to y-down screen coordinates.
const SEARCH_PATH =
  'M1152 704q0-185-131.5-316.5T704 256T387.5 387.5T256 704t131.5 316.5T704 1152t316.5-131.5T1152 704m512 832q0 52-38 90t-90 38q-54 0-90-38l-343-342q-179 124-399 124q-143 0-273.5-55.5t-225-150t-150-225t-55.5-273.5t55.5-273.5t150-225t225-150t273.5-55.5t273.5 55.5t225 150t150 225t55.5 273.5q0 220-124 399l343 343q37 37 37 90';
const SEARCH_VIEW_BOX = '0 0 1664 1664';

export default function ZoomSlider({ minZoom, maxZoom, onZoomChange, resetKey }) {
  // This shared value stores the thumb's horizontal position on the slider.
  const translateX = useSharedValue(0);

  // This remembers where the thumb was when a new drag started.
  const contextX = useSharedValue(0);

  // This helps avoid sending zoom updates to the camera too frequently.
  const lastUpdate = useSharedValue(0);

  // Reset the slider when the selcted camera lens changes.
  useEffect(() => {
    translateX.value = 0;
    contextX.value = 0;
    lastUpdate.value = 0;

  }, [resetKey]);

  // The zoom range is the difference between the smallest and largest zoom values.
  const range = maxZoom - minZoom;

  // When the user begins dragging, save the current thumb position as the starting point.
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      contextX.value = translateX.value;
    })
    .onUpdate((event) => {
      // Add the user's finger movement to the position where the drag began.
      let nextX = contextX.value + event.translationX;

      // Keep the thumb inside the slider track.
      nextX = Math.max(0, Math.min(nextX, MAX_TRANSLATE));
      translateX.value = nextX;

      // Convert the thumb position into a value between 0 and 1.
      const progress = nextX / MAX_TRANSLATE;

      // Use that progress value to calculate the camera's current zoom level.
      const currentZoom = minZoom + progress * range;

      // Only update the camera every 150 milliseconds while the finger is moving.
      const now = Date.now();
      if (now - lastUpdate.value > 150) {
        lastUpdate.value = now;
        runOnJS(onZoomChange)(currentZoom);
      }
    })
    .onEnd(() => {
      // Send one final update so the camera receives the exact zoom value at the end.
      const progress = translateX.value / MAX_TRANSLATE;
      const finalZoom = minZoom + progress * range;
      runOnJS(onZoomChange)(finalZoom);
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
    translateX.value = 0;
    contextX.value = 0;
    lastUpdate.value = 0;
    onZoomChange(minZoom);
  };

  // The gesture detector listens for the user's drag, while the animated views display it.
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
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

      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 33,
    right: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },

  // A reset icon with its own outline, so it stays visible on any background.
  iconButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    width: TRACK_WIDTH,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.7)',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.7)',
    left: 0,
  },
});
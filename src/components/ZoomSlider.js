import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const TRACK_WIDTH = 180;
const THUMB_SIZE = 24;
const MAX_TRANSLATE = TRACK_WIDTH - THUMB_SIZE;

export default function ZoomSlider({ minZoom, maxZoom, onZoomChange }) {
  // This shared value stores the thumb's horizontal position on the slider.
  const translateX = useSharedValue(0);

  // This remembers where the thumb was when a new drag started.
  const contextX = useSharedValue(0);

  // This helps avoid sending zoom updates to the camera too frequently.
  const lastUpdate = useSharedValue(0);

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

  // The gesture detector listens for the user's drag, while the animated views display it.
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
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
    bottom: 50,
    left: 0,
    right: 50,
    alignItems: 'center',
    zIndex: 10,
  },
  track: {
    width: TRACK_WIDTH,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: 'white',
    left: 0,
  },
});
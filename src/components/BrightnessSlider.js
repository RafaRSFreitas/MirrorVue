import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Brightness from 'expo-brightness';

const TRACK_HEIGHT = 160;
const THUMB_SIZE = 24;
const MAX_TRANSLATE = TRACK_HEIGHT - THUMB_SIZE;

export default function BrightnessSlider() {
  // This shared value stores the thumb's vertical position, measured down from the top of the track.
  const translateY = useSharedValue(0);

  // This remembers where the thumb was when a new drag started.
  const contextY = useSharedValue(0);

  // This helps avoid sending brightness updates too frequently.
  const lastUpdate = useSharedValue(0);

  useEffect(() => {
    // Read the screen's current brightness so the slider starts in the right position.
    Brightness.getBrightnessAsync().then((currentBrightness) => {
      translateY.value = MAX_TRANSLATE * (1 - currentBrightness);
    });
  }, []);

  // When the user begins dragging, save the current thumb position as the starting point.
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      contextY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Add the user's finger movement to the position where the drag began.
      let nextY = contextY.value + event.translationY;

      // Keep the thumb inside the slider track.
      nextY = Math.max(0, Math.min(nextY, MAX_TRANSLATE));
      translateY.value = nextY;

      // The thumb's position is measured from the top, but dragging up should mean brighter,
      // so brightness is the opposite of how far down the thumb has moved.
      const brightness = 1 - nextY / MAX_TRANSLATE;

      // Only update the screen brightness every 150 milliseconds while the finger is moving.
      const now = Date.now();
      if (now - lastUpdate.value > 150) {
        lastUpdate.value = now;
        runOnJS(Brightness.setBrightnessAsync)(brightness);
      }
    })
    .onEnd(() => {
      // Send one final update so brightness matches exactly where the thumb was released.
      const brightness = 1 - translateY.value / MAX_TRANSLATE;
      runOnJS(Brightness.setBrightnessAsync)(brightness);
    });

  // This style moves the thumb as the shared translateY value changes.
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // The fill grows upward from the bottom of the track as brightness increases.
  const fillStyle = useAnimatedStyle(() => ({
    height: (MAX_TRANSLATE - translateY.value) + THUMB_SIZE / 2,
  }));

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
    right: 40,
    top: '72%',
    marginTop: -(TRACK_HEIGHT / 2),
    alignItems: 'center',
  },
  track: {
    width: 6,
    height: TRACK_HEIGHT,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    width: 6,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: 'white',
    left: -(THUMB_SIZE - 6) / 2,
    top: 0,
  },
});
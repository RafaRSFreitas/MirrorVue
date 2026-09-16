import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';
import OutlinedIcon from './OutlinedIcon';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Brightness from 'expo-brightness';

const TRACK_HEIGHT = 120;
const THUMB_SIZE = 24;
const MAX_TRANSLATE = TRACK_HEIGHT - THUMB_SIZE;

// FontAwesome 4.7 "sun-o" glyph, converted to y-down screen coordinates.
const SUN_PATH =
  'M1440 896q0-117-45.5-223.5t-123-184t-184-123T864 320t-223.5 45.5t-184 123t-123 184t-45.5 223.5t45.5 223.5t123 184t184 123t223.5 45.5t223.5-45.5t184-123t123-184t45.5-223.5m276 277q-4 15-20 20l-292 96v306q0 16-13 26q-15 10-29 4l-292-94l-180 248q-10 13-26 13t-26-13l-180-248l-292 94q-14 6-29-4q-13-10-13-26v-306l-292-96q-16-5-20-20q-5-17 4-29l180-248L16 648q-9-13-4-29q4-15 20-20l292-96V197q0-16 13-26q15-10 29-4l292 94L838 13q9-12 26-12t26 12l180 248l292-94q14-6 29 4q13 10 13 26v306l292 96q16 5 20 20q5 16-4 29l-180 248l180 248q9 12 4 29';
const SUN_VIEW_BOX = '0 0 1728 1792';

export default function BrightnessSlider({ flashOn }) {
  // This shared value stores the thumb's vertical position, measured down from the top of the track.
  const translateY = useSharedValue(0);

  // This remembers where the thumb was when a new drag started.
  const contextY = useSharedValue(0);

  // This helps avoid sending brightness updates too frequently.
  const lastUpdate = useSharedValue(0);

  // Remember the brightness level the slider started at, so it can be restored.
  const initialBrightness = useRef(0.5);

  useEffect(() => {
    // Read the screen's current brightness so the slider starts in the right position.
    Brightness.getBrightnessAsync().then((currentBrightness) => {
      initialBrightness.current = currentBrightness;
      translateY.value = MAX_TRANSLATE * (1 - currentBrightness);
    });
  }, []);

  // Follow the brightness that the flash applies: maximum while it is on, and the
  // restored level once it turns off again.
  useEffect(() => {
    if (flashOn) {
      // The maximum brightness sits at the top of the track.
      translateY.value = 0;
      return undefined;
    }

    // Wait a moment so the flash can restore the previous brightness first.
    const timer = setTimeout(() => {
      Brightness.getBrightnessAsync().then((currentBrightness) => {
        translateY.value = MAX_TRANSLATE * (1 - currentBrightness);
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [flashOn]);

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

  // Restore the slider to its initial level and apply that brightness again.
  const resetBrightness = () => {
    const initialLevel = initialBrightness.current;
    translateY.value = MAX_TRANSLATE * (1 - initialLevel);
    contextY.value = translateY.value;
    Brightness.setBrightnessAsync(initialLevel);
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {/* Reset the brightness back to its starting level when tapped. */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={resetBrightness}
        hitSlop={8}
        activeOpacity={0.7}
      >
        <OutlinedIcon
          d={SUN_PATH}
          viewBox={SUN_VIEW_BOX}
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
    right: 40,
    bottom: 100,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
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
    width: 6,
    height: TRACK_HEIGHT,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.7)',
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    width: 6,
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
    left: -(THUMB_SIZE - 6) / 2,
    top: 0,
  },
});
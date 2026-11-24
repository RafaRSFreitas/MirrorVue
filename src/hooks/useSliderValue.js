import { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SLIDER_UPDATE_INTERVAL_MS } from "../constants";

// The thumb and the mirror gestures share one value. Move the thumb every frame,
// but give the camera or screen time to apply each update while the fingers move.
export function useSliderValue(initialValue, onChange) {
  const value = useSharedValue(initialValue);
  const lastUpdate = useSharedValue(0);

  const updateValue = (nextValue, finished = false) => {
    "worklet";
    value.value = nextValue;
    const now = Date.now();
    if (finished || now - lastUpdate.value >= SLIDER_UPDATE_INTERVAL_MS) {
      lastUpdate.value = now;
      runOnJS(onChange)(nextValue);
    }
  };

  return [value, updateValue];
}

// Fade the whole control, including its reset icon, when a mirror gesture uses it.
export function useSliderFade(controlsVisible, activeSlider, name) {
  return useAnimatedStyle(() => ({
    opacity: withTiming(controlsVisible || activeSlider.value === name ? 1 : 0, {
      duration: 160,
    }),
  }));
}

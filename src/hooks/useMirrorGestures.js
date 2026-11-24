import { Gesture } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";

// Ignore small movements while the user is still placing the second finger.
const MIN_MOVEMENT = 8;

export default function useMirrorGestures({
  enabled, height, minZoom, maxZoom, zoom, updateZoom, brightness, updateBrightness, onDoubleTap,
}) {
  const start = useSharedValue(null);
  const activeSlider = useSharedValue(null);

  const doubleTap = Gesture.Tap().numberOfTaps(2).maxDistance(MIN_MOVEMENT)
    .onTouchesDown((event, manager) => {
      if (event.numberOfTouches > 1) manager.fail();
    })
    .onEnd((_event, success) => {
      if (success) runOnJS(onDoubleTap)();
    });

  const twoFingers = Gesture.Manual().enabled(enabled)
    .onTouchesDown((event, manager) => {
      if (event.numberOfTouches > 2) {
        manager.fail();
        return;
      }
      if (event.numberOfTouches !== 2) return;

      const [a, b] = event.allTouches;
      start.value = {
        distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
        centerX: (a.x + b.x) / 2,
        firstId: a.id,
        firstY: a.y,
        secondY: b.y,
        zoom: zoom.value,
        brightness: brightness.value,
      };
    })
    .onTouchesMove((event, manager) => {
      if (!start.value || event.allTouches.length !== 2) return;

      const [a, b] = event.allTouches;
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const spread = Math.abs(distance - start.value.distance);
      const dx = (a.x + b.x) / 2 - start.value.centerX;
      const firstDy = a.y - (a.id === start.value.firstId ? start.value.firstY : start.value.secondY);
      const secondDy = b.y - (b.id === start.value.firstId ? start.value.firstY : start.value.secondY);
      const dy = (firstDy + secondDy) / 2;

      // A pinch changes the distance between the fingers. A vertical swipe moves
      // their center instead. Keep the first clear choice until a finger lifts.
      if (!activeSlider.value) {
        const together = firstDy * secondDy > 0 ? Math.min(Math.abs(firstDy), Math.abs(secondDy)) : 0;
        if (spread >= MIN_MOVEMENT && spread > together) {
          activeSlider.value = "zoom";
        } else if (together >= MIN_MOVEMENT && together >= spread && Math.abs(dy) > Math.abs(dx)) {
          activeSlider.value = "brightness";
        } else {
          return;
        }
        manager.activate();
      }

      if (activeSlider.value === "zoom") {
        const nextZoom = start.value.zoom * distance / start.value.distance;
        updateZoom(Math.max(minZoom, Math.min(nextZoom, maxZoom)));
      } else {
        // Half the preview height covers the full brightness range in either orientation.
        const nextBrightness = start.value.brightness - dy / (height / 2);
        updateBrightness(Math.max(0, Math.min(nextBrightness, 1)));
      }
    })
    .onTouchesUp((_event, manager) => {
      if (activeSlider.value) manager.end();
      else manager.fail();
    })
    .onFinalize(() => {
      // Apply the last position even if the gesture was interrupted between updates.
      if (activeSlider.value === "zoom") updateZoom(zoom.value, true);
      if (activeSlider.value === "brightness") updateBrightness(brightness.value, true);
      activeSlider.value = null;
      start.value = null;
    });

  return { gesture: Gesture.Race(twoFingers, doubleTap), activeSlider };
}

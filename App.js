import React, { useEffect } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from 'expo-keep-awake';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CameraView from './src/components/CameraView';

// Store the key used by Settings.js for the Keep screen awake preference.
const KEEP_SCREEN_AWAKE_KEY = 'keepScreenAwake';

export default function App() {
  // Apply the saved Keep screen awake preference when the app is active.
  const applyKeepAwakeSetting = async () => {
    try {
      const savedValue = await AsyncStorage.getItem(KEEP_SCREEN_AWAKE_KEY);

      // Keep the screen awake by default unless the user explicitly disabled it.
      const keepScreenAwake = savedValue === null || savedValue === 'true';

      if (keepScreenAwake) {
        await activateKeepAwakeAsync();
      } else {
        await deactivateKeepAwake();
      }
    } catch (error) {
      // Use the required default behavior if the saved preference cannot be read.
      await activateKeepAwakeAsync();
    }
  };

  // Keep the screen awake according to the user's Settings preference while active,
  // and always release it when the app moves into the background.
  useEffect(() => {
    // Apply the saved preference when the app first starts.
    applyKeepAwakeSetting();

    // Reapply the saved preference whenever the app returns to the foreground.
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        applyKeepAwakeSetting();
      } else {
        // Always allow the screen to sleep normally while the app is backgrounded.
        deactivateKeepAwake();
      }
    });

    return () => {
      subscription.remove();
      deactivateKeepAwake();
    };
  }, []);

  return (
    /* This wrapper allows gesture-based components, such as the zoom slider, to work. */
    <GestureHandlerRootView style={styles.container}>
      <SystemBars hidden={{ statusBar: true, navigationBar: true }} />

      {/* The inner view fills the available screen space and contains the camera. */}
      <View style={styles.container}>
        <CameraView />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    // A flex value of 1 makes this container occupy the whole screen.
    flex: 1,
  },
});


import React, { useEffect } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import CameraView from './src/components/CameraView';

export default function App() {
  // Run this setup when the app starts so the interface stays in portrait mode.
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  // Keep the screen on while the app is in the foreground, and let it sleep normally otherwise.
  useEffect(() => {
    // The app opens in the foreground, so keep the screen on right away.
    activateKeepAwakeAsync();

    // Toggle the keep-awake lock whenever the app moves between the foreground and background.
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        activateKeepAwakeAsync();
      } else {
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
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CameraView from './src/components/CameraView';

export default function App() {
  // Run this setup when the app starts so the interface stays in portrait mode.
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
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
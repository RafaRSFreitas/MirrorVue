import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CameraView from './src/components/CameraView';
import { SettingsProvider } from './src/SettingsContext';

export default function App() {
  return (
    /* This wrapper allows gesture-based components, such as the zoom slider, to work. */
    <GestureHandlerRootView style={styles.container}>
      <SystemBars hidden={{ statusBar: true, navigationBar: true }} />

      {/* Loads, saves and applies the user's Settings (rotation and keep screen awake). */}
      <SettingsProvider>
        {/* The inner view fills the available screen space and contains the camera. */}
        <View style={styles.container}>
          <CameraView />
        </View>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    // A flex value of 1 makes this container occupy the whole screen.
    flex: 1,
  },
});
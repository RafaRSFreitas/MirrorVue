import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import * as ScreenOrientation from 'expo-screen-orientation';
import CameraView from './src/components/CameraView';

export default function App() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);
  
  return (
    <View style={styles.container}>
      <CameraView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
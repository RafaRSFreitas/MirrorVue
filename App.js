import React from 'react';
import { View, StyleSheet } from 'react-native';
import CameraView from './src/components/CameraView';

export default function App() {
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
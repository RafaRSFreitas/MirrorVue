import React from "react";
import { StyleSheet, Text } from "react-native";
import appConfig from '../../app.json';
import ModalShell from "./ModalShell";

const APP_VERSION = appConfig.expo.version;

export default function About({ visible, onClose }) {
  return (
    <ModalShell visible={visible} title="MirrorVue" onClose={onClose}>
      {/* Display the current application version. */}
      <Text style={styles.text}>Version {APP_VERSION}</Text>

      {/* Identify the developer responsible for the application. */}
      <Text style={styles.text}>Developer: Rafael R. S. Freitas</Text>

      {/* Briefly describe the purpose of the application. */}
      <Text style={styles.description}>
        MirrorVue turns your Android device into a fullscreen digital mirror
        using the front-facing camera.
      </Text>

      {/* Explain the privacy behavior required by the product requirements. */}
      <Text style={styles.description}>
        Privacy: the camera preview is displayed locally. MirrorVue does not
        upload or transmit your image or video.
      </Text>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  // Style the version and developer information shown on the About panel.
  text: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },

  // Keep the description and privacy notice readable while remaining compact.
  description: {
    color: "white",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
});

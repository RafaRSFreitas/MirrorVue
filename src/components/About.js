import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';

export default function About({ visible, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={styles.panel}
          onStartShouldSetResponder={() => true}
        >
          {/* Close the About panel and return to the mirror preview. */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Display the application name required by the About screen. */}
            <Text style={styles.title}>MirrorVue</Text>

          {/* Display the current application version from package.json. */}
          <Text style={styles.text}>Version 0.6.0</Text>

          {/* Identify the developer responsible for the application. */}
          <Text style={styles.text}>Developer: Rafael R. S. Freitas</Text>

          {/* Briefly describe the purpose of the application. */}
          <Text style={styles.description}>
            MirrorVue turns your Android device into a fullscreen
            digital mirror using the front-facing camera.
          </Text>

          {/* Explain the privacy behavior required by the product requirements. */}
            <Text style={styles.description}>
              Privacy: the camera preview is displayed locally. MirrorVue
              does not upload or transmit your image or video.
            </Text>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Cover the entire preview and center the About card in both directions.
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Keep the About content inside a centered readable card.
  panel: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(0,0,0,0.88)',
    borderRadius: 12,
    padding: 24,
    position: 'relative',
    maxHeight: '90%',
    flexShrink: 1,
  },

  // Let About content shrink to the available height and scroll when needed.
  scrollView: {
    flexShrink: 1,
  },

  // Keep the final About text clear of the panel edge when the body is scrolled.
  scrollContent: {
    paddingBottom: 8,
  },

  // Place the close button in the upper-right corner of the About panel.
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
    elevation: 30,
  },

  // Use a simple close symbol rather than adding another icon dependency.
  closeText: {
    color: 'white',
    fontSize: 22,
  },

  // Make the application name clearly visible at the top of the About panel.
  title: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingRight: 40,
  },

  // Style the version and developer information shown on the About panel.
  text: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },

  // Keep the description and privacy notice readable while remaining compact.
  description: {
    color: 'white',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
});

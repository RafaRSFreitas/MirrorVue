import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';

// Shared modal scaffolding used by the About, Settings, and Donation panels:
// a full-screen dimmed overlay, a centered card with a fixed title, a close
// button in the corner, and a scrollable body for the panel's own content.
export default function ModalShell({
  visible,
  title,
  onClose,
  children,
  panelStyle,
  closeTextSize = 22,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={styles.overlay}
        onTouchEnd={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <View style={[styles.panel, panelStyle]}>
          {/* Display the fixed panel heading. */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>

          {/* Close the panel and return to the mirror preview. */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.closeText, { fontSize: closeTextSize }]}>✕</Text>
          </TouchableOpacity>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Cover the entire preview and center the card in both directions.
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Receive dismissal taps only when the touch target is the overlay itself.
  // (The panel is a sibling above it, so card touches never reach it.)

  // Keep the panel content inside a centered readable card.
  panel: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(0,0,0,0.88)',
    borderRadius: 12,
    padding: 24,
    position: 'relative',
    maxHeight: '90%',
    flexShrink: 1,
    zIndex: 1,
    elevation: 1,
  },

  // Keep the card title above the scrollable content.
  header: {
    marginBottom: 8,
    paddingRight: 48,
  },

  // Let panel content shrink to the available height and scroll when needed.
  scrollView: {
    flexShrink: 1,
  },

  // Keep the content clear of the fixed header and the panel edge.
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 8,
  },

  // Place the close button in the upper-right corner of the panel.
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
  },

  // Make the panel heading clearly visible.
  title: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
});
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Switch,
  AppState,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from 'expo-screen-orientation';
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from 'expo-keep-awake';

// These keys are used to save the Settings values between app sessions.
const SETTINGS_KEYS = {
  allowLandscape: 'allowLandscapeMode',
  keepScreenAwake: 'keepScreenAwake',
};

// These are the default values.
const DEFAULT_SETTINGS = {
  allowLandscape: false,
  keepScreenAwake: true,
};

export default function Settings({ visible, onClose }) {
  // Track whether landscape mode is enabled.
  const [allowLandscape, setAllowLandscape] = useState(
    DEFAULT_SETTINGS.allowLandscape
  );

  // Track whether the screen should remain awake while the app is in the foreground.
  const [keepScreenAwake, setKeepScreenAwake] = useState(
    DEFAULT_SETTINGS.keepScreenAwake
  );

  // Load all saved Settings once the component is mounted.
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedAllowLandscape = await AsyncStorage.getItem(
          SETTINGS_KEYS.allowLandscape
        );

        const savedKeepScreenAwake = await AsyncStorage.getItem(
          SETTINGS_KEYS.keepScreenAwake
        );

        setAllowLandscape(
          savedAllowLandscape === null
            ? DEFAULT_SETTINGS.allowLandscape
            : savedAllowLandscape === 'true'
        );

        setKeepScreenAwake(
          savedKeepScreenAwake === null
            ? DEFAULT_SETTINGS.keepScreenAwake
            : savedKeepScreenAwake === 'true'
        );
      } catch (error) {
        // Keep the default Settings if stored values cannot be loaded.
      }
    };

    loadSettings();
  }, []);

  // Apply the correct screen orientation whenever landscape mode changes.
  useEffect(() => {
    const startOrientationHandling = async () => {
      if (!allowLandscape) {
        // Keep the application locked to portrait when landscape mode is disabled.
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        return;
      }

      try {
        // Allow the operating system to rotate through portrait and landscape.
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL);
      } catch (error) {
        // Fall back to portrait if the orientation policy cannot be unlocked.
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      }
    };

    startOrientationHandling();

  }, [allowLandscape]);

  // Stop the orientation sensor while the app is backgrounded to avoid unnecessary sensor use.
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState) => {
        if (nextAppState === 'active' && allowLandscape) {
          // Reapply the all-orientations policy after returning to the foreground.
          ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL);
        }
      }
    );

    return () => subscription.remove();
  }, [allowLandscape]);

  // Save and immediately apply the landscape-mode preference.
  const toggleLandscape = async (value) => {
    setAllowLandscape(value);

    await AsyncStorage.setItem(
      SETTINGS_KEYS.allowLandscape,
      String(value)
    );
  };

  // Save and immediately apply the keep-screen-awake preference.
  const toggleKeepScreenAwake = async (value) => {
    setKeepScreenAwake(value);

    await AsyncStorage.setItem(
      SETTINGS_KEYS.keepScreenAwake,
      String(value)
    );

    if (value) {
      // Keep the screen awake immediately after the user enables the setting.
      await activateKeepAwakeAsync();
    } else {
      // Allow normal screen timeout immediately after the user disables the setting.
      await deactivateKeepAwake();
    }
  };

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
        <View style={styles.panel}>
          {/* Display the fixed Settings heading. */}
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
          </View>

          {/* Close the Settings panel and return to the mirror preview. */}
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
            {/* Allow the user to enable portrait and landscape orientation changes. */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Allow landscape mode</Text>
                <Text style={styles.settingDescription}>
                  Allow the interface to rotate when the device is turned.
                </Text>
              </View>

              <Switch
                value={allowLandscape}
                onValueChange={toggleLandscape}
              />
            </View>

            {/* Allow the user to disable the keep-screen-awake behavior. */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Keep screen awake</Text>
                <Text style={styles.settingDescription}>
                  Prevent the screen from dimming or sleeping while MirrorVue
                  is in the foreground.
                </Text>
              </View>

              <Switch
                value={keepScreenAwake}
                onValueChange={toggleKeepScreenAwake}
              />
            </View>

            
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Cover the entire mirror preview while the Settings panel is open.
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Keep the Settings content in a large readable panel over the mirror.
  panel: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: 'rgba(0,0,0,0.88)',
    borderRadius: 16,
    padding: 24,
    position: 'relative',
    flexShrink: 1,
    zIndex: 1,
    elevation: 1,
  },

  // Keep the card title above the scrollable content.
  header: {
    marginBottom: 8,
    paddingRight: 48,
  },

  // Let the settings body shrink to the available height and scroll when needed.
  scrollView: {
    flexShrink: 1,
  },

  // Keep the content clear of the fixed header and the panel edge.
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 8,
  },

  // Place the close button in the upper-right corner of the Settings panel.
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

  // Make the Settings heading clearly visible.
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },

  // Lay out each setting as a label on the left and a switch on the right.
  settingRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 12,
  },

  // Give the text section enough room beside the switch.
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },

  // Display the name of each setting clearly.
  settingTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },

  // Explain briefly what each setting controls.
  settingDescription: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },

  // Separate future placeholder settings from functional settings.
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },

  // Display future settings in a muted disabled state.
  placeholderRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Explain that these entries are not functional yet.
  placeholderText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    lineHeight: 18,
  },
});
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Modal,
  Switch,
  TextInput,
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
  autoHideControls: 'autoHideControls',
  autoHideTimeout: 'autoHideTimeout',
};

// These are the default values required by the product requirements.
const DEFAULT_SETTINGS = {
  allowLandscape: false,
  keepScreenAwake: true,
  autoHideControls: false,
  autoHideTimeout: '10',
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

  // Track whether automatic control hiding is enabled.
  const [autoHideControls, setAutoHideControls] = useState(
    DEFAULT_SETTINGS.autoHideControls
  );

  // Store the auto-hide timeout as text so the user can edit the value directly.
  const [autoHideTimeout, setAutoHideTimeout] = useState(
    DEFAULT_SETTINGS.autoHideTimeout
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

        const savedAutoHideControls = await AsyncStorage.getItem(
          SETTINGS_KEYS.autoHideControls
        );

        const savedAutoHideTimeout = await AsyncStorage.getItem(
          SETTINGS_KEYS.autoHideTimeout
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

        setAutoHideControls(
          savedAutoHideControls === null
            ? DEFAULT_SETTINGS.autoHideControls
            : savedAutoHideControls === 'true'
        );

        setAutoHideTimeout(
          savedAutoHideTimeout ?? DEFAULT_SETTINGS.autoHideTimeout
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

  // Save whether automatic control hiding is enabled.
  const toggleAutoHideControls = async (value) => {
    setAutoHideControls(value);

    await AsyncStorage.setItem(
      SETTINGS_KEYS.autoHideControls,
      String(value)
    );
  };

  // Save the auto-hide timeout after making sure it stays between 5 and 99 seconds.
  const saveAutoHideTimeout = async () => {
    const numericValue = Number.parseInt(autoHideTimeout, 10);

    // Use the default timeout when the entered value is not a valid number.
    if (Number.isNaN(numericValue)) {
      setAutoHideTimeout(DEFAULT_SETTINGS.autoHideTimeout);
      await AsyncStorage.setItem(
        SETTINGS_KEYS.autoHideTimeout,
        DEFAULT_SETTINGS.autoHideTimeout
      );
      return;
    }

    // Limit the value to the required 5-to-99 second range.
    const clampedValue = Math.min(99, Math.max(5, numericValue));
    const timeoutValue = String(clampedValue);

    setAutoHideTimeout(timeoutValue);

    await AsyncStorage.setItem(
      SETTINGS_KEYS.autoHideTimeout,
      timeoutValue
    );
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
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={styles.panel}
          onStartShouldSetResponder={() => true}
        >
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
            {/* Display the Settings heading. */}
            <Text style={styles.title}>Settings</Text>

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

          {/* Enable the automatic control-hiding preference. */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Auto-hide controls</Text>
              <Text style={styles.settingDescription}>
                Hide the mirror controls after a period of inactivity.
              </Text>
            </View>

            <Switch
              value={autoHideControls}
              onValueChange={toggleAutoHideControls}
            />
          </View>

          {/* Only show the timeout control when auto-hide has been enabled. */}
          {autoHideControls && (
            <View style={styles.timeoutContainer}>
              <Text style={styles.timeoutLabel}>
                Auto-hide timeout (5–99 seconds)
              </Text>

              <TextInput
                value={autoHideTimeout}
                onChangeText={(value) => {
                  // Keep only numeric characters in the timeout input.
                  setAutoHideTimeout(value.replace(/[^0-9]/g, ''));
                }}
                onBlur={saveAutoHideTimeout}
                onSubmitEditing={saveAutoHideTimeout}
                keyboardType="number-pad"
                maxLength={2}
                style={styles.timeoutInput}
              />

              <Text style={styles.timeoutHint}>
                To be implemented soon                
              </Text>
            </View>
          )}

          {/* Show future settings as disabled placeholders. */}
          <Text style={styles.sectionTitle}>Other settings</Text>

          <View style={styles.placeholderRow}>
            <Text style={styles.settingTitle}>
              Keep specific controls always visible
            </Text>

            <Switch
              value={false}
              disabled={true}
            />
          </View>

            <Text style={styles.placeholderText}>
              Additional control-visibility options are reserved for future
              versions.
            </Text>
          </ScrollView>
        </View>
      </Pressable>
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
  },

  // Let the settings body shrink to the available height and scroll when needed.
  scrollView: {
    flexShrink: 1,
  },

  // Keep the last setting clear of the panel edge when the body is scrolled.
  scrollContent: {
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
    marginBottom: 24,
    paddingRight: 40,
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

  // Keep the timeout setting visually grouped below Auto-hide controls.
  timeoutContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },

  // Display the timeout label above the input.
  timeoutLabel: {
    color: 'white',
    fontSize: 15,
    marginBottom: 8,
  },

  // Give the timeout input a clear editable appearance.
  timeoutInput: {
    width: 90,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: 'white',
    fontSize: 18,
    paddingHorizontal: 12,
  },

  // Explain the current scope of the timeout setting.
  timeoutHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
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
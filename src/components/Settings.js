import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Switch,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from 'expo-screen-orientation';
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from 'expo-keep-awake';
import ModalShell from './ModalShell';
import { STORAGE_KEYS } from '../storageKeys';

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
          STORAGE_KEYS.allowLandscapeMode
        );

        const savedKeepScreenAwake = await AsyncStorage.getItem(
          STORAGE_KEYS.keepScreenAwake
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
      STORAGE_KEYS.allowLandscapeMode,
      String(value)
    );
  };

  // Save and immediately apply the keep-screen-awake preference.
  const toggleKeepScreenAwake = async (value) => {
    setKeepScreenAwake(value);

    await AsyncStorage.setItem(
      STORAGE_KEYS.keepScreenAwake,
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
    <ModalShell
      visible={visible}
      title="Settings"
      onClose={onClose}
      panelStyle={styles.panel}
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
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  // Keep the Settings content in a large readable panel over the mirror.
  panel: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
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
});
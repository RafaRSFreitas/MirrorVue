import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { DEFAULT_SETTINGS, loadSetting, saveSetting } from './storage';

const SettingsContext = createContext(null);

// Owns the user's Settings for the whole app: it loads them at startup, saves every change,
// and applies the ones that change how the phone behaves (rotation and screen timeout).
// It lives at the top of the app, so these rules keep working even when the Settings
// panel (or the whole control menu) is not on screen.
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // False until the saved values have been read, so the defaults are never applied by mistake.
  const [isLoaded, setIsLoaded] = useState(false);

  const { allowLandscapeMode, keepScreenAwake } = settings;

  // Load every saved setting once, when the app starts.
  useEffect(() => {
    const loadAllSettings = async () => {
      const entries = await Promise.all(
        Object.keys(DEFAULT_SETTINGS).map(async (name) => [
          name,
          await loadSetting(name, DEFAULT_SETTINGS[name]),
        ])
      );

      setSettings(Object.fromEntries(entries));
      setIsLoaded(true);
    };

    loadAllSettings();
  }, []);

  // Lock the screen to portrait, or allow rotation when landscape mode is on. The rule is
  // applied again every time the app returns to the foreground.
  useEffect(() => {
    if (!isLoaded) return undefined;

    const applyOrientation = async () => {
      const wantedLock = allowLandscapeMode
        ? ScreenOrientation.OrientationLock.ALL
        : ScreenOrientation.OrientationLock.PORTRAIT_UP;

      try {
        await ScreenOrientation.lockAsync(wantedLock);
      } catch (error) {
        // If the wanted rule cannot be applied, stay safely in portrait.
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(
          () => {}
        );
      }
    };

    applyOrientation();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') applyOrientation();
    });

    return () => subscription.remove();
  }, [isLoaded, allowLandscapeMode]);

  // Keep the screen awake while the app is in the foreground, unless the user turned this off.
  // It is always released when the app goes to the background.
  useEffect(() => {
    if (!isLoaded) return undefined;

    const applyKeepAwake = () => {
      if (keepScreenAwake) {
        activateKeepAwakeAsync().catch(() => {});
      } else {
        deactivateKeepAwake().catch(() => {});
      }
    };

    applyKeepAwake();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        applyKeepAwake();
      } else {
        deactivateKeepAwake().catch(() => {});
      }
    });

    return () => {
      subscription.remove();
      deactivateKeepAwake().catch(() => {});
    };
  }, [isLoaded, keepScreenAwake]);

  // Change one setting: the screen reacts right away and the value is saved for next time.
  const updateSetting = (name, value) => {
    setSettings((currentSettings) => ({ ...currentSettings, [name]: value }));
    saveSetting(name, value);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

// Read the settings from any component inside SettingsProvider.
export function useSettings() {
  const context = useContext(SettingsContext);

  if (context === null) {
    throw new Error('useSettings must be used inside a SettingsProvider.');
  }

  return context;
}
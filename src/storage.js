import AsyncStorage from '@react-native-async-storage/async-storage';

// Every value the app remembers between launches. Each name is also the AsyncStorage key,
// so renaming one here updates every reader and writer at once.
export const STORAGE_KEYS = {
  selectedLensId: 'selectedLensId',
  keepScreenAwake: 'keepScreenAwake',
  allowLandscapeMode: 'allowLandscapeMode',
};

// The value of each Settings option before the user has changed anything.
// The names must match the ones in STORAGE_KEYS.
export const DEFAULT_SETTINGS = {
  keepScreenAwake: true,
  allowLandscapeMode: false,
};

// Read one saved value. AsyncStorage only stores text, so when the default is a boolean
// the saved text 'true' / 'false' is turned back into a boolean. If nothing was saved
// yet, or the read fails, the default is returned, so the app always has a usable value.
export async function loadSetting(key, defaultValue) {
  try {
    const savedValue = await AsyncStorage.getItem(key);

    if (savedValue === null) return defaultValue;

    return typeof defaultValue === 'boolean' ? savedValue === 'true' : savedValue;
  } catch (error) {
    return defaultValue;
  }
}

// Save one value for the next launch. A failed save is not fatal: the app keeps working
// and the value is simply not remembered.
export async function saveSetting(key, value) {
  try {
    await AsyncStorage.setItem(key, String(value));
  } catch (error) {
    // Nothing else to do here.
  }
}
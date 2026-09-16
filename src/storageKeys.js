// Storage keys shared by every screen that reads or writes the same persisted value,
// so a single rename updates all readers and writers together.
export const STORAGE_KEYS = {
  selectedLensId: 'selectedLensId',
  keepScreenAwake: 'keepScreenAwake',
  allowLandscapeMode: 'allowLandscapeMode',
};
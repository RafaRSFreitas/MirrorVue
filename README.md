# Mirror Vue

A lightweight digital mirror app for Android. Turn your device's front camera into a real-time mirror with smooth zoom controls — no recording, no ads, no internet required.

## Features

### Implemented

- **Fullscreen mirror view** — Front camera feed fills the screen in immersive mode (no status/navigation bars), with the image horizontally flipped like a real mirror. Portrait orientation is locked.
- **Camera permission handling** — Automatically requests camera permission on first launch. If denied, the screen remains blank until permission is granted.
- **Zoom control** — A smooth, animated horizontal slider at the bottom of the screen lets you zoom from 1x up to 4x (or the device's maximum, whichever is lower). Uses gesture-based panning with 60fps Reanimated animations and throttled camera updates for performance.
- **Edge-to-edge immersive mode** — System bars are fully hidden for a clean, distraction-free mirror experience using `react-native-edge-to-edge`.

### Planned

- Permission-denied guidance screen with option to open system settings (FR11)
- Brightness control (vertical side slider)
- Wide-angle / ultra-wide lens selection (FR05)
- Image freeze / unfreeze (FR06)
- Keep screen always on (FR07)
- Auto-hide controls with semi-transparent menu button (FR08)
- About screen (FR09)
- Preference persistence — last used lens between sessions (FR10)
- Camera-in-use error handling (FR12)

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native (Expo SDK 57, Development Build) |
| Language | JavaScript |
| Camera | [react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera) v5 |
| Animations | react-native-reanimated v4 |
| Gestures | react-native-gesture-handler |
| Fullscreen | react-native-edge-to-edge |
| Orientation | expo-screen-orientation |
| Platform | Android (iOS untested, expected to work with minimal changes) |

## Getting Started

### Prerequisites

- Node.js 20.19.4+
- Android Studio with a configured emulator or a physical Android device (API 26+)
- Expo Development Build (this app uses native camera modules and cannot run in Expo Go)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/MirrorVue.git
cd MirrorVue

# Install dependencies
npm install

# Generate the native Android project
npx expo prebuild

# Run on Android
npx expo run:android
```

### Build a Development APK (optional)

This project does not yet include an `eas.json` configuration. To build a development APK, create an `eas.json` and set up an [Expo EAS](https://expo.dev/eas) account first:

```bash
npx eas build:configure
npx eas build --profile development --platform android
```

## Project Structure

```
MirrorVue/
├── App.js                          # Root component — immersive mode, portrait lock
├── index.js                        # Entry point
├── app.json                        # Expo configuration
├── src/
│   └── components/
│       ├── CameraView.js           # Front camera display, permission flow, zoom state
│       └── ZoomSlider.js           # Animated horizontal zoom slider (gesture + reanimated)
└── assets/                         # App icons and splash screen assets
```

## Privacy

**No images or videos are captured, stored, or transmitted.** The camera feed is displayed in real time only. The app requests no permissions beyond the camera — no internet, location, storage, or contacts access. This app is designed for local, private use only.

## License

MIT

# MirrorVue

MirrorVue is a lightweight Android digital mirror built with Expo and React Native. It uses the front-facing camera to provide a fullscreen, horizontally mirrored preview with simple controls for zoom, screen brightness, freezing the image, selecting between available front-facing lenses, and supporting the project through optional Google Play donations.

The project is designed as a private, ad-free utility: the camera preview is local, and the app does not upload images or video.

The core mirror works without internet access. Internet access is only needed when the user opens the donation panel and uses Google Play Billing.

## Current Features

- **Fullscreen mirror preview** - The front camera is horizontally mirrored and displayed edge to edge. The app currently locks the interface to portrait.
- **Camera permission request** - Camera access is requested on first use.
- **Zoom control** - An animated horizontal slider maps to the selected camera's zoom range, capped at 4x or the device maximum, whichever is lower. Updates are throttled for smooth interaction.
- **Brightness control** - An animated vertical slider changes the device screen brightness while the app is in use.
- **Freeze and unfreeze** - Freezing pauses the live camera and displays a captured frame. Unfreezing removes the temporary snapshot file and resumes the preview, restoring the previous zoom when appropriate.
- **Front lens selection** - When more than one front-facing camera is available, including virtual camera, a lens button appears in the top-left area. It cycles through the available front lenses, remembers the selected lens between sessions, and resets the zoom slider for the new lens.
- **Top-left menu** - A hamburger menu opens a semi-transparent menu with Settings, About, and Buy me a coffee.
- **About screen** - About opens as a centered overlay with the app version, developer information, description, and privacy notice. Tapping outside the card or the close button dismisses it.
- **Keep screen awake** - The screen stays awake while the app is in the foreground and can sleep normally after the app is backgrounded.
- **App lifecycle handling** - The camera pauses in the background and resumes in the foreground.

## Product Direction

The revised product is intended to remain simple, local, and comfortable for one-handed use. The next controls and behaviors are planned around that goal:

- Functional Settings controls for landscape rotation, keep-screen-awake, and configurable auto-hide behavior.
- Automatic control hiding after inactivity, with a permanent top-right eye button to show or hide the controls.
- A permission-denied screen with retry and system-settings actions.
- Camera-in-use error handling with a retry action.
- A static in-memory freeze implementation so freezing never creates a file on disk.
- Larger touch targets and sufficient contrast for basic accessibility.

These items describe the target behavior and are not all implemented yet.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native (Expo SDK 57, Development Build) |
| Language | JavaScript |
| Camera | [react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera) v5 |
| Animations | react-native-reanimated v4 |
| Gestures | react-native-gesture-handler |
| Google Play donations | expo-iap and Google Play Billing |
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
├── App.js                          # Root component — immersive mode, portrait lock, keep-awake lifecycle
├── index.js                        # Entry point
├── app.json                        # Expo configuration
├── src/
│   └── components/
│       ├── BrightnessSlider.js     # Animated vertical brightness slider (gesture + reanimated)
│       ├── About.js                # Centered About modal with outside-tap dismissal
│       ├── CameraView.js           # Front camera display, permissions, lens selection, zoom, freeze logic
│       ├── DonationPanel.js        # Google Play donation products and purchase lifecycle
│       ├── LensButton.js           # Front-lens switch control
│       ├── Menu.js                 # Top-left menu, About navigation, Settings placeholder, donation navigation
│       ├── ZoomSlider.js           # Animated horizontal zoom slider (gesture + reanimated)
│       └── FreezeButton.js         # Freeze / unfreeze toggle button
└── assets/                         # App icons and splash screen assets
```

## Privacy

The live camera feed is displayed locally and is not uploaded or transmitted. The Android configuration requests only `android.permission.CAMERA`. The optional DonationPanel uses Google Play Billing when the user chooses to donate; MirrorVue does not use an app-owned server or account system.

The current freeze implementation uses a temporary snapshot file and deletes it when the preview is unfrozen. The target requirements call for replacing this with an in-memory freeze so no image is written to disk at all.

## License

MIT

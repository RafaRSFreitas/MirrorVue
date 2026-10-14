import React from 'react';
import { StyleSheet, View, Text, Switch } from 'react-native';
import ModalShell from './ModalShell';
import { useSettings } from '../SettingsContext';

export default function Settings({ visible, onClose }) {
  // The settings live in SettingsProvider, so this panel only shows them and asks to change them.
  const { settings, updateSetting } = useSettings();

  return (
    <ModalShell visible={visible} title="Settings" onClose={onClose} panelStyle={styles.panel}>
      {/* Allow the user to enable portrait and landscape orientation changes. */}
      <View style={styles.settingRow}>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>Allow landscape mode</Text>
          <Text style={styles.settingDescription}>
            Allow the interface to rotate when the device is turned.
          </Text>
        </View>

        <Switch
          value={settings.allowLandscapeMode}
          onValueChange={(value) => updateSetting('allowLandscapeMode', value)}
        />
      </View>

      {/* Allow the user to disable the keep-screen-awake behavior. */}
      <View style={styles.settingRow}>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>Keep screen awake</Text>
          <Text style={styles.settingDescription}>
            Prevent the screen from dimming or sleeping while MirrorVue is in the foreground.
          </Text>
        </View>

        <Switch
          value={settings.keepScreenAwake}
          onValueChange={(value) => updateSetting('keepScreenAwake', value)}
        />
      </View>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  // Keep the Settings content in a large readable panel over the mirror.
  panel: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 16,
  },

  // Lay out each setting as a label on the left and a switch on the right.
  settingRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
    paddingVertical: 12,
  },

  // Give the text section enough room beside the switch.
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },

  // Display the name of each setting clearly.
  settingTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },

  // Explain briefly what each setting controls.
  settingDescription: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
});

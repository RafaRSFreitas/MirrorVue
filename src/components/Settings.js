import React from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity } from 'react-native';
import ModalShell from './ModalShell';
import { useSettings } from '../SettingsContext';
import { languageCodes, translations } from '../locales';

export default function Settings({ visible, onClose }) {
  // The settings live in SettingsProvider, so this panel only shows them and asks to change them.
  const { settings, updateSetting, strings } = useSettings();

  return (
    <ModalShell visible={visible} title={strings.menu.settings} onClose={onClose} panelStyle={styles.panel}>
      {/* Allow the user to enable portrait and landscape orientation changes. */}
      <View style={styles.settingRow}>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{strings.settings.allowLandscape}</Text>
          <Text style={styles.settingDescription}>
            {strings.settings.landscapeDescription}
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
          <Text style={styles.settingTitle}>{strings.settings.keepAwake}</Text>
          <Text style={styles.settingDescription}>
            {strings.settings.awakeDescription}
          </Text>
        </View>

        <Switch
          value={settings.keepScreenAwake}
          onValueChange={(value) => updateSetting('keepScreenAwake', value)}
        />
      </View>

      {/* Keep each language recognizable even when another language is selected. */}
      <View style={styles.languageGroup} accessibilityRole="radiogroup">
        <Text style={styles.settingTitle}>{strings.settings.language}</Text>
        {languageCodes.map((code) => (
          <TouchableOpacity
            key={code}
            style={styles.languageOption}
            onPress={() => updateSetting('language', code)}
            accessibilityRole="radio"
            accessibilityState={{ checked: settings.language === code }}
          >
            <Text style={styles.languageName}>{translations[code].languageName}</Text>
            {settings.language === code && <Text accessible={false} style={styles.settingTitle}>✓</Text>}
          </TouchableOpacity>
        ))}
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

  languageGroup: {
    paddingTop: 16,
  },
  languageOption: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  languageName: {
    color: "white",
    fontSize: 16,
    flexShrink: 1,
  },
});

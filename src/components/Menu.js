import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Pressable, Modal } from 'react-native';
import About from './About';
import DonationPanel from './DonationPanel';

export default function Menu() {
  // Track whether the top-left menu dropdown is currently open.
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Track whether the About information is currently being displayed.
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Track whether the DonationPanel is currently being displayed.
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  // Track whether the Settings panel is currently being displayed.
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Open or close the top-left menu.
  const toggleMenu = () => {
    setIsMenuOpen((currentValue) => !currentValue);
  };

  // Open the About information and close the menu at the same time.
  const openAbout = () => {
    setIsMenuOpen(false);
    setIsAboutOpen(true);
  };

  // Close the About information and return to the camera preview.
  const closeAbout = () => {
    setIsAboutOpen(false);
  };

  // Open the DonationPanel and close the menu at the same time.
  const openDonation = () => {
    setIsMenuOpen(false);
    setIsDonationOpen(true);
  };

  // Close the DonationPanel and return to the camera preview.
  const closeDonation = () => {
    setIsDonationOpen(false);
  };

  // Open the Settings panel and close the menu at the same time.
  const openSettings = () => {
    setIsMenuOpen(false);
    setIsSettingsOpen(true);
  };

  // Close the Settings panel and return to the camera preview.
  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <>
      {/* Open the top-left menu with Settings, About, and Buy me a coffee. */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      {/* Show the three menu items when the hamburger button has been opened. */}
      {isMenuOpen && (
        <View style={styles.menuDropdown}>
          {/* Open the centered Settings panel. */}
          <TouchableOpacity style={styles.menuItem} onPress={openSettings}>
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity>

          {/* Open the About information without leaving the mirror preview. */}
          <TouchableOpacity style={styles.menuItem} onPress={openAbout}>
            <Text style={styles.menuItemText}>About</Text>
          </TouchableOpacity>

          {/* Open the in-app DonationPanel without using an external browser page. */}
          <TouchableOpacity style={styles.menuItem} onPress={openDonation}>
            <Text style={styles.menuItemText}>Buy me a coffee</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Display the About information in its own centered overlay component. */}
      <About visible={isAboutOpen} onClose={closeAbout} />

      {/* Display the Settings panel as a centered semi-transparent overlay. */}
      <Modal
        visible={isSettingsOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={closeSettings}
      >
        <Pressable style={styles.settingsOverlay} onPress={closeSettings}>
          <View
            style={styles.settingsPanel}
            onStartShouldSetResponder={() => true}
          >
            {/* Close the Settings panel and return to the mirror preview. */}
            <TouchableOpacity
              style={styles.settingsCloseButton}
              onPress={closeSettings}
              activeOpacity={0.7}
            >
              <Text style={styles.aboutCloseText}>✕</Text>
            </TouchableOpacity>

            {/* Display the Settings heading inside the centered panel. */}
            <Text style={styles.aboutTitle}>Settings</Text>

            {/* Settings controls will be added in the next implementation phase. */}
            <Text style={styles.aboutDescription}>
              Settings options are coming soon.
            </Text>
          </View>
        </Pressable>
      </Modal>

      {/* Display the DonationPanel when the user chooses Buy me a coffee. */}
      {isDonationOpen && (
        <DonationPanel onClose={closeDonation} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Keep the hamburger button in the top-left corner of the mirror preview.
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },

  // Style the hamburger icon so it is easy to see against the camera preview.
  menuIcon: {
    color: 'white',
    fontSize: 24,
  },

  // Display the menu as a small semi-transparent dropdown beneath the hamburger button.
  menuDropdown: {
    position: 'absolute',
    top: 95,
    left: 20,
    width: 190,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 10,
    elevation: 10,
  },

  // Give each menu option enough vertical space to be comfortably selectable.
  menuItem: {
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  // Use a high-contrast text color for the menu options.
  menuItemText: {
    color: 'white',
    fontSize: 16,
  },

  // Cover the entire preview and center the Settings card in both directions.
  settingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  // Keep the Settings content inside a centered readable card.
  settingsPanel: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(0,0,0,0.88)',
    borderRadius: 12,
    padding: 24,
    position: 'relative',
  },

  // Place the Settings close button in the upper-right corner of the panel.
  settingsCloseButton: {
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

});
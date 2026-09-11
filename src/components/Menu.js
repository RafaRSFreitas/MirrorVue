import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Pressable } from 'react-native';
import About from './About';
import DonationPanel from './DonationPanel';
import Settings from './Settings';

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

      {/* When the menu is open, a transparent full-screen layer makes any tap
          outside the dropdown close it. It sits below the button and dropdown
          so those remain interactive. */}
      {isMenuOpen && (
        <Pressable style={styles.menuOverlay} onPress={toggleMenu} />
      )}

      {/* Show the three menu items when the hamburger button has been opened. */}
      {isMenuOpen && (
        <View
          style={styles.menuDropdown}
          onStartShouldSetResponder={() => true}
        >
          {/* Open the Settings panel. */}
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

      {/* Display the Settings panel and its functional preferences. */}
      <Settings visible={isSettingsOpen} onClose={closeSettings} />

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
    backgroundColor: 'rgba(82, 82, 82, 0.37)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // Style the hamburger icon so it is easy to see against the camera preview.
  menuIcon: {
    color: 'white',
    fontSize: 24,
  },

  // A transparent full-screen layer that catches taps outside the dropdown.
  // It renders below the button and dropdown (zIndex 5) so they stay usable.
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },

  // Display the menu as a small semi-transparent dropdown beneath the hamburger button.
  menuDropdown: {
    position: 'absolute',
    top: 95,
    left: 20,
    width: 190,
    backgroundColor: 'rgba(82, 82, 82, 0.37)',
    borderRadius: 18,
    overflow: 'hidden',
    zIndex: 10,
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
    fontSize: 18,
  },
});
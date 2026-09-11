import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Pressable } from 'react-native';

export default function EyeButton({
controlsVisible,
onVisibilityChange,
}) {
// Show the controls when the user taps the preview.
const showControls = () => {
onVisibilityChange(true);
};

// Hide or show the controls when the eye is pressed.
const toggleVisibility = () => {
onVisibilityChange(!controlsVisible);
};

return (
<>
{/* Catch taps anywhere on the mirror preview and restore the controls.
This layer stays below the other controls so they remain interactive. */} <Pressable
     style={styles.activityLayer}
     onPress={showControls}
   />


  {/* Keep the eye permanently visible in the top-right corner. */}
  <TouchableOpacity
    style={styles.button}
    onPress={toggleVisibility}
    activeOpacity={0.7}
  >
    {/* Use a simple eye symbol without adding another icon dependency. */}
    <Text style={styles.icon}>👁️</Text>
  </TouchableOpacity>
</>

);
}

const styles = StyleSheet.create({
// Catch taps on the camera preview while remaining underneath the controls.
activityLayer: {
...StyleSheet.absoluteFillObject,
zIndex: 1,
},

// Keep the eye permanently in the top-right corner of the mirror preview.
button: {
position: 'absolute',
top: 40,
right: 20,
width: 50,
height: 50,
borderRadius: 25,
backgroundColor: 'rgba(82, 82, 82, 0.37)',
justifyContent: 'center',
alignItems: 'center',
zIndex: 20,
elevation: 20,
},

// Make the eye large enough to be easily recognised.
icon: {
fontSize: 22,
},
});

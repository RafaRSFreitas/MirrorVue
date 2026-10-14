import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

// A simple full-screen message used when the camera cannot be shown.
// The parent owns the camera and permission logic; this component only renders it.
export default function MessageScreen({
  title,
  message,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        {primaryLabel && onPrimaryPress && (
          <Pressable
            accessibilityRole="button"
            style={styles.primaryButton}
            onPress={onPrimaryPress}
          >
            <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
          </Pressable>
        )}

        {secondaryLabel && onSecondaryPress && (
          <Pressable
            accessibilityRole="button"
            style={styles.secondaryButton}
            onPress={onSecondaryPress}
          >
            <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  panel: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    color: "white",
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 24,
  },
  primaryButton: {
    minHeight: 48,
    minWidth: 180,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  primaryButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    minHeight: 48,
    minWidth: 180,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

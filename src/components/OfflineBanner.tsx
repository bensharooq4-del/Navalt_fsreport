import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { theme } from "../theme";

export function OfflineBanner() {
  if (useNetworkStatus()) return null;
  return (
    <View style={styles.bar}>
      <Text style={styles.text}>
        You are offline. Reports are saved on this phone and nothing is lost.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: theme.colors.warning,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  text: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: "600",
  },
});

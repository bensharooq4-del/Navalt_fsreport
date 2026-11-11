import React, { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

/** Rounded outlined block, like the boxed areas on the paper form. */
export function Section({
  title,
  children,
}: PropsWithChildren<{ title?: string }>) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function Row({ children }: PropsWithChildren) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  title: { ...theme.typography.heading, color: theme.colors.primary },
  row: { flexDirection: "row", gap: theme.spacing.md },
});

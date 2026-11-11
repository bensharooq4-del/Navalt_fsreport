import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";
import { ReportStatus } from "../types/report";

const META: Record<ReportStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: theme.colors.warning },
  completed: { label: "PDF ready", color: theme.colors.accent },
  emailed: { label: "Emailed", color: theme.colors.success },
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  const { label, color } = META[status];
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1.5,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 2,
  },
  text: { ...theme.typography.caption, fontWeight: "700" },
});

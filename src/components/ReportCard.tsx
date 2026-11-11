import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";
import { Report } from "../types/report";
import { formatDate } from "../utils/date";
import { StatusBadge } from "./StatusBadge";

interface Props {
  report: Report;
  onPress: () => void;
  onLongPress?: () => void;
}

export function ReportCard({ report, onPress, onLongPress }: Props) {
  const meta = [report.contactName, formatDate(report.attendedDate)]
    .filter(Boolean)
    .join("  ·  ");
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.icon}>
        <Ionicons
          name="document-text-outline"
          size={22}
          color={theme.colors.primary}
        />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.title}>FSR {report.fsrNo}</Text>
        <Text style={styles.sub} numberOfLines={1}>
          {report.projectName || "No project name"}
        </Text>
        {meta ? (
          <Text style={styles.sub} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      <StatusBadge status={report.status} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    ...theme.shadows.card,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...theme.typography.heading, color: theme.colors.primary },
  sub: { ...theme.typography.caption, color: theme.colors.textMuted },
});

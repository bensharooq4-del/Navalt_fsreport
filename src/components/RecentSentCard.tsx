import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";
import { Report } from "../types/report";
import { formatDate, formatTime } from "../utils/date";

interface Props {
  report: Report;
  onPress: () => void;
}

export function RecentSentCard({ report, onPress }: Props) {
  const sent = report.sentAt ?? report.updatedAt;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.top}>
        <View style={styles.iconWrap}>
          <Ionicons name="paper-plane" size={14} color={theme.colors.success} />
        </View>
        <Text style={styles.sent}>Sent</Text>
      </View>
      <Text style={styles.title}>FSR {report.fsrNo}</Text>
      <Text style={styles.sub} numberOfLines={1}>
        {report.projectName || "No project name"}
      </Text>
      <Text style={styles.time}>
        {formatDate(sent)} · {formatTime(sent)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 190,
    gap: 3,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    ...theme.shadows.card,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2E7D321A",
    alignItems: "center",
    justifyContent: "center",
  },
  sent: {
    ...theme.typography.caption,
    color: theme.colors.success,
    fontWeight: "700",
  },
  title: { ...theme.typography.heading, color: theme.colors.primary },
  sub: { ...theme.typography.caption, color: theme.colors.textMuted },
  time: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
});

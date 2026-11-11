import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../theme";

interface Props {
  name: string;
  unread: number;
  onBellPress: () => void;
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};
const today = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export function HomeHeader({ name, unread, onBellPress }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.hero, { paddingTop: insets.top + theme.spacing.md }]}>
      <View style={styles.topRow}>
        <Text style={styles.brand}>O&M · POWERED BY OCEANIX</Text>
        <Pressable onPress={onBellPress} style={styles.bell} hitSlop={10}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={theme.colors.white}
          />
          {unread > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <Text style={styles.hello}>{greeting()},</Text>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.date}>{today()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 52,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xl,
  },
  brand: {
    ...theme.typography.caption,
    color: "#B9BAF0",
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: theme.colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: theme.colors.white, fontSize: 10, fontWeight: "700" },
  hello: { ...theme.typography.body, color: "#B9BAF0" },
  name: { fontSize: 28, fontWeight: "800", color: theme.colors.white },
  date: {
    ...theme.typography.caption,
    color: "#B9BAF0",
    marginTop: theme.spacing.xs,
  },
});

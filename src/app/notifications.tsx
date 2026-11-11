import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { useReportStore } from "@/store/reportStore";
import { theme } from "@/theme";

import { formatDate, formatTime } from "@/utils/date";
import { AppNotification } from "@/types/notification";

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useReportStore((s) => s.notifications);
  const markRead = useReportStore((s) => s.markNotificationRead);
  const markAllRead = useReportStore((s) => s.markAllNotificationsRead);
  const clearAll = useReportStore((s) => s.clearNotifications);

  const onPressItem = (n: AppNotification) => {
    markRead(n.id);
    // Only open the report if it still exists
    if (
      n.reportId &&
      useReportStore.getState().reports.some((r) => r.id === n.reportId)
    ) {
      router.push({ pathname: "/report/[id]", params: { id: n.reportId } });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={markAllRead} hitSlop={10}>
              <Text style={styles.headerAction}>Mark all read</Text>
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => (
          <View style={{ height: theme.spacing.md }} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>You are all caught up.</Text>
        }
        ListFooterComponent={
          notifications.length > 0 ? (
            <View style={{ marginTop: theme.spacing.xl }}>
              <Button title="Clear all" variant="outline" onPress={clearAll} />
            </View>
          ) : undefined
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPressItem(item)}
            style={[styles.card, !item.read && styles.cardUnread]}
          >
            <View style={styles.icon}>
              <Ionicons
                name={
                  item.reportId ? "paper-plane-outline" : "sparkles-outline"
                }
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>
                {formatDate(item.createdAt)} · {formatTime(item.createdAt)}
              </Text>
            </View>
            {!item.read ? <View style={styles.dot} /> : null}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerAction: { color: theme.colors.white, fontWeight: "600" },
  list: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  empty: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: theme.spacing.xxl,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: "transparent",
    ...theme.shadows.card,
  },
  cardUnread: { borderColor: theme.colors.accent },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...theme.typography.heading, color: theme.colors.text },
  message: { ...theme.typography.body, color: theme.colors.textMuted },
  time: { ...theme.typography.caption, color: theme.colors.textMuted },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
  },
});

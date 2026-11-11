import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeHeader } from "@/components/HomeHeader";
import { OfflineBanner } from "@/components/OfflineBanner";
import { RecentSentCard } from "@//components/RecentSentCard";
import { ReportCard } from "@//components/ReportCard";
import { SearchBar } from "@/components/SearchBar";
import { StatCard } from "@/components/StatCard";
import { useReportStore, useStoreHydrated } from "@/store/reportStore";
import { theme } from "@/theme";
import { Report, ReportStatus } from "@/types/report";

type Filter = "all" | ReportStatus;
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "completed", label: "PDF ready" },
  { key: "emailed", label: "Emailed" },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hydrated = useStoreHydrated();
  const reports = useReportStore((s) => s.reports);
  const unread = useReportStore(
    (s) => s.notifications.filter((n) => !n.read).length,
  );
  const createReport = useReportStore((s) => s.createReport);
  const deleteReport = useReportStore((s) => s.deleteReport);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const sorted = useMemo(
    () => [...reports].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [reports],
  );

  // Welcome name = the Navalt rep name from the most recent report that has one.
  const name = useMemo(() => {
    const r = sorted.find((x) => x.navaltRep.name.trim());
    return r ? r.navaltRep.name.trim().split(" ")[0] : "Technician";
  }, [sorted]);

  const counts = useMemo(
    () => ({
      draft: reports.filter((r) => r.status === "draft").length,
      ready: reports.filter((r) => r.status === "completed").length,
      sent: reports.filter((r) => r.status === "emailed").length,
    }),
    [reports],
  );

  const recent = useMemo(
    () =>
      reports
        .filter((r) => r.sentAt || r.status === "emailed")
        .sort((a, b) =>
          (b.sentAt ?? b.updatedAt).localeCompare(a.sentAt ?? a.updatedAt),
        )
        .slice(0, 5),
    [reports],
  );

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const filtered = useMemo(
    () =>
      sorted.filter(
        (r) =>
          (filter === "all" || r.status === filter) &&
          (!searching ||
            [
              r.fsrNo,
              r.projectName,
              r.contactName,
              r.siteAddress,
              r.customerComplaint,
            ].some((f) => f.toLowerCase().includes(q))),
      ),
    [sorted, filter, q, searching],
  );

  const open = (id: string) =>
    router.push({ pathname: "/report/[id]", params: { id } });
  const onNew = () => open(createReport().id);
  const confirmDelete = (r: Report) =>
    Alert.alert(
      "Delete report",
      `Delete FSR ${r.fsrNo}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteReport(r.id),
        },
      ],
    );

  if (!hydrated)
    return (
      <ActivityIndicator style={{ flex: 1 }} color={theme.colors.primary} />
    );

  const header = (
    <View style={{ gap: theme.spacing.xl }}>
      <OfflineBanner />

      {!searching && (
        <>
          <View style={styles.statsRow}>
            <StatCard
              label="Drafts"
              value={counts.draft}
              icon="create-outline"
              color={theme.colors.warning}
            />
            <StatCard
              label="PDF ready"
              value={counts.ready}
              icon="document-attach-outline"
              color={theme.colors.accent}
            />
            <StatCard
              label="Emailed"
              value={counts.sent}
              icon="paper-plane-outline"
              color={theme.colors.success}
            />
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <Text style={styles.sectionTitle}>Recently sent</Text>
            {recent.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentRow}
              >
                {recent.map((r) => (
                  <RecentSentCard
                    key={r.id}
                    report={r}
                    onPress={() => open(r.id)}
                  />
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.muted}>
                Reports you email will show up here.
              </Text>
            )}
          </View>
        </>
      )}

      <View style={{ gap: theme.spacing.sm }}>
        <Text style={styles.sectionTitle}>
          {searching ? "Search results" : "History"}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: theme.spacing.sm }}
        >
          {FILTERS.map((f) => {
            const on = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <HomeHeader
        name={name}
        unread={unread}
        onBellPress={() => router.push("/notifications")}
      />

      <View style={styles.searchWrap}>
        <SearchBar value={query} onChangeText={setQuery} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => (
          <View style={{ height: theme.spacing.md }} />
        )}
        ListEmptyComponent={
          <Text
            style={[
              styles.muted,
              { textAlign: "center", marginTop: theme.spacing.lg },
            ]}
          >
            {searching
              ? `No reports match "${query.trim()}".`
              : filter === "all"
                ? "No reports yet. Tap New report to start."
                : "Nothing in this list yet."}
          </Text>
        }
        renderItem={({ item }) => (
          <ReportCard
            report={item}
            onPress={() => open(item.id)}
            onLongPress={() => confirmDelete(item)}
          />
        )}
      />

      <Pressable
        onPress={onNew}
        style={[styles.fab, { bottom: insets.bottom + theme.spacing.lg }]}
      >
        <Ionicons name="add" size={22} color={theme.colors.white} />
        <Text style={styles.fabText}>New report</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    marginTop: -28,
    paddingHorizontal: theme.spacing.lg,
    zIndex: 2,
  },
  list: { padding: theme.spacing.lg, paddingBottom: 120 },
  statsRow: { flexDirection: "row", gap: theme.spacing.md },
  recentRow: { gap: theme.spacing.md, paddingBottom: theme.spacing.sm },
  sectionTitle: { ...theme.typography.heading, color: theme.colors.text },
  muted: { ...theme.typography.body, color: theme.colors.textMuted },
  chip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipOn: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: { ...theme.typography.label, color: theme.colors.text },
  chipTextOn: { color: theme.colors.white },
  fab: {
    position: "absolute",
    right: theme.spacing.lg,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.card,
    shadowOpacity: 0.3,
  },
  fabText: { ...theme.typography.heading, color: theme.colors.white },
});

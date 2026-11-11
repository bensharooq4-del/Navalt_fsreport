import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ReportForm } from "@/features/report/ReportForm";
import { useReportStore, useStoreHydrated } from "@/store/reportStore";
import { theme } from "@/theme";

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const hydrated = useStoreHydrated();
  const report = useReportStore((s) => s.reports.find((r) => r.id === id));

  if (!hydrated)
    return (
      <ActivityIndicator style={{ flex: 1 }} color={theme.colors.primary} />
    );
  if (!report)
    return (
      <Text
        style={{ padding: theme.spacing.xl, color: theme.colors.textMuted }}
      >
        Report not found.
      </Text>
    );

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      <ReportForm key={report.id} report={report} />
    </View>
  );
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createEmptyReport } from "../features/report/defaults";
import { AppNotification } from "../types/notification";
import { Report } from "../types/report";
import { createId } from "../utils/id";

interface ReportStore {
  reports: Report[];
  /** Used to suggest the next FSR number. Per device, and the user can edit it. */
  fsrCounter: number;
  notifications: AppNotification[];
  createReport: () => Report;
  updateReport: (id: string, patch: Partial<Report>) => void;
  deleteReport: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

const makeNotification = (
  title: string,
  message: string,
  reportId?: string,
): AppNotification => ({
  id: createId(),
  title,
  message,
  reportId,
  read: false,
  createdAt: new Date().toISOString(),
});

const welcome: AppNotification = {
  id: "welcome",
  title: "Welcome to O&M",
  message: "Tap the New report button to create your first service report.",
  read: false,
  createdAt: new Date().toISOString(),
};

/** Everything is persisted to AsyncStorage, so the app works fully offline. */
export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      reports: [],
      fsrCounter: 1,
      notifications: [welcome],

      createReport: () => {
        const report = createEmptyReport(get().fsrCounter);
        set((s) => ({
          reports: [report, ...s.reports],
          fsrCounter: s.fsrCounter + 1,
        }));
        return report;
      },

      updateReport: (id, patch) =>
        set((s) => {
          const prev = s.reports.find((r) => r.id === id);
          if (!prev) return s;

          const now = new Date().toISOString();
          const next: Report = { ...prev, ...patch, id, updatedAt: now };
          let notifications = s.notifications;

          // The moment a report becomes "emailed": stamp the time and add a notification.
          if (patch.status === "emailed" && prev.status !== "emailed") {
            next.sentAt = now;
            notifications = [
              makeNotification(
                "Report emailed",
                `FSR ${next.fsrNo}${next.projectName ? ` (${next.projectName})` : ""} was sent.`,
                id,
              ),
              ...notifications,
            ].slice(0, 50);
          }

          return {
            reports: s.reports.map((r) => (r.id === id ? next : r)),
            notifications,
          };
        }),

      deleteReport: (id) =>
        set((s) => ({ reports: s.reports.filter((r) => r.id !== id) })),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),
      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: "navalt-fsr-store",
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      // v2 added photos: give older saved reports an empty photo list
      migrate: (persisted, version) => {
        const state = persisted as Partial<ReportStore>;
        if (version < 2 && state.reports) {
          state.reports = state.reports.map((r) => ({
            ...r,
            photos: r.photos ?? [],
          }));
        }
        return state as ReportStore;
      },
    },
  ),
);

/** Screens wait for this before reading from the store. */
export function useStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    useReportStore.persist.hasHydrated(),
  );
  useEffect(() => {
    const unsub = useReportStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    setHydrated(useReportStore.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
}

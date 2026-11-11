export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  /** If set, tapping the notification opens this report */
  reportId?: string;
}

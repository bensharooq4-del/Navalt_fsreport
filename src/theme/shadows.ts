import { ViewStyle } from "react-native";

export const shadows = {
  card: {
    shadowColor: "#0A0A5A",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
} satisfies Record<string, ViewStyle>;

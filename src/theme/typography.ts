import { TextStyle } from "react-native";

export const typography = {
  title: { fontSize: 22, fontWeight: "700" },
  heading: { fontSize: 16, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "600" },
  body: { fontSize: 15, fontWeight: "400" },
  caption: { fontSize: 12, fontWeight: "400" },
} satisfies Record<string, TextStyle>;

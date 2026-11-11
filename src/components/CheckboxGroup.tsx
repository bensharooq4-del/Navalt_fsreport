import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

interface Props<T extends string> {
  options: readonly T[];
  value: T[];
  onChange: (next: T[]) => void;
  error?: string;
}

export function CheckboxGroup<T extends string>({
  options,
  value,
  onChange,
  error,
}: Props<T>) {
  const toggle = (o: T) =>
    onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o]);
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <View style={styles.row}>
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <Pressable
              key={o}
              onPress={() => toggle(o)}
              style={styles.item}
              hitSlop={6}
            >
              <Ionicons
                name={on ? "checkbox" : "square-outline"}
                size={26}
                color={on ? theme.colors.primary : theme.colors.textMuted}
              />
              <Text style={styles.text}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.lg },
  item: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs },
  text: { ...theme.typography.label, color: theme.colors.text },
  error: { ...theme.typography.caption, color: theme.colors.danger },
});

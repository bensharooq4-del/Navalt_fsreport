import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { theme } from "../theme";

interface Props {
  value: string;
  onChangeText: (v: string) => void;
}

export function SearchBar({ value, onChangeText }: Props) {
  return (
    <View style={styles.bar}>
      <Ionicons name="search" size={20} color={theme.colors.textMuted} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Search FSR no, project, contact, site"
        placeholderTextColor={theme.colors.textMuted}
        returnKeyType="search"
        autoCorrect={false}
      />
      {value ? (
        <Pressable onPress={() => onChangeText("")} hitSlop={10}>
          <Ionicons
            name="close-circle"
            size={20}
            color={theme.colors.textMuted}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    height: 54,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    ...theme.shadows.card,
  },
  input: { flex: 1, ...theme.typography.body, color: theme.colors.text },
});

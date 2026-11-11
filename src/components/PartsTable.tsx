import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { createEmptyPart } from "../features/report/defaults";
import { theme } from "../theme";
import { PartRow } from "../types/report";
import { Button } from "./Button";

interface Props {
  rows: PartRow[];
  onChange: (rows: PartRow[]) => void;
}

export function PartsTable({ rows, onChange }: Props) {
  const patch = (id: string, p: Partial<PartRow>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const remove = (id: string) => onChange(rows.filter((r) => r.id !== id));

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={styles.header}>
        <Text style={[styles.headText, { flex: 3 }]}>Description</Text>
        <Text style={[styles.headText, { flex: 1 }]}>Qty</Text>
        <Text style={[styles.headText, { flex: 3 }]}>Reason for failure</Text>
        <View style={{ width: 28 }} />
      </View>

      {rows.map((r) => (
        <View key={r.id} style={styles.row}>
          <TextInput
            style={[styles.cell, { flex: 3 }]}
            value={r.description}
            onChangeText={(t) => patch(r.id, { description: t })}
            multiline
          />
          <TextInput
            style={[styles.cell, { flex: 1, textAlign: "center" }]}
            value={r.qty}
            onChangeText={(t) => patch(r.id, { qty: t })}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.cell, { flex: 3 }]}
            value={r.reasonForFailure}
            onChangeText={(t) => patch(r.id, { reasonForFailure: t })}
            multiline
          />
          <Pressable
            onPress={() => remove(r.id)}
            hitSlop={8}
            style={styles.remove}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={theme.colors.danger}
            />
          </Pressable>
        </View>
      ))}

      <Button
        title="Add row"
        icon="add"
        variant="outline"
        onPress={() => onChange([...rows, createEmptyPart()])}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  headText: {
    ...theme.typography.label,
    color: theme.colors.white,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    alignItems: "flex-start",
  },
  cell: {
    ...theme.typography.body,
    minHeight: 44,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  remove: {
    width: 28,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});

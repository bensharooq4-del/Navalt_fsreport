import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";
import { formatDate, formatTime } from "../utils/date";

interface Props {
  label: string;
  mode: "date" | "time";
  /** ISO string or null */
  value: string | null;
  onChange: (iso: string | null) => void;
  error?: string;
  required?: boolean;
}

export function DateTimeField({
  label,
  mode,
  value,
  onChange,
  error,
  required,
}: Props) {
  const [open, setOpen] = useState(false);
  const display = mode === "date" ? formatDate(value) : formatTime(value);

  const handle = (e: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setOpen(false);
    if (e.type === "set" && selected) onChange(selected.toISOString());
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.error}> *</Text> : null}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.input, !!error && styles.inputError]}
      >
        <Text style={display ? styles.value : styles.placeholder}>
          {display || (mode === "date" ? "dd/mm/yyyy" : "hh:mm")}
        </Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {open ? (
        <>
          <DateTimePicker
            value={value ? new Date(value) : new Date()}
            mode={mode}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handle}
          />
          {Platform.OS === "ios" ? (
            <Pressable onPress={() => setOpen(false)}>
              <Text style={styles.done}>Done</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: theme.spacing.xs },
  label: { ...theme.typography.label, color: theme.colors.primary },
  input: {
    minHeight: 46,
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
  },
  inputError: { borderColor: theme.colors.danger },
  value: { ...theme.typography.body, color: theme.colors.text },
  placeholder: { ...theme.typography.body, color: theme.colors.textMuted },
  error: { ...theme.typography.caption, color: theme.colors.danger },
  done: {
    ...theme.typography.label,
    color: theme.colors.accent,
    textAlign: "right",
    padding: theme.spacing.sm,
  },
});

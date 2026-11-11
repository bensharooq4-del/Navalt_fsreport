import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { theme } from "../theme";

interface Props extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

export function TextField({
  label,
  error,
  required,
  hint,
  multiline,
  style,
  ...rest
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.error}> *</Text> : null}
      </Text>
      <TextInput
        {...rest}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          multiline && styles.multiline,
          !!error && styles.inputError,
          style,
        ]}
      />
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: theme.spacing.xs },
  label: { ...theme.typography.label, color: theme.colors.primary },
  input: {
    ...theme.typography.body,
    minHeight: 46,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  multiline: { minHeight: 96 },
  inputError: { borderColor: theme.colors.danger },
  error: { ...theme.typography.caption, color: theme.colors.danger },
  hint: { ...theme.typography.caption, color: theme.colors.textMuted },
});

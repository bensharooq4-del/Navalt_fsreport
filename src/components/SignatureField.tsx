import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SignatureCanvas, {
  SignatureViewRef,
} from "react-native-signature-canvas";
import { theme } from "../theme";
import { Button } from "./Button";

interface Props {
  label: string;
  /** PNG data URI or null */
  value: string | null;
  onChange: (dataUri: string | null) => void;
  error?: string;
}

// Hides the library's built-in footer; we render our own buttons.
const webStyle = `
  .m-signature-pad--footer { display: none; margin: 0; }
  .m-signature-pad { box-shadow: none; border: none; }
  body, html { width: 100%; height: 100%; }
`;

/** The pad opens full-screen so drawing never fights with the form's scrolling. */
export function SignatureField({ label, value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const pad = useRef<SignatureViewRef>(null);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.box, !!error && styles.boxError]}
      >
        {value ? (
          <Image
            source={{ uri: value }}
            style={styles.preview}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.placeholder}>Tap to sign</Text>
        )}
      </Pressable>
      {value ? (
        <Pressable onPress={() => onChange(null)}>
          <Text style={styles.clear}>Clear signature</Text>
        </Pressable>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView style={styles.modal}>
          <Text style={styles.modalTitle}>{label}</Text>
          <View style={styles.pad}>
            <SignatureCanvas
              ref={pad}
              webStyle={webStyle}
              penColor={theme.colors.primary}
              backgroundColor="rgb(255,255,255)"
              onOK={(sig) => {
                onChange(sig);
                setOpen(false);
              }}
              onEmpty={() =>
                Alert.alert(
                  "No signature",
                  "Please sign in the box before saving.",
                )
              }
            />
          </View>
          <View style={styles.actions}>
            <View style={{ flex: 1 }}>
              <Button
                title="Clear"
                variant="outline"
                onPress={() => pad.current?.clearSignature()}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setOpen(false)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Save"
                onPress={() => pad.current?.readSignature()}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: theme.spacing.xs },
  label: { ...theme.typography.label, color: theme.colors.primary },
  box: {
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
  },
  boxError: { borderColor: theme.colors.danger },
  preview: { width: "100%", height: "100%" },
  placeholder: { ...theme.typography.body, color: theme.colors.textMuted },
  clear: { ...theme.typography.caption, color: theme.colors.accent },
  error: { ...theme.typography.caption, color: theme.colors.danger },
  modal: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalTitle: { ...theme.typography.title, color: theme.colors.primary },
  pad: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  actions: { flexDirection: "row", gap: theme.spacing.md },
});

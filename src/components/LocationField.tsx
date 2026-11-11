import React, { useState } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import { captureLocation, mapsUrl } from "@/service/location";
import { theme } from "../theme";
import { GeoPoint } from "../types/report";
import { Button } from "./Button";

interface Props {
  value: GeoPoint | null;
  onChange: (p: GeoPoint) => void;
}

export function LocationField({ value, onChange }: Props) {
  const [loading, setLoading] = useState(false);

  const capture = async () => {
    setLoading(true);
    try {
      onChange(await captureLocation());
    } catch (e) {
      Alert.alert(
        "Could not get location",
        e instanceof Error ? e.message : String(e),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ gap: theme.spacing.sm }}>
      {value ? (
        <View style={styles.info}>
          <Text style={styles.coords}>
            {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
            {value.accuracy != null
              ? `  (±${Math.round(value.accuracy)} m)`
              : ""}
          </Text>
          {value.address ? (
            <Text style={styles.address}>{value.address}</Text>
          ) : null}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL(mapsUrl(value))}
          >
            Open in Maps
          </Text>
        </View>
      ) : (
        <Text style={styles.address}>No location captured yet.</Text>
      )}
      <Button
        title={value ? "Update location" : "Capture site location"}
        icon="location-outline"
        variant="outline"
        loading={loading}
        onPress={capture}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  info: {
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primaryTint,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
  },
  coords: { ...theme.typography.label, color: theme.colors.primary },
  address: { ...theme.typography.body, color: theme.colors.textMuted },
  link: { ...theme.typography.label, color: theme.colors.accent },
});

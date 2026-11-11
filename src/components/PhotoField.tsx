import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { deletePhotoFile, persistPhoto } from "@/service/photos";
import { theme } from "../theme";
import { Photo } from "../types/report";
import { createId } from "../utils/id";
import { Button } from "./Button";

const MAX_PHOTOS = 8;
const QUALITY = 0.5; // keeps the PDF and the email a reasonable size

interface Props {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
}

export function PhotosField({ photos, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const remaining = MAX_PHOTOS - photos.length;

  const addAssets = async (assets: ImagePicker.ImagePickerAsset[]) => {
    const added: Photo[] = [];
    for (const a of assets.slice(0, remaining)) {
      added.push({ id: createId(), uri: await persistPhoto(a.uri) });
    }
    onChange([...photos, ...added]);
  };

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } catch (e) {
      Alert.alert(
        "Could not add photo",
        e instanceof Error ? e.message : String(e),
      );
    } finally {
      setBusy(false);
    }
  };

  const takePhoto = () =>
    run(async () => {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Camera permission needed",
          "Allow camera access in your phone settings to take photos.",
        );
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: QUALITY,
      });
      if (!res.canceled) await addAssets(res.assets);
    });

  const pickFromGallery = () =>
    run(async () => {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: QUALITY,
      });
      if (!res.canceled) await addAssets(res.assets);
    });

  const remove = (p: Photo) => {
    deletePhotoFile(p.uri);
    onChange(photos.filter((x) => x.id !== p.id));
  };

  return (
    <View style={{ gap: theme.spacing.md }}>
      {photos.length > 0 ? (
        <View style={styles.grid}>
          {photos.map((p) => (
            <View key={p.id} style={styles.thumbWrap}>
              <Image source={{ uri: p.uri }} style={styles.thumb} />
              <Pressable
                onPress={() => remove(p)}
                style={styles.remove}
                hitSlop={8}
              >
                <Ionicons name="close" size={16} color={theme.colors.white} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.hint}>No photos added yet.</Text>
      )}

      <Text style={styles.hint}>
        {photos.length} of {MAX_PHOTOS} photos. They are shown in the PDF and
        attached to the email.
      </Text>

      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <Button
            title="Take photo"
            icon="camera-outline"
            variant="outline"
            loading={busy}
            disabled={remaining <= 0}
            onPress={takePhoto}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title="Gallery"
            icon="images-outline"
            variant="outline"
            loading={busy}
            disabled={remaining <= 0}
            onPress={pickFromGallery}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  thumbWrap: { width: 96, height: 96 },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryTint,
  },
  remove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: { ...theme.typography.caption, color: theme.colors.textMuted },
  actions: { flexDirection: "row", gap: theme.spacing.md },
});

import * as Location from "expo-location";
import { GeoPoint } from "../types/report";

/**
 * Reads the GPS position. Works offline (GPS needs no internet).
 * The readable address is a best-effort extra and is skipped if the lookup fails.
 */
export async function captureLocation(): Promise<GeoPoint> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error(
      "Location permission was denied. Enable it in your phone settings.",
    );
  }

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  let address: string | undefined;
  try {
    const [a] = await Location.reverseGeocodeAsync(pos.coords);
    if (a)
      address = [a.name, a.street, a.city, a.region, a.postalCode]
        .filter(Boolean)
        .join(", ");
  } catch {
    // offline or geocoder unavailable: coordinates are enough
  }

  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    accuracy: pos.coords.accuracy ?? null,
    capturedAt: new Date().toISOString(),
    address,
  };
}

export const mapsUrl = (p: GeoPoint) =>
  `https://maps.google.com/?q=${p.latitude},${p.longitude}`;

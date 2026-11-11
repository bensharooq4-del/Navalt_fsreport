import { File, Paths } from "expo-file-system";
import { createId } from "../utils/id";

/** Copies a picked/captured photo into the app's permanent folder so the OS cannot clear it. */
export async function persistPhoto(uri: string): Promise<string> {
  try {
    const ext = (uri.split("?")[0].split(".").pop() || "jpg").toLowerCase();
    const dest = new File(Paths.document, `photo_${createId()}.${ext}`);
    await new File(uri).copy(dest);
    if (dest.exists) return dest.uri;
  } catch {
    // fall back to the original location
  }
  return uri;
}

export async function deletePhotoFile(uri: string): Promise<void> {
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // not important
  }
}

/** Reads a photo as a data URI so it can be embedded in the PDF. Falls back to the file URI if it cannot be read. */
export async function photoToDataUri(uri: string): Promise<string> {
  try {
    const base64 = await new File(uri).base64();
    const type = uri.toLowerCase().endsWith(".png") ? "png" : "jpeg";
    return `data:image/${type};base64,${base64}`;
  } catch {
    return uri;
  }
}

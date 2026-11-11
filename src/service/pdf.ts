import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Report } from "../types/report";
import { photoToDataUri } from "./photos";
import { buildReportHtml } from "./pdfTemplate";

/**
 * Builds the PDF on the device (works offline) and returns the file URI.
 * Photos are embedded in the PDF. A4 at 72 dpi = 595 x 842.
 */
export async function generateReportPdf(report: Report): Promise<string> {
  const photoData = await Promise.all(
    report.photos.map((p) => photoToDataUri(p.uri)),
  );

  const { uri } = await Print.printToFileAsync({
    html: buildReportHtml(report, photoData),
    width: 595,
    height: 842,
  });

  // Try to give the file a readable name. If anything fails, use the original file as it is.
  try {
    const dest = new File(
      Paths.cache,
      `FSR_${report.fsrNo.replace(/[^\w-]+/g, "-")}.pdf`,
    );
    if (dest.exists) dest.delete();
    await new File(uri).copy(dest);
    if (dest.exists) return dest.uri;
  } catch {
    // keep going with the original file
  }
  return uri;
}

export async function sharePdf(uri: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("Sharing is not available on this device.");
  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
    dialogTitle: "Share Field Service Report",
  });
}

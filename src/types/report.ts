/** Codes printed at the top of the paper form. Add full labels here if you want them shown. */
export const SERVICE_TYPES = ["COMM", "PPM", "RW", "AMC", "QTM"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

/** draft -> PDF generated (completed) -> mail composer reported "sent" (emailed) */
export type ReportStatus = "draft" | "completed" | "emailed";

export interface PartRow {
  id: string;
  description: string;
  qty: string;
  reasonForFailure: string;
}
export interface Photo {
  id: string;
  /** Local file URI. Attached to the email and embedded in the PDF. */
  uri: string;
}

export interface Signatory {
  name: string;
  designation: string;
  /** PNG data URI from the signature pad */
  signature: string | null;
  /** ISO date string */
  date: string | null;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: string;
  /** Reverse-geocoded; only available when the device was online */
  address?: string;
}

export interface Report {
  /** Generated on the device, so it is safe to create offline */
  id: string;
  fsrNo: string;
  serviceTypes: ServiceType[];

  projectName: string;
  siteAddress: string;
  contactName: string;
  contactNumber: string;
  /** Client copy recipient(s). Comma separated. The company address is added automatically. */
  clientEmail: string;

  // All dates/times are ISO strings (or null when not set)
  complaintDate: string | null;
  attendedDate: string | null;
  startTime: string | null;
  finishTime: string | null;

  customerComplaint: string;
  observation: string;
  parts: PartRow[];
  photos: Photo[];
  recommendations: string;
  customerRemarks: string;

  navaltRep: Signatory;
  customerRep: Signatory;
  location: GeoPoint | null;

  status: ReportStatus;
  pdfUri: string | null;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
}

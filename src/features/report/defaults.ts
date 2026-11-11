import { PartRow, Report, Signatory } from "../../types/report";
import { createId } from "../../utils/id";

export const createEmptyPart = (): PartRow => ({
  id: createId(),
  description: "",
  qty: "",
  reasonForFailure: "",
});

const emptySignatory = (): Signatory => ({
  name: "",
  designation: "",
  signature: null,
  date: null,
});

export function createEmptyReport(sequence: number): Report {
  const now = new Date();
  const iso = now.toISOString();
  return {
    id: createId(),
    fsrNo: `${String(sequence).padStart(3, "0")}/${now.getFullYear()}`,
    serviceTypes: [],
    projectName: "",
    siteAddress: "",
    contactName: "",
    contactNumber: "",
    clientEmail: "",
    complaintDate: null,
    attendedDate: iso,
    startTime: null,
    finishTime: null,
    customerComplaint: "",
    observation: "",
    parts: [createEmptyPart(), createEmptyPart()],
    recommendations: "",
    customerRemarks: "",
    navaltRep: emptySignatory(),
    customerRep: emptySignatory(),
    location: null,
    status: "draft",
    pdfUri: null,
    createdAt: iso,
    updatedAt: iso,
  };
}

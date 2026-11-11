import { Report } from "../types/report";
import { isValidEmail, parseEmails } from "./email";

export type ValidationErrors = Partial<Record<string, string>>;

/** Rules that must pass before a PDF is generated / emailed. */
export function validateReport(r: Report): ValidationErrors {
  const e: ValidationErrors = {};
  const required = (
    key: string,
    value: string | null | undefined,
    msg = "Required",
  ) => {
    if (!value || !value.trim()) e[key] = msg;
  };

  if (r.serviceTypes.length === 0) e.serviceTypes = "Select at least one type";
  required("fsrNo", r.fsrNo);
  required("projectName", r.projectName);
  required("siteAddress", r.siteAddress);
  required("contactName", r.contactName);
  required("contactNumber", r.contactNumber);
  required("attendedDate", r.attendedDate);
  required("customerComplaint", r.customerComplaint);
  required("navaltRepName", r.navaltRep.name);
  required("navaltRepSignature", r.navaltRep.signature, "Signature required");
  required("customerRepName", r.customerRep.name);
  required(
    "customerRepSignature",
    r.customerRep.signature,
    "Signature required",
  );

  const badEmail = parseEmails(r.clientEmail).find((x) => !isValidEmail(x));
  if (badEmail) e.clientEmail = `"${badEmail}" is not a valid email`;
  return e;
}

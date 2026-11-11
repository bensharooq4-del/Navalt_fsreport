import { config } from "../config";
import { Report } from "../types/report";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string) => EMAIL_RE.test(value);

/** Accepts "a@x.com, b@y.com; c@z.com" */
export const parseEmails = (value: string): string[] =>
  value
    .split(/[,;\s]+/)
    .map((v) => v.trim())
    .filter(Boolean);

/** Client address(es) first, then the constant company address. De-duplicated. */
export function buildRecipients(report: Report): string[] {
  const all = [...parseEmails(report.clientEmail), config.companyEmail].map(
    (e) => e.toLowerCase(),
  );
  return Array.from(new Set(all));
}

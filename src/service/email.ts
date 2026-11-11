import * as MailComposer from "expo-mail-composer";
import { Report } from "../types/report";
import { formatDate } from "../utils/date";
import { buildRecipients } from "../utils/email";

export type EmailResult = "sent" | "saved" | "cancelled" | "unavailable";

/**
 * Opens the device mail app with the PDF attached and BOTH addresses filled in:
 * the client address(es) from the form + the constant company address from config.
 * The mail app keeps its own outbox, so a message composed offline is sent once the phone reconnects.
 */
export async function sendReportEmail(report: Report): Promise<EmailResult> {
  if (!report.pdfUri) throw new Error("Generate the PDF before emailing.");
  if (!(await MailComposer.isAvailableAsync())) return "unavailable";

  const result = await MailComposer.composeAsync({
    recipients: buildRecipients(report),
    subject: `Field Service Report ${report.fsrNo} - ${report.projectName}`,
    body:
      `Hello,\n\nPlease find attached the Field Service Report ${report.fsrNo} ` +
      `for ${report.projectName}, attended on ${formatDate(report.attendedDate)}.\n\n` +
      `Regards,\n${report.navaltRep.name}`,
    attachments: [report.pdfUri],
  });
  return result.status === "sent"
    ? "sent"
    : result.status === "saved"
      ? "saved"
      : "cancelled";
}

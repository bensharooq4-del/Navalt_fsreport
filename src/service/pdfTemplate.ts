import { config } from "../config";
import { colors } from "../theme/colors";
import { PartRow, Report, SERVICE_TYPES, Signatory } from "../types/report";
import { formatDate, formatTime } from "../utils/date";
import { mapsUrl } from "./location";

const esc = (s?: string | null) =>
  (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
const multiline = (s?: string | null) => esc(s).replace(/\n/g, "<br/>");
const box = (on: boolean) => `<span class="box${on ? " on" : ""}"></span>`;
const signature = (s: string | null) =>
  s && s.startsWith("data:image/") ? `<img class="sig" src="${s}" />` : "";

const css = `
  *{box-sizing:border-box}
  body{font-family:Helvetica,Arial,sans-serif;font-size:11px;color:${colors.text};margin:0;padding:22px}
  h1{font-size:18px;margin:0 0 6px;color:${colors.primary}}
  .tag{display:inline-block;background:${colors.primary};color:#fff;padding:3px 9px;font-weight:bold;font-size:12px}
  .top{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:10px}
  table{width:100%;border-collapse:collapse;margin-bottom:10px}
  td,th{border:1px solid ${colors.primary};padding:6px 8px;vertical-align:top}
  th{background:${colors.primary};color:#fff;text-align:center}
  .label{color:${colors.primary};font-weight:bold}
  .block{border:1px solid ${colors.primary};border-radius:8px;padding:8px;margin-bottom:10px;min-height:70px}
  .box{display:inline-block;width:11px;height:11px;border:1.5px solid ${colors.primary};border-radius:3px;margin:0 4px 0 12px;vertical-align:-2px}
  .box.on{background:${colors.primary}}
  .sig{height:42px;max-width:100%}
  .auth-title{text-align:center;font-weight:bold;color:${colors.primary};margin:6px 0 2px}
  .foot{margin-top:10px;color:${colors.textMuted};font-size:9px;text-align:right}
`;

const row = (label: string, value: string) =>
  `<tr><td colspan="2"><span class="label">${label}</span> ${value}</td></tr>`;
const pair = (l1: string, v1: string, l2: string, v2: string) =>
  `<tr><td width="50%"><span class="label">${l1}</span> ${v1}</td><td width="50%"><span class="label">${l2}</span> ${v2}</td></tr>`;

const signatoryCell = (title: string, s: Signatory) => `
  <td width="50%">
    <div><span class="label">${title} Name:</span> ${esc(s.name)}</div>
    <div><span class="label">Designation:</span> ${esc(s.designation)}</div>
    <div><span class="label">Sign:</span> ${signature(s.signature)}</div>
    <div><span class="label">Date:</span> ${formatDate(s.date)}</div>
  </td>`;

export function buildReportHtml(r: Report): string {
  const filled = r.parts.filter(
    (p) => p.description.trim() || p.qty.trim() || p.reasonForFailure.trim(),
  );
  const blank: PartRow = {
    id: "",
    description: "",
    qty: "",
    reasonForFailure: "",
  };
  const partRows = [...filled];
  while (partRows.length < 2) partRows.push(blank);

  const types = SERVICE_TYPES.map(
    (t) => `${box(r.serviceTypes.includes(t))}${t}`,
  ).join("");
  const loc = r.location
    ? `${r.location.latitude.toFixed(6)}, ${r.location.longitude.toFixed(6)}` +
      (r.location.accuracy != null
        ? ` (±${Math.round(r.location.accuracy)} m)`
        : "") +
      (r.location.address ? ` &ndash; ${esc(r.location.address)}` : "") +
      ` &ndash; <a href="${mapsUrl(r.location)}">Map</a>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${css}</style></head><body>
  <div class="top">
    <div><h1>${esc(config.companyName)}</h1><span class="tag">Field Service Report</span></div>
    <div>FSR No.: <b>${esc(r.fsrNo)}</b></div>
  </div>

  <table>
    <tr><td colspan="2" style="padding-left:0">${types}</td></tr>
    ${row("Project Name/No.:", esc(r.projectName))}
    ${row("Customer/Site Address:", multiline(r.siteAddress))}
    ${pair("Contact Name:", esc(r.contactName), "Contact Number:", esc(r.contactNumber))}
    ${pair("Complaint Date:", formatDate(r.complaintDate), "Attended Date:", formatDate(r.attendedDate))}
    ${pair("Start Time:", formatTime(r.startTime), "Finish Time:", formatTime(r.finishTime))}
    ${loc ? row("Site Location:", loc) : ""}
  </table>

  <div class="block"><span class="label">Customer Complaint:</span><br/>${multiline(r.customerComplaint)}</div>
  <div class="block"><span class="label">Observation:</span><br/>${multiline(r.observation)}</div>

  <table>
    <tr><th width="45%">Description</th><th width="10%">Qty</th><th>Reason For Failure</th></tr>
    ${partRows
      .map(
        (p) =>
          `<tr><td>${esc(p.description)}</td><td>${esc(p.qty)}</td><td>${esc(p.reasonForFailure)}</td></tr>`,
      )
      .join("")}
  </table>

  <div class="block"><span class="label">Recommendations:</span><br/>${multiline(r.recommendations)}</div>
  <div class="block"><span class="label">Customer Remarks:</span><br/>${multiline(r.customerRemarks)}</div>

  <div class="auth-title">Authorization</div>
  <table><tr>${signatoryCell("Navalt Rep", r.navaltRep)}${signatoryCell("Customer Rep", r.customerRep)}</tr></table>

  <div class="foot">Generated ${formatDate(new Date().toISOString())} ${formatTime(new Date().toISOString())}</div>
  </body></html>`;
}

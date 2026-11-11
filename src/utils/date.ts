const pad = (n: number) => String(n).padStart(2, "0");
const parse = (iso?: string | null): Date | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
};

/** dd/mm/yyyy, matching the paper form */
export function formatDate(iso?: string | null): string {
  const d = parse(iso);
  return d
    ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
    : "";
}

/** hh:mm AM/PM */
export function formatTime(iso?: string | null): string {
  const d = parse(iso);
  if (!d) return "";
  const h = d.getHours();
  return `${pad(h % 12 || 12)}:${pad(d.getMinutes())} ${h >= 12 ? "PM" : "AM"}`;
}

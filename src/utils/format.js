const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

export function formatHours(value) {
  if (value === null || value === undefined) return "—";
  return `${numberFormat.format(Number(value))} h`;
}

export function formatNumber(value) {
  if (value === null || value === undefined) return "—";
  return numberFormat.format(Number(value));
}

export function formatPercent(value) {
  if (value === null || value === undefined) return "—";
  return `${numberFormat.format(Number(value))}%`;
}

// DateOnly comes as "2026-10-30"; parse the parts so the day never shifts with the browser time zone
export function formatDate(dateOnly, options = { day: "numeric", month: "short", year: "numeric" }) {
  if (!dateOnly) return "—";
  const [y, m, d] = dateOnly.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, options);
}

export function formatShortDate(dateOnly) {
  return formatDate(dateOnly, { day: "numeric", month: "short" });
}

export function formatWeekday(dateOnly) {
  return formatDate(dateOnly, { weekday: "short", day: "numeric", month: "short" });
}

// DateTime values are UTC; some come without the "Z" because EF reads them back as Unspecified
function parseUtc(dateTime) {
  if (!dateTime) return null;
  const hasZone = /[zZ]|[+-]\d\d:?\d\d$/.test(dateTime);
  return new Date(hasZone ? dateTime : `${dateTime}Z`);
}

export function formatDateTime(dateTime) {
  const date = parseUtc(dateTime);
  if (!date) return "—";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(dateTime) {
  const date = parseUtc(dateTime);
  if (!date) return "—";
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const units = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(-Math.floor(seconds / size), unit);
  }
  return "just now";
}

// "2026-10-30" helpers for <input type="date">
export function addDays(dateOnly, days) {
  const [y, m, d] = dateOnly.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function firstOfMonth(dateOnly) {
  return `${dateOnly.slice(0, 7)}-01`;
}

export function localToday() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

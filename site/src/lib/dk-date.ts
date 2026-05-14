/**
 * Danish-friendly date/time formatting in Europe/Copenhagen.
 */

const TZ = "Europe/Copenhagen";
const LOCALE = "da-DK";

export function formatHumanDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatHumanTime(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatHumanDateTime(iso: string): string {
  const d = new Date(iso);
  // e.g. "Tirsdag d. 20. maj 2026 kl. 14:00"
  const weekday = new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, weekday: "long" }).format(d);
  const dateStr = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${cap} d. ${dateStr} kl. ${time}`;
}

export function formatHumanShort(iso: string): string {
  // e.g. "Tirsdag 20. maj kl. 14:00"
  const d = new Date(iso);
  const weekday = new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, weekday: "long" }).format(d);
  const dateStr = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TZ,
    day: "numeric",
    month: "long",
  }).format(d);
  const time = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${cap} ${dateStr} kl. ${time}`;
}

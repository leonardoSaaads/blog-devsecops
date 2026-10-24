import { site } from "@/config/site";

const dateFormatter = new Intl.DateTimeFormat(site.locale, {
  day: "numeric",
  month: "long",
  year: "numeric",
  // ISO dates (YYYY-MM-DD) are midnight UTC; without pinning the time zone, readers
  // west of UTC would see the previous day.
  timeZone: "UTC",
});

const shortDateFormatter = new Intl.DateTimeFormat(site.locale, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "October 13, 2026" */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}

/** "Oct 13, 2026" */
export function formatShortDate(isoDate: string): string {
  return shortDateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

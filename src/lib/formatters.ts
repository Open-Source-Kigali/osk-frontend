/**
 * Formats a number with commas.
 * 1240 → "1,240"
 */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

/**
 * Appends a suffix to a number.
 * formatCount(100) → "100+"
 */
export function formatCount(n: number, suffix = "+"): string {
  return `${n}${suffix}`;
}

/**
 * Formats a community stat with a leading "+".
 * formatStat(1500) → "+1,500"
 */
export function formatStat(value: number): string {
  return `+${formatNumber(value)}`;
}

/**
 * Returns a capacity string.
 * formatCapacity(34, null) → "Unlimited"
 * formatCapacity(34, 80)   → "34 / 80"
 */
export function formatCapacity(
  filled: number,
  capacity: number | null
): string {
  if (!capacity) return "Unlimited";
  return `${filled} / ${capacity}`;
}

/**
 * Returns a spots remaining string.
 * formatSpotsLeft(34, 80)   → "46 spots remaining"
 * formatSpotsLeft(79, 80)   → "Only 1 spot left!"
 * formatSpotsLeft(34, null) → "Open registration"
 */
export function formatSpotsLeft(
  filled: number,
  capacity: number | null
): string {
  if (!capacity) return "Open registration";
  const left = capacity - filled;
  if (left <= 0) return "Fully booked";
  if (left <= 5) return `Only ${left} spot${left === 1 ? "" : "s"} left!`;
  return `${left} spots remaining`;
}

/**
 * Formats a date string for display.
 * "2025-07-26" → "July 26, 2025"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year:  "numeric",
    month: "long",
    day:   "numeric",
  });
}

/**
 * Returns a relative time string.
 * "2 hours ago", "1 day ago", "5 days ago"
 */
export function formatRelativeTime(dateStr: string): string {
  const date     = new Date(dateStr);
  const now      = new Date();
  const diffMs   = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs  = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 60)  return `${diffMins} min ago`;
  if (diffHrs  < 24)  return `${diffHrs} hour${diffHrs === 1 ? "" : "s"} ago`;
  if (diffDays < 7)   return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return formatDate(dateStr);
}

/**
 * Converts a view count to a compact string.
 * 1830 → "1.8k"
 */
export function formatViews(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

const MONTHS_SHORT = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const MONTHS_LONG = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

/**
 * Title-case a kebab-case slug. "kigali-community-hub" → "Kigali Community Hub"
 */
export function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Kebab-case slug from a free-form title.
 */
export function slugFromTitle(title: string, fallback = ""): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || fallback;
}

/**
 * Formats a date range for display.
 */
export function formatDateRange(start: Date, end: Date | null): {
  date: string; dateShort: string; day: number; month: string; year: number;
} {
  const sDay   = start.getUTCDate();
  const sMonth = start.getUTCMonth();
  const sYear  = start.getUTCFullYear();
  const monthShort = MONTHS_SHORT[sMonth];
  const monthLong  = MONTHS_LONG[sMonth];

  if (end && (end.getUTCDate() !== sDay || end.getUTCMonth() !== sMonth)) {
    const eDay = end.getUTCDate();
    const sameMonth = end.getUTCMonth() === sMonth;
    return {
      date:      sameMonth
        ? `${monthLong} ${sDay}–${eDay}, ${sYear}`
        : `${monthLong} ${sDay} – ${MONTHS_LONG[end.getUTCMonth()]} ${eDay}, ${sYear}`,
      dateShort: sameMonth
        ? `${monthShort.charAt(0)}${monthShort.slice(1).toLowerCase()} ${sDay}–${eDay}`
        : `${monthShort} ${sDay} – ${MONTHS_SHORT[end.getUTCMonth()]} ${eDay}`,
      day:   sDay,
      month: monthShort,
      year:  sYear,
    };
  }

  return {
    date:      `${monthLong} ${sDay}, ${sYear}`,
    dateShort: `${monthShort.charAt(0)}${monthShort.slice(1).toLowerCase()} ${sDay}`,
    day:       sDay,
    month:     monthShort,
    year:      sYear,
  };
}
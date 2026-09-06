const DAY_MS = 24 * 60 * 60 * 1000;

/** Local YYYY-MM-DD for "today", not UTC — avoids off-by-one near midnight. */
export function todayISO(): string {
  return toISODate(new Date());
}

export function offsetFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysSince(iso: string): number {
  const then = parseISODate(iso);
  const now = parseISODate(todayISO());
  return Math.max(0, Math.round((now.getTime() - then.getTime()) / DAY_MS));
}

export function daysUntil(iso: string): number {
  const target = parseISODate(iso);
  const now = parseISODate(todayISO());
  return Math.round((target.getTime() - now.getTime()) / DAY_MS);
}

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_LETTER = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAME = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatWeekdayShort(iso: string): string {
  return WEEKDAY_SHORT[parseISODate(iso).getDay()];
}

export function formatMonthYear(year: number, month: number): string {
  return `${MONTH_NAME[month]} ${year}`;
}

export function formatDueLabel(iso: string): string {
  const d = parseISODate(iso);
  return `${WEEKDAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}

export interface CalendarDay {
  date: number;
  iso: string;
  isToday: boolean;
  inMonth: boolean;
  hasDue: boolean;
}

/** Monday-first calendar grid for the given month, padded to full weeks. */
export function buildMonthGrid(
  year: number,
  month: number,
  dueDates: Set<string>
): { weekdayLetters: string[]; days: CalendarDay[] } {
  const today = todayISO();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: CalendarDay[] = [];

  for (let i = 0; i < startOffset; i++) {
    days.push({ date: 0, iso: "", isToday: false, inMonth: false, hasDue: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = toISODate(new Date(year, month, d));
    days.push({
      date: d,
      iso,
      isToday: iso === today,
      inMonth: true,
      hasDue: dueDates.has(iso),
    });
  }
  while (days.length % 7 !== 0) {
    days.push({ date: 0, iso: "", isToday: false, inMonth: false, hasDue: false });
  }

  return { weekdayLetters: WEEKDAY_LETTER.slice(1).concat(WEEKDAY_LETTER[0]), days };
}

/** Turns content.ts copy and data into display strings. */
import { calendar, copy, defaults } from "@/constants/content";
import { dateOf, dayOfMonth, monthOf, weekdayOf } from "./dates";
import type { DateKey } from "./types";

/** Swaps {placeholders} in a content.ts string for values. */
export function fill(template: string, values: Record<string, string | number>) {
  return template
    .replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match))
    .replace(/ {2,}/g, " ")
    .trim();
}

type DatePattern = "long" | "short" | "withWeekday";

/** "Thursday, October 15", "Oct 15" or "Thu, Oct 15" (patterns live in content.ts → calendar). */
export function formatDate(key: DateKey, pattern: DatePattern = "short") {
  const weekday = weekdayOf(key);
  const month = monthOf(key);
  return fill(calendar[pattern], {
    weekday: calendar.weekdays[weekday],
    wd: calendar.weekdaysShort[weekday],
    month: calendar.months[month],
    mon: calendar.monthsShort[month],
    day: dayOfMonth(key),
    year: dateOf(key).getFullYear(),
  });
}

/** "07:30" → "7:30 AM" (or "07:30" with a 24-hour clock). */
export function formatTime(time: string, clock = defaults.clock) {
  const [h, m] = time.split(":").map(Number);
  if (clock === "24h") return time;
  const suffix = h < 12 ? calendar.am : calendar.pm;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "Every day", "Weekdays", "Weekends" or "Mon, Wed, Fri" in the week's order. */
export function formatSchedule(days: number[], weekStart: 0 | 1) {
  const set = new Set(days);
  if (set.size === 7) return copy.common.everyDay;
  if (set.size === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d))) return copy.common.weekdays;
  if (set.size === 2 && set.has(0) && set.has(6)) return copy.common.weekends;
  return [0, 1, 2, 3, 4, 5, 6]
    .map((i) => (i + weekStart) % 7)
    .filter((d) => set.has(d))
    .map((d) => calendar.weekdaysShort[d])
    .join(", ");
}

/** "Good morning, Maya" from the hour of the day. */
export function greeting(name: string, hour = new Date().getHours()) {
  const g = copy.greeting;
  const template = hour < 5 ? g.night : hour < 12 ? g.morning : hour < 17 ? g.afternoon : hour < 22 ? g.evening : g.night;
  const trimmed = name.trim();
  // No name yet: "Good morning, {name}" becomes "Good morning".
  return trimmed ? fill(template, { name: trimmed }) : template.replace(/,?\s*\{name\}/, "");
}

export function percent(share: number) {
  return fill(copy.common.percent, { n: Math.round(share * 100) });
}

/** "1 day" / "12 days" with the unit words from content.ts. */
export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

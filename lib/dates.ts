/**
 * Calendar days as "YYYY-MM-DD" keys in local time. Days are built at noon so
 * daylight-saving shifts never move a date to the day before or after.
 */
import type { DateKey } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

export function keyOf(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function dateOf(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

export function todayKey(): DateKey {
  return keyOf(new Date());
}

export function addDays(key: DateKey, days: number): DateKey {
  const date = dateOf(key);
  date.setDate(date.getDate() + days);
  return keyOf(date);
}

/** 0 = Sunday … 6 = Saturday. */
export function weekdayOf(key: DateKey): number {
  return dateOf(key).getDay();
}

/** Whole days from `a` to `b` (positive when b is later). */
export function daysBetween(a: DateKey, b: DateKey): number {
  return Math.round((dateOf(b).getTime() - dateOf(a).getTime()) / 86_400_000);
}

/** The first day of the week holding `key`. */
export function startOfWeek(key: DateKey, weekStart: 0 | 1): DateKey {
  return addDays(key, -((weekdayOf(key) - weekStart + 7) % 7));
}

/** Every day from `from` to `to`, both included. */
export function daysFrom(from: DateKey, to: DateKey): DateKey[] {
  const days: DateKey[] = [];
  for (let key = from; key <= to; key = addDays(key, 1)) days.push(key);
  return days;
}

export function monthOf(key: DateKey): number {
  return Number(key.slice(5, 7)) - 1;
}

export function dayOfMonth(key: DateKey): number {
  return Number(key.slice(8, 10));
}

/** "HH:MM" → minutes after midnight. */
export function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Minutes after midnight → "HH:MM", wrapping around the day. */
export function timeOf(minutes: number): string {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  return `${pad(Math.floor(wrapped / 60))}:${pad(wrapped % 60)}`;
}

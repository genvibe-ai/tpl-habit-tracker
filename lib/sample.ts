/**
 * The sample garden: the habits in content.ts → sampleHabits with a few months
 * of believable history ending today, so every screen looks lived-in on first
 * launch. A seeded random generator makes it the same on every device.
 */
import { defaults, sampleHabits, user } from "@/constants/content";
import { addDays, weekdayOf } from "./dates";
import type { Checkins, DateKey, Habit, Prefs } from "./types";

/** mulberry32, seeded from a string. */
function seeded(text: string) {
  let seed = 2166136261;
  for (let i = 0; i < text.length; i++) seed = Math.imul(seed ^ text.charCodeAt(i), 16777619);
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function defaultPrefs(): Prefs {
  return {
    onboarded: false,
    name: user.name,
    theme: defaults.theme,
    weekStart: defaults.weekStart,
    haptics: true,
    dailyReminder: "20:30",
    streakSaver: true,
  };
}

export function sampleGarden(today: DateKey, days = defaults.sampleDays) {
  const start = addDays(today, -(days - 1));
  const habits: Habit[] = [];
  const checkins: Checkins = {};

  sampleHabits.forEach((sample, index) => {
    const { history, ...fields } = sample;
    habits.push({ ...fields, days: [...fields.days], createdAt: start, archived: false, position: index });

    const planned = (day: DateKey) => sample.days.includes(weekdayOf(day));
    const random = seeded(sample.id);
    const log: Record<DateKey, number> = {};

    // The running streak: today (when done) plus the planned days before it,
    // then one missed day so the streak is exactly `history.streak`.
    const streak = new Set<DateKey>();
    let remaining = history.streak;
    let breakDay: DateKey | null = null;
    if (planned(today) && history.today === "done" && remaining > 0) {
      streak.add(today);
      remaining--;
    }
    for (let day = addDays(today, -1); day >= start; day = addDays(day, -1)) {
      if (!planned(day)) continue;
      if (remaining > 0) {
        streak.add(day);
        remaining--;
      } else {
        breakDay = day;
        break;
      }
    }

    for (let i = 0; i < days - 1; i++) {
      const day = addDays(start, i);
      if (!planned(day)) continue;
      // Habits start shakier and settle in over the first seven weeks.
      const chance = history.rate * (0.58 + 0.42 * Math.min(1, i / 50));
      const done = streak.has(day) || (day !== breakDay && random() < chance);
      if (done) log[day] = sample.goal;
      else if (sample.goal > 1) {
        const partial = Math.floor(random() * sample.goal * 0.85);
        if (partial > 0) log[day] = partial;
      }
    }

    if (planned(today)) {
      if (history.today === "done") log[today] = sample.goal;
      if (history.today === "partial" && sample.goal > 1) log[today] = Math.ceil(sample.goal * 0.6);
    }
    checkins[sample.id] = log;
  });

  return { habits, checkins };
}

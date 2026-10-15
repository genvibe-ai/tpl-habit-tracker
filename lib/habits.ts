/**
 * Streaks, completion, strength and day summaries, worked out from the saved
 * check-ins. Pure functions: no storage, no React.
 *
 * A habit is "planned" on its scheduled weekdays from the day it was created.
 * Today never breaks a streak or lowers a rate until it is over: an
 * unfinished today is simply still in progress.
 */
import { growth } from "@/constants/content";
import { addDays, startOfWeek, weekdayOf } from "./dates";
import type { Checkins, DateKey, Habit } from "./types";

export function isPlanned(habit: Habit, day: DateKey) {
  return day >= habit.createdAt && habit.days.includes(weekdayOf(day));
}

export function countOn(checkins: Checkins, habitId: string, day: DateKey) {
  return checkins[habitId]?.[day] ?? 0;
}

/** 0..1: how much of the day's goal is done. */
export function progressOn(habit: Habit, checkins: Checkins, day: DateKey) {
  return Math.min(1, countOn(checkins, habit.id, day) / Math.max(1, habit.goal));
}

export function isDoneOn(habit: Habit, checkins: Checkins, day: DateKey) {
  return countOn(checkins, habit.id, day) >= habit.goal;
}

/** Habits shown on a day: not archived, already created, in Today order. */
export function habitsFor(habits: Habit[], day: DateKey) {
  return habits
    .filter((h) => !h.archived && day >= h.createdAt)
    .sort((a, b) => a.position - b.position);
}

/** Planned days done in a row up to today. */
export function currentStreak(habit: Habit, checkins: Checkins, today: DateKey) {
  let streak = 0;
  let day = today;
  if (isPlanned(habit, day) && !isDoneOn(habit, checkins, day)) day = addDays(day, -1);
  while (day >= habit.createdAt) {
    if (isPlanned(habit, day)) {
      if (!isDoneOn(habit, checkins, day)) break;
      streak++;
    }
    day = addDays(day, -1);
  }
  return streak;
}

export function bestStreak(habit: Habit, checkins: Checkins, today: DateKey) {
  let best = 0;
  let run = 0;
  for (let day = habit.createdAt; day <= today; day = addDays(day, 1)) {
    if (!isPlanned(habit, day)) continue;
    if (isDoneOn(habit, checkins, day)) best = Math.max(best, ++run);
    else if (day !== today) run = 0;
  }
  return best;
}

/** Share of the planned days in a range that got done (partial days count partly). Null when nothing was planned. */
export function completion(habit: Habit, checkins: Checkins, from: DateKey, to: DateKey, today: DateKey) {
  let planned = 0;
  let done = 0;
  const start = from < habit.createdAt ? habit.createdAt : from;
  const end = to > today ? today : to;
  for (let day = start; day <= end; day = addDays(day, 1)) {
    if (!isPlanned(habit, day)) continue;
    const progress = progressOn(habit, checkins, day);
    if (day === today && progress < 1) continue;
    planned++;
    done += progress;
  }
  return planned ? done / planned : null;
}

/** Days the habit was fully done. */
export function totalDone(habit: Habit, checkins: Checkins) {
  const days = checkins[habit.id] ?? {};
  return Object.values(days).filter((count) => count >= habit.goal).length;
}

/**
 * Habit strength, 0..1, for every day since the habit began. Each planned day
 * moves it a little toward that day's progress, so about three steady weeks
 * reach 75% and one missed day only dents it.
 */
const KEEP = 0.936;

export function strengthByDay(habit: Habit, checkins: Checkins, today: DateKey) {
  const strength: Record<DateKey, number> = {};
  let value = 0;
  for (let day = habit.createdAt; day <= today; day = addDays(day, 1)) {
    if (isPlanned(habit, day)) {
      const progress = progressOn(habit, checkins, day);
      if (!(day === today && progress < 1)) value = value * KEEP + (1 - KEEP) * progress;
    }
    strength[day] = value;
  }
  return strength;
}

export function strengthNow(habit: Habit, checkins: Checkins, today: DateKey) {
  return strengthByDay(habit, checkins, today)[today] ?? 0;
}

/** The growth stage (content.ts → growth) for a strength value. */
export function stageFor(strength: number) {
  return [...growth].reverse().find((stage) => strength >= stage.from) ?? growth[0];
}

/** Completion for each of the last `weeks` weeks, oldest first. */
export function weeklyCompletion(
  habit: Habit,
  checkins: Checkins,
  today: DateKey,
  weekStart: 0 | 1,
  weeks = 12,
) {
  const thisWeek = startOfWeek(today, weekStart);
  return Array.from({ length: weeks }, (_, i) => {
    const start = addDays(thisWeek, -7 * (weeks - 1 - i));
    return { start, rate: completion(habit, checkins, start, addDays(start, 6), today) };
  });
}

/** For one day: how many habits were planned, how many got done, and the summed progress. */
export function daySummary(habits: Habit[], checkins: Checkins, day: DateKey) {
  let planned = 0;
  let done = 0;
  let progress = 0;
  for (const habit of habits) {
    if (habit.archived || !isPlanned(habit, day)) continue;
    planned++;
    const p = progressOn(habit, checkins, day);
    progress += p;
    if (p >= 1) done++;
  }
  return { planned, done, progress, share: planned ? progress / planned : 0 };
}

/** Completion, perfect days and check-ins across every active habit in a range. */
export function rangeSummary(habits: Habit[], checkins: Checkins, from: DateKey, to: DateKey, today: DateKey) {
  let planned = 0;
  let progress = 0;
  let perfect = 0;
  let checks = 0;
  for (let day = from; day <= to && day <= today; day = addDays(day, 1)) {
    const summary = daySummary(habits, checkins, day);
    checks += summary.done;
    if (day === today && summary.done < summary.planned) {
      // Today still counts what is finished, but does not lower the rate yet.
      continue;
    }
    planned += summary.planned;
    progress += summary.progress;
    if (summary.planned > 0 && summary.done === summary.planned) perfect++;
  }
  return { completion: planned ? progress / planned : null, perfect, checkins: checks };
}

/** Completion by weekday (index 0 = Sunday) over a range. */
export function weekdayCompletion(habits: Habit[], checkins: Checkins, from: DateKey, to: DateKey, today: DateKey) {
  const planned = Array(7).fill(0);
  const progress = Array(7).fill(0);
  for (let day = from; day <= to && day < today; day = addDays(day, 1)) {
    const weekday = weekdayOf(day);
    for (const habit of habits) {
      if (habit.archived || !isPlanned(habit, day)) continue;
      planned[weekday]++;
      progress[weekday] += progressOn(habit, checkins, day);
    }
  }
  return planned.map((n, i) => (n ? progress[i] / n : null));
}

/** Heatmap level 0..4 for one habit on one day (done days deepen with strength). */
export function habitHeatLevel(
  habit: Habit,
  checkins: Checkins,
  strength: Record<DateKey, number>,
  day: DateKey,
): 0 | 1 | 2 | 3 | 4 {
  const progress = progressOn(habit, checkins, day);
  if (progress <= 0) return 0;
  if (progress < 1) return 1;
  const value = strength[day] ?? 0;
  return value >= 0.75 ? 4 : value >= 0.45 ? 3 : 2;
}

/** Heatmap level 0..4 for a day across habits (share of the plan done). */
export function dayHeatLevel(share: number): 0 | 1 | 2 | 3 | 4 {
  if (share <= 0) return 0;
  if (share < 0.34) return 1;
  if (share < 0.67) return 2;
  if (share < 1) return 3;
  return 4;
}

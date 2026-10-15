import type { IconName } from "@/constants/icons";

/** A calendar day in local time, "YYYY-MM-DD". Sorts and compares as a string. */
export type DateKey = string;

export type PartOfDay = "morning" | "afternoon" | "evening" | "anytime";
export type ThemePref = "dark" | "light" | "system";

export type Habit = {
  id: string;
  name: string;
  /** Why it matters, shown on the habit's page. May be empty. */
  note: string;
  icon: IconName;
  /** "#RRGGBB" */
  color: string;
  /** Times per day. 1 is a simple check-off; 8 could be "8 glasses". */
  goal: number;
  /** What one time is called when goal > 1, e.g. "glasses". */
  unit: string;
  /** Scheduled weekdays, 0 = Sunday … 6 = Saturday. All seven = every day. */
  days: number[];
  part: PartOfDay;
  /** Reminder time "HH:MM" (24 h), or null for none. */
  reminder: string | null;
  createdAt: DateKey;
  archived: boolean;
  /** Order on the Today screen (lower first). */
  position: number;
};

/** The editable fields of a habit (Add/Edit screen). */
export type HabitDraft = Pick<
  Habit,
  "name" | "note" | "icon" | "color" | "goal" | "unit" | "days" | "part" | "reminder"
>;

/** checkins[habitId][date] = how many times the habit was done that day. Missing = 0. */
export type Checkins = Record<string, Record<DateKey, number>>;

export type Prefs = {
  onboarded: boolean;
  name: string;
  theme: ThemePref;
  /** 0 = weeks start on Sunday, 1 = Monday. */
  weekStart: 0 | 1;
  haptics: boolean;
  /** Daily check-in reminder "HH:MM", or null when off. */
  dailyReminder: string | null;
  /** Evening nudge when a streak is about to break. */
  streakSaver: boolean;
};

/** Everything the app saves on the device. */
export type Snapshot = {
  habits: Habit[];
  checkins: Checkins;
  prefs: Prefs;
};

/** What lib/storage.ts (SQLite) and lib/storage.web.ts (localStorage) both provide. */
export type GardenStorage = {
  /** The saved garden, or null on first launch. */
  load(): Snapshot | null;
  replaceAll(snapshot: Snapshot): void;
  saveHabit(habit: Habit): void;
  /** Removes the habit and all of its check-ins. */
  removeHabit(id: string): void;
  /** Saves one day's count; 0 removes the day. */
  saveCheckin(habitId: string, day: DateKey, count: number): void;
  savePrefs(prefs: Prefs): void;
};

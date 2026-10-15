/**
 * Web preview: SQLite in the browser needs cross-origin isolation headers, so
 * the web build keeps the same garden as one JSON document in localStorage.
 * When the browser refuses storage (some private windows), everything still
 * works in memory for the session. iOS and Android use storage.ts (SQLite).
 */
import { defaultPrefs } from "./sample";
import type { GardenStorage, Snapshot } from "./types";

const KEY = "tendril.garden.v1";

let current: Snapshot | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

function local() {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function flush() {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!current) return;
  try {
    local()?.setItem(KEY, JSON.stringify(current));
  } catch {
    // Quota or privacy settings: keep going in memory.
  }
}

/** Batches quick taps into one write. */
function saveSoon() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, 150);
}

if (typeof window !== "undefined") window.addEventListener("pagehide", flush);

const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export const storage: GardenStorage = {
  load() {
    try {
      const raw = local()?.getItem(KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw) as Snapshot;
      saved.prefs = { ...defaultPrefs(), ...saved.prefs };
      current = copy(saved);
      return saved;
    } catch {
      return null;
    }
  },

  replaceAll(snapshot) {
    current = copy(snapshot);
    saveSoon();
  },

  saveHabit(habit) {
    if (!current) return;
    const index = current.habits.findIndex((h) => h.id === habit.id);
    if (index >= 0) current.habits[index] = copy(habit);
    else current.habits.push(copy(habit));
    saveSoon();
  },

  removeHabit(id) {
    if (!current) return;
    current.habits = current.habits.filter((h) => h.id !== id);
    delete current.checkins[id];
    saveSoon();
  },

  saveCheckin(habitId, day, count) {
    if (!current) return;
    const days = (current.checkins[habitId] ??= {});
    if (count > 0) days[day] = count;
    else delete days[day];
    saveSoon();
  },

  savePrefs(prefs) {
    if (!current) return;
    current.prefs = copy(prefs);
    saveSoon();
  },
};

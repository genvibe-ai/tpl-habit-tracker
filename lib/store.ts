/**
 * The garden: habits, check-ins and preferences in one zustand store. State
 * changes first (so the UI answers instantly), then the change is written to
 * the device (lib/storage.ts on iOS/Android, lib/storage.web.ts on the web).
 *
 * In components, select the raw slices (`useGarden((s) => s.habits)`) and
 * derive lists with useMemo: selectors that build new arrays re-render forever.
 */
import { create } from "zustand";
import { suggestedHabits, user } from "@/constants/content";
import { todayKey } from "./dates";
import { defaultPrefs, sampleGarden } from "./sample";
import { storage } from "./storage";
import type { DateKey, Habit, HabitDraft, Prefs, Snapshot } from "./types";

type Actions = {
  /** Sets how many times a habit was done on a day (0 clears the day). */
  setCount: (habitId: string, day: DateKey, count: number) => void;
  /** Creates a habit and returns its id. */
  addHabit: (draft: HabitDraft) => string;
  updateHabit: (id: string, draft: Partial<HabitDraft>) => void;
  setArchived: (id: string, archived: boolean) => void;
  deleteHabit: (id: string) => void;
  setPrefs: (patch: Partial<Prefs>) => void;
  /** Applies the onboarding choices and opens the app. */
  finishOnboarding: (choice: { keep: string[]; add: number[]; name: string; reminder: string | null }) => void;
  /** Puts the sample garden back (preferences are kept). */
  restoreSample: () => void;
  /** Deletes every habit and check-in (preferences are kept). */
  eraseAll: () => void;
};

export type Garden = Snapshot & Actions;

function boot(): Snapshot {
  const saved = storage.load();
  if (saved) return saved;
  const fresh: Snapshot = { ...sampleGarden(todayKey()), prefs: defaultPrefs() };
  storage.replaceAll(fresh);
  return fresh;
}

let created = 0;
const newId = () => `h_${Date.now().toString(36)}${(created++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const useGarden = create<Garden>()((set, get) => {
  /** Saves new habit objects that changed after a `set`. */
  const saveHabits = (before: Habit[]) => {
    for (const habit of get().habits) if (!before.includes(habit)) storage.saveHabit(habit);
  };

  return {
    ...boot(),

    setCount: (habitId, day, count) => {
      const value = Math.max(0, Math.round(count));
      set((state) => {
        const days = { ...state.checkins[habitId] };
        if (value > 0) days[day] = value;
        else delete days[day];
        return { checkins: { ...state.checkins, [habitId]: days } };
      });
      storage.saveCheckin(habitId, day, value);
    },

    addHabit: (draft) => {
      const { habits } = get();
      const habit: Habit = {
        ...draft,
        id: newId(),
        createdAt: todayKey(),
        archived: false,
        position: habits.reduce((max, h) => Math.max(max, h.position), -1) + 1,
      };
      set({ habits: [...habits, habit] });
      storage.saveHabit(habit);
      return habit.id;
    },

    updateHabit: (id, draft) => {
      const before = get().habits;
      set({ habits: before.map((h) => (h.id === id ? { ...h, ...draft } : h)) });
      saveHabits(before);
    },

    setArchived: (id, archived) => {
      const before = get().habits;
      set({ habits: before.map((h) => (h.id === id ? { ...h, archived } : h)) });
      saveHabits(before);
    },

    deleteHabit: (id) => {
      set((state) => {
        const { [id]: _removed, ...checkins } = state.checkins;
        return { habits: state.habits.filter((h) => h.id !== id), checkins };
      });
      storage.removeHabit(id);
    },

    setPrefs: (patch) => {
      const prefs = { ...get().prefs, ...patch };
      set({ prefs });
      storage.savePrefs(prefs);
    },

    finishOnboarding: ({ keep, add, name, reminder }) => {
      const before = get().habits;
      const kept = new Set(keep);
      let position = before.reduce((max, h) => Math.max(max, h.position), -1);
      const added: Habit[] = add
        .map((i) => suggestedHabits[i])
        .filter(Boolean)
        .map((idea) => ({
          ...idea,
          days: [...idea.days],
          id: newId(),
          createdAt: todayKey(),
          archived: false,
          position: ++position,
        }));
      const habits = [
        ...before.map((h) => (h.archived || kept.has(h.id) ? h : { ...h, archived: true })),
        ...added,
      ];
      const prefs = { ...get().prefs, name: name.trim() || user.name, dailyReminder: reminder, onboarded: true };
      set({ habits, prefs });
      saveHabits(before);
      storage.savePrefs(prefs);
    },

    restoreSample: () => {
      const { prefs } = get();
      const fresh: Snapshot = { ...sampleGarden(todayKey()), prefs };
      set(fresh);
      storage.replaceAll(fresh);
    },

    eraseAll: () => {
      const fresh: Snapshot = { habits: [], checkins: {}, prefs: get().prefs };
      set(fresh);
      storage.replaceAll(fresh);
    },
  };
});

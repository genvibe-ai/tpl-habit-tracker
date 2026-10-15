/**
 * iOS and Android: the garden lives in a SQLite database on the device
 * (expo-sqlite ships in Expo Go). Calls are synchronous and tiny, so the
 * habits are there on the very first frame. The web build uses
 * storage.web.ts instead, because SQLite in the browser needs special
 * server headers.
 *
 * Tables: habits (one row per habit), checkins (habit_id + date → count) and
 * prefs (a JSON blob). Bump SCHEMA_VERSION and add a step to migrate() when
 * the tables change.
 */
import * as SQLite from "expo-sqlite";
import type { IconName } from "@/constants/icons";
import { defaultPrefs } from "./sample";
import type { Checkins, GardenStorage, Habit, PartOfDay, Prefs, Snapshot } from "./types";

const SCHEMA_VERSION = 1;

type HabitRow = {
  id: string;
  name: string;
  note: string;
  icon: string;
  color: string;
  goal: number;
  unit: string;
  days: string;
  part: string;
  reminder: string | null;
  created_at: string;
  archived: number;
  position: number;
};

const HABIT_COLUMNS = "id, name, note, icon, color, goal, unit, days, part, reminder, created_at, archived, position";
const UPSERT_HABIT = `INSERT OR REPLACE INTO habits (${HABIT_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const UPSERT_CHECKIN =
  "INSERT INTO checkins (habit_id, date, count) VALUES (?, ?, ?) ON CONFLICT (habit_id, date) DO UPDATE SET count = excluded.count";

function migrate(db: SQLite.SQLiteDatabase) {
  const version = db.getFirstSync<{ user_version: number }>("PRAGMA user_version")?.user_version ?? 0;
  if (version >= SCHEMA_VERSION) return;
  if (version < 1) {
    db.execSync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        goal INTEGER NOT NULL DEFAULT 1,
        unit TEXT NOT NULL DEFAULT '',
        days TEXT NOT NULL DEFAULT '[0,1,2,3,4,5,6]',
        part TEXT NOT NULL DEFAULT 'anytime',
        reminder TEXT,
        created_at TEXT NOT NULL,
        archived INTEGER NOT NULL DEFAULT 0,
        position INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS checkins (
        habit_id TEXT NOT NULL,
        date TEXT NOT NULL,
        count INTEGER NOT NULL,
        PRIMARY KEY (habit_id, date)
      );
      CREATE TABLE IF NOT EXISTS prefs (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
  }
  // Later versions: if (version < 2) db.execSync("ALTER TABLE habits ADD COLUMN …");
  db.execSync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

function open() {
  try {
    const db = SQLite.openDatabaseSync("tendril.db");
    migrate(db);
    return db;
  } catch (error) {
    console.warn("[tendril] SQLite is unavailable; changes will not be saved.", error);
    return null;
  }
}

const db = open();

const toRow = (h: Habit) => [
  h.id,
  h.name,
  h.note,
  h.icon,
  h.color,
  h.goal,
  h.unit,
  JSON.stringify(h.days),
  h.part,
  h.reminder,
  h.createdAt,
  h.archived ? 1 : 0,
  h.position,
];

function fromRow(row: HabitRow): Habit {
  let days: number[];
  try {
    days = JSON.parse(row.days);
  } catch {
    days = [0, 1, 2, 3, 4, 5, 6];
  }
  return {
    id: row.id,
    name: row.name,
    note: row.note,
    icon: row.icon as IconName,
    color: row.color,
    goal: row.goal,
    unit: row.unit,
    days,
    part: row.part as PartOfDay,
    reminder: row.reminder,
    createdAt: row.created_at,
    archived: row.archived === 1,
    position: row.position,
  };
}

/** Runs a write; a failed write is logged, never thrown into the UI. */
function write(task: (db: SQLite.SQLiteDatabase) => void) {
  if (!db) return;
  try {
    task(db);
  } catch (error) {
    console.warn("[tendril] Could not save a change.", error);
  }
}

export const storage: GardenStorage = {
  load() {
    if (!db) return null;
    try {
      const prefsRow = db.getFirstSync<{ value: string }>("SELECT value FROM prefs WHERE key = 'prefs'");
      if (!prefsRow) return null;
      let prefs: Prefs;
      try {
        prefs = { ...defaultPrefs(), ...JSON.parse(prefsRow.value) };
      } catch {
        prefs = { ...defaultPrefs(), onboarded: true };
      }
      const habits = db.getAllSync<HabitRow>("SELECT * FROM habits ORDER BY position").map(fromRow);
      const checkins: Checkins = {};
      for (const row of db.getAllSync<{ habit_id: string; date: string; count: number }>(
        "SELECT habit_id, date, count FROM checkins",
      )) {
        (checkins[row.habit_id] ??= {})[row.date] = row.count;
      }
      return { habits, checkins, prefs };
    } catch (error) {
      console.warn("[tendril] Could not read saved habits.", error);
      return null;
    }
  },

  replaceAll(snapshot: Snapshot) {
    write((db) =>
      db.withTransactionSync(() => {
        db.execSync("DELETE FROM checkins; DELETE FROM habits; DELETE FROM prefs;");
        const insertHabit = db.prepareSync(UPSERT_HABIT);
        const insertCheckin = db.prepareSync(UPSERT_CHECKIN);
        try {
          for (const habit of snapshot.habits) insertHabit.executeSync(toRow(habit));
          for (const [habitId, days] of Object.entries(snapshot.checkins)) {
            for (const [date, count] of Object.entries(days)) {
              if (count > 0) insertCheckin.executeSync([habitId, date, count]);
            }
          }
        } finally {
          insertHabit.finalizeSync();
          insertCheckin.finalizeSync();
        }
        db.runSync("INSERT OR REPLACE INTO prefs (key, value) VALUES ('prefs', ?)", [JSON.stringify(snapshot.prefs)]);
      }),
    );
  },

  saveHabit(habit) {
    write((db) => db.runSync(UPSERT_HABIT, toRow(habit)));
  },

  removeHabit(id) {
    write((db) =>
      db.withTransactionSync(() => {
        db.runSync("DELETE FROM checkins WHERE habit_id = ?", [id]);
        db.runSync("DELETE FROM habits WHERE id = ?", [id]);
      }),
    );
  },

  saveCheckin(habitId, day, count) {
    write((db) =>
      count > 0
        ? db.runSync(UPSERT_CHECKIN, [habitId, day, count])
        : db.runSync("DELETE FROM checkins WHERE habit_id = ? AND date = ?", [habitId, day]),
    );
  },

  savePrefs(prefs) {
    write((db) => db.runSync("INSERT OR REPLACE INTO prefs (key, value) VALUES ('prefs', ?)", [JSON.stringify(prefs)]));
  },
};

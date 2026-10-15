/**
 * Rootwell: the brand, colors, sample habits and every word on screen live in
 * this one file. Rebrand the app by editing the values below; every screen
 * reads from here. (Fonts: constants/theme.ts. Icons: constants/icons.ts.)
 *
 * Copy can hold {placeholders}; lib/format.ts → fill() swaps the values in.
 * Rootwell, Maya and the sample habits are fictional.
 */
import type { PartOfDay, ThemePref } from "@/lib/types";
import type { IconName } from "./icons";

export const brand = {
  name: "Rootwell",
  tagline: "Habits that grow",
  version: "1.0.0",
};

/** The name in greetings until people type their own during onboarding. */
export const user = { name: "Maya" };

export const defaults = {
  /** Dark is the signature look; people can switch in Settings. */
  theme: "dark" as ThemePref,
  /** 1 = weeks start on Monday, 0 = Sunday. */
  weekStart: 1 as 0 | 1,
  clock: "12h" as "12h" | "24h",
  /** Days of sample history created on first launch. */
  sampleDays: 120,
};

export type Palette = {
  /** Screen background. */
  background: string;
  /** Cards. */
  surface: string;
  /** Chips, inputs, pressed states and tracks. */
  raised: string;
  /** Hairlines and card borders. */
  line: string;
  text: string;
  muted: string;
  faint: string;
  /** Leaf green: progress, primary buttons, the selected tab. */
  accent: string;
  /** The accent when it is text (darker in light mode for contrast). */
  accentText: string;
  /** Text and icons on top of the accent. */
  onAccent: string;
  /** Check marks drawn on top of a habit's own color. */
  onColor: string;
  /** Streak flames. */
  flame: string;
  danger: string;
  /** Heatmap shades: empty, then four steps from a little to everything. */
  heat: [string, string, string, string, string];
  /** The progress ring's gradient, start to end. */
  ring: [string, string, string];
};

export const palettes: { dark: Palette; light: Palette } = {
  dark: {
    background: "#0B0F0C",
    surface: "#121813",
    raised: "#1A231C",
    line: "#DDF5E41A",
    text: "#ECF3EE",
    muted: "#9AAB9F",
    faint: "#627268",
    accent: "#4ADE80",
    accentText: "#4ADE80",
    onAccent: "#052E16",
    onColor: "#0B140E",
    flame: "#FFAD5C",
    danger: "#FF8080",
    heat: ["#18211A", "#123D35", "#176B52", "#2FB36C", "#A6E86A"],
    ring: ["#B8F26E", "#4ADE80", "#2DD4BF"],
  },
  light: {
    background: "#F3F6F2",
    surface: "#FFFFFF",
    raised: "#E8EEE8",
    line: "#0B1F121A",
    text: "#0E1A12",
    muted: "#536459",
    faint: "#86958B",
    accent: "#22C55E",
    accentText: "#15803D",
    onAccent: "#052E16",
    onColor: "#0B140E",
    flame: "#EA7A12",
    danger: "#C2410C",
    heat: ["#E2E9E3", "#D3F2C2", "#93DDAA", "#3EBF86", "#0F8C72"],
    ring: ["#7EDB5A", "#22C55E", "#0F9F80"],
  },
};

/** Colors people can give a habit. */
export const habitColors = [
  { name: "Leaf", hex: "#4ADE80" },
  { name: "Lime", hex: "#A3E635" },
  { name: "Teal", hex: "#2DD4BF" },
  { name: "Sky", hex: "#60A5FA" },
  { name: "Iris", hex: "#818CF8" },
  { name: "Lilac", hex: "#C084FC" },
  { name: "Rose", hex: "#FB7185" },
  { name: "Coral", hex: "#FB923C" },
  { name: "Honey", hex: "#FBBF24" },
  { name: "Sage", hex: "#9DB89A" },
];

/** Icons in the habit picker, in order. Add more in constants/icons.ts first. */
export const habitIcons: IconName[] = [
  "glass-water",
  "footprints",
  "dumbbell",
  "person-standing",
  "bike",
  "heart-pulse",
  "wind",
  "brain",
  "book-open",
  "notebook-pen",
  "pen-line",
  "languages",
  "graduation-cap",
  "code",
  "lightbulb",
  "salad",
  "apple",
  "coffee",
  "chef-hat",
  "pill",
  "moon",
  "bed",
  "sun",
  "sunrise",
  "phone-off",
  "music",
  "guitar",
  "palette",
  "camera",
  "flower-2",
  "sprout",
  "leaf",
  "dog",
  "house",
  "hand-heart",
  "piggy-bank",
  "timer",
  "target",
  "sparkles",
];

/** Typing a habit name picks a fitting icon, until people choose one themselves. */
export const iconHints: { words: string[]; icon: IconName }[] = [
  { words: ["water", "drink", "hydrat"], icon: "glass-water" },
  { words: ["walk", "step", "run", "jog", "hike"], icon: "footprints" },
  { words: ["gym", "lift", "strength", "workout", "push-up", "pushup"], icon: "dumbbell" },
  { words: ["stretch", "yoga", "mobility", "posture"], icon: "person-standing" },
  { words: ["bike", "cycl", "ride"], icon: "bike" },
  { words: ["cardio", "heart", "swim"], icon: "heart-pulse" },
  { words: ["meditat", "breath", "mindful", "calm"], icon: "wind" },
  { words: ["read", "book", "page"], icon: "book-open" },
  { words: ["journal", "diary", "gratitude"], icon: "notebook-pen" },
  { words: ["write", "blog", "poem"], icon: "pen-line" },
  { words: ["spanish", "french", "german", "japanese", "language", "vocab"], icon: "languages" },
  { words: ["study", "learn", "course", "class", "homework"], icon: "graduation-cap" },
  { words: ["code", "program", "leetcode"], icon: "code" },
  { words: ["veg", "salad", "greens", "fruit", "eat"], icon: "salad" },
  { words: ["coffee", "caffeine", "tea"], icon: "coffee" },
  { words: ["cook", "meal", "dinner", "lunch"], icon: "chef-hat" },
  { words: ["vitamin", "pill", "medic", "supplement"], icon: "pill" },
  { words: ["sleep", "bed", "nap"], icon: "moon" },
  { words: ["wake", "early", "sunrise"], icon: "sunrise" },
  { words: ["phone", "screen", "social", "scroll"], icon: "phone-off" },
  { words: ["guitar"], icon: "guitar" },
  { words: ["music", "piano", "sing", "practice"], icon: "music" },
  { words: ["draw", "paint", "sketch", "art"], icon: "palette" },
  { words: ["photo"], icon: "camera" },
  { words: ["plant", "garden", "flower"], icon: "sprout" },
  { words: ["dog", "pet", "cat"], icon: "dog" },
  { words: ["clean", "tidy", "chore", "dishes", "laundry"], icon: "house" },
  { words: ["call", "friend", "family", "kind", "volunteer"], icon: "hand-heart" },
  { words: ["save", "budget", "money", "spend"], icon: "piggy-bank" },
  { words: ["focus", "deep work", "pomodoro"], icon: "timer" },
];

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];

export type SampleHabit = {
  id: string;
  name: string;
  note: string;
  icon: IconName;
  color: string;
  goal: number;
  unit: string;
  days: number[];
  part: PartOfDay;
  reminder: string | null;
  /**
   * How the generated history looks (lib/sample.ts): the share of planned
   * days done, the streak running today, and where today stands.
   */
  history: { rate: number; streak: number; today: "done" | "partial" | "open" };
};

/** Created on first launch with `defaults.sampleDays` of history, so every screen looks alive. */
export const sampleHabits: SampleHabit[] = [
  {
    id: "sample-meditate",
    name: "Meditate",
    note: "Ten quiet minutes before the phone comes out.",
    icon: "wind",
    color: "#C084FC",
    goal: 1,
    unit: "",
    days: EVERY_DAY,
    part: "morning",
    reminder: "07:00",
    history: { rate: 0.86, streak: 12, today: "done" },
  },
  {
    id: "sample-strength",
    name: "Strength training",
    note: "Push, pull, legs. Thirty minutes is plenty.",
    icon: "dumbbell",
    color: "#FB923C",
    goal: 1,
    unit: "",
    days: [1, 3, 5],
    part: "morning",
    reminder: "06:45",
    history: { rate: 0.84, streak: 7, today: "open" },
  },
  {
    id: "sample-water",
    name: "Drink water",
    note: "A glass with every meal, and a few in between.",
    icon: "glass-water",
    color: "#60A5FA",
    goal: 8,
    unit: "glasses",
    days: EVERY_DAY,
    part: "anytime",
    reminder: null,
    history: { rate: 0.9, streak: 23, today: "partial" },
  },
  {
    id: "sample-walk",
    name: "Walk 8,000 steps",
    note: "The long way round the park counts.",
    icon: "footprints",
    color: "#4ADE80",
    goal: 1,
    unit: "",
    days: EVERY_DAY,
    part: "afternoon",
    reminder: "12:30",
    history: { rate: 0.78, streak: 5, today: "done" },
  },
  {
    id: "sample-read",
    name: "Read 20 pages",
    note: "Fiction counts. So do cookbooks.",
    icon: "book-open",
    color: "#FBBF24",
    goal: 1,
    unit: "",
    days: EVERY_DAY,
    part: "evening",
    reminder: "21:30",
    history: { rate: 0.8, streak: 9, today: "open" },
  },
  {
    id: "sample-journal",
    name: "Evening journal",
    note: "Three lines: a win, a worry, a thank-you.",
    icon: "notebook-pen",
    color: "#2DD4BF",
    goal: 1,
    unit: "",
    days: EVERY_DAY,
    part: "evening",
    reminder: "22:00",
    history: { rate: 0.64, streak: 2, today: "open" },
  },
];

/** Extra ideas on the onboarding "What would you like to grow?" step (no history). */
export const suggestedHabits: Omit<SampleHabit, "id" | "history">[] = [
  {
    name: "Stretch",
    note: "Five minutes, slow and easy.",
    icon: "person-standing",
    color: "#A3E635",
    goal: 1,
    unit: "",
    days: EVERY_DAY,
    part: "morning",
    reminder: null,
  },
  {
    name: "No phone in bed",
    note: "The bedroom is for sleep.",
    icon: "phone-off",
    color: "#818CF8",
    goal: 1,
    unit: "",
    days: EVERY_DAY,
    part: "evening",
    reminder: "22:30",
  },
  {
    name: "Practice Spanish",
    note: "One short lesson a day.",
    icon: "languages",
    color: "#FB7185",
    goal: 1,
    unit: "",
    days: EVERY_DAY,
    part: "anytime",
    reminder: null,
  },
  {
    name: "Cook at home",
    note: "Something simple counts.",
    icon: "chef-hat",
    color: "#9DB89A",
    goal: 1,
    unit: "",
    days: [1, 2, 3, 4, 5],
    part: "evening",
    reminder: "18:30",
  },
];

/**
 * Habit strength (0–1) grows with every planned day done and fades slowly
 * with misses (lib/habits.ts). Each stage starts at `from`.
 */
export const growth: { name: string; from: number; icon: IconName; blurb: string }[] = [
  { name: "Seed", from: 0, icon: "bean", blurb: "Just planted" },
  { name: "Sprout", from: 0.25, icon: "sprout", blurb: "Breaking through" },
  { name: "Sapling", from: 0.5, icon: "shrub", blurb: "Growing steady" },
  { name: "Rooted", from: 0.8, icon: "tree-deciduous", blurb: "Part of your day" },
];

export const partsOfDay: { key: PartOfDay; label: string; icon: IconName }[] = [
  { key: "morning", label: "Morning", icon: "sunrise" },
  { key: "afternoon", label: "Afternoon", icon: "sun" },
  { key: "evening", label: "Evening", icon: "sunset" },
  { key: "anytime", label: "Anytime", icon: "sparkles" },
];

export const calendar = {
  weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  weekdaysLetter: ["S", "M", "T", "W", "T", "F", "S"],
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  /** Long date, e.g. "Thursday, October 15". */
  long: "{weekday}, {month} {day}",
  /** Short date, e.g. "Oct 15". */
  short: "{mon} {day}",
  /** Short date with weekday, e.g. "Thu, Oct 15". */
  withWeekday: "{wd}, {mon} {day}",
  am: "AM",
  pm: "PM",
};

export const copy = {
  tabs: { today: "Today", stats: "Stats", settings: "Settings", add: "New habit" },

  greeting: {
    morning: "Good morning, {name}",
    afternoon: "Good afternoon, {name}",
    evening: "Good evening, {name}",
    night: "Still up, {name}?",
  },

  common: {
    cancel: "Cancel",
    done: "Done",
    days: "days",
    day: "day",
    times: "times",
    time: "time",
    percent: "{n}%",
    of: "{count} of {goal}",
    everyDay: "Every day",
    weekdays: "Weekdays",
    weekends: "Weekends",
  },

  today: {
    backToToday: "Back to today",
    viewing: "Filling in {date}",
    ringCaption: "done",
    /** The hero message: a short title and a line under it. */
    hero: {
      allDone: { title: "All done", body: "Your garden thanks you." },
      none: { title: "Fresh start", body: "One small thing is enough." },
      some: { title: "Nice momentum", body: "{left} habits to go today." },
      oneLeft: { title: "So close", body: "Just one habit to go." },
      rest: { title: "Rest day", body: "Nothing planned for today." },
      past: { title: "Looking back", body: "Tap a circle to fill in this day." },
    },
    statStreak: "day streak",
    statWeek: "this week",
    resting: "Resting today",
    restingOn: "Not planned on this day",
    countLine: "{count}/{goal} {unit}",
    emptyTitle: "Plant your first habit",
    emptyBody: "Start with something small enough to do on your busiest day.",
    emptyCta: "New habit",
    checkLabel: "Mark {name} as done",
    uncheckLabel: "Mark {name} as not done",
    addOneLabel: "Log one for {name}",
    celebrate: "Every habit done today",
  },

  detail: {
    back: "Back",
    edit: "Edit habit",
    today: "Today",
    tapToCheck: "Tap the circle to check today off",
    doneToday: "Done for today. Nice.",
    countToday: "{count} of {goal} {unit} today",
    takeOneBack: "Take one back",
    current: "Current streak",
    best: "Best streak",
    rate: "Completion",
    rateCaption: "last 30 days",
    total: "Check-ins",
    totalCaption: "{n} check-ins",
    strength: "Strength",
    heatmapTitle: "The last 12 months",
    heatmapCaption: "Each green day deepens as the habit takes root.",
    less: "Less",
    more: "More",
    cellDone: "{date}: done",
    cellPartial: "{date}: {count} of {goal}",
    cellMissed: "{date}: missed",
    cellRest: "{date}: rest day",
    cellBefore: "{date}: before this habit began",
    cellFuture: "{date}: still to come",
    weeklyTitle: "Weekly rhythm",
    weeklyCaption: "Planned days done, last 12 weeks",
    average: "Average {n}%",
    weekdayTitle: "By day of the week",
    archive: "Archive habit",
    restore: "Restore habit",
    delete: "Delete habit",
    archiveTitle: "Archive “{name}”?",
    archiveBody: "It leaves Today but keeps its history. Restore it any time in Settings.",
    archiveConfirm: "Archive",
    deleteTitle: "Delete “{name}”?",
    deleteBody: "This removes the habit and its {n} check-ins from this device. It can’t be undone.",
    deleteConfirm: "Delete",
    missing: "This habit isn’t here any more.",
    missingCta: "Back to today",
    archivedNote: "Archived. It’s hidden from Today.",
  },

  editor: {
    newTitle: "New habit",
    editTitle: "Edit habit",
    cancel: "Cancel",
    save: "Save",
    create: "Plant it",
    namePlaceholder: "Name your habit",
    notePlaceholder: "Why it matters (optional)",
    icon: "Icon",
    color: "Color",
    goal: "Daily goal",
    goalOnce: "Once a day",
    goalTimes: "{n} times a day",
    unitPlaceholder: "Unit, e.g. glasses",
    schedule: "Schedule",
    custom: "Custom",
    pickADay: "Pick at least one day.",
    part: "Time of day",
    reminder: "Reminder",
    reminderBody: "A gentle nudge at this time",
    previewName: "Your new habit",
    decreaseGoal: "Fewer times a day",
    increaseGoal: "More times a day",
  },

  time: {
    earlier: "Earlier",
    later: "Later",
    presets: [
      { label: "Early", time: "06:30" },
      { label: "Morning", time: "08:00" },
      { label: "Midday", time: "12:30" },
      { label: "Evening", time: "19:00" },
      { label: "Night", time: "21:30" },
    ],
  },

  stats: {
    title: "Stats",
    subtitle: "How your garden is growing",
    ranges: [
      { key: 7, label: "7 days" },
      { key: 30, label: "30 days" },
      { key: 90, label: "90 days" },
    ],
    completion: "Completion",
    perfectDays: "Perfect days",
    checkins: "Check-ins",
    bestStreak: "Longest streak",
    vsPrevious: "{delta} vs previous",
    everyHabit: "every planned habit done",
    habitsLogged: "times you showed up",
    heatmapTitle: "Every habit, every day",
    heatmapCaption: "Brighter days mean more of your plan got done.",
    trendTitle: "12-week trend",
    trendCaption: "Share of planned habits done each week",
    byHabitTitle: "By habit",
    weekdayTitle: "Your strongest days",
    bestDay: "{day} is your strongest day.",
    cellDay: "{date}: {done} of {total} habits",
    cellNone: "{date}: nothing planned",
    emptyTitle: "No stats yet",
    empty: "Stats grow from your first check-in. Plant a habit to begin.",
  },

  settings: {
    title: "Settings",
    nameLabel: "Your name",
    since: "Growing since {date}",
    habitCount: "{n} habits",
    appearance: "Appearance",
    themes: [
      { key: "dark", label: "Dark" },
      { key: "light", label: "Light" },
      { key: "system", label: "System" },
    ] as { key: ThemePref; label: string }[],
    weekStart: "Week starts on",
    weekStarts: [
      { key: 1, label: "Monday" },
      { key: 0, label: "Sunday" },
    ] as { key: 0 | 1; label: string }[],
    feel: "Feel",
    haptics: "Haptics",
    hapticsBody: "A soft tap when you check something off",
    reminders: "Reminders",
    daily: "Daily check-in",
    dailyBody: "One calm nudge to open Rootwell",
    streakSaver: "Streak saver",
    streakSaverBody: "A heads-up at 8 PM when a streak is at risk",
    habits: "Habits",
    archived: "Archived",
    noArchived: "Nothing archived. Archive a habit from its page to rest it here.",
    restore: "Restore",
    data: "Data",
    sample: "Restore the sample garden",
    sampleBody: "Six demo habits with 120 days of history",
    sampleTitle: "Replace your habits with the samples?",
    sampleConfirmBody: "Your current habits and check-ins on this device will be replaced.",
    sampleConfirm: "Replace",
    erase: "Start fresh",
    eraseBody: "Delete every habit and check-in",
    eraseTitle: "Start with an empty garden?",
    eraseConfirmBody: "Every habit and check-in on this device will be deleted.",
    eraseConfirm: "Delete all",
    about: "About",
    replay: "Replay the welcome",
    privacy: "Your habits stay on this device. No account, no ads, no tracking.",
    version: "{name} {version}",
  },

  onboarding: {
    skip: "Skip",
    next: "Continue",
    start: "Start growing",
    stepOf: "{n} of 3",
    welcomeEyebrow: "Welcome to Rootwell",
    welcomeTitle: "Small habits.\nDeep roots.",
    welcomeBody: "Check off a few small things each day and watch them grow into the life you want.",
    pickTitle: "What would you like to grow?",
    pickBody: "Choose a few to start. You can add, edit or rest habits any time.",
    picked: "{n} picked",
    pickNone: "Pick at least one",
    nameTitle: "Make it yours",
    nameBody: "Rootwell keeps everything on this phone. No account needed.",
    nameLabel: "What should we call you?",
    namePlaceholder: "Your name",
    reminderLabel: "A daily check-in",
    reminderOptions: [
      { label: "Morning", time: "08:00" },
      { label: "Evening", time: "20:30" },
      { label: "No reminder", time: null },
    ] as { label: string; time: string | null }[],
  },

  notFound: "Nothing grows here. Heading back to Today.",
};

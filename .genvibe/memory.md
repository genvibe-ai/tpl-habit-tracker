# Rootwell: habit-tracker template

## What this app is
Rootwell, a calm habit tracker (Expo SDK 57, Expo Router, TypeScript) for Expo Go and the web preview. Check off small habits daily, keep streaks, watch them grow. Data stays on the device: no account, server, analytics or env vars.

## Built so far
Onboarding (3 steps). Today: week strip (past days editable), progress ring, habits by time of day, spring check-off with haptics, counted habits, streak flames, all-done celebration. Habit page: 12-month heatmap, streaks, 30-day completion, strength stage, weekly/weekday charts, archive/delete. Add/Edit modal: name, note, icon, color, daily goal + unit, schedule, time of day, reminder time. Stats (7/30/90 days): completion, perfect days, check-ins, longest streak, heatmap, 12-week trend, by habit, strongest days. Settings: name, theme dark/light/system, week start, haptics, reminder toggles, archived, restore sample, start fresh, replay welcome. Six sample habits, 120 days of seeded history; reminders are UI only.

## Design
Dark by default: background #0B0F0C, surface #121813, raised #1A231C, text #ECF3EE, accent leaf green #4ADE80, flame #FFAD5C, heatmap #18211A to #A6E86A, ring gradient #B8F26E/#4ADE80/#2DD4BF. Light: background #F3F6F2, accent #22C55E. Fonts: Bricolage Grotesque (headings, numbers), Figtree (text). Radii 8–28 plus pills, 20px gutters, floating tab bar (Liquid Glass on iOS 26, blur elsewhere). Reanimated 4 motion: spring check-off, growing sprout on welcome, fades between screens.

## Structure
- constants/content.ts: brand, palettes, habit colors/icons, sample habits, growth stages, ALL copy. theme.ts: fonts, type scale, radii. icons.ts: Lucide map, one import per icon.
- app/: _layout.tsx (fonts, theme, Stack guarded by prefs.onboarded), onboarding.tsx, (tabs)/index|stats|settings.tsx, habit/[id].tsx, habit/edit.tsx.
- lib/: types, store (zustand), storage.ts (expo-sqlite) + storage.web.ts (localStorage), sample (seeded history), habits (streaks, completion, strength), dates, format, haptics, motion, color.
- components/: HabitRow, CheckButton, ProgressRing, WeekStrip, TabBar, StatTile; charts/, editor/, brand/ (mark.ts), ui/ (Screen, Card, Button, Text, Dialog, BarSurface + .ios).
- hooks/useTheme.ts (makeStyles), useToday.ts. assets/images: icon, adaptive, splash, favicon.

## User preferences & rules
Edit constants/content.ts first; keep the design system (theme.ts tokens, makeStyles); never hard-code copy or colors in components. Only modules bundled in Expo Go SDK 57 (no MMKV, dev-client or custom native code); add packages with `npx expo install`. Keep storage.web.ts as the web fallback. No ios.bundleIdentifier or android.package in app.json.

## Open issues & next ideas
Not yet opened in Expo Go on a real phone (web build and Android export verified). Next: expo-notifications for reminders, drag to reorder, shareable streak card, Supabase sync.

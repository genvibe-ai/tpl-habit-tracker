import { router, useLocalSearchParams } from "expo-router";
import { useState, type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HabitIcon } from "@/components/HabitIcon";
import { ColorRow } from "@/components/editor/ColorRow";
import { DayPicker } from "@/components/editor/DayPicker";
import { GoalStepper } from "@/components/editor/GoalStepper";
import { IconGrid } from "@/components/editor/IconGrid";
import { TimePicker } from "@/components/editor/TimePicker";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Tap } from "@/components/ui/Tap";
import { Text } from "@/components/ui/Text";
import { Toggle } from "@/components/ui/Toggle";
import { copy, habitColors, iconHints, partsOfDay } from "@/constants/content";
import type { IconName } from "@/constants/icons";
import { fonts, gutter, radius } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { withAlpha } from "@/lib/color";
import { formatSchedule, formatTime } from "@/lib/format";
import { haptics } from "@/lib/haptics";
import { useGarden } from "@/lib/store";
import type { HabitDraft } from "@/lib/types";

const BLANK: HabitDraft = {
  name: "",
  note: "",
  icon: "sprout",
  color: habitColors[0].hex,
  goal: 1,
  unit: "",
  days: [0, 1, 2, 3, 4, 5, 6],
  part: "anytime",
  reminder: null,
};

/** New habit, or edit one with `?id=`. Opens as a sheet over the app. */
export default function EditHabitScreen() {
  const s = useStyles();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useGarden((state) => (id ? state.habits.find((h) => h.id === id) : undefined));
  const weekStart = useGarden((state) => state.prefs.weekStart);
  const addHabit = useGarden((state) => state.addHabit);
  const updateHabit = useGarden((state) => state.updateHabit);

  const [draft, setDraft] = useState<HabitDraft>(() =>
    existing
      ? {
          name: existing.name,
          note: existing.note,
          icon: existing.icon,
          color: existing.color,
          goal: existing.goal,
          unit: existing.unit,
          days: [...existing.days],
          part: existing.part,
          reminder: existing.reminder,
        }
      : BLANK,
  );
  // Until people pick an icon themselves, the name suggests one.
  const [iconChosen, setIconChosen] = useState(!!existing);
  const set = (patch: Partial<HabitDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const canSave = draft.name.trim().length > 0 && draft.days.length > 0;
  // The time to come back to when the reminder is switched off and on again.
  const [reminderTime, setReminderTime] = useState(() => existing?.reminder ?? "08:00");

  const onName = (name: string) => {
    const patch: Partial<HabitDraft> = { name };
    if (!iconChosen) {
      const lower = name.toLowerCase();
      const hint = iconHints.find((h) => h.words.some((w) => lower.includes(w)));
      if (hint) patch.icon = hint.icon;
    }
    set(patch);
  };

  const save = () => {
    if (!canSave) return;
    const clean: HabitDraft = { ...draft, name: draft.name.trim(), note: draft.note.trim(), unit: draft.goal > 1 ? draft.unit.trim() : "" };
    if (existing) updateHabit(existing.id, clean);
    else addHabit(clean);
    haptics.success();
    router.back();
  };

  const top = Platform.OS === "ios" ? 14 : insets.top + 10;

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[s.header, { paddingTop: top }]}>
        <Tap label={copy.editor.cancel} onPress={() => router.back()} style={s.headerButton}>
          <Text variant="label" tone="muted">
            {copy.editor.cancel}
          </Text>
        </Tap>
        <Text variant="heading" accessibilityRole="header">
          {existing ? copy.editor.editTitle : copy.editor.newTitle}
        </Text>
        <Tap label={existing ? copy.editor.save : copy.editor.create} onPress={save} disabled={!canSave} style={[s.headerButton, s.save]}>
          <Text variant="label" tone="onAccent">
            {existing ? copy.editor.save : copy.editor.create}
          </Text>
        </Tap>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Card style={s.preview}>
          <HabitIcon icon={draft.icon} color={draft.color} size={60} />
          <View style={s.previewText}>
            <Input
              boxed={false}
              value={draft.name}
              onChangeText={onName}
              placeholder={copy.editor.namePlaceholder}
              style={s.nameInput}
              maxLength={40}
              autoFocus={!existing && Platform.OS !== "web"}
              returnKeyType="done"
              accessibilityLabel={copy.editor.namePlaceholder}
            />
            <Input
              boxed={false}
              value={draft.note}
              onChangeText={(note) => set({ note })}
              placeholder={copy.editor.notePlaceholder}
              style={s.noteInput}
              maxLength={90}
              accessibilityLabel={copy.editor.notePlaceholder}
            />
          </View>
        </Card>

        <Field label={copy.editor.icon}>
          <IconGrid
            value={draft.icon}
            color={draft.color}
            onChange={(icon: IconName) => {
              setIconChosen(true);
              set({ icon });
            }}
          />
        </Field>

        <Field label={copy.editor.color}>
          <ColorRow value={draft.color} onChange={(color) => set({ color })} />
        </Field>

        <Field label={copy.editor.goal}>
          <GoalStepper goal={draft.goal} unit={draft.unit} onGoal={(goal) => set({ goal })} onUnit={(unit) => set({ unit })} />
        </Field>

        <Field label={copy.editor.schedule} note={draft.days.length ? formatSchedule(draft.days, weekStart) : undefined}>
          <DayPicker value={draft.days} weekStart={weekStart} color={draft.color} onChange={(days) => set({ days })} />
        </Field>

        <Field label={copy.editor.part}>
          <View style={s.parts}>
            {partsOfDay.map((part) => {
              const active = draft.part === part.key;
              return (
                <Tap
                  key={part.key}
                  label={part.label}
                  role="radio"
                  selected={active}
                  onPress={() => set({ part: part.key })}
                  style={[s.part, active && { borderColor: draft.color, backgroundColor: withAlpha(draft.color, t.mode === "dark" ? 0.16 : 0.2) }]}
                  scaleTo={0.93}
                >
                  <Icon name={part.icon} size={20} color={active ? t.text : t.muted} />
                  <Text variant="small" tone={active ? "text" : "muted"} style={s.partLabel} numberOfLines={1}>
                    {part.label}
                  </Text>
                </Tap>
              );
            })}
          </View>
        </Field>

        <Card style={s.reminder}>
          <View style={s.reminderHead}>
            <View style={s.reminderIcon}>
              <Icon name="bell-ring" size={18} color={t.accentText} />
            </View>
            <View style={s.flex}>
              <Text variant="label">{copy.editor.reminder}</Text>
              <Text variant="small" tone="muted">
                {draft.reminder ? formatTime(draft.reminder) : copy.editor.reminderBody}
              </Text>
            </View>
            <Toggle
              label={copy.editor.reminder}
              value={draft.reminder !== null}
              onChange={(on) => set({ reminder: on ? reminderTime : null })}
            />
          </View>
          {draft.reminder !== null && (
            <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(150)} layout={LinearTransition}>
              <View style={s.divider} />
              <TimePicker
                value={draft.reminder}
                onChange={(time) => {
                  setReminderTime(time);
                  set({ reminder: time });
                }}
              />
            </Animated.View>
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  const s = useStyles();
  return (
    <View style={s.field}>
      <View style={s.fieldHead}>
        <Text variant="caps" tone="muted">
          {label}
        </Text>
        {note ? (
          <Text variant="small" tone="faint">
            {note}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, backgroundColor: t.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: gutter - 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: t.line,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  headerButton: { minWidth: 74, height: 38, paddingHorizontal: 12, alignItems: "center", justifyContent: "center", borderRadius: radius.pill },
  save: { backgroundColor: t.accent },
  scroll: { flex: 1 },
  content: { paddingHorizontal: gutter, paddingTop: 18, gap: 24, width: "100%", maxWidth: 560, alignSelf: "center" },
  preview: { flexDirection: "row", alignItems: "center", gap: 14 },
  previewText: { flex: 1, gap: 2 },
  nameInput: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: -0.3,
    paddingVertical: 4,
  },
  noteInput: { fontFamily: fonts.bodyMedium, fontSize: 14.5, color: t.muted, paddingVertical: 4 },
  field: { gap: 12 },
  fieldHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  parts: { flexDirection: "row", gap: 8 },
  part: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: t.raised,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  partLabel: { fontSize: 12 },
  reminder: { gap: 0 },
  reminderHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  reminderIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: withAlpha(t.accent, 0.14),
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1 },
  divider: { height: 1, backgroundColor: t.line, marginVertical: 16 },
}));

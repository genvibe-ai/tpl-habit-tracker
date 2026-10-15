import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState, type ReactNode } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { HabitIcon } from "@/components/HabitIcon";
import { Logo } from "@/components/brand/Logo";
import { TimePicker } from "@/components/editor/TimePicker";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Segmented } from "@/components/ui/Segmented";
import { Tap } from "@/components/ui/Tap";
import { Text } from "@/components/ui/Text";
import { Toggle } from "@/components/ui/Toggle";
import { brand, copy, user } from "@/constants/content";
import type { IconName } from "@/constants/icons";
import { fonts, radius } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { useToday } from "@/hooks/useToday";
import { withAlpha } from "@/lib/color";
import { fill, formatDate, formatTime } from "@/lib/format";
import { haptics } from "@/lib/haptics";
import { useGarden } from "@/lib/store";

/** Settings: name, theme, week start, haptics, reminders, archived habits and data. */
export default function SettingsScreen() {
  const s = useStyles();
  const t = useTheme();
  const today = useToday();
  const prefs = useGarden((state) => state.prefs);
  const habits = useGarden((state) => state.habits);
  const setPrefs = useGarden((state) => state.setPrefs);
  const setArchived = useGarden((state) => state.setArchived);
  const restoreSample = useGarden((state) => state.restoreSample);
  const eraseAll = useGarden((state) => state.eraseAll);
  const [confirm, setConfirm] = useState<"sample" | "erase" | null>(null);
  const [name, setName] = useState(prefs.name);
  useEffect(() => setName(prefs.name), [prefs.name]);

  const active = habits.filter((h) => !h.archived);
  const archived = habits.filter((h) => h.archived);
  const since = habits.reduce((min, h) => (h.createdAt < min ? h.createdAt : min), today);
  const initial = (name.trim() || user.name).charAt(0).toUpperCase();

  const saveName = () => {
    const next = name.trim() || user.name;
    setName(next);
    if (next !== prefs.name) setPrefs({ name: next });
  };

  return (
    <Screen>
      <Text variant="hero" style={s.title} accessibilityRole="header">
        {copy.settings.title}
      </Text>

      <Card style={s.profile}>
        <LinearGradient colors={[t.ring[0], t.ring[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.avatar}>
          <Text style={[s.initial, { color: t.onAccent }]}>{initial}</Text>
        </LinearGradient>
        <View style={s.flex}>
          <Input
            boxed={false}
            value={name}
            onChangeText={setName}
            onBlur={saveName}
            onSubmitEditing={saveName}
            placeholder={copy.settings.nameLabel}
            style={s.nameInput}
            maxLength={24}
            returnKeyType="done"
            accessibilityLabel={copy.settings.nameLabel}
          />
          <Text variant="small" tone="muted">
            {fill(copy.settings.since, { date: formatDate(since) })} · {fill(copy.settings.habitCount, { n: active.length })}
          </Text>
        </View>
        <Icon name="pencil" size={16} color={t.faint} />
      </Card>

      <Group title={copy.settings.appearance}>
        <Segmented label={copy.settings.appearance} value={prefs.theme} onChange={(theme) => setPrefs({ theme })} options={copy.settings.themes} />
      </Group>

      <Group title={copy.settings.weekStart}>
        <Segmented
          label={copy.settings.weekStart}
          value={prefs.weekStart}
          onChange={(weekStart) => setPrefs({ weekStart })}
          options={copy.settings.weekStarts}
        />
      </Group>

      <Group title={copy.settings.feel}>
        <Card padded={false}>
          <Row icon="vibrate" title={copy.settings.haptics} body={copy.settings.hapticsBody}>
            <Toggle
              label={copy.settings.haptics}
              value={prefs.haptics}
              onChange={(on) => {
                setPrefs({ haptics: on });
                if (on) haptics.success();
              }}
            />
          </Row>
        </Card>
      </Group>

      <Group title={copy.settings.reminders}>
        <Card padded={false}>
          <Row
            icon="bell-ring"
            title={copy.settings.daily}
            body={prefs.dailyReminder ? formatTime(prefs.dailyReminder) : copy.settings.dailyBody}
          >
            <Toggle
              label={copy.settings.daily}
              value={prefs.dailyReminder !== null}
              onChange={(on) => setPrefs({ dailyReminder: on ? "20:30" : null })}
            />
          </Row>
          {prefs.dailyReminder !== null && (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={s.picker}>
              <TimePicker value={prefs.dailyReminder} onChange={(dailyReminder) => setPrefs({ dailyReminder })} />
            </Animated.View>
          )}
          <View style={s.divider} />
          <Row icon="flame" title={copy.settings.streakSaver} body={copy.settings.streakSaverBody}>
            <Toggle label={copy.settings.streakSaver} value={prefs.streakSaver} onChange={(streakSaver) => setPrefs({ streakSaver })} />
          </Row>
        </Card>
      </Group>

      <Group title={copy.settings.archived} right={archived.length ? String(archived.length) : undefined}>
        <Card padded={false}>
          {archived.length === 0 ? (
            <Text variant="small" tone="muted" style={s.emptyArchive}>
              {copy.settings.noArchived}
            </Text>
          ) : (
            archived.map((habit, i) => (
              <View key={habit.id}>
                {i > 0 && <View style={s.divider} />}
                <View style={s.row}>
                  <Tap
                    label={habit.name}
                    onPress={() => router.push({ pathname: "/habit/[id]", params: { id: habit.id } })}
                    style={s.archivedHabit}
                  >
                    <HabitIcon icon={habit.icon} color={habit.color} size={38} />
                    <Text variant="label" numberOfLines={1} style={s.flex}>
                      {habit.name}
                    </Text>
                  </Tap>
                  <Tap label={copy.settings.restore} onPress={() => setArchived(habit.id, false)} style={s.restore}>
                    <Text variant="small" tone="accent" style={s.restoreText}>
                      {copy.settings.restore}
                    </Text>
                  </Tap>
                </View>
              </View>
            ))
          )}
        </Card>
      </Group>

      <Group title={copy.settings.data}>
        <Card padded={false}>
          <Row icon="rotate-ccw" title={copy.settings.sample} body={copy.settings.sampleBody} onPress={() => setConfirm("sample")} />
          <View style={s.divider} />
          <Row icon="trash" title={copy.settings.erase} body={copy.settings.eraseBody} danger onPress={() => setConfirm("erase")} />
        </Card>
      </Group>

      <Group title={copy.settings.about}>
        <Card padded={false}>
          <Row icon="sprout" title={copy.settings.replay} onPress={() => setPrefs({ onboarded: false })} />
          <View style={s.divider} />
          <Row icon="shield-check" title={copy.settings.privacy} />
        </Card>
      </Group>

      <View style={s.footer}>
        <Logo size={36} />
        <Text variant="small" tone="faint">
          {fill(copy.settings.version, { name: brand.name, version: brand.version })} · {brand.tagline}
        </Text>
      </View>

      <Dialog
        visible={confirm === "sample"}
        title={copy.settings.sampleTitle}
        body={copy.settings.sampleConfirmBody}
        confirm={copy.settings.sampleConfirm}
        tone="primary"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null);
          restoreSample();
          haptics.success();
        }}
      />
      <Dialog
        visible={confirm === "erase"}
        title={copy.settings.eraseTitle}
        body={copy.settings.eraseConfirmBody}
        confirm={copy.settings.eraseConfirm}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null);
          eraseAll();
          haptics.warning();
        }}
      />
    </Screen>
  );
}

function Group({ title, right, children }: { title: string; right?: string; children: ReactNode }) {
  const s = useStyles();
  return (
    <View style={s.group}>
      <SectionHeader title={title} right={right} />
      {children}
    </View>
  );
}

function Row({
  icon,
  title,
  body,
  danger,
  onPress,
  children,
}: {
  icon: IconName;
  title: string;
  body?: string;
  danger?: boolean;
  onPress?: () => void;
  children?: ReactNode;
}) {
  const s = useStyles();
  const t = useTheme();
  const color = danger ? t.danger : t.accentText;
  const content = (
    <>
      <View style={[s.rowIcon, { backgroundColor: withAlpha(danger ? t.danger : t.accent, 0.13) }]}>
        <Icon name={icon} size={17} color={color} strokeWidth={2.2} />
      </View>
      <View style={s.flex}>
        <Text variant="label" tone={danger ? "danger" : "text"}>
          {title}
        </Text>
        {body ? (
          <Text variant="small" tone="muted">
            {body}
          </Text>
        ) : null}
      </View>
      {children ?? (onPress ? <Icon name="chevron-right" size={18} color={t.faint} /> : null)}
    </>
  );
  if (onPress) {
    return (
      <Tap label={title} hint={body} onPress={onPress} style={s.row} scaleTo={0.985}>
        {content}
      </Tap>
    );
  }
  return <View style={s.row}>{content}</View>;
}

const useStyles = makeStyles((t) => ({
  title: { marginBottom: 18 },
  flex: { flex: 1 },
  profile: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  initial: { fontFamily: fonts.displayHeavy, fontSize: 24, lineHeight: 28 },
  nameInput: { fontFamily: fonts.display, fontSize: 20, paddingVertical: 2 },
  group: { marginTop: 24 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  divider: { height: 1, backgroundColor: t.line, marginLeft: 64 },
  picker: { paddingHorizontal: 16, paddingBottom: 16 },
  emptyArchive: { padding: 16 },
  archivedHabit: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  restore: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: t.raised },
  restoreText: { fontFamily: fonts.bodyBold },
  footer: { alignItems: "center", gap: 8, marginTop: 32 },
}));

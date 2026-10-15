import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { CheckButton } from "@/components/CheckButton";
import { HabitIcon } from "@/components/HabitIcon";
import { StatTile } from "@/components/StatTile";
import { Heatmap, type HeatCell } from "@/components/charts/Heatmap";
import { WeekBars } from "@/components/charts/WeekBars";
import { WeekdayBars } from "@/components/charts/WeekdayBars";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { copy, partsOfDay } from "@/constants/content";
import type { IconName } from "@/constants/icons";
import { radius } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { useToday } from "@/hooks/useToday";
import { addDays } from "@/lib/dates";
import { fill, formatDate, formatSchedule, formatTime, percent } from "@/lib/format";
import {
  bestStreak,
  completion,
  currentStreak,
  habitHeatLevel,
  isPlanned,
  stageFor,
  strengthByDay,
  totalDone,
  weekdayCompletion,
  weeklyCompletion,
} from "@/lib/habits";
import { haptics } from "@/lib/haptics";
import { useGarden } from "@/lib/store";
import type { DateKey, Habit } from "@/lib/types";

/** A habit's page: today's check, streaks, a year heatmap and weekly rhythm. */
export default function HabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = useGarden((s) => s.habits.find((h) => h.id === id));
  // Keep showing the habit while the screen slides away after a delete.
  const last = useRef<Habit | undefined>(habit);
  if (habit) last.current = habit;
  const shown = habit ?? last.current;
  if (!shown) return <Missing />;
  return <HabitDetail habit={shown} />;
}

function HabitDetail({ habit }: { habit: Habit }) {
  const s = useStyles();
  const t = useTheme();
  const today = useToday();
  const days = useGarden((state) => state.checkins[habit.id]);
  const weekStart = useGarden((state) => state.prefs.weekStart);
  const setCount = useGarden((state) => state.setCount);
  const setArchived = useGarden((state) => state.setArchived);
  const deleteHabit = useGarden((state) => state.deleteHabit);
  const [confirm, setConfirm] = useState<"archive" | "delete" | null>(null);
  const glowId = `glow${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const checkins = useMemo(() => ({ [habit.id]: days ?? {} }), [habit.id, days]);
  const stats = useMemo(() => {
    const strength = strengthByDay(habit, checkins, today);
    return {
      current: currentStreak(habit, checkins, today),
      best: bestStreak(habit, checkins, today),
      rate: completion(habit, checkins, addDays(today, -29), today, today),
      total: totalDone(habit, checkins),
      strength,
      strengthNow: strength[today] ?? 0,
      weeks: weeklyCompletion(habit, checkins, today, weekStart, 12),
      weekdays: weekdayCompletion([habit], checkins, addDays(today, -89), today, today),
    };
  }, [habit, checkins, today, weekStart]);

  const cellFor = useCallback(
    (day: DateKey): HeatCell => {
      if (day < habit.createdAt) return { kind: "before", level: 0 };
      if (!isPlanned(habit, day)) return { kind: "rest", level: 0 };
      return { kind: "value", level: habitHeatLevel(habit, checkins, stats.strength, day) };
    },
    [habit, checkins, stats.strength],
  );

  const describe = useCallback(
    (day: DateKey, cell: HeatCell | null) => {
      const date = formatDate(day, "withWeekday");
      if (!cell) return fill(copy.detail.cellFuture, { date });
      if (cell.kind === "before") return fill(copy.detail.cellBefore, { date });
      if (cell.kind === "rest") return fill(copy.detail.cellRest, { date });
      const count = days?.[day] ?? 0;
      if (count >= habit.goal) return fill(copy.detail.cellDone, { date });
      if (count > 0) return fill(copy.detail.cellPartial, { date, count, goal: habit.goal });
      return fill(copy.detail.cellMissed, { date });
    },
    [days, habit.goal],
  );

  const count = days?.[today] ?? 0;
  const done = count >= habit.goal;
  const daily = habit.days.length === 7;
  const streakUnit = (n: number) =>
    daily ? (n === 1 ? copy.common.day : copy.common.days) : n === 1 ? copy.common.time : copy.common.times;
  const stage = stageFor(stats.strengthNow);
  const part = partsOfDay.find((p) => p.key === habit.part);
  const known = stats.weeks.map((w) => w.rate).filter((r): r is number => r !== null);
  const average = known.length ? known.reduce((a, b) => a + b, 0) / known.length : 0;

  const onCheck = () => {
    const next = habit.goal === 1 ? (done ? 0 : 1) : done ? count - 1 : count + 1;
    if (next >= habit.goal && !done) haptics.success();
    else if (next > count) haptics.light();
    else haptics.select();
    setCount(habit.id, today, next);
  };

  return (
    <View style={s.screen}>
      <Screen withTabBar={false}>
        <View style={s.nav}>
          <IconButton name="chevron-left" label={copy.detail.back} onPress={() => router.back()} />
          <IconButton
            name="pencil"
            label={copy.detail.edit}
            onPress={() => router.push({ pathname: "/habit/edit", params: { id: habit.id } })}
          />
        </View>

        <View style={s.hero}>
          <View style={s.glow} pointerEvents="none">
            <Svg width={220} height={220}>
              <Defs>
                <RadialGradient id={glowId} cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={habit.color} stopOpacity={t.mode === "dark" ? 0.28 : 0.22} />
                  <Stop offset="1" stopColor={habit.color} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Circle cx={110} cy={110} r={110} fill={`url(#${glowId})`} />
            </Svg>
          </View>
          <HabitIcon icon={habit.icon} color={habit.color} size={72} />
          <Text variant="title" style={s.name} accessibilityRole="header">
            {habit.name}
          </Text>
          {habit.note ? (
            <Text tone="muted" style={s.note}>
              {habit.note}
            </Text>
          ) : null}
          <View style={s.chips}>
            <Chip icon="calendar" label={formatSchedule(habit.days, weekStart)} />
            {part && <Chip icon={part.icon} label={part.label} />}
            {habit.reminder && <Chip icon="bell" label={formatTime(habit.reminder)} />}
          </View>
          {habit.archived && (
            <Text variant="small" tone="faint" style={s.archived}>
              {copy.detail.archivedNote}
            </Text>
          )}
        </View>

        {!habit.archived && isPlanned(habit, today) && (
          <Card style={s.todayCard}>
            <View style={s.todayText}>
              <Text variant="caps" tone="muted">
                {copy.detail.today}
              </Text>
              <Text variant="label">
                {habit.goal > 1
                  ? fill(copy.detail.countToday, { count, goal: habit.goal, unit: habit.unit })
                  : done
                    ? copy.detail.doneToday
                    : copy.detail.tapToCheck}
              </Text>
            </View>
            {habit.goal > 1 && (
              <IconButton
                name="minus"
                label={copy.detail.takeOneBack}
                disabled={count === 0}
                onPress={() => setCount(habit.id, today, count - 1)}
                size={40}
              />
            )}
            <CheckButton
              color={habit.color}
              count={count}
              goal={habit.goal}
              size={56}
              label={fill(done ? copy.today.uncheckLabel : copy.today.checkLabel, { name: habit.name })}
              onPress={onCheck}
            />
          </Card>
        )}

        <Animated.View entering={FadeInDown.duration(450).delay(80)} style={s.tiles}>
          <StatTile
            icon="flame"
            color={t.flame}
            label={copy.detail.current}
            value={String(stats.current)}
            unit={streakUnit(stats.current)}
          />
          <StatTile icon="trophy" color={habit.color} label={copy.detail.best} value={String(stats.best)} unit={streakUnit(stats.best)} />
          <StatTile
            icon="target"
            color={habit.color}
            label={copy.detail.rate}
            value={stats.rate === null ? "–" : percent(stats.rate)}
            caption={copy.detail.rateCaption}
          />
          <StatTile
            icon={stage.icon}
            color={t.accent}
            label={copy.detail.strength}
            value={percent(stats.strengthNow)}
            caption={`${stage.name}: ${stage.blurb.toLowerCase()}`}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(160)}>
          <Card style={s.section}>
            <View style={s.sectionHead}>
              <Text variant="heading">{copy.detail.heatmapTitle}</Text>
              <Text variant="small" tone="faint">
                {fill(copy.detail.totalCaption, { n: stats.total })}
              </Text>
            </View>
            <Text variant="small" tone="muted" style={s.sectionCaption}>
              {copy.detail.heatmapCaption}
            </Text>
            <Heatmap
              today={today}
              weekStart={weekStart}
              cellFor={cellFor}
              describe={describe}
              less={copy.detail.less}
              more={copy.detail.more}
            />
          </Card>
        </Animated.View>

        <Card style={s.section}>
          <View style={s.sectionHead}>
            <Text variant="heading">{copy.detail.weeklyTitle}</Text>
            <Text variant="small" tone="muted">
              {fill(copy.detail.average, { n: Math.round(average * 100) })}
            </Text>
          </View>
          <Text variant="small" tone="muted" style={s.sectionCaption}>
            {copy.detail.weeklyCaption}
          </Text>
          <WeekBars data={stats.weeks} color={habit.color} />
        </Card>

        <Card style={s.section}>
          <Text variant="heading" style={s.sectionCaption}>
            {copy.detail.weekdayTitle}
          </Text>
          <WeekdayBars values={stats.weekdays} weekStart={weekStart} color={habit.color} />
        </Card>

        <View style={s.actions}>
          <Button
            title={habit.archived ? copy.detail.restore : copy.detail.archive}
            icon={habit.archived ? "archive-restore" : "archive"}
            variant="secondary"
            style={s.action}
            onPress={() => (habit.archived ? setArchived(habit.id, false) : setConfirm("archive"))}
          />
          <Button title={copy.detail.delete} icon="trash" variant="danger" style={s.action} onPress={() => setConfirm("delete")} />
        </View>
      </Screen>

      <Dialog
        visible={confirm === "archive"}
        title={fill(copy.detail.archiveTitle, { name: habit.name })}
        body={copy.detail.archiveBody}
        confirm={copy.detail.archiveConfirm}
        tone="primary"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null);
          setArchived(habit.id, true);
          router.back();
        }}
      />
      <Dialog
        visible={confirm === "delete"}
        title={fill(copy.detail.deleteTitle, { name: habit.name })}
        body={fill(copy.detail.deleteBody, { n: Object.keys(days ?? {}).length })}
        confirm={copy.detail.deleteConfirm}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null);
          haptics.warning();
          router.back();
          deleteHabit(habit.id);
        }}
      />
    </View>
  );
}

function Chip({ icon, label }: { icon: IconName; label: string }) {
  const s = useStyles();
  const t = useTheme();
  return (
    <View style={s.chip}>
      <Icon name={icon} size={14} color={t.muted} strokeWidth={2.2} />
      <Text variant="small" tone="muted">
        {label}
      </Text>
    </View>
  );
}

function Missing() {
  const s = useStyles();
  return (
    <View style={[s.screen, s.missing]}>
      <Text variant="heading" style={s.missingText}>
        {copy.detail.missing}
      </Text>
      <Button title={copy.detail.missingCta} onPress={() => router.replace("/")} />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, backgroundColor: t.background },
  nav: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  hero: { alignItems: "center", paddingTop: 10, paddingBottom: 22, gap: 8 },
  glow: { position: "absolute", top: -64, alignSelf: "center" },
  name: { textAlign: "center", marginTop: 8 },
  note: { textAlign: "center", maxWidth: 320 },
  chips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: t.raised,
  },
  archived: { marginTop: 6 },
  todayCard: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  todayText: { flex: 1, gap: 4 },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  section: { marginBottom: 12 },
  sectionHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 10 },
  sectionCaption: { marginTop: 4, marginBottom: 16 },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  action: { flex: 1 },
  missing: { alignItems: "center", justifyContent: "center", gap: 18, padding: 32 },
  missingText: { textAlign: "center" },
}));

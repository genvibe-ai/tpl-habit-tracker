import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { EmptyState } from "@/components/EmptyState";
import { HabitIcon } from "@/components/HabitIcon";
import { StatTile } from "@/components/StatTile";
import { Streak } from "@/components/Streak";
import { Heatmap, type HeatCell } from "@/components/charts/Heatmap";
import { TrendChart } from "@/components/charts/TrendChart";
import { WeekdayBars } from "@/components/charts/WeekdayBars";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { Segmented } from "@/components/ui/Segmented";
import { Tap } from "@/components/ui/Tap";
import { Text } from "@/components/ui/Text";
import { calendar, copy } from "@/constants/content";
import { radius } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { useToday } from "@/hooks/useToday";
import { addDays, startOfWeek } from "@/lib/dates";
import { fill, formatDate, percent } from "@/lib/format";
import {
  bestStreak,
  completion,
  currentStreak,
  dayHeatLevel,
  daySummary,
  habitsFor,
  rangeSummary,
  weekdayCompletion,
} from "@/lib/habits";
import { useGarden } from "@/lib/store";
import type { DateKey } from "@/lib/types";

type Range = 7 | 30 | 90;

/** Stats: completion, perfect days and streaks across every habit, a year heatmap and a 12-week trend. */
export default function StatsScreen() {
  const s = useStyles();
  const t = useTheme();
  const today = useToday();
  const habits = useGarden((state) => state.habits);
  const checkins = useGarden((state) => state.checkins);
  const weekStart = useGarden((state) => state.prefs.weekStart);
  const [range, setRange] = useState<Range>(30);

  const active = useMemo(() => habitsFor(habits, today), [habits, today]);
  const firstDay = useMemo(() => active.reduce((min, h) => (h.createdAt < min ? h.createdAt : min), today), [active, today]);

  const summary = useMemo(() => {
    const from = addDays(today, -(range - 1));
    const current = rangeSummary(active, checkins, from, today, today);
    const previous = rangeSummary(active, checkins, addDays(from, -range), addDays(from, -1), today);
    const delta =
      current.completion !== null && previous.completion !== null ? current.completion - previous.completion : null;
    let best = { days: 0, name: "" };
    for (const habit of active) {
      const days = bestStreak(habit, checkins, today);
      if (days > best.days) best = { days, name: habit.name };
    }
    const byHabit = active
      .map((habit) => ({
        habit,
        rate: completion(habit, checkins, from, today, today),
        streak: currentStreak(habit, checkins, today),
      }))
      .sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1));
    return { from, current, delta, best, byHabit };
  }, [active, checkins, today, range]);

  const trend = useMemo(() => {
    const thisWeek = startOfWeek(today, weekStart);
    return Array.from({ length: 12 }, (_, i) => {
      const start = addDays(thisWeek, -7 * (11 - i));
      const end = addDays(start, 6);
      return { start, rate: end < firstDay ? null : rangeSummary(active, checkins, start, end, today).completion };
    });
  }, [active, checkins, today, weekStart, firstDay]);

  const weekdays = useMemo(
    () => weekdayCompletion(active, checkins, addDays(today, -89), today, today),
    [active, checkins, today],
  );
  const bestDay = weekdays.reduce<number>((top, v, i) => (v !== null && v > (weekdays[top] ?? -1) ? i : top), 0);

  const cellFor = useCallback(
    (day: DateKey): HeatCell => {
      if (day < firstDay) return { kind: "before", level: 0 };
      const { planned, share } = daySummary(active, checkins, day);
      if (planned === 0) return { kind: "rest", level: 0 };
      return { kind: "value", level: dayHeatLevel(share) };
    },
    [active, checkins, firstDay],
  );
  const describe = useCallback(
    (day: DateKey, cell: HeatCell | null) => {
      const date = formatDate(day, "withWeekday");
      if (!cell || cell.kind !== "value") return fill(copy.stats.cellNone, { date });
      const d = daySummary(active, checkins, day);
      return fill(copy.stats.cellDay, { date, done: d.done, total: d.planned });
    },
    [active, checkins],
  );

  const deltaText =
    summary.delta === null
      ? undefined
      : fill(copy.stats.vsPrevious, { delta: `${summary.delta >= 0 ? "+" : "−"}${Math.abs(Math.round(summary.delta * 100))}%` });

  if (active.length === 0) {
    return (
      <Screen>
        <Text variant="hero" accessibilityRole="header">
          {copy.stats.title}
        </Text>
        <EmptyState title={copy.stats.emptyTitle} body={copy.stats.empty} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={s.header}>
        <Text variant="hero" accessibilityRole="header">
          {copy.stats.title}
        </Text>
        <Text tone="muted">{copy.stats.subtitle}</Text>
      </View>

      <Segmented<Range>
        label={copy.stats.title}
        value={range}
        onChange={setRange}
        options={copy.stats.ranges.map((r) => ({ key: r.key as Range, label: r.label }))}
      />

      <Animated.View entering={FadeInDown.duration(420)} style={s.tiles}>
        <StatTile
          icon="target"
          color={t.accent}
          label={copy.stats.completion}
          value={summary.current.completion === null ? "–" : percent(summary.current.completion)}
          caption={deltaText}
        />
        <StatTile
          icon="sparkles"
          color={t.ring[0]}
          label={copy.stats.perfectDays}
          value={String(summary.current.perfect)}
          caption={copy.stats.everyHabit}
        />
        <StatTile
          icon="calendar-check"
          color={t.ring[2]}
          label={copy.stats.checkins}
          value={String(summary.current.checkins)}
          caption={copy.stats.habitsLogged}
        />
        <StatTile
          icon="flame"
          color={t.flame}
          label={copy.stats.bestStreak}
          value={String(summary.best.days)}
          unit={summary.best.days === 1 ? copy.common.day : copy.common.days}
          caption={summary.best.name}
        />
      </Animated.View>

      <Card style={s.section}>
        <Text variant="heading">{copy.stats.heatmapTitle}</Text>
        <Text variant="small" tone="muted" style={s.caption}>
          {copy.stats.heatmapCaption}
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

      <Card style={s.section}>
        <Text variant="heading">{copy.stats.trendTitle}</Text>
        <Text variant="small" tone="muted" style={s.caption}>
          {copy.stats.trendCaption}
        </Text>
        <TrendChart data={trend} />
      </Card>

      <Card style={s.section}>
        <Text variant="heading" style={s.caption}>
          {copy.stats.byHabitTitle}
        </Text>
        <View style={s.habitList}>
          {summary.byHabit.map(({ habit, rate, streak }) => (
            <Tap
              key={habit.id}
              label={`${habit.name} ${rate === null ? "" : percent(rate)}`}
              onPress={() => router.push({ pathname: "/habit/[id]", params: { id: habit.id } })}
              style={s.habitRow}
              scaleTo={0.98}
            >
              <HabitIcon icon={habit.icon} color={habit.color} size={38} />
              <View style={s.habitText}>
                <View style={s.habitTop}>
                  <Text variant="label" numberOfLines={1} style={s.habitName}>
                    {habit.name}
                  </Text>
                  {streak > 0 && <Streak days={streak} />}
                  <Text variant="label" style={s.habitRate}>
                    {rate === null ? "–" : percent(rate)}
                  </Text>
                </View>
                <View style={s.track}>
                  <View style={[s.fill, { width: `${Math.round((rate ?? 0) * 100)}%`, backgroundColor: habit.color }]} />
                </View>
              </View>
            </Tap>
          ))}
        </View>
      </Card>

      <Card style={s.section}>
        <Text variant="heading">{copy.stats.weekdayTitle}</Text>
        <Text variant="small" tone="muted" style={s.caption}>
          {fill(copy.stats.bestDay, { day: calendar.weekdays[bestDay] })}
        </Text>
        <WeekdayBars values={weekdays} weekStart={weekStart} color={t.accent} />
      </Card>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  header: { gap: 4, marginBottom: 18 },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16, marginBottom: 12 },
  section: { marginBottom: 12 },
  caption: { marginTop: 4, marginBottom: 16 },
  habitList: { gap: 14 },
  habitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  habitText: { flex: 1, gap: 8 },
  habitTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  habitName: { flex: 1 },
  habitRate: { minWidth: 42, textAlign: "right", fontVariant: ["tabular-nums"] },
  track: { height: 6, borderRadius: radius.pill, backgroundColor: t.raised, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radius.pill },
}));

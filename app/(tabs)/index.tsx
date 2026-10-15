import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { Burst } from "@/components/Burst";
import { Celebration } from "@/components/Celebration";
import { EmptyState } from "@/components/EmptyState";
import { HabitRow } from "@/components/HabitRow";
import { ProgressRing } from "@/components/ProgressRing";
import { WeekStrip } from "@/components/WeekStrip";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tap } from "@/components/ui/Tap";
import { Text } from "@/components/ui/Text";
import { copy, partsOfDay } from "@/constants/content";
import type { IconName } from "@/constants/icons";
import { fonts, radius } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { useToday } from "@/hooks/useToday";
import { startOfWeek } from "@/lib/dates";
import { fill, formatDate, greeting, percent } from "@/lib/format";
import { currentStreak, daySummary, habitsFor, isPlanned, rangeSummary } from "@/lib/habits";
import { useGarden } from "@/lib/store";

/** Today: the week strip, a progress ring and the day's habits by time of day. */
export default function TodayScreen() {
  const s = useStyles();
  const t = useTheme();
  const today = useToday();
  const [day, setDay] = useState(today);
  const habits = useGarden((state) => state.habits);
  const checkins = useGarden((state) => state.checkins);
  const name = useGarden((state) => state.prefs.name);
  const weekStart = useGarden((state) => state.prefs.weekStart);

  // A new day starts: jump to it.
  useEffect(() => setDay(today), [today]);

  const visible = useMemo(() => habitsFor(habits, day), [habits, day]);
  const groups = useMemo(
    () =>
      partsOfDay
        .map((part) => ({ ...part, habits: visible.filter((h) => h.part === part.key && isPlanned(h, day)) }))
        .filter((group) => group.habits.length > 0),
    [visible, day],
  );
  const resting = useMemo(() => visible.filter((h) => !isPlanned(h, day)), [visible, day]);
  const summary = useMemo(() => daySummary(habits, checkins, day), [habits, checkins, day]);
  const longest = useMemo(
    () => habitsFor(habits, today).reduce((max, h) => Math.max(max, currentStreak(h, checkins, today)), 0),
    [habits, checkins, today],
  );
  const week = useMemo(
    () => rangeSummary(habits, checkins, startOfWeek(today, weekStart), today, today),
    [habits, checkins, today, weekStart],
  );

  // Celebrate the moment the last habit of today is checked off.
  const allDone = summary.planned > 0 && summary.done === summary.planned;
  const [burst, setBurst] = useState(0);
  const previous = useRef({ allDone, day });
  useEffect(() => {
    if (allDone && !previous.current.allDone && previous.current.day === day && day === today) setBurst((n) => n + 1);
    previous.current = { allDone, day };
  }, [allDone, day, today]);

  const isToday = day === today;
  const left = summary.planned - summary.done;
  const hero = copy.today.hero;
  const message = !isToday
    ? hero.past
    : summary.planned === 0
      ? hero.rest
      : allDone
        ? hero.allDone
        : summary.progress === 0
          ? hero.none
          : left === 1
            ? hero.oneLeft
            : hero.some;

  const garden = habitsFor(habits, today).length > 0;

  return (
    <View style={s.screen}>
      <Screen>
        <View style={s.header}>
          <Text variant="caps" tone="accent">
            {formatDate(today, "long")}
          </Text>
          <Text variant="hero" style={s.greeting} accessibilityRole="header">
            {greeting(name)}
          </Text>
        </View>

        {!garden ? (
          <EmptyState title={copy.today.emptyTitle} body={copy.today.emptyBody} />
        ) : (
          <>
            <WeekStrip selected={day} today={today} onSelect={setDay} />

            {!isToday && (
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={s.pastRow}>
                <Text variant="small" tone="muted">
                  {fill(copy.today.viewing, { date: formatDate(day, "withWeekday") })}
                </Text>
                <Tap label={copy.today.backToToday} onPress={() => setDay(today)} style={s.pastButton}>
                  <Text variant="small" tone="accent" style={s.pastButtonText}>
                    {copy.today.backToToday}
                  </Text>
                </Tap>
              </Animated.View>
            )}

            <Card style={s.hero}>
              <View>
                <ProgressRing progress={summary.share} size={124} stroke={12}>
                  <Text variant="number" style={s.ringNumber}>
                    {summary.done}
                    <Text variant="number" tone="faint" style={s.ringOf}>
                      /{summary.planned}
                    </Text>
                  </Text>
                  <Text variant="small" tone="muted">
                    {copy.today.ringCaption}
                  </Text>
                </ProgressRing>
                <Burst play={burst} colors={[...t.ring, t.flame]} />
              </View>
              <View style={s.heroText}>
                <View style={s.messageBlock}>
                  <Text variant="heading">{message.title}</Text>
                  <Text variant="small" tone="muted">
                    {fill(message.body, { left })}
                  </Text>
                </View>
                <MiniStat icon="flame" color={t.flame} value={String(longest)} label={copy.today.statStreak} />
                <MiniStat
                  icon="calendar-check"
                  color={t.accentText}
                  value={percent(week.completion ?? 0)}
                  label={copy.today.statWeek}
                />
              </View>
            </Card>

            {groups.map((group, g) => {
              const done = group.habits.filter((h) => (checkins[h.id]?.[day] ?? 0) >= h.goal).length;
              return (
                <View key={group.key} style={s.group}>
                  <SectionHeader title={group.label} right={`${done}/${group.habits.length}`} />
                  <View style={s.list}>
                    {group.habits.map((habit, i) => (
                      <Animated.View key={habit.id} entering={FadeInDown.duration(420).delay(120 + (g * 2 + i) * 55)}>
                        <HabitRow habit={habit} day={day} today={today} />
                      </Animated.View>
                    ))}
                  </View>
                </View>
              );
            })}
            {resting.length > 0 && (
              <View style={s.group}>
                <SectionHeader title={isToday ? copy.today.resting : copy.today.restingOn} />
                <View style={s.list}>
                  {resting.map((habit) => (
                    <Animated.View key={habit.id} entering={FadeIn.duration(300)}>
                      <HabitRow habit={habit} day={day} today={today} resting />
                    </Animated.View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </Screen>
      {burst > 0 && <Celebration key={burst} text={copy.today.celebrate} />}
    </View>
  );
}

function MiniStat({ icon, color, value, label }: { icon: IconName; color: string; value: string; label: string }) {
  const s = useStyles();
  return (
    <View style={s.mini}>
      <View style={s.miniIcon}>
        <Icon name={icon} size={15} color={color} strokeWidth={2.4} />
      </View>
      <Text variant="label" style={s.miniValue} numberOfLines={1}>
        {value}{" "}
        <Text variant="small" tone="muted">
          {label}
        </Text>
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1 },
  header: { gap: 6, marginBottom: 18 },
  greeting: { marginTop: 2 },
  pastRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: t.raised,
  },
  pastButton: { paddingHorizontal: 12, paddingVertical: 6 },
  pastButtonText: { fontFamily: fonts.bodyBold },
  hero: { flexDirection: "row", alignItems: "center", gap: 18, marginTop: 16, marginBottom: 8 },
  ringNumber: { fontSize: 30, lineHeight: 34 },
  ringOf: { fontSize: 20 },
  heroText: { flex: 1, gap: 10 },
  messageBlock: { gap: 2, marginBottom: 4 },
  mini: { flexDirection: "row", alignItems: "center", gap: 7 },
  miniIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: t.raised,
    alignItems: "center",
    justifyContent: "center",
  },
  miniValue: { flex: 1, fontVariant: ["tabular-nums"] },
  group: { marginTop: 22 },
  list: { gap: 10 },
}));

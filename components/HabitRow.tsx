import { router } from "expo-router";
import { memo, useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { copy } from "@/constants/content";
import { radius } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { mix } from "@/lib/color";
import { fill, formatSchedule, formatTime } from "@/lib/format";
import { currentStreak } from "@/lib/habits";
import { haptics } from "@/lib/haptics";
import { useGarden } from "@/lib/store";
import type { DateKey, Habit } from "@/lib/types";
import { CheckButton } from "./CheckButton";
import { HabitIcon } from "./HabitIcon";
import { Streak } from "./Streak";
import { Tap } from "./ui/Tap";
import { Text } from "./ui/Text";

/**
 * One habit on the Today list. Tap the row to open the habit, tap the circle
 * to check it off (count habits add one per tap; long-press takes one back).
 */
export const HabitRow = memo(function HabitRow({
  habit,
  day,
  today,
  resting = false,
}: {
  habit: Habit;
  day: DateKey;
  today: DateKey;
  /** Not planned on this day: shown quieter, still checkable. */
  resting?: boolean;
}) {
  const s = useStyles();
  const t = useTheme();
  const days = useGarden((state) => state.checkins[habit.id]);
  const weekStart = useGarden((state) => state.prefs.weekStart);
  const setCount = useGarden((state) => state.setCount);
  const count = days?.[day] ?? 0;
  const done = count >= habit.goal;
  const streak = useMemo(() => currentStreak(habit, { [habit.id]: days ?? {} }, today), [habit, days, today]);

  const tint = useSharedValue(done ? 1 : 0);
  useEffect(() => {
    tint.value = withTiming(done ? 1 : 0, { duration: done ? 420 : 240 });
  }, [done, tint]);
  const doneSurface = mix(t.surface, habit.color, t.mode === "dark" ? 0.09 : 0.1);
  const rowStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(tint.value, [0, 1], [t.surface, doneSurface]),
  }));

  const onCheck = () => {
    let next: number;
    if (habit.goal === 1) next = done ? 0 : 1;
    else next = done ? count - 1 : count + 1;
    if (next >= habit.goal && !done) haptics.success();
    else if (next > count) haptics.light();
    else haptics.select();
    setCount(habit.id, day, next);
  };

  const onUndoOne = () => {
    if (count === 0) return;
    haptics.select();
    setCount(habit.id, day, count - 1);
  };

  const meta =
    habit.goal > 1
      ? fill(copy.today.countLine, { count, goal: habit.goal, unit: habit.unit }).trim()
      : habit.reminder
        ? formatTime(habit.reminder)
        : formatSchedule(habit.days, weekStart);

  const label = fill(
    habit.goal > 1 && !done ? copy.today.addOneLabel : done ? copy.today.uncheckLabel : copy.today.checkLabel,
    { name: habit.name },
  );

  return (
    <Animated.View style={[s.row, resting && s.resting, rowStyle]}>
      <Tap
        label={habit.name}
        hint={meta}
        onPress={() => router.push({ pathname: "/habit/[id]", params: { id: habit.id } })}
        style={s.main}
        scaleTo={0.985}
      >
        <HabitIcon icon={habit.icon} color={habit.color} />
        <View style={s.text}>
          <Text variant="label" numberOfLines={1} style={s.name}>
            {habit.name}
          </Text>
          <View style={s.meta}>
            {streak > 0 && <Streak days={streak} />}
            {streak > 0 && <View style={s.dot} />}
            <Text variant="small" tone="muted" numberOfLines={1} style={s.metaText}>
              {meta}
            </Text>
          </View>
        </View>
      </Tap>
      <CheckButton
        color={habit.color}
        count={count}
        goal={habit.goal}
        label={label}
        onPress={onCheck}
        onLongPress={habit.goal > 1 ? onUndoOne : undefined}
      />
    </Animated.View>
  );
});

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 14,
    borderRadius: radius.lg,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: t.line,
  },
  resting: { opacity: 0.62 },
  main: { flex: 1, flexDirection: "row", alignItems: "center", gap: 13 },
  text: { flex: 1, gap: 3 },
  name: { fontSize: 16 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { flexShrink: 1 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: t.faint },
}));

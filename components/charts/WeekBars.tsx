import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { calendar } from "@/constants/content";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { withAlpha } from "@/lib/color";
import { addDays, dayOfMonth, monthOf } from "@/lib/dates";
import { EASE } from "@/lib/motion";
import type { DateKey } from "@/lib/types";
import { Text } from "../ui/Text";

/** One bar per week (0..1, null before tracking began); this week is the bright one. */
export function WeekBars({
  data,
  color,
  height = 112,
}: {
  data: { start: DateKey; rate: number | null }[];
  color: string;
  height?: number;
}) {
  const s = useStyles();
  const t = useTheme();
  const known = data.map((d) => d.rate).filter((r): r is number => r !== null);
  const average = known.length ? known.reduce((a, b) => a + b, 0) / known.length : 0;
  return (
    <View>
      <View style={[s.plot, { height }]}>
        {[0.5, 1].map((line) => (
          <View key={line} style={[s.grid, { bottom: line * height }]} />
        ))}
        {known.length > 0 && <View style={[s.average, { bottom: average * height, borderColor: withAlpha(t.text, 0.35) }]} />}
        {data.map((week, i) => (
          <Bar
            key={week.start}
            value={week.rate}
            height={height}
            color={i === data.length - 1 ? color : withAlpha(color, t.mode === "dark" ? 0.5 : 0.6)}
            delay={i * 40}
          />
        ))}
      </View>
      <View style={s.labels}>
        {data.map((week) => {
          // Label the week in which a month begins.
          const end = addDays(week.start, 6);
          const startsMonth = dayOfMonth(week.start) === 1 || monthOf(end) !== monthOf(week.start);
          return (
            <Text key={week.start} variant="small" tone="faint" style={s.label} numberOfLines={1}>
              {startsMonth ? calendar.monthsShort[monthOf(end)] : ""}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

function Bar({ value, height, color, delay }: { value: number | null; height: number; color: string; delay: number }) {
  const s = useStyles();
  const grow = useSharedValue(0);
  useEffect(() => {
    grow.value = withDelay(delay, withTiming(1, { duration: 650, easing: EASE }));
  }, [grow, delay, value]);
  const target = value === null ? 3 : Math.max(4, value * height);
  const style = useAnimatedStyle(() => ({ height: target * grow.value }));
  return (
    <View style={s.slot}>
      <Animated.View style={[s.bar, { backgroundColor: value === null ? "transparent" : color }, style]} />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  plot: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  grid: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: t.line },
  average: { position: "absolute", left: 0, right: 0, borderTopWidth: 1.5, borderStyle: "dashed" },
  slot: { flex: 1, height: "100%", justifyContent: "flex-end", alignItems: "center" },
  bar: { width: "100%", maxWidth: 18, borderRadius: 9 },
  labels: { flexDirection: "row", gap: 6, marginTop: 8 },
  label: { flex: 1, textAlign: "center", fontSize: 10.5, lineHeight: 13 },
}));

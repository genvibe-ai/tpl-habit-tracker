import { View } from "react-native";
import { calendar } from "@/constants/content";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { withAlpha } from "@/lib/color";
import { percent } from "@/lib/format";
import { Text } from "../ui/Text";

/** Completion by weekday (index 0 = Sunday), in the week's order, best day highlighted. */
export function WeekdayBars({ values, weekStart, color }: { values: (number | null)[]; weekStart: 0 | 1; color: string }) {
  const s = useStyles();
  const t = useTheme();
  const order = Array.from({ length: 7 }, (_, i) => (weekStart + i) % 7);
  const best = values.reduce<number>((top, v, i) => (v !== null && v > (values[top] ?? -1) ? i : top), 0);
  return (
    <View style={s.row}>
      {order.map((weekday) => {
        const value = values[weekday];
        const isBest = weekday === best && value !== null;
        return (
          <View key={weekday} style={s.day} accessibilityLabel={`${calendar.weekdays[weekday]} ${value === null ? "" : percent(value)}`}>
            <Text variant="small" tone={isBest ? "text" : "faint"} style={s.value}>
              {value === null ? "–" : Math.round(value * 100)}
            </Text>
            <View style={s.track}>
              <View
                style={[
                  s.fill,
                  { height: `${Math.max(6, (value ?? 0) * 100)}%`, backgroundColor: isBest ? color : withAlpha(color, t.mode === "dark" ? 0.4 : 0.5) },
                ]}
              />
            </View>
            <Text variant="caps" tone={isBest ? "accent" : "faint"} style={s.letter}>
              {calendar.weekdaysLetter[weekday]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: "row", gap: 8 },
  day: { flex: 1, alignItems: "center", gap: 6 },
  value: { fontSize: 11, lineHeight: 14, fontVariant: ["tabular-nums"] },
  track: { width: "100%", maxWidth: 20, height: 72, borderRadius: 10, backgroundColor: t.raised, justifyContent: "flex-end", overflow: "hidden" },
  fill: { width: "100%", borderRadius: 10 },
  letter: { fontSize: 11 },
}));

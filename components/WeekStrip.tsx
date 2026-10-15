import { useMemo } from "react";
import { View } from "react-native";
import { calendar } from "@/constants/content";
import { fonts, radius } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { addDays, dayOfMonth, startOfWeek, weekdayOf } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { daySummary } from "@/lib/habits";
import { useGarden } from "@/lib/store";
import type { DateKey } from "@/lib/types";
import { ProgressRing } from "./ProgressRing";
import { Tap } from "./ui/Tap";
import { Text } from "./ui/Text";

/** This week, one ring per day. Tap a past day to fill it in. */
export function WeekStrip({
  selected,
  today,
  onSelect,
}: {
  selected: DateKey;
  today: DateKey;
  onSelect: (day: DateKey) => void;
}) {
  const s = useStyles();
  const t = useTheme();
  const habits = useGarden((state) => state.habits);
  const checkins = useGarden((state) => state.checkins);
  const weekStart = useGarden((state) => state.prefs.weekStart);
  const days = useMemo(() => {
    const first = startOfWeek(today, weekStart);
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(first, i);
      return { day, share: day > today ? 0 : daySummary(habits, checkins, day).share };
    });
  }, [today, weekStart, habits, checkins]);

  return (
    <View style={s.strip} accessibilityRole="tablist">
      {days.map(({ day, share }, i) => {
        const future = day > today;
        const active = day === selected;
        const isToday = day === today;
        return (
          <Tap
            key={day}
            role="tab"
            selected={active}
            disabled={future}
            label={formatDate(day, "withWeekday")}
            onPress={() => onSelect(day)}
            style={[s.day, active && s.active]}
            scaleTo={0.92}
          >
            <Text variant="caps" color={isToday ? t.accentText : active ? t.text : t.faint} style={s.letter}>
              {calendar.weekdaysLetter[weekdayOf(day)]}
            </Text>
            <ProgressRing progress={share} size={36} stroke={3.5} color={t.accent} glow={false} delay={120 + i * 45}>
              <Text style={[s.number, { color: future ? t.faint : t.text }]}>{dayOfMonth(day)}</Text>
            </ProgressRing>
          </Tap>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  strip: { flexDirection: "row", justifyContent: "space-between", gap: 2 },
  day: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: radius.md,
    borderCurve: "continuous",
  },
  active: { backgroundColor: t.raised },
  letter: { fontSize: 11, letterSpacing: 0.4 },
  number: { fontFamily: fonts.bodyBold, fontSize: 13, lineHeight: 16, fontVariant: ["tabular-nums"] },
}));

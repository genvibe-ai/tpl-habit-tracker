import { View } from "react-native";
import { calendar, copy } from "@/constants/content";
import { fonts } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { withAlpha } from "@/lib/color";
import { Segmented } from "../ui/Segmented";
import { Tap } from "../ui/Tap";
import { Text } from "../ui/Text";

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];
type Preset = "every" | "weekdays" | "custom";

/** Which weekdays a habit is planned on: presets plus seven day toggles. */
export function DayPicker({
  value,
  weekStart,
  color,
  onChange,
}: {
  value: number[];
  weekStart: 0 | 1;
  color: string;
  onChange: (days: number[]) => void;
}) {
  const s = useStyles();
  const t = useTheme();
  const set = new Set(value);
  const preset: Preset =
    set.size === 7 ? "every" : set.size === 5 && WEEKDAYS.every((d) => set.has(d)) ? "weekdays" : "custom";
  const order = EVERY_DAY.map((i) => (i + weekStart) % 7);
  return (
    <View style={s.wrap}>
      <Segmented<Preset>
        label={copy.editor.schedule}
        value={preset}
        onChange={(next) => {
          if (next === "every") onChange(EVERY_DAY);
          if (next === "weekdays") onChange(WEEKDAYS);
          if (next === "custom" && preset !== "custom") onChange([1, 3, 5]);
        }}
        options={[
          { key: "every", label: copy.common.everyDay },
          { key: "weekdays", label: copy.common.weekdays },
          { key: "custom", label: copy.editor.custom },
        ]}
      />
      <View style={s.days}>
        {order.map((day) => {
          const on = set.has(day);
          return (
            <Tap
              key={day}
              role="checkbox"
              selected={on}
              label={calendar.weekdays[day]}
              scaleTo={0.88}
              onPress={() => onChange(on ? value.filter((d) => d !== day) : [...value, day].sort((a, b) => a - b))}
              style={[s.day, on && { backgroundColor: withAlpha(color, t.mode === "dark" ? 0.2 : 0.24), borderColor: color }]}
            >
              <Text style={[s.letter, { color: on ? t.text : t.muted }]}>{calendar.weekdaysShort[day].slice(0, 2)}</Text>
            </Tap>
          );
        })}
      </View>
      {value.length === 0 && (
        <Text variant="small" tone="danger">
          {copy.editor.pickADay}
        </Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { gap: 12 },
  days: { flexDirection: "row", justifyContent: "space-between", gap: 6 },
  day: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.raised,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  letter: { fontFamily: fonts.bodySemibold, fontSize: 13 },
}));

import { View } from "react-native";
import { copy } from "@/constants/content";
import { fonts } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { fill } from "@/lib/format";
import { IconButton } from "../ui/IconButton";
import { Input } from "../ui/Input";
import { Text } from "../ui/Text";

/** How many times a day (1–20); with more than one, a unit like "glasses". */
export function GoalStepper({
  goal,
  unit,
  onGoal,
  onUnit,
}: {
  goal: number;
  unit: string;
  onGoal: (goal: number) => void;
  onUnit: (unit: string) => void;
}) {
  const s = useStyles();
  const t = useTheme();
  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <IconButton name="minus" label={copy.editor.decreaseGoal} onPress={() => onGoal(Math.max(1, goal - 1))} disabled={goal <= 1} size={40} />
        <View style={s.value}>
          <Text style={[s.number, { color: t.text }]}>{goal}</Text>
          <Text variant="small" tone="muted">
            {goal === 1 ? copy.editor.goalOnce : fill(copy.editor.goalTimes, { n: goal })}
          </Text>
        </View>
        <IconButton name="plus" label={copy.editor.increaseGoal} onPress={() => onGoal(Math.min(20, goal + 1))} disabled={goal >= 20} size={40} />
      </View>
      {goal > 1 && (
        <Input
          value={unit}
          onChangeText={onUnit}
          placeholder={copy.editor.unitPlaceholder}
          style={s.unit}
          maxLength={16}
          autoCapitalize="none"
          accessibilityLabel={copy.editor.unitPlaceholder}
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { gap: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  value: { alignItems: "center", gap: 2 },
  number: { fontFamily: fonts.displayHeavy, fontSize: 30, lineHeight: 34, fontVariant: ["tabular-nums"] },
  unit: { height: 48, fontFamily: fonts.bodyMedium, fontSize: 16 },
}));

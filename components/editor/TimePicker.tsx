import { ScrollView, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { copy } from "@/constants/content";
import { fonts, radius } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { minutesOf, timeOf } from "@/lib/dates";
import { formatTime } from "@/lib/format";
import { IconButton } from "../ui/IconButton";
import { Tap } from "../ui/Tap";
import { Text } from "../ui/Text";

const STEP = 15;

/** A reminder time: big clock face, 15-minute steps and a few presets. Same on every platform. */
export function TimePicker({ value, onChange }: { value: string; onChange: (time: string) => void }) {
  const s = useStyles();
  const t = useTheme();
  const minutes = minutesOf(value);
  const [clock, suffix] = formatTime(value).split(" ");
  return (
    <View style={s.wrap}>
      <View style={s.face}>
        <IconButton name="minus" label={copy.time.earlier} onPress={() => onChange(timeOf(minutes - STEP))} size={44} />
        <Animated.View key={value} entering={FadeIn.duration(160)} style={s.readout}>
          <Text style={[s.clock, { color: t.text }]}>{clock}</Text>
          {suffix ? (
            <Text variant="label" tone="muted">
              {suffix}
            </Text>
          ) : null}
        </Animated.View>
        <IconButton name="plus" label={copy.time.later} onPress={() => onChange(timeOf(minutes + STEP))} size={44} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.presets}>
        {copy.time.presets.map((preset) => {
          const active = preset.time === value;
          return (
            <Tap
              key={preset.time}
              label={`${preset.label} ${formatTime(preset.time)}`}
              role="radio"
              selected={active}
              onPress={() => onChange(preset.time)}
              style={[s.preset, active && s.presetActive]}
            >
              <Text variant="small" tone={active ? "text" : "muted"} style={s.presetLabel}>
                {preset.label}
              </Text>
              <Text variant="small" tone={active ? "accent" : "faint"}>
                {formatTime(preset.time)}
              </Text>
            </Tap>
          );
        })}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { gap: 14 },
  face: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  readout: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  clock: { fontFamily: fonts.displayHeavy, fontSize: 40, lineHeight: 46, letterSpacing: -1, fontVariant: ["tabular-nums"] },
  presets: { gap: 8 },
  preset: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.md,
    backgroundColor: t.raised,
    borderWidth: 1.5,
    borderColor: "transparent",
    alignItems: "center",
  },
  presetActive: { borderColor: t.accent },
  presetLabel: { fontFamily: fonts.bodySemibold },
}));

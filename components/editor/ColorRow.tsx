import { View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { habitColors } from "@/constants/content";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { Icon } from "../ui/Icon";
import { Tap } from "../ui/Tap";

/** Color swatches for a habit (content.ts → habitColors). */
export function ColorRow({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const s = useStyles();
  const t = useTheme();
  return (
    <View style={s.row}>
      {habitColors.map((color) => {
        const active = color.hex.toLowerCase() === value.toLowerCase();
        return (
          <Tap
            key={color.hex}
            label={color.name}
            role="radio"
            selected={active}
            onPress={() => onChange(color.hex)}
            scaleTo={0.85}
            style={[s.ring, active && { borderColor: color.hex }]}
          >
            <View style={[s.swatch, { backgroundColor: color.hex }]}>
              {active && (
                <Animated.View entering={ZoomIn.duration(180)}>
                  <Icon name="check" size={16} color={t.onColor} strokeWidth={3} />
                </Animated.View>
              )}
            </View>
          </Tap>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(() => ({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  ring: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: "transparent", alignItems: "center", justifyContent: "center" },
  swatch: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
}));

import { View } from "react-native";
import type { IconName } from "@/constants/icons";
import { useTheme } from "@/hooks/useTheme";
import { mix, withAlpha } from "@/lib/color";
import { Icon } from "./ui/Icon";

/** A habit's icon on a soft tint of its color. */
export function HabitIcon({ icon, color, size = 46 }: { icon: IconName; color: string; size?: number }) {
  const t = useTheme();
  const ink = t.mode === "dark" ? color : mix(color, "#0E1A12", 0.38);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.34,
        borderCurve: "continuous",
        backgroundColor: withAlpha(color, t.mode === "dark" ? 0.15 : 0.2),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name={icon} size={Math.round(size * 0.46)} color={ink} strokeWidth={2} />
    </View>
  );
}

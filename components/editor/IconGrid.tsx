import { View } from "react-native";
import { habitIcons } from "@/constants/content";
import type { IconName } from "@/constants/icons";
import { radius } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { mix, withAlpha } from "@/lib/color";
import { Icon } from "../ui/Icon";
import { Tap } from "../ui/Tap";

/** The habit icon picker (icons listed in content.ts → habitIcons). */
export function IconGrid({ value, color, onChange }: { value: IconName; color: string; onChange: (icon: IconName) => void }) {
  const s = useStyles();
  const t = useTheme();
  const ink = t.mode === "dark" ? color : mix(color, "#0E1A12", 0.38);
  return (
    <View style={s.grid}>
      {habitIcons.map((name) => {
        const active = name === value;
        return (
          <Tap
            key={name}
            label={name.replace(/-/g, " ")}
            role="radio"
            selected={active}
            onPress={() => onChange(name)}
            scaleTo={0.88}
            style={[s.cell, active && { backgroundColor: withAlpha(color, t.mode === "dark" ? 0.18 : 0.22), borderColor: color }]}
          >
            <Icon name={name} size={22} color={active ? ink : t.muted} strokeWidth={active ? 2.2 : 1.9} />
          </Tap>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cell: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.raised,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
}));

import { View, type StyleProp, type ViewStyle } from "react-native";
import type { IconName } from "@/constants/icons";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { mix, withAlpha } from "@/lib/color";
import { Card } from "./ui/Card";
import { Icon } from "./ui/Icon";
import { Text } from "./ui/Text";

/** A number with its label: "23 days · Current streak". */
export function StatTile({
  icon,
  color,
  label,
  value,
  unit,
  caption,
  style,
}: {
  icon: IconName;
  color: string;
  label: string;
  value: string;
  unit?: string;
  caption?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const s = useStyles();
  const t = useTheme();
  const ink = t.mode === "dark" ? color : mix(color, "#0E1A12", 0.3);
  return (
    <Card style={[s.tile, style]}>
      <View style={[s.icon, { backgroundColor: withAlpha(color, t.mode === "dark" ? 0.14 : 0.18) }]}>
        <Icon name={icon} size={16} color={ink} strokeWidth={2.4} />
      </View>
      <View style={s.valueRow}>
        <Text variant="number" style={s.value} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        {unit ? (
          <Text variant="label" tone="muted" numberOfLines={1}>
            {unit}
          </Text>
        ) : null}
      </View>
      <View style={s.text}>
        <Text variant="label" numberOfLines={1}>
          {label}
        </Text>
        {caption ? (
          <Text variant="small" tone="faint" numberOfLines={2}>
            {caption}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

const useStyles = makeStyles(() => ({
  tile: { flexBasis: "46%", flexGrow: 1, padding: 16, gap: 10 },
  icon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  valueRow: { flexDirection: "row", alignItems: "baseline", gap: 5, marginTop: 2 },
  value: { fontVariant: ["tabular-nums"] },
  text: { gap: 1 },
}));

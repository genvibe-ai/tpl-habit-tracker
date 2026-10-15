import { View, type StyleProp, type ViewStyle } from "react-native";
import type { IconName } from "@/constants/icons";
import { radius } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { Icon } from "./Icon";
import { Tap } from "./Tap";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "ghost" | "danger";

/** Pill buttons: primary (leaf green), secondary (raised), ghost (text only) and danger. */
export function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  disabled,
  size = "md",
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  disabled?: boolean;
  size?: "md" | "lg";
  style?: StyleProp<ViewStyle>;
}) {
  const s = useStyles();
  const t = useTheme();
  const ink = { primary: t.onAccent, secondary: t.text, ghost: t.accentText, danger: t.danger }[variant];
  return (
    <Tap label={title} onPress={onPress} disabled={disabled} style={[s.base, s[size], s[variant], style]} scaleTo={0.96}>
      <View style={s.row}>
        {icon && <Icon name={icon} size={size === "lg" ? 20 : 18} color={ink} strokeWidth={2.2} />}
        <Text variant="label" color={ink} style={size === "lg" && s.lgText}>
          {title}
        </Text>
      </View>
    </Tap>
  );
}

const useStyles = makeStyles((t) => ({
  base: { borderRadius: radius.pill, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  md: { height: 46 },
  lg: { height: 56, paddingHorizontal: 26 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  lgText: { fontSize: 17 },
  primary: { backgroundColor: t.accent },
  secondary: { backgroundColor: t.raised },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: t.mode === "dark" ? "#FF80801A" : "#C2410C14" },
}));

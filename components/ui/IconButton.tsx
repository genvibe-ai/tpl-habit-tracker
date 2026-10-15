import type { IconName } from "@/constants/icons";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { Icon } from "./Icon";
import { Tap } from "./Tap";

/** A round button holding one icon (headers, steppers). */
export function IconButton({
  name,
  label,
  onPress,
  size = 42,
  tone = "raised",
  disabled,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  size?: number;
  tone?: "raised" | "accent" | "plain";
  disabled?: boolean;
}) {
  const s = useStyles();
  const t = useTheme();
  const background = { raised: t.raised, accent: t.accent, plain: "transparent" }[tone];
  return (
    <Tap
      label={label}
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.9}
      hitSlop={8}
      style={[s.button, { width: size, height: size, borderRadius: size / 2, backgroundColor: background }]}
    >
      <Icon name={name} size={Math.round(size * 0.45)} color={tone === "accent" ? t.onAccent : t.text} strokeWidth={2.2} />
    </Tap>
  );
}

const useStyles = makeStyles(() => ({
  button: { alignItems: "center", justifyContent: "center" },
}));

import { Text as NativeText, type TextProps } from "react-native";
import { type as scale, type TypeVariant } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export type Tone = "text" | "muted" | "faint" | "accent" | "danger" | "onAccent";

/** Text in the app's type scale and palette: `<Text variant="title" tone="muted">`. */
export function Text({
  variant = "body",
  tone = "text",
  color,
  style,
  ...rest
}: TextProps & { variant?: TypeVariant; tone?: Tone; color?: string }) {
  const t = useTheme();
  const tones = { text: t.text, muted: t.muted, faint: t.faint, accent: t.accentText, danger: t.danger, onAccent: t.onAccent };
  return <NativeText maxFontSizeMultiplier={1.4} {...rest} style={[scale[variant], { color: color ?? tones[tone] }, style]} />;
}

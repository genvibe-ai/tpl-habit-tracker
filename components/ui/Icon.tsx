import { ICONS, type IconName } from "@/constants/icons";
import { useTheme } from "@/hooks/useTheme";

/** A Lucide icon by name (constants/icons.ts). */
export function Icon({
  name,
  size = 20,
  color,
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const t = useTheme();
  const Glyph = ICONS[name] ?? ICONS.sparkles;
  return <Glyph size={size} color={color ?? t.text} strokeWidth={strokeWidth} />;
}

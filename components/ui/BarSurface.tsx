import type { PropsWithChildren } from "react";
import { Platform, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { withAlpha } from "@/lib/color";

/**
 * Android and web: the floating tab bar is a frosted, slightly see-through
 * surface (the web blurs what scrolls under it). iOS uses BarSurface.ios.tsx.
 */
export function BarSurface({
  children,
  style,
  onLayout,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle>; onLayout?: (e: LayoutChangeEvent) => void }>) {
  const t = useTheme();
  const web: ViewStyle =
    Platform.OS === "web" ? ({ backdropFilter: "blur(18px) saturate(140%)" } as ViewStyle) : {};
  return (
    <View
      onLayout={onLayout}
      style={[
        {
          backgroundColor: withAlpha(t.mode === "dark" ? "#161E18" : "#FFFFFF", Platform.OS === "web" ? 0.82 : 0.97),
          borderWidth: 1,
          borderColor: t.line,
          boxShadow:
            t.mode === "dark" ? "0 10px 30px -8px rgba(0, 0, 0, 0.6)" : "0 10px 30px -10px rgba(14, 26, 18, 0.25)",
        },
        web,
        style,
      ]}
    >
      {children}
    </View>
  );
}

import { BlurView } from "expo-blur";
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from "expo-glass-effect";
import { useEffect, useState, type PropsWithChildren } from "react";
import { AccessibilityInfo, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";

const glassAvailable = isGlassEffectAPIAvailable() && isLiquidGlassAvailable();

/**
 * iOS: native Liquid Glass on iOS 26+, a system blur on older versions or
 * when Reduce Transparency is on. Android and the web use BarSurface.tsx.
 */
export function BarSurface({
  children,
  style,
  onLayout,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle>; onLayout?: (e: LayoutChangeEvent) => void }>) {
  const t = useTheme();
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduce);
    const subscription = AccessibilityInfo.addEventListener("reduceTransparencyChanged", setReduce);
    return () => subscription.remove();
  }, []);

  if (glassAvailable && !reduce) {
    return (
      <GlassView glassEffectStyle="regular" colorScheme={t.mode} onLayout={onLayout} style={style}>
        {children}
      </GlassView>
    );
  }
  return (
    <BlurView
      intensity={90}
      tint={t.mode === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
      onLayout={onLayout}
      style={[{ overflow: "hidden", borderWidth: 1, borderColor: t.line }, style]}
    >
      {children}
    </BlurView>
  );
}

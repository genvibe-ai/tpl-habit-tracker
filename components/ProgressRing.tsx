import { useEffect, useId, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedProps, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, G, LinearGradient, RadialGradient, Stop } from "react-native-svg";
import { useTheme } from "@/hooks/useTheme";
import { EASE } from "@/lib/motion";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** A ring that fills to `progress` (0..1) with a soft green gradient. */
export function ProgressRing({
  progress,
  size = 124,
  stroke = 12,
  color,
  glow = true,
  delay = 0,
  children,
}: {
  progress: number;
  size?: number;
  stroke?: number;
  /** A solid color instead of the gradient (small rings). */
  color?: string;
  glow?: boolean;
  delay?: number;
  children?: ReactNode;
}) {
  const t = useTheme();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const value = useSharedValue(0);
  useEffect(() => {
    value.value = withDelay(delay, withTiming(Math.max(0, Math.min(1, progress)), { duration: 900, easing: EASE }));
  }, [progress, delay, value]);

  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const center = size / 2;
  const arc = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - value.value),
    strokeOpacity: value.value > 0.004 ? 1 : 0,
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={`ring${id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={t.ring[0]} />
            <Stop offset="0.5" stopColor={t.ring[1]} />
            <Stop offset="1" stopColor={t.ring[2]} />
          </LinearGradient>
          <RadialGradient id={`glow${id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={t.accent} stopOpacity={t.mode === "dark" ? 0.14 : 0.1} />
            <Stop offset="0.75" stopColor={t.accent} stopOpacity={t.mode === "dark" ? 0.05 : 0.03} />
            <Stop offset="1" stopColor={t.accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {glow && <Circle cx={center} cy={center} r={center} fill={`url(#glow${id})`} />}
        <Circle cx={center} cy={center} r={r} stroke={t.raised} strokeWidth={stroke} fill="none" />
        <G transform={`rotate(-90 ${center} ${center})`}>
          <AnimatedCircle
            cx={center}
            cy={center}
            r={r}
            stroke={color ?? `url(#ring${id})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={arc}
          />
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});

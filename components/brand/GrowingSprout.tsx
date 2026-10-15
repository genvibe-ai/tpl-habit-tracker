import { useEffect, useId } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from "react-native-svg";
import { useTheme } from "@/hooks/useTheme";
import { MARK } from "./mark";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const VIEW = MARK.viewBox;
/** A point of the mark as a share of the (square) view box: where each leaf grows from. */
const origin = (x: number, y: number) =>
  `${(((x - MARK.box.x) / MARK.box.size) * 100).toFixed(2)}% ${(((y - MARK.box.y) / MARK.box.size) * 100).toFixed(2)}%`;

const SPORES = [
  { x: 0.22, size: 5, delay: 0, duration: 5200 },
  { x: 0.74, size: 4, delay: 1400, duration: 6100 },
  { x: 0.4, size: 3, delay: 2600, duration: 4800 },
  { x: 0.86, size: 5, delay: 3300, duration: 5600 },
  { x: 0.1, size: 3, delay: 4100, duration: 6400 },
];

/** The welcome illustration: the Tendril sprout draws itself, its leaves unfurl, light breathes behind it. */
export function GrowingSprout({ size = 220 }: { size?: number }) {
  const t = useTheme();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const reduced = useReducedMotion();
  const stem = useSharedValue(reduced ? 1 : 0);
  const left = useSharedValue(reduced ? 1 : 0);
  const right = useSharedValue(reduced ? 1 : 0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    stem.value = withDelay(250, withTiming(1, { duration: 1500, easing: Easing.bezier(0.45, 0, 0.2, 1) }));
    left.value = withDelay(900, withSpring(1, { damping: 12, stiffness: 120 }));
    right.value = withDelay(1250, withSpring(1, { damping: 12, stiffness: 120 }));
    breathe.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [reduced, stem, left, right, breathe]);

  const stemProps = useAnimatedProps(() => ({ strokeDashoffset: MARK.stemLength * (1 - stem.value) }));
  const leftStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, left.value * 2), transform: [{ scale: left.value }] }));
  const rightStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, right.value * 2), transform: [{ scale: right.value }] }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.75 + breathe.value * 0.25,
    transform: [{ scale: 0.94 + breathe.value * 0.1 }],
  }));

  const { colors } = MARK;
  const glowSize = size * 1.5;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Animated.View pointerEvents="none" style={[{ position: "absolute", width: glowSize, height: glowSize }, glowStyle]}>
        <Svg width={glowSize} height={glowSize}>
          <Defs>
            <RadialGradient id={`glow${id}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={t.accent} stopOpacity={t.mode === "dark" ? 0.26 : 0.22} />
              <Stop offset="0.6" stopColor={t.accent} stopOpacity={t.mode === "dark" ? 0.06 : 0.05} />
              <Stop offset="1" stopColor={t.accent} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={glowSize / 2} cy={glowSize / 2} r={glowSize / 2} fill={`url(#glow${id})`} />
        </Svg>
      </Animated.View>

      {!reduced && SPORES.map((spore, i) => <Spore key={i} {...spore} box={size} color={t.ring[0]} />)}

      <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: origin(MARK.leftBase.x, MARK.leftBase.y) }, leftStyle]}>
        <Svg width={size} height={size} viewBox={VIEW}>
          <Defs>
            <LinearGradient id={`left${id}`} x1="1" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={colors.leftLeaf[0]} />
              <Stop offset="1" stopColor={colors.leftLeaf[1]} />
            </LinearGradient>
          </Defs>
          <Path d={MARK.leftLeaf} fill={`url(#left${id})`} />
          <Path d={MARK.leftVein} stroke={colors.vein} strokeOpacity={0.22} strokeWidth={1.4} strokeLinecap="round" fill="none" />
        </Svg>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: origin(MARK.rightBase.x, MARK.rightBase.y) }, rightStyle]}>
        <Svg width={size} height={size} viewBox={VIEW}>
          <Defs>
            <LinearGradient id={`right${id}`} x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0" stopColor={colors.rightLeaf[0]} />
              <Stop offset="1" stopColor={colors.rightLeaf[1]} />
            </LinearGradient>
          </Defs>
          <Path d={MARK.rightLeaf} fill={`url(#right${id})`} />
          <Path d={MARK.rightVein} stroke={colors.vein} strokeOpacity={0.2} strokeWidth={1.4} strokeLinecap="round" fill="none" />
        </Svg>
      </Animated.View>

      <Svg width={size} height={size} viewBox={VIEW} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={`stem${id}`} x1="0" y1="1" x2="0.25" y2="0">
            <Stop offset="0" stopColor={colors.stem[0]} />
            <Stop offset="0.5" stopColor={colors.stem[1]} />
            <Stop offset="1" stopColor={colors.stem[2]} />
          </LinearGradient>
        </Defs>
        <AnimatedPath
          d={MARK.stem}
          stroke={`url(#stem${id})`}
          strokeWidth={6.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={`${MARK.stemLength} ${MARK.stemLength}`}
          animatedProps={stemProps}
        />
      </Svg>
    </View>
  );
}

function Spore({
  x,
  size,
  delay,
  duration,
  box,
  color,
}: {
  x: number;
  size: number;
  delay: number;
  duration: number;
  box: number;
  color: string;
}) {
  const rise: SharedValue<number> = useSharedValue(0);
  useEffect(() => {
    rise.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration, easing: Easing.linear })), -1),
    );
  }, [delay, duration, rise]);
  const style = useAnimatedStyle(() => ({
    opacity: rise.value < 0.15 ? rise.value / 0.15 : 1 - rise.value,
    transform: [{ translateY: -rise.value * box * 0.55 }, { translateX: Math.sin(rise.value * Math.PI * 2) * 8 }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: x * box,
          bottom: box * 0.12,
          width: size,
          height: size,
          borderRadius: size,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

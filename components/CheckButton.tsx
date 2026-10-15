import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Circle, G, Path } from "react-native-svg";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/hooks/useTheme";
import { mix, withAlpha } from "@/lib/color";
import { EASE, POP, SNAP } from "@/lib/motion";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const CHECK_PATH = "M7 12.6l3.4 3.4L17.2 9";
const CHECK_LENGTH = 15;
/** The leaves that burst out when a habit is completed. */
const LEAVES = Array.from({ length: 9 }, (_, i) => ({
  angle: (i / 9) * Math.PI * 2 + 0.35,
  distance: 30 + (i % 3) * 5,
  size: 5 + (i % 2) * 2,
}));

/**
 * The check-off circle. A tap fills it with the habit's color, draws the
 * check, sends out a ring and a burst of tiny leaves (the row plays the
 * haptic). Count habits (goal > 1) fill their arc one step per tap.
 */
export function CheckButton({
  color,
  count,
  goal,
  size = 48,
  label,
  onPress,
  onLongPress,
}: {
  color: string;
  count: number;
  goal: number;
  size?: number;
  label: string;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const done = count >= goal;
  const progress = Math.min(1, count / Math.max(1, goal));

  const fill = useSharedValue(done ? 1 : 0);
  const check = useSharedValue(done ? 1 : 0);
  const arc = useSharedValue(progress);
  const burst = useSharedValue(0);
  const press = useSharedValue(1);
  const bump = useSharedValue(1);
  const wasDone = useRef(done);

  useEffect(() => {
    arc.value = withTiming(progress, { duration: 420, easing: EASE });
    if (done && !wasDone.current) {
      fill.value = reduced ? withTiming(1, { duration: 160 }) : withSpring(1, POP);
      check.value = withDelay(reduced ? 0 : 110, withTiming(1, { duration: 300, easing: EASE }));
      if (!reduced) {
        bump.value = withSequence(withTiming(1.14, { duration: 130, easing: EASE }), withSpring(1, POP));
        burst.value = withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration: 760, easing: Easing.out(Easing.quad) }));
      }
    } else if (!done && wasDone.current) {
      check.value = withTiming(0, { duration: 140 });
      fill.value = withTiming(0, { duration: 220, easing: EASE });
    } else if (!done && count > 0 && !reduced) {
      // One more step on a count habit: a small nudge.
      bump.value = withSequence(withTiming(1.07, { duration: 90 }), withSpring(1, SNAP));
    }
    wasDone.current = done;
  }, [done, progress, count, reduced, arc, fill, check, burst, bump]);

  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const center = size / 2;

  const arcProps = useAnimatedProps(() => ({ strokeDashoffset: circumference * (1 - arc.value) }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: CHECK_LENGTH * (1 - check.value) }));
  const body = useAnimatedStyle(() => ({ transform: [{ scale: press.value * bump.value }] }));
  const fillStyle = useAnimatedStyle(() => ({
    opacity: fill.value > 0.01 ? 1 : 0,
    transform: [{ scale: 0.35 + 0.65 * fill.value }],
  }));
  const ripple = useAnimatedStyle(() => ({
    opacity: burst.value > 0 && burst.value < 1 ? 0.55 * (1 - burst.value) : 0,
    transform: [{ scale: 1 + 0.75 * burst.value }],
  }));
  const plusStyle = useAnimatedStyle(() => ({ opacity: 1 - fill.value }));

  const light = mix(color, "#FFFFFF", 0.5);
  const ring = goal > 1 ? withAlpha(color, t.mode === "dark" ? 0.2 : 0.28) : withAlpha(color, t.mode === "dark" ? 0.55 : 0.7);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: done }}
      hitSlop={10}
      onPressIn={() => {
        if (!reduced) press.value = withSpring(0.86, SNAP);
      }}
      onPressOut={() => {
        press.value = withSpring(1, SNAP);
      }}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
    >
      <Animated.View style={[{ width: size, height: size }, body]}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { borderRadius: size / 2, borderWidth: 2, borderColor: color }, ripple]}
        />
        {LEAVES.map((leaf, i) => (
          <Leaf key={i} burst={burst} center={center} color={i % 2 ? light : color} {...leaf} />
        ))}
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Circle cx={center} cy={center} r={r} stroke={ring} strokeWidth={stroke} fill="none" />
          {goal > 1 && (
            <G transform={`rotate(-90 ${center} ${center})`}>
              <AnimatedCircle
                cx={center}
                cy={center}
                r={r}
                stroke={color}
                strokeWidth={stroke}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                animatedProps={arcProps}
              />
            </G>
          )}
        </Svg>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { borderRadius: size / 2, backgroundColor: color }, fillStyle]}
        />
        {goal > 1 && (
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center, plusStyle]}>
            <Icon name="plus" size={size * 0.4} color={color} strokeWidth={2.4} />
          </Animated.View>
        )}
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
          <Svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">
            <AnimatedPath
              d={CHECK_PATH}
              stroke={t.onColor}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray={`${CHECK_LENGTH} ${CHECK_LENGTH}`}
              animatedProps={checkProps}
            />
          </Svg>
        </View>
      </Animated.View>
    </Pressable>
  );
}

function Leaf({
  burst,
  angle,
  distance,
  size,
  center,
  color,
}: {
  burst: SharedValue<number>;
  angle: number;
  distance: number;
  size: number;
  center: number;
  color: string;
}) {
  const style = useAnimatedStyle(() => {
    const travel = interpolate(burst.value, [0, 1], [center * 0.55, distance]);
    const visible = burst.value > 0 && burst.value < 1;
    return {
      opacity: visible ? interpolate(burst.value, [0, 0.12, 0.6, 1], [0, 1, 0.9, 0]) : 0,
      transform: [
        { translateX: Math.cos(angle) * travel },
        { translateY: Math.sin(angle) * travel },
        { rotate: `${angle + Math.PI / 2 + burst.value * 1.2}rad` },
        { scale: interpolate(burst.value, [0, 0.3, 1], [0.4, 1, 0.5]) },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: center - size / 2,
          top: center - size,
          width: size,
          height: size * 2,
          borderTopLeftRadius: size,
          borderBottomRightRadius: size,
          borderTopRightRadius: size * 0.2,
          borderBottomLeftRadius: size * 0.2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});

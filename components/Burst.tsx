import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

const PIECES = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2 + (i % 2 ? 0.12 : -0.08);
  return { angle, distance: 78 + ((i * 37) % 5) * 12, size: 6 + (i % 3) * 2, spin: (i % 2 ? 1 : -1) * (1.5 + (i % 4) * 0.4) };
});

/**
 * A celebratory burst of leaves from the center of its parent. Change `play`
 * (e.g. a counter) to fire it again. Nothing renders with reduced motion.
 */
export function Burst({ play, colors }: { play: number; colors: string[] }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    if (play === 0 || reduced) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1300, easing: Easing.out(Easing.cubic) });
  }, [play, reduced, progress]);
  if (reduced) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
      {PIECES.map((piece, i) => (
        <Piece key={i} progress={progress} color={colors[i % colors.length]} {...piece} />
      ))}
    </View>
  );
}

function Piece({
  progress,
  angle,
  distance,
  size,
  spin,
  color,
}: {
  progress: SharedValue<number>;
  angle: number;
  distance: number;
  size: number;
  spin: number;
  color: string;
}) {
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const travel = interpolate(p, [0, 1], [20, distance]);
    // A little gravity: pieces drift down as they slow.
    const fall = interpolate(p, [0, 1], [0, 26]);
    return {
      opacity: p > 0 && p < 1 ? interpolate(p, [0, 0.08, 0.7, 1], [0, 1, 0.9, 0]) : 0,
      transform: [
        { translateX: Math.cos(angle) * travel },
        { translateY: Math.sin(angle) * travel + fall },
        { rotate: `${angle + p * spin * Math.PI}rad` },
        { scale: interpolate(p, [0, 0.25, 1], [0.3, 1, 0.6]) },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size * 1.9,
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

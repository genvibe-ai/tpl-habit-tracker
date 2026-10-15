import { useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { POP } from "@/lib/motion";
import { Icon } from "./ui/Icon";
import { Text } from "./ui/Text";

/** The flame and day count; it gives a little hop when the streak grows. */
export function Streak({ days, size = "sm" }: { days: number; size?: "sm" | "lg" }) {
  const t = useTheme();
  const hop = useSharedValue(1);
  const previous = useRef(days);
  useEffect(() => {
    if (days > previous.current) hop.value = withSequence(withTiming(1.35, { duration: 140 }), withSpring(1, POP));
    previous.current = days;
  }, [days, hop]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: hop.value }] }));
  const lg = size === "lg";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: lg ? 4 : 3 }}>
      <Animated.View style={style}>
        <Icon name="flame" size={lg ? 18 : 14} color={t.flame} strokeWidth={2.4} />
      </Animated.View>
      <Text variant={lg ? "label" : "small"} color={t.flame} style={{ fontVariant: ["tabular-nums"] }}>
        {days}
      </Text>
    </View>
  );
}

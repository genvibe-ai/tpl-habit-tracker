import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { haptics } from "@/lib/haptics";
import { SNAP } from "@/lib/motion";

/** An on/off switch that looks the same on every platform. */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (next: boolean) => void; label: string }) {
  const t = useTheme();
  const on = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    on.value = withSpring(value ? 1 : 0, SNAP);
  }, [value, on]);
  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(on.value, [0, 1], [t.raised, t.accent]),
  }));
  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: on.value * 20 }],
  }));
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      hitSlop={8}
      onPress={() => {
        haptics.select();
        onChange(!value);
      }}
    >
      <Animated.View style={[{ width: 50, height: 30, borderRadius: 15, padding: 3 }, track]}>
        <Animated.View
          style={[
            {
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: value ? t.onAccent : t.mode === "dark" ? "#8A9A8F" : "#FFFFFF",
              boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
            },
            knob,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

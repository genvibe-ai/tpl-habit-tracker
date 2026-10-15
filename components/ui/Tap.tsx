import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, type Insets, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from "react-native-reanimated";
import { haptics } from "@/lib/haptics";
import { SNAP } from "@/lib/motion";

/**
 * Every pressable surface: a soft spring on press and a light tap of haptics.
 * `scaleTo` sets how far it sinks; `haptic="none"` when the caller plays its own.
 */
export function Tap({
  children,
  onPress,
  onLongPress,
  label,
  hint,
  style,
  disabled = false,
  selected,
  scaleTo = 0.97,
  haptic = "select",
  hitSlop = 6,
  role = "button",
  testID,
}: PropsWithChildren<{
  onPress?: () => void;
  onLongPress?: () => void;
  label: string;
  hint?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  selected?: boolean;
  scaleTo?: number;
  haptic?: "select" | "light" | "none";
  hitSlop?: number | Insets;
  role?: "button" | "tab" | "checkbox" | "radio" | "switch" | "link";
  testID?: string;
}>) {
  const scale = useSharedValue(1);
  const reduced = useReducedMotion();
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const flat = StyleSheet.flatten(style) ?? {};
  // Layout props that must sit on the outer Pressable so flex rows still work.
  const outer: ViewStyle = { flex: flat.flex, flexGrow: flat.flexGrow, flexShrink: flat.flexShrink, alignSelf: flat.alignSelf };
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      hitSlop={hitSlop}
      testID={testID}
      style={outer}
      onPressIn={() => {
        if (!reduced) scale.value = withSpring(scaleTo, SNAP);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SNAP);
      }}
      onPress={() => {
        if (haptic === "select") haptics.select();
        if (haptic === "light") haptics.light();
        onPress?.();
      }}
      onLongPress={onLongPress}
    >
      <Animated.View style={[style, animated, disabled && { opacity: 0.45 }]}>{children}</Animated.View>
    </Pressable>
  );
}

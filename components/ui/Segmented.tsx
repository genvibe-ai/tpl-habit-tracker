import { useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { radius } from "@/constants/theme";
import { makeStyles } from "@/hooks/useTheme";
import { GLIDE } from "@/lib/motion";
import { Tap } from "./Tap";
import { Text } from "./Text";

/** A pill of choices with a thumb that glides to the selected one. */
export function Segmented<K extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
  label: string;
}) {
  const s = useStyles();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.key === value));
  const segment = width > 0 ? (width - 8) / options.length : 0;
  const thumb = useAnimatedStyle(() => ({
    width: segment,
    transform: [{ translateX: withSpring(index * segment, GLIDE) }],
  }));
  return (
    <View
      style={s.track}
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 && <Animated.View style={[s.thumb, thumb]} />}
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Tap
            key={String(option.key)}
            label={option.label}
            role="radio"
            selected={active}
            onPress={() => onChange(option.key)}
            style={s.option}
            scaleTo={0.95}
          >
            <Text variant="label" tone={active ? "text" : "muted"} numberOfLines={1}>
              {option.label}
            </Text>
          </Tap>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  track: {
    flexDirection: "row",
    backgroundColor: t.raised,
    borderRadius: radius.pill,
    padding: 4,
  },
  thumb: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: radius.pill,
    backgroundColor: t.mode === "dark" ? "#2A352D" : t.surface,
    borderWidth: 1,
    borderColor: t.line,
  },
  option: {
    flex: 1,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
}));

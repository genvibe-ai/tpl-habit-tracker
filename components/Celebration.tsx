import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { FadeOut, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { Burst } from "./Burst";
import { Icon } from "./ui/Icon";
import { Text } from "./ui/Text";

/** A pill that pops up above the tab bar with a burst of leaves, then fades away. Mount it to play it. */
export function Celebration({ text }: { text: string }) {
  const s = useStyles();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(timer);
  }, []);
  if (!visible) return null;
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      entering={ZoomIn.springify().damping(13).stiffness(220)}
      exiting={FadeOut.duration(260)}
      style={[s.wrap, { bottom: Math.max(insets.bottom - 6, 14) + 78 }]}
    >
      <View style={s.pill}>
        <Burst play={1} colors={[...t.ring, t.flame]} />
        <Icon name="sparkles" size={18} color={t.onAccent} strokeWidth={2.4} />
        <Text variant="label" tone="onAccent">
          {text}
        </Text>
      </View>
    </Animated.View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: t.accent,
    boxShadow: "0 12px 30px -10px rgba(0, 0, 0, 0.5)",
  },
}));

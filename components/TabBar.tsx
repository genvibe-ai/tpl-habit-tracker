import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { useState } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { copy } from "@/constants/content";
import type { IconName } from "@/constants/icons";
import { fonts, radius } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { withAlpha } from "@/lib/color";
import { haptics } from "@/lib/haptics";
import { GLIDE } from "@/lib/motion";
import { BarSurface } from "./ui/BarSurface";
import { Icon } from "./ui/Icon";
import { Tap } from "./ui/Tap";
import { Text } from "./ui/Text";

/** Tab icons by route name (app/(tabs)/*.tsx). */
const TAB_ICONS: Record<string, IconName> = {
  index: "calendar-check",
  stats: "chart-column",
  settings: "settings-2",
};

const PADDING = 6;

/** The floating tab bar: three tabs on a glass pill, and a round "new habit" button. */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const s = useStyles();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const item = width > 0 ? (width - PADDING * 2) / state.routes.length : 0;
  const indicator = useAnimatedStyle(() => ({
    width: item,
    transform: [{ translateX: withSpring(state.index * item, GLIDE) }],
  }));

  return (
    <View pointerEvents="box-none" style={[s.wrap, { paddingBottom: Math.max(insets.bottom - 6, 14) }]}>
      <LinearGradient
        pointerEvents="none"
        colors={[withAlpha(t.background, 0), withAlpha(t.background, 0.92)]}
        locations={[0, 0.7]}
        style={s.fade}
      />
      <View style={s.row} pointerEvents="box-none">
        <BarSurface style={s.bar} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {item > 0 && <Animated.View style={[s.indicator, indicator]} />}
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const title = descriptors[route.key]?.options.title ?? route.name;
            return (
              <Tap
                key={route.key}
                role="tab"
                selected={focused}
                label={title}
                haptic="none"
                scaleTo={0.92}
                style={s.item}
                onPress={() => {
                  const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                  if (!focused && !event.defaultPrevented) {
                    haptics.select();
                    navigation.navigate(route.name, route.params);
                  }
                }}
              >
                <Icon
                  name={TAB_ICONS[route.name] ?? "sparkles"}
                  size={21}
                  color={focused ? t.accentText : t.muted}
                  strokeWidth={focused ? 2.3 : 2}
                />
                <Text variant="small" color={focused ? t.text : t.muted} style={s.label} numberOfLines={1}>
                  {title}
                </Text>
              </Tap>
            );
          })}
        </BarSurface>
        <Tap label={copy.tabs.add} onPress={() => router.push("/habit/edit")} style={s.add} scaleTo={0.88} haptic="light">
          <Icon name="plus" size={26} color={t.onAccent} strokeWidth={2.6} />
        </Tap>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center" },
  fade: { position: "absolute", left: 0, right: 0, bottom: 0, top: -28 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, width: "100%", maxWidth: 480 },
  bar: {
    flex: 1,
    height: 64,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    padding: PADDING,
  },
  indicator: {
    position: "absolute",
    left: PADDING,
    top: PADDING,
    bottom: PADDING,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(t.accent, t.mode === "dark" ? 0.13 : 0.16),
  },
  item: { flex: 1, height: "100%", alignItems: "center", justifyContent: "center", gap: 2 },
  label: { fontSize: 11.5, lineHeight: 14, fontFamily: fonts.bodySemibold },
  add: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: t.accent,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 8px 24px -6px ${withAlpha(t.accent, t.mode === "dark" ? 0.45 : 0.6)}`,
  },
}));

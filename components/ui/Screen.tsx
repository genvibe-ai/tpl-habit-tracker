import { LinearGradient } from "expo-linear-gradient";
import type { PropsWithChildren, Ref } from "react";
import { ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { gutter } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { withAlpha } from "@/lib/color";

/** Room left under scrolling content for the floating tab bar. */
export const TAB_BAR_SPACE = 112;

/**
 * A scrolling screen: safe-area padding at the top, room for the tab bar (or
 * the home indicator) at the bottom, and a centered column on wide screens.
 */
export function Screen({
  children,
  withTabBar = true,
  topInset = true,
  contentStyle,
  scrollRef,
}: PropsWithChildren<{
  withTabBar?: boolean;
  topInset?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  scrollRef?: Ref<ScrollView>;
}>) {
  const s = useStyles();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={s.screen}>
    <ScrollView
      ref={scrollRef}
      style={s.screen}
      contentContainerStyle={{
        paddingTop: topInset ? insets.top + 14 : 8,
        paddingBottom: (withTabBar ? TAB_BAR_SPACE : 32) + insets.bottom,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <View style={[s.column, contentStyle]}>{children}</View>
    </ScrollView>
      {/* Content fades out under the status bar instead of running into it. */}
      <LinearGradient
        pointerEvents="none"
        colors={[t.background, withAlpha(t.background, 0)]}
        style={[s.topFade, { height: insets.top + 12 }]}
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, backgroundColor: t.background },
  topFade: { position: "absolute", top: 0, left: 0, right: 0 },
  column: { width: "100%", maxWidth: 560, alignSelf: "center", paddingHorizontal: gutter },
}));

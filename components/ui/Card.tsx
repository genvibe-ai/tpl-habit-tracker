import { LinearGradient } from "expo-linear-gradient";
import type { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { radius } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";

/** The rounded surface everything sits on, with a faint light catching its top edge. */
export function Card({ children, style, padded = true }: PropsWithChildren<{ style?: StyleProp<ViewStyle>; padded?: boolean }>) {
  const s = useStyles();
  const t = useTheme();
  return (
    <View style={[s.card, padded && s.padded, style]}>
      <LinearGradient
        pointerEvents="none"
        colors={t.mode === "dark" ? ["#FFFFFF0B", "#FFFFFF00"] : ["#FFFFFF00", "#FFFFFF00"]}
        style={[StyleSheet.absoluteFill, s.sheen]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />
      {children}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    backgroundColor: t.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: t.line,
    borderCurve: "continuous",
    ...(t.mode === "light"
      ? { boxShadow: "0 1px 2px rgba(14, 26, 18, 0.05), 0 8px 24px -12px rgba(14, 26, 18, 0.12)" }
      : null),
  },
  padded: { padding: 18 },
  sheen: { borderRadius: radius.lg },
}));

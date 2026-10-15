import type { ReactNode } from "react";
import { View } from "react-native";
import { makeStyles } from "@/hooks/useTheme";
import { Text } from "./Text";

/** Small capitals above a group, with an optional note or control on the right. */
export function SectionHeader({ title, right }: { title: string; right?: ReactNode }) {
  const s = useStyles();
  return (
    <View style={s.row} accessibilityRole="header">
      <Text variant="caps" tone="muted">
        {title}
      </Text>
      {typeof right === "string" ? (
        <Text variant="small" tone="faint">
          {right}
        </Text>
      ) : (
        right
      )}
    </View>
  );
}

const useStyles = makeStyles(() => ({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10, marginTop: 4 },
}));

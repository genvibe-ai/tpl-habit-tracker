import { router } from "expo-router";
import { View } from "react-native";
import { copy } from "@/constants/content";
import { makeStyles } from "@/hooks/useTheme";
import { Logo } from "./brand/Logo";
import { Button } from "./ui/Button";
import { Text } from "./ui/Text";

/** The sprout, a line of copy and a "New habit" button, for screens with nothing to show yet. */
export function EmptyState({ title, body }: { title: string; body: string }) {
  const s = useStyles();
  return (
    <View style={s.wrap}>
      <View style={s.badge}>
        <Logo size={64} />
      </View>
      <Text variant="heading" style={s.center}>
        {title}
      </Text>
      <Text tone="muted" style={[s.center, s.body]}>
        {body}
      </Text>
      <Button title={copy.today.emptyCta} icon="plus" onPress={() => router.push("/habit/edit")} />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 24, gap: 10 },
  badge: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: t.raised,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  center: { textAlign: "center" },
  body: { maxWidth: 300, marginBottom: 12 },
}));

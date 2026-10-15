import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { copy } from "@/constants/content";
import { radius } from "@/constants/theme";
import { makeStyles } from "@/hooks/useTheme";
import { Button } from "./Button";
import { Text } from "./Text";

/**
 * A small confirm dialog. Alert.alert does nothing on the web, so destructive
 * actions use this everywhere.
 */
export function Dialog({
  visible,
  title,
  body,
  confirm,
  tone = "danger",
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  body: string;
  confirm: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const s = useStyles();
  // Keep the content while the fade-out plays.
  const [shown, setShown] = useState({ title, body, confirm });
  useEffect(() => {
    if (visible) setShown({ title, body, confirm });
  }, [visible, title, body, confirm]);
  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onCancel}>
      {visible && (
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={s.scrim}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel={copy.common.cancel} />
          <Animated.View entering={ZoomIn.springify().damping(18).stiffness(260)} style={s.card} accessibilityViewIsModal>
            <Text variant="heading" style={s.title}>
              {shown.title}
            </Text>
            <Text tone="muted" style={s.body}>
              {shown.body}
            </Text>
            <View style={s.actions}>
              <Button title={copy.common.cancel} variant="secondary" onPress={onCancel} style={s.action} />
              <Button title={shown.confirm} variant={tone} onPress={onConfirm} style={s.action} />
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </Modal>
  );
}

const useStyles = makeStyles((t) => ({
  scrim: {
    flex: 1,
    backgroundColor: t.mode === "dark" ? "#000000B8" : "#0E1A1266",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: t.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: t.line,
    padding: 22,
    gap: 8,
  },
  title: { textAlign: "left" },
  body: { marginBottom: 14 },
  actions: { flexDirection: "row", gap: 10 },
  action: { flex: 1 },
}));

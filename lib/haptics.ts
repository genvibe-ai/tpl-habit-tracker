/** Haptics that never throw. Skipped on the web and when turned off in Settings. */
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useGarden } from "./store";

const run = (feedback: () => Promise<void>) => {
  if (Platform.OS === "web" || !useGarden.getState().prefs.haptics) return;
  feedback().catch(() => {});
};

export const haptics = {
  select: () => run(() => Haptics.selectionAsync()),
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};

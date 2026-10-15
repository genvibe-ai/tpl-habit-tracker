import { Tabs } from "expo-router/js-tabs";
import { TabBar } from "@/components/TabBar";
import { copy } from "@/constants/content";
import { useTheme } from "@/hooks/useTheme";

/** Today, Stats and Settings, under the floating tab bar (components/TabBar.tsx). */
export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "fade",
        // Tabs in the background wait to re-render until they are opened again.
        freezeOnBlur: true,
        sceneStyle: { backgroundColor: t.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: copy.tabs.today }} />
      <Tabs.Screen name="stats" options={{ title: copy.tabs.stats }} />
      <Tabs.Screen name="settings" options={{ title: copy.tabs.settings }} />
    </Tabs>
  );
}

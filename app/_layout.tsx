import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useMemo } from "react";
import { Platform, View, useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { fontFiles } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useGarden } from "@/lib/store";

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ fade: true, duration: 250 });

/**
 * Root: fonts, theme and navigation. People see the welcome until they finish
 * onboarding (prefs.onboarded); after that the tabs and habit screens open.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontFiles);
  const t = useTheme();
  const onboarded = useGarden((s) => s.prefs.onboarded);
  const { width } = useWindowDimensions();
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(t.background).catch(() => {});
  }, [t.background]);

  const navTheme = useMemo(() => {
    const base = t.mode === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: { ...base.colors, primary: t.accent, background: t.background, card: t.surface, text: t.text, border: t.line },
    };
  }, [t]);

  if (!ready) return null;

  // On a wide browser window the app sits in a phone-width column.
  const framed = Platform.OS === "web" && width > 620;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: framed ? t.surface : t.background }}>
      <ThemeProvider value={navTheme}>
        <StatusBar style={t.mode === "dark" ? "light" : "dark"} />
        <View
          style={[
            { flex: 1, width: "100%", alignSelf: "center", backgroundColor: t.background },
            framed && { maxWidth: 520, borderLeftWidth: 1, borderRightWidth: 1, borderColor: t.line },
          ]}
        >
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.background } }}>
            <Stack.Protected guard={!onboarded}>
              <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
            </Stack.Protected>
            <Stack.Protected guard={onboarded}>
              <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
              <Stack.Screen name="habit/[id]" />
              <Stack.Screen
                name="habit/edit"
                options={{ presentation: "modal", animation: Platform.OS === "android" ? "slide_from_bottom" : "default" }}
              />
            </Stack.Protected>
          </Stack>
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

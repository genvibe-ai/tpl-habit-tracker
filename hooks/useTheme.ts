import { StyleSheet, useColorScheme } from "react-native";
import { themes, type Theme } from "@/constants/theme";
import { useGarden } from "@/lib/store";

/** The active palette: the Settings choice, or the phone's when set to "System". */
export function useTheme(): Theme {
  const pref = useGarden((s) => s.prefs.theme);
  const system = useColorScheme();
  const mode = pref === "system" ? (system === "light" ? "light" : "dark") : pref;
  return themes[mode];
}

/**
 * Themed StyleSheets, built once per theme:
 *   const useStyles = makeStyles((t) => ({ card: { backgroundColor: t.surface } }));
 *   const s = useStyles();
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(build: (theme: Theme) => T) {
  const cache = new Map<Theme, T>();
  return function useStyles(): T {
    const theme = useTheme();
    let styles = cache.get(theme);
    if (!styles) {
      styles = StyleSheet.create(build(theme));
      cache.set(theme, styles);
    }
    return styles;
  };
}

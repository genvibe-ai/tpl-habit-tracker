/**
 * Design tokens. Colors come from content.ts → palettes (edit them there);
 * this file adds the fonts, corner radii and type scale.
 *
 * Fonts: Bricolage Grotesque for headings and numbers, Figtree for text
 * (both SIL Open Font License, loaded in app/_layout.tsx).
 */
import { BricolageGrotesque_600SemiBold } from "@expo-google-fonts/bricolage-grotesque/600SemiBold";
import { BricolageGrotesque_700Bold } from "@expo-google-fonts/bricolage-grotesque/700Bold";
import { BricolageGrotesque_800ExtraBold } from "@expo-google-fonts/bricolage-grotesque/800ExtraBold";
import { Figtree_400Regular } from "@expo-google-fonts/figtree/400Regular";
import { Figtree_500Medium } from "@expo-google-fonts/figtree/500Medium";
import { Figtree_600SemiBold } from "@expo-google-fonts/figtree/600SemiBold";
import { Figtree_700Bold } from "@expo-google-fonts/figtree/700Bold";
import { palettes, type Palette } from "./content";

/** Passed to useFonts() at startup. */
export const fontFiles = {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
};

export const fonts = {
  displayMedium: "BricolageGrotesque_600SemiBold",
  display: "BricolageGrotesque_700Bold",
  displayHeavy: "BricolageGrotesque_800ExtraBold",
  body: "Figtree_400Regular",
  bodyMedium: "Figtree_500Medium",
  bodySemibold: "Figtree_600SemiBold",
  bodyBold: "Figtree_700Bold",
};

/** The type scale behind components/ui/Text.tsx (`<Text variant="title">`). */
export const type = {
  hero: { fontFamily: fonts.displayHeavy, fontSize: 34, lineHeight: 38, letterSpacing: -0.8 },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 31, letterSpacing: -0.5 },
  heading: { fontFamily: fonts.display, fontSize: 19, lineHeight: 24, letterSpacing: -0.2 },
  number: { fontFamily: fonts.displayHeavy, fontSize: 28, lineHeight: 32, letterSpacing: -0.6 },
  body: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
  label: { fontFamily: fonts.bodySemibold, fontSize: 15, lineHeight: 20, letterSpacing: 0 },
  small: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18, letterSpacing: 0.05 },
  caps: { fontFamily: fonts.bodyBold, fontSize: 11.5, lineHeight: 14, letterSpacing: 1.1, textTransform: "uppercase" },
} as const;

export type TypeVariant = keyof typeof type;

export const radius = { xs: 8, sm: 12, md: 16, lg: 22, xl: 28, pill: 999 };

/** Side padding of every screen. */
export const gutter = 20;

export type Theme = Palette & { mode: "dark" | "light" };

export const themes: Record<"dark" | "light", Theme> = {
  dark: { ...palettes.dark, mode: "dark" },
  light: { ...palettes.light, mode: "light" },
};

import { useState } from "react";
import { Platform, TextInput, type TextInputProps, type TextStyle } from "react-native";
import { radius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

/** The browser draws its own focus ring around inputs; the boxed field shows focus itself. */
const webReset = (Platform.OS === "web" ? { outlineStyle: "none" } : {}) as TextStyle;

/**
 * A text field with the app's caret and selection color. `boxed` gives it a
 * surface and a border that turns leaf green while typing; bare fields sit
 * inside cards that already frame them.
 */
export function Input({ boxed = true, style, onFocus, onBlur, ...props }: TextInputProps & { boxed?: boolean }) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholderTextColor={t.faint}
      selectionColor={t.accent}
      cursorColor={t.accent}
      {...props}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[
        { color: t.text },
        boxed && {
          backgroundColor: t.surface,
          borderWidth: 1.5,
          borderColor: focused ? t.accent : t.line,
          borderRadius: radius.md,
          paddingHorizontal: 16,
        },
        webReset,
        style,
      ]}
    />
  );
}

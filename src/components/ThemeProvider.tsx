"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { themeFromSourceColor, argbFromHex } from "@material/material-color-utilities";

const ThemeContext = createContext<{
  sourceColor: string;
  setSourceColor: (color: string) => void;
}>({
  sourceColor: "#6750A4",
  setSourceColor: () => {},
});

export const useMaterialTheme = () => useContext(ThemeContext);

export function MaterialThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, systemTheme } = useTheme();
  const { sourceColor } = useMaterialTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = currentTheme === "dark";

    // Generate Material 3 theme from the source color
    const materialTheme = themeFromSourceColor(argbFromHex(sourceColor));
    const scheme = isDark ? materialTheme.schemes.dark : materialTheme.schemes.light;

    // Apply colors to root
    const root = document.documentElement;
    
    // Helper to convert ARGB to hex
    const hexColor = (argb: number) => {
      const r = (argb >> 16) & 255;
      const g = (argb >> 8) & 255;
      const b = argb & 255;
      return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
    };

    // Set the generated CSS custom properties required by @material/web
    const colors = scheme.toJSON() as Record<string, number>;
    for (const [key, value] of Object.entries(colors)) {
      // Map 'primary' to '--md-sys-color-primary', etc.
      const cssKey = `--md-sys-color-${key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
      root.style.setProperty(cssKey, hexColor(value));
    }

    root.style.setProperty("background-color", hexColor(scheme.background));
    root.style.setProperty("color", hexColor(scheme.onBackground));

  }, [sourceColor, theme, systemTheme, mounted]);

  // To prevent hydration mismatch, only render children once mounted if theme dependent,
  // but for global theme it's fine. We return children right away.
  return <>{children}</>;
}

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  const [sourceColor, setSourceColor] = useState("#6750A4");

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeContext.Provider value={{ sourceColor, setSourceColor }}>
        <MaterialThemeProvider>
          {children}
        </MaterialThemeProvider>
      </ThemeContext.Provider>
    </NextThemesProvider>
  );
}

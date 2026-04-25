"use client";

import { useEffect, useState } from "react";
import { themeFromSourceColor, argbFromHex } from "@material/material-color-utilities";
import { useTheme } from "next-themes";

export default function UserThemeContainer({
  children,
  sourceColor,
}: {
  children: React.ReactNode;
  sourceColor: string;
}) {
  const { theme, systemTheme } = useTheme();
  const [styles, setStyles] = useState<React.CSSProperties>({});

  useEffect(() => {
    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = currentTheme === "dark";

    const materialTheme = themeFromSourceColor(argbFromHex(sourceColor));
    const scheme = isDark ? materialTheme.schemes.dark : materialTheme.schemes.light;

    const hexColor = (argb: number) => {
      const r = (argb >> 16) & 255;
      const g = (argb >> 8) & 255;
      const b = argb & 255;
      return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
    };

    const colors = scheme.toJSON() as Record<string, number>;
    const newStyles: any = {};
    for (const [key, value] of Object.entries(colors)) {
      const cssKey = `--md-sys-color-${key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
      newStyles[cssKey] = hexColor(value);
    }
    
    // Override the root background with the themed background
    newStyles["backgroundColor"] = newStyles["--md-sys-color-background"];
    newStyles["color"] = newStyles["--md-sys-color-on-background"];
    newStyles["minHeight"] = "calc(100vh - 70px)";
    newStyles["transition"] = "background-color 0.3s ease, color 0.3s ease";

    setStyles(newStyles);
  }, [sourceColor, theme, systemTheme]);

  return <div style={styles}>{children}</div>;
}

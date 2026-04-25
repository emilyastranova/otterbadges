"use client";

import { useEffect } from "react";
import { useMaterialTheme } from "@/components/ThemeProvider";

export default function UserThemeContainer({
  children,
  sourceColor,
}: {
  children: React.ReactNode;
  sourceColor: string;
}) {
  const { setSourceColor } = useMaterialTheme();

  useEffect(() => {
    setSourceColor(sourceColor);
    
    return () => {
      // Revert to default purple when leaving the profile
      setSourceColor("#6750A4");
    };
  }, [sourceColor, setSourceColor]);

  return <>{children}</>;
}

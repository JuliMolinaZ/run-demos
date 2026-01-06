"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SessionProvider
          refetchInterval={5 * 60}
          refetchOnWindowFocus={true}
        >
          {children}
        </SessionProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}


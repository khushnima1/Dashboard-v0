import React from 'react';
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {children}
    </ThemeProvider>
  );
} 
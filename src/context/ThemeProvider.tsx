/**
 * @file Contains ChadCN theme provider context.
 */
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

/**
 * ChadCN theme provider context.
 * @param props - The component properties.
 * @returns The ChadCN theme provider context.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

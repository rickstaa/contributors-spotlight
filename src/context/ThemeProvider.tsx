/**
 * @file Contains ChadCN theme provider context.
 */
"use client";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * ChadCN theme provider context.
 * @param param0
 * @returns
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

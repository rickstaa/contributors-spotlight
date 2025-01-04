/**
 * @file Contains the root layout component for the application.
 */
import { ThemeProvider } from "@/context/ThemeProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ORG_NAME } from "./config";

/**
 * Geist Sans font.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Geist Mono font.
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadata for the application.
 */
export const metadata: Metadata = {
  title: `${ORG_NAME} Contributors Spotlight`,
  description: `Web app showcasing the open-source contributors behind ${ORG_NAME} software`,
};

/**
 * Root layout component for the application.
 * @param param0 - The component properties.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  // The site's sole UI font (--font-sans and --font-mono both compose this in
  // globals.css) — named --font-space-grotesk, not --font-sans, so
  // globals.css can compose it with an explicit sans-serif fallback chain;
  // var() cannot reference the same custom property it defines.
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Profilecraft — GitHub profile widget studio",
    template: "%s · Profilecraft",
  },
  description:
    "Craft your GitHub profile README: 22 customizable widgets, 77 themes, badges, tech icons, and a full README composer — all from one dashboard.",
  applicationName: "Profilecraft",
  keywords: [
    "github profile readme",
    "github stats card",
    "contribution streak",
    "readme generator",
    "profile widgets",
  ],
  openGraph: {
    title: "Profilecraft",
    description: "Craft your GitHub profile README from one dashboard.",
    type: "website",
  },
};

export const viewport: Viewport = {
  // Next injects width=device-width, initial-scale=1 by default; what it does
  // not set is the mobile browser chrome colour (docs/TODOS.md 12.39).
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

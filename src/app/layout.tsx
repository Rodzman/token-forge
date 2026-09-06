import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Token Forge",
  description:
    "Design-tokens studio with a built-in WCAG contrast audit. Edit colours, spacing and type scale, see every foreground/background pair graded, and export to CSS, Tailwind, SCSS or DTCG.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

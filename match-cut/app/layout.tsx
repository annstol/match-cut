import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Match Cut",
  description: "Rate films, find your taste twins, and discover your next watch.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

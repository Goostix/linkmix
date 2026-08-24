import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Linkmix | Editor Link-in-Bio",
  description: "Editor link-in-bio untuk mengelola tautan, profil sosial, dan konten personal tanpa coding.",
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
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}

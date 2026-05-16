// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Sredit.ST",
  description: "Sustav za praćenje komunalnih problema i organizaciju građanskih akcija u Splitu"
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="hr" className="bg-emerald-50">
      <body className={`${inter.className} min-h-screen antialiased text-emerald-950`}>
        <AppShell user={user}>{children}</AppShell>
      </body>
    </html>
  );
}
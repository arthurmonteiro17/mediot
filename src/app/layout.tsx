import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Outfit } from "next/font/google";
import { Providers } from "@/components/providers";
import { getBootstrapData } from "@/lib/inventory";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "MedIoT — Sistema de estoque hospitalar",
  description:
    "MedIoT: dashboard, controle de estoque e movimentações com rastreio RFID.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  let initialData = null;
  try {
    initialData = await getBootstrapData();
  } catch {
    initialData = null;
  }

  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${outfit.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers initialData={initialData}>{children}</Providers>
      </body>
    </html>
  );
}

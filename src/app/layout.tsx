import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CursorTrail from "../app/_components/cursortrail";
import { JetBrains_Mono } from "next/font/google";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400","600","700"],          // opcional
  variable: "--font-jetbrains-mono",    // vira uma CSS var
  display: "swap",
});

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Landing Page",
  description: "Portfólio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
      <body className={`${geistSans.variable} ${geistMono.variable} ${jetbrains.variable} antialiased`}>
        <CursorTrail/>
        {children}
      </body>
    </html>
  );
}



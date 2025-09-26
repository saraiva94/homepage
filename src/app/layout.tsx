// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import 'aos/dist/aos.css';
import Image from "next/image";
import bgMonterey from "../../assets/macos-monterey.jpg";

export const metadata: Metadata = {
  title: "Landing Page",
  description: "Portfólio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="relative text-white">
        {/* Fundo global fixo */}
        <div aria-hidden className="fixed inset-0 -z-10">
          <Image
            src={bgMonterey}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        {children}
      </body>
    </html>
  );
}
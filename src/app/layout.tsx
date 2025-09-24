// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Image from "next/image";
import bgMonterey from "../../assets/macos-monterey.jpg"; // ajuste o caminho se sua pasta for diferente

export const metadata: Metadata = {
  title: "Landing Page",
  description: "Portfólio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="relative min-h-screen text-white">
        {/* Fundo global fixo atrás de TUDO */}
        <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
          <Image
            src={bgMonterey}
            alt=""
            fill
            priority={false}
            className="object-cover"
          />
          {/* escurece o wallpaper para dar contraste ao conteúdo */}
          <div className="absolute inset-0 bg-black/45" />
        </div>

        {children}
      </body>
    </html>
  );
}

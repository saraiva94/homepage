// src/app/page.tsx
"use client";

import { Hero } from "./_components/hero";
import { About } from "./_components/about";

export default function Home() {
  return (
    // ocupa a viewport e fica acima do fundo global do layout
    <main className="relative isolate min-h-[100svh] flex flex-col">
      <Hero />
      <About />
      {/* ...outras seções aqui se quiser */}
    </main>
  );
}

import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import CursorTrail from "@/components/CursorTrail";
import { MatrixRain } from "@/components/MatrixRain";

export default function Index() {
  return (
    <div className="min-h-screen bg-black relative">
      <div className="fixed inset-0 z-0">
        <MatrixRain />
      </div>
      <div className="relative z-10">
        <CursorTrail />
        <Hero />
        <About />
      </div>
    </div>
  );
}
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import CursorTrail from "@/components/CursorTrail";

export default function Index() {
  return (
    <div className="min-h-screen bg-[#6f00ff]">
      <CursorTrail />
      <Hero />
      <About />
    </div>
  );
}
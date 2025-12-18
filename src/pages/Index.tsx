import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import CursorTrail from "@/components/CursorTrail";

export default function Index() {
  return (
    <div className="min-h-screen bg-background relative">
      <CursorTrail />
      <Hero />
      <About />
    </div>
  );
}
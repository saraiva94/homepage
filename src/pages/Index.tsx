import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import CursorTrail from "@/components/CursorTrail";
import homepageBg from "@/assets/homepage-bg.png";

export default function Index() {
  return (
    <div 
      className="min-h-screen relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${homepageBg})` }}
    >
      <CursorTrail />
      <Hero />
      <About />
    </div>
  );
}
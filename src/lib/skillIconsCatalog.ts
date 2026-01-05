import {
  SiAdobeaftereffects,
  SiAdobepremierepro,
  SiAdobecreativecloud,
  SiHtml5,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiMysql,
  SiSqlite,
  SiPython,
  SiGit,
  SiGithub,
  SiSupabase,
  SiBun,
  SiDocker,
  SiTailwindcss,
  SiMongodb,
  SiPostgresql,
  SiRedis,
  SiFirebase,
  SiVercel,
  SiNetlify,
  SiGraphql,
  SiVuedotjs,
  SiAngular,
  SiSvelte,
  SiRust,
  SiGo,
  SiKotlin,
  SiSwift,
  SiFlutter,
  SiDart,
  SiCplusplus,
  SiC,
  SiPhp,
  SiLaravel,
  SiDjango,
  SiExpress,
  SiFigma,
  SiAdobephotoshop,
  SiAdobeillustrator,
  SiAdobexd,
  SiSketch,
  SiBlender,
  SiUnity,
  SiUnrealengine,
  SiThreedotjs,
  SiWebgl,
  SiLinux,
  SiUbuntu,
  SiAmazon,
  SiGooglecloud,
  SiKubernetes,
  SiTerraform,
  SiJenkins,
  SiElasticsearch,
  SiRabbitmq,
  SiNginx,
  SiApache,
  SiJira,
  SiConfluence,
  SiNotion,
  SiSlack,
  SiDiscord,
} from "react-icons/si";
import { VscAzure } from "react-icons/vsc";
import {
  FileSpreadsheet,
  MessagesSquare,
  ListChecks,
  Users,
  Zap,
  Lightbulb,
  Brain,
  Heart,
  Clock,
  Target,
  Puzzle,
  Shield,
  BookOpen,
  Handshake,
  Eye,
  Sparkles,
  Smile,
  ThumbsUp,
  Award,
  Compass,
  Flame,
  HeartHandshake,
  TreePine,
  Glasses,
  Scale,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import type { IconType } from "react-icons";

export interface IconCatalogItem {
  key: string;
  name: string;
  icon: IconType | LucideIcon;
  color: string;
  category: "hard" | "soft";
}

// Catálogo completo de Hard Skills
export const hardSkillsCatalog: IconCatalogItem[] = [
  // Design & Video
  { key: "adobe-cc", name: "Creative Cloud", icon: SiAdobecreativecloud, color: "#DA1F26", category: "hard" },
  { key: "after-effects", name: "After Effects", icon: SiAdobeaftereffects, color: "#9999FF", category: "hard" },
  { key: "premiere-pro", name: "Premiere Pro", icon: SiAdobepremierepro, color: "#9999FF", category: "hard" },
  { key: "photoshop", name: "Photoshop", icon: SiAdobephotoshop, color: "#31A8FF", category: "hard" },
  { key: "illustrator", name: "Illustrator", icon: SiAdobeillustrator, color: "#FF9A00", category: "hard" },
  { key: "adobe-xd", name: "Adobe XD", icon: SiAdobexd, color: "#FF61F6", category: "hard" },
  { key: "figma", name: "Figma", icon: SiFigma, color: "#F24E1E", category: "hard" },
  { key: "sketch", name: "Sketch", icon: SiSketch, color: "#F7B500", category: "hard" },
  { key: "blender", name: "Blender", icon: SiBlender, color: "#F5792A", category: "hard" },
  
  // Frontend
  { key: "html5", name: "HTML5 & CSS3", icon: SiHtml5, color: "#E34F26", category: "hard" },
  { key: "javascript", name: "JavaScript", icon: SiJavascript, color: "#F7DF1E", category: "hard" },
  { key: "typescript", name: "TypeScript", icon: SiTypescript, color: "#3178C6", category: "hard" },
  { key: "react", name: "React", icon: SiReact, color: "#61DAFB", category: "hard" },
  { key: "react-native", name: "React Native", icon: SiReact, color: "#61DAFB", category: "hard" },
  { key: "nextjs", name: "Next.js", icon: SiNextdotjs, color: "#FFFFFF", category: "hard" },
  { key: "vuejs", name: "Vue.js", icon: SiVuedotjs, color: "#4FC08D", category: "hard" },
  { key: "angular", name: "Angular", icon: SiAngular, color: "#DD0031", category: "hard" },
  { key: "svelte", name: "Svelte", icon: SiSvelte, color: "#FF3E00", category: "hard" },
  { key: "tailwindcss", name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4", category: "hard" },
  { key: "threejs", name: "Three.js", icon: SiThreedotjs, color: "#FFFFFF", category: "hard" },
  { key: "webgl", name: "WebGL", icon: SiWebgl, color: "#990000", category: "hard" },
  
  // Backend
  { key: "nodejs", name: "Node.js", icon: SiNodedotjs, color: "#339933", category: "hard" },
  { key: "bunjs", name: "Bun.js", icon: SiBun, color: "#FBF0DF", category: "hard" },
  { key: "python", name: "Python", icon: SiPython, color: "#3776AB", category: "hard" },
  { key: "php", name: "PHP", icon: SiPhp, color: "#777BB4", category: "hard" },
  { key: "rust", name: "Rust", icon: SiRust, color: "#FFFFFF", category: "hard" },
  { key: "go", name: "Go", icon: SiGo, color: "#00ADD8", category: "hard" },
  { key: "kotlin", name: "Kotlin", icon: SiKotlin, color: "#7F52FF", category: "hard" },
  { key: "swift", name: "Swift", icon: SiSwift, color: "#FA7343", category: "hard" },
  { key: "cpp", name: "C++", icon: SiCplusplus, color: "#00599C", category: "hard" },
  { key: "c", name: "C", icon: SiC, color: "#A8B9CC", category: "hard" },
  { key: "dart", name: "Dart", icon: SiDart, color: "#0175C2", category: "hard" },
  
  // Frameworks
  { key: "express", name: "Express", icon: SiExpress, color: "#FFFFFF", category: "hard" },
  { key: "django", name: "Django", icon: SiDjango, color: "#092E20", category: "hard" },
  { key: "laravel", name: "Laravel", icon: SiLaravel, color: "#FF2D20", category: "hard" },
  { key: "flutter", name: "Flutter", icon: SiFlutter, color: "#02569B", category: "hard" },
  { key: "graphql", name: "GraphQL", icon: SiGraphql, color: "#E10098", category: "hard" },
  
  // Databases
  { key: "mysql", name: "MySQL", icon: SiMysql, color: "#4479A1", category: "hard" },
  { key: "sqlite", name: "SQLite", icon: SiSqlite, color: "#003B57", category: "hard" },
  { key: "postgresql", name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1", category: "hard" },
  { key: "mongodb", name: "MongoDB", icon: SiMongodb, color: "#47A248", category: "hard" },
  { key: "redis", name: "Redis", icon: SiRedis, color: "#DC382D", category: "hard" },
  { key: "supabase", name: "Supabase", icon: SiSupabase, color: "#3ECF8E", category: "hard" },
  { key: "firebase", name: "Firebase", icon: SiFirebase, color: "#FFCA28", category: "hard" },
  { key: "elasticsearch", name: "Elasticsearch", icon: SiElasticsearch, color: "#005571", category: "hard" },
  
  // Cloud & DevOps
  { key: "azure", name: "Azure", icon: VscAzure, color: "#0078D4", category: "hard" },
  { key: "aws", name: "AWS", icon: SiAmazon, color: "#FF9900", category: "hard" },
  { key: "gcp", name: "Google Cloud", icon: SiGooglecloud, color: "#4285F4", category: "hard" },
  { key: "docker", name: "Docker", icon: SiDocker, color: "#2496ED", category: "hard" },
  { key: "kubernetes", name: "Kubernetes", icon: SiKubernetes, color: "#326CE5", category: "hard" },
  { key: "terraform", name: "Terraform", icon: SiTerraform, color: "#7B42BC", category: "hard" },
  { key: "jenkins", name: "Jenkins", icon: SiJenkins, color: "#D24939", category: "hard" },
  { key: "vercel", name: "Vercel", icon: SiVercel, color: "#FFFFFF", category: "hard" },
  { key: "netlify", name: "Netlify", icon: SiNetlify, color: "#00C7B7", category: "hard" },
  { key: "nginx", name: "Nginx", icon: SiNginx, color: "#009639", category: "hard" },
  { key: "apache", name: "Apache", icon: SiApache, color: "#D22128", category: "hard" },
  { key: "rabbitmq", name: "RabbitMQ", icon: SiRabbitmq, color: "#FF6600", category: "hard" },
  { key: "linux", name: "Linux", icon: SiLinux, color: "#FCC624", category: "hard" },
  { key: "ubuntu", name: "Ubuntu", icon: SiUbuntu, color: "#E95420", category: "hard" },
  
  // Tools
  { key: "git", name: "Git", icon: SiGit, color: "#F05032", category: "hard" },
  { key: "github", name: "GitHub", icon: SiGithub, color: "#FFFFFF", category: "hard" },
  { key: "excel", name: "Excel", icon: FileSpreadsheet, color: "#217346", category: "hard" },
  { key: "jira", name: "Jira", icon: SiJira, color: "#0052CC", category: "hard" },
  { key: "confluence", name: "Confluence", icon: SiConfluence, color: "#172B4D", category: "hard" },
  { key: "notion", name: "Notion", icon: SiNotion, color: "#FFFFFF", category: "hard" },
  { key: "slack", name: "Slack", icon: SiSlack, color: "#4A154B", category: "hard" },
  { key: "discord", name: "Discord", icon: SiDiscord, color: "#5865F2", category: "hard" },
  
  // Game Dev
  { key: "unity", name: "Unity", icon: SiUnity, color: "#FFFFFF", category: "hard" },
  { key: "unreal", name: "Unreal Engine", icon: SiUnrealengine, color: "#0E1128", category: "hard" },
];

// Catálogo completo de Soft Skills
export const softSkillsCatalog: IconCatalogItem[] = [
  { key: "communication", name: "Comunicação", icon: MessagesSquare, color: "#60A5FA", category: "soft" },
  { key: "organization", name: "Organização", icon: ListChecks, color: "#4ADE80", category: "soft" },
  { key: "teamwork", name: "Trabalho em equipe", icon: Users, color: "#C084FC", category: "soft" },
  { key: "proactivity", name: "Proatividade", icon: Zap, color: "#FACC15", category: "soft" },
  { key: "creativity", name: "Criatividade", icon: Lightbulb, color: "#FB923C", category: "soft" },
  { key: "problem-solving", name: "Resolução de problemas", icon: Puzzle, color: "#F472B6", category: "soft" },
  { key: "leadership", name: "Liderança", icon: Target, color: "#EF4444", category: "soft" },
  { key: "adaptability", name: "Adaptabilidade", icon: Compass, color: "#14B8A6", category: "soft" },
  { key: "critical-thinking", name: "Pensamento crítico", icon: Brain, color: "#A78BFA", category: "soft" },
  { key: "empathy", name: "Empatia", icon: Heart, color: "#F87171", category: "soft" },
  { key: "time-management", name: "Gestão de tempo", icon: Clock, color: "#38BDF8", category: "soft" },
  { key: "resilience", name: "Resiliência", icon: Shield, color: "#6366F1", category: "soft" },
  { key: "learning", name: "Aprendizado contínuo", icon: BookOpen, color: "#22D3EE", category: "soft" },
  { key: "negotiation", name: "Negociação", icon: Handshake, color: "#84CC16", category: "soft" },
  { key: "attention-detail", name: "Atenção aos detalhes", icon: Eye, color: "#F59E0B", category: "soft" },
  { key: "innovation", name: "Inovação", icon: Sparkles, color: "#EC4899", category: "soft" },
  { key: "positivity", name: "Positividade", icon: Smile, color: "#FDE047", category: "soft" },
  { key: "feedback", name: "Dar/Receber Feedback", icon: ThumbsUp, color: "#34D399", category: "soft" },
  { key: "commitment", name: "Comprometimento", icon: Award, color: "#F97316", category: "soft" },
  { key: "passion", name: "Paixão", icon: Flame, color: "#EF4444", category: "soft" },
  { key: "collaboration", name: "Colaboração", icon: HeartHandshake, color: "#8B5CF6", category: "soft" },
  { key: "patience", name: "Paciência", icon: TreePine, color: "#10B981", category: "soft" },
  { key: "analytical", name: "Pensamento analítico", icon: Glasses, color: "#6B7280", category: "soft" },
  { key: "ethics", name: "Ética profissional", icon: Scale, color: "#0EA5E9", category: "soft" },
  { key: "growth-mindset", name: "Mentalidade de crescimento", icon: Leaf, color: "#22C55E", category: "soft" },
];

// Helper para buscar ícone por key
export function getIconByKey(key: string, category: "hard" | "soft"): IconCatalogItem | undefined {
  const catalog = category === "hard" ? hardSkillsCatalog : softSkillsCatalog;
  return catalog.find((item) => item.key === key);
}

// Helper para buscar por nome (autocomplete)
export function searchSkillsByName(query: string, category: "hard" | "soft"): IconCatalogItem[] {
  const catalog = category === "hard" ? hardSkillsCatalog : softSkillsCatalog;
  const lowerQuery = query.toLowerCase();
  return catalog.filter((item) => 
    item.name.toLowerCase().includes(lowerQuery) || 
    item.key.toLowerCase().includes(lowerQuery)
  );
}

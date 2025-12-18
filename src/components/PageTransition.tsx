import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

// Variantes de animação otimizadas para performance
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const, // easeOutQuad
    },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: [0.55, 0.06, 0.68, 0.19] as const, // easeInQuad
    },
  },
};

// Transição mais sutil para páginas pesadas (portfolio)
const subtleVariants: Variants = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as const, // easeOut
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1] as const, // easeIn
    },
  },
};

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      className={className}
      // Otimização: usar GPU para animações
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

export function SubtlePageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={subtleVariants}
      className={className}
      style={{ willChange: "opacity" }}
    >
      {children}
    </motion.div>
  );
}

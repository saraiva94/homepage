// types/aos.d.ts
declare module "aos" {
  export type AosOptions = {
    offset?: number;
    delay?: number;
    duration?: number;
    easing?: string;
    once?: boolean;
    mirror?: boolean;
    anchorPlacement?: string;
  };

  const AOS: {
    init(options?: Partial<AosOptions>): void;
    refresh(): void;
    refreshHard(): void;
  };
  export default AOS;
}
declare module '*.css';
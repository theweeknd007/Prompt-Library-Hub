import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BrandMarkProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function BrandMark({ size = "md", className, ...props }: BrandMarkProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  return (
    <div className={cn("relative shrink-0", sizes[size], className)} aria-hidden="true" {...props}>
      <svg viewBox="0 0 64 64" className="h-full w-full overflow-visible" fill="none">
        <defs>
          <linearGradient id="aura-mark-gradient" x1="8" y1="8" x2="58" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A855F7" />
            <stop offset="0.48" stopColor="#6D5CFF" />
            <stop offset="1" stopColor="#00D9FF" />
          </linearGradient>
          <filter id="aura-mark-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="32" cy="32" r="25" stroke="url(#aura-mark-gradient)" strokeWidth="1.2" opacity="0.7" />
        <circle cx="32" cy="32" r="28" stroke="url(#aura-mark-gradient)" strokeWidth="0.8" strokeDasharray="12 10" opacity="0.55" />
        <path d="M14 49 28.8 15.5c1.2-2.8 5.2-2.8 6.4 0L50 49h-8.2l-3.3-8.1H25.5L22.2 49H14Z" fill="url(#aura-mark-gradient)" filter="url(#aura-mark-glow)" />
        <path d="m27.8 34.8 4.2-10.4 4.2 10.4h-8.4Z" fill="#070711" />
        <path d="M23.5 43.3c5.7-3.2 11.3-3.2 17 0" stroke="#05050B" strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
      </svg>
    </div>
  );
}

interface BrandProps {
  compact?: boolean;
  className?: string;
}

export function Brand({ compact = false, className }: BrandProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandMark size={compact ? "sm" : "md"} />
      {!compact && (
        <div className="flex items-baseline gap-1.5 leading-none tracking-[0.18em]">
          <span className="text-[17px] font-semibold text-foreground">AURA</span>
          <span className="text-[11px] font-semibold tracking-[0.12em] text-cyan-300">IA</span>
        </div>
      )}
    </div>
  );
}
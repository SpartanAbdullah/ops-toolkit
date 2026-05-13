import { cn } from "@/lib/utils";

type BrandMarkProps = {
  size?: number;
  className?: string;
};

export function BrandMark({ size = 40, className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bm-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1F3568" />
          <stop offset="100%" stopColor="#08122A" />
        </linearGradient>
        <linearGradient id="bm-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="55%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <radialGradient id="bm-glow" cx="80%" cy="18%" r="55%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#bm-bg)" />
      <rect width="512" height="512" rx="112" fill="url(#bm-glow)" />
      <circle cx="256" cy="256" r="156" stroke="white" strokeWidth="2" fill="none" opacity="0.10" />
      <path
        d="M 256 100 A 156 156 0 1 1 100 256"
        fill="none"
        stroke="url(#bm-gold)"
        strokeWidth="48"
        strokeLinecap="round"
      />
      <circle cx="256" cy="100" r="22" fill="white" />
      <circle cx="256" cy="256" r="42" fill="url(#bm-gold)" />
      <circle cx="256" cy="256" r="14" fill="#08122A" />
    </svg>
  );
}

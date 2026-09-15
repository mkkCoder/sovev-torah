import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 22, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#A67C2D" strokeWidth="2.2" />
      <circle
        cx="32"
        cy="32"
        r="16"
        fill="none"
        stroke="#8B3A32"
        strokeWidth="1.3"
        strokeDasharray="3 3"
      />
      <rect x="24" y="20" width="16" height="24" rx="2" fill="#FFFCF6" stroke="#2A2418" strokeWidth="1.6" />
      <path
        d="M24 22h-3a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h3M40 22h3a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-3"
        fill="none"
        stroke="#2A2418"
        strokeWidth="1.6"
      />
      <path d="M28 26h8M28 32h8M28 38h5" stroke="#A67C2D" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export const CalendarIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);
export const RepeatIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M17 1v4h4M7 23v-4H3" />
    <path d="M20 5A9 9 0 0 0 6.3 7.7L3 11M4 19a9 9 0 0 0 13.7-2.7L21 13" />
  </svg>
);
export const SparkIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
  </svg>
);
export const QuizIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 9a3 3 0 1 1 5.2 2.1C13.4 12 12 13 12 15" />
    <path d="M12 19h.01" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);
export const MidrashIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 19V7l8-4 8 4v12" />
    <path d="M12 22V8" />
    <path d="M8 12h.01M16 12h.01M8 16h.01M16 16h.01" />
  </svg>
);
export const ChartIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 19h16" />
    <path d="M7 16V9M12 16V5M17 16v-6" />
  </svg>
);
export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);
export const LockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
export const UnlockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 7.5-2" />
  </svg>
);
export const UserIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5 19c1.5-3.2 3.8-5 7-5s5.5 1.8 7 5" />
  </svg>
);

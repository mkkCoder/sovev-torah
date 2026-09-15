import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { ChevronIcon } from "./Icons";

export function DashboardCard({
  to,
  title,
  subtitle,
  icon,
  tone,
  accent,
}: {
  to: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  tone: string;
  accent?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`lift paper relative flex min-h-[148px] flex-col justify-between overflow-hidden rounded-[1.45rem] p-4 sm:min-h-[168px] sm:p-5 ${
        accent ? "ring-1 ring-olive/25" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>{icon}</div>
        <ChevronIcon className="mt-1 text-ink-soft/45" size={18} />
      </div>
      <div>
        <h2 className="font-display text-[1.45rem] leading-tight text-ink sm:text-[1.65rem]">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{subtitle}</p>
      </div>
    </Link>
  );
}

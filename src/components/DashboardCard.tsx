import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export function DashboardCard({
  to,
  title,
  subtitle,
  icon,
  tone,
}: {
  to: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <Link
      to={to}
      className="lift paper flex min-h-[168px] flex-col justify-between rounded-3xl p-5"
    >
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
        {icon}
      </div>
      <div>
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{subtitle}</p>
      </div>
    </Link>
  );
}

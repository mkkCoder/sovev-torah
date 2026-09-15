import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export function PageShell({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <Link to="/" className="text-sm text-ink-soft hover:text-burgundy">
        לדף הבית →
      </Link>
      {kicker ? <p className="mt-3 text-sm text-gold">{kicker}</p> : null}
      <h1 className="font-display mt-1 text-3xl sm:text-4xl">{title}</h1>
      <div className="mt-6">{children}</div>
    </div>
  );
}

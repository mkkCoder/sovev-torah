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
    <div className="mx-auto max-w-6xl px-3 py-5 pb-16 sm:px-4 sm:py-9">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-ink-soft transition hover:text-burgundy"
      >
        <span aria-hidden>→</span>
        לדף הבית
      </Link>
      {kicker ? <p className="mt-4 text-sm font-medium text-gold">{kicker}</p> : null}
      <h1 className="font-display mt-1 text-[1.7rem] leading-tight sm:text-[2.4rem]">{title}</h1>
      <div className="ornament my-4 max-w-48 text-[10px]">✦</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

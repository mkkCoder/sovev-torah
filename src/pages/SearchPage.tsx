import { Link, useSearchParams } from "react-router-dom";
import { searchIndex } from "../lib/search";
import { useAppState } from "../lib/useAppState";
import { PageShell } from "../components/PageShell";
import { ARCHETYPE_LABEL, CATEGORY_LABEL } from "@shared/types";
import { LockIcon } from "../components/Icons";

export function SearchPage() {
  const state = useAppState();
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const { cards, books, chapters } = searchIndex(state, q);

  return (
    <PageShell title="חיפוש" kicker={q ? `תוצאות עבור «${q}»` : "הקלידו מושג, ספר או כרטיסייה"}>
      {!q ? <p className="text-ink-soft">השתמשו בשדה החיפוש שבכותרת.</p> : null}

      {books.length > 0 ? (
        <section className="mb-6">
          <h2 className="font-display text-xl">ספרים</h2>
          <ul className="mt-2 space-y-2">
            {books.map((b) => (
              <li key={b.id} className="paper rounded-2xl px-4 py-3">
                {b.title} · {b.author} · {CATEGORY_LABEL[b.category]}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {chapters.length > 0 ? (
        <section className="mb-6">
          <h2 className="font-display text-xl">פרקים</h2>
          <ul className="mt-2 space-y-2">
            {chapters.slice(0, 12).map((ch) => (
              <li key={ch.id} className="paper rounded-2xl px-4 py-3">
                <Link to="/schedule" className="font-semibold hover:text-burgundy">
                  {ch.title}
                </Link>
                <p className="line-clamp-2 text-sm text-ink-soft">{ch.text}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="font-display text-xl">כרטיסיות ({cards.length})</h2>
        <ul className="mt-2 space-y-2">
          {cards.slice(0, 30).map((c) => (
            <li key={c.id} className="paper rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-gold">
                {c.locked ? <LockIcon size={14} /> : null}
                {ARCHETYPE_LABEL[c.archetype]} · {CATEGORY_LABEL[c.category]} · {c.sefer}
              </div>
              <div className="mt-1">{c.question}</div>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}

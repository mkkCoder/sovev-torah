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
      {!q ? (
        <p className="paper rounded-[1.4rem] px-5 py-8 text-center text-ink-soft">
          השתמשו בשדה החיפוש שבכותרת — כרטיסייה, מושג או ספר.
        </p>
      ) : null}

      {q && books.length === 0 && chapters.length === 0 && cards.length === 0 ? (
        <p className="paper rounded-[1.4rem] px-5 py-8 text-center text-ink-soft">
          לא נמצאו תוצאות. נסו שם ספר, מילה מהסוגיא, או ארכיטיפ.
        </p>
      ) : null}

      {books.length > 0 ? (
        <section className="mb-6">
          <h2 className="font-display text-xl">ספרים</h2>
          <ul className="mt-3 space-y-2">
            {books.map((b) => (
              <li key={b.id} className="paper rounded-2xl px-4 py-3">
                <span className="font-medium">{b.title}</span>
                <span className="text-ink-soft"> · {b.author} · {CATEGORY_LABEL[b.category]}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {chapters.length > 0 ? (
        <section className="mb-6">
          <h2 className="font-display text-xl">פרקים</h2>
          <ul className="mt-3 space-y-2">
            {chapters.slice(0, 12).map((ch) => (
              <li key={ch.id} className="paper rounded-2xl px-4 py-3">
                <Link to="/schedule" className="font-semibold hover:text-burgundy">
                  {ch.title}
                </Link>
                <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{ch.text}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {cards.length > 0 ? (
        <section>
          <h2 className="font-display text-xl">כרטיסיות ({cards.length})</h2>
          <ul className="mt-3 space-y-2">
            {cards.slice(0, 30).map((c) => (
              <li key={c.id} className="paper rounded-2xl px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {c.locked ? <LockIcon size={14} className="text-burgundy" /> : null}
                  <span className="chip bg-gold/12 text-gold">{ARCHETYPE_LABEL[c.archetype]}</span>
                  <span className="text-ink-soft">
                    {CATEGORY_LABEL[c.category]} · {c.sefer}
                  </span>
                </div>
                <div className="mt-2 leading-relaxed">{c.question}</div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageShell>
  );
}

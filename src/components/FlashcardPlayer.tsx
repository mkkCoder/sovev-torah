import { useEffect, useState } from "react";
import type { Flashcard, Rating } from "@shared/types";
import { ARCHETYPE_LABEL, CATEGORY_LABEL } from "@shared/types";
import { firstSchedule, rateCard } from "../lib/store";
import { RatingButtons } from "./ui";
import { Link } from "react-router-dom";

export function FlashcardPlayer({
  cards,
  onEmpty,
  emptyLabel = "אין כרטיסיות בתור כרגע.",
}: {
  cards: Flashcard[];
  onEmpty?: () => void;
  emptyLabel?: string;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[index];
  const total = cards.length;
  const pct = total ? Math.round((Math.min(index, total) / total) * 100) : 0;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
      if (!card || card.status === "new") return;
      const map: Record<string, Rating> = { "1": "excellent", "2": "ok", "3": "hard", "4": "wrong" };
      const rating = map[e.key];
      if (rating && flipped) {
        rateCard(card.id, rating);
        setFlipped(false);
        setIndex((i) => i + 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, flipped]);

  if (!card) {
    return (
      <div className="paper rounded-[1.5rem] px-6 py-12 text-center">
        <p className="font-display text-2xl">הסשן הושלם</p>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">{emptyLabel}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link to="/" className="btn btn-primary">
            לדף הבית
          </Link>
          <Link to="/bonus" className="btn btn-secondary">
            כרטיסי בונוס
          </Link>
          {onEmpty ? (
            <button type="button" className="btn btn-secondary" onClick={onEmpty}>
              חזרה
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  const isFirst = card.status === "new";

  function advance() {
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3 text-sm text-ink-soft">
        <span className="chip bg-card">
          {CATEGORY_LABEL[card.category]} · {card.sefer}
        </span>
        <span dir="ltr" className="tabular-nums">
          {Math.min(index + 1, total)} / {total}
        </span>
      </div>
      <div className="progress mb-4">
        <span style={{ width: `${pct}%` }} />
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="paper w-full min-h-[240px] rounded-[1.5rem] p-6 text-right transition hover:border-gold/40 sm:p-7"
      >
        <div className="chip bg-gold/12 text-gold">{ARCHETYPE_LABEL[card.archetype]}</div>
        <div className="font-display mt-4 text-[1.55rem] leading-snug text-ink sm:text-[1.75rem]">
          {card.question}
        </div>
        {flipped ? (
          <div className="reveal hebrew-body mt-6 border-t border-mist pt-4 text-ink">{card.answer}</div>
        ) : (
          <div className="mt-10 text-sm text-ink-soft">הקישו לחשיפת התשובה · רווח / Enter</div>
        )}
        <div className="mt-5 text-xs text-ink-soft">{card.subTag}</div>
      </button>

      {isFirst ? (
        <div className="mt-4">
          <p className="mb-2 text-sm text-ink-soft">חזרה ראשונה — קבעו מרווח:</p>
          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 3] as const).map((d) => (
              <button key={d} type="button" className="btn btn-secondary py-3" onClick={() => {
                firstSchedule([card.id], d);
                advance();
              }}>
                {d === 1 ? "יום אחד" : `${d} ימים`}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <RatingButtons disabled={!flipped} onRate={(r) => {
            rateCard(card.id, r);
            advance();
          }} />
          {!flipped ? (
            <p className="mt-2 text-center text-xs text-ink-soft">חשפו את התשובה לפני הדירוג · מקשים 1–4 אחרי החשיפה</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

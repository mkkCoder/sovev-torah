import { useState } from "react";
import type { Flashcard, Rating } from "@shared/types";
import { ARCHETYPE_LABEL, CATEGORY_LABEL, RATING_LABEL } from "@shared/types";
import { firstSchedule, rateCard } from "../lib/store";

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

  if (!card) {
    return (
      <div className="paper rounded-3xl p-8 text-center text-ink-soft">
        {emptyLabel}
        {onEmpty ? (
          <div className="mt-4">
            <button type="button" className="text-burgundy underline" onClick={onEmpty}>
              חזרה
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  const isFirst = card.status === "new";

  function advance() {
    setFlipped(false);
    if (index + 1 >= cards.length) {
      setIndex(cards.length);
      return;
    }
    setIndex((i) => i + 1);
  }

  function onRate(rating: Rating) {
    rateCard(card.id, rating);
    advance();
  }

  function onFirst(days: 1 | 2 | 3) {
    firstSchedule([card.id], days);
    advance();
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-ink-soft">
        <span dir="ltr">
          {Math.min(index + 1, cards.length)} / {cards.length}
        </span>
        <span>
          {CATEGORY_LABEL[card.category]} · {card.sefer}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="paper w-full rounded-3xl p-6 text-right min-h-[220px]"
      >
        <div className="text-xs text-gold">{ARCHETYPE_LABEL[card.archetype]}</div>
        <div className="font-display mt-3 text-2xl leading-snug text-ink">{card.question}</div>
        {flipped ? (
          <div className="hebrew-body mt-6 border-t border-mist pt-4 text-ink">{card.answer}</div>
        ) : (
          <div className="mt-8 text-sm text-ink-soft">הקישו לחשיפת התשובה</div>
        )}
        <div className="mt-4 text-xs text-ink-soft">{card.subTag}</div>
      </button>

      {isFirst ? (
        <div className="mt-4">
          <p className="mb-2 text-sm text-ink-soft">חזרה ראשונה — קבעו מרווח:</p>
          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 3] as const).map((d) => (
              <button
                key={d}
                type="button"
                className="rounded-2xl border border-mist bg-card py-3 hover:border-gold"
                onClick={() => onFirst(d)}
              >
                {d === 1 ? "יום אחד" : `${d} ימים`}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["excellent", "ok", "hard", "wrong"] as Rating[]).map((r) => (
            <button
              key={r}
              type="button"
              disabled={!flipped}
              onClick={() => onRate(r)}
              className="rounded-2xl border border-mist bg-card py-3 text-sm disabled:opacity-40 hover:border-gold"
            >
              {RATING_LABEL[r]}
            </button>
          ))}
        </div>
      )}
      {!isFirst && !flipped ? (
        <p className="mt-2 text-center text-xs text-ink-soft">חשפו את התשובה לפני הדירוג</p>
      ) : null}
    </div>
  );
}

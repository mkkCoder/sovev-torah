import { useState } from "react";
import type { Flashcard, Rating } from "@shared/types";
import { ARCHETYPE_LABEL, CATEGORY_LABEL } from "@shared/types";
import { getState, rateCard } from "../lib/store";
import { PageShell } from "../components/PageShell";
import { prioritizeBacklog } from "@shared/srs";
import { RatingButtons } from "../components/ui";

function pickQuiz(cards: Flashcard[], n = 8): Flashcard[] {
  const unlocked = cards.filter((c) => !c.locked && c.status !== "locked" && c.status !== "new");
  const ranked = prioritizeBacklog(unlocked);
  const mix: Flashcard[] = [];
  const used = new Set<string>();
  for (const cat of ["emuna", "halacha", "shas"] as const) {
    const hit = ranked.find((c) => c.category === cat && !used.has(c.id));
    if (hit) {
      mix.push(hit);
      used.add(hit.id);
    }
  }
  for (const c of ranked) {
    if (mix.length >= n) break;
    if (!used.has(c.id)) {
      mix.push(c);
      used.add(c.id);
    }
  }
  return mix;
}

export function QuizPage() {
  const [deck] = useState(() => pickQuiz(getState().cards, 8));
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const [score, setScore] = useState({ good: 0, bad: 0 });
  const [done, setDone] = useState(false);
  const card = deck[i];
  const pct = deck.length ? Math.round((i / deck.length) * 100) : 0;

  function grade(rating: Rating) {
    if (!card) return;
    rateCard(card.id, rating);
    const good = rating === "excellent" || rating === "ok";
    setScore((s) => ({ good: s.good + (good ? 1 : 0), bad: s.bad + (good ? 0 : 1) }));
    setShow(false);
    if (i + 1 >= deck.length) setDone(true);
    else setI((x) => x + 1);
  }

  return (
    <PageShell title="מבחן מותאם" kicker="ערבוב לפי פיגור, קושי וקטגוריה">
      {!card || done ? (
        <div className="paper rounded-[1.5rem] px-6 py-12 text-center">
          <p className="font-display text-3xl">סיום המבחן</p>
          <p className="mt-2 text-ink-soft">
            ידעתי {score.good} · התקשיתי {score.bad} · מתוך {deck.length || 0}
          </p>
          <button
            type="button"
            className="btn btn-primary mt-5"
            onClick={() => {
              setI(0);
              setScore({ good: 0, bad: 0 });
              setDone(false);
              setShow(false);
            }}
          >
            מבחן נוסף
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-2 flex items-center justify-between text-sm text-ink-soft">
            <span>
              {CATEGORY_LABEL[card.category]} · {ARCHETYPE_LABEL[card.archetype]}
            </span>
            <span dir="ltr" className="tabular-nums">
              {i + 1} / {deck.length}
            </span>
          </div>
          <div className="progress mb-4">
            <span style={{ width: `${pct}%` }} />
          </div>
          <button
            type="button"
            onClick={() => setShow(true)}
            className="paper w-full min-h-[min(200px,50dvh)] rounded-[1.5rem] p-4 text-right sm:p-6"
          >
            <div className="font-display text-[1.3rem] leading-snug break-words sm:text-[1.55rem]">{card.question}</div>
            {show ? (
              <div className="reveal hebrew-body mt-4 border-t border-mist pt-3">{card.answer}</div>
            ) : (
              <p className="mt-8 text-sm text-ink-soft">הקישו לתשובה</p>
            )}
          </button>
          <div className="mt-4">
            <RatingButtons disabled={!show} onRate={grade} />
          </div>
        </div>
      )}
    </PageShell>
  );
}

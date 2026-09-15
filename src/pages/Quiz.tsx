import { useState } from "react";
import type { Flashcard, Rating } from "@shared/types";
import { ARCHETYPE_LABEL, CATEGORY_LABEL, RATING_LABEL } from "@shared/types";
import { getState, rateCard } from "../lib/store";
import { PageShell } from "../components/PageShell";
import { prioritizeBacklog } from "@shared/srs";

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
        <div className="paper rounded-3xl p-8 text-center">
          <p className="font-display text-2xl">סיום המבחן</p>
          <p className="mt-2 text-ink-soft">
            ידעתי {score.good} · התקשיתי {score.bad} · מתוך {deck.length}
          </p>
          <button
            type="button"
            className="mt-4 rounded-xl bg-burgundy px-4 py-2 text-parchment"
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
          <div className="mb-3 text-sm text-ink-soft">
            שאלה <span dir="ltr">{i + 1} / {deck.length}</span> · {CATEGORY_LABEL[card.category]} ·{" "}
            {ARCHETYPE_LABEL[card.archetype]}
          </div>
          <button
            type="button"
            onClick={() => setShow(true)}
            className="paper w-full min-h-[180px] rounded-3xl p-6 text-right"
          >
            <div className="font-display text-2xl">{card.question}</div>
            {show ? <div className="hebrew-body mt-4 border-t border-mist pt-3">{card.answer}</div> : (
              <p className="mt-6 text-sm text-ink-soft">הקישו לתשובה</p>
            )}
          </button>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["excellent", "ok", "hard", "wrong"] as Rating[]).map((r) => (
              <button
                key={r}
                type="button"
                disabled={!show}
                onClick={() => grade(r)}
                className="rounded-2xl border border-mist bg-card py-3 text-sm disabled:opacity-40"
              >
                {RATING_LABEL[r]}
              </button>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}

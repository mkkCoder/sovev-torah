import { useMemo, useState } from "react";
import { dailyReviewCap } from "@shared/allocation";
import { buildDailyDeck, isNewUnlocked } from "@shared/srs";
import { deferOverflow } from "../lib/store";
import { useAppState } from "../lib/useAppState";
import { PageShell } from "../components/PageShell";
import { FlashcardPlayer } from "../components/FlashcardPlayer";
import { LockIcon } from "../components/Icons";

export function DailyReviewPage() {
  const state = useAppState();
  const cap = dailyReviewCap(state.settings.reviewMinutes);
  const { session, overflow } = useMemo(
    () => buildDailyDeck(state.cards, cap),
    [state.cards, cap],
  );
  const news = state.cards.filter(isNewUnlocked);
  const [includeOverflow, setIncludeOverflow] = useState(false);
  const [deferredMsg, setDeferredMsg] = useState<string | null>(null);

  const lockedToday = state.cards.filter((c) => c.locked && c.source === "chapter");
  const deck = includeOverflow ? [...session, ...overflow] : session;
  const play = [...deck, ...news.filter((c) => !deck.some((d) => d.id === c.id))];

  return (
    <PageShell title="שינון יומי" kicker="חזרה במרווחים בתוך מכסת הזמן">
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-olive/15 px-3 py-1">
          {session.length + overflow.length} ממתינים לחזרה
        </span>
        <span className="rounded-full bg-gold/15 px-3 py-1">{news.length} כרטיסיות חדשות</span>
        <span className="rounded-full bg-parchment-deep px-3 py-1">
          מכסה ≈ {cap} כרטיסיות ל־{state.settings.reviewMinutes} דק׳
        </span>
      </div>

      {overflow.length > 0 && !includeOverflow ? (
        <div className="mb-4 rounded-2xl border border-burgundy/30 bg-burgundy/8 p-4">
          <p className="font-semibold">
            ישנן חזרות נוספות הממתינות בתור — האם לדחות למחר או להמשיך?
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            הוצגו {session.length} דחופות ביותר (ישנות + קשות). {overflow.length} נוספות מעבר למכסה.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl bg-burgundy px-4 py-2 text-parchment"
              onClick={() => {
                deferOverflow(overflow.map((c) => c.id));
                setDeferredMsg("יתר החזרות נדחו למחר.");
              }}
            >
              לדחות למחר
            </button>
            <button
              type="button"
              className="rounded-xl border border-mist bg-card px-4 py-2"
              onClick={() => setIncludeOverflow(true)}
            >
              להמשיך מעבר למכסה
            </button>
          </div>
          {deferredMsg ? <p className="mt-2 text-sm text-olive">{deferredMsg}</p> : null}
        </div>
      ) : null}

      {lockedToday.length > 0 ? (
        <div className="mb-4 flex items-start gap-2 rounded-2xl bg-parchment-deep/70 p-3 text-sm">
          <LockIcon size={18} className="mt-0.5 shrink-0" />
          <p>
            {lockedToday.length} כרטיסיות פרק נעולות עד שתסמנו «סיימתי את הלימוד היומי» בלו״ז או בדף הבית.
          </p>
        </div>
      ) : null}

      <FlashcardPlayer
        cards={play}
        emptyLabel="אין חזרות למועד היום. אפשר להשלים לימוד כדי לפתוח כרטיסיות חדשות, או לעבור לכרטיסי בונוס."
      />
    </PageShell>
  );
}

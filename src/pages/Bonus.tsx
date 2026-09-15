import { useAppState } from "../lib/useAppState";
import { PageShell } from "../components/PageShell";
import { FlashcardPlayer } from "../components/FlashcardPlayer";
import { isDue } from "@shared/srs";

export function BonusPage() {
  const state = useAppState();
  const bonus = state.cards.filter((c) => c.source === "bonus" && !c.locked);
  const extras = state.cards.filter(
    (c) => c.source === "beit-midrash" && !c.locked && (isDue(c) || c.status === "new"),
  );
  const play = [...bonus, ...extras];

  return (
    <PageShell title="כרטיסי בונוס" kicker="מעבר למכסת השינון היומי">
      <p className="mb-5 max-w-2xl text-ink-soft">
        כרטיסיות אלה אינן נספרות במכסת 20% של היום. השתמשו בהן כשיש חיות, לא כשמעייפים.
      </p>
      <FlashcardPlayer cards={play} emptyLabel="אין כרטיסי בונוס זמינים כרגע. צרו בבית המדרש." />
    </PageShell>
  );
}

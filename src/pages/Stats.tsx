import { CATEGORY_LABEL } from "@shared/types";
import { isDue, isNewUnlocked } from "@shared/srs";
import { useAppState } from "../lib/useAppState";
import { PageShell } from "../components/PageShell";

export function StatsPage() {
  const state = useAppState();
  const unlocked = state.cards.filter((c) => !c.locked);
  const due = state.cards.filter((c) => isDue(c));
  const news = state.cards.filter(isNewUnlocked);
  const locked = state.cards.filter((c) => c.locked);
  const reviews = state.reviewsLog.length;
  const excellent = state.reviewsLog.filter((r) => r.rating === "excellent").length;
  const ok = state.reviewsLog.filter((r) => r.rating === "ok").length;
  const hardish = state.reviewsLog.filter((r) => r.rating === "hard" || r.rating === "wrong").length;
  const chaptersDone = state.chapters.filter((c) => c.studyCompleted).length;

  const byCat = (["emuna", "halacha", "shas"] as const).map((cat) => ({
    cat,
    n: state.cards.filter((c) => c.category === cat).length,
    due: state.cards.filter((c) => c.category === cat && isDue(c)).length,
  }));

  const retention =
    reviews === 0 ? null : Math.round(((excellent + ok) / reviews) * 100);

  return (
    <PageShell title="סטטיסטיקה" kicker="מצב הקניין והחזרה">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="כרטיסיות פתוחות" value={unlocked.length} />
        <Stat label="ממתינות היום" value={due.length} />
        <Stat label="חדשות" value={news.length} />
        <Stat label="נעולות" value={locked.length} />
        <Stat label="פרקים שהושלמו" value={`${chaptersDone}/${state.chapters.length}`} />
        <Stat label="דירוגים שנשמרו" value={reviews} />
        <Stat label="דיוק (מצוין+סביר)" value={retention == null ? "—" : `${retention}%`} />
        <Stat
          label="זמן יומי"
          value={`${state.settings.studyMinutes}/${state.settings.reviewMinutes}`}
        />
      </div>

      <section className="paper mt-6 rounded-3xl p-5">
        <h2 className="font-display text-xl">לפי קטגוריה</h2>
        <div className="mt-3 space-y-3">
          {byCat.map((row) => (
            <div key={row.cat}>
              <div className="flex justify-between text-sm">
                <span>{CATEGORY_LABEL[row.cat]}</span>
                <span>
                  {row.n} כרטיסיות · {row.due} לחזרה
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-mist">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${Math.min(100, row.n * 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="paper mt-4 rounded-3xl p-5 text-sm text-ink-soft">
        <p>
          דירוגי מצוין: {excellent} · סביר: {ok} · קושי/טעות: {hardish}
        </p>
        <p className="mt-2">
          נתונים נשמרים מקומית ב־localStorage במפתח <code>sovev-torah-v2</code> — אין שרת משתמשים.
        </p>
      </section>
    </PageShell>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="paper rounded-3xl p-4">
      <div className="text-sm text-ink-soft">{label}</div>
      <div className="font-display mt-1 text-3xl">{value}</div>
    </div>
  );
}

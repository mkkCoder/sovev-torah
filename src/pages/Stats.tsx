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
  const qualityLog = state.reviewsLog.filter(
    (r) => r.rating === "excellent" || r.rating === "ok" || r.rating === "hard" || r.rating === "wrong",
  );
  const reviews = qualityLog.length;
  const excellent = qualityLog.filter((r) => r.rating === "excellent").length;
  const ok = qualityLog.filter((r) => r.rating === "ok").length;
  const hardish = qualityLog.filter((r) => r.rating === "hard" || r.rating === "wrong").length;
  const chaptersDone = state.chapters.filter((c) => c.studyCompleted).length;

  const byCat = (["emuna", "halacha", "shas"] as const).map((cat) => ({
    cat,
    n: state.cards.filter((c) => c.category === cat).length,
    due: state.cards.filter((c) => c.category === cat && isDue(c)).length,
  }));
  const maxN = Math.max(1, ...byCat.map((r) => r.n));

  const retention =
    reviews === 0 ? null : Math.round(((excellent + ok) / reviews) * 100);

  return (
    <PageShell title="סטטיסטיקה" kicker="מצב הקניין והחזרה">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="כרטיסיות פתוחות" value={unlocked.length} />
        <Stat label="ממתינות היום" value={due.length} accent />
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

      <section className="paper mt-6 rounded-[1.5rem] p-5">
        <h2 className="font-display text-xl">לפי קטגוריה</h2>
        <div className="mt-4 space-y-4">
          {byCat.map((row) => (
            <div key={row.cat}>
              <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm">
                <span>{CATEGORY_LABEL[row.cat]}</span>
                <span className="text-ink-soft">
                  {row.n} כרטיסיות · {row.due} לחזרה
                </span>
              </div>
              <div className="progress mt-1.5">
                <span style={{ width: `${Math.round((row.n / maxN) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-[1.5rem] border border-mist/80 bg-parchment-deep/40 p-5 text-sm text-ink-soft">
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
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className={`paper rounded-[1.35rem] p-4 ${accent ? "ring-1 ring-olive/20" : ""}`}>
      <div className="text-sm text-ink-soft">{label}</div>
      <div className="font-display mt-1 text-3xl tabular-nums">{value}</div>
    </div>
  );
}

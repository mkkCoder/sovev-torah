import { DAY_NAMES, CATEGORY_LABEL, type Category } from "@shared/types";
import { splitDailyTime } from "@shared/allocation";
import { patchSettings, updateWeekly } from "../lib/store";
import { useAppState } from "../lib/useAppState";
import { PageShell } from "../components/PageShell";
import { DailyStudyPanel } from "../components/DailyStudyPanel";

export function SchedulePage() {
  const state = useAppState();
  const total = state.settings.dailyMinutes;
  const studyPct = Math.round((state.settings.studyMinutes / total) * 100);
  const reviewPct = 100 - studyPct;
  const today = new Date().getDay();

  return (
    <PageShell title="לו״ז ותכנון" kicker="שגרת השבוע וחלוקת הזמן">
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <section className="paper rounded-[1.5rem] p-5">
          <h2 className="font-display text-xl">זמן יומי</h2>
          <label className="mt-3 block text-sm text-ink-soft">סה״כ דקות</label>
          <input
            type="number"
            min={20}
            max={240}
            value={total}
            onChange={(e) => patchSettings({ dailyMinutes: Number(e.target.value) || 60 })}
            className="field mt-1 w-28"
          />
          <div className="mt-4 rounded-2xl bg-parchment/80 p-4">
            <div className="mb-2 flex justify-between text-sm">
              <span>לימוד {state.settings.studyMinutes} דק׳ ({studyPct}%)</span>
              <span>חזרה {state.settings.reviewMinutes} דק׳ ({reviewPct}%)</span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-mist">
              <div className="bg-olive" style={{ width: `${studyPct}%` }} />
              <div className="bg-gold" style={{ width: `${reviewPct}%` }} />
            </div>
            <p className="mt-2 text-xs text-ink-soft">פיצול אוטומטי 75–80% / 20–25%. ניתן לכוון ידנית:</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="text-sm">
                לימוד
                <input
                  type="number"
                  className="field ms-2 inline-block w-20 py-1.5"
                  value={state.settings.studyMinutes}
                  onChange={(e) => {
                    const studyMinutes = Number(e.target.value) || 0;
                    patchSettings({
                      studyMinutes,
                      reviewMinutes: Math.max(5, total - studyMinutes),
                    });
                  }}
                />
              </label>
              <button
                type="button"
                className="text-sm font-medium text-burgundy underline-offset-4 hover:underline"
                onClick={() => patchSettings({ dailyMinutes: total, ...splitDailyTime(total) })}
              >
                איפוס לפי 78/22
              </button>
            </div>
          </div>
        </section>

        <section className="paper rounded-[1.5rem] p-5">
          <h2 className="font-display text-xl">שיבוץ שבועי</h2>
          <p className="text-sm text-ink-soft">ניתן לערוך קטגוריה וספר לכל יום.</p>
          <div className="mt-3 space-y-2">
            {state.weekly.map((row) => {
              const isToday = row.day === today;
              return (
                <div
                  key={row.day}
          className={`grid items-center gap-2 rounded-2xl px-3 py-2.5 md:grid-cols-12 ${
                    isToday ? "bg-gold/12 ring-1 ring-gold/30" : "bg-parchment/70"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold md:col-span-2">
                    {DAY_NAMES[row.day]}
                    {isToday ? <span className="chip bg-gold/20 text-[11px]">היום</span> : null}
                  </div>
                  <select
                    className="field min-h-11 py-1.5 text-base md:col-span-3 md:text-sm"
                    value={row.category}
                    onChange={(e) => {
                      const category = e.target.value as Category;
                      updateWeekly(
                        state.weekly.map((w) => (w.day === row.day ? { ...w, category } : w)),
                      );
                    }}
                  >
                    <option value="emuna">{CATEGORY_LABEL.emuna}</option>
                    <option value="shas">{CATEGORY_LABEL.shas}</option>
                    <option value="halacha">{CATEGORY_LABEL.halacha}</option>
                  </select>
                  <select
                    className="field min-h-11 py-1.5 text-base md:col-span-4 md:text-sm"
                    value={row.seferId}
                    onChange={(e) => {
                      const seferId = e.target.value;
                      const book = state.books.find((b) => b.id === seferId);
                      updateWeekly(
                        state.weekly.map((w) =>
                          w.day === row.day
                            ? {
                                ...w,
                                seferId,
                                category: book?.category ?? w.category,
                                note: book ? `${CATEGORY_LABEL[book.category]} — ${book.title}` : w.note,
                              }
                            : w,
                        ),
                      );
                    }}
                  >
                    {state.books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                  <input
                    className="field min-h-11 py-1.5 text-base md:col-span-3 md:text-sm"
                    value={row.note}
                    onChange={(e) =>
                      updateWeekly(
                        state.weekly.map((w) =>
                          w.day === row.day ? { ...w, note: e.target.value } : w,
                        ),
                      )
                    }
                  />
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-8">
        <h2 className="font-display mb-3 text-xl">הפרק של היום</h2>
        <DailyStudyPanel />
      </div>

      <BookProgress />
    </PageShell>
  );
}

function BookProgress() {
  const state = useAppState();
  return (
    <section className="paper mt-6 rounded-[1.5rem] p-5">
      <h2 className="font-display text-xl">התקדמות בספרים</h2>
      <div className="mt-4 space-y-4">
        {state.books.map((book) => {
          const chs = state.chapters.filter((c) => c.bookId === book.id);
          const done = chs.filter((c) => c.studyCompleted).length;
          const pct = Math.round((done / chs.length) * 100);
          return (
            <div key={book.id}>
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="min-w-0">
                  {book.title} · {book.author}
                </span>
                <span className="tabular-nums text-ink-soft">
                  {done}/{chs.length} פרקים
                </span>
              </div>
              <div className="progress mt-1.5">
                <span style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

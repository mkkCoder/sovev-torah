import { completeChapterStudy, firstSchedule, reopenChapterStudy, todaysAssignment } from "../lib/store";
import { useAppState } from "../lib/useAppState";
import { CheckIcon, LockIcon, UnlockIcon } from "./Icons";
import { useState } from "react";

export function DailyStudyPanel() {
  const state = useAppState();
  const { current, book, assignment } = todaysAssignment();
  const [unlockPrompt, setUnlockPrompt] = useState<string[] | null>(null);
  if (!current || !book) return null;

  const lockedCount = state.cards.filter((c) => c.chapterId === current.id && c.locked).length;
  const done = current.studyCompleted;

  return (
    <section className="paper overflow-hidden rounded-[1.6rem] border-s-4 border-gold">
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gold">{assignment.note}</p>
            <h2 className="font-display mt-0.5 text-[1.45rem] leading-tight sm:text-[1.85rem]">
              {book.title} · פרק {current.number}
            </h2>
            <p className="mt-1 text-ink-soft">{current.title}</p>
          </div>
          <div
            className={`chip max-w-full ${
              done ? "bg-olive/12 text-olive" : "bg-burgundy/10 text-burgundy"
            }`}
          >
            {done ? <UnlockIcon size={15} /> : <LockIcon size={15} />}
            {done
              ? "כרטיסיות פתוחות"
              : lockedCount
                ? `${lockedCount} כרטיסיות נעולות`
                : "ממתינים ללימוד"}
          </div>
        </div>

        <article className="hebrew-body mt-5 rounded-2xl border border-mist/70 bg-parchment/70 px-4 py-4 sm:px-5">
          {current.text}
        </article>

        <button
          type="button"
          className={`mt-5 flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-right transition ${
            done
              ? "border-olive/30 bg-olive/10"
              : "border-mist bg-card hover:border-gold/60"
          }`}
          onClick={() => {
            if (!done) {
              const { unlocked } = completeChapterStudy(current.id);
              if (unlocked.length) setUnlockPrompt(unlocked.map((c) => c.id));
            } else if (state.settings.isAdmin) {
              reopenChapterStudy(current.id);
              setUnlockPrompt(null);
            }
          }}
        >
          <span
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${
              done ? "border-olive bg-olive text-parchment" : "border-mist bg-card text-transparent"
            }`}
          >
            <CheckIcon size={16} />
          </span>
          <span>
            <span className="block font-semibold">סיימתי את הלימוד היומי</span>
            <span className="block text-xs text-ink-soft">
              {done ? "הפרק סומן — ניתן לעבור לחזרה" : "כרטיסיות הפרק נפתחות רק אחרי אישור זה"}
            </span>
          </span>
        </button>

        {unlockPrompt ? (
          <div className="reveal mt-4 rounded-2xl border border-gold/40 bg-gold/10 p-4">
            <p className="font-semibold">נפתחו {unlockPrompt.length} כרטיסיות חדשות.</p>
            <p className="mt-1 text-sm text-ink-soft">קבעו את מרווח החזרה הראשונה לכל הסט:</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {([1, 2, 3] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  className="btn btn-secondary py-2.5"
                  onClick={() => {
                    firstSchedule(unlockPrompt, d);
                    setUnlockPrompt(null);
                  }}
                >
                  {d === 1 ? "מחר" : `בעוד ${d} ימים`}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

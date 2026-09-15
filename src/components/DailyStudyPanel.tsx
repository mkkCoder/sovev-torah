import { completeChapterStudy, firstSchedule, reopenChapterStudy, todaysAssignment } from "../lib/store";
import { useAppState } from "../lib/useAppState";
import { LockIcon, UnlockIcon } from "./Icons";
import { useState } from "react";

export function DailyStudyPanel() {
  const state = useAppState();
  const { current, book, assignment } = todaysAssignment();

  const [unlockPrompt, setUnlockPrompt] = useState<string[] | null>(null);
  if (!current || !book) return null;

  const lockedCount = state.cards.filter((c) => c.chapterId === current.id && c.locked).length;
  const done = current.studyCompleted;

  return (
    <section className="paper rounded-3xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gold">{assignment.note}</p>
          <h2 className="font-display text-2xl">
            {book.title} · פרק {current.number}
          </h2>
          <p className="text-ink-soft">{current.title}</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-parchment-deep px-3 py-1 text-sm">
          {done ? <UnlockIcon size={16} /> : <LockIcon size={16} />}
          {done ? "כרטיסיות פתוחות" : `${lockedCount} כרטיסיות נעולות`}
        </div>
      </div>

      <article className="hebrew-body mt-4 rounded-2xl bg-parchment/80 p-4">{current.text}</article>

      <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl border border-mist bg-card px-4 py-3">
        <input
          type="checkbox"
          className="h-5 w-5 accent-olive"
          checked={done}
          onChange={(e) => {
            if (e.target.checked) {
              const { unlocked } = completeChapterStudy(current.id);
              if (unlocked.length) setUnlockPrompt(unlocked.map((c) => c.id));
            } else if (state.settings.isAdmin) {
              reopenChapterStudy(current.id);
            }
          }}
        />
        <span className="font-semibold">סיימתי את הלימוד היומי</span>
      </label>
      <p className="mt-2 text-xs text-ink-soft">
        כרטיסיות הפרק נשארות נעולות עד לאישור זה. החזרה היומית תיפתח רק אחרי גוף הלימוד.
      </p>

      {unlockPrompt ? (
        <div className="mt-4 rounded-2xl border border-gold/40 bg-gold/10 p-4">
          <p className="font-semibold">נפתחו {unlockPrompt.length} כרטיסיות חדשות.</p>
          <p className="mt-1 text-sm text-ink-soft">קבעו את מרווח החזרה הראשונה:</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {([1, 2, 3] as const).map((d) => (
              <button
                key={d}
                type="button"
                className="rounded-xl bg-card py-2 hover:border-gold border border-mist"
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
    </section>
  );
}

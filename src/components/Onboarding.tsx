import { useState } from "react";
import { splitDailyTime } from "@shared/allocation";
import { completeOnboarding } from "../lib/store";
import { LogoMark } from "./Icons";

const PRESETS = [60, 90, 120];

export function Onboarding() {
  const [custom, setCustom] = useState("75");
  const [picked, setPicked] = useState<number | "custom">(90);
  const minutes = picked === "custom" ? Number(custom) || 75 : picked;
  const split = splitDailyTime(minutes);
  const studyPct = Math.round((split.studyMinutes / minutes) * 100);
  const reviewPct = 100 - studyPct;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-3 backdrop-blur-[6px] sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboard-title"
        className="paper max-h-[min(92dvh,100%)] w-full max-w-lg overflow-y-auto rounded-[1.7rem] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-8"
      >
        <div className="mb-4 flex items-center gap-3">
          <LogoMark className="h-12 w-12" />
          <p className="text-sm text-gold">ברוכים הבאים · סובב תורה 2.1</p>
        </div>
        <h1 id="onboard-title" className="font-display text-[1.7rem] leading-tight text-ink sm:text-[2.1rem]">
          מהו זמן הלימוד היומי שלך?
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          נחלק אוטומטית כ־80% לגוף הטקסט וכ־20% לחזרה על כרטיסיות. אפשר לערוך אחר כך בלו״ז.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPicked(m)}
              className={`rounded-2xl border px-3 py-4 text-lg font-semibold transition ${
                picked === m
                  ? "border-gold bg-gold/12 text-ink shadow-[0_0_0_3px_rgba(154,111,40,0.12)]"
                  : "border-mist bg-parchment text-ink-soft hover:border-gold/50"
              }`}
            >
              <span dir="ltr">{m}</span>
              <div className="text-xs font-normal">דקות</div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPicked("custom")}
          className={`mt-3 w-full rounded-2xl border px-4 py-3 text-right transition ${
            picked === "custom"
              ? "border-gold bg-gold/12 shadow-[0_0_0_3px_rgba(154,111,40,0.12)]"
              : "border-mist bg-parchment hover:border-gold/50"
          }`}
        >
          <div className="text-sm text-ink-soft">מותאם אישית</div>
          <input
            type="number"
            min={20}
            max={240}
            value={custom}
            onChange={(e) => {
              setPicked("custom");
              setCustom(e.target.value);
            }}
            className="mt-1 w-24 border-b border-gold bg-transparent text-xl outline-none max-[380px]:text-base"
          />
          <span className="ms-2 text-ink-soft">דקות</span>
        </button>

        <div className="mt-5 rounded-2xl bg-parchment-deep/55 p-4 text-sm">
          <div className="flex justify-between">
            <span>לימוד טקסט</span>
            <strong>
              {split.studyMinutes} דק׳ · {studyPct}%
            </strong>
          </div>
          <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-mist">
            <div className="bg-olive" style={{ width: `${studyPct}%` }} />
            <div className="bg-gold" style={{ width: `${reviewPct}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-ink-soft">
            <span>חזרה / שינון</span>
            <strong className="text-ink">
              {split.reviewMinutes} דק׳ · {reviewPct}%
            </strong>
          </div>
        </div>

        <button type="button" className="btn btn-primary mt-6 w-full py-3.5 text-lg" onClick={() => completeOnboarding(minutes)}>
          התחילו את היום
        </button>
      </div>
    </div>
  );
}

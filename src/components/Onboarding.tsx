import { useState } from "react";
import { splitDailyTime } from "@shared/allocation";
import { completeOnboarding } from "../lib/store";

const PRESETS = [60, 90, 120];

export function Onboarding() {
  const [custom, setCustom] = useState("75");
  const [picked, setPicked] = useState<number | "custom">(90);
  const minutes = picked === "custom" ? Number(custom) || 75 : picked;
  const split = splitDailyTime(minutes);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-labelledby="onboard-title"
        className="paper w-full max-w-lg rounded-3xl p-6 sm:p-8"
      >
        <p className="text-sm text-gold">ברוכים הבאים · סובב תורה 2.1</p>
        <h1 id="onboard-title" className="font-display mt-1 text-3xl text-ink">
          מהו זמן הלימוד היומי שלך?
        </h1>
        <p className="mt-2 text-ink-soft">
          נחלק אוטומטית כ־80% לגוף הטקסט וכ־20% לחזרה על כרטיסיות. אפשר לערוך אחר כך בלו״ז.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPicked(m)}
              className={`rounded-2xl border px-3 py-4 text-lg font-semibold ${
                picked === m
                  ? "border-gold bg-gold/10 text-ink"
                  : "border-mist bg-parchment text-ink-soft"
              }`}
            >
              {m}
              <div className="text-xs font-normal">דקות</div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPicked("custom")}
          className={`mt-3 w-full rounded-2xl border px-3 py-3 text-right ${
            picked === "custom" ? "border-gold bg-gold/10" : "border-mist bg-parchment"
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
            className="mt-1 w-24 border-b border-gold bg-transparent text-xl outline-none"
          />
          <span className="ms-2 text-ink-soft">דקות</span>
        </button>

        <div className="mt-5 rounded-2xl bg-parchment-deep/60 p-4 text-sm">
          <div className="flex justify-between">
            <span>לימוד טקסט</span>
            <strong>
              {split.studyMinutes} דק׳ · {Math.round((split.studyMinutes / minutes) * 100)}%
            </strong>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full bg-olive"
              style={{ width: `${(split.studyMinutes / minutes) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between">
            <span>חזרה / שינון</span>
            <strong>
              {split.reviewMinutes} דק׳ · {Math.round((split.reviewMinutes / minutes) * 100)}%
            </strong>
          </div>
        </div>

        <button
          type="button"
          className="mt-6 w-full rounded-2xl bg-burgundy py-3 text-lg text-parchment"
          onClick={() => completeOnboarding(minutes)}
        >
          התחילו את היום
        </button>
      </div>
    </div>
  );
}

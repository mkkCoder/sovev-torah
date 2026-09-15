import type { Rating } from "@shared/types";
import { RATING_LABEL } from "@shared/types";

const RATING_CLASS: Record<Rating, string> = {
  excellent: "rating-excellent",
  ok: "rating-ok",
  hard: "rating-hard",
  wrong: "rating-wrong",
};

const RATING_HINT: Record<Rating, string> = {
  excellent: "~3 שבועות",
  ok: "~שבועיים",
  hard: "24ש׳–7י׳",
  wrong: "24ש׳–4י׳",
};

export function RatingButtons({
  disabled,
  onRate,
}: {
  disabled?: boolean;
  onRate: (rating: Rating) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {(["excellent", "ok", "hard", "wrong"] as Rating[]).map((r, i) => (
        <button
          key={r}
          type="button"
          disabled={disabled}
          onClick={() => onRate(r)}
          className={`btn min-h-12 rounded-2xl border py-3 text-sm ${RATING_CLASS[r]} disabled:opacity-40`}
        >
          <span className="flex flex-col px-0.5">
            <span>{RATING_LABEL[r]}</span>
            <span className="mt-0.5 text-[11px] font-normal opacity-80">
              <span className="tabular-nums">{i + 1}</span>
              <span className="hidden min-[400px]:inline"> · {RATING_HINT[r]}</span>
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  showLabel = true,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  showLabel?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-mist bg-card px-2.5 py-1.5 text-xs text-ink-soft"
    >
      {showLabel ? <span className="hidden sm:inline">{label}</span> : null}
      <span className="toggle" data-on={checked ? "true" : "false"} />
    </button>
  );
}

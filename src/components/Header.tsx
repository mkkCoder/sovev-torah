import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogoMark, SearchIcon, UserIcon } from "./Icons";
import { patchSettings } from "../lib/store";
import type { Settings } from "@shared/types";
import { Switch } from "./ui";

export function Header({ settings }: { settings: Settings }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const q = params.get("q") ?? "";
  const initial = settings.profileName.trim().slice(0, 1) || "ל";

  return (
    <header className="sticky top-0 z-40 border-b border-mist/70 bg-parchment/85 shadow-[0_8px_24px_-20px_rgba(36,28,18,0.55)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 sm:gap-4 sm:py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2 rounded-xl pe-1" aria-label="סובב תורה — דף הבית">
          <LogoMark className="h-10 w-10 drop-shadow-sm" />
          <div className="hidden leading-tight sm:block">
            <div className="font-display text-[1.35rem] font-semibold text-ink">סובב תורה</div>
            <div className="text-[11px] tracking-wide text-ink-soft">לימוד · חזרה · נצח</div>
          </div>
        </Link>

        <form
          role="search"
          action="/search"
          className="relative min-w-0 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const next = String(fd.get("q") ?? "").trim();
            navigate(next ? `/search?q=${encodeURIComponent(next)}` : "/");
          }}
        >
          <SearchIcon className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-soft" size={18} />
          <input
            name="q"
            defaultValue={q}
            key={q}
            placeholder="חפש כרטיסייה, מושג או ספר..."
            className="field w-full rounded-full py-2.5 pr-11 pl-4 text-[15px] shadow-none placeholder:text-ink-soft/65"
            aria-label="חיפוש כרטיסייה, מושג או ספר"
          />
        </form>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Switch
            label="מנהל"
            checked={settings.isAdmin}
            onChange={(next) => patchSettings({ isAdmin: next })}
          />
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-full border border-mist bg-card py-1 ps-1 pe-2.5 text-sm text-ink transition hover:border-gold"
            aria-label="פרופיל"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-burgundy text-sm font-semibold text-parchment">
              {initial}
            </span>
            <span className="hidden max-w-24 truncate sm:inline">{settings.profileName}</span>
            <UserIcon size={16} className="hidden text-ink-soft md:inline" />
          </Link>
        </div>
      </div>
    </header>
  );
}

import { Form, Link, useLocation, useNavigate } from "react-router-dom";
import { LogoMark, SearchIcon, UserIcon } from "./Icons";
import { patchSettings } from "../lib/store";
import type { Settings } from "@shared/types";

export function Header({ settings }: { settings: Settings }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const q = params.get("q") ?? "";

  return (
    <header className="sticky top-0 z-40 border-b border-mist/80 bg-parchment/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-5">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="סובב תורה — דף הבית">
          <LogoMark className="h-10 w-10" />
          <div className="hidden leading-tight sm:block">
            <div className="font-display text-xl font-semibold text-ink">סובב תורה</div>
            <div className="text-[11px] text-ink-soft">לימוד · חזרה · נצח</div>
          </div>
        </Link>

        <Form
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
          <SearchIcon className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-soft" size={18} />
          <input
            name="q"
            defaultValue={q}
            key={q}
            placeholder="חפש כרטיסייה, מושג או ספר..."
            className="w-full rounded-full border border-mist bg-card/90 py-2.5 pr-10 pl-4 text-[15px] text-ink shadow-inner outline-none placeholder:text-ink-soft/70 focus:border-gold"
            aria-label="חיפוש כרטיסייה, מושג או ספר"
          />
        </Form>

        <div className="flex shrink-0 items-center gap-2">
          <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-mist bg-card px-2.5 py-1 text-xs text-ink-soft">
            <span className="hidden sm:inline">מנהל</span>
            <input
              type="checkbox"
              className="accent-burgundy"
              checked={settings.isAdmin}
              onChange={(e) => patchSettings({ isAdmin: e.target.checked })}
              aria-label="מצב מנהל"
            />
          </label>
          <Link
            to="/profile"
            className="flex items-center gap-1.5 rounded-full border border-mist bg-card px-2.5 py-1.5 text-sm text-ink hover:border-gold"
            aria-label="פרופיל"
          >
            <UserIcon size={18} />
            <span className="hidden max-w-24 truncate sm:inline">{settings.profileName}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

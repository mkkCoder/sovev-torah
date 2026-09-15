import { patchSettings, resetToSeed, adminUnlockAll } from "../lib/store";
import { useAppState } from "../lib/useAppState";
import { PageShell } from "../components/PageShell";

export function ProfilePage() {
  const state = useAppState();

  return (
    <PageShell title="פרופיל" kicker="הגדרות מקומיות">
      <section className="paper max-w-lg rounded-3xl p-5">
        <label className="text-sm text-ink-soft">שם לתצוגה</label>
        <input
          className="mt-1 w-full rounded-xl border border-mist bg-parchment px-3 py-2"
          value={state.settings.profileName}
          onChange={(e) => patchSettings({ profileName: e.target.value })}
        />

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={state.settings.isAdmin}
            onChange={(e) => patchSettings({ isAdmin: e.target.checked })}
          />
          מצב מנהל — איפוס, פתיחת נעילות, עריכה חופשית
        </label>

        {state.settings.isAdmin ? (
          <div className="mt-4 space-y-2 rounded-2xl bg-parchment p-4">
            <button
              type="button"
              className="w-full rounded-xl border border-mist bg-card py-2"
              onClick={() => adminUnlockAll()}
            >
              פתיחת כל הכרטיסיות הנעולות
            </button>
            <button
              type="button"
              className="w-full rounded-xl border border-burgundy/40 py-2 text-burgundy"
              onClick={() => {
                if (confirm("לאפס את כל הנתונים לזרע ההדגמה?")) resetToSeed();
              }}
            >
              איפוס לזרע הדגמה
            </button>
          </div>
        ) : null}

        <p className="mt-4 text-sm text-ink-soft">
          הגרסה 2.1 · הנתונים במכשיר זה בלבד. לפריסה ל־Cloudflare Workers ראו README.
        </p>
      </section>
    </PageShell>
  );
}

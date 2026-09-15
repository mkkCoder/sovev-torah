import { patchSettings, resetToSeed, adminUnlockAll } from "../lib/store";
import { useAppState } from "../lib/useAppState";
import { PageShell } from "../components/PageShell";
import { Switch } from "../components/ui";

export function ProfilePage() {
  const state = useAppState();

  return (
    <PageShell title="פרופיל" kicker="הגדרות מקומיות">
      <section className="paper max-w-lg rounded-[1.5rem] p-6">
        <label className="text-sm text-ink-soft">שם לתצוגה</label>
        <input
          className="field mt-1"
          value={state.settings.profileName}
          onChange={(e) => patchSettings({ profileName: e.target.value })}
        />

        <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-parchment/80 px-3 py-3">
          <div>
            <p className="text-sm font-medium">מצב מנהל</p>
            <p className="text-xs text-ink-soft">איפוס, פתיחת נעילות, עריכה חופשית</p>
          </div>
          <Switch
            label="מצב מנהל"
            showLabel={false}
            checked={state.settings.isAdmin}
            onChange={(next) => patchSettings({ isAdmin: next })}
          />
        </div>

        {state.settings.isAdmin ? (
          <div className="mt-4 space-y-2 rounded-2xl bg-parchment p-4">
            <button type="button" className="btn btn-secondary w-full" onClick={() => adminUnlockAll()}>
              פתיחת כל הכרטיסיות הנעולות
            </button>
            <button
              type="button"
              className="btn w-full border border-burgundy/35 text-burgundy"
              onClick={() => {
                if (confirm("לאפס את כל הנתונים לזרע ההדגמה?")) resetToSeed();
              }}
            >
              איפוס לזרע הדגמה
            </button>
          </div>
        ) : null}

        <p className="mt-5 text-sm text-ink-soft">
          הגרסה 2.1 · הנתונים במכשיר זה בלבד. לפריסה ל־Cloudflare Workers ראו README.
        </p>
      </section>
    </PageShell>
  );
}

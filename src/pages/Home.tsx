import { useAppState } from "../lib/useAppState";
import { DashboardCard } from "../components/DashboardCard";
import {
  CalendarIcon,
  ChartIcon,
  MidrashIcon,
  QuizIcon,
  RepeatIcon,
  SparkIcon,
} from "../components/Icons";
import { dailyReviewCap } from "@shared/allocation";
import { buildDailyDeck, isNewUnlocked } from "@shared/srs";
import { DAY_NAMES } from "@shared/types";
import { DailyStudyPanel } from "../components/DailyStudyPanel";

export function HomePage() {
  const state = useAppState();
  const cap = dailyReviewCap(state.settings.reviewMinutes);
  const { session, overflow } = buildDailyDeck(state.cards, cap);
  const newCount = state.cards.filter(isNewUnlocked).length;
  const dueCount = session.length + overflow.length;
  const day = new Date().getDay();
  const assignment = state.weekly.find((w) => w.day === day);
  const studyPct = Math.round((state.settings.studyMinutes / state.settings.dailyMinutes) * 100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-16 sm:py-9">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gold">
            שלום, {state.settings.profileName} · יום {DAY_NAMES[day]}
          </p>
          <h1 className="font-display mt-1 text-3xl leading-tight sm:text-[2.45rem]">השולחן ערוך ליום זה</h1>
          <p className="mt-2 max-w-xl text-ink-soft">{assignment?.note}</p>
        </div>
        <div className="min-w-[220px] rounded-2xl border border-mist/80 bg-card/80 px-4 py-3">
          <div className="flex justify-between text-xs text-ink-soft">
            <span>{state.settings.dailyMinutes} דק׳ היום</span>
            <span>{studyPct}/{100 - studyPct}</span>
          </div>
          <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-mist">
            <div className="bg-olive" style={{ width: `${studyPct}%` }} />
            <div className="bg-gold" style={{ width: `${100 - studyPct}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span>{state.settings.studyMinutes} לימוד</span>
            <span>{state.settings.reviewMinutes} חזרה</span>
          </div>
        </div>
      </div>

      <div className="mb-7">
        <DailyStudyPanel />
      </div>

      <div className="ornament mb-5 text-[11px]">ששת השערים</div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          to="/schedule"
          title="לו״ז ותכנון"
          subtitle="שגרה שבועית, חלוקת 80/20 ועריכת שיבוצים."
          icon={<CalendarIcon />}
          tone="bg-gold/15 text-gold"
        />
        <DashboardCard
          to="/review"
          title="שינון יומי"
          subtitle={`${dueCount} ממתינים לחזרה | ${newCount} כרטיסיות חדשות`}
          icon={<RepeatIcon />}
          tone="bg-olive/15 text-olive"
          accent={dueCount > 0}
        />
        <DashboardCard
          to="/bonus"
          title="כרטיסי בונוס"
          subtitle="חזרה רשות מחוץ למכסת היום — בלי לשרוף את הלו״ז."
          icon={<SparkIcon />}
          tone="bg-burgundy/10 text-burgundy"
        />
        <DashboardCard
          to="/quiz"
          title="מבחן מותאם"
          subtitle="מבחן קצר לפי קושי, פיגור וקטגוריה."
          icon={<QuizIcon />}
          tone="bg-ink/10 text-ink"
        />
        <DashboardCard
          to="/beit-midrash"
          title="הוספת חומר / בית מדרש AI"
          subtitle="הדביקו טקסט או העלו תמונה. ארבעה ארכיטיפים + סיווג חובה."
          icon={<MidrashIcon />}
          tone="bg-gold/10 text-burgundy"
        />
        <DashboardCard
          to="/stats"
          title="סטטיסטיקה"
          subtitle="קניין, דיוק, פיגור ופתיחת פרקים."
          icon={<ChartIcon />}
          tone="bg-olive/10 text-olive"
        />
      </div>
    </div>
  );
}

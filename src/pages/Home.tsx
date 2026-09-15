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

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-gold">יום {DAY_NAMES[day]} · {assignment?.note}</p>
          <h1 className="font-display text-3xl sm:text-4xl">השולחן ערוך ליום זה</h1>
          <p className="mt-1 text-ink-soft">
            {state.settings.dailyMinutes} דק׳ · {state.settings.studyMinutes} לימוד ·{" "}
            {state.settings.reviewMinutes} חזרה
          </p>
        </div>
      </div>

      <div className="mb-6">
        <DailyStudyPanel />
      </div>

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

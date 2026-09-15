import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Onboarding } from "./components/Onboarding";
import { HomePage } from "./pages/Home";
import { SchedulePage } from "./pages/Schedule";
import { DailyReviewPage } from "./pages/DailyReview";
import { BonusPage } from "./pages/Bonus";
import { QuizPage } from "./pages/Quiz";
import { BeitMidrashPage } from "./pages/BeitMidrash";
import { StatsPage } from "./pages/Stats";
import { ProfilePage } from "./pages/Profile";
import { SearchPage } from "./pages/SearchPage";
import { useAppState } from "./lib/useAppState";

export default function App() {
  const state = useAppState();

  return (
    <div dir="rtl" className="min-h-dvh pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <Header settings={state.settings} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/review" element={<DailyReviewPage />} />
          <Route path="/bonus" element={<BonusPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/beit-midrash" element={<BeitMidrashPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!state.settings.onboarded ? <Onboarding /> : null}
    </div>
  );
}

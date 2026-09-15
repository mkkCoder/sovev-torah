import { createSeedState } from "@shared/seed";
import type { AppState, Flashcard, Chapter, Settings, WeeklyAssignment, ReviewEvent, Rating } from "@shared/types";
import { applyRating, scheduleFirstReview, unlockChapterCards, deferToTomorrow } from "@shared/srs";
import { todayIso } from "@shared/dates";
import { splitDailyTime } from "@shared/allocation";

const STORAGE_KEY = "sovev-torah-v2";

function load(): AppState {
  try {
    if (typeof localStorage === "undefined") return createSeedState();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || parsed.version !== 2 || !parsed.cards || !parsed.chapters) {
      return createSeedState();
    }
    return parsed;
  } catch {
    return createSeedState();
  }
}

function persist(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

let state: AppState = typeof localStorage === "undefined" ? createSeedState() : load();
const listeners = new Set<() => void>();

function emit(next: AppState): void {
  state = next;
  persist(state);
  listeners.forEach((l) => l());
}

export function getState(): AppState {
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetToSeed(): void {
  emit(createSeedState());
}

export function completeOnboarding(dailyMinutes: number): void {
  const split = splitDailyTime(dailyMinutes);
  emit({
    ...state,
    settings: {
      ...state.settings,
      dailyMinutes,
      studyMinutes: split.studyMinutes,
      reviewMinutes: split.reviewMinutes,
      onboarded: true,
    },
  });
}

export function patchSettings(patch: Partial<Settings>): void {
  let next = { ...state.settings, ...patch };
  if (patch.dailyMinutes != null && patch.studyMinutes == null) {
    const split = splitDailyTime(patch.dailyMinutes);
    next = { ...next, ...split };
  }
  emit({ ...state, settings: next });
}

export function updateWeekly(weekly: WeeklyAssignment[]): void {
  emit({ ...state, weekly });
}

export function completeChapterStudy(chapterId: string): { unlocked: Flashcard[] } {
  const chapters = state.chapters.map((ch) =>
    ch.id === chapterId
      ? { ...ch, studyCompleted: true, completedAt: todayIso() }
      : ch,
  );
  const cards = unlockChapterCards(state.cards, chapterId);
  emit({ ...state, chapters, cards });
  return { unlocked: cards.filter((c) => c.chapterId === chapterId && c.status === "new") };
}

export function reopenChapterStudy(chapterId: string): void {
  const chapters = state.chapters.map((ch) =>
    ch.id === chapterId ? { ...ch, studyCompleted: false, completedAt: undefined } : ch,
  );
  const cards = state.cards.map((c) =>
    c.chapterId === chapterId && c.source === "chapter" && c.reviews === 0
      ? { ...c, locked: true, status: "locked" as const, nextReview: null }
      : c,
  );
  emit({ ...state, chapters, cards });
}

export function firstSchedule(cardIds: string[], days: 1 | 2 | 3): void {
  const today = todayIso();
  const cards = state.cards.map((c) =>
    cardIds.includes(c.id) && c.status === "new" ? scheduleFirstReview(c, days, today) : c,
  );
  const reviewsLog: ReviewEvent[] = [
    ...state.reviewsLog,
    ...cardIds.map((cardId) => ({
      id: `rv-${cardId}-${Date.now()}`,
      cardId,
      rating: `first-${days}` as const,
      at: new Date().toISOString(),
    })),
  ];
  emit({ ...state, cards, reviewsLog });
}

export function rateCard(cardId: string, rating: Rating): void {
  const today = todayIso();
  const cards = state.cards.map((c) => (c.id === cardId ? applyRating(c, rating, today) : c));
  const reviewsLog: ReviewEvent[] = [
    ...state.reviewsLog,
    {
      id: `rv-${cardId}-${Date.now()}`,
      cardId,
      rating,
      at: new Date().toISOString(),
    },
  ];
  emit({ ...state, cards, reviewsLog });
}

export function deferOverflow(overflowIds: string[]): void {
  const today = todayIso();
  const cards = state.cards.map((c) =>
    overflowIds.includes(c.id) ? deferToTomorrow([c], today)[0] : c,
  );
  emit({ ...state, cards, deferredCardIds: overflowIds, deferredOn: today });
}

export function addGeneratedCards(cards: Flashcard[]): void {
  emit({ ...state, cards: [...state.cards, ...cards] });
}

export function updateCard(cardId: string, patch: Partial<Flashcard>): void {
  emit({
    ...state,
    cards: state.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)),
  });
}

export function updateChapter(chapterId: string, patch: Partial<Chapter>): void {
  emit({
    ...state,
    chapters: state.chapters.map((c) => (c.id === chapterId ? { ...c, ...patch } : c)),
  });
}

export function adminUnlockAll(): void {
  emit({
    ...state,
    cards: state.cards.map((c) =>
      c.locked ? { ...c, locked: false, status: c.status === "locked" ? "new" : c.status } : c,
    ),
  });
}

export function todaysAssignment(date = new Date()) {
  const day = date.getDay();
  const assignment = state.weekly.find((w) => w.day === day) ?? state.weekly[0];
  const book = state.books.find((b) => b.id === assignment.seferId);
  const chapters = state.chapters
    .filter((c) => c.bookId === assignment.seferId)
    .sort((a, b) => a.number - b.number);
  const current = chapters.find((c) => !c.studyCompleted) ?? chapters[chapters.length - 1];
  return { assignment, book, chapters, current };
}

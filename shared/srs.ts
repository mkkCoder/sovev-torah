import type { Flashcard, Rating } from "./types";
import { addDaysIso, daysBetween, todayIso } from "./dates";

export function isDue(card: Flashcard, today = todayIso()): boolean {
  if (card.locked || card.status === "locked") return false;
  if (card.status === "new") return false;
  if (!card.nextReview) return false;
  return card.nextReview <= today;
}

export function isNewUnlocked(card: Flashcard): boolean {
  return !card.locked && card.status === "new";
}

export function scheduleFirstReview(card: Flashcard, days: 1 | 2 | 3, today = todayIso()): Flashcard {
  return {
    ...card,
    status: "learning",
    intervalDays: days,
    nextReview: addDaysIso(today, days),
    firstReviewedAt: today,
    reviews: card.reviews + 1,
    difficulty: Math.max(1, card.difficulty - 0.2),
  };
}

function clampDifficulty(n: number): number {
  return Math.min(5, Math.max(1, Math.round(n * 10) / 10));
}

/**
 * Later ratings:
 * ידעתי מצוין → ~3 weeks
 * ידעתי סביר → ~2 weeks
 * בקושי זכרתי / טעיתי → 24h–7 days
 */
export function applyRating(card: Flashcard, rating: Rating, today = todayIso()): Flashcard {
  let intervalDays: number;
  let ease = card.ease;
  let difficulty = card.difficulty;

  switch (rating) {
    case "excellent":
      intervalDays = 21;
      ease = Math.min(3.2, ease + 0.15);
      difficulty = difficulty - 0.45;
      break;
    case "ok":
      intervalDays = 14;
      ease = Math.min(2.8, ease + 0.05);
      difficulty = difficulty - 0.1;
      break;
    case "hard":
      intervalDays = Math.max(1, Math.min(7, Math.round(3 + difficulty * 0.8)));
      ease = Math.max(1.3, ease - 0.12);
      difficulty = difficulty + 0.55;
      break;
    case "wrong":
      intervalDays = Math.max(1, Math.min(4, Math.round(1 + difficulty * 0.4)));
      ease = Math.max(1.3, ease - 0.2);
      difficulty = difficulty + 0.9;
      break;
  }

  return {
    ...card,
    status: "review",
    intervalDays,
    ease,
    difficulty: clampDifficulty(difficulty),
    nextReview: addDaysIso(today, intervalDays),
    lastRating: rating,
    reviews: card.reviews + 1,
  };
}

export function prioritizeBacklog(cards: Flashcard[], today = todayIso()): Flashcard[] {
  return [...cards].sort((a, b) => {
    const overdueA = a.nextReview ? daysBetween(a.nextReview, today) : 0;
    const overdueB = b.nextReview ? daysBetween(b.nextReview, today) : 0;
    if (overdueB !== overdueA) return overdueB - overdueA;
    if (b.difficulty !== a.difficulty) return b.difficulty - a.difficulty;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function buildDailyDeck(
  cards: Flashcard[],
  cap: number,
  today = todayIso(),
): { session: Flashcard[]; overflow: Flashcard[] } {
  const due = prioritizeBacklog(cards.filter((c) => isDue(c, today)));
  const session = due.slice(0, cap);
  const overflow = due.slice(cap);
  return { session, overflow };
}

export function deferToTomorrow(cards: Flashcard[], today = todayIso()): Flashcard[] {
  const tomorrow = addDaysIso(today, 1);
  return cards.map((c) => ({
    ...c,
    nextReview: tomorrow,
  }));
}

export function unlockChapterCards(cards: Flashcard[], chapterId: string): Flashcard[] {
  return cards.map((c) =>
    c.chapterId === chapterId && c.locked
      ? { ...c, locked: false, status: "new" as const, nextReview: null }
      : c,
  );
}

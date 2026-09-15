import { describe, expect, it } from "vitest";
import { dailyReviewCap, isValidSplit, splitDailyTime } from "./allocation";
import { generateCardsHeuristic, archetypesPresent } from "./cardGenerator";
import { applyRating, buildDailyDeck, isDue, scheduleFirstReview, unlockChapterCards } from "./srs";
import { createSeedState } from "./seed";
import { addDaysIso, todayIso } from "./dates";
import type { Flashcard } from "./types";

describe("allocation", () => {
  it("splits 60/90/120 into 75–80% study", () => {
    for (const total of [60, 90, 120, 45]) {
      const { studyMinutes, reviewMinutes } = splitDailyTime(total);
      expect(studyMinutes + reviewMinutes).toBe(Math.min(240, Math.max(20, total)));
      expect(isValidSplit(studyMinutes, reviewMinutes)).toBe(true);
    }
  });

  it("scales review cap with minutes", () => {
    expect(dailyReviewCap(30)).toBe(35);
    expect(dailyReviewCap(60)).toBe(70);
    expect(dailyReviewCap(12)).toBeGreaterThanOrEqual(8);
  });
});

describe("heuristic generator", () => {
  it("produces all four archetypes from pasted text", () => {
    const text = `
נצח ישראל אינו תלוי בהצלחה מדינית נראית. הגלות היא הסתר של המלכות ולא ביטול הצורה.
המהר"ל מדגיש שאריכות הגלות אינה סותרת את הנצח, משום שזמן האומות אינו זמן התורה.
תלמוד תורה כנגד כולם, וקביעת עיתים ביום ובלילה היא שמירת הצינור.
מאימתי קורין את שמע בערבית — זו כניסה לעול מלכות שמים.
`;
    const cards = generateCardsHeuristic({ text, density: 6, sefer: "נצח ישראל" });
    expect(cards.length).toBeGreaterThanOrEqual(4);
    const types = archetypesPresent(cards);
    expect(types).toEqual(expect.arrayContaining(["iyun", "sevara", "cloze", "context"]));
  });
});

describe("SRS and locks", () => {
  it("keeps chapter cards locked until unlock", () => {
    const seed = createSeedState(new Date("2026-09-15T12:00:00"));
    const h1 = seed.cards.filter((c) => c.chapterId === "ch-hilchot-talmud-torah-1");
    expect(h1.length).toBeGreaterThan(0);
    expect(h1.every((c) => c.locked)).toBe(true);
    const unlocked = unlockChapterCards(seed.cards, "ch-hilchot-talmud-torah-1");
    expect(unlocked.filter((c) => c.chapterId === "ch-hilchot-talmud-torah-1").every((c) => !c.locked && c.status === "new")).toBe(true);
  });

  it("first review is 1/2/3 days", () => {
    const today = todayIso(new Date("2026-09-15"));
    const card = {
      id: "x",
      status: "new",
      locked: false,
      intervalDays: 0,
      nextReview: null,
      reviews: 0,
      difficulty: 3,
      ease: 2.5,
    } as Flashcard;
    const next = scheduleFirstReview(card, 2, today);
    expect(next.nextReview).toBe(addDaysIso(today, 2));
    expect(next.status).toBe("learning");
  });

  it("maps ratings to expected windows", () => {
    const today = "2026-09-15";
    const base = {
      id: "x",
      status: "review",
      locked: false,
      intervalDays: 3,
      nextReview: today,
      reviews: 2,
      difficulty: 3,
      ease: 2.5,
    } as Flashcard;
    expect(applyRating(base, "excellent", today).intervalDays).toBe(21);
    expect(applyRating(base, "ok", today).intervalDays).toBe(14);
    const hard = applyRating(base, "hard", today).intervalDays;
    const wrong = applyRating(base, "wrong", today).intervalDays;
    expect(hard).toBeGreaterThanOrEqual(1);
    expect(hard).toBeLessThanOrEqual(7);
    expect(wrong).toBeGreaterThanOrEqual(1);
    expect(wrong).toBeLessThanOrEqual(7);
  });

  it("caps the daily deck and leaves overflow", () => {
    const today = "2026-09-15";
    const cards = Array.from({ length: 50 }, (_, i) => ({
      id: `c${i}`,
      locked: false,
      status: "review",
      nextReview: today,
      difficulty: i % 5,
      createdAt: `2026-01-01T00:00:0${i % 9}Z`,
    })) as Flashcard[];
    const { session, overflow } = buildDailyDeck(cards, 14, today);
    expect(session).toHaveLength(14);
    expect(overflow).toHaveLength(36);
    expect(session.every((c) => isDue(c, today))).toBe(true);
  });
});

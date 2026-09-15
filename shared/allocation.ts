/** Daily time split: 75–80% study / 20–25% review. Default 78/22. */
export function splitDailyTime(totalMinutes: number): {
  studyMinutes: number;
  reviewMinutes: number;
} {
  const total = Math.min(240, Math.max(20, Math.round(totalMinutes)));
  const studyMinutes = Math.round(total * 0.78);
  const reviewMinutes = Math.max(5, total - studyMinutes);
  return { studyMinutes, reviewMinutes };
}

export function isValidSplit(study: number, review: number): boolean {
  const total = study + review;
  if (total <= 0) return false;
  const studyPct = study / total;
  const reviewPct = review / total;
  return studyPct >= 0.75 && studyPct <= 0.8 && reviewPct >= 0.2 && reviewPct <= 0.25;
}

/** ~30–40 cards per 30-minute review block; scales with minutes. */
export function dailyReviewCap(reviewMinutes: number): number {
  return Math.max(8, Math.round((reviewMinutes / 30) * 35));
}

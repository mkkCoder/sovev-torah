export type Category = "shas" | "halacha" | "emuna";

export type Archetype = "iyun" | "sevara" | "cloze" | "context";

export type Rating = "excellent" | "ok" | "hard" | "wrong";

export type CardStatus = "locked" | "new" | "learning" | "review";

export type CardSource = "chapter" | "bonus" | "beit-midrash";

export interface Settings {
  dailyMinutes: number;
  studyMinutes: number;
  reviewMinutes: number;
  onboarded: boolean;
  isAdmin: boolean;
  profileName: string;
}

export interface WeeklyAssignment {
  day: number;
  category: Category;
  seferId: string;
  note: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: Category;
  chapterCount: number;
}

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  title: string;
  text: string;
  studyCompleted: boolean;
  completedAt?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  archetype: Archetype;
  category: Category;
  sefer: string;
  subTag: string;
  chapterId?: string;
  bookId?: string;
  source: CardSource;
  locked: boolean;
  status: CardStatus;
  intervalDays: number;
  ease: number;
  nextReview: string | null;
  lastRating?: Rating;
  reviews: number;
  difficulty: number;
  createdAt: string;
  firstReviewedAt?: string;
}

export interface ReviewEvent {
  id: string;
  cardId: string;
  rating: Rating | "first-1" | "first-2" | "first-3";
  at: string;
}

export interface AppState {
  version: number;
  settings: Settings;
  weekly: WeeklyAssignment[];
  books: Book[];
  chapters: Chapter[];
  cards: Flashcard[];
  reviewsLog: ReviewEvent[];
  deferredCardIds: string[];
  deferredOn: string | null;
}

export interface GeneratedCard {
  question: string;
  answer: string;
  archetype: Archetype;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  shas: 'ש"ס',
  halacha: "הלכה",
  emuna: "אמונה",
};

export const ARCHETYPE_LABEL: Record<Archetype, string> = {
  iyun: "שאלה עיונית מעמיקה",
  sevara: "סברא והיגיון",
  cloze: "השלם את המשפט",
  context: "מיקום והקשר",
};

export const RATING_LABEL: Record<Rating, string> = {
  excellent: "ידעתי מצוין",
  ok: "ידעתי סביר",
  hard: "בקושי זכרתי",
  wrong: "טעיתי",
};

export const DAY_NAMES = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
] as const;

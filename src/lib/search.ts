import type { AppState, Flashcard } from "@shared/types";
import { CATEGORY_LABEL, ARCHETYPE_LABEL } from "@shared/types";

export function searchIndex(state: AppState, query: string): {
  cards: Flashcard[];
  books: AppState["books"];
  chapters: AppState["chapters"];
} {
  const q = query.trim().toLowerCase();
  if (!q) return { cards: [], books: [], chapters: [] };

  const cards = state.cards.filter((c) => {
    const hay = [
      c.question,
      c.answer,
      c.sefer,
      c.subTag,
      ARCHETYPE_LABEL[c.archetype],
      CATEGORY_LABEL[c.category],
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  const books = state.books.filter((b) =>
    [b.title, b.author, CATEGORY_LABEL[b.category]].join(" ").toLowerCase().includes(q),
  );

  const chapters = state.chapters.filter((ch) =>
    [ch.title, ch.text].join(" ").toLowerCase().includes(q),
  );

  return { cards, books, chapters };
}

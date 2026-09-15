import type { GeneratedCard, Archetype } from "./types";

const STOP_WORDS = new Set([
  "של",
  "על",
  "את",
  "עם",
  "כי",
  "אם",
  "כל",
  "לא",
  "כן",
  "גם",
  "או",
  "זה",
  "זו",
  "הוא",
  "היא",
  "הם",
  "הן",
  "אני",
  "אנחנו",
  "יש",
  "אין",
  "אל",
  "מן",
  "בין",
  "אחר",
  "לפני",
  "אחרי",
  "עוד",
  "רק",
  "אבל",
  "אלא",
  "כדי",
  "יותר",
  "מאוד",
  "כאשר",
  "לפי",
  "בעת",
  "the",
  "and",
  "of",
  "to",
  "a",
  "in",
  "is",
  "that",
]);

function stripMarkdown(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~]+/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .trim();
}

export function splitUnits(text: string): string[] {
  const clean = stripMarkdown(text).replace(/\r/g, "");
  const paragraphs = clean
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length >= 24);

  const units: string[] = [];
  for (const p of paragraphs) {
    const sentences = p.split(/(?<=[.!?。…!?:])\s+/).filter((s) => s.length >= 18);
    if (sentences.length === 0) units.push(p);
    else units.push(...sentences);
  }
  return units.length > 0 ? units : [clean.slice(0, 400) || "קטע לימוד"];
}

function tokenize(text: string): string[] {
  return (text.match(/[\u0590-\u05FFa-zA-Z]{2,}/g) ?? []).filter(
    (w) => !STOP_WORDS.has(w.toLowerCase()) && w.length >= 2,
  );
}

export function extractTerms(text: string, limit = 12): string[] {
  const counts = new Map<string, number>();
  for (const w of tokenize(text)) {
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([w]) => w)
    .filter((w) => w.length >= 3)
    .slice(0, limit);
}

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function clozeSentence(unit: string, term: string): { q: string; a: string } {
  const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!re.test(unit) || term.length < 3) {
    const words = tokenize(unit).filter((w) => w.length >= 4);
    const fallback = words[Math.min(1, words.length - 1)] ?? term;
    return {
      q: unit.replace(fallback, "______"),
      a: fallback,
    };
  }
  return { q: unit.replace(re, "______"), a: term };
}

function iyunCard(unit: string, term: string): GeneratedCard {
  const stems = [
    `מהו היסוד העיוני העולה מן הקטע ביחס ל«${term}», וכיצד הוא מארגן את שאר הפרטים?`,
    `באיזו הנחת יסוד תלויה הטענה על «${term}», ומה משתנה אם נחליף את ההנחה?`,
    `מה המתח העיוני בקטע סביב «${term}», וכיצד הקטע מיישב אותו?`,
    `כיצד מגדיר הקטע את «${term}» — כסיבה, כתוצאה, או כמסגרת — ומה נפקא־מינה להבנה?`,
  ];
  return {
    archetype: "iyun",
    question: pick(stems, term.length + unit.length),
    answer: `מן הקטע: «${unit.slice(0, 220)}${unit.length > 220 ? "…" : ""}» — יש לעמוד על מקומו של «${term}» כציר המארגן, לא כפרט שולי.`,
  };
}

function sevaraCard(unit: string, term: string): GeneratedCard {
  const stems = [
    `מדוע לפי הסברא מתחייב לדבר על «${term}» דווקא כך, ולא בדרך הפשוטה יותר?`,
    `איזו סברא תמנע מאתנו לפרש את «${term}» כמקרה פרטי בלבד?`,
    `אם נאמר ש«${term}» הוא רק תיאור ולא דין/עיקרון — איזו קושיה תיווצר בקטע?`,
    `מה ההיגיון הפנימי שמקשר בין «${term}» לבין המסקנה של הקטע?`,
  ];
  return {
    archetype: "sevara",
    question: pick(stems, term.length * 3),
    answer: `הסברא בקטע אינה סיפור בעלמא: «${unit.slice(0, 200)}${unit.length > 200 ? "…" : ""}» — «${term}» צריך להסביר את הכרח המהלך, לא רק לתארו.`,
  };
}

function clozeCard(unit: string, term: string): GeneratedCard {
  const { q, a } = clozeSentence(unit, term);
  return {
    archetype: "cloze",
    question: `השלימו את המשפט / הפסוק:\n${q}`,
    answer: a,
  };
}

function contextCard(unit: string, term: string, sefer: string): GeneratedCard {
  const stems = [
    `באיזה הקשר מופיע «${term}» ב${sefer || "הספר"}, ומה המשמעות של הופעתו דווקא כאן?`,
    `לאיזה דיון רחב יותר שייך הקטע על «${term}» — ומדוע אינו עומד בפני עצמו?`,
    `מה ממקם את הקטע בתוך מהלך ${sefer || "הספר"}: הקדמה, ראיה, או מסקנה?`,
    `עם איזה נושא סמוך יש לקרוא את «${term}» כדי שלא יישמט ההקשר?`,
  ];
  return {
    archetype: "context",
    question: pick(stems, unit.length),
    answer: `הקשר: הקטע ב${sefer || "החיבור"} דן ב«${term}» כחלק ממהלך רחב — «${unit.slice(0, 180)}${unit.length > 180 ? "…" : ""}».`,
  };
}

const ARCHETYPE_PLAN: Archetype[] = [
  "iyun",
  "iyun",
  "sevara",
  "cloze",
  "context",
  "iyun",
  "sevara",
  "cloze",
];

export interface GenerateOptions {
  text: string;
  density?: number;
  sefer?: string;
}

export function generateCardsHeuristic(options: GenerateOptions): GeneratedCard[] {
  const density = Math.min(12, Math.max(3, options.density ?? 6));
  const units = splitUnits(options.text);
  const terms = extractTerms(options.text);
  const sefer = options.sefer?.trim() || "הספר";
  const cards: GeneratedCard[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < density * 3 && cards.length < density; i++) {
    const unit = pick(units, i);
    const term = pick(terms.length ? terms : ["עיקר"], i + 2);
    const archetype = ARCHETYPE_PLAN[i % ARCHETYPE_PLAN.length];
    let card: GeneratedCard;
    if (archetype === "iyun") card = iyunCard(unit, term);
    else if (archetype === "sevara") card = sevaraCard(unit, term);
    else if (archetype === "cloze") card = clozeCard(unit, term);
    else card = contextCard(unit, term, sefer);

    const key = `${card.archetype}:${card.question}`;
    if (seen.has(key)) continue;
    seen.add(key);
    cards.push(card);
  }

  const have = new Set(cards.map((c) => c.archetype));
  const missing: Archetype[] = (["iyun", "sevara", "cloze", "context"] as const).filter(
    (a) => !have.has(a),
  );
  const unit0 = units[0] ?? options.text.slice(0, 180);
  const term0 = terms[0] ?? "עיקר";
  for (const a of missing) {
    if (cards.length >= density && cards.length >= 4) break;
    const extra =
      a === "iyun"
        ? iyunCard(unit0, term0)
        : a === "sevara"
          ? sevaraCard(unit0, term0)
          : a === "cloze"
            ? clozeCard(unit0, term0)
            : contextCard(unit0, term0, sefer);
    cards.push(extra);
  }

  return cards.slice(0, Math.max(density, 4));
}

export function archetypesPresent(cards: GeneratedCard[]): Archetype[] {
  return [...new Set(cards.map((c) => c.archetype))];
}

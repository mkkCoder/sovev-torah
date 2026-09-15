import { useEffect, useState } from "react";
import type { Archetype, Category, Flashcard, GeneratedCard } from "@shared/types";
import { ARCHETYPE_LABEL, CATEGORY_LABEL } from "@shared/types";
import { extractTextFromImage, fetchAiStatus, generateCardsFromText, type AiStatus } from "../lib/api";
import { addGeneratedCards } from "../lib/store";
import { useAppState } from "../lib/useAppState";
import { PageShell } from "../components/PageShell";
import { todayIso } from "@shared/dates";

const ARCHETYPES: Archetype[] = ["iyun", "sevara", "cloze", "context"];

export function BeitMidrashPage() {
  const state = useAppState();
  const [text, setText] = useState("");
  const [density, setDensity] = useState(6);
  const [category, setCategory] = useState<Category | "">("");
  const [sefer, setSefer] = useState("");
  const [subTag, setSubTag] = useState("");
  const [drafts, setDrafts] = useState<GeneratedCard[]>([]);
  const [source, setSource] = useState<"ai" | "heuristic" | null>(null);
  const [busy, setBusy] = useState(false);
  const [ocrNote, setOcrNote] = useState<string | null>(null);
  const [ai, setAi] = useState<AiStatus | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    void fetchAiStatus().then(setAi);
  }, []);

  const canSave = Boolean(category && sefer.trim() && subTag.trim() && drafts.length);

  async function onGenerate() {
    setBusy(true);
    setSavedMsg(null);
    const result = await generateCardsFromText({
      text,
      density,
      sefer,
      category: (category || "emuna") as Category,
    });
    setDrafts(result.cards);
    setSource(result.source);
    setBusy(false);
  }

  async function onImage(file: File) {
    setBusy(true);
    setOcrNote("מחלצים טקסט מן התמונה...");
    const dataUrl = await fileToDataUrl(file);
    const result = await extractTextFromImage(dataUrl);
    if (result.source === "vision" && result.text) {
      setText((t) => (t ? `${t}\n\n${result.text}` : result.text));
      setOcrNote("הטקסט חולץ באמצעות Workers AI Vision — ניתן לערוך.");
    } else {
      setOcrNote(
        "לא זוהה מודל ראייה זמין (Workers AI). הדביקו כאן את הטקסט שבתמונה — השדה ניתן לעריכה מלאה.",
      );
      if (!text) {
        setText(`(טקסט שחולץ — עריכה ידנית)\nקובץ: ${file.name}\n`);
      }
    }
    setBusy(false);
  }

  function save() {
    if (!canSave || !category) return;
    const now = new Date().toISOString();
    const cards: Flashcard[] = drafts.map((d, i) => ({
      id: `bm-${Date.now()}-${i}`,
      question: d.question,
      answer: d.answer,
      archetype: d.archetype,
      category,
      sefer: sefer.trim(),
      subTag: subTag.trim(),
      source: "beit-midrash",
      locked: false,
      status: "new",
      intervalDays: 0,
      ease: 2.5,
      nextReview: todayIso(),
      reviews: 0,
      difficulty: 3,
      createdAt: now,
    }));
    addGeneratedCards(cards);
    setSavedMsg(`נשמרו ${cards.length} כרטיסיות תחת ${CATEGORY_LABEL[category]} / ${sefer}.`);
    setDrafts([]);
  }

  return (
    <PageShell title="בית מדרש AI" kicker="הוספת חומר · ארבעה ארכיטיפים · בלי API בתשלום">
      <p className="mb-5 rounded-2xl bg-parchment-deep/50 px-4 py-3 text-sm leading-relaxed text-ink-soft">
        {ai?.ai
          ? "זוהה binding של Workers AI. היצירה תנסה את המודל החינמי, ועם כשל תעבור למחולל ההיוריסטי."
          : "אין קישור Workers AI בסביבה זו. המחולל ההיוריסטי ייצר את כל ארבעת הארכיטיפים מתוך הטקסט."}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="paper rounded-[1.5rem] p-5">
          <h2 className="font-display text-xl">מקור</h2>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="field mt-3 hebrew-body"
            placeholder="הדביקו טקסט או Markdown של הסוגיא / הפרק..."
          />
          <label className="mt-3 block cursor-pointer rounded-2xl border border-dashed border-gold/55 bg-gold/5 px-4 py-4 text-sm transition hover:bg-gold/10">
            <span className="font-medium">העלאת תמונה</span>
            <span className="mt-0.5 block text-ink-soft">OCR מדומה / Vision אם זמין — ואז ערכו את הטקסט</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onImage(file);
              }}
            />
          </label>
          {ocrNote ? <p className="mt-2 text-sm text-ink-soft">{ocrNote}</p> : null}

          <div className="mt-4">
            <label className="text-sm">
              צפיפות: {density} כרטיסיות (ברירת מחדל 5–8)
            </label>
            <input
              type="range"
              min={3}
              max={12}
              value={density}
              onChange={(e) => setDensity(Number(e.target.value))}
              className="mt-1 w-full accent-burgundy"
            />
          </div>

          <button
            type="button"
            disabled={busy || text.trim().length < 20}
            onClick={() => void onGenerate()}
            className="btn btn-primary mt-4 w-full py-3"
          >
            {busy ? "יוצרים..." : "יצירת כרטיסיות"}
          </button>
        </section>

        <section className="paper rounded-[1.5rem] p-5">
          <h2 className="font-display text-xl">סיווג — חובה לפני שמירה</h2>
          <p className="text-sm text-ink-soft">כל סט חייב קטגוריה + ספר / תג־משנה.</p>
          <label className="mt-3 block text-sm">קטגוריה</label>
          <select
            className="field mt-1"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "")}
          >
            <option value="">בחרו קטגוריה</option>
            <option value="shas">{CATEGORY_LABEL.shas}</option>
            <option value="halacha">{CATEGORY_LABEL.halacha}</option>
            <option value="emuna">{CATEGORY_LABEL.emuna}</option>
          </select>
          <label className="mt-3 block text-sm">ספר</label>
          <input
            list="sefer-list"
            className="field mt-1"
            value={sefer}
            onChange={(e) => setSefer(e.target.value)}
            placeholder='למשל: נצח ישראל / ברכות / הלכות תלמוד תורה'
          />
          <datalist id="sefer-list">
            {state.books.map((b) => (
              <option key={b.id} value={b.title} />
            ))}
          </datalist>
          <label className="mt-3 block text-sm">תג־משנה / פרק</label>
          <input
            className="field mt-1"
            value={subTag}
            onChange={(e) => setSubTag(e.target.value)}
            placeholder="פרק, דף, סימן..."
          />

          {source ? (
            <p className="mt-3 text-xs text-ink-soft">
              מקור יצירה: {source === "ai" ? "Workers AI" : "מחולל היוריסטי"}
            </p>
          ) : null}

          <div className="mt-4 max-h-[360px] space-y-3 overflow-auto pe-1">
            {drafts.length === 0 ? (
              <p className="rounded-2xl bg-parchment/80 px-4 py-8 text-center text-sm text-ink-soft">
                הכרטיסיות יופיעו כאן לאחר היצירה. ניתן לערוך שאלה ותשובה לפני השמירה.
              </p>
            ) : (
              drafts.map((d, i) => (
              <article key={i} className="rounded-2xl border border-mist bg-parchment/40 p-3">
                <div className="chip bg-gold/12 text-[11px] text-gold">
                  {ARCHETYPE_LABEL[d.archetype]}
                  {!ARCHETYPES.includes(d.archetype) ? " ?" : ""}
                </div>
                <textarea
                  className="mt-2 w-full resize-y bg-transparent text-sm font-semibold outline-none"
                  value={d.question}
                  onChange={(e) =>
                    setDrafts((arr) =>
                      arr.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)),
                    )
                  }
                />
                <textarea
                  className="mt-1 w-full resize-y bg-transparent text-sm text-ink-soft outline-none"
                  value={d.answer}
                  onChange={(e) =>
                    setDrafts((arr) =>
                      arr.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)),
                    )
                  }
                />
              </article>
              ))
            )}
          </div>

          <button
            type="button"
            disabled={!canSave}
            onClick={save}
            className="btn btn-olive mt-4 w-full py-3"
          >
            שמירת הסט
          </button>
          {!canSave ? (
            <p className="mt-2 text-xs text-burgundy">יש למלא קטגוריה, ספר ותג־משנה, וליצור כרטיסיות.</p>
          ) : null}
          {savedMsg ? <p className="mt-2 text-sm text-olive">{savedMsg}</p> : null}
        </section>
      </div>
    </PageShell>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

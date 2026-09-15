# סובב תורה (Sovev Torah) v2.1

Hebrew RTL web app for **Torah study + spaced-repetition flashcards**. Daily time is split ~80% primary text / ~20% review. Chapter cards stay **locked** until you mark that day's text study complete.

לימוד תורה + כרטיסיות במרווחים. ממשק עברית מלא (`dir="rtl"`). חלוקת זמן יומית ≈80% טקסט / ≈20% חזרה. כרטיסיות של פרק **נעולות** עד סימון «סיימתי את הלימוד היומי».

Stack: React + Vite + TypeScript + Tailwind CSS · persistence in `localStorage` · deploy on **Cloudflare Workers free tier** (Static Assets + Vite plugin). Optional **Workers AI** for card generation / vision OCR; a built-in heuristic still produces all 4 archetypes with no paid API.

---

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (Vite + Cloudflare plugin). The app is usable immediately with demo seed data (מהר״ל — נצח ישראל, ברכות, הלכות תלמוד תורה).

```bash
npm test          # SRS, 80/20 split, generator archetypes, lock/unlock
npm run build     # client + Worker → dist/
npm run preview   # Workers runtime locally
```

---

## Deploy (Cloudflare Workers, free)

One command after login:

```bash
npx wrangler login          # once, in a browser
npm run deploy              # vite build && wrangler deploy
```

Equivalent:

```bash
npm run build
npx wrangler deploy
```

This publishes a `*.workers.dev` Worker that serves the SPA (static assets, no billable navigation hits for the React routes) plus `/api/*` for AI helpers. The free Workers plan is enough for this app.

Config lives in [`wrangler.jsonc`](./wrangler.jsonc):

- `assets.not_found_handling = "single-page-application"`
- `assets.run_worker_first = ["/api/*"]`
- `main = "./worker/index.ts"`
- optional `ai.binding = "AI"` (Workers AI)

### Optional: Workers AI (still free / limited, never a paid key)

The Beit Midrash (`/beit-midrash`) calls:

| Route | Purpose |
| --- | --- |
| `GET /api/ai-status` | Whether the AI binding is live |
| `POST /api/generate-cards` | Hebrew cards (4 archetypes) |
| `POST /api/ocr` | Vision / simulated OCR |

Enable the binding (already in `wrangler.jsonc`):

```jsonc
"ai": { "binding": "AI" }
```

On the free Workers AI Neurons quota this uses:

- Text: `@cf/meta/llama-3.1-8b-instruct`
- Vision: `@cf/meta/llama-3.2-11b-vision-instruct`

If the binding is missing, the quota is exhausted, or the model errors, the **heuristic generator** still returns a mixed set of:

1. שאלה עיונית מעמיקה (prioritized)  
2. סברא והיגיון  
3. cloze — השלם את המשפט/הפסוק  
4. מיקום והקשר  

To deploy **without** Workers AI, comment out the `"ai"` block in `wrangler.jsonc` and redeploy. The UI does not require any OpenAI/Anthropic key.

Dashboard: [Workers AI](https://developers.cloudflare.com/workers-ai/) · [Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/) · [Static Assets](https://developers.cloudflare.com/workers/static-assets/).

---

## How the product works

1. **Onboarding** — «מהו זמן הלימוד היומי שלך?» 60 / 90 / 120 / custom. Auto-split 75–80% study / 20–25% review (default 78/22). Editable on **לו״ז ותכנון**.
2. **Weekly routine** — seed: Sun Emuna/Maharal; Mon Gemara; Tue Halacha; Wed Emuna; rest of week filled sensibly. All seven days are editable.
3. **Daily text** — toggle **סיימתי את הלימוד היומי**. Until that is confirmed, that chapter's flashcards stay locked.
4. **SRS** — first review of newly unlocked cards: 1 / 2 / 3 days. Later: ידעתי מצוין ≈ 3 weeks; ידעתי סביר ≈ 2 weeks; בקושי זכרתי / טעיתי = 24h–7 days. Daily deck capped (~35 cards / 30 min review, scaled). If backlog exceeds cap: oldest dues + high difficulty first, with banner «ישנן חזרות נוספות הממתינות בתור — האם לדחות למחר או להמשיך?»
5. **בית מדרש AI** — paste text/markdown or upload an image (Vision if bound, else an editable extracted-text area). Density default 6 (5–8 range). Save is blocked until category (ש״ס \| הלכה \| אמונה) + sefer + sub-tag are set.
6. **Homepage** — sticky header only (logo right, search, profile/admin left). Six dashboard cards, each a real view.

Data keys: `localStorage["sovev-torah-v2"]` holds daily time, weekly routine, book/chapter progress, cards, intervals, ratings, and next-review dates.

---

## Project layout

```
src/                 React SPA (Hebrew UI strings; English identifiers)
shared/              SRS, 80/20 split, heuristic generator, seed, types
worker/index.ts      /api/*  (Workers AI + heuristic fallback)
wrangler.jsonc       Workers + static assets + optional AI binding
```

Admin toggle (header / profile) can reset demo seed or unlock cards. Use it only for practice machines.

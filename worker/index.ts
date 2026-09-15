import { generateCardsHeuristic } from "../shared/cardGenerator";

export interface Env {
  AI?: Ai;
}

const TEXT_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function extractJsonArray(text: string): unknown[] | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced?.[1] ?? text).trim();
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function hasAi(env: Env): boolean {
  return Boolean(env.AI && typeof env.AI.run === "function");
}

async function runText(env: Env, prompt: string): Promise<string | null> {
  if (!hasAi(env) || !env.AI) return null;
  try {
    const result = (await env.AI.run(TEXT_MODEL, {
      messages: [
        {
          role: "system",
          content:
            "You are a Hebrew Torah-study assistant. Reply with valid JSON only. No markdown.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1800,
    })) as { response?: string };
    return typeof result?.response === "string" ? result.response : JSON.stringify(result);
  } catch {
    return null;
  }
}

async function runVision(env: Env, imageDataUrl: string): Promise<string | null> {
  if (!hasAi(env) || !env.AI) return null;
  try {
    const result = (await env.AI.run(VISION_MODEL, {
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all Hebrew or English text from this study page image. Return plain text only, preserving paragraphs. If the image is not a text page, describe it briefly in Hebrew.",
            },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
      max_tokens: 1200,
    })) as { response?: string };
    return typeof result?.response === "string" ? result.response : null;
  } catch {
    try {
      const base64 = imageDataUrl.split(",")[1] ?? "";
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const result = (await env.AI!.run(VISION_MODEL, {
        prompt:
          "Extract all Hebrew or English text from this image. Return plain text only.",
        image: [...bytes],
        max_tokens: 1200,
      })) as { response?: string };
      return typeof result?.response === "string" ? result.response : null;
    } catch {
      return null;
    }
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }

    if (url.pathname === "/api/health") {
      return json({ ok: true, app: "sovev-torah", version: "2.1.0" });
    }

    if (url.pathname === "/api/ai-status") {
      return json({
        ai: hasAi(env),
        vision: hasAi(env),
        source: hasAi(env) ? "worker" : "heuristic",
      });
    }

    if (url.pathname === "/api/generate-cards" && request.method === "POST") {
      let body: {
        text?: string;
        density?: number;
        sefer?: string;
        category?: string;
      } = {};
      try {
        body = (await request.json()) as typeof body;
      } catch {
        return json({ error: "invalid_json" }, 400);
      }
      const text = (body.text ?? "").trim();
      if (text.length < 20) return json({ error: "text_too_short" }, 400);
      const density = body.density ?? 6;
      const sefer = body.sefer ?? "";

      const heuristic = generateCardsHeuristic({ text, density, sefer });

      const prompt = `צור כרטיסיות לימוד תורה בעברית מתוך הקטע.
חובה לערבב ארבעה ארכיטיפים, ולתעדף שאלה עיונית מעמיקה:
1) iyun — שאלה עיונית מעמיקה
2) sevara — סברא והיגיון
3) cloze — השלם את המשפט/הפסוק (עם ______)
4) context — מיקום והקשר
מספר כרטיסיות: ${density}
ספר: ${sefer || "לא צוין"}
קטע:
"""
${text.slice(0, 6000)}
"""
החזר JSON בלבד במבנה:
[{"question":"...","answer":"...","archetype":"iyun"|"sevara"|"cloze"|"context"}]`;

      const raw = await runText(env, prompt);
      const parsed = raw ? extractJsonArray(raw) : null;
      const aiCards = (parsed ?? [])
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const rec = item as Record<string, unknown>;
          const archetype = rec.archetype;
          if (
            archetype !== "iyun" &&
            archetype !== "sevara" &&
            archetype !== "cloze" &&
            archetype !== "context"
          ) {
            return null;
          }
          if (typeof rec.question !== "string" || typeof rec.answer !== "string") return null;
          return {
            question: rec.question.trim(),
            answer: rec.answer.trim(),
            archetype,
          };
        })
        .filter((c): c is NonNullable<typeof c> => Boolean(c));

      const have = new Set(aiCards.map((c) => c.archetype));
      const missing = (["iyun", "sevara", "cloze", "context"] as const).filter((a) => !have.has(a));
      const filled =
        aiCards.length >= 4 && missing.length === 0
          ? aiCards.slice(0, Math.max(density, 4))
          : [...aiCards, ...heuristic].slice(0, Math.max(density, 4));

      const source = aiCards.length >= 4 && missing.length === 0 ? "ai" : "heuristic";
      return json({
        cards: filled.length ? filled : heuristic,
        source: aiCards.length ? source : "heuristic",
      });
    }

    if (url.pathname === "/api/ocr" && request.method === "POST") {
      let body: { image?: string } = {};
      try {
        body = (await request.json()) as typeof body;
      } catch {
        return json({ error: "invalid_json" }, 400);
      }
      const image = body.image ?? "";
      if (!image.startsWith("data:image/")) {
        return json({ error: "expected_data_url" }, 400);
      }
      const visionText = await runVision(env, image);
      if (visionText?.trim()) {
        return json({ text: visionText.trim(), source: "vision" });
      }
      return json({
        text: "",
        source: "simulated",
        message:
          "לא זוהה מודל ראייה זמין. הדביקו או ערכו כאן את הטקסט מן התמונה.",
      });
    }

    return json({ error: "not_found" }, 404);
  },
} satisfies ExportedHandler<Env>;

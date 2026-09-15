import type { Category, GeneratedCard } from "@shared/types";
import { generateCardsHeuristic } from "@shared/cardGenerator";

export interface AiStatus {
  ai: boolean;
  vision: boolean;
  source: "worker" | "heuristic";
}

export async function fetchAiStatus(): Promise<AiStatus> {
  try {
    const res = await fetch("/api/ai-status");
    if (!res.ok) throw new Error("status");
    return (await res.json()) as AiStatus;
  } catch {
    return { ai: false, vision: false, source: "heuristic" };
  }
}

export async function generateCardsFromText(input: {
  text: string;
  density: number;
  sefer: string;
  category: Category;
}): Promise<{ cards: GeneratedCard[]; source: "ai" | "heuristic" }> {
  try {
    const res = await fetch("/api/generate-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        cards?: GeneratedCard[];
        source?: "ai" | "heuristic";
      };
      if (data.cards?.length) {
        return { cards: data.cards, source: data.source ?? "heuristic" };
      }
    }
  } catch {
    /* fall through */
  }
  return {
    cards: generateCardsHeuristic({
      text: input.text,
      density: input.density,
      sefer: input.sefer,
    }),
    source: "heuristic",
  };
}

export async function extractTextFromImage(imageDataUrl: string): Promise<{
  text: string;
  source: "vision" | "simulated";
}> {
  try {
    const res = await fetch("/api/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageDataUrl }),
    });
    if (res.ok) {
      const data = (await res.json()) as { text?: string; source?: "vision" | "simulated" };
      if (data.text) return { text: data.text, source: data.source ?? "simulated" };
    }
  } catch {
    /* fall through */
  }
  return {
    text: "",
    source: "simulated",
  };
}

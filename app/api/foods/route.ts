import { NextResponse } from "next/server";
import { verifyRequest } from "@/lib/verify-token";
import type { FoodResult } from "@/lib/types";

// Energy is reported under different nutrient ids depending on the dataset.
const ENERGY_IDS = [1008, 2047, 2048];

interface UsdaFood {
  fdcId: number;
  description: string;
  foodNutrients?: { nutrientId: number; unitName?: string; value?: number }[];
  foodMeasures?: { disseminationText?: string; gramWeight?: number }[];
}

function kcalPer100g(food: UsdaFood) {
  for (const id of ENERGY_IDS) {
    const n = food.foodNutrients?.find(
      (x) => x.nutrientId === id && (x.unitName ?? "KCAL").toUpperCase() === "KCAL",
    );
    if (n?.value !== undefined) return n.value;
  }
  return null;
}

function gramsPer100g(food: UsdaFood, id: number) {
  const v = food.foodNutrients?.find((x) => x.nutrientId === id)?.value;
  return v === undefined ? undefined : Math.round(v * 10) / 10;
}

const USDA_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";
const DATA_TYPES = ["Survey (FNDDS)", "SR Legacy", "Foundation"];

// Search results change rarely, so repeat searches are answered from memory.
const cache = new Map<string, { expires: number; foods: FoodResult[] }>();
const CACHE_MS = 6 * 60 * 60 * 1000;

type UsdaResult =
  | { ok: true; data: { foods?: UsdaFood[] } }
  | { ok: false; busy: boolean; detail: string };

/**
 * The USDA service fails now and then for no lasting reason, so each search
 * gets up to three tries: its two request styles, then the first one again.
 */
async function searchUsda(query: string): Promise<UsdaResult> {
  const apiKey = process.env.USDA_API_KEY || "DEMO_KEY";
  const viaPost = () =>
    fetch(`${USDA_URL}?api_key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, pageSize: 20, dataType: DATA_TYPES }),
      signal: AbortSignal.timeout(8_000),
    });
  const viaGet = () => {
    const url = new URL(USDA_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("pageSize", "20");
    url.searchParams.set("dataType", DATA_TYPES.join(","));
    url.searchParams.set("api_key", apiKey);
    return fetch(url, { signal: AbortSignal.timeout(8_000) });
  };

  let detail = "";
  let busy = false;
  for (const attempt of [viaGet, viaPost, viaGet]) {
    try {
      const res = await attempt();
      if (res.ok) return { ok: true, data: (await res.json()) as { foods?: UsdaFood[] } };
      detail = `HTTP ${res.status} ${(await res.text().catch(() => "")).slice(0, 200)}`;
      busy = res.status === 429;
      // Asking again straight away never helps when over the rate limit or the key is wrong.
      if (res.status === 429 || res.status === 401 || res.status === 403) break;
    } catch (err) {
      detail = (err as Error).message;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return { ok: false, busy, detail };
}

/** Food search backed by USDA FoodData Central. */
export async function GET(req: Request) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ foods: [] });

  const key = q.toLowerCase();
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return NextResponse.json({ foods: hit.foods });

  const result = await searchUsda(q.slice(0, 80));
  if (!result.ok) {
    console.error(`USDA food search failed for "${q}":`, result.detail);
    return NextResponse.json(
      {
        error: result.busy
          ? "The food database is busy. Try again in a minute, or add the food another way."
          : "The food database isn't answering just now. Try again in a moment, or use Describe or Manual instead.",
      },
      { status: 502 },
    );
  }

  const data = result.data;
  const foods: FoodResult[] = [];
  for (const f of data.foods ?? []) {
    const kcal = kcalPer100g(f);
    if (kcal === null) continue;
    const measures = (f.foodMeasures ?? [])
      .filter((m) => m.disseminationText && m.gramWeight && m.disseminationText !== "Quantity not specified")
      .slice(0, 4)
      .map((m) => ({ label: m.disseminationText as string, grams: m.gramWeight as number }));
    foods.push({
      id: String(f.fdcId),
      name: f.description,
      kcalPer100g: Math.round(kcal),
      // USDA nutrient ids: 1003 protein, 1005 carbohydrate, 1004 total fat.
      proteinPer100g: gramsPer100g(f, 1003),
      carbsPer100g: gramsPer100g(f, 1005),
      fatPer100g: gramsPer100g(f, 1004),
      measures,
    });
  }
  if (cache.size > 2000) cache.clear();
  cache.set(key, { expires: Date.now() + CACHE_MS, foods });
  return NextResponse.json({ foods });
}

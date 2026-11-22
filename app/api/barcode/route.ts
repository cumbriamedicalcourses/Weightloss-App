import { NextResponse } from "next/server";
import { verifyRequest } from "@/lib/verify-token";
import type { FoodResult } from "@/lib/types";

interface OffProduct {
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  serving_size?: string;
  serving_quantity?: number | string;
  product_quantity?: number | string;
  nutriments?: Record<string, number | string | undefined>;
}

const cache = new Map<string, { expires: number; food: FoodResult | null }>();
const CACHE_MS = 24 * 60 * 60 * 1000;

const num = (v: unknown) => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : undefined;
};
const round1 = (v: number | undefined) => (v === undefined ? undefined : Math.round(v * 10) / 10);

/** Turns an Open Food Facts product into the same shape the food search returns. */
function toFood(code: string, p: OffProduct): FoodResult | null {
  const n = p.nutriments ?? {};
  const kj = num(n["energy-kj_100g"]) ?? num(n["energy_100g"]);
  const kcal = num(n["energy-kcal_100g"]) ?? (kj === undefined ? undefined : kj / 4.184);
  const title = (p.product_name || p.product_name_en || "").trim();
  if (kcal === undefined || !title) return null;
  const brand = p.brands?.split(",")[0]?.trim();
  const name = brand && !title.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${title}` : title;

  const measures: FoodResult["measures"] = [];
  const serving = num(p.serving_quantity);
  if (serving && serving > 0 && serving <= 2000) measures.push({ label: `1 serving${p.serving_size ? ` (${p.serving_size.slice(0, 30)})` : ""}`, grams: serving });
  const pack = num(p.product_quantity);
  if (pack && pack > 0 && pack <= 2000 && pack !== serving) measures.push({ label: "Whole pack", grams: pack });

  return {
    id: `barcode-${code}`,
    name: name.slice(0, 120),
    kcalPer100g: Math.round(kcal),
    proteinPer100g: round1(num(n["proteins_100g"])),
    carbsPer100g: round1(num(n["carbohydrates_100g"])),
    fatPer100g: round1(num(n["fat_100g"])),
    measures,
  };
}

/** Looks up a packaged food by its barcode in the Open Food Facts database. */
export async function GET(req: Request) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }
  const code = (new URL(req.url).searchParams.get("code") ?? "").replace(/\D/g, "");
  if (code.length < 8 || code.length > 14) {
    return NextResponse.json({ error: "That does not look like a barcode number. It should be 8 to 14 digits." }, { status: 400 });
  }

  const missing = () =>
    NextResponse.json(
      { error: "That product isn't in the database yet. Use Search, or type it in from the label with Manual." },
      { status: 404 },
    );
  const hit = cache.get(code);
  if (hit && hit.expires > Date.now()) return hit.food ? NextResponse.json({ food: hit.food }) : missing();

  let food: FoodResult | null = null;
  try {
    const fields = "product_name,product_name_en,brands,serving_size,serving_quantity,product_quantity,nutriments";
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${fields}`, {
      headers: { "User-Agent": "FoodJournalWebApp/1.0" },
      signal: AbortSignal.timeout(8_000),
    });
    if (res.status !== 404) {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { status?: number; product?: OffProduct };
      if (data.status === 1 && data.product) food = toFood(code, data.product);
    }
  } catch (err) {
    console.error(`Barcode lookup failed for ${code}:`, (err as Error).message);
    return NextResponse.json(
      { error: "The barcode database isn't answering just now. Try again in a moment, or add the food another way." },
      { status: 502 },
    );
  }

  if (cache.size > 5000) cache.clear();
  cache.set(code, { expires: Date.now() + CACHE_MS, food });
  return food ? NextResponse.json({ food }) : missing();
}

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

/** Food search backed by USDA FoodData Central. */
export async function GET(req: Request) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ foods: [] });

  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.searchParams.set("query", q.slice(0, 80));
  url.searchParams.set("pageSize", "20");
  url.searchParams.set("dataType", "Survey (FNDDS),SR Legacy,Foundation");
  url.searchParams.set("api_key", process.env.USDA_API_KEY || "DEMO_KEY");

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  } catch {
    return NextResponse.json(
      { error: "The food database didn't respond. Try again, or add the food by hand." },
      { status: 502 },
    );
  }
  if (!res.ok) {
    const busy = res.status === 429;
    return NextResponse.json(
      {
        error: busy
          ? "The food database is busy. Try again in a minute, or add the food by hand."
          : "The food database returned an error. Try again, or add the food by hand.",
      },
      { status: 502 },
    );
  }

  const data = (await res.json()) as { foods?: UsdaFood[] };
  const foods: FoodResult[] = [];
  for (const f of data.foods ?? []) {
    const kcal = kcalPer100g(f);
    if (kcal === null) continue;
    const measures = (f.foodMeasures ?? [])
      .filter((m) => m.disseminationText && m.gramWeight && m.disseminationText !== "Quantity not specified")
      .slice(0, 4)
      .map((m) => ({ label: m.disseminationText as string, grams: m.gramWeight as number }));
    foods.push({ id: String(f.fdcId), name: f.description, kcalPer100g: Math.round(kcal), measures });
  }
  return NextResponse.json({ foods });
}

import { BANDS, DIETS, type Band, type Diet, type MainMeal, type Swaps } from "./plans";

// The chosen plan and any meal swaps are remembered on this device only.
const PLAN_KEY = "wlj:plan";
const SWAPS_KEY = "wlj:swaps";

export interface PlanChoice {
  diet: Diet;
  band: Band;
}
/** Swapped dishes, keyed by `diet|day|meal`. */
export type SwapMap = Record<string, number>;

function read<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") as T | null;
  } catch {
    return null; // Storage can be blocked; the defaults still work.
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Nothing useful to do if storage is unavailable.
  }
}

export function loadChoice(): Partial<PlanChoice> {
  const saved = read<Partial<PlanChoice>>(PLAN_KEY);
  return {
    diet: saved?.diet && DIETS.some((d) => d.id === saved.diet) ? saved.diet : undefined,
    band: saved?.band && BANDS.includes(saved.band) ? saved.band : undefined,
  };
}
export const saveChoice = (choice: PlanChoice) => write(PLAN_KEY, choice);

export function loadSwaps(): SwapMap {
  const saved = read<SwapMap>(SWAPS_KEY);
  return saved && typeof saved === "object" ? saved : {};
}
export const saveSwaps = (swaps: SwapMap) => write(SWAPS_KEY, swaps);

export const swapKey = (diet: Diet, day: number, meal: MainMeal) => `${diet}|${day}|${meal}`;

export function swapsFor(map: SwapMap, diet: Diet, day: number): Swaps {
  const out: Swaps = {};
  for (const meal of ["breakfast", "lunch", "dinner"] as const) {
    const v = map[swapKey(diet, day, meal)];
    if (Number.isInteger(v) && v >= 0 && v < 7) out[meal] = v;
  }
  return out;
}

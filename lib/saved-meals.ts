import type { Favourite, SavedMeal } from "./types";

export const MAX_SAVED_MEALS = 40;

const sum = (items: Favourite[], key: "calories" | "protein" | "carbs" | "fat" | "units") =>
  items.some((i) => i[key] !== undefined) ? items.reduce((s, i) => s + (i[key] ?? 0), 0) : undefined;

/**
 * What to log for one helping of a saved meal: its items as they are, or for a
 * recipe that makes several servings, a single line with everything divided.
 */
export function servingOf(meal: SavedMeal): Favourite[] {
  if (meal.servings <= 1) return meal.items;
  const share = (v: number | undefined) => (v === undefined ? undefined : Math.round((v / meal.servings) * 10) / 10);
  return [
    {
      name: meal.name,
      portion: `1 of ${meal.servings} servings`,
      calories: Math.round((sum(meal.items, "calories") ?? 0) / meal.servings),
      protein: share(sum(meal.items, "protein")),
      carbs: share(sum(meal.items, "carbs")),
      fat: share(sum(meal.items, "fat")),
      units: share(sum(meal.items, "units")),
    },
  ];
}

import type { Favourite } from "./types";

/** UK low-risk guidance: no more than 14 units a week, spread over 3 or more days. */
export const WEEKLY_UNIT_GUIDE = 14;
/** A daily aim of 6 to 8 glasses of fluid; the tracker counts up to 8. */
export const WATER_GOAL = 8;
export const GLASS_ML = 250;

// name, measure, kcal, units. Units are volume in ml x strength / 1000.
// Calories are from McCance and Widdowson's Composition of Foods Integrated
// Dataset (CoFID 2021), which gives kcal per 100 g; beer, cider and wine are
// taken as 100 g per 100 ml, and spirits as 95 g per 100 ml. CoFID codes:
// lager 17-749 and 17-751, bitter 17-506, cider 17-222 and 17-224, wine
// 17-752 and 17-755, sparkling wine 17-757, spirits 17-247, tonic 17-736.
// Brands vary, so a barcode scan is the closer figure for a particular drink.
type Row = [string, string, number, number];
const ROWS: Row[] = [
  ["Lager (about 4%)", "1 pint", 135, 2.3],
  ["Lager (about 4%)", "Half a pint", 70, 1.1],
  ["Premium lager (about 5%)", "1 pint", 165, 2.8],
  ["Bottle of premium lager (about 5%)", "330 ml bottle", 95, 1.7],
  ["Bitter (about 3.8%)", "1 pint", 170, 2.2],
  ["Dry cider (4.5%)", "1 pint", 205, 2.6],
  ["Sweet cider (4.5%)", "1 pint", 240, 2.6],
  ["Red or dry white wine (13%)", "Small glass, 125 ml", 95, 1.6],
  ["Red or dry white wine (13%)", "Medium glass, 175 ml", 135, 2.3],
  ["Red or dry white wine (13%)", "Large glass, 250 ml", 190, 3.3],
  ["Prosecco or champagne (12%)", "1 glass, 125 ml", 105, 1.5],
  ["Spirit (40%)", "Single, 25 ml", 55, 1],
  ["Spirit (40%)", "Double, 50 ml", 105, 2],
  ["Gin and tonic", "Single with 150 ml regular tonic", 85, 1],
];

export const DRINKS: Favourite[] = ROWS.map(([name, portion, calories, units]) => ({ name, portion, calories, units, origin: "cofid" }));

/** Total alcohol units, to one decimal place. */
export function totalUnits(items: { units?: number }[]) {
  return Math.round(items.reduce((s, i) => s + (i.units ?? 0), 0) * 10) / 10;
}

import type { Favourite } from "./types";

/** UK low-risk guidance: no more than 14 units a week, spread over 3 or more days. */
export const WEEKLY_UNIT_GUIDE = 14;
/** A daily aim of 6 to 8 glasses of fluid; the tracker counts up to 8. */
export const WATER_GOAL = 8;
export const GLASS_ML = 250;

// name, measure, kcal, units. Units are volume in ml x strength / 1000.
// Calories are typical figures and vary by brand.
type Row = [string, string, number, number];
const ROWS: Row[] = [
  ["Beer or lager (4%)", "1 pint", 180, 2.3],
  ["Beer or lager (4%)", "Half a pint", 90, 1.1],
  ["Strong lager (5%)", "1 pint", 240, 2.8],
  ["Bottle of lager (5%)", "330 ml bottle", 140, 1.7],
  ["Cider (4.5%)", "1 pint", 215, 2.6],
  ["Wine (13%)", "Small glass, 125 ml", 105, 1.6],
  ["Wine (13%)", "Medium glass, 175 ml", 150, 2.3],
  ["Wine (13%)", "Large glass, 250 ml", 215, 3.3],
  ["Prosecco or champagne (12%)", "1 glass, 125 ml", 90, 1.5],
  ["Spirit (40%)", "Single, 25 ml", 55, 1],
  ["Spirit (40%)", "Double, 50 ml", 110, 2],
  ["Gin and tonic", "Single with regular tonic", 115, 1],
  ["Gin and slimline tonic", "Single with slimline tonic", 60, 1],
  ["Alcopop (4%)", "275 ml bottle", 170, 1.1],
];

export const DRINKS: Favourite[] = ROWS.map(([name, portion, calories, units]) => ({ name, portion, calories, units }));

/** Total alcohol units, to one decimal place. */
export function totalUnits(items: { units?: number }[]) {
  return Math.round(items.reduce((s, i) => s + (i.units ?? 0), 0) * 10) / 10;
}

import { addDays } from "./dates";
import { bmi } from "./calc";
import { measuredDays, trend, waistBand } from "./measurements";
import type { Entry, Profile, WeightLog } from "./types";

export const REPORT_DAYS = 28;

export interface Report {
  startKg: number;
  startDate: string | null;
  currentKg: number;
  currentDate: string | null;
  changeKg: number;
  changePercent: number;
  bmiStart: number;
  bmiNow: number;
  /** Average change a week over the last four weeks, or null without two weigh-ins that far apart. */
  recentPaceKg: number | null;
  /** Up to eight weigh-ins spread across the whole record, oldest first. */
  weighIns: WeightLog[];
  waist: { latestCm: number; firstCm: number; date: string; ratio: number; label: string } | null;
  daysLogged: number;
  averageKcal: number | null;
  averageProtein: number | null;
  exerciseMinutesPerWeek: number;
  alcoholUnitsPerWeek: number;
}

/** Picks up to `n` items spread evenly, always keeping the first and the last. */
function spread<T>(items: T[], n: number): T[] {
  if (items.length <= n) return items;
  return Array.from({ length: n }, (_, i) => items[Math.round((i * (items.length - 1)) / (n - 1))]);
}

/** The figures for the summary a person can take to their GP. All self-reported. */
export function buildReport(input: { profile: Profile; weights: WeightLog[]; entries: Entry[]; today: string }): Report {
  const { profile, weights, entries, today } = input;
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const startKg = profile.startWeightKg;
  const currentKg = sorted.at(-1)?.kg ?? startKg;
  const changeKg = Math.round((currentKg - startKg) * 10) / 10;

  const from = addDays(today, -(REPORT_DAYS - 1));
  const before = sorted.filter((w) => w.date <= from).at(-1) ?? sorted.find((w) => w.date > from);
  const last = sorted.at(-1);
  const gapDays = before && last ? (Date.parse(last.date) - Date.parse(before.date)) / 86_400_000 : 0;
  const recentPaceKg = before && last && gapDays >= 7 ? Math.round(((last.kg - before.kg) / gapDays) * 7 * 100) / 100 : null;

  const recent = entries.filter((e) => e.date >= from && e.date <= today);
  const food = recent.filter((e) => e.kind === "food");
  const daysLogged = new Set(food.map((e) => e.date)).size;
  const withProtein = food.filter((e) => e.protein !== undefined);
  const proteinKnown = food.length > 0 && withProtein.length >= food.length / 2;
  const weeks = REPORT_DAYS / 7;

  const days = measuredDays(profile);
  const w = trend(days, "waist");
  const band = w ? waistBand(w.latest, profile.heightCm) : null;

  return {
    startKg,
    startDate: sorted[0]?.date ?? null,
    currentKg,
    currentDate: last?.date ?? null,
    changeKg,
    changePercent: startKg ? Math.round((changeKg / startKg) * 1000) / 10 : 0,
    bmiStart: bmi(startKg, profile.heightCm),
    bmiNow: bmi(currentKg, profile.heightCm),
    recentPaceKg,
    weighIns: spread(sorted, 8),
    waist: w && band ? { latestCm: w.latest, firstCm: w.first, date: w.latestDate, ratio: band.ratio, label: band.label } : null,
    daysLogged,
    averageKcal: daysLogged ? Math.round(food.reduce((s, e) => s + e.calories, 0) / daysLogged) : null,
    averageProtein: daysLogged && proteinKnown ? Math.round(withProtein.reduce((s, e) => s + (e.protein ?? 0), 0) / daysLogged) : null,
    exerciseMinutesPerWeek: Math.round(recent.filter((e) => e.kind === "exercise").reduce((s, e) => s + (e.minutes ?? 0), 0) / weeks),
    alcoholUnitsPerWeek: Math.round((food.reduce((s, e) => s + (e.units ?? 0), 0) / weeks) * 10) / 10,
  };
}

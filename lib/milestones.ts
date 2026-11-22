import { addDays, parseDay } from "./dates";
import type { Entry, Profile, WeightLog } from "./types";

/** How far back the journal is read for streaks. */
export const STREAK_WINDOW_DAYS = 90;

export interface Streak {
  /** Days in a row with food logged, ending today (or yesterday if today is still empty). */
  current: number;
  /** Longest run in the window. */
  best: number;
}

export function streak(entries: Entry[], today: string): Streak {
  const logged = new Set(entries.filter((e) => e.kind === "food").map((e) => e.date));
  let current = 0;
  // Today does not break a streak until it is over.
  let day = logged.has(today) ? today : addDays(today, -1);
  while (logged.has(day)) {
    current++;
    day = addDays(day, -1);
  }
  let best = 0;
  let run = 0;
  for (let i = STREAK_WINDOW_DAYS - 1; i >= 0; i--) {
    run = logged.has(addDays(today, -i)) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return { current, best: Math.max(best, current) };
}

const daysBetween = (a: string, b: string) => Math.round((parseDay(b).getTime() - parseDay(a).getTime()) / 86_400_000);

export interface Projection {
  /** Loss per week in kg over the recent weigh-ins, or null when there is too little to go on. */
  ratePerWeekKg: number | null;
  /** When the goal would be reached at that rate (YYYY-MM-DD), or null. */
  date: string | null;
  /** When the goal would be reached at the pace chosen in the profile. */
  plannedDate: string | null;
  reached: boolean;
}

/**
 * Estimates when the goal weight will be reached. The recent rate uses the
 * weigh-ins from the last six weeks and needs at least a week between the
 * first and last of them, so one unusual day does not swing the date.
 */
export function projection(weights: WeightLog[], profile: Profile, currentKg: number, today: string): Projection {
  const toGo = currentKg - profile.goalWeightKg;
  if (toGo <= 0) return { ratePerWeekKg: null, date: null, plannedDate: null, reached: true };

  const weeksToDate = (weeks: number) => (weeks > 0 && weeks < 520 ? addDays(today, Math.ceil(weeks * 7)) : null);
  const plannedDate = profile.pacePerWeekKg > 0 ? weeksToDate(toGo / profile.pacePerWeekKg) : null;

  const recent = weights.filter((w) => w.date >= addDays(today, -42));
  const first = recent[0];
  const last = recent.at(-1);
  if (!first || !last || daysBetween(first.date, last.date) < 7) {
    return { ratePerWeekKg: null, date: null, plannedDate, reached: false };
  }
  const rate = ((first.kg - last.kg) / daysBetween(first.date, last.date)) * 7;
  return {
    ratePerWeekKg: Math.round(rate * 100) / 100,
    date: rate > 0.05 ? weeksToDate(toGo / rate) : null,
    plannedDate,
    reached: false,
  };
}

export interface Milestone {
  title: string;
  detail: string;
  earned: boolean;
}

export function milestones(input: {
  entries: Entry[];
  weights: WeightLog[];
  profile: Profile;
  currentKg: number;
  best: number;
  proteinGoal: number;
  waterGoal: number;
}): Milestone[] {
  const { entries, weights, profile, currentKg, best, proteinGoal, waterGoal } = input;
  const start = profile.startWeightKg;
  const lost = start - currentKg;
  const total = start - profile.goalWeightKg;
  const food = entries.filter((e) => e.kind === "food");

  const proteinByDay = new Map<string, number>();
  for (const e of food) proteinByDay.set(e.date, (proteinByDay.get(e.date) ?? 0) + (e.protein ?? 0));
  const hitProtein = [...proteinByDay.values()].some((g) => g >= proteinGoal);
  const hitWater = Object.values(profile.water ?? {}).some((n) => n >= waterGoal);
  const activeDays = new Set(entries.filter((e) => e.kind === "exercise").map((e) => e.date)).size;

  return [
    { title: "First entry", detail: "Log your first food", earned: food.length > 0 },
    { title: "Three in a row", detail: "Log food 3 days running", earned: best >= 3 },
    { title: "A full week", detail: "Log food 7 days running", earned: best >= 7 },
    { title: "Thirty days", detail: "Log food 30 days running", earned: best >= 30 },
    { title: "On the scales", detail: "Weigh in on 4 different days", earned: weights.length >= 4 },
    { title: "Protein goal", detail: "Reach your protein goal in a day", earned: hitProtein },
    { title: "Well watered", detail: `Drink ${waterGoal} glasses of water in a day`, earned: hitWater },
    { title: "On the move", detail: "Log exercise on 5 different days", earned: activeDays >= 5 },
    { title: "First kilogram", detail: "Lose your first 1 kg", earned: lost >= 1 },
    { title: "Five percent", detail: "Lose 5% of your starting weight", earned: lost >= start * 0.05 },
    { title: "Ten percent", detail: "Lose 10% of your starting weight", earned: lost >= start * 0.1 },
    { title: "Halfway there", detail: "Get halfway to your goal weight", earned: total > 0 && lost >= total / 2 },
    { title: "Goal reached", detail: "Reach your goal weight", earned: total > 0 && currentKg <= profile.goalWeightKg },
  ];
}

import { maintenance } from "./calc";
import { addDays } from "./dates";
import type { ActivityLevel, Entry, Profile } from "./types";

/** Approximate energy in one kilogram of body fat. */
const KCAL_PER_KG_FAT = 7700;

/**
 * Walking at about 100 steps a minute is moderate activity of about 3 METs
 * (Tudor-Locke and others, 2018). Taking away the 1 MET the body uses at rest
 * leaves 2 METs of extra energy for each minute of walking.
 */
const STEPS_PER_MINUTE = 100;
const WALKING_NET_MET = 2;

/**
 * Steps already allowed for in the activity level chosen in the profile, so
 * they are not counted twice. The levels follow the step bands of Tudor-Locke
 * and Bassett (2004): under 5,000 a day is sedentary, 5,000 to 7,499 low
 * active, 7,500 to 9,999 somewhat active and 10,000 or more active.
 */
export const BASELINE_STEPS: Record<ActivityLevel, number> = {
  sedentary: 2500,
  light: 5000,
  moderate: 7500,
  active: 10000,
};

/** Rough steps taken during a logged activity, which the step count also includes. */
export function stepsInExercise(e: Pick<Entry, "name" | "minutes">) {
  const minutes = e.minutes ?? 0;
  if (/interval/i.test(e.name)) return minutes * 130;
  if (/run|jog/i.test(e.name)) return minutes * 160;
  if (/walk|hik/i.test(e.name)) return minutes * STEPS_PER_MINUTE;
  return 0;
}

/** The extra energy of exercise: the logged figure less what the body would have used at rest anyway. */
export function netExercise(e: Pick<Entry, "calories" | "minutes">, weightKg: number) {
  return Math.max(0, Math.round(e.calories - weightKg * ((e.minutes ?? 0) / 60)));
}

/** Extra energy from steps above the everyday baseline, leaving out steps from logged walks and runs. */
export function stepCalories(steps: number, baseline: number, inExercise: number, weightKg: number) {
  const counted = Math.max(0, steps - baseline - inExercise);
  return { counted, kcal: Math.round(((counted / STEPS_PER_MINUTE) * WALKING_NET_MET * weightKg) / 60) };
}

export interface DayDeficit {
  date: string;
  /** False when no food is logged, so the day cannot be counted. */
  logged: boolean;
  need: number;
  eaten: number;
  fromFood: number;
  fromExercise: number;
  fromSteps: number;
  stepsCounted: number;
  total: number;
}

export function dayDeficit(profile: Profile, entries: Entry[], date: string, weightKg: number): DayDeficit {
  const day = entries.filter((e) => e.date === date);
  const food = day.filter((e) => e.kind === "food");
  const exercise = day.filter((e) => e.kind === "exercise");
  const need = Math.round(maintenance(profile, weightKg, Number(date.slice(0, 4))) / 10) * 10;
  const eaten = food.reduce((s, e) => s + e.calories, 0);
  const fromFood = need - eaten;
  const fromExercise = exercise.reduce((s, e) => s + netExercise(e, weightKg), 0);
  const steps = profile.steps?.[date] ?? 0;
  const inExercise = exercise.reduce((s, e) => s + stepsInExercise(e), 0);
  const st = stepCalories(steps, BASELINE_STEPS[profile.activity], inExercise, weightKg);
  return {
    date,
    logged: food.length > 0,
    need,
    eaten,
    fromFood,
    fromExercise,
    fromSteps: st.kcal,
    stepsCounted: st.counted,
    total: fromFood + fromExercise + st.kcal,
  };
}

/** The seven days ending on `date`, counting only days with food logged. */
export function weekDeficit(profile: Profile, entries: Entry[], date: string, weightKg: number) {
  const days = Array.from({ length: 7 }, (_, i) => dayDeficit(profile, entries, addDays(date, i - 6), weightKg)).filter((d) => d.logged);
  const total = days.reduce((s, d) => s + d.total, 0);
  return { days: days.length, total, fatKg: total / KCAL_PER_KG_FAT };
}

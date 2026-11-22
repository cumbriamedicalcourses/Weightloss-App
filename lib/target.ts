import { activityShare, dailyTarget, maintenance } from "./calc";
import { addDays } from "./dates";
import type { Profile } from "./types";

export interface Target {
  reached: boolean;
  toGoKg: number;
  /** When the goal should be reached (YYYY-MM-DD), or null when there is no pace to go on. */
  date: string | null;
  /** Planned loss in kg a week. */
  paceKg: number;
  /** Calories a day below what the person burns, after the safety floor: food and activity together. */
  deficit: number;
  fromFood: number;
  fromActivity: number;
}

/** The person's target in one place: how far, how fast and by when. */
export function target(profile: Profile, currentKg: number, today: string): Target {
  const toGoKg = currentKg - profile.goalWeightKg;
  const year = Number(today.slice(0, 4));
  const fromFood = Math.max(0, Math.round((maintenance(profile, currentKg, year) - dailyTarget(profile, currentKg, year)) / 10) * 10);
  const fromActivity = profile.customTarget ? 0 : Math.round(activityShare(profile, currentKg) / 10) * 10;
  const deficit = fromFood + fromActivity;
  const paceKg = profile.pacePerWeekKg;
  if (toGoKg <= 0) return { reached: true, toGoKg: 0, date: null, paceKg, deficit, fromFood, fromActivity };
  const chosen = profile.targetDate && profile.targetDate > today ? profile.targetDate : null;
  const weeks = paceKg > 0 ? toGoKg / paceKg : 0;
  const date = chosen ?? (weeks > 0 && weeks < 520 ? addDays(today, Math.ceil(weeks * 7)) : null);
  return { reached: false, toGoKg, date, paceKg, deficit, fromFood, fromActivity };
}

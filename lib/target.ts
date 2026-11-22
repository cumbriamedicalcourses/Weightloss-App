import { MAX_PACE_KG, activityShare, dailyTarget, maintenance, paceForDate } from "./calc";
import { addDays, parseDay } from "./dates";
import type { Profile } from "./types";

export interface Target {
  reached: boolean;
  toGoKg: number;
  /** When the goal should be reached (YYYY-MM-DD), or null when there is no pace to go on. */
  date: string | null;
  /** Planned loss in kg a week, as used this week. */
  paceKg: number;
  /** Calories a day below what the person burns, after the safety floor: food and activity together. */
  deficit: number;
  fromFood: number;
  fromActivity: number;
  /** True when the person chose a date, so the pace is recalculated each week. */
  byDate: boolean;
  /** The chosen date can no longer be reached at a safe pace; `earliest` is the soonest that can. */
  dateAtRisk: boolean;
  earliest: string | null;
}

const daysBetween = (a: string, b: string) => Math.round((parseDay(b).getTime() - parseDay(a).getTime()) / 86_400_000);

/** The Monday of the week a day falls in. */
export function weekStart(day: string) {
  return addDays(day, -((parseDay(day).getDay() + 6) % 7));
}

/**
 * The pace the plan uses this week. With a pace chosen it is simply that.
 * With a date chosen it is whatever the remaining weight and the remaining
 * time need, worked out from the start of the week so it changes weekly and
 * not daily, and never above the safe maximum.
 */
export function livePace(profile: Profile, currentKg: number, today: string) {
  const toGo = currentKg - profile.goalWeightKg;
  if (!profile.targetDate || profile.targetDate <= today || toGo <= 0) {
    return { paceKg: profile.pacePerWeekKg, byDate: false, dateAtRisk: false };
  }
  const needed = paceForDate(currentKg, profile.goalWeightKg, daysBetween(weekStart(today), profile.targetDate));
  return {
    paceKg: Math.round(Math.min(needed, MAX_PACE_KG) * 100) / 100,
    byDate: true,
    dateAtRisk: needed > MAX_PACE_KG + 0.005,
  };
}

/** The profile with this week's pace filled in, for the calorie calculations. */
export function withLivePace(profile: Profile, currentKg: number, today: string): Profile {
  return { ...profile, pacePerWeekKg: livePace(profile, currentKg, today).paceKg };
}

/** The person's target in one place: how far, how fast and by when. */
export function target(stored: Profile, currentKg: number, today: string): Target {
  const live = livePace(stored, currentKg, today);
  const profile = { ...stored, pacePerWeekKg: live.paceKg };
  const toGoKg = currentKg - profile.goalWeightKg;
  const year = Number(today.slice(0, 4));
  const fromFood = Math.max(0, Math.round((maintenance(profile, currentKg, year) - dailyTarget(profile, currentKg, year)) / 10) * 10);
  const fromActivity = profile.customTarget ? 0 : Math.round(activityShare(profile, currentKg) / 10) * 10;
  const base = { paceKg: live.paceKg, deficit: fromFood + fromActivity, fromFood, fromActivity, byDate: live.byDate };
  if (toGoKg <= 0) return { ...base, reached: true, toGoKg: 0, date: null, dateAtRisk: false, earliest: null };
  const weeks = live.paceKg > 0 ? toGoKg / live.paceKg : 0;
  const atPace = weeks > 0 && weeks < 520 ? addDays(today, Math.ceil(weeks * 7)) : null;
  return {
    ...base,
    reached: false,
    toGoKg,
    date: live.byDate && !live.dateAtRisk ? (stored.targetDate ?? null) : atPace,
    dateAtRisk: live.dateAtRisk,
    earliest: live.dateAtRisk ? addDays(today, Math.ceil((toGoKg / MAX_PACE_KG) * 7)) : null,
  };
}

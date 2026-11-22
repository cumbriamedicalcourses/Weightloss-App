import type { ActivityLevel, Profile, WeightUnit } from "./types";

export const KG_PER_LB = 0.45359237;
/** Approximate energy in one kilogram of body fat. */
const KCAL_PER_KG = 7700;

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export const ACTIVITY_LABEL: Record<ActivityLevel, string> = {
  sedentary: "Mostly sitting",
  light: "Lightly active",
  moderate: "Moderately active",
  active: "Very active",
};

/** Basal metabolic rate, Mifflin-St Jeor equation. */
export function bmr(p: Pick<Profile, "sex" | "birthYear" | "heightCm">, weightKg: number, year: number) {
  const age = year - p.birthYear;
  const base = 10 * weightKg + 6.25 * p.heightCm - 5 * age;
  return p.sex === "male" ? base + 5 : base - 161;
}

/** Calories burned in a typical day before logged exercise. */
export function maintenance(p: Profile, weightKg: number, year: number) {
  return bmr(p, weightKg, year) * ACTIVITY_FACTOR[p.activity];
}

/** The lowest target we will suggest without medical supervision. */
export function safeFloor(sex: Profile["sex"]) {
  return sex === "male" ? 1500 : 1200;
}

export function dailyTarget(p: Profile, weightKg: number, year: number) {
  if (p.customTarget && p.customTarget > 0) return Math.round(p.customTarget);
  const deficit = (p.pacePerWeekKg * KCAL_PER_KG) / 7;
  const target = maintenance(p, weightKg, year) - deficit;
  return Math.round(Math.max(target, safeFloor(p.sex)) / 10) * 10;
}

/** The fastest loss the journal will plan for, in kg a week. */
export const MAX_PACE_KG = 1;
export const HEALTHY_BMI = { min: 18.5, max: 24.9 };

/** The weights that give a healthy BMI at this height. */
export function healthyRange(heightCm: number) {
  const m2 = (heightCm / 100) ** 2;
  return { minKg: HEALTHY_BMI.min * m2, maxKg: HEALTHY_BMI.max * m2 };
}

/**
 * Goal weights worth offering: a first target of 5% or 10% of body weight,
 * which is where most of the health benefit comes, and the top of the healthy
 * range. Nothing is suggested to someone already in the healthy range.
 */
export function goalSuggestions(currentKg: number, heightCm: number) {
  const { maxKg } = healthyRange(heightCm);
  if (!(currentKg > maxKg)) return [];
  const round = (kg: number) => Math.round(kg * 2) / 2;
  const list = [
    { label: "Lose 5%", kg: round(currentKg * 0.95) },
    { label: "Lose 10%", kg: round(currentKg * 0.9) },
    { label: "Healthy range", kg: Math.floor(maxKg * 2) / 2 },
  ].filter((s) => s.kg >= Math.floor(maxKg * 2) / 2);
  return list.filter((s, i) => list.findIndex((x) => x.kg === s.kg) === i);
}

/** Kilograms a week needed to go from one weight to another by a date. */
export function paceForDate(fromKg: number, toKg: number, days: number) {
  return days > 0 ? ((fromKg - toKg) / days) * 7 : Infinity;
}

/** The daily calorie gap that a weekly pace amounts to. */
export function deficitForPace(paceKg: number) {
  return (paceKg * KCAL_PER_KG) / 7;
}

/** Exercise energy: MET x body weight (kg) x hours. */
export function exerciseCalories(met: number, weightKg: number, minutes: number) {
  return Math.round(met * weightKg * (minutes / 60));
}

/**
 * A weight as one number in the person's unit. Stones are plotted and
 * compared in pounds, so "st" gives pounds here.
 */
export function toDisplayWeight(kg: number, unit: WeightUnit) {
  const v = unit === "kg" ? kg : kg / KG_PER_LB;
  return Math.round(v * 10) / 10;
}

export function fromDisplayWeight(value: number, unit: WeightUnit) {
  return unit === "kg" ? value : value * KG_PER_LB;
}

/** Whole stones and the pounds left over (to one decimal place). */
export function toStones(kg: number) {
  const tenths = Math.round((Math.abs(kg) / KG_PER_LB) * 10);
  return { st: Math.floor(tenths / 140), lb: (tenths % 140) / 10 };
}

export function fromStones(st: number, lb: number) {
  return (st * 14 + lb) * KG_PER_LB;
}

/**
 * A weight split for display: "82.5" + "kg", "181.9" + "lb" or "12 st" + "13.5 lb".
 * Amounts under a stone are shown in pounds alone.
 */
export function weightParts(kg: number, unit: WeightUnit): { main: string; sub: string } {
  if (unit !== "st") return { main: String(Math.abs(toDisplayWeight(kg, unit))), sub: unit };
  const { st, lb } = toStones(kg);
  return st ? { main: `${st} st`, sub: `${lb} lb` } : { main: String(lb), sub: "lb" };
}

export function formatWeight(kg: number, unit: WeightUnit) {
  const { main, sub } = weightParts(kg, unit);
  return `${main} ${sub}`;
}

export const UNIT_NAME: Record<WeightUnit, string> = {
  kg: "kilograms",
  lb: "pounds",
  st: "stones and pounds",
};

export function bmi(weightKg: number, heightCm: number) {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

/**
 * Daily protein to aim for while losing weight: 1.2 g per kg of body weight,
 * kept between 60 g and 120 g so it stays sensible at higher weights.
 */
export function proteinTarget(weightKg: number) {
  return Math.round(Math.min(120, Math.max(60, 1.2 * weightKg)) / 5) * 5;
}

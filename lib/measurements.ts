import type { Measurement, Profile, WeightUnit } from "./types";

export type Site = keyof Measurement;

export const SITES: { id: Site; label: string; how: string }[] = [
  { id: "waist", label: "Waist", how: "midway between your lowest rib and the top of your hip bone, after breathing out" },
  { id: "hips", label: "Hips", how: "around the widest part of your bottom" },
  { id: "chest", label: "Chest", how: "around the fullest part, under the arms" },
  { id: "thigh", label: "Thigh", how: "around the widest part of one thigh, the same one each time" },
  { id: "arm", label: "Upper arm", how: "around the widest part, arm relaxed, the same one each time" },
];

export type LengthUnit = "cm" | "in";
const CM_PER_INCH = 2.54;

/** People who weigh in pounds or stones measure in inches. */
export const lengthUnit = (weightUnit: WeightUnit): LengthUnit => (weightUnit === "kg" ? "cm" : "in");
export const toDisplayLength = (cm: number, unit: LengthUnit) => Math.round((unit === "cm" ? cm : cm / CM_PER_INCH) * 10) / 10;
export const fromDisplayLength = (value: number, unit: LengthUnit) => Math.round((unit === "cm" ? value : value * CM_PER_INCH) * 10) / 10;
export const formatLength = (cm: number, unit: LengthUnit) => `${toDisplayLength(cm, unit)} ${unit}`;

export interface MeasuredDay extends Measurement {
  date: string;
}

/** Every day with measurements, oldest first. */
export function measuredDays(profile: Profile | null | undefined): MeasuredDay[] {
  return Object.entries(profile?.measurements ?? {})
    .map(([date, m]) => ({ date, ...m }))
    .filter((d) => SITES.some((s) => typeof d[s.id] === "number"))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** The first and latest reading for one site, for "down 4 cm since you started". */
export function trend(days: MeasuredDay[], site: Site) {
  const readings = days.filter((d) => typeof d[site] === "number");
  if (!readings.length) return null;
  const first = readings[0];
  const latest = readings[readings.length - 1];
  return { first: first[site] as number, latest: latest[site] as number, latestDate: latest.date, count: readings.length };
}

export interface WaistBand {
  ratio: number;
  level: "low" | "healthy" | "increased" | "high";
  label: string;
  advice: string;
}

/**
 * Waist-to-height ratio with the bands NICE uses for adults with a BMI
 * under 35: 0.4 to 0.49 healthy, 0.5 to 0.59 increased risk, 0.6 or more
 * high risk. "Keep your waist to less than half your height."
 */
export function waistBand(waistCm: number, heightCm: number): WaistBand | null {
  if (!(waistCm > 0) || !(heightCm > 0)) return null;
  const ratio = Math.round((waistCm / heightCm) * 100) / 100;
  if (ratio < 0.4) return { ratio, level: "low", label: "Below the healthy range", advice: "A ratio under 0.4 can go with being underweight. Speak to your GP if you are losing weight without meaning to." };
  if (ratio < 0.5) return { ratio, level: "healthy", label: "Healthy", advice: "Your waist is less than half your height, which is where health risks are lowest." };
  if (ratio < 0.6) return { ratio, level: "increased", label: "Increased health risk", advice: "Aim to bring your waist below half your height. Every centimetre lost from the waist helps." };
  return { ratio, level: "high", label: "High health risk", advice: "A waist this size compared with your height raises the risk of type 2 diabetes, high blood pressure and heart disease. Bringing it down is one of the most useful things you can do." };
}

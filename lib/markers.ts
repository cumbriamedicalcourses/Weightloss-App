import type { Markers, Profile } from "./types";

export interface MarkerDay extends Markers {
  date: string;
}

export type Level = "good" | "watch" | "high" | "urgent";

export interface Reading {
  level: Level;
  label: string;
  advice: string;
}

const KEYS: (keyof Markers)[] = ["systolic", "diastolic", "hba1c", "totalChol", "hdl"];

/** Every day with a reading, oldest first. */
export function markerDays(profile: Profile | null | undefined): MarkerDay[] {
  return Object.entries(profile?.markers ?? {})
    .map(([date, m]) => ({ date, ...m }))
    .filter((d) => KEYS.some((k) => typeof d[k] === "number"))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** The first and the latest day that has all of the given readings. */
export function latestWith(days: MarkerDay[], ...keys: (keyof Markers)[]) {
  const have = days.filter((d) => keys.every((k) => typeof d[k] === "number"));
  if (!have.length) return null;
  return { first: have[0], latest: have[have.length - 1], count: have.length };
}

/**
 * Blood pressure against the NHS ranges, using the home-reading threshold
 * for high (135/85), since most people will be entering home readings.
 */
export function readBloodPressure(systolic: number, diastolic: number): Reading {
  if (systolic >= 180 || diastolic >= 120) {
    return { level: "urgent", label: "Very high", advice: "Rest for five minutes and measure again. If it is still this high, contact your GP surgery or NHS 111 today. Call 999 if you also have chest pain, breathlessness, a severe headache, confusion or changes in your vision." };
  }
  if (systolic >= 135 || diastolic >= 85) {
    return { level: "high", label: "High", advice: "A single high reading is not a diagnosis. Measure twice a day for a week and, if it stays at 135/85 or above, book an appointment with your GP or ask your pharmacist for a check." };
  }
  if (systolic > 120 || diastolic > 80) {
    return { level: "watch", label: "Slightly raised", advice: "Above the ideal range but below the level treated as high. Losing weight, moving more and cutting salt and alcohol all help bring it down." };
  }
  if (systolic < 90 || diastolic < 60) {
    return { level: "watch", label: "Low", advice: "Low blood pressure is often normal and harmless. Speak to your GP if you feel dizzy, faint or light-headed." };
  }
  return { level: "good", label: "Ideal", advice: "Between 90/60 and 120/80, the range the NHS describes as ideal." };
}

/** HbA1c in mmol/mol against the ranges used in the UK. */
export function readHba1c(value: number): Reading {
  if (value >= 48) {
    return { level: "high", label: "In the diabetes range", advice: "48 mmol/mol or above is the range used to diagnose type 2 diabetes. If you have not already discussed this result with your GP or nurse, please do." };
  }
  if (value >= 42) {
    return { level: "watch", label: "Raised (prediabetes range)", advice: "42 to 47 mmol/mol means a higher risk of type 2 diabetes. Losing weight is the most effective way to bring it down, and your GP can refer you to the NHS diabetes prevention programme." };
  }
  return { level: "good", label: "Normal", advice: "Below 42 mmol/mol is the normal range." };
}

/** Cholesterol in mmol/L against the NHS guide levels for healthy adults. */
export function readCholesterol(total: number, hdl: number | undefined, sex: Profile["sex"]): Reading & { nonHdl: number | null } {
  const nonHdl = hdl === undefined ? null : Math.round((total - hdl) * 10) / 10;
  const hdlFloor = sex === "female" ? 1.2 : 1.0;
  const issues: string[] = [];
  if (total > 5) issues.push("total cholesterol is above 5");
  if (nonHdl !== null && nonHdl > 4) issues.push("non-HDL (\"bad\") cholesterol is above 4");
  if (hdl !== undefined && hdl < hdlFloor) issues.push(`HDL ("good") cholesterol is below ${hdlFloor}`);
  if (!issues.length) {
    return { nonHdl, level: "good", label: "Within the guide levels", advice: "At or below the NHS guide levels for healthy adults. Your own target may be lower if you have heart disease, diabetes or take a statin." };
  }
  const list = issues.join(" and ");
  return {
    nonHdl,
    level: "watch",
    label: "Outside the guide levels",
    advice: `Your ${list} mmol/L, the NHS guide level. What matters is your overall risk of heart disease, which your GP works out from this together with your age, blood pressure and other factors.`,
  };
}

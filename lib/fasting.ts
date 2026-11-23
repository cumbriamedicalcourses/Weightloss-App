import { addDays } from "./dates";
import type { Profile } from "./types";

/** Common daily patterns: hours fasting, then hours for eating. */
export const PATTERNS = [
  { hours: 12, label: "12:12", detail: "fast for 12 hours, eat within 12" },
  { hours: 14, label: "14:10", detail: "fast for 14 hours, eat within 10" },
  { hours: 16, label: "16:8", detail: "fast for 16 hours, eat within 8" },
];
/** The journal does not plan fasts longer than this in a day. */
export const FAST_GOAL_MAX = 18;
export const FAST_GOAL_MIN = 10;
export const FAST_CHART_DAYS = 14;

export const patternLabel = (hours: number) => `${hours}:${24 - hours}`;

export interface FastDay {
  date: string;
  /** Null when nothing was entered for the day. */
  hours: number | null;
}

export interface FastingSummary {
  goal: number;
  days: FastDay[];
  entered: number;
  /** Average over the days that have an entry, or null with none. */
  average: number | null;
  daysAtGoal: number;
}

/** The fasting record for the days ending on `today`, or null when the person has not started one. */
export function fastingSummary(profile: Pick<Profile, "fasting"> | null | undefined, today: string, length = FAST_CHART_DAYS): FastingSummary | null {
  const goal = profile?.fasting?.goalHours;
  if (!goal) return null;
  const days = Array.from({ length }, (_, i) => {
    const date = addDays(today, i - (length - 1));
    const hours = profile?.fasting?.log?.[date];
    return { date, hours: typeof hours === "number" ? hours : null };
  });
  const counted = days.filter((d) => d.hours !== null);
  return {
    goal,
    days,
    entered: counted.length,
    average: counted.length ? Math.round((counted.reduce((s, d) => s + (d.hours ?? 0), 0) / counted.length) * 10) / 10 : null,
    daysAtGoal: counted.filter((d) => (d.hours ?? 0) >= goal).length,
  };
}

/** Reads typed hours such as "16" or "14.5". Returns null when it is not between 0 and 24. */
export function parseHours(text: string): number | null {
  const n = Number(text.trim().replace(",", "."));
  return text.trim() && Number.isFinite(n) && n >= 0 && n <= 24 ? Math.round(n * 2) / 2 : null;
}

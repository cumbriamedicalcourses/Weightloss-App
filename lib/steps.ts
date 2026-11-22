import { addDays } from "./dates";
import type { Profile } from "./types";

/** A realistic everyday aim. People can change it. */
export const DEFAULT_STEP_GOAL = 7000;
export const STEP_GOAL_MIN = 1000;
export const STEP_GOAL_MAX = 30000;
export const STEPS_MAX = 100000;

export const stepGoalOf = (p: Pick<Profile, "stepGoal"> | null | undefined) => p?.stepGoal ?? DEFAULT_STEP_GOAL;

export interface StepDay {
  date: string;
  /** Null when nothing was entered for the day. */
  steps: number | null;
}

export interface StepWeek {
  days: StepDay[];
  goal: number;
  /** Days with a count entered. */
  entered: number;
  /** Average over the days that have a count, or null with none. */
  average: number | null;
  daysAtGoal: number;
  total: number;
}

/** The seven days ending on `today`, oldest first. */
export function stepWeek(profile: Pick<Profile, "steps" | "stepGoal">, today: string): StepWeek {
  const goal = stepGoalOf(profile);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    const steps = profile.steps?.[date];
    return { date, steps: typeof steps === "number" ? steps : null };
  });
  const counted = days.filter((d) => d.steps !== null);
  const total = counted.reduce((s, d) => s + (d.steps ?? 0), 0);
  return {
    days,
    goal,
    entered: counted.length,
    average: counted.length ? Math.round(total / counted.length) : null,
    daysAtGoal: counted.filter((d) => (d.steps ?? 0) >= goal).length,
    total,
  };
}

/** Reads a typed number such as "8,500" or "8500". Returns null when it is not a whole number in range. */
export function parseSteps(text: string, max = STEPS_MAX): number | null {
  const n = Number(text.replace(/[,\s]/g, ""));
  return text.trim() && Number.isInteger(n) && n >= 0 && n <= max ? n : null;
}

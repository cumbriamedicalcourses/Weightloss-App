import type { ExerciseLevel } from "./types";

export const WALK = { name: "Walking, brisk", met: 4.3 };
export const STRENGTH = { name: "Strength exercises", met: 3.5 };

export interface Level {
  id: ExerciseLevel;
  label: string;
  detail: string;
  /** Minutes for each of the five brisk walks, and for each of the two strength sessions. */
  walk: number;
  strength: number;
}

// The top two levels meet the UK guidance of 150 minutes of moderate activity
// a week plus strength work on two days. The first is a way in.
export const LEVELS: Level[] = [
  { id: "none", label: "No exercise plan", detail: "all of the calorie gap comes from food", walk: 0, strength: 0 },
  { id: "starting", label: "Just starting", detail: "five 20 minute brisk walks and two short strength sessions a week", walk: 20, strength: 10 },
  { id: "building", label: "Building up", detail: "five 30 minute brisk walks and two strength sessions a week", walk: 30, strength: 15 },
  { id: "active", label: "Active", detail: "five 45 minute sessions and two strength sessions a week", walk: 45, strength: 20 },
];

export const levelOf = (id: ExerciseLevel | undefined) => LEVELS.find((l) => l.id === id) ?? LEVELS[0];

export interface Session {
  /** 0 = Monday. */
  day: number;
  name: string;
  met: number;
  minutes: number;
}

// Walks on five days, strength on two of them, and Sunday free.
const WALK_DAYS = [0, 1, 3, 4, 5];
const STRENGTH_DAYS = [1, 4];

export function sessions(id: ExerciseLevel | undefined): Session[] {
  const level = levelOf(id);
  if (!level.walk) return [];
  return [
    ...WALK_DAYS.map((day) => ({ day, ...WALK, minutes: level.walk })),
    ...STRENGTH_DAYS.map((day) => ({ day, ...STRENGTH, minutes: level.strength })),
  ].sort((a, b) => a.day - b.day);
}

export const weeklyMinutes = (id: ExerciseLevel | undefined) => sessions(id).reduce((s, x) => s + x.minutes, 0);

/**
 * Extra calories a week the plan burns, over and above resting. The resting
 * part (1 MET) is already counted in the person's daily burn.
 */
export function weeklyExtraKcal(id: ExerciseLevel | undefined, weightKg: number) {
  return sessions(id).reduce((s, x) => s + (x.met - 1) * weightKg * (x.minutes / 60), 0);
}

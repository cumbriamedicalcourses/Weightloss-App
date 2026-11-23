import type { ExerciseLevel } from "./types";

export interface Level {
  id: ExerciseLevel;
  label: string;
  detail: string;
}

// "Building up" and "Active" meet the UK guidance of 150 minutes of moderate
// activity a week (vigorous minutes count double) plus strength work on two
// days. "Just starting" is a way in.
export const LEVELS: Level[] = [
  { id: "none", label: "No exercise plan", detail: "all of the calorie gap comes from food" },
  { id: "starting", label: "Just starting", detail: "three short aerobic sessions and two short strength sessions a week" },
  { id: "building", label: "Building up", detail: "four aerobic sessions and two strength sessions a week" },
  { id: "active", label: "Active", detail: "four longer aerobic sessions and two strength sessions a week" },
];

export const levelOf = (id: ExerciseLevel | undefined) => LEVELS.find((l) => l.id === id) ?? LEVELS[0];

/** The programme changes at this age: lower impact, with balance work added. */
export const OLDER_FROM_AGE = 50;
export const isOlder = (birthYear: number, year: number) => year - birthYear >= OLDER_FROM_AGE;

export interface Session {
  /** 0 = Monday. */
  day: number;
  kind: "aerobic" | "strength";
  /** The name the session is logged under. */
  name: string;
  /** What to do, in a sentence. */
  detail: string;
  /** Energy cost from the Compendium of Physical Activities. */
  met: number;
  minutes: number;
  /** The moves for a strength session. */
  exercises?: string[];
}

type Row = [day: number, key: keyof typeof KINDS, minutes: number];

const KINDS = {
  walk: { kind: "aerobic", name: "Brisk walk", met: 4.3, detail: "Fast enough to feel warm and breathe harder, while still able to talk." },
  longWalk: { kind: "aerobic", name: "Long walk", met: 4.3, detail: "A brisk pace on a longer route. Cycling for the same time works just as well." },
  hills: { kind: "aerobic", name: "Hill walk", met: 6.0, detail: "A brisk walk on a route with hills or steps, steady on the way up." },
  intervals: { kind: "aerobic", name: "Walk and jog intervals", met: 6.0, detail: "Warm up for 5 minutes, then jog for 1 minute and walk for 2, and repeat." },
  jog: { kind: "aerobic", name: "Jog or run", met: 7.0, detail: "A steady pace you can keep up. A fast cycle or a swim for the same time works just as well." },
  lowImpact: { kind: "aerobic", name: "Swim, cycle or water aerobics", met: 6.0, detail: "Easy on the joints. Keep a pace that makes you breathe harder." },
  strength: { kind: "strength", name: "Strength training", met: 3.5, detail: "" },
  strengthBalance: { kind: "strength", name: "Strength and balance", met: 3.0, detail: "" },
} as const;

const YOUNGER_MOVES = [
  "Squats",
  "Press-ups, on your knees or toes",
  "Lunges, each leg",
  "Bent-over row with dumbbells or filled bottles",
  "Glute bridge",
  "Overhead press with dumbbells or filled bottles",
  "Plank, hold for 20 to 40 seconds",
];

const OLDER_MOVES = [
  "Sit to stand from a chair",
  "Wall press-ups",
  "Step-ups on a low step, each leg",
  "Seated row with a resistance band",
  "Glute bridge",
  "Calf raises, holding a worktop",
  "Stand on one leg, holding a worktop, 20 seconds each side",
  "Heel-to-toe walk along a worktop",
];

const SETS: Record<Exclude<ExerciseLevel, "none">, string> = {
  starting: "1 set of 8 to 10 of each, resting between moves.",
  building: "2 sets of 10 to 12 of each.",
  active: "3 sets of 10 to 12 of each, with a weight that makes the last two hard.",
};

// Aerobic work on three or four days, strength on Tuesday and Friday, Sunday free.
const YOUNGER: Record<Exclude<ExerciseLevel, "none">, Row[]> = {
  starting: [[0, "walk", 20], [1, "strength", 15], [2, "walk", 20], [4, "strength", 15], [5, "longWalk", 30]],
  building: [[0, "walk", 30], [1, "strength", 25], [2, "intervals", 20], [3, "walk", 30], [4, "strength", 25], [5, "longWalk", 45]],
  active: [[0, "jog", 30], [1, "strength", 35], [2, "walk", 45], [3, "intervals", 25], [4, "strength", 35], [5, "longWalk", 60]],
};

const OLDER: Record<Exclude<ExerciseLevel, "none">, Row[]> = {
  starting: [[0, "walk", 15], [1, "strengthBalance", 15], [2, "walk", 20], [4, "strengthBalance", 15], [5, "longWalk", 25]],
  building: [[0, "walk", 35], [1, "strengthBalance", 25], [2, "lowImpact", 30], [3, "walk", 35], [4, "strengthBalance", 25], [5, "longWalk", 50]],
  active: [[0, "walk", 45], [1, "strengthBalance", 30], [2, "lowImpact", 40], [3, "hills", 40], [4, "strengthBalance", 30], [5, "longWalk", 60]],
};

/** The week's sessions for a level. People aged 50 and over get the lower-impact version. */
export function sessions(id: ExerciseLevel | undefined, older = false): Session[] {
  if (!id || id === "none") return [];
  const rows = (older ? OLDER : YOUNGER)[id];
  return rows.map(([day, key, minutes]) => {
    const k = KINDS[key];
    if (k.kind === "aerobic") return { day, minutes, ...k };
    return { day, minutes, ...k, detail: SETS[id], exercises: older ? OLDER_MOVES : YOUNGER_MOVES };
  });
}

export const weeklyMinutes = (id: ExerciseLevel | undefined, older = false) => sessions(id, older).reduce((s, x) => s + x.minutes, 0);

/** Calories for one session at a body weight: MET x kg x hours. */
export const sessionKcal = (s: Session, weightKg: number) => Math.round(s.met * weightKg * (s.minutes / 60));

/** Calories the whole week burns if every session is done as written. */
export const weeklyKcal = (id: ExerciseLevel | undefined, weightKg: number, older = false) =>
  sessions(id, older).reduce((sum, s) => sum + sessionKcal(s, weightKg), 0);

/**
 * Extra calories a week the plan burns, over and above resting. The resting
 * part (1 MET) is already counted in the person's daily burn.
 */
export function weeklyExtraKcal(id: ExerciseLevel | undefined, weightKg: number, older = false) {
  return sessions(id, older).reduce((s, x) => s + (x.met - 1) * weightKg * (x.minutes / 60), 0);
}

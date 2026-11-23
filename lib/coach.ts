import { ACTIVITY_LABEL, bmi, proteinTarget } from "./calc";
import { addDays } from "./dates";
import { levelOf } from "./exercise-plan";
import { fastingSummary } from "./fasting";
import { measuredDays, trend } from "./measurements";
import type { Entry, Profile, WeightLog } from "./types";

export interface CoachMessage {
  role: "user" | "assistant";
  text: string;
}

/** The longest question a person can send. */
export const QUESTION_MAX = 600;
/** How many earlier messages go along with a new question, so a follow-up makes sense. */
export const HISTORY_MAX = 10;
export const COACH_DAYS = 14;

export const STARTERS = [
  "How am I doing this week?",
  "What could I have for dinner tonight?",
  "Why has my weight not moved?",
  "How can I get more protein?",
];

const kg = (n: number) => `${Math.round(n * 10) / 10} kg`;

/**
 * A short plain-text summary of the journal for the coach to read. It leaves
 * out the person's name and email address, so the question travels without them.
 */
export function coachContext(input: {
  profile: Profile;
  weights: WeightLog[];
  entries: Entry[];
  currentKg: number;
  target: number;
  today: string;
}): string {
  const { profile, weights, entries, currentKg, target, today } = input;
  const lines: string[] = [];
  const age = Number(today.slice(0, 4)) - profile.birthYear;

  lines.push(`Today: ${today}`);
  lines.push(`Person: ${profile.sex}, about ${age} years old, ${profile.heightCm} cm tall`);
  lines.push(
    `Weight: started at ${kg(profile.startWeightKg)}, now ${kg(currentKg)} (BMI ${Math.round(bmi(currentKg, profile.heightCm) * 10) / 10}), goal ${kg(profile.goalWeightKg)}`,
  );
  lines.push(`Prefers weights shown in: ${profile.weightUnit === "st" ? "stones and pounds" : profile.weightUnit}`);
  lines.push(
    `Plan: ${target} kcal a day from food, aiming to lose about ${Math.round(profile.pacePerWeekKg * 100) / 100} kg a week` +
      (profile.targetDate ? `, to reach the goal by ${profile.targetDate}` : ""),
  );
  lines.push(`Protein aim: about ${proteinTarget(currentKg)} g a day`);
  lines.push(`Everyday activity: ${ACTIVITY_LABEL[profile.activity]}. Exercise plan: ${levelOf(profile.exerciseLevel).label} (${levelOf(profile.exerciseLevel).detail})`);

  const recentWeights = weights.slice(-8);
  if (recentWeights.length) {
    lines.push(`Recent weigh-ins: ${recentWeights.map((w) => `${w.date} ${kg(w.kg)}`).join("; ")}`);
  } else {
    lines.push("Recent weigh-ins: none logged yet");
  }

  const waist = trend(measuredDays(profile), "waist");
  if (waist) lines.push(`Waist: ${waist.latest} cm on ${waist.latestDate} (first measured ${waist.first} cm)`);

  const fast = fastingSummary(profile, today, 7);
  if (fast) {
    lines.push(
      `Intermittent fasting: aims for ${fast.goal} hours a day` +
        (fast.entered ? `; last 7 days averaged ${fast.average} hours over ${fast.entered} days entered, aim reached on ${fast.daysAtGoal}` : "; no hours entered in the last 7 days"),
    );
  }

  lines.push("");
  lines.push(`Last ${COACH_DAYS} days (a day with no food logged was probably not logged, not a fast):`);
  for (let i = COACH_DAYS - 1; i >= 0; i--) {
    const day = addDays(today, -i);
    const mine = entries.filter((e) => e.date === day);
    const food = mine.filter((e) => e.kind === "food");
    const exercise = mine.filter((e) => e.kind === "exercise");
    if (!food.length && !exercise.length) {
      lines.push(`${day}: nothing logged`);
      continue;
    }
    const parts: string[] = [];
    if (food.length) {
      const kcal = Math.round(food.reduce((s, e) => s + e.calories, 0));
      const known = food.filter((e) => e.protein !== undefined);
      const protein = known.length >= food.length / 2 ? `, ${Math.round(known.reduce((s, e) => s + (e.protein ?? 0), 0))} g protein` : "";
      const units = food.reduce((s, e) => s + (e.units ?? 0), 0);
      parts.push(`${kcal} kcal${protein}${units ? `, ${Math.round(units * 10) / 10} alcohol units` : ""}`);
    } else {
      parts.push("no food logged");
    }
    if (exercise.length) {
      parts.push(`exercise: ${exercise.map((e) => `${e.name}${e.minutes ? ` ${e.minutes} min` : ""}`).join(", ")}`);
    }
    const water = profile.water?.[day];
    if (water) parts.push(`${water} glasses of water`);
    lines.push(`${day}${i === 0 ? " (today, so far)" : ""}: ${parts.join("; ")}`);
  }

  const todayFood = entries.filter((e) => e.date === today && e.kind === "food");
  if (todayFood.length) {
    lines.push("");
    lines.push("Food logged today:");
    for (const e of todayFood.slice(0, 30)) {
      lines.push(`- ${e.meal ?? "food"}: ${e.name.slice(0, 80)}${e.portion ? ` (${e.portion.slice(0, 40)})` : ""}, ${Math.round(e.calories)} kcal`);
    }
  }
  return lines.join("\n");
}

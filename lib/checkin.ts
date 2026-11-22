import { addDays } from "./dates";
import type { Entry, WeightLog } from "./types";

export interface CheckIn {
  daysLogged: number;
  /** Average calories eaten minus exercise, over the days with food logged. */
  averageNet: number;
  averageProtein: number;
  exerciseMinutes: number;
  /** Change over the week in kg (negative is a loss), or null without two weigh-ins. */
  weightChangeKg: number | null;
  wentWell: string[];
  suggestion: string;
}

/**
 * Sums up the seven days ending today and picks one thing to work on.
 * Everything is worked out on the device from the journal itself.
 */
export function weeklyCheckIn(input: {
  entries: Entry[];
  weights: WeightLog[];
  today: string;
  target: number;
  proteinGoal: number;
  /** Formats a weight in kg in the person's own unit, e.g. "0.6 kg". */
  formatWeight: (kg: number) => string;
}): CheckIn {
  const { entries, weights, today, target, proteinGoal, formatWeight } = input;
  const start = addDays(today, -6);
  const week = entries.filter((e) => e.date >= start && e.date <= today);
  const food = week.filter((e) => e.kind === "food");
  const exercise = week.filter((e) => e.kind === "exercise");

  const foodDays = new Set(food.map((e) => e.date));
  const daysLogged = foodDays.size;
  const eaten = food.reduce((s, e) => s + e.calories, 0);
  const burned = exercise.filter((e) => foodDays.has(e.date)).reduce((s, e) => s + e.calories, 0);
  const averageNet = daysLogged ? Math.round((eaten - burned) / daysLogged) : 0;
  const withProtein = food.filter((e) => e.protein !== undefined);
  const averageProtein = daysLogged ? Math.round(withProtein.reduce((s, e) => s + (e.protein ?? 0), 0) / daysLogged) : 0;
  const proteinKnown = food.length > 0 && withProtein.length >= food.length / 2;
  const exerciseMinutes = exercise.reduce((s, e) => s + (e.minutes ?? 0), 0);

  // Compare the latest weigh-in this week with the last one before the week,
  // or failing that the first one inside it.
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const inWeek = sorted.filter((w) => w.date >= start && w.date <= today);
  const before = sorted.filter((w) => w.date < start).at(-1);
  const from = before ?? inWeek[0];
  const to = inWeek.at(-1);
  const weightChangeKg = from && to && from.date !== to.date ? Math.round((to.kg - from.kg) * 10) / 10 : null;

  const wentWell: string[] = [];
  if (daysLogged >= 5) wentWell.push(`You kept your journal on ${daysLogged} of the last 7 days.`);
  if (daysLogged >= 3 && averageNet <= target + 50 && averageNet >= 1000) {
    wentWell.push(`You averaged ${averageNet.toLocaleString()} kcal a day after exercise, within your target of ${target.toLocaleString()}.`);
  }
  if (weightChangeKg !== null && weightChangeKg < 0) {
    wentWell.push(`Your weight is down ${formatWeight(-weightChangeKg)} on last week.`);
  }
  if (exerciseMinutes >= 150) wentWell.push(`You were active for ${exerciseMinutes} minutes.`);
  else if (exercise.length >= 3) wentWell.push(`You exercised ${exercise.length} times.`);
  if (proteinKnown && daysLogged >= 3 && averageProtein >= proteinGoal * 0.9) {
    wentWell.push(`You averaged ${averageProtein} g of protein a day, right on your goal.`);
  }

  let suggestion: string;
  if (daysLogged === 0) {
    suggestion = "Start by writing down one meal today. The check-in fills in as your week does.";
  } else if (daysLogged < 4) {
    suggestion = "Try to write something down every day this week, even if it is only one meal. A full week gives a much clearer picture.";
  } else if (averageNet < 1000) {
    suggestion = "Your intake looks very low. Eating too little is hard to keep up and can cost you muscle, so aim closer to your target this week.";
  } else if (averageNet > target + 100) {
    suggestion = `After exercise, you averaged ${(averageNet - target).toLocaleString()} kcal a day over your target. Find the day that ran highest and plan that meal ahead this week.`;
  } else if (weightChangeKg !== null && weightChangeKg < -1.5) {
    suggestion = "You are losing weight quickly. If you feel tired or very hungry, ease the pace a little in your profile.";
  } else if (proteinKnown && averageProtein < proteinGoal * 0.7) {
    suggestion = `Your protein averaged ${averageProtein} g against a goal of ${proteinGoal} g. Add a protein food, such as eggs, yoghurt, beans or chicken, to one more meal a day.`;
  } else if (exerciseMinutes < 60) {
    suggestion = "Add two 20 minute brisk walks this week. Movement helps your weight, your mood and your sleep.";
  } else if (weightChangeKg !== null && weightChangeKg >= 0) {
    suggestion = "Your weight held steady this week. That is normal now and then. Weigh a few foods to check your portions, and look at the trend over a month.";
  } else {
    suggestion = "Keep going exactly as you are. Steady weeks like this one are what add up.";
  }

  return { daysLogged, averageNet, averageProtein, exerciseMinutes, weightChangeKg, wentWell: wentWell.slice(0, 3), suggestion };
}

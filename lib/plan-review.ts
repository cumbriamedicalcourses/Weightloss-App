import type { CheckIn } from "./checkin";
import type { Target } from "./target";

export interface PlanReview {
  status: "reached" | "weigh" | "fast" | "onTrack" | "behind";
  title: string;
  body: string;
  /** Extra lines about changes the plan has made for this week. */
  changes: string[];
}

/**
 * The weekly look at the plan: how last week went against it, and what this
 * week asks for. Rule based, from the journal alone. It never lowers calories
 * itself beyond what the chosen date needs, and that is capped elsewhere.
 */
export function planReview(input: {
  checkIn: CheckIn;
  plan: Target;
  /** This week's food target in kcal. */
  target: number;
  plannedMinutes: number;
  formatWeight: (kg: number) => string;
  formatDate: (day: string) => string;
  goalKg: number;
  chosenDate: string | null;
}): PlanReview {
  const { checkIn, plan, target, plannedMinutes, formatWeight, formatDate, goalKg, chosenDate } = input;
  const changes: string[] = [];

  if (plan.reached) {
    return {
      status: "reached",
      title: "You have reached your target",
      body: "Well done. To hold your weight, set your goal to your current weight on the Profile page, or choose a new target.",
      changes,
    };
  }

  if (plan.dateAtRisk && chosenDate && plan.earliest) {
    changes.push(
      `${formatWeight(goalKg)} by ${formatDate(chosenDate)} would now need more than 1 kg a week, so the plan is using 1 kg a week, the fastest it will go. At that pace you would get there around ${formatDate(plan.earliest)}. You can move the date on the Profile page.`,
    );
  } else if (plan.byDate && chosenDate) {
    changes.push(
      `To reach ${formatWeight(goalKg)} by ${formatDate(chosenDate)} you need about ${formatWeight(plan.paceKg)} a week from here, so this week's food target is ${target.toLocaleString()} kcal a day.`,
    );
  }

  const change = checkIn.weightChangeKg;
  if (change === null) {
    return {
      status: "weigh",
      title: "Weigh in to update your plan",
      body: "Your plan is recalculated from your latest weight. Weigh in on the Progress page at least once a week, on the same day and at the same time if you can.",
      changes,
    };
  }

  const lost = -change;
  const planned = plan.paceKg;
  if (lost > 1.2 && lost > planned * 1.5) {
    return {
      status: "fast",
      title: `You lost ${formatWeight(lost)} this week`,
      body: "That is faster than planned. One quick week is often water and is nothing to worry about. If it carries on for two or three weeks, eat a little more or choose a gentler pace, and speak to your GP if you did not intend it.",
      changes,
    };
  }
  if (lost >= planned * 0.5 && lost > 0) {
    return {
      status: "onTrack",
      title: `On track: ${formatWeight(lost)} lost this week`,
      body: `Your plan is about ${formatWeight(planned)} a week. Keep to ${target.toLocaleString()} kcal a day${plannedMinutes ? ` and your ${plannedMinutes} minutes of exercise` : ""}.`,
      changes,
    };
  }

  const moved = lost > 0 ? `You lost ${formatWeight(lost)} this week` : change === 0 ? "Your weight held steady this week" : `Your weight went up ${formatWeight(change)} this week`;
  const title = `${moved}, against a plan of ${formatWeight(planned)}`;
  let body: string;
  if (checkIn.daysLogged < 4) {
    body = `Your journal covers ${checkIn.daysLogged} of the last 7 days, so the plan cannot see where the gap is. Log every day this week, even roughly.`;
  } else if (checkIn.averageNet > target + 100) {
    body = `You averaged ${checkIn.averageNet.toLocaleString()} kcal a day against a target of ${target.toLocaleString()}. That ${(checkIn.averageNet - target).toLocaleString()} kcal a day is the gap. Find the meal or snack where most of it comes from and plan that one ahead.`;
  } else if (plannedMinutes > 0 && checkIn.exerciseMinutes < plannedMinutes * 0.5) {
    body = `Your food was on target, but you logged ${checkIn.exerciseMinutes} of your ${plannedMinutes} planned minutes of exercise. Exercise is the extra that helps most when the scales are slow, so put this week's sessions in your diary.`;
  } else {
    body = "Your food and activity were on plan, so this is most likely normal week to week variation. Weigh a few foods to check your portions, and judge the trend over two or three weeks before changing anything.";
  }
  return { status: "behind", title, body, changes };
}

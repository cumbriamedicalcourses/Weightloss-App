"use client";

import Link from "next/link";
import { BASELINE_STEPS, dayDeficit, weekDeficit } from "@/lib/deficit";
import type { Entry, Profile } from "@/lib/types";

const kcal = (n: number) => `${n < 0 ? "−" : ""}${Math.abs(n).toLocaleString()} kcal`;

/**
 * For information only: the day's calorie deficit from food, exercise and
 * steps together. The food target does not change because of it.
 */
export default function DeficitCard({
  profile,
  entries,
  date,
  weightKg,
  isToday,
}: {
  profile: Profile;
  entries: Entry[];
  date: string;
  weightKg: number;
  isToday: boolean;
}) {
  const day = dayDeficit(profile, entries, date, weightKg);
  if (!day.logged) return null;
  const week = weekDeficit(profile, entries, date, weightKg);
  const baseline = BASELINE_STEPS[profile.activity];
  const steps = profile.steps?.[date];

  return (
    <section className="card mt-6 p-5" aria-label="Calorie deficit">
      <h2 className="font-semibold text-ink">{isToday ? "Today's deficit" : "Deficit for this day"}</h2>
      <p className="mt-1 text-sm text-muted">
        Your body uses about {day.need.toLocaleString()} kcal on a usual day.{isToday ? " Today is not over yet, so this will change as you log." : ""}
      </p>
      <dl className="mt-3 space-y-2">
        <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
          <dt className="text-ink">
            From food
            <span className="block text-xs text-muted">{day.need.toLocaleString()} used − {day.eaten.toLocaleString()} eaten</span>
          </dt>
          <dd className="shrink-0 whitespace-nowrap tabular-nums text-ink">{kcal(day.fromFood)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
          <dt className="text-ink">
            From exercise
            <span className="block text-xs text-muted">The extra burn only, above what your body uses at rest</span>
          </dt>
          <dd className="shrink-0 whitespace-nowrap tabular-nums text-leaf">{kcal(day.fromExercise)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
          <dt className="text-ink">
            From steps
            <span className="block text-xs text-muted">
              {steps
                ? day.stepsCounted
                  ? `${day.stepsCounted.toLocaleString()} steps above your usual ${baseline.toLocaleString()}, not counting logged walks or runs`
                  : `No steps above your usual ${baseline.toLocaleString()}`
                : "No steps entered for this day"}
            </span>
          </dt>
          <dd className="shrink-0 whitespace-nowrap tabular-nums text-leaf">{kcal(day.fromSteps)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-1">
          <dt className="font-semibold text-ink">Total</dt>
          <dd className={`font-display text-2xl tabular-nums ${day.total < 0 ? "text-clay" : "text-ink"}`}>{kcal(day.total)}</dd>
        </div>
      </dl>
      {week.days > 1 ? (
        <p className="mt-3 rounded-xl bg-leaf-soft px-4 py-3 text-sm text-ink">
          Last 7 days ({week.days} days logged): {kcal(week.total)}
          {week.total > 0 ? `, roughly ${(Math.round(week.fatKg * 10) / 10).toFixed(1)} kg of body fat` : ""}.
        </p>
      ) : null}
      <p className="mt-3 text-xs text-muted">
        Exercise and step calories are estimates. Don&rsquo;t eat them back: your food target stays the same.{" "}
        <Link href="/how-we-calculate#deficit" className="font-semibold text-leaf underline-offset-4 hover:underline">
          How this is worked out
        </Link>
      </p>
    </section>
  );
}

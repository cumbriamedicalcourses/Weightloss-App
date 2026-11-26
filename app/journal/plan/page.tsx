"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatWeight, proteinTarget } from "@/lib/calc";
import { weeklyCheckIn } from "@/lib/checkin";
import { planReview } from "@/lib/plan-review";
import { addDays, dayKey, parseDay } from "@/lib/dates";
import { OLDER_FROM_AGE, isOlder, levelOf, sessionKcal, sessions, weeklyKcal, weeklyMinutes } from "@/lib/exercise-plan";
import { useJournal } from "@/lib/journal";
import { DAY_NAMES, nearestBand } from "@/lib/plans";
import { store } from "@/lib/store";
import { target as planTarget } from "@/lib/target";
import type { Entry } from "@/lib/types";

export default function PlanPage() {
  const { user, profile, weights, currentKg, target } = useJournal();
  const today = dayKey();
  // Monday is day 0 in the plan; JavaScript counts from Sunday.
  const todayIndex = (parseDay(today).getDay() + 6) % 7;
  const monday = addDays(today, -todayIndex);
  const [week, setWeek] = useState<Entry[]>([]);

  const [recent, setRecent] = useState<Entry[]>([]);

  useEffect(() => store.watchEntries(user.uid, monday, addDays(monday, 6), setWeek), [user.uid, monday]);
  // The review looks back over the last seven days, which can cross into last week.
  const from = addDays(today, -6);
  useEffect(() => store.watchEntries(user.uid, from, today, setRecent), [user.uid, from, today]);

  const unit = profile?.weightUnit ?? "kg";
  const review = useMemo(() => {
    if (!profile) return null;
    const plan = planTarget(profile, currentKg, today);
    const longDate = (d: string) => parseDay(d).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
    return planReview({
      checkIn: weeklyCheckIn({
        entries: recent,
        weights,
        today,
        target,
        proteinGoal: proteinTarget(currentKg),
        formatWeight: (kg) => formatWeight(kg, unit),
      }),
      plan,
      target,
      plannedMinutes: weeklyMinutes(profile.exerciseLevel, isOlder(profile.birthYear, new Date().getFullYear())),
      formatWeight: (kg) => formatWeight(kg, unit),
      formatDate: longDate,
      goalKg: profile.goalWeightKg,
      chosenDate: profile.targetDate ?? null,
    });
  }, [profile, recent, weights, today, target, currentKg, unit]);

  if (!profile) return null;

  const plan = planTarget(profile, currentKg, today);
  const level = levelOf(profile.exerciseLevel);
  const older = isOlder(profile.birthYear, new Date().getFullYear());
  const list = sessions(profile.exerciseLevel, older);
  const planned = weeklyMinutes(profile.exerciseLevel, older);
  const aerobicMinutes = list.filter((s) => s.kind === "aerobic").reduce((n, s) => n + s.minutes, 0);
  const plannedKcal = weeklyKcal(profile.exerciseLevel, currentKg, older);
  const exercise = week.filter((e) => e.kind === "exercise");
  const done = exercise.reduce((s, e) => s + (e.minutes ?? 0), 0);
  const longDate = (d: string) => parseDay(d).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

  // A session counts as done once enough matching entries are logged this week.
  const logged = (name: string) => exercise.filter((e) => e.name === name).length;
  const seen: Record<string, number> = {};

  return (
    <>
      <Link href="/journal" className="text-sm font-semibold text-leaf hover:underline">
        ‹ Today
      </Link>
      <h1 className="mt-2 font-display text-2xl text-ink">Your plan</h1>

      {review ? (
        <section
          className={`mt-4 rounded-2xl border p-5 ${review.status === "behind" || review.status === "fast" ? "border-clay/40 bg-clay-soft" : "border-leaf/40 bg-leaf-soft"}`}
          aria-label="This week's update"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">This week&apos;s update</p>
          <h2 className="mt-1 font-semibold text-ink">{review.title}</h2>
          <p className="mt-1 text-ink">{review.body}</p>
          {review.changes.map((c) => (
            <p key={c} className="mt-2 text-sm text-ink">{c}</p>
          ))}
        </section>
      ) : null}

      <section className="card mt-4 p-5" aria-label="Target">
        <h2 className="font-semibold text-ink">Target</h2>
        {plan.reached ? (
          <p className="mt-1 text-ink">You have reached {formatWeight(profile.goalWeightKg, unit)}. Well done.</p>
        ) : (
          <>
            <p className="mt-1 font-display text-2xl text-leaf">
              {formatWeight(profile.goalWeightKg, unit)}
              {plan.date ? ` by ${longDate(plan.date)}` : ""}
            </p>
            <p className="mt-1 text-muted">
              You are {formatWeight(currentKg, unit)} now, with {formatWeight(plan.toGoKg, unit)} to go
              {plan.paceKg > 0 ? ` at about ${formatWeight(plan.paceKg, unit)} a week` : ""}.
            </p>
          </>
        )}
        <Link href="/journal/profile" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-leaf hover:underline">
          Change my target or plan
        </Link>
      </section>

      {plan.deficit > 0 ? (
        <section className="card mt-4 p-5" aria-label="Calorie gap">
          <h2 className="font-semibold text-ink">Your daily calorie gap</h2>
          <p className="text-sm text-muted">How far below what you burn your food target puts you each day.</p>
          <dl className="mt-4 grid grid-cols-2 text-center">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">From food</dt>
              <dd className="mt-0.5 font-display text-2xl tabular-nums text-ink">{plan.fromFood} kcal</dd>
            </div>
            <div className="border-l border-line">
              <dt className="text-xs uppercase tracking-wide text-muted">Exercise, extra</dt>
              <dd className="mt-0.5 font-display text-2xl tabular-nums text-leaf">
                {plan.fromActivity > 0 ? `about ${plan.fromActivity} kcal` : "none yet"}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-muted">
            Your exercise is a bonus on top and does not change your food target. These figures are estimates, and
            people differ, so your weekly weigh-in is the real guide.{" "}
            <Link href="/how-we-calculate#target" className="font-semibold text-leaf underline-offset-4 hover:underline">
              How we calculate this
            </Link>
          </p>
        </section>
      ) : null}

      <section className="card mt-4 p-5" aria-label="Food plan">
        <h2 className="font-semibold text-ink">Food</h2>
        <ul className="mt-2 space-y-1.5 text-ink">
          <li>Eat about <strong>{target.toLocaleString()} kcal</strong> a day.</li>
          <li>Aim for <strong>{proteinTarget(currentKg)} g of protein</strong> a day to protect your muscle.</li>
          <li>The {nearestBand(target).toLocaleString()} kcal meal plan is the closest fit.</li>
        </ul>
        <Link href="/journal/plans" className="btn-quiet mt-4 w-full">
          Open the meal plans
        </Link>
      </section>

      <section className="card mt-4 p-5" aria-label="Exercise plan">
        <h2 className="font-semibold text-ink">Exercise</h2>
        {!list.length ? (
          <>
            <p className="mt-1 text-muted">
              You have not chosen an exercise plan, so all of your calorie gap comes from food. Adding one is a bonus on
              top and helps your heart, mood and sleep.
            </p>
            <Link href="/journal/profile" className="btn-quiet mt-4 w-full">
              Choose an exercise plan
            </Link>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">
              {level.label}, the programme for {older ? `people aged ${OLDER_FROM_AGE} and over` : `people under ${OLDER_FROM_AGE}`}:{" "}
              {aerobicMinutes} minutes of aerobic exercise and {planned - aerobicMinutes} minutes of strength training a week.
            </p>
            <p className="mt-3 rounded-xl bg-leaf-soft px-3.5 py-2.5 text-ink">
              Follow it exactly and you burn about <strong className="tabular-nums">{plannedKcal.toLocaleString()} kcal</strong> a week
              at your current weight. This is an estimate, and it is a bonus: your food target stays the same.
            </p>
            <div
              className="mt-4 h-2.5 overflow-hidden rounded-full bg-leaf-soft"
              role="progressbar"
              aria-valuenow={Math.min(done, planned)}
              aria-valuemin={0}
              aria-valuemax={planned}
              aria-label="Exercise minutes logged this week"
            >
              <div className="h-full rounded-full bg-leaf" style={{ width: `${Math.min(100, (done / planned) * 100)}%` }} />
            </div>
            <p className="mt-1.5 text-sm tabular-nums text-muted">
              {done} of {planned} minutes logged this week
            </p>
            <ul className="mt-3 divide-y divide-line">
              {list.map((s) => {
                const nth = (seen[s.name] = (seen[s.name] ?? 0) + 1);
                const isDone = logged(s.name) >= nth;
                return (
                  <li key={`${s.day}|${s.name}`} className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-muted">
                          {DAY_NAMES[s.day]}
                          {s.day === todayIndex ? " (today)" : ""}
                        </p>
                        <p className={`font-semibold ${isDone ? "text-muted line-through" : "text-ink"}`}>
                          {s.name}, {s.minutes} minutes
                        </p>
                        <p className="text-sm tabular-nums text-muted">about {sessionKcal(s, currentKg)} kcal</p>
                      </div>
                      {isDone ? (
                        <span className="text-sm font-semibold text-leaf">Done</span>
                      ) : (
                        <button
                          type="button"
                          className="min-h-11 rounded-xl border border-line px-3 text-sm font-semibold text-leaf hover:border-leaf"
                          onClick={() =>
                            void store.addEntry(user.uid, {
                              date: today,
                              kind: "exercise",
                              name: s.name,
                              minutes: s.minutes,
                              calories: sessionKcal(s, currentKg),
                              source: "plan",
                            })
                          }
                        >
                          I did this
                        </button>
                      )}
                    </div>
                    {s.exercises ? (
                      <details className="mt-1">
                        <summary className="min-h-11 cursor-pointer py-2.5 text-sm font-semibold text-leaf">Show the exercises</summary>
                        <p className="text-sm text-ink">{s.detail}</p>
                        <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-sm text-ink">
                          {s.exercises.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ol>
                      </details>
                    ) : (
                      <p className="mt-1 text-sm text-muted">{s.detail}</p>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-sm text-muted">
              The days not listed are rest days. Start each session with 5 minutes of easy movement, and stop if you
              feel pain, chest tightness or dizziness. Speak to your GP before starting if you have a heart condition, chest
              pain, dizziness, a joint problem, or are pregnant.
            </p>
          </>
        )}
      </section>
    </>
  );
}

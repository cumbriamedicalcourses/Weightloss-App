"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { WeightInput } from "@/components/weight-input";
import { UNIT_NAME, bmi, formatWeight, proteinTarget, toDisplayWeight, weightParts } from "@/lib/calc";
import { weeklyCheckIn } from "@/lib/checkin";
import { WATER_GOAL, WEEKLY_UNIT_GUIDE } from "@/lib/drinks";
import { addDays, dayKey, parseDay, shortDay } from "@/lib/dates";
import { useJournal } from "@/lib/journal";
import { store } from "@/lib/store";
import type { Entry, WeightLog, WeightUnit } from "@/lib/types";

function WeightChart({ points, goal, unit }: { points: WeightLog[]; goal: number; unit: WeightUnit }) {
  const W = 560;
  const H = 220;
  const pad = { l: unit === "st" ? 62 : 44, r: 12, t: 14, b: 28 };
  const values = points.map((p) => toDisplayWeight(p.kg, unit));
  const g = toDisplayWeight(goal, unit);
  const lo = Math.floor(Math.min(...values, g) - 1);
  const hi = Math.ceil(Math.max(...values, g) + 1);
  const t0 = parseDay(points[0].date).getTime();
  const t1 = parseDay(points.at(-1)!.date).getTime();
  const x = (d: string) =>
    t1 === t0 ? (pad.l + W - pad.r) / 2 : pad.l + ((parseDay(d).getTime() - t0) / (t1 - t0)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + ((hi - v) / (hi - lo)) * (H - pad.t - pad.b);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)},${y(values[i]).toFixed(1)}`).join(" ");
  // Stones are plotted in pounds and labelled in stones and pounds.
  const tick = (v: number) => {
    if (unit !== "st") return String(Math.round(v * 10) / 10);
    const lbs = Math.round(v);
    return `${Math.floor(lbs / 14)} st ${lbs % 14}`;
  };
  const fmt = (d: string) => parseDay(d).toLocaleDateString(undefined, { day: "numeric", month: "short" });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Weight from ${formatWeight(points[0].kg, unit)} on ${fmt(points[0].date)} to ${formatWeight(points.at(-1)!.kg, unit)} on ${fmt(points.at(-1)!.date)}. Goal ${formatWeight(goal, unit)}.`}
    >
      {[hi, (hi + lo) / 2, lo].map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="stroke-line" strokeWidth="1" />
          <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" className="fill-muted text-[12px] tabular-nums">
            {tick(v)}
          </text>
        </g>
      ))}
      <line x1={pad.l} x2={W - pad.r} y1={y(g)} y2={y(g)} className="stroke-clay" strokeWidth="1.5" strokeDasharray="5 5" />
      <text x={W - pad.r} y={y(g) - 6} textAnchor="end" className="fill-clay text-[12px]">Goal</text>
      <path d={path} fill="none" className="stroke-leaf" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={p.date} cx={x(p.date)} cy={y(values[i])} r="4" className="fill-card stroke-leaf" strokeWidth="2.5" />
      ))}
      <text x={pad.l} y={H - 6} className="fill-muted text-[12px]">{fmt(points[0].date)}</text>
      {points.length > 1 ? (
        <text x={W - pad.r} y={H - 6} textAnchor="end" className="fill-muted text-[12px]">{fmt(points.at(-1)!.date)}</text>
      ) : null}
    </svg>
  );
}

export default function ProgressPage() {
  const { user, profile, weights, currentKg, target } = useJournal();
  const unit = profile?.weightUnit ?? "kg";
  const today = dayKey();
  const weekStart = addDays(today, -6);
  const [kgIn, setKgIn] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState("");
  const [week, setWeek] = useState<Entry[]>([]);

  useEffect(() => store.watchEntries(user.uid, weekStart, today, setWeek), [user.uid, weekStart, today]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const list = week.filter((e) => e.date === date);
      const eaten = list.filter((e) => e.kind === "food").reduce((s, e) => s + e.calories, 0);
      const burned = list.filter((e) => e.kind === "exercise").reduce((s, e) => s + e.calories, 0);
      return { date, net: eaten - burned, logged: list.length > 0 };
    });
  }, [week, weekStart]);

  const checkIn = useMemo(
    () =>
      weeklyCheckIn({
        entries: week,
        weights,
        today,
        target,
        proteinGoal: proteinTarget(currentKg),
        formatWeight: (kg) => formatWeight(kg, unit),
      }),
    [week, weights, today, target, currentKg, unit],
  );

  if (!profile) return null;

  const waterDays = days.filter((d) => (profile.water?.[d.date] ?? 0) >= WATER_GOAL - 2).length;
  const lost = profile.startWeightKg - currentKg;
  const toGo = currentKg - profile.goalWeightKg;
  const now = weightParts(currentKg, unit);
  const lostParts = weightParts(lost, unit);
  const toGoParts = weightParts(toGo, unit);
  const scale = Math.max(target, ...days.map((d) => d.net), 1) * 1.1;

  function submit(e: FormEvent) {
    e.preventDefault();
    const kg = kgIn ?? 0;
    if (!(kg >= 35 && kg <= 350)) {
      setError(`Enter your weight in ${UNIT_NAME[unit]}.`);
      return;
    }
    setError("");
    void store.setWeight(user.uid, { date: today, kg: Math.round(kg * 100) / 100 });
    setKgIn(null);
    setFormKey((k) => k + 1);
  }

  return (
    <>
      <h1 className="font-display text-3xl text-ink">Progress</h1>

      <section className="card mt-4 grid grid-cols-3 p-5 text-center">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Now</p>
          <p className="mt-0.5 font-display text-2xl tabular-nums text-ink">{now.main}</p>
          <p className="text-xs text-muted">{now.sub}</p>
        </div>
        <div className="border-x border-line">
          <p className="text-xs uppercase tracking-wide text-muted">{lost >= 0 ? "Lost" : "Gained"}</p>
          <p className={`mt-0.5 font-display text-2xl tabular-nums ${lost >= 0 ? "text-leaf" : "text-clay"}`}>
            {lostParts.main}
          </p>
          <p className="text-xs text-muted">{lostParts.sub}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">{toGo > 0 ? "To go" : "Past goal"}</p>
          <p className="mt-0.5 font-display text-2xl tabular-nums text-ink">{toGoParts.main}</p>
          <p className="text-xs text-muted">{toGoParts.sub}</p>
        </div>
      </section>

      <section className="card mt-4 p-5" aria-label="Weekly check-in">
        <h2 className="font-semibold text-ink">Your week</h2>
        <p className="text-sm text-muted">The last 7 days, from your journal.</p>
        <dl className="mt-4 grid grid-cols-3 text-center">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Days logged</dt>
            <dd className="mt-0.5 text-lg tabular-nums text-ink">{checkIn.daysLogged} / 7</dd>
          </div>
          <div className="border-x border-line">
            <dt className="text-xs uppercase tracking-wide text-muted">Net kcal a day</dt>
            <dd className="mt-0.5 text-lg tabular-nums text-ink">
              {checkIn.daysLogged ? checkIn.averageNet.toLocaleString() : "–"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Weight</dt>
            <dd
              className={`mt-0.5 text-lg tabular-nums ${
                checkIn.weightChangeKg === null ? "text-ink" : checkIn.weightChangeKg <= 0 ? "text-leaf" : "text-clay"
              }`}
            >
              {checkIn.weightChangeKg === null
                ? "–"
                : `${checkIn.weightChangeKg > 0 ? "+" : checkIn.weightChangeKg < 0 ? "−" : ""}${formatWeight(checkIn.weightChangeKg, unit)}`}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-muted">
          Water: {waterDays} of 7 days at 6 glasses or more.
          {checkIn.alcoholUnits
            ? ` Alcohol: ${checkIn.alcoholUnits} ${checkIn.alcoholUnits === 1 ? "unit" : "units"} this week${
                checkIn.alcoholUnits > WEEKLY_UNIT_GUIDE
                  ? `, which is over the ${WEEKLY_UNIT_GUIDE} a week that UK guidance advises as an upper limit.`
                  : ` (UK guidance is no more than ${WEEKLY_UNIT_GUIDE}).`
              }`
            : ""}
        </p>
        {checkIn.wentWell.length ? (
          <>
            <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-muted">What went well</h3>
            <ul className="mt-2 space-y-1.5 text-ink">
              {checkIn.wentWell.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-leaf" aria-hidden>✓</span>
                  {line}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-muted">One thing for this week</h3>
        <p className="mt-2 rounded-xl bg-leaf-soft px-3.5 py-3 text-ink">{checkIn.suggestion}</p>
      </section>

      <section className="card mt-4 p-5">
        <h2 className="font-semibold text-ink">Weight</h2>
        {weights.length ? (
          <div className="mt-3">
            <WeightChart points={weights} goal={profile.goalWeightKg} unit={unit} />
          </div>
        ) : null}
        {weights.length < 2 ? (
          <p className="mt-2 text-sm text-muted">Weigh in on another day and your line starts here.</p>
        ) : null}
        <form onSubmit={submit} className="mt-4 flex items-end gap-3">
          <div className="flex-1">
            <WeightInput key={formKey} id="weigh-in" label="Today's weight" unit={unit} kg={null} onChange={setKgIn} />
          </div>
          <button className="btn" disabled={kgIn === null}>Save</button>
        </form>
        {error ? <p className="mt-2 text-sm text-clay" role="alert">{error}</p> : null}
        <p className="mt-3 text-sm text-muted">
          BMI {bmi(currentKg, profile.heightCm).toFixed(1)}. Weigh in at the same time of day for a fair comparison.
        </p>
      </section>

      <section className="card mt-4 p-5">
        <h2 className="font-semibold text-ink">Last 7 days</h2>
        <p className="text-sm text-muted">Calories eaten minus exercise, against your target of {target.toLocaleString()}.</p>
        <div className="relative mt-5">
          <div
            className="absolute inset-x-0 border-t-2 border-dashed border-clay/60"
            style={{ bottom: `calc(1.75rem + ${(target / scale) * 8}rem)` }}
            aria-hidden
          />
          <ul className="flex items-end gap-2">
            {days.map((d) => {
              const h = d.logged ? Math.max(0.25, (Math.max(d.net, 0) / scale) * 8) : 0;
              const over = d.net > target;
              return (
                <li key={d.date} className="flex flex-1 flex-col items-center">
                  <div className="flex h-32 w-full items-end">
                    <div
                      className={`w-full rounded-t-md ${over ? "bg-clay" : "bg-leaf"}`}
                      style={{ height: `${h}rem` }}
                      title={d.logged ? `${d.net} kcal` : "Nothing logged"}
                    />
                  </div>
                  <span className="mt-1 h-6 text-xs text-muted">{shortDay(d.date)}</span>
                  <span className="sr-only">{d.logged ? `${d.net} calories` : "nothing logged"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}

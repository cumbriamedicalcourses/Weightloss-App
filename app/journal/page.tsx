"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AddExercise from "@/components/add-exercise";
import AddDrink from "@/components/add-drink";
import AddFood from "@/components/add-food";
import SaveMeal from "@/components/save-meal";
import { addDays, dayKey, friendlyDay, parseDay } from "@/lib/dates";
import { target as planTarget } from "@/lib/target";
import { formatWeight, proteinTarget } from "@/lib/calc";
import { WATER_GOAL, totalUnits } from "@/lib/drinks";
import { useJournal } from "@/lib/journal";
import { store } from "@/lib/store";
import type { Entry, Meal } from "@/lib/types";

const MEAL_LABEL: Record<Meal, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};
const MEAL_ORDER: Meal[] = ["breakfast", "lunch", "dinner", "snack"];

function Row({ entry, onDelete }: { entry: Entry; onDelete: () => void }) {
  const base = entry.kind === "exercise" ? (entry.minutes ? `${entry.minutes} minutes` : "") : entry.portion;
  const detail = entry.units ? [base, `${entry.units} ${entry.units === 1 ? "unit" : "units"}`].filter(Boolean).join(" · ") : base;
  return (
    <li className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-ink">{entry.name}</p>
        {detail ? <p className="text-sm text-muted">{detail}</p> : null}
      </div>
      <span className={`tabular-nums ${entry.kind === "exercise" ? "text-leaf" : "text-ink"}`}>
        {entry.kind === "exercise" ? "−" : ""}
        {entry.calories}
      </span>
      <button
        type="button"
        aria-label={`Delete ${entry.name}`}
        className="-mr-2 flex size-11 items-center justify-center rounded-lg text-xl leading-none text-muted hover:text-clay"
        onClick={onDelete}
      >
        ×
      </button>
    </li>
  );
}

export default function TodayPage() {
  const { user, profile, target, currentKg } = useJournal();
  const [date, setDate] = useState(dayKey);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [sheet, setSheet] = useState<"food" | "exercise" | "drink" | null>(null);

  const [saving, setSaving] = useState<Meal | null>(null);
  const [dayBefore, setDayBefore] = useState<Entry[]>([]);

  useEffect(() => store.watchEntries(user.uid, date, date, setEntries), [user.uid, date]);
  useEffect(() => {
    const prev = addDays(date, -1);
    return store.watchEntries(user.uid, prev, prev, setDayBefore);
  }, [user.uid, date]);

  if (!profile) return null;

  const list = entries ?? [];
  const food = list.filter((e) => e.kind === "food");
  const exercise = list.filter((e) => e.kind === "exercise");
  const eaten = food.reduce((s, e) => s + e.calories, 0);
  const burned = exercise.reduce((s, e) => s + e.calories, 0);
  // Exercise is part of the plan, so it is not added back to the food allowance.
  const allowance = target;
  const left = allowance - eaten;
  const over = left < 0;
  const pct = allowance > 0 ? Math.min(100, Math.round((eaten / allowance) * 100)) : 0;
  const isToday = date === dayKey();
  const unit = profile.weightUnit;
  const plan = planTarget(profile, currentKg, dayKey());

  const sum = (k: "protein" | "carbs" | "fat") => Math.round(food.reduce((s, e) => s + (e[k] ?? 0), 0));
  const protein = sum("protein");
  const proteinGoal = proteinTarget(currentKg);
  const withoutMacros = food.filter((e) => !e.units && e.protein === undefined && e.carbs === undefined && e.fat === undefined).length;
  const units = totalUnits(food);
  const water = profile.water?.[date] ?? 0;
  const setWater = (n: number) => void store.setWater(user.uid, date, Math.max(0, Math.min(20, n)));
  const toCopy = dayBefore.filter((e) => e.kind === "food");

  function copyDayBefore() {
    for (const e of toCopy) {
      void store.addEntry(user.uid, {
        date,
        kind: "food",
        name: e.name,
        calories: e.calories,
        meal: e.meal,
        portion: e.portion,
        protein: e.protein,
        carbs: e.carbs,
        fat: e.fat,
        source: "copy",
      });
    }
  }

  function go(n: number) {
    setEntries(null);
    setDate((d) => addDays(d, n));
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Previous day" className="flex size-11 items-center justify-center rounded-lg text-2xl text-muted hover:text-ink" onClick={() => go(-1)}>
          ‹
        </button>
        <h1 className="font-display text-2xl text-ink">{friendlyDay(date)}</h1>
        <button
          type="button"
          aria-label="Next day"
          disabled={isToday}
          className="flex size-11 items-center justify-center rounded-lg text-2xl text-muted hover:text-ink disabled:opacity-30"
          onClick={() => go(1)}
        >
          ›
        </button>
      </div>

      <section className="mt-4 rounded-2xl bg-leaf px-5 py-4 text-white" aria-label="Your target">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm text-white/80">Your target</p>
          <Link href="/journal/plan" className="text-sm font-semibold text-white underline underline-offset-4">
            Your plan
          </Link>
        </div>
        {plan.reached ? (
          <p className="mt-1 font-display text-2xl">You have reached {formatWeight(profile.goalWeightKg, unit)}. Well done.</p>
        ) : (
          <>
            <p className="mt-1 font-display text-2xl">
              {formatWeight(profile.goalWeightKg, unit)}
              {plan.date
                ? ` by ${parseDay(plan.date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}`
                : ""}
            </p>
            <p className="mt-1 text-sm text-white/90">
              {formatWeight(plan.toGoKg, unit)} to go
              {plan.paceKg > 0 ? ` · about ${formatWeight(plan.paceKg, unit)} a week` : ""}
              {plan.deficit > 0 ? ` · ${plan.deficit.toLocaleString()} kcal a day below what you burn` : ""}
              {plan.fromActivity > 0 ? ` (${plan.fromFood} from food, ${plan.fromActivity} from activity)` : ""}
            </p>
          </>
        )}
      </section>

      <section className="card mt-4 p-5" aria-label="Calories for the day">
        <p className="text-sm text-muted">{over ? "Over today's target by" : "Left today"}</p>
        <p className={`font-display text-6xl tabular-nums ${over ? "text-clay" : "text-leaf"}`}>
          {Math.abs(left).toLocaleString()}
          <span className="ml-2 text-lg text-muted">kcal</span>
        </p>
        <div
          className="mt-4 h-2.5 overflow-hidden rounded-full bg-leaf-soft"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Share of today's calories eaten"
        >
          <div className={`h-full rounded-full ${over ? "bg-clay" : "bg-leaf"}`} style={{ width: `${pct}%` }} />
        </div>
        <dl className="mt-4 grid grid-cols-3 text-center">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Target</dt>
            <dd className="mt-0.5 text-lg tabular-nums text-ink">{target.toLocaleString()}</dd>
          </div>
          <div className="border-x border-line">
            <dt className="text-xs uppercase tracking-wide text-muted">Eaten</dt>
            <dd className="mt-0.5 text-lg tabular-nums text-ink">{eaten.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Exercise</dt>
            <dd className="mt-0.5 text-lg tabular-nums text-leaf">{burned.toLocaleString()}</dd>
          </div>
        </dl>
        {burned ? (
          <p className="mt-3 text-xs text-muted">
            Exercise counts towards your plan and is not added to your food allowance.
          </p>
        ) : null}
      </section>

      {food.length ? (
        <section className="card mt-3 p-4" aria-label="Protein, carbs and fat for the day">
          <dl className="grid grid-cols-3 text-center">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Protein</dt>
              <dd className="mt-0.5 tabular-nums text-ink">
                <span className="text-lg">{protein}</span>
                <span className="text-sm text-muted"> / {proteinGoal} g</span>
              </dd>
            </div>
            <div className="border-x border-line">
              <dt className="text-xs uppercase tracking-wide text-muted">Carbs</dt>
              <dd className="mt-0.5 tabular-nums text-ink">
                <span className="text-lg">{sum("carbs")}</span>
                <span className="text-sm text-muted"> g</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Fat</dt>
              <dd className="mt-0.5 tabular-nums text-ink">
                <span className="text-lg">{sum("fat")}</span>
                <span className="text-sm text-muted"> g</span>
              </dd>
            </div>
          </dl>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-leaf-soft"
            role="progressbar"
            aria-valuenow={Math.min(100, Math.round((protein / proteinGoal) * 100))}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Share of today's protein goal eaten"
          >
            <div className="h-full rounded-full bg-leaf" style={{ width: `${Math.min(100, (protein / proteinGoal) * 100)}%` }} />
          </div>
          {withoutMacros ? (
            <p className="mt-2 text-xs text-muted">
              {withoutMacros === 1 ? "1 food has" : `${withoutMacros} foods have`} no protein, carbs or fat figures, so these totals may be low.
            </p>
          ) : null}
        </section>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button type="button" className="btn" onClick={() => setSheet("food")}>Add food</button>
        <button type="button" className="btn-quiet" onClick={() => setSheet("exercise")}>Add exercise</button>
      </div>

      <section className="card mt-3 p-4" aria-label="Water and alcohol for the day">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-ink">
              Water <span className="tabular-nums text-muted">{water} of {WATER_GOAL} glasses</span>
            </p>
            <div className="mt-2 flex gap-1" aria-hidden>
              {Array.from({ length: WATER_GOAL }, (_, i) => (
                <span key={i} className={`h-2 flex-1 rounded-full ${i < water ? "bg-leaf" : "bg-leaf-soft"}`} />
              ))}
            </div>
          </div>
          <button
            type="button"
            aria-label="One glass of water fewer"
            disabled={!water}
            className="flex size-11 items-center justify-center rounded-xl border border-line text-xl text-ink hover:border-leaf disabled:opacity-40"
            onClick={() => setWater(water - 1)}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Add a glass of water"
            className="flex size-11 items-center justify-center rounded-xl bg-leaf text-xl text-white hover:bg-leaf-dark"
            onClick={() => setWater(water + 1)}
          >
            +
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <p className="text-ink">
            Alcohol <span className="tabular-nums text-muted">{units} {units === 1 ? "unit" : "units"}</span>
          </p>
          <button type="button" className="min-h-11 text-sm font-semibold text-leaf hover:underline" onClick={() => setSheet("drink")}>
            Add an alcoholic drink
          </button>
        </div>
      </section>

      {entries && !list.length ? (
        <p className="mt-10 text-center text-muted">
          Nothing written down {isToday ? "yet today" : "for this day"}. Add your first meal to begin.
        </p>
      ) : null}

      {entries && !food.length && toCopy.length ? (
        <button type="button" className="btn-quiet mx-auto mt-4 flex" onClick={copyDayBefore}>
          Copy {isToday ? "yesterday's" : "the day before's"} food ({toCopy.length} {toCopy.length === 1 ? "item" : "items"})
        </button>
      ) : null}

      {MEAL_ORDER.map((meal) => {
        const rows = food.filter((e) => (e.meal ?? "snack") === meal);
        if (!rows.length) return null;
        return (
          <section key={meal} className="mt-6">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{MEAL_LABEL[meal]}</h2>
              <span className="text-sm tabular-nums text-muted">{rows.reduce((s, e) => s + e.calories, 0)} kcal</span>
            </div>
            <div className="card mt-2 px-4">
              <ul>
                {rows.map((e) => (
                  <Row key={e.id} entry={e} onDelete={() => void store.deleteEntry(user.uid, e.id)} />
                ))}
              </ul>
              <button
                type="button"
                className="min-h-11 w-full border-t border-line text-sm font-semibold text-leaf hover:underline"
                onClick={() => setSaving(meal)}
              >
                Save this meal to use again
              </button>
            </div>
          </section>
        );
      })}

      {exercise.length ? (
        <section className="mt-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Exercise</h2>
            <span className="text-sm tabular-nums text-muted">{burned} kcal</span>
          </div>
          <ul className="card mt-2 px-4">
            {exercise.map((e) => (
              <Row key={e.id} entry={e} onDelete={() => void store.deleteEntry(user.uid, e.id)} />
            ))}
          </ul>
        </section>
      ) : null}

      {sheet === "food" ? <AddFood date={date} onClose={() => setSheet(null)} /> : null}
      {saving ? (
        <SaveMeal
          uid={user.uid}
          entries={food.filter((e) => (e.meal ?? "snack") === saving)}
          existing={profile.savedMeals ?? []}
          onClose={() => setSaving(null)}
        />
      ) : null}
      {sheet === "drink" ? <AddDrink uid={user.uid} date={date} onClose={() => setSheet(null)} /> : null}
      {sheet === "exercise" ? <AddExercise date={date} onClose={() => setSheet(null)} /> : null}
    </>
  );
}

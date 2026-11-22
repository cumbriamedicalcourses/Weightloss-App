"use client";

import { useEffect, useState } from "react";
import { dayKey } from "@/lib/dates";
import { useJournal } from "@/lib/journal";
import { BANDS, DAY_NAMES, DIETS, nearestBand, planDay, total, type Band, type Diet, type PlanMeal } from "@/lib/plans";
import { store } from "@/lib/store";
import type { Meal } from "@/lib/types";

const MEAL_LABEL: Record<Meal, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

const STORAGE_KEY = "wlj:plan";

function Chips<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
              value === o.id ? "border-leaf bg-leaf text-white" : "border-line bg-card text-ink hover:border-leaf"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function PlansPage() {
  const { user, profile, target } = useJournal();
  const suggested = nearestBand(target);
  const [diet, setDiet] = useState<Diet>("any");
  const [band, setBand] = useState<Band>(suggested);
  // Monday is day 0 in the plans; JavaScript counts from Sunday.
  const [day, setDay] = useState(() => (new Date().getDay() + 6) % 7);
  const [added, setAdded] = useState<Record<string, boolean>>({});

  // Remember the person's choice of plan on this device.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as { diet?: Diet; band?: Band } | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved?.diet && DIETS.some((d) => d.id === saved.diet)) setDiet(saved.diet);
      if (saved?.band && BANDS.includes(saved.band)) setBand(saved.band);
    } catch {
      // Storage can be blocked; the defaults still work.
    }
  }, []);

  function choose(next: { diet?: Diet; band?: Band }) {
    const value = { diet: next.diet ?? diet, band: next.band ?? band };
    setDiet(value.diet);
    setBand(value.band);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Nothing useful to do if storage is unavailable.
    }
  }

  if (!profile) return null;

  const meals = planDay(diet, band, day);
  const today = dayKey();
  const keyFor = (m: Meal) => `${today}|${diet}|${band}|${day}|${m}`;

  function log(list: PlanMeal[]) {
    for (const m of list) {
      for (const i of m.items) {
        void store.addEntry(user.uid, {
          date: today,
          kind: "food",
          meal: m.meal,
          name: i.name,
          portion: i.portion,
          calories: i.calories,
          protein: i.protein,
          carbs: i.carbs,
          fat: i.fat,
          source: "plan",
        });
      }
    }
    setAdded((a) => ({ ...a, ...Object.fromEntries(list.map((m) => [keyFor(m.meal), true])) }));
  }

  const notAdded = meals.filter((m) => !added[keyFor(m.meal)]);

  return (
    <>
      <h1 className="font-display text-2xl text-ink">Meal plans</h1>
      <p className="mt-1 text-muted">
        Seven days of meals for your calorie target. Tap “I ate this” and the meal goes straight into today&apos;s journal.
      </p>

      <div className="mt-5 space-y-4">
        <Chips label="Way of eating" options={DIETS} value={diet} onChange={(v) => choose({ diet: v })} />
        <Chips
          label="Calories a day"
          options={BANDS.map((b) => ({ id: b, label: b.toLocaleString() }))}
          value={band}
          onChange={(v) => choose({ band: v })}
        />
        <p className="text-sm text-muted">
          Your daily target is {target.toLocaleString()} kcal, so the {suggested.toLocaleString()} plan is the closest fit.
        </p>
        {band === 1200 ? (
          <p className="rounded-xl bg-clay-soft px-3.5 py-3 text-sm text-clay">
            1,200 kcal a day is a low intake. Check with your GP before following it, especially if you take regular
            medication or have a health condition.
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Day of the week">
        {DAY_NAMES.map((name, i) => (
          <button
            key={name}
            role="tab"
            type="button"
            aria-selected={day === i}
            aria-label={name}
            onClick={() => setDay(i)}
            className={`min-h-11 min-w-12 flex-1 rounded-lg text-sm font-semibold ${
              day === i ? "bg-leaf text-white" : "text-muted hover:text-ink"
            }`}
          >
            {name.slice(0, 3)}
          </button>
        ))}
      </div>

      <section className="card mt-3 p-4" aria-label="Totals for the day">
        <p className="font-semibold text-ink">{DAY_NAMES[day]}</p>
        <p className="mt-0.5 text-sm tabular-nums text-muted">
          {total(meals).toLocaleString()} kcal · Protein {total(meals, "protein")} g · Carbs {total(meals, "carbs")} g · Fat{" "}
          {total(meals, "fat")} g
        </p>
      </section>

      {meals.map((m) => {
        const done = added[keyFor(m.meal)];
        return (
          <section key={m.meal} className="mt-5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{MEAL_LABEL[m.meal]}</h2>
              <span className="text-sm tabular-nums text-muted">{total([m])} kcal</span>
            </div>
            <div className="card mt-2 px-4">
              <ul>
                {m.items.map((i) => (
                  <li key={i.name} className="flex items-start gap-3 border-b border-line py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-ink">{i.name}</p>
                      <p className="text-sm text-muted">{i.portion}</p>
                    </div>
                    <span className="tabular-nums text-ink">{i.calories}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`min-h-12 w-full text-sm font-semibold ${done ? "text-muted" : "text-leaf hover:underline"}`}
                disabled={done}
                onClick={() => log([m])}
              >
                {done ? "Added to today’s journal" : "I ate this"}
              </button>
            </div>
          </section>
        );
      })}

      <button type="button" className="btn mt-6 w-full" disabled={!notAdded.length} onClick={() => log(notAdded)}>
        {notAdded.length === meals.length ? "Add the whole day to today’s journal" : notAdded.length ? "Add the rest of the day" : "The whole day is in your journal"}
      </button>

      <p className="mt-6 text-sm text-muted">
        Calorie and nutrition figures are estimates for the amounts shown. Swap any meal for another day&apos;s if you
        prefer it. These plans are general guidance and not medical advice.
      </p>
    </>
  );
}

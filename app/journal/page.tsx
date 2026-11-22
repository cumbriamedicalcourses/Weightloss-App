"use client";

import { useEffect, useState } from "react";
import AddExercise from "@/components/add-exercise";
import AddFood from "@/components/add-food";
import { addDays, dayKey, friendlyDay } from "@/lib/dates";
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
  const detail = entry.kind === "exercise" ? (entry.minutes ? `${entry.minutes} minutes` : "") : entry.portion;
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
  const { user, profile, target } = useJournal();
  const [date, setDate] = useState(dayKey);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [sheet, setSheet] = useState<"food" | "exercise" | null>(null);

  useEffect(() => store.watchEntries(user.uid, date, date, setEntries), [user.uid, date]);

  if (!profile) return null;

  const list = entries ?? [];
  const food = list.filter((e) => e.kind === "food");
  const exercise = list.filter((e) => e.kind === "exercise");
  const eaten = food.reduce((s, e) => s + e.calories, 0);
  const burned = exercise.reduce((s, e) => s + e.calories, 0);
  const allowance = target + burned;
  const left = allowance - eaten;
  const over = left < 0;
  const pct = allowance > 0 ? Math.min(100, Math.round((eaten / allowance) * 100)) : 0;
  const isToday = date === dayKey();

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
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button type="button" className="btn" onClick={() => setSheet("food")}>Add food</button>
        <button type="button" className="btn-quiet" onClick={() => setSheet("exercise")}>Add exercise</button>
      </div>

      {entries && !list.length ? (
        <p className="mt-10 text-center text-muted">
          Nothing written down {isToday ? "yet today" : "for this day"}. Add your first meal to begin.
        </p>
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
            <ul className="card mt-2 px-4">
              {rows.map((e) => (
                <Row key={e.id} entry={e} onDelete={() => void store.deleteEntry(user.uid, e.id)} />
              ))}
            </ul>
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
      {sheet === "exercise" ? <AddExercise date={date} onClose={() => setSheet(null)} /> : null}
    </>
  );
}

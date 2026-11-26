"use client";

import { sourceFields } from "@/lib/food-source";
import { useState, type FormEvent } from "react";
import { MAX_SAVED_MEALS, servingOf } from "@/lib/saved-meals";
import { store } from "@/lib/store";
import type { Entry, SavedMeal } from "@/lib/types";
import Sheet from "./sheet";

/** Saves the foods logged for one meal so they can be logged again in one tap. */
export default function SaveMeal({
  uid,
  entries,
  existing,
  onClose,
}: {
  uid: string;
  entries: Entry[];
  existing: SavedMeal[];
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [servings, setServings] = useState("1");
  const [replace, setReplace] = useState(true);
  const [error, setError] = useState("");

  const total = entries.reduce((s, e) => s + e.calories, 0);
  const n = Number(servings);
  const valid = Number.isInteger(n) && n >= 1 && n <= 20;

  function submit(e: FormEvent) {
    e.preventDefault();
    const title = name.trim();
    if (!title) return setError("Give it a name so you can find it again.");
    if (!valid) return setError("Servings should be a whole number from 1 to 20.");
    const others = existing.filter((m) => m.name.toLowerCase() !== title.toLowerCase());
    if (others.length >= MAX_SAVED_MEALS) return setError(`You can keep up to ${MAX_SAVED_MEALS} saved meals. Delete one you no longer use first.`);
    const meal: SavedMeal = {
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name: title,
      servings: n,
      items: entries.map((x) => ({
        name: x.name,
        calories: x.calories,
        portion: x.portion,
        protein: x.protein,
        carbs: x.carbs,
        fat: x.fat,
        units: x.units,
        ...sourceFields(x),
      })),
    };
    void store.setSavedMeals(uid, [meal, ...others]);
    // A whole batch was logged to build the recipe; swap it for the one portion eaten.
    if (n > 1 && replace && entries.length) {
      const { date, meal: slot } = entries[0];
      for (const x of entries) void store.deleteEntry(uid, x.id);
      for (const i of servingOf(meal)) {
        void store.addEntry(uid, { ...i, date, kind: "food", meal: slot, source: "saved" });
      }
    }
    onClose();
  }

  return (
    <Sheet title="Save this meal" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <ul className="card divide-y divide-line px-4">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
              <span className="min-w-0 truncate text-ink">{e.name}</span>
              <span className="shrink-0 text-sm tabular-nums text-muted">{e.calories} kcal</span>
            </li>
          ))}
        </ul>
        <div>
          <label className="label" htmlFor="sm-name">Name</label>
          <input id="sm-name" className="field" placeholder="My usual breakfast" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="sm-servings">How many servings does this make?</label>
          <input id="sm-servings" className="field" inputMode="numeric" value={servings} onChange={(e) => setServings(e.target.value)} />
          <p className="mt-1.5 text-sm text-muted">
            Leave it at 1 for a meal you eat in one go. For a recipe you cook in a batch, enter how many portions it
            makes and each time you log it you get one portion.
          </p>
        </div>
        <p className="rounded-xl bg-leaf-soft px-3.5 py-3 text-ink">
          {total.toLocaleString()} kcal in total
          {valid && n > 1 ? `, so ${Math.round(total / n).toLocaleString()} kcal a serving` : ""}.
        </p>
        {valid && n > 1 ? (
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" className="mt-1 size-5 accent-leaf" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
            <span className="text-ink">
              Replace these items in the journal with one serving, so the day only counts what I ate.
            </span>
          </label>
        ) : null}
        {error ? <p className="text-sm text-clay" role="alert">{error}</p> : null}
        <button className="btn w-full">Save</button>
        <p className="text-sm text-muted">You will find it under Add food, at the top of Recent.</p>
      </form>
    </Sheet>
  );
}

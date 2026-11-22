"use client";

import { useState } from "react";
import { DRINKS, WEEKLY_UNIT_GUIDE } from "@/lib/drinks";
import { store } from "@/lib/store";
import Sheet from "./sheet";

/** A short list of common alcoholic drinks, each logged with its calories and units. */
export default function AddDrink({ uid, date, onClose }: { uid: string; date: string; onClose: () => void }) {
  const [added, setAdded] = useState<Record<number, number>>({});
  const count = Object.values(added).reduce((s, n) => s + n, 0);

  return (
    <Sheet title="Add an alcoholic drink" onClose={onClose}>
      <div className="space-y-4">
        <ul className="card divide-y divide-line overflow-hidden">
          {DRINKS.map((d, i) => (
            <li key={`${d.name}|${d.portion}`}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-leaf-soft"
                onClick={() => {
                  setAdded((a) => ({ ...a, [i]: (a[i] ?? 0) + 1 }));
                  void store.addEntry(uid, { ...d, date, kind: "food", meal: "snack", source: "drink" });
                }}
              >
                <span className="min-w-0">
                  <span className="block truncate text-ink">{d.name}</span>
                  <span className="block truncate text-sm text-muted">
                    {d.portion} · {d.units} {d.units === 1 ? "unit" : "units"}
                  </span>
                </span>
                <span className="shrink-0 text-sm tabular-nums text-muted">
                  {added[i] ? <span className="mr-2 font-semibold text-leaf">Added{added[i] > 1 ? ` ×${added[i]}` : ""}</span> : null}
                  {d.calories} kcal
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">
          Tap a drink to add it. Calories and units are typical figures and vary by brand and strength. UK guidance is
          to drink no more than {WEEKLY_UNIT_GUIDE} units a week, spread over three or more days.
        </p>
        <button type="button" className="btn w-full" onClick={onClose}>
          {count ? `Done, ${count} added` : "Done"}
        </button>
      </div>
    </Sheet>
  );
}

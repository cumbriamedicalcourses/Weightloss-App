"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useJournal } from "@/lib/journal";
import { loadChoice, loadSwaps, swapsFor, type SwapMap } from "@/lib/plan-choice";
import { DIETS, nearestBand, planDay, type Band, type Diet } from "@/lib/plans";
import { AISLES, shoppingList } from "@/lib/shopping";

const TICKED_KEY = "wlj:shopping";

export default function ShoppingPage() {
  const { profile, target } = useJournal();
  const [diet, setDiet] = useState<Diet>("any");
  const [band, setBand] = useState<Band>(nearestBand(target));
  const [swaps, setSwaps] = useState<SwapMap>({});
  const [ticked, setTicked] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  // The plan, swaps and ticks are remembered on this device.
  useEffect(() => {
    const saved = loadChoice();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved.diet) setDiet(saved.diet);
    if (saved.band) setBand(saved.band);
    setSwaps(loadSwaps());
    try {
      setTicked(JSON.parse(localStorage.getItem(TICKED_KEY) ?? "{}") as Record<string, boolean>);
    } catch {
      // Storage can be blocked; the list still works without remembering ticks.
    }
  }, []);

  const items = useMemo(
    () => shoppingList(Array.from({ length: 7 }, (_, day) => planDay(diet, band, day, swapsFor(swaps, diet, day)))),
    [diet, band, swaps],
  );

  if (!profile) return null;

  function save(next: Record<string, boolean>) {
    setTicked(next);
    try {
      localStorage.setItem(TICKED_KEY, JSON.stringify(next));
    } catch {
      // Nothing useful to do if storage is unavailable.
    }
  }

  const line = (i: { name: string; amount: string }) => (i.amount ? `${i.name}, ${i.amount}` : i.name);

  async function copy() {
    const text = AISLES.map((aisle) => {
      const list = items.filter((i) => i.aisle === aisle && !ticked[i.name]);
      return list.length ? `${aisle}\n${list.map((i) => `- ${line(i)}`).join("\n")}` : "";
    })
      .filter(Boolean)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Copying can be blocked by the browser; the list is still on screen.
    }
  }

  const left = items.filter((i) => !ticked[i.name]).length;
  const dietLabel = DIETS.find((d) => d.id === diet)?.label ?? "";

  return (
    <>
      <Link href="/journal/plans" className="text-sm font-semibold text-leaf hover:underline">
        ‹ Meal plans
      </Link>
      <h1 className="mt-2 font-display text-2xl text-ink">Shopping list</h1>
      <p className="mt-1 text-muted">
        Everything for seven days of the {dietLabel.toLowerCase()} {band.toLocaleString()} kcal plan, for one person,
        including any meals you have swapped. Tick off what you already have.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="btn" onClick={copy} disabled={!left}>
          {copied ? "Copied" : "Copy the list"}
        </button>
        {left < items.length ? (
          <button type="button" className="btn-quiet" onClick={() => save({})}>
            Untick everything
          </button>
        ) : null}
        <p className="text-sm text-muted" aria-live="polite">
          {left} of {items.length} still to get
        </p>
      </div>

      {AISLES.map((aisle) => {
        const list = items.filter((i) => i.aisle === aisle);
        if (!list.length) return null;
        return (
          <section key={aisle} className="mt-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{aisle}</h2>
            <ul className="card mt-2 px-4">
              {list.map((i) => (
                <li key={i.name} className="border-b border-line last:border-b-0">
                  <label className="flex min-h-12 cursor-pointer items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      className="size-5 accent-leaf"
                      checked={Boolean(ticked[i.name])}
                      onChange={(e) => save({ ...ticked, [i.name]: e.target.checked })}
                    />
                    <span className={`min-w-0 flex-1 ${ticked[i.name] ? "text-muted line-through" : "text-ink"}`}>
                      {i.name}
                    </span>
                    <span className="text-sm tabular-nums text-muted">{i.amount}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p className="mt-6 text-sm text-muted">
        Amounts are what the recipes use, so buy the nearest pack size. Items with no amount, such as salad, vegetables
        and oil, are used in small or flexible quantities. Rice is listed by cooked weight: 100 g cooked is about 40 g
        dry.
      </p>
    </>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { useJournal } from "@/lib/journal";
import { store } from "@/lib/store";
import type { EstimateItem, EstimateResult, FoodResult, Meal } from "@/lib/types";
import Sheet from "./sheet";

const MEALS: { id: Meal; label: string }[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snack", label: "Snack" },
];

type Tab = "search" | "photo" | "manual";
const TABS: { id: Tab; label: string }[] = [
  { id: "search", label: "Search" },
  { id: "photo", label: "Photo" },
  { id: "manual", label: "Type it in" },
];

function mealForNow(): Meal {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 17) return "snack";
  return "dinner";
}

/** Shrinks a camera photo in the browser so uploads are quick on mobile data. */
async function shrink(file: File, maxSide = 1280): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82).split(",")[1];
}

function ErrorNote({ children }: { children: string }) {
  return <p className="rounded-xl bg-clay-soft px-3.5 py-3 text-sm text-clay">{children}</p>;
}

export default function AddFood({ date, onClose }: { date: string; onClose: () => void }) {
  const { getToken } = useAuth();
  const { user } = useJournal();
  const [tab, setTab] = useState<Tab>("search");
  const [meal, setMeal] = useState<Meal>(mealForNow);

  async function call(path: string, init: RequestInit = {}) {
    const token = await getToken();
    const res = await fetch(path, {
      ...init,
      headers: { ...init.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
    return data;
  }

  async function save(items: { name: string; calories: number; portion?: string }[], source: Tab) {
    await Promise.all(
      items.map((i) =>
        store.addEntry(user.uid, {
          date,
          kind: "food",
          meal,
          name: i.name.trim(),
          calories: Math.round(i.calories),
          portion: i.portion?.trim() || undefined,
          source,
        }),
      ),
    );
    onClose();
  }

  return (
    <Sheet title="Add food or drink" onClose={onClose}>
      <div className="mb-4">
        <label className="label" htmlFor="meal">Meal</label>
        <select id="meal" className="field" value={meal} onChange={(e) => setMeal(e.target.value as Meal)}>
          {MEALS.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>

      <div role="tablist" aria-label="How to add" className="mb-5 grid grid-cols-3 gap-1 rounded-xl border border-line bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-11 rounded-lg text-sm font-semibold ${
              tab === t.id ? "bg-leaf text-white" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "search" ? <SearchTab call={call} save={(i) => save([i], "search")} /> : null}
      {tab === "photo" ? <PhotoTab call={call} save={(i) => save(i, "photo")} /> : null}
      {tab === "manual" ? <ManualTab save={(i) => save([i], "manual")} /> : null}
    </Sheet>
  );
}

type Call = (path: string, init?: RequestInit) => Promise<unknown>;
type Item = { name: string; calories: number; portion?: string };

function SearchTab({ call, save }: { call: Call; save: (i: Item) => Promise<void> }) {
  const [q, setQ] = useState("");
  const [foods, setFoods] = useState<FoodResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<FoodResult | null>(null);
  const [grams, setGrams] = useState("100");

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setBusy(true);
      setError("");
      try {
        const data = (await call(`/api/foods?q=${encodeURIComponent(term)}`)) as { foods: FoodResult[] };
        if (!cancelled) setFoods(data.foods);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // `call` is recreated each render; the search should follow the text only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  if (picked) {
    const g = Number(grams) || 0;
    const calories = Math.round((picked.kcalPer100g * g) / 100);
    return (
      <div className="space-y-4">
        <div>
          <p className="font-semibold text-ink">{picked.name}</p>
          <p className="text-sm text-muted">{picked.kcalPer100g} kcal per 100 g</p>
        </div>
        <div>
          <label className="label" htmlFor="grams">Amount in grams</label>
          <input id="grams" className="field" inputMode="decimal" value={grams} onChange={(e) => setGrams(e.target.value)} />
        </div>
        {picked.measures.length ? (
          <div className="flex flex-wrap gap-2">
            {picked.measures.map((m) => (
              <button
                key={m.label}
                type="button"
                className="min-h-10 rounded-full border border-line bg-card px-3.5 text-sm text-ink hover:border-leaf"
                onClick={() => setGrams(String(Math.round(m.grams)))}
              >
                {m.label} · {Math.round(m.grams)} g
              </button>
            ))}
          </div>
        ) : null}
        <p className="font-display text-3xl tabular-nums text-ink">
          {calories} <span className="text-base text-muted">kcal</span>
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-quiet flex-1" onClick={() => setPicked(null)}>Back</button>
          <button
            type="button"
            className="btn flex-1"
            disabled={g <= 0}
            onClick={() => void save({ name: picked.name, calories, portion: `${g} g` })}
          >
            Add to journal
          </button>
        </div>
      </div>
    );
  }

  const term = q.trim();
  return (
    <div className="space-y-4">
      <div>
        <label className="label" htmlFor="food-search">Search for a food</label>
        <input
          id="food-search"
          className="field"
          placeholder="For example, porridge"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      {busy && !foods ? <p className="text-sm text-muted" role="status">Searching…</p> : null}
      {term.length >= 2 && foods && !foods.length && !busy && !error ? (
        <p className="text-sm text-muted">
          No match for “{term}”. Try a simpler name, or use Type it in.
        </p>
      ) : null}
      {term.length >= 2 && foods?.length ? (
        <ul className="card divide-y divide-line overflow-hidden">
          {foods.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                className="flex w-full items-baseline justify-between gap-3 px-4 py-3 text-left hover:bg-leaf-soft"
                onClick={() => {
                  setPicked(f);
                  setGrams(f.measures[0] ? String(Math.round(f.measures[0].grams)) : "100");
                }}
              >
                <span className="text-ink">{f.name}</span>
                <span className="shrink-0 text-sm tabular-nums text-muted">{f.kcalPer100g} / 100 g</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function PhotoTab({ call, save }: { call: Call; save: (i: Item[]) => Promise<void> }) {
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [items, setItems] = useState<(EstimateItem & { key: number })[]>([]);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  async function estimate(file: File) {
    setError("");
    setResult(null);
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const image = await shrink(file);
      const data = (await call("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, mediaType: "image/jpeg", note }),
      })) as EstimateResult;
      setResult(data);
      setItems(data.items.map((i, key) => ({ ...i, key })));
    } catch (err) {
      setError((err as Error).message || "That photo couldn't be read. Try taking it again.");
    } finally {
      setBusy(false);
    }
  }

  const total = items.reduce((sum, i) => sum + (Number(i.calories) || 0), 0);

  return (
    <div className="space-y-4">
      {!result ? (
        <>
          <div>
            <label className="label" htmlFor="photo-note">Anything the photo can&apos;t show? (optional)</label>
            <input
              id="photo-note"
              className="field"
              placeholder="For example, cooked in butter, or half eaten"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
            />
          </div>
          <label className={`btn w-full cursor-pointer ${busy ? "pointer-events-none opacity-50" : ""}`}>
            {busy ? "Looking at your photo…" : "Take or choose a photo"}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void estimate(file);
              }}
            />
          </label>
          <p className="text-sm text-muted">
            The photo is used to make the estimate and is not kept.
          </p>
        </>
      ) : null}

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Your meal" className="max-h-56 w-full rounded-2xl border border-line object-cover" />
      ) : null}
      {busy ? <p className="text-sm text-muted" role="status">This usually takes a few seconds.</p> : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}

      {result ? (
        <>
          {items.length ? (
            <>
              <p className="text-sm text-muted">Check each line and change anything that looks wrong.</p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.key} className="card p-3">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <input
                          aria-label="Food name"
                          className="w-full bg-transparent font-semibold text-ink outline-none focus:underline"
                          value={item.name}
                          onChange={(e) => setItems((l) => l.map((x) => (x.key === item.key ? { ...x, name: e.target.value } : x)))}
                        />
                        <p className="text-sm text-muted">{item.portion}</p>
                      </div>
                      <input
                        aria-label={`Calories for ${item.name}`}
                        className="field !w-24 shrink-0 !py-2 text-right tabular-nums"
                        inputMode="numeric"
                        value={item.calories}
                        onChange={(e) =>
                          setItems((l) =>
                            l.map((x) => (x.key === item.key ? { ...x, calories: Number(e.target.value.replace(/\D/g, "")) } : x)),
                          )
                        }
                      />
                      <button
                        type="button"
                        className="min-h-11 px-2 text-sm font-semibold text-clay"
                        onClick={() => setItems((l) => l.filter((x) => x.key !== item.key))}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted">
                  {result.confidence === "high" ? "Confident estimate" : result.confidence === "medium" ? "Reasonable estimate" : "Rough estimate"}
                </span>
                <span className="font-display text-3xl tabular-nums text-ink">
                  {total} <span className="text-base text-muted">kcal</span>
                </span>
              </div>
            </>
          ) : null}
          {result.notes ? <p className="text-sm text-muted">{result.notes}</p> : null}
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-quiet flex-1"
              onClick={() => {
                setResult(null);
                setItems([]);
                setPreview("");
              }}
            >
              Try another photo
            </button>
            <button type="button" className="btn flex-1" disabled={!items.length} onClick={() => void save(items)}>
              Add to journal
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function ManualTab({ save }: { save: (i: Item) => Promise<void> }) {
  const [name, setName] = useState("");
  const [portion, setPortion] = useState("");
  const [calories, setCalories] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    void save({ name, portion, calories: Number(calories) });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="m-name">What did you have?</label>
        <input id="m-name" required className="field" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="m-portion">How much? (optional)</label>
        <input id="m-portion" className="field" placeholder="For example, 1 bowl" value={portion} onChange={(e) => setPortion(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="m-cal">Calories</label>
        <input
          id="m-cal"
          required
          className="field"
          inputMode="numeric"
          pattern="[0-9]+"
          value={calories}
          onChange={(e) => setCalories(e.target.value.replace(/\D/g, ""))}
        />
      </div>
      <button className="btn w-full" disabled={!name.trim() || !calories}>Add to journal</button>
    </form>
  );
}

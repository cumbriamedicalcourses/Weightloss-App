"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { useJournal } from "@/lib/journal";
import { store } from "@/lib/store";
import { addDays, dayKey } from "@/lib/dates";
import { servingOf } from "@/lib/saved-meals";
import { sourceFields, sourceTag, type FoodOrigin } from "@/lib/food-source";
import type { Entry, EstimateItem, EstimateResult, Favourite, FoodResult, Macros, Meal, SavedMeal } from "@/lib/types";
import BarcodeScanner from "./barcode-scanner";
import Sheet from "./sheet";

const MEALS: { id: Meal; label: string }[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snack", label: "Snack" },
];

type Tab = "recent" | "search" | "describe" | "photo" | "manual";
const TABS: { id: Tab; label: string }[] = [
  { id: "recent", label: "Recent" },
  { id: "search", label: "Search" },
  { id: "describe", label: "Describe" },
  { id: "photo", label: "Photo" },
  { id: "manual", label: "Manual" },
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
  const { user, profile } = useJournal();
  const [tab, setTab] = useState<Tab>("search");
  const [recent, setRecent] = useState<Entry[] | null>(null);
  const favourites = useMemo(() => profile?.favourites ?? [], [profile]);
  const savedMeals = useMemo(() => profile?.savedMeals ?? [], [profile]);

  // The last month of entries feeds the Recent tab.
  useEffect(() => {
    const today = dayKey();
    return store.watchEntries(user.uid, addDays(today, -30), today, setRecent);
  }, [user.uid]);

  // Open on Recent once there is something to show there, unless the person
  // has already picked a tab.
  const [touched, setTouched] = useState(false);
  const hasQuick = favourites.length > 0 || savedMeals.length > 0 || Boolean(recent?.some((e) => e.kind === "food"));
  const shown: Tab = !touched && hasQuick ? "recent" : tab;
  function pick(t: Tab) {
    setTouched(true);
    setTab(t);
  }
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

  async function save(items: Item[], source: Entry["source"], keepOpen = false) {
    await Promise.all(
      items.map((i) =>
        store.addEntry(user.uid, {
          date,
          kind: "food",
          meal,
          name: i.name.trim(),
          calories: Math.round(i.calories),
          portion: i.portion?.trim() || undefined,
          protein: grams(i.protein),
          carbs: grams(i.carbs),
          fat: grams(i.fat),
          units: i.units,
          source,
          origin: i.origin ?? ORIGIN_OF[source ?? "manual"],
          ref: i.ref,
        }),
      ),
    );
    if (!keepOpen) onClose();
  }

  function toggleFavourite(item: Item) {
    const key = itemKey(item);
    const next = favourites.some((x) => itemKey(x) === key)
      ? favourites.filter((x) => itemKey(x) !== key)
      : [{ ...item, name: item.name.trim() }, ...favourites].slice(0, 60);
    void store.setFavourites(user.uid, next);
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

      <div role="tablist" aria-label="How to add" className="mb-5 grid grid-cols-5 gap-0.5 rounded-xl border border-line bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={shown === t.id}
            onClick={() => pick(t.id)}
            className={`min-h-11 rounded-lg text-[13px] font-semibold ${
              shown === t.id ? "bg-leaf text-white" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {shown === "recent" ? (
        <RecentTab
          favourites={favourites}
          savedMeals={savedMeals}
          addSaved={(m) => save(servingOf(m), "saved", true)}
          deleteSaved={(m) => void store.setSavedMeals(user.uid, savedMeals.filter((x) => x.id !== m.id))}
          recent={recent}
          add={(i) => save([i], "recent", true)}
          toggleFavourite={toggleFavourite}
          onDone={onClose}
        />
      ) : null}
      {shown === "search" ? <SearchTab call={call} save={(i) => save([i], "search")} /> : null}
      {shown === "describe" ? <PhotoTab mode="describe" call={call} save={(i) => save(i, "describe")} /> : null}
      {shown === "photo" ? <PhotoTab mode="photo" call={call} save={(i) => save(i, "photo")} /> : null}
      {shown === "manual" ? <ManualTab save={(i) => save([i], "manual")} /> : null}
    </Sheet>
  );
}

type Call = (path: string, init?: RequestInit) => Promise<unknown>;
type Item = Favourite;

/** The source a newly added food gets when the item does not already carry one. */
const ORIGIN_OF: Partial<Record<NonNullable<Entry["source"]>, FoodOrigin>> = {
  describe: "ai",
  photo: "ai",
  manual: "you",
};

/** Keeps a macro figure only when it is a real, non-negative number. */
function grams(v: number | undefined) {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.round(v * 10) / 10 : undefined;
}

/** Two entries are the same food when name, portion and calories all match. */
function itemKey(i: Item) {
  return `${i.name.trim().toLowerCase()}|${(i.portion ?? "").trim().toLowerCase()}|${Math.round(i.calories)}`;
}

function macroLine(m: Macros) {
  if (m.protein === undefined && m.carbs === undefined && m.fat === undefined) return "";
  return `Protein ${Math.round(m.protein ?? 0)} g · Carbs ${Math.round(m.carbs ?? 0)} g · Fat ${Math.round(m.fat ?? 0)} g`;
}

function RecentTab({
  favourites,
  savedMeals,
  addSaved,
  deleteSaved,
  recent,
  add,
  toggleFavourite,
  onDone,
}: {
  favourites: Favourite[];
  savedMeals: SavedMeal[];
  addSaved: (m: SavedMeal) => Promise<void>;
  deleteSaved: (m: SavedMeal) => void;
  recent: Entry[] | null;
  add: (i: Item) => Promise<void>;
  toggleFavourite: (i: Item) => void;
  onDone: () => void;
}) {
  const [filter, setFilter] = useState("");
  const [added, setAdded] = useState<Record<string, number>>({});

  const favKeys = useMemo(() => new Set(favourites.map(itemKey)), [favourites]);
  const recents = useMemo(() => {
    const seen = new Set(favKeys);
    const list: Item[] = [];
    for (const e of [...(recent ?? [])].sort((a, b) => b.createdAt - a.createdAt)) {
      if (e.kind !== "food") continue;
      const item: Item = { name: e.name, calories: e.calories, portion: e.portion, protein: e.protein, carbs: e.carbs, fat: e.fat, units: e.units, ...sourceFields(e) };
      const key = itemKey(item);
      if (seen.has(key)) continue;
      seen.add(key);
      list.push(item);
      if (list.length >= 40) break;
    }
    return list;
  }, [recent, favKeys]);

  const term = filter.trim().toLowerCase();
  const match = (i: { name: string }) => !term || i.name.toLowerCase().includes(term);
  const groups = [
    { title: "Favourites", items: favourites.filter(match) },
    { title: "Recent", items: recents.filter(match) },
  ].filter((g) => g.items.length);
  const count = Object.values(added).reduce((s, n) => s + n, 0);

  const saved = savedMeals.filter(match);

  if (!favourites.length && !recents.length && !savedMeals.length) {
    return (
      <p className="text-sm text-muted">
        {recent ? "Foods you log will appear here, so next time you can add them with one tap. Start with Search, Photo or Type it in." : "Loading…"}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label" htmlFor="recent-filter">Find in your foods</label>
        <input id="recent-filter" className="field" autoComplete="off" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>
      {saved.length ? (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Saved meals and recipes</h3>
          <ul className="card mt-2 divide-y divide-line overflow-hidden">
            {saved.map((m) => {
              const key = `saved:${m.id}`;
              const serving = servingOf(m);
              const kcal = serving.reduce((s, i) => s + Math.round(i.calories), 0);
              return (
                <li key={m.id} className="flex items-stretch">
                  <button
                    type="button"
                    aria-label={`Delete saved meal ${m.name}`}
                    className="flex w-12 shrink-0 items-center justify-center text-xl text-muted hover:text-clay"
                    onClick={() => {
                      if (window.confirm(`Delete “${m.name}” from your saved meals?`)) deleteSaved(m);
                    }}
                  >
                    ×
                  </button>
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center justify-between gap-3 py-3 pr-4 text-left hover:bg-leaf-soft"
                    onClick={() => {
                      setAdded((a) => ({ ...a, [key]: (a[key] ?? 0) + 1 }));
                      void addSaved(m);
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-ink">{m.name}</span>
                      <span className="block truncate text-sm text-muted">
                        {m.servings > 1
                          ? `1 of ${m.servings} servings`
                          : `${m.items.length} ${m.items.length === 1 ? "item" : "items"}`}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-muted">
                      {added[key] ? <span className="mr-2 font-semibold text-leaf">Added{added[key] > 1 ? ` ×${added[key]}` : ""}</span> : null}
                      {kcal} kcal
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      {!groups.length && !saved.length ? <p className="text-sm text-muted">Nothing matches “{filter.trim()}”. Try Search instead.</p> : null}
      {groups.map((g) => (
        <section key={g.title}>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{g.title}</h3>
          <ul className="card mt-2 divide-y divide-line overflow-hidden">
            {g.items.map((i) => {
              const key = itemKey(i);
              const isFav = favKeys.has(key);
              return (
                <li key={key} className="flex items-stretch">
                  <button
                    type="button"
                    aria-label={isFav ? `Remove ${i.name} from favourites` : `Add ${i.name} to favourites`}
                    aria-pressed={isFav}
                    className={`flex w-12 shrink-0 items-center justify-center text-xl ${isFav ? "text-clay" : "text-muted hover:text-clay"}`}
                    onClick={() => toggleFavourite(i)}
                  >
                    {isFav ? "★" : "☆"}
                  </button>
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center justify-between gap-3 py-3 pr-4 text-left hover:bg-leaf-soft"
                    onClick={() => {
                      setAdded((a) => ({ ...a, [key]: (a[key] ?? 0) + 1 }));
                      void add(i);
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-ink">{i.name}</span>
                      {i.portion ? <span className="block truncate text-sm text-muted">{i.portion}</span> : null}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-muted">
                      {added[key] ? <span className="mr-2 font-semibold text-leaf">Added{added[key] > 1 ? ` ×${added[key]}` : ""}</span> : null}
                      {i.calories} kcal
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p className="text-sm text-muted">Tap a food to add it. Tap the star to keep it in your favourites.</p>
      <button type="button" className="btn w-full" onClick={onDone}>
        {count ? `Done, ${count} added` : "Done"}
      </button>
    </div>
  );
}

function SearchTab({ call, save }: { call: Call; save: (i: Item) => Promise<void> }) {
  const [q, setQ] = useState("");
  const [foods, setFoods] = useState<FoodResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<FoodResult | null>(null);
  const [grams, setGrams] = useState("100");
  const [scanning, setScanning] = useState(false);

  function choose(f: FoodResult) {
    setPicked(f);
    setGrams(f.measures[0] ? String(Math.round(f.measures[0].grams)) : "100");
  }

  async function lookUp(code: string) {
    setScanning(false);
    setBusy(true);
    setError("");
    try {
      const data = (await call(`/api/barcode?code=${code}`)) as { food: FoodResult };
      choose(data.food);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

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
    }, 500);
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
    const scale = (per100?: number) => (per100 === undefined ? undefined : Math.round(per100 * g) / 100);
    const macros: Macros = {
      protein: scale(picked.proteinPer100g),
      carbs: scale(picked.carbsPer100g),
      fat: scale(picked.fatPer100g),
    };
    return (
      <div className="space-y-4">
        <div>
          <p className="font-semibold text-ink">{picked.name}</p>
          <p className="text-sm text-muted">{picked.kcalPer100g} kcal per 100 g</p>
          <SourceNote food={picked} />
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
        {macroLine(macros) ? <p className="text-sm text-muted">{macroLine(macros)}</p> : null}
        <div className="flex gap-3">
          <button type="button" className="btn-quiet flex-1" onClick={() => setPicked(null)}>Back</button>
          <button
            type="button"
            className="btn flex-1"
            disabled={g <= 0}
            onClick={() => void save({ name: picked.name, calories, portion: `${g} g`, ...macros, ...searchSource(picked) })}
          >
            Add to journal
          </button>
        </div>
      </div>
    );
  }

  if (scanning) return <BarcodeScanner onCode={(code) => void lookUp(code)} onCancel={() => setScanning(false)} />;

  const term = q.trim();
  return (
    <div className="space-y-4">
      <button type="button" className="btn-quiet w-full" onClick={() => setScanning(true)}>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-2 inline h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6v12M8 6v12M11 6v12M15 6v12M18 6v12M20.5 6v12" />
        </svg>
        Scan a barcode
      </button>
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
      {busy && !foods ? <p className="text-sm text-muted" role="status">Looking it up…</p> : null}
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
                onClick={() => choose(f)}
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

/** Estimates a meal from a photo or from a description in words. */
function PhotoTab({
  mode,
  call,
  save,
}: {
  mode: "photo" | "describe";
  call: Call;
  save: (i: Item[]) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [text, setText] = useState("");
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

  async function describe(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setBusy(true);
    try {
      const data = (await call("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })) as EstimateResult;
      setResult(data);
      setItems(data.items.map((i, key) => ({ ...i, key })));
    } catch (err) {
      setError((err as Error).message || "That didn't work. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const total = items.reduce((sum, i) => sum + (Number(i.calories) || 0), 0);

  return (
    <div className="space-y-4">
      {!result && mode === "describe" ? (
        <form onSubmit={describe} className="space-y-4">
          <div>
            <label className="label" htmlFor="describe-text">What did you have?</label>
            <textarea
              id="describe-text"
              className="field min-h-28"
              placeholder="For example, two slices of toast with butter and a mug of tea with milk"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={600}
            />
          </div>
          <button className="btn w-full" disabled={busy || text.trim().length < 3}>
            {busy ? "Working it out…" : "Work out the calories"}
          </button>
          <p className="text-sm text-muted">Include amounts if you know them. You can check and change every line before saving.</p>
        </form>
      ) : null}

      {!result && mode === "photo" ? (
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
                        {macroLine(item) ? <p className="text-sm text-muted">{macroLine(item)}</p> : null}
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
              {mode === "photo" ? "Try another photo" : "Start again"}
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
  const [macros, setMacros] = useState({ protein: "", carbs: "", fat: "" });

  function submit(e: FormEvent) {
    e.preventDefault();
    const g = (v: string) => (v.trim() === "" ? undefined : Number(v));
    void save({
      name,
      portion,
      calories: Number(calories),
      protein: g(macros.protein),
      carbs: g(macros.carbs),
      fat: g(macros.fat),
    });
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
      <details>
        <summary className="min-h-11 cursor-pointer py-2.5 text-sm font-semibold text-leaf">
          Add protein, carbs and fat (optional)
        </summary>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {(["protein", "carbs", "fat"] as const).map((k) => (
            <div key={k}>
              <label className="label" htmlFor={`m-${k}`}>{k === "protein" ? "Protein" : k === "carbs" ? "Carbs" : "Fat"} (g)</label>
              <input
                id={`m-${k}`}
                className="field"
                inputMode="decimal"
                value={macros[k]}
                onChange={(e) => setMacros((m) => ({ ...m, [k]: e.target.value.replace(/[^0-9.]/g, "") }))}
              />
            </div>
          ))}
        </div>
      </details>
      <button className="btn w-full" disabled={!name.trim() || !calories}>Add to journal</button>
    </form>
  );
}

/** Search results come from USDA; barcode results from the product label on Open Food Facts. */
function searchSource(food: FoodResult): Pick<Item, "origin" | "ref"> {
  return food.id.startsWith("barcode-")
    ? { origin: "label", ref: food.id.slice("barcode-".length) }
    : { origin: "usda", ref: food.id };
}

function SourceNote({ food }: { food: FoodResult }) {
  const { origin, ref } = searchSource(food);
  const tag = sourceTag(origin, ref);
  if (!tag) return null;
  return (
    <p className="mt-1 text-xs text-muted">
      Source: {tag.title.replace(/^From the /, "the ")}.{" "}
      {tag.href ? (
        <a href={tag.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
          See the record
        </a>
      ) : null}
    </p>
  );
}

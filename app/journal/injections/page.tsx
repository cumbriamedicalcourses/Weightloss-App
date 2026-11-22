"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useJournal } from "@/lib/journal";
import { store } from "@/lib/store";
import { dayKey, parseDay } from "@/lib/dates";
import { MEDICINES, injectionRecord } from "@/lib/glp1";

const longDay = (d: string) => parseDay(d).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
const shortDate = (d: string) => parseDay(d).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export default function InjectionsPage() {
  const { user, profile } = useJournal();
  const today = dayKey();
  const [date, setDate] = useState(today);
  const [error, setError] = useState("");
  const [stopping, setStopping] = useState(false);
  if (!profile) return null;

  const record = injectionRecord(profile, today);
  const back = (
    <Link href="/journal/progress" className="text-sm font-semibold text-leaf">‹ Progress</Link>
  );

  if (!record) {
    return (
      <>
        {back}
        <h1 className="mt-1 font-display text-3xl text-ink">Weight-loss injections</h1>
        <p className="mt-2 text-muted">
          If you have been prescribed a weight-loss injection, you can keep a record here of the date you take each one.
        </p>
        <section className="card mt-5 p-5" aria-label="Choose your medicine">
          <h2 className="font-semibold text-ink">Which injection are you using?</h2>
          <div className="mt-3 space-y-2">
            {MEDICINES.map((m) => (
              <button key={m.id} type="button" className="btn-quiet w-full" onClick={() => void store.setGlp1Medicine(user.uid, m.id)}>
                {m.label}
              </button>
            ))}
          </div>
        </section>
      </>
    );
  }

  const { medicine, days, last, daysSince } = record;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today) {
      setError("Choose today or an earlier date.");
      return;
    }
    setError("");
    await store.setInjection(user.uid, date, { taken: true });
    setDate(today);
  }

  const since =
    daysSince === null ? "" : daysSince === 0 ? "today" : daysSince === 1 ? "yesterday" : `${daysSince} days ago`;

  return (
    <>
      {back}
      <h1 className="mt-1 font-display text-3xl text-ink">Weight-loss injections</h1>
      <p className="mt-1 text-muted">{medicine.label}</p>

      <section className="mt-4 rounded-2xl border border-leaf/40 bg-leaf-soft p-5" aria-label="Log an injection">
        <h2 className="font-semibold text-ink">
          {last ? `Last injection: ${longDay(last)}` : "No injections logged yet"}
        </h2>
        {last ? <p className="mt-1 text-ink">That was {since}.</p> : null}
        <form onSubmit={submit} className="mt-4">
          <label htmlFor="inj-date" className="label">Date of injection</label>
          <input id="inj-date" type="date" className="field" max={today} value={date} onChange={(e) => setDate(e.target.value)} />
          {error ? <p className="mt-2 text-sm text-clay" role="alert">{error}</p> : null}
          <button className="btn mt-3 w-full">Log injection</button>
        </form>
      </section>

      {days.length ? (
        <section className="card mt-4 p-5" aria-label="Injection history">
          <h2 className="font-semibold text-ink">History</h2>
          <ul className="mt-1 divide-y divide-line">
            {[...days].reverse().slice(0, 60).map((d) => (
              <li key={d} className="flex items-center justify-between gap-3 py-1">
                <span className="text-ink">{shortDate(d)}</span>
                <button
                  type="button"
                  aria-label={`Delete injection from ${shortDate(d)}`}
                  className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-xl leading-none text-muted hover:text-clay"
                  onClick={() => void store.setInjection(user.uid, d, null)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-5 text-sm text-muted">
        This is a record only. For anything about your dose, a missed injection or side effects, follow the leaflet that
        came with your medicine or ask your prescriber or pharmacist.
      </p>
      {stopping ? (
        <div className="mt-3 rounded-xl bg-clay-soft p-4">
          <p className="text-sm text-ink">This removes your injection record from the journal. It cannot be undone.</p>
          <div className="mt-3 flex gap-3">
            <button type="button" className="btn-quiet flex-1" onClick={() => setStopping(false)}>Keep it</button>
            <button type="button" className="btn flex-1" onClick={() => { setStopping(false); void store.setGlp1Medicine(user.uid, null); }}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="mt-2 min-h-11 text-sm font-semibold text-muted hover:text-clay" onClick={() => setStopping(true)}>
          I no longer use injections
        </button>
      )}
    </>
  );
}

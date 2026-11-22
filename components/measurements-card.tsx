"use client";

import { useState, type FormEvent } from "react";
import { useJournal } from "@/lib/journal";
import { store } from "@/lib/store";
import { dayKey, parseDay } from "@/lib/dates";
import {
  SITES,
  formatLength,
  fromDisplayLength,
  lengthUnit,
  measuredDays,
  toDisplayLength,
  trend,
  waistBand,
  type Site,
} from "@/lib/measurements";
import type { Measurement } from "@/lib/types";

const shortDate = (d: string) => parseDay(d).toLocaleDateString(undefined, { day: "numeric", month: "short" });

/** Tape measurements on the Progress page: latest readings, change since the start, and the waist-to-height ratio. */
export default function MeasurementsCard() {
  const { user, profile } = useJournal();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Partial<Record<Site, string>>>({});
  const [error, setError] = useState("");
  if (!profile) return null;

  const unit = lengthUnit(profile.weightUnit);
  const days = measuredDays(profile);
  const today = dayKey();
  const waist = trend(days, "waist");
  const band = waist ? waistBand(waist.latest, profile.heightCm) : null;
  const limits = unit === "cm" ? { min: 15, max: 250 } : { min: 6, max: 100 };

  function start() {
    // Today's readings can be corrected; otherwise the boxes start empty.
    const existing = days.find((d) => d.date === today);
    setValues(Object.fromEntries(SITES.map((s) => [s.id, existing?.[s.id] ? String(toDisplayLength(existing[s.id] as number, unit)) : ""])));
    setError("");
    setOpen(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const m: Measurement = {};
    for (const s of SITES) {
      const raw = (values[s.id] ?? "").trim();
      if (!raw) continue;
      const n = Number(raw.replace(",", "."));
      if (!(n >= limits.min && n <= limits.max)) {
        setError(`${s.label} should be between ${limits.min} and ${limits.max} ${unit}.`);
        return;
      }
      m[s.id] = fromDisplayLength(n, unit);
    }
    if (!Object.keys(m).length) {
      setError("Enter at least one measurement.");
      return;
    }
    await store.setMeasurement(user.uid, today, m);
    setOpen(false);
  }

  return (
    <section className="card mt-4 p-5" aria-label="Measurements">
      <h2 className="font-semibold text-ink">Measurements</h2>
      {!days.length && !open ? (
        <p className="mt-1 text-muted">
          Your waist often shrinks before the scales move. Measure every two to four weeks to see changes your weight
          does not show.
        </p>
      ) : null}

      {days.length ? (
        <ul className="mt-2 divide-y divide-line">
          {SITES.map((s) => {
            const t = trend(days, s.id);
            if (!t) return null;
            const change = Math.round((toDisplayLength(t.latest, unit) - toDisplayLength(t.first, unit)) * 10) / 10;
            return (
              <li key={s.id} className="flex items-baseline justify-between gap-3 py-2.5">
                <span className="text-ink">{s.label}</span>
                <span className="text-right">
                  <span className="font-semibold tabular-nums text-ink">{formatLength(t.latest, unit)}</span>
                  {t.count > 1 ? (
                    <span className={`ml-2 text-sm tabular-nums ${change < 0 ? "text-leaf" : "text-muted"}`}>
                      {change === 0 ? "no change" : `${change < 0 ? "down" : "up"} ${Math.abs(change)} ${unit}`}
                    </span>
                  ) : (
                    <span className="ml-2 text-sm text-muted">{shortDate(t.latestDate)}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {band ? (
        <div className={`mt-3 rounded-xl px-3.5 py-3 ${band.level === "healthy" ? "bg-leaf-soft" : "bg-clay-soft"}`}>
          <p className="font-semibold text-ink">
            Waist-to-height ratio {band.ratio.toFixed(2)}: {band.label.toLowerCase()}
          </p>
          <p className="mt-0.5 text-sm text-ink">{band.advice}</p>
          <p className="mt-1.5 text-xs text-muted">
            Based on NICE guidance for adults. It is less reliable in pregnancy, with a BMI over 35, and in children.
          </p>
        </div>
      ) : null}

      {open ? (
        <form onSubmit={submit} className="mt-4 space-y-3">
          {SITES.map((s) => (
            <div key={s.id}>
              <label className="label" htmlFor={`m-${s.id}`}>
                {s.label} ({unit})
              </label>
              <input
                id={`m-${s.id}`}
                className="field"
                inputMode="decimal"
                autoComplete="off"
                value={values[s.id] ?? ""}
                onChange={(e) => setValues({ ...values, [s.id]: e.target.value })}
              />
              <p className="mt-1 text-sm text-muted">Measure {s.how}.</p>
            </div>
          ))}
          <p className="text-sm text-muted">Fill in only the ones you want to follow. Waist is the most useful.</p>
          {error ? <p className="text-sm text-clay" role="alert">{error}</p> : null}
          <div className="flex gap-3">
            <button type="button" className="btn-quiet flex-1" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn flex-1">Save</button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn-quiet mt-4 w-full" onClick={start}>
          {days.some((d) => d.date === today) ? "Change today's measurements" : "Add measurements"}
        </button>
      )}

      {days.length > 1 && !open ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-semibold text-leaf">History</summary>
          <ul className="mt-2 divide-y divide-line text-sm">
            {[...days].reverse().map((d) => (
              <li key={d.date} className="flex items-center justify-between gap-3 py-2">
                <span className="text-ink">
                  <span className="font-semibold">{shortDate(d.date)}</span>{" "}
                  <span className="text-muted">
                    {SITES.filter((s) => typeof d[s.id] === "number")
                      .map((s) => `${s.label.toLowerCase()} ${toDisplayLength(d[s.id] as number, unit)}`)
                      .join(", ")}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`Delete measurements from ${shortDate(d.date)}`}
                  className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-xl leading-none text-muted hover:text-clay"
                  onClick={() => void store.setMeasurement(user.uid, d.date, null)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

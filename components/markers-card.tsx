"use client";

import { useState, type FormEvent } from "react";
import { useJournal } from "@/lib/journal";
import { store } from "@/lib/store";
import { dayKey, parseDay } from "@/lib/dates";
import { latestWith, markerDays, readBloodPressure, readCholesterol, readHba1c, type Reading } from "@/lib/markers";
import type { Markers } from "@/lib/types";

const shortDate = (d: string) => parseDay(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const FIELDS: { id: keyof Markers; label: string; unit: string; min: number; max: number; whole?: boolean }[] = [
  { id: "systolic", label: "Blood pressure, top number", unit: "mmHg", min: 60, max: 260, whole: true },
  { id: "diastolic", label: "Blood pressure, bottom number", unit: "mmHg", min: 30, max: 160, whole: true },
  { id: "hba1c", label: "HbA1c", unit: "mmol/mol", min: 15, max: 200, whole: true },
  { id: "totalChol", label: "Total cholesterol", unit: "mmol/L", min: 1, max: 20 },
  { id: "hdl", label: "HDL cholesterol", unit: "mmol/L", min: 0.2, max: 5 },
];

const TONE: Record<Reading["level"], string> = {
  good: "bg-leaf-soft",
  watch: "bg-clay-soft",
  high: "bg-clay-soft",
  urgent: "border border-clay bg-clay-soft",
};

function Result({ title, value, date, reading }: { title: string; value: string; date: string; reading: Reading }) {
  return (
    <li className={`rounded-xl px-3.5 py-3 ${TONE[reading.level]}`}>
      <p className="flex items-baseline justify-between gap-3">
        <span className="font-semibold text-ink">{title}</span>
        <span className="text-sm text-muted">{shortDate(date)}</span>
      </p>
      <p className="mt-0.5 text-ink">
        <span className="font-display text-2xl tabular-nums">{value}</span>
        <span className="ml-2 font-semibold">{reading.label}</span>
      </p>
      <p className="mt-1 text-sm text-ink">{reading.advice}</p>
    </li>
  );
}

/** Blood pressure, HbA1c and cholesterol on the Progress page. */
export default function MarkersCard() {
  const { user, profile } = useJournal();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Partial<Record<keyof Markers, string>>>({});
  const [error, setError] = useState("");
  if (!profile) return null;

  const days = markerDays(profile);
  const today = dayKey();
  const bp = latestWith(days, "systolic", "diastolic");
  const hba1c = latestWith(days, "hba1c");
  const chol = latestWith(days, "totalChol");
  const cholReading = chol ? readCholesterol(chol.latest.totalChol as number, chol.latest.hdl, profile.sex) : null;

  function start() {
    const existing = days.find((d) => d.date === today);
    setValues(Object.fromEntries(FIELDS.map((f) => [f.id, existing?.[f.id] !== undefined ? String(existing[f.id]) : ""])));
    setError("");
    setOpen(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const m: Markers = {};
    for (const f of FIELDS) {
      const raw = (values[f.id] ?? "").trim();
      if (!raw) continue;
      const n = Number(raw.replace(",", "."));
      if (!(n >= f.min && n <= f.max)) {
        setError(`${f.label} should be between ${f.min} and ${f.max} ${f.unit}.`);
        return;
      }
      m[f.id] = f.whole ? Math.round(n) : Math.round(n * 10) / 10;
    }
    if ((m.systolic === undefined) !== (m.diastolic === undefined)) {
      setError("Blood pressure needs both numbers, for example 128 over 82.");
      return;
    }
    if (m.systolic !== undefined && m.diastolic !== undefined && m.diastolic >= m.systolic) {
      setError("The top blood pressure number should be higher than the bottom one.");
      return;
    }
    if (m.hdl !== undefined && m.totalChol === undefined) {
      setError("Enter total cholesterol as well as HDL.");
      return;
    }
    if (m.hdl !== undefined && m.totalChol !== undefined && m.hdl >= m.totalChol) {
      setError("HDL cholesterol should be lower than total cholesterol.");
      return;
    }
    if (!Object.keys(m).length) {
      setError("Enter at least one reading.");
      return;
    }
    await store.setMarkers(user.uid, today, m);
    setOpen(false);
  }

  return (
    <section className="card mt-4 p-5" aria-label="Health markers">
      <h2 className="font-semibold text-ink">Health markers</h2>
      {!days.length && !open ? (
        <p className="mt-1 text-muted">
          Keep your blood pressure and blood test results with your journal. They often improve as weight comes down,
          sometimes before you notice anything else.
        </p>
      ) : null}

      {days.length ? (
        <ul className="mt-3 space-y-2">
          {bp ? (
            <Result
              title="Blood pressure"
              value={`${bp.latest.systolic}/${bp.latest.diastolic}`}
              date={bp.latest.date}
              reading={readBloodPressure(bp.latest.systolic as number, bp.latest.diastolic as number)}
            />
          ) : null}
          {hba1c ? (
            <Result title="HbA1c" value={`${hba1c.latest.hba1c} mmol/mol`} date={hba1c.latest.date} reading={readHba1c(hba1c.latest.hba1c as number)} />
          ) : null}
          {chol && cholReading ? (
            <Result
              title="Cholesterol"
              value={`${chol.latest.totalChol} total${cholReading.nonHdl !== null ? ` · ${chol.latest.hdl} HDL · ${cholReading.nonHdl} non-HDL` : ""}`}
              date={chol.latest.date}
              reading={cholReading}
            />
          ) : null}
        </ul>
      ) : null}

      {days.length ? (
        <p className="mt-3 text-xs text-muted">
          Ranges are the general NHS guide levels for adults and are for information only. Your own targets may differ,
          so follow the advice of your GP or nurse, and never change a medicine because of what you see here.
        </p>
      ) : null}

      {open ? (
        <form onSubmit={submit} className="mt-4 space-y-3">
          {FIELDS.map((f) => (
            <div key={f.id}>
              <label className="label" htmlFor={`k-${f.id}`}>
                {f.label} ({f.unit})
              </label>
              <input
                id={`k-${f.id}`}
                className="field"
                inputMode="decimal"
                autoComplete="off"
                value={values[f.id] ?? ""}
                onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
              />
            </div>
          ))}
          <p className="text-sm text-muted">
            Fill in only what you have. HbA1c and cholesterol come from blood tests, so copy them from your results.
          </p>
          {error ? <p className="text-sm text-clay" role="alert">{error}</p> : null}
          <div className="flex gap-3">
            <button type="button" className="btn-quiet flex-1" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn flex-1">Save</button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn-quiet mt-4 w-full" onClick={start}>
          {days.some((d) => d.date === today) ? "Change today's readings" : "Add readings"}
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
                    {[
                      d.systolic !== undefined && d.diastolic !== undefined ? `BP ${d.systolic}/${d.diastolic}` : "",
                      d.hba1c !== undefined ? `HbA1c ${d.hba1c}` : "",
                      d.totalChol !== undefined ? `cholesterol ${d.totalChol}${d.hdl !== undefined ? ` (HDL ${d.hdl})` : ""}` : "",
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`Delete readings from ${shortDate(d.date)}`}
                  className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-xl leading-none text-muted hover:text-clay"
                  onClick={() => void store.setMarkers(user.uid, d.date, null)}
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

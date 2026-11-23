"use client";

import { useState, type FormEvent } from "react";
import { useJournal } from "@/lib/journal";
import { store } from "@/lib/store";
import { dayKey, parseDay } from "@/lib/dates";
import { FAST_CHART_DAYS, FAST_GOAL_MAX, FAST_GOAL_MIN, PATTERNS, fastingSummary, parseHours, patternLabel } from "@/lib/fasting";

const hoursText = (h: number) => `${h} ${h === 1 ? "hour" : "hours"}`;

/** The hours fasted for one day on the Today page. Shown only once a fasting record has been started. */
export function FastingToday({ date }: { date: string }) {
  const { user, profile } = useJournal();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const goal = profile?.fasting?.goalHours;
  if (!profile || !goal) return null;

  const hours = profile.fasting?.log?.[date];
  const has = typeof hours === "number";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) {
      await store.setFast(user.uid, date, null);
      setOpen(false);
      return;
    }
    const n = parseHours(value);
    if (n === null) {
      setError("Enter the hours you fasted, between 0 and 24.");
      return;
    }
    await store.setFast(user.uid, date, n);
    setOpen(false);
  }

  return (
    <section className="card mt-3 p-4" aria-label="Fasting for the day">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-ink">
            Fasting{" "}
            <span className="tabular-nums text-muted">{has ? `${hoursText(hours)} of ${goal}` : `aim ${hoursText(goal)}`}</span>
          </p>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-leaf-soft"
            role="progressbar"
            aria-label="Hours fasted towards your aim"
            aria-valuemin={0}
            aria-valuemax={goal}
            aria-valuenow={has ? Math.min(hours, goal) : 0}
          >
            <div
              className={`h-full rounded-full ${has && hours >= goal ? "bg-clay" : "bg-leaf"}`}
              style={{ width: `${has ? Math.min(100, (hours / goal) * 100) : 0}%` }}
            />
          </div>
        </div>
        {open ? null : (
          <button
            type="button"
            className="min-h-11 text-sm font-semibold text-leaf hover:underline"
            onClick={() => {
              setValue(has ? String(hours) : "");
              setError("");
              setOpen(true);
            }}
          >
            {has ? "Change" : "Add fast"}
          </button>
        )}
      </div>
      {open ? (
        <form onSubmit={submit} className="mt-3 border-t border-line pt-3">
          <label htmlFor="fast-hours" className="label">
            Hours between your last meal {date === dayKey() ? "yesterday" : "the day before"} and your first meal {date === dayKey() ? "today" : "this day"}
          </label>
          <div className="flex gap-2">
            <input
              id="fast-hours"
              className="field flex-1"
              inputMode="decimal"
              autoFocus
              placeholder="For example 14"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <button className="btn">Save</button>
          </div>
          {error ? <p className="mt-2 text-sm text-clay" role="alert">{error}</p> : null}
          <button type="button" className="mt-1 min-h-11 text-sm font-semibold text-muted hover:text-ink" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </form>
      ) : null}
    </section>
  );
}

/** Fasting on the Progress page: starting a record, the chart of recent days, and the aim. */
export function FastingProgress() {
  const { user, profile } = useJournal();
  const [choosing, setChoosing] = useState(false);
  const [own, setOwn] = useState("");
  const [error, setError] = useState("");
  const [stopping, setStopping] = useState(false);
  if (!profile) return null;

  const today = dayKey();
  const summary = fastingSummary(profile, today);

  async function choose(hours: number) {
    await store.setFastingGoal(user.uid, hours);
    setChoosing(false);
    setOwn("");
    setError("");
  }

  function submitOwn(e: FormEvent) {
    e.preventDefault();
    const n = parseHours(own);
    if (n === null || n < FAST_GOAL_MIN || n > FAST_GOAL_MAX) {
      setError(`Choose between ${FAST_GOAL_MIN} and ${FAST_GOAL_MAX} hours.`);
      return;
    }
    void choose(n);
  }

  const chooser = (
    <div className="mt-4 border-t border-line pt-4">
      <h3 className="font-semibold text-ink">How long do you aim to fast each day?</h3>
      <div className="mt-3 space-y-2">
        {PATTERNS.map((p) => (
          <button key={p.hours} type="button" className="btn-quiet h-auto w-full flex-col items-start gap-0 py-2.5 text-left" onClick={() => void choose(p.hours)}>
            <span>{p.label}</span>
            <span className="text-sm font-normal text-muted">{p.detail}</span>
          </button>
        ))}
      </div>
      <form onSubmit={submitOwn} className="mt-3">
        <label htmlFor="fast-own" className="label">Or your own number of hours</label>
        <div className="flex gap-2">
          <input id="fast-own" className="field flex-1" inputMode="decimal" value={own} onChange={(e) => setOwn(e.target.value)} />
          <button className="btn">Save</button>
        </div>
        {error ? <p className="mt-2 text-sm text-clay" role="alert">{error}</p> : null}
      </form>
      <p className="mt-3 text-sm text-muted">
        Fasting does not suit everyone. Speak to your GP first if you have diabetes, take regular medicines, are pregnant or
        breastfeeding, are under 18, or have ever had an eating disorder.
      </p>
      {summary ? (
        <button type="button" className="mt-1 min-h-11 text-sm font-semibold text-muted hover:text-ink" onClick={() => setChoosing(false)}>
          Cancel
        </button>
      ) : null}
    </div>
  );

  if (!summary) {
    return (
      <section className="card mt-4 p-5" aria-label="Intermittent fasting">
        <h2 className="font-semibold text-ink">Intermittent fasting</h2>
        <p className="mt-1 text-sm text-muted">
          If you fast for part of each day, you can record your hours here and see how they add up.
        </p>
        {choosing ? chooser : (
          <button type="button" className="btn-quiet mt-4 w-full" onClick={() => setChoosing(true)}>
            Start a fasting record
          </button>
        )}
      </section>
    );
  }

  const top = Math.max(summary.goal, ...summary.days.map((d) => d.hours ?? 0)) * 1.1;

  return (
    <section className="card mt-4 p-5" aria-label="Intermittent fasting">
      <h2 className="font-semibold text-ink">Intermittent fasting</h2>
      <p className="mt-1 text-sm text-muted">
        {summary.entered
          ? `Last ${FAST_CHART_DAYS} days: about ${hoursText(summary.average ?? 0)} a day over the ${summary.entered} ${summary.entered === 1 ? "day" : "days"} you entered. You reached your aim on ${summary.daysAtGoal}.`
          : "Add your fasting hours on the Today page to see them here."}
      </p>

      <div className="relative mt-4 h-36" aria-hidden>
        <div className="absolute inset-x-0 border-t border-dashed border-clay" style={{ bottom: `${(summary.goal / top) * 100}%` }} />
        <div className="flex h-full items-end gap-1">
          {summary.days.map((d) => (
            <div key={d.date} className="flex h-full flex-1 items-end">
              <div
                className={`w-full rounded-t ${d.hours !== null && d.hours >= summary.goal ? "bg-clay" : "bg-leaf"}`}
                style={{ height: `${d.hours ? Math.max(2, (d.hours / top) * 100) : 0}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      <ul className="mt-1 flex gap-1 text-center text-xs">
        {summary.days.map((d) => (
          <li key={d.date} className="flex-1">
            <span className={`block ${d.date === today ? "font-semibold text-ink" : "text-muted"}`}>
              <span aria-hidden>{parseDay(d.date).getDate()}</span>
              <span className="sr-only">{parseDay(d.date).toLocaleDateString(undefined, { day: "numeric", month: "long" })}: </span>
            </span>
            <span className="block tabular-nums text-ink">
              {d.hours === null ? <span className="text-muted">–</span> : d.hours}
              <span className="sr-only">{d.hours === null ? " nothing entered" : " hours"}</span>
            </span>
          </li>
        ))}
      </ul>

      {choosing ? chooser : (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <p className="text-ink">
            <span className="mr-1.5 inline-block w-4 border-t border-dashed border-clay align-middle" aria-hidden />
            Aim <span className="tabular-nums text-muted">{hoursText(summary.goal)} a day ({patternLabel(summary.goal)})</span>
          </p>
          <button type="button" className="min-h-11 text-sm font-semibold text-leaf hover:underline" onClick={() => setChoosing(true)}>
            Change
          </button>
        </div>
      )}

      {stopping ? (
        <div className="mt-2 rounded-xl bg-clay-soft p-4">
          <p className="text-sm text-ink">This removes your fasting record from the journal. It cannot be undone.</p>
          <div className="mt-3 flex gap-3">
            <button type="button" className="btn-quiet flex-1" onClick={() => setStopping(false)}>Keep it</button>
            <button type="button" className="btn flex-1" onClick={() => { setStopping(false); void store.setFastingGoal(user.uid, null); }}>
              Remove
            </button>
          </div>
        </div>
      ) : choosing ? null : (
        <button type="button" className="min-h-11 text-sm font-semibold text-muted hover:text-clay" onClick={() => setStopping(true)}>
          I no longer fast
        </button>
      )}
    </section>
  );
}

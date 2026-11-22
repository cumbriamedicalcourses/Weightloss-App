"use client";

import { useState, type FormEvent } from "react";
import { useJournal } from "@/lib/journal";
import { store } from "@/lib/store";
import { dayKey, shortDay } from "@/lib/dates";
import { STEP_GOAL_MAX, STEP_GOAL_MIN, parseSteps, stepGoalOf, stepWeek } from "@/lib/steps";

/** The step count for one day on the Today page, typed in from a phone or watch. */
export function StepsToday({ date }: { date: string }) {
  const { user, profile } = useJournal();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  if (!profile) return null;

  const goal = stepGoalOf(profile);
  const steps = profile.steps?.[date];
  const has = typeof steps === "number";
  const percent = has ? Math.min(100, Math.round((steps / goal) * 100)) : 0;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) {
      await store.setSteps(user.uid, date, null);
      setOpen(false);
      return;
    }
    const n = parseSteps(value);
    if (n === null) {
      setError("Enter your steps as a whole number, such as 6500.");
      return;
    }
    await store.setSteps(user.uid, date, n);
    setOpen(false);
  }

  return (
    <section className="card mt-3 p-4" aria-label="Steps for the day">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-ink">
            Steps{" "}
            <span className="tabular-nums text-muted">
              {has ? `${steps.toLocaleString()} of ${goal.toLocaleString()}` : `goal ${goal.toLocaleString()}`}
            </span>
          </p>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-leaf-soft"
            role="progressbar"
            aria-label="Steps towards your goal"
            aria-valuemin={0}
            aria-valuemax={goal}
            aria-valuenow={has ? Math.min(steps, goal) : 0}
          >
            <div className={`h-full rounded-full ${has && steps >= goal ? "bg-clay" : "bg-leaf"}`} style={{ width: `${percent}%` }} />
          </div>
        </div>
        {open ? null : (
          <button
            type="button"
            className="min-h-11 text-sm font-semibold text-leaf hover:underline"
            onClick={() => {
              setValue(has ? String(steps) : "");
              setError("");
              setOpen(true);
            }}
          >
            {has ? "Change" : "Add steps"}
          </button>
        )}
      </div>
      {open ? (
        <form onSubmit={submit} className="mt-3 border-t border-line pt-3">
          <label htmlFor="steps-count" className="label">Steps {date === dayKey() ? "so far today" : "for this day"}</label>
          <div className="flex gap-2">
            <input
              id="steps-count"
              className="field flex-1"
              inputMode="numeric"
              autoFocus
              placeholder="From your phone or watch"
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

/** The last seven days of steps on the Progress page, with the goal. */
export function StepsWeek() {
  const { user, profile } = useJournal();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  if (!profile) return null;

  const today = dayKey();
  const week = stepWeek(profile, today);
  const top = Math.max(week.goal, ...week.days.map((d) => d.steps ?? 0)) * 1.1;
  const goalAt = (week.goal / top) * 100;

  async function submit(e: FormEvent) {
    e.preventDefault();
    const n = parseSteps(value, STEP_GOAL_MAX);
    if (n === null || n < STEP_GOAL_MIN) {
      setError(`Choose a goal between ${STEP_GOAL_MIN.toLocaleString()} and ${STEP_GOAL_MAX.toLocaleString()} steps.`);
      return;
    }
    await store.setStepGoal(user.uid, n);
    setEditing(false);
  }

  return (
    <section className="card mt-4 p-5" aria-label="Steps this week">
      <h2 className="font-semibold text-ink">Steps</h2>
      <p className="mt-1 text-sm text-muted">
        {week.entered
          ? `Last 7 days: about ${week.average?.toLocaleString()} a day over the ${week.entered} ${week.entered === 1 ? "day" : "days"} you entered. You reached your goal on ${week.daysAtGoal}.`
          : "Add your steps on the Today page, from your phone or watch, to see your week here."}
      </p>

      <div className="relative mt-4 h-36" aria-hidden>
        <div className="absolute inset-x-0 border-t border-dashed border-clay" style={{ bottom: `${goalAt}%` }} />
        <div className="flex h-full items-end gap-2">
          {week.days.map((d) => (
            <div key={d.date} className="flex h-full flex-1 items-end">
              <div
                className={`w-full rounded-t-md ${d.steps !== null && d.steps >= week.goal ? "bg-clay" : "bg-leaf"}`}
                style={{ height: `${d.steps ? Math.max(2, (d.steps / top) * 100) : 0}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      <ul className="mt-1 flex gap-2 text-center text-xs">
        {week.days.map((d) => (
          <li key={d.date} className="flex-1">
            <span className={`block ${d.date === today ? "font-semibold text-ink" : "text-muted"}`}>{shortDay(d.date)}</span>
            <span className="block tabular-nums text-ink">
              {d.steps === null ? <span className="text-muted">–</span> : d.steps >= 1000 ? `${Math.round(d.steps / 100) / 10}k` : d.steps}
              <span className="sr-only">{d.steps === null ? " no steps entered" : " steps"}</span>
            </span>
          </li>
        ))}
      </ul>

      {editing ? (
        <form onSubmit={submit} className="mt-4 border-t border-line pt-4">
          <label htmlFor="step-goal" className="label">Daily step goal</label>
          <div className="flex gap-2">
            <input id="step-goal" className="field flex-1" inputMode="numeric" autoFocus value={value} onChange={(e) => setValue(e.target.value)} />
            <button className="btn">Save</button>
          </div>
          {error ? <p className="mt-2 text-sm text-clay" role="alert">{error}</p> : null}
          <p className="mt-2 text-sm text-muted">
            Pick a number you can reach on most days, then raise it by about 500 when it feels easy.
          </p>
          <button type="button" className="mt-1 min-h-11 text-sm font-semibold text-muted hover:text-ink" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <p className="text-ink">
            <span className="mr-1.5 inline-block w-4 border-t border-dashed border-clay align-middle" aria-hidden />
            Goal <span className="tabular-nums text-muted">{week.goal.toLocaleString()} steps a day</span>
          </p>
          <button
            type="button"
            className="min-h-11 text-sm font-semibold text-leaf hover:underline"
            onClick={() => {
              setValue(String(week.goal));
              setError("");
              setEditing(true);
            }}
          >
            Change goal
          </button>
        </div>
      )}
    </section>
  );
}

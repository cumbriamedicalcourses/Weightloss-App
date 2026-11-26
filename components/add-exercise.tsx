"use client";

import { useState, type FormEvent } from "react";
import { ACTIVITIES } from "@/lib/activities";
import { exerciseCalories } from "@/lib/calc";
import { useJournal } from "@/lib/journal";
import { store } from "@/lib/store";
import Sheet from "./sheet";

const OTHER = "other";

export default function AddExercise({ date, onClose }: { date: string; onClose: () => void }) {
  const { user, currentKg } = useJournal();
  const [activity, setActivity] = useState(ACTIVITIES[1].name);
  const [customName, setCustomName] = useState("");
  const [minutes, setMinutes] = useState("30");
  /** Set once the person types their own figure; otherwise we calculate it. */
  const [override, setOverride] = useState<string | null>(null);

  const isOther = activity === OTHER;
  const met = ACTIVITIES.find((a) => a.name === activity)?.met ?? 0;
  const mins = Number(minutes) || 0;
  const calculated = isOther ? 0 : exerciseCalories(met, currentKg, mins);
  const calories = override !== null ? Number(override) || 0 : calculated;
  const name = isOther ? customName.trim() : activity;

  async function submit(e: FormEvent) {
    e.preventDefault();
    await store.addEntry(user.uid, {
      date,
      kind: "exercise",
      name,
      calories,
      minutes: mins || undefined,
      source: "manual",
    });
    onClose();
  }

  return (
    <Sheet title="Add exercise" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="activity">Activity</label>
          <select
            id="activity"
            className="field"
            value={activity}
            onChange={(e) => {
              setActivity(e.target.value);
              setOverride(null);
            }}
          >
            {ACTIVITIES.map((a) => (
              <option key={a.name} value={a.name}>{a.name}</option>
            ))}
            <option value={OTHER}>Something else</option>
          </select>
        </div>
        {isOther ? (
          <div>
            <label className="label" htmlFor="custom-activity">What did you do?</label>
            <input id="custom-activity" required className="field" value={customName} onChange={(e) => setCustomName(e.target.value)} />
          </div>
        ) : null}
        <div>
          <label className="label" htmlFor="minutes">Minutes</label>
          <input
            id="minutes"
            className="field"
            inputMode="numeric"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div>
          <label className="label" htmlFor="burned">Calories burned</label>
          <input
            id="burned"
            className="field"
            inputMode="numeric"
            value={override ?? String(calculated || "")}
            onChange={(e) => setOverride(e.target.value.replace(/\D/g, ""))}
          />
          <p className="mt-1.5 text-sm text-muted">
            {isOther
              ? "Enter the figure from your watch or machine."
              : `Worked out from your weight and the activity's MET value (${met}) in the Compendium of Physical Activities. Change it if your watch or machine gives a different figure.`}
          </p>
        </div>
        <button className="btn w-full" disabled={!name || calories <= 0}>Add to journal</button>
      </form>
    </Sheet>
  );
}

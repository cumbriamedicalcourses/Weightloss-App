"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { ACTIVITY_LABEL, dailyTarget, fromDisplayWeight, maintenance, safeFloor, toDisplayWeight } from "@/lib/calc";
import { dayKey } from "@/lib/dates";
import { useJournal } from "@/lib/journal";
import { store } from "@/lib/store";
import type { ActivityLevel, Profile, Sex, WeightUnit } from "@/lib/types";

const PACES = [
  { kg: 0.25, label: "Gentle", detail: "about ¼ kg (½ lb) a week" },
  { kg: 0.5, label: "Steady", detail: "about ½ kg (1 lb) a week" },
  { kg: 0.75, label: "Faster", detail: "about ¾ kg (1½ lb) a week" },
];

export default function ProfilePage() {
  const { user, profile, currentKg, weights } = useJournal();
  const auth = useAuth();
  const router = useRouter();
  const isNew = !profile;
  const year = new Date().getFullYear();

  const [unit, setUnit] = useState<WeightUnit>(profile?.weightUnit ?? "kg");
  const [name, setName] = useState(profile?.name ?? user.name ?? "");
  const [sex, setSex] = useState<Sex>(profile?.sex ?? "female");
  const [birthYear, setBirthYear] = useState(profile ? String(profile.birthYear) : "");
  const [height, setHeight] = useState(profile ? String(profile.heightCm) : "");
  const [weight, setWeight] = useState(profile ? String(toDisplayWeight(currentKg, unit)) : "");
  const [goal, setGoal] = useState(profile ? String(toDisplayWeight(profile.goalWeightKg, unit)) : "");
  const [activity, setActivity] = useState<ActivityLevel>(profile?.activity ?? "light");
  const [pace, setPace] = useState(profile?.pacePerWeekKg ?? 0.5);
  const [custom, setCustom] = useState(profile?.customTarget ? String(profile.customTarget) : "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function changeUnit(next: WeightUnit) {
    if (next === unit) return;
    // Keep the same real weights when the unit changes.
    const convert = (v: string) => (v ? String(toDisplayWeight(fromDisplayWeight(Number(v), unit), next)) : v);
    setWeight(convert);
    setGoal(convert);
    setUnit(next);
  }

  const draft: Profile | null = (() => {
    const by = Number(birthYear);
    const h = Number(height);
    const w = fromDisplayWeight(Number(weight), unit);
    const g = fromDisplayWeight(Number(goal), unit);
    if (!(by > 1900 && by <= year) || !(h > 0) || !(w > 0) || !(g > 0)) return null;
    return {
      name: name.trim(),
      sex,
      birthYear: by,
      heightCm: h,
      startWeightKg: profile?.startWeightKg ?? w,
      goalWeightKg: g,
      activity,
      pacePerWeekKg: pace,
      weightUnit: unit,
      customTarget: custom ? Number(custom) : null,
    };
  })();
  const draftKg = fromDisplayWeight(Number(weight), unit);
  const suggested = draft ? dailyTarget({ ...draft, customTarget: null }, draftKg, year) : null;
  const atFloor = draft && suggested === safeFloor(draft.sex) && maintenance(draft, draftKg, year) - (pace * 7700) / 7 < suggested;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    if (!draft) {
      setError("Fill in your year of birth, height, weight and goal weight to continue.");
      return;
    }
    const age = year - draft.birthYear;
    if (age < 18) {
      setError("This journal is for adults aged 18 and over.");
      return;
    }
    if (draft.heightCm < 120 || draft.heightCm > 230) {
      setError("Enter your height in centimetres, between 120 and 230.");
      return;
    }
    if (draftKg < 35 || draftKg > 350) {
      setError(`Check your current weight. It should be in ${unit === "kg" ? "kilograms" : "pounds"}.`);
      return;
    }
    if (draft.customTarget && draft.customTarget < 1000) {
      setError("A daily target below 1,000 kcal isn't safe without medical supervision. Choose a higher number.");
      return;
    }
    await store.saveProfile(user.uid, draft);
    // Record a weigh-in when the weight is new or has changed.
    const today = dayKey();
    if (isNew || Math.abs(draftKg - currentKg) > 0.05 || !weights.length) {
      await store.setWeight(user.uid, { date: today, kg: Math.round(draftKg * 100) / 100 });
    }
    if (isNew) router.replace("/journal");
    else setSaved(true);
  }

  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [dataBusy, setDataBusy] = useState(false);
  const [dataError, setDataError] = useState("");

  async function download() {
    setDataError("");
    setDataBusy(true);
    try {
      const data = await store.exportAll(user.uid);
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-weight-loss-journal-${dayKey()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setDataError("Your data couldn't be gathered. Check your connection and try again.");
    } finally {
      setDataBusy(false);
    }
  }

  async function deleteEverything() {
    setDataError("");
    if (!auth.signedInRecently()) {
      setDataError("For your security, sign out, sign in again, and then delete your account within a few minutes.");
      return;
    }
    setDataBusy(true);
    try {
      await store.deleteAll(user.uid);
      await auth.deleteAccount();
      router.replace("/");
    } catch {
      setDataError("Something stopped the deletion part way. Sign out, sign in again and press delete once more to finish.");
      setDataBusy(false);
    }
  }

  const toggle = (active: boolean) =>
    `min-h-11 flex-1 rounded-lg text-sm font-semibold ${active ? "bg-leaf text-white" : "text-muted hover:text-ink"}`;

  return (
    <>
      <h1 className="font-display text-3xl text-ink">{isNew ? "First, a little about you" : "Your profile"}</h1>
      <p className="mt-2 text-muted">
        {isNew
          ? "These details set your daily calorie target. You can change them at any time."
          : "Update your details and the journal recalculates your daily target."}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div>
          <label className="label" htmlFor="p-name">First name</label>
          <input id="p-name" className="field" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <fieldset>
          <legend className="label">Sex</legend>
          <div className="flex gap-1 rounded-xl border border-line bg-card p-1">
            {(["female", "male"] as const).map((s) => (
              <button key={s} type="button" aria-pressed={sex === s} className={toggle(sex === s)} onClick={() => setSex(s)}>
                {s === "female" ? "Female" : "Male"}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-sm text-muted">Used only in the calorie formula.</p>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="p-year">Year of birth</label>
            <input id="p-year" className="field" inputMode="numeric" placeholder="1985" value={birthYear} onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, "").slice(0, 4))} />
          </div>
          <div>
            <label className="label" htmlFor="p-height">Height (cm)</label>
            <input id="p-height" className="field" inputMode="decimal" placeholder="165" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
        </div>

        <fieldset>
          <legend className="label">Weigh in</legend>
          <div className="flex gap-1 rounded-xl border border-line bg-card p-1">
            {(["kg", "lb"] as const).map((u) => (
              <button key={u} type="button" aria-pressed={unit === u} className={toggle(unit === u)} onClick={() => changeUnit(u)}>
                {u === "kg" ? "Kilograms" : "Pounds"}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="p-weight">Current weight ({unit})</label>
            <input id="p-weight" className="field" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="p-goal">Goal weight ({unit})</label>
            <input id="p-goal" className="field" inputMode="decimal" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="p-activity">A typical day, before exercise</label>
          <select id="p-activity" className="field" value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)}>
            {(Object.keys(ACTIVITY_LABEL) as ActivityLevel[]).map((a) => (
              <option key={a} value={a}>{ACTIVITY_LABEL[a]}</option>
            ))}
          </select>
          <p className="mt-1.5 text-sm text-muted">Leave out workouts. You log those separately.</p>
        </div>

        <fieldset>
          <legend className="label">Pace</legend>
          <div className="space-y-2">
            {PACES.map((p) => (
              <label key={p.kg} className={`card flex cursor-pointer items-center gap-3 px-4 py-3 ${pace === p.kg ? "border-leaf ring-2 ring-leaf/25" : ""}`}>
                <input type="radio" name="pace" className="size-4 accent-leaf" checked={pace === p.kg} onChange={() => setPace(p.kg)} />
                <span>
                  <span className="font-semibold text-ink">{p.label}</span>
                  <span className="text-muted">, {p.detail}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <section className="card p-5" aria-live="polite">
          <p className="text-sm text-muted">Suggested daily target</p>
          <p className="font-display text-5xl tabular-nums text-leaf">
            {suggested ? suggested.toLocaleString() : "—"}
            <span className="ml-2 text-lg text-muted">kcal</span>
          </p>
          {atFloor ? (
            <p className="mt-2 text-sm text-muted">
              This is the lowest target the journal suggests. Your pace may be a little slower than chosen.
            </p>
          ) : null}
          <div className="mt-4">
            <label className="label" htmlFor="p-custom">Or set your own target (optional)</label>
            <input id="p-custom" className="field" inputMode="numeric" placeholder="Leave empty to use the suggestion" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))} />
          </div>
        </section>

        <div aria-live="polite">
          {error ? <p className="rounded-xl bg-clay-soft px-3.5 py-3 text-sm text-clay">{error}</p> : null}
          {saved ? <p className="rounded-xl bg-leaf-soft px-3.5 py-3 text-sm text-leaf-dark">Profile saved.</p> : null}
        </div>

        <button className="btn w-full">{isNew ? "Open my journal" : "Save profile"}</button>
      </form>

      {!isNew ? (
        <section className="mt-10 border-t border-line pt-6" aria-label="Your data">
          <h2 className="font-semibold text-ink">Your data</h2>
          <p className="mt-1 text-sm text-muted">
            Your journal belongs to you. You can take a copy or remove it at any time. See the{" "}
            <Link href="/privacy" className="font-semibold text-leaf underline-offset-4 hover:underline">privacy policy</Link>.
          </p>
          <button type="button" className="btn-quiet mt-3 w-full" disabled={dataBusy} onClick={() => void download()}>
            Download my data
          </button>
          {!confirming ? (
            <button
              type="button"
              className="mt-3 min-h-11 w-full text-sm font-semibold text-clay hover:underline"
              onClick={() => setConfirming(true)}
            >
              Delete my account and data
            </button>
          ) : (
            <div className="mt-4 rounded-xl bg-clay-soft p-4">
              <p className="text-sm text-ink">
                This permanently removes your profile, every food and exercise entry, every weigh-in and your sign-in.
                It cannot be undone.
              </p>
              <label className="label mt-3" htmlFor="confirm-delete">Type DELETE to confirm</label>
              <input
                id="confirm-delete"
                className="field"
                autoComplete="off"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  className="btn-quiet flex-1"
                  onClick={() => {
                    setConfirming(false);
                    setConfirmText("");
                    setDataError("");
                  }}
                >
                  Keep my account
                </button>
                <button
                  type="button"
                  className="btn flex-1 !bg-clay"
                  disabled={dataBusy || confirmText.trim().toUpperCase() !== "DELETE"}
                  onClick={() => void deleteEverything()}
                >
                  {dataBusy ? "Deleting…" : "Delete everything"}
                </button>
              </div>
            </div>
          )}
          {dataError ? <p className="mt-3 rounded-xl bg-clay-soft px-3.5 py-3 text-sm text-clay" role="alert">{dataError}</p> : null}
        </section>
      ) : null}

      {!auth.preview ? (
        <div className="mt-10 border-t border-line pt-6">
          {user.email ? <p className="text-sm text-muted">Signed in as {user.email}</p> : null}
          <button type="button" className="btn-quiet mt-3 w-full" onClick={() => void auth.signOut()}>
            Sign out
          </button>
        </div>
      ) : null}
    </>
  );
}

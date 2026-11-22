"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useJournal } from "@/lib/journal";
import { store } from "@/lib/store";
import { proteinTarget, safeFloor } from "@/lib/calc";
import { dayKey, parseDay } from "@/lib/dates";
import { MEDICINES, RED_FLAGS, SIDE_EFFECTS, SITES, injectionStatus, injections, recentSideEffects } from "@/lib/glp1";

const longDay = (d: string) => parseDay(d).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
const shortDate = (d: string) => parseDay(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${on ? "border-leaf bg-leaf text-white" : "border-line bg-card text-ink hover:border-leaf"}`}
    >
      {children}
    </button>
  );
}

export default function InjectionsPage() {
  const { user, profile, currentKg } = useJournal();
  const today = dayKey();
  const [open, setOpen] = useState(false);
  const [dose, setDose] = useState("");
  const [site, setSite] = useState("");
  const [effects, setEffects] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [stopping, setStopping] = useState(false);
  if (!profile) return null;

  const status = injectionStatus(profile, today);
  const back = (
    <Link href="/journal/progress" className="text-sm font-semibold text-leaf">‹ Progress</Link>
  );

  if (!status) {
    return (
      <>
        {back}
        <h1 className="mt-1 font-display text-3xl text-ink">Weight-loss injections</h1>
        <p className="mt-2 text-muted">
          If you have been prescribed a weight-loss injection, you can keep track of it here: when each dose is due,
          where you injected, any side effects, and how to eat well while your appetite is low.
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
          <p className="mt-3 text-sm text-muted">
            This journal does not prescribe or supply medicines. Only use injections prescribed for you by a registered
            prescriber and dispensed by a registered pharmacy.
          </p>
        </section>
      </>
    );
  }

  const { medicine, last, nextDue, daysLate, suggestedSite, dosesAtStrength } = status;
  const list = injections(profile.glp1);
  const todays = list.find((i) => i.date === today);
  const recent = recentSideEffects(profile.glp1, today);
  const cadence = medicine.everyDays === 1 ? "daily" : "weekly";

  function start() {
    setDose(String(todays?.dose ?? last?.dose ?? medicine.doses[0] ?? ""));
    setSite(todays?.site ?? suggestedSite);
    setEffects(todays?.effects ?? []);
    setError("");
    setOpen(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const n = Number(dose.replace(",", "."));
    if (!(n > 0 && n <= 50)) {
      setError("Enter the dose on your pen in milligrams.");
      return;
    }
    await store.setInjection(user.uid, today, { dose: n, site: site || undefined, effects: effects.length ? effects : undefined });
    setOpen(false);
  }

  let headline = "Log your first injection";
  let detail = "Once you log a dose, this shows when the next one is due.";
  let late = false;
  if (nextDue && daysLate !== null) {
    if (todays) {
      headline = "Done for today";
      detail = `Next injection due ${longDay(nextDue)}.`;
    } else if (daysLate < 0) {
      headline = `Next injection ${daysLate === -1 ? "tomorrow" : longDay(nextDue)}`;
      detail = `Your last dose was ${last?.dose} mg on ${longDay(last!.date)}.`;
    } else if (daysLate === 0) {
      headline = "Your injection is due today";
      detail = `Suggested place this time: ${suggestedSite.toLowerCase()}.`;
    } else {
      late = true;
      headline = `Your injection is ${daysLate} ${daysLate === 1 ? "day" : "days"} late`;
      detail = medicine.missed;
    }
  }

  return (
    <>
      {back}
      <h1 className="mt-1 font-display text-3xl text-ink">Weight-loss injections</h1>
      <p className="mt-1 text-muted">{medicine.label}, {cadence}</p>

      <section className={`mt-4 rounded-2xl border p-5 ${late ? "border-clay/40 bg-clay-soft" : "border-leaf/40 bg-leaf-soft"}`} aria-label="Next injection">
        <h2 className="font-semibold text-ink">{headline}</h2>
        <p className="mt-1 text-ink">{detail}</p>
        {late ? <p className="mt-2 text-sm text-ink">This is what the patient leaflet says. If you are unsure, ask your pharmacist or prescriber.</p> : null}
        {last && !late ? (
          <p className="mt-2 text-sm text-muted">
            You have logged {dosesAtStrength} {dosesAtStrength === 1 ? "dose" : "doses"} at {last.dose} mg. Your prescriber decides if and when your dose changes.
          </p>
        ) : null}

        {open ? (
          <form onSubmit={submit} className="mt-4 space-y-4">
            <fieldset>
              <legend className="label">Dose (mg)</legend>
              {medicine.doses.length ? (
                <div className="flex flex-wrap gap-2">
                  {medicine.doses.map((d) => (
                    <Chip key={d} on={Number(dose) === d} onClick={() => setDose(String(d))}>{d} mg</Chip>
                  ))}
                </div>
              ) : (
                <input className="field" inputMode="decimal" aria-label="Dose in milligrams" value={dose} onChange={(e) => setDose(e.target.value)} />
              )}
            </fieldset>
            <fieldset>
              <legend className="label">Where did you inject?</legend>
              <div className="flex flex-wrap gap-2">
                {SITES.map((s) => (
                  <Chip key={s} on={site === s} onClick={() => setSite(s)}>{s}</Chip>
                ))}
              </div>
              <p className="mt-1.5 text-sm text-muted">Change the place each time to protect your skin.</p>
            </fieldset>
            <fieldset>
              <legend className="label">Any side effects since your last dose?</legend>
              <div className="flex flex-wrap gap-2">
                {SIDE_EFFECTS.map((s) => (
                  <Chip key={s.id} on={effects.includes(s.id)} onClick={() => setEffects(effects.includes(s.id) ? effects.filter((x) => x !== s.id) : [...effects, s.id])}>
                    {s.label}
                  </Chip>
                ))}
              </div>
            </fieldset>
            {error ? <p className="text-sm text-clay" role="alert">{error}</p> : null}
            <div className="flex gap-3">
              <button type="button" className="btn-quiet flex-1" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn flex-1">Save</button>
            </div>
          </form>
        ) : (
          <button type="button" className="btn mt-4 w-full" onClick={start}>
            {todays ? "Change today's entry" : "Log today's injection"}
          </button>
        )}
      </section>

      {recent.length ? (
        <section className="card mt-4 p-5" aria-label="Help with side effects">
          <h2 className="font-semibold text-ink">Help with your side effects</h2>
          <p className="text-sm text-muted">Most side effects are mild and settle within a few weeks of each dose change.</p>
          {recent.map((s) => (
            <div key={s.id} className="mt-3">
              <h3 className="font-semibold text-ink">{s.label}</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-ink">
                {s.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
          <p className="mt-3 text-sm text-muted">
            If side effects are hard to live with, tell your prescriber. Staying longer on a dose or stepping back down
            are both options they can offer.
          </p>
        </section>
      ) : null}

      <section className="card mt-4 p-5" aria-label="Eating well on injections">
        <h2 className="font-semibold text-ink">Eating well on injections</h2>
        <p className="mt-1 text-ink">
          The injection lowers your appetite, so every meal has to work harder. Up to a third of weight lost on these
          medicines can be muscle unless you protect it.
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink">
          <li>Aim for <strong>{proteinTarget(currentKg)} g of protein</strong> a day, and eat the protein on your plate first.</li>
          <li>Do strength exercises twice a week. Your exercise plan includes them.</li>
          <li>Drink 6 to 8 glasses of fluid a day, even when you are not thirsty.</li>
          <li>Do not eat less than <strong>{safeFloor(profile.sex).toLocaleString()} kcal</strong> a day without medical supervision.</li>
          <li>Keep alcohol low. It can make sickness worse and carries calories with no nutrition.</li>
          <li>Keep logging. The habits you build now are what keep the weight off if the injections stop.</li>
        </ul>
        <Link href="/learn/weight-loss-injections" className="btn-quiet mt-4 w-full">
          Read the full guide
        </Link>
      </section>

      <section className="mt-4 rounded-2xl border border-clay/40 bg-clay-soft p-5" aria-label="When to get help">
        <h2 className="font-semibold text-ink">When to get medical help</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink">
          {RED_FLAGS.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      {list.length ? (
        <section className="card mt-4 p-5" aria-label="Injection history">
          <h2 className="font-semibold text-ink">History</h2>
          <ul className="mt-1 divide-y divide-line">
            {[...list].reverse().slice(0, 30).map((i) => (
              <li key={i.date} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0">
                  <span className="block text-ink">
                    <span className="font-semibold">{shortDate(i.date)}</span> · {i.dose} mg{i.site ? ` · ${i.site.toLowerCase()}` : ""}
                  </span>
                  {i.effects?.length ? (
                    <span className="block text-sm text-muted">
                      {i.effects.map((id) => SIDE_EFFECTS.find((s) => s.id === id)?.label.toLowerCase()).filter(Boolean).join(", ")}
                    </span>
                  ) : null}
                </span>
                <button
                  type="button"
                  aria-label={`Delete injection from ${shortDate(i.date)}`}
                  className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-xl leading-none text-muted hover:text-clay"
                  onClick={() => void store.setInjection(user.uid, i.date, null)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-5 text-sm text-muted">
        This page is general information based on the patient leaflets and NHS advice. It does not replace the advice of
        your prescriber or pharmacist, and it never suggests a dose.
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

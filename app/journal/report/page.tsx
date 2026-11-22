"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useJournal } from "@/lib/journal";
import { store } from "@/lib/store";
import { ACTIVITY_LABEL, formatWeight } from "@/lib/calc";
import { addDays, dayKey, parseDay } from "@/lib/dates";
import { WEEKLY_UNIT_GUIDE } from "@/lib/drinks";
import { levelOf, weeklyMinutes } from "@/lib/exercise-plan";
import { formatLength, lengthUnit } from "@/lib/measurements";
import { REPORT_DAYS, buildReport } from "@/lib/report";
import type { Entry } from "@/lib/types";

const longDate = (d: string) => parseDay(d).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-b-0 print:py-1">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold tabular-nums text-ink">{children}</dd>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 break-inside-avoid print:mt-3.5">
      <h2 className="border-b-2 border-ink pb-1 text-sm font-semibold uppercase tracking-wide text-ink">{title}</h2>
      {children}
    </section>
  );
}

export default function ReportPage() {
  const { user, profile, weights, target } = useJournal();
  const today = dayKey();
  const from = addDays(today, -(REPORT_DAYS - 1));
  const [entries, setEntries] = useState<Entry[] | null>(null);
  useEffect(() => store.watchEntries(user.uid, from, today, setEntries), [user.uid, from, today]);

  const report = useMemo(
    () => (profile && entries ? buildReport({ profile, weights, entries, today }) : null),
    [profile, weights, entries, today],
  );
  if (!profile || !report) return <p className="text-muted" role="status">Preparing your report…</p>;

  const unit = profile.weightUnit;
  const len = lengthUnit(unit);
  const w = (kg: number) => formatWeight(kg, unit);
  const change = (kg: number) => (kg === 0 ? "no change" : `${kg < 0 ? "down" : "up"} ${w(Math.abs(kg))}`);
  const age = new Date().getFullYear() - profile.birthYear;
  const planned = weeklyMinutes(profile.exerciseLevel);

  return (
    <>
      <div className="print:hidden">
        <Link href="/journal/progress" className="text-sm font-semibold text-leaf">‹ Progress</Link>
        <h1 className="mt-1 font-display text-3xl text-ink">Report for your GP</h1>
        <p className="mt-1 text-muted">
          A one-page summary of your journal to take to an appointment. Print it, or choose &quot;Save as PDF&quot; in
          the print window to keep or send a copy.
        </p>
        <button type="button" className="btn mt-4 w-full" onClick={() => window.print()}>
          Print or save as PDF
        </button>
      </div>

      <article className="card mt-5 p-5 text-[15px] print:mt-0 print:!rounded-none print:!border-0 print:!bg-transparent print:p-0 print:text-[13px] print:!shadow-none" aria-label="Report">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-2xl text-ink">Weight management summary</p>
            <p className="text-sm text-muted">From My Weight Loss Journal · {longDate(today)}</p>
          </div>
        </header>

        <Block title="About me">
          <dl>
            <Row label="Name">{profile.name || "Not given"}</Row>
            <Row label="Age and sex">{age} years, {profile.sex}</Row>
            <Row label="Height">{profile.heightCm} cm</Row>
            <Row label="Usual activity">{ACTIVITY_LABEL[profile.activity]}</Row>
          </dl>
        </Block>

        <Block title="Weight">
          <dl>
            <Row label={`Starting weight${report.startDate ? ` (${longDate(report.startDate)})` : ""}`}>
              {w(report.startKg)} · BMI {report.bmiStart.toFixed(1)}
            </Row>
            <Row label={`Current weight${report.currentDate ? ` (${longDate(report.currentDate)})` : ""}`}>
              {w(report.currentKg)} · BMI {report.bmiNow.toFixed(1)}
            </Row>
            <Row label="Change since starting">
              {change(report.changeKg)}
              {report.changeKg !== 0 ? ` (${Math.abs(report.changePercent)}% of starting weight)` : ""}
            </Row>
            <Row label="Rate over the last 4 weeks">
              {report.recentPaceKg === null ? "Not enough weigh-ins" : `${change(report.recentPaceKg)} a week`}
            </Row>
            <Row label="Goal weight">{w(profile.goalWeightKg)}</Row>
            {report.waist ? (
              <Row label={`Waist (${longDate(report.waist.date)})`}>
                {formatLength(report.waist.latestCm, len)} · waist-to-height {report.waist.ratio.toFixed(2)}
              </Row>
            ) : null}
          </dl>
          {report.weighIns.length > 1 ? (
            <table className="mt-3 w-full text-sm">
              <caption className="pb-1 text-left text-muted">Weigh-ins</caption>
              <tbody>
                <tr>
                  {report.weighIns.map((x) => (
                    <td key={x.date} className="border border-line px-1 py-1.5 text-center">
                      <span className="block text-xs text-muted">
                        {parseDay(x.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                      </span>
                      <span className="font-semibold tabular-nums text-ink">{w(x.kg)}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          ) : null}
        </Block>

        <Block title={`Last ${REPORT_DAYS} days`}>
          <dl>
            <Row label="Days with food logged">{report.daysLogged} of {REPORT_DAYS}</Row>
            <Row label="Average energy eaten">
              {report.averageKcal === null ? "Nothing logged" : `${report.averageKcal.toLocaleString()} kcal a day`}
            </Row>
            <Row label="Daily energy target">{target.toLocaleString()} kcal</Row>
            <Row label="Average protein">{report.averageProtein === null ? "Not known" : `${report.averageProtein} g a day`}</Row>
            <Row label="Exercise logged">
              {report.exerciseMinutesPerWeek} minutes a week{planned ? ` (plan: ${planned}, "${levelOf(profile.exerciseLevel).label}")` : ""}
            </Row>
            <Row label="Alcohol logged">
              {report.alcoholUnitsPerWeek} units a week (guideline: no more than {WEEKLY_UNIT_GUIDE})
            </Row>
          </dl>
        </Block>

        <Block title="What I would like to discuss">
          <div className="mt-2 space-y-7 pb-2" aria-hidden>
            <div className="border-b border-line" />
            <div className="border-b border-line" />
            <div className="border-b border-line" />
          </div>
        </Block>

        <p className="mt-5 text-xs text-muted print:mt-3">
          All figures were entered by the person named above and have not been checked by a clinician. Energy and
          protein are estimates from food logs. BMI and waist-to-height ratio are screening measures and are less
          reliable in pregnancy, in very muscular people and in some ethnic groups.
        </p>
      </article>
    </>
  );
}

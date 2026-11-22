import type { Glp1, Profile } from "./types";

export interface Medicine {
  id: string;
  /** Brand name people know it by, with the drug name. */
  label: string;
}

export const MEDICINES: Medicine[] = [
  { id: "semaglutide", label: "Wegovy (semaglutide)" },
  { id: "tirzepatide", label: "Mounjaro (tirzepatide)" },
  { id: "liraglutide", label: "Saxenda (liraglutide)" },
  { id: "other", label: "Another injection" },
];

export const medicineOf = (id: string | undefined) => MEDICINES.find((m) => m.id === id) ?? null;

/** The days an injection was logged, oldest first. */
export function injectionDays(glp1: Glp1 | undefined): string[] {
  return Object.keys(glp1?.log ?? {}).sort();
}

export interface InjectionRecord {
  medicine: Medicine;
  days: string[];
  last: string | null;
  /** Whole days since the last logged injection. */
  daysSince: number | null;
}

/** The person's injection record, or null when they do not use this part of the journal. */
export function injectionRecord(profile: Profile | null | undefined, today: string): InjectionRecord | null {
  const medicine = medicineOf(profile?.glp1?.medicine);
  if (!medicine) return null;
  const days = injectionDays(profile?.glp1);
  const last = days.at(-1) ?? null;
  return {
    medicine,
    days,
    last,
    daysSince: last ? Math.round((Date.parse(today) - Date.parse(last)) / 86_400_000) : null,
  };
}

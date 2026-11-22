import { addDays } from "./dates";
import type { Glp1, Injection, Profile } from "./types";

export type MedicineId = "semaglutide" | "tirzepatide" | "liraglutide" | "other";

export interface Medicine {
  id: MedicineId;
  /** Brand name people know it by, with the drug name. */
  label: string;
  /** Days between doses. */
  everyDays: number;
  /** The pen strengths in mg, lowest first. */
  doses: number[];
  /** What the patient leaflet says about a missed dose. */
  missed: string;
}

export const MEDICINES: Medicine[] = [
  {
    id: "semaglutide",
    label: "Wegovy (semaglutide)",
    everyDays: 7,
    doses: [0.25, 0.5, 1, 1.7, 2.4],
    missed: "If you are 5 days late or less, take it as soon as you remember and then go back to your usual day. If you are more than 5 days late, skip it and take the next dose on your usual day. Never take a double dose.",
  },
  {
    id: "tirzepatide",
    label: "Mounjaro (tirzepatide)",
    everyDays: 7,
    doses: [2.5, 5, 7.5, 10, 12.5, 15],
    missed: "If you are 4 days late or less, take it as soon as you remember and then go back to your usual day. If you are more than 4 days late, skip it and take the next dose on your usual day. Never take a double dose.",
  },
  {
    id: "liraglutide",
    label: "Saxenda (liraglutide)",
    everyDays: 1,
    doses: [0.6, 1.2, 1.8, 2.4, 3],
    missed: "If you are less than 12 hours late, take it as soon as you remember. If more than 12 hours have passed, skip it and take the next dose at your usual time. If you miss 3 days or more, speak to your prescriber before restarting. Never take a double dose.",
  },
  {
    id: "other",
    label: "Another injection",
    everyDays: 7,
    doses: [],
    missed: "Follow the leaflet that came with your medicine, or ask your pharmacist. Never take a double dose.",
  },
];

export const medicineOf = (id: string | undefined) => MEDICINES.find((m) => m.id === id) ?? null;

export const SITES = ["Stomach", "Thigh", "Upper arm"] as const;

export interface SideEffect {
  id: string;
  label: string;
  tips: string[];
}

export const SIDE_EFFECTS: SideEffect[] = [
  { id: "nausea", label: "Feeling sick", tips: ["Eat smaller meals, slowly, and stop when you first feel full.", "Avoid fatty, fried and very sweet food for a day or two after your injection.", "Plain food, ginger or peppermint tea and fresh air can help."] },
  { id: "constipation", label: "Constipation", tips: ["Drink at least 6 to 8 glasses of fluid a day.", "Add fibre gradually: oats, fruit, vegetables, beans and wholegrains.", "A daily walk helps. Ask your pharmacist about a laxative if it lasts more than a few days."] },
  { id: "diarrhoea", label: "Diarrhoea", tips: ["Drink plenty of fluid, and consider rehydration sachets from a pharmacy.", "Stick to plain food and avoid alcohol, caffeine and sweeteners until it settles."] },
  { id: "vomiting", label: "Being sick", tips: ["Take small sips of fluid often.", "If you cannot keep fluids down for 24 hours, contact your GP or NHS 111."] },
  { id: "heartburn", label: "Heartburn or burping", tips: ["Eat smaller meals and avoid eating within 3 hours of bed.", "Cut down on fizzy drinks, fatty food, alcohol and coffee."] },
  { id: "tired", label: "Tiredness", tips: ["Check you are eating enough, especially protein, and drinking enough.", "Tiredness is common in the first weeks and after a dose increase, and usually settles."] },
  { id: "low-appetite", label: "Hardly any appetite", tips: ["Eat by the clock rather than by hunger: three small meals with protein in each.", "Do not go below your calorie floor. Eating too little costs muscle as well as fat."] },
];

/** Symptoms that need medical advice, not self-care. */
export const RED_FLAGS = [
  "Severe pain in your stomach or back that does not go away, with or without being sick. This can be a sign of an inflamed pancreas. Stop the injections and get urgent medical help.",
  "Pain under your right ribs, a fever, or yellowing of your skin or eyes, which can be gallbladder problems.",
  "Being unable to keep fluids down, very dark urine, or feeling dizzy and faint, which are signs of dehydration.",
  "Swelling of your face, lips or throat, or trouble breathing. Call 999.",
  "Low mood or thoughts of harming yourself. Speak to your GP, or call NHS 111 or Samaritans on 116 123.",
  "You are pregnant, trying for a baby or breastfeeding. These medicines should not be used, so speak to your prescriber.",
];

export interface LoggedInjection extends Injection {
  date: string;
}

/** Every logged injection, oldest first. */
export function injections(glp1: Glp1 | undefined): LoggedInjection[] {
  return Object.entries(glp1?.log ?? {})
    .map(([date, i]) => ({ date, ...i }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface InjectionStatus {
  medicine: Medicine;
  last: LoggedInjection | null;
  /** The day the next dose is due, or null before the first one is logged. */
  nextDue: string | null;
  /** Days past the due day: 0 on the day, negative before it. */
  daysLate: number | null;
  /** A different place from last time, to rotate injection sites. */
  suggestedSite: string;
  /** How many doses in a row have been at the current strength. */
  dosesAtStrength: number;
}

const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

export function injectionStatus(profile: Profile | null | undefined, today: string): InjectionStatus | null {
  const medicine = medicineOf(profile?.glp1?.medicine);
  if (!medicine) return null;
  const list = injections(profile?.glp1);
  const last = list.at(-1) ?? null;
  const nextDue = last ? addDays(last.date, medicine.everyDays) : null;
  const lastSite = SITES.indexOf((last?.site ?? "") as (typeof SITES)[number]);
  let dosesAtStrength = 0;
  for (let i = list.length - 1; i >= 0 && list[i].dose === last?.dose; i--) dosesAtStrength++;
  return {
    medicine,
    last,
    nextDue,
    daysLate: nextDue ? daysBetween(nextDue, today) : null,
    suggestedSite: SITES[(lastSite + 1) % SITES.length],
    dosesAtStrength,
  };
}

/** Side effects ticked in the last four weeks, most frequent first. */
export function recentSideEffects(glp1: Glp1 | undefined, today: string) {
  const from = addDays(today, -27);
  const counts = new Map<string, number>();
  for (const i of injections(glp1)) {
    if (i.date < from) continue;
    for (const id of i.effects ?? []) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return SIDE_EFFECTS.filter((s) => counts.has(s.id)).sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
}

/** True from the due day for two weeks. After that the person has probably stopped, so the nudge goes quiet. */
export function injectionDue(profile: Profile | null | undefined, today: string) {
  const late = injectionStatus(profile, today)?.daysLate;
  return late !== null && late !== undefined && late >= 0 && late <= 14;
}

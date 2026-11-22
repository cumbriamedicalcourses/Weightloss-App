import { addDays } from "./dates";
import type { Entry, Profile, WeightLog } from "./types";

export interface Reminders {
  /** Nudge to log food on a day with nothing logged yet. */
  log: boolean;
  /** Nudge to weigh in once a week. */
  weigh: boolean;
  /** Also send the reminders by email. Off until the person asks for it. */
  email: boolean;
  /** The last day a reminder email went out (YYYY-MM-DD). Set by the server. */
  lastEmail?: string;
}

export const DEFAULT_REMINDERS: Reminders = { log: true, weigh: true, email: false };

export function remindersOf(profile: Profile | null | undefined): Reminders {
  return { ...DEFAULT_REMINDERS, ...profile?.reminders };
}

export interface Nudge {
  id: "weigh" | "log";
  title: string;
  body: string;
  href?: string;
  action: string;
}

/**
 * The one nudge worth showing on Today, if any. The weigh-in comes first
 * because the weekly plan update depends on it.
 */
export function nudgeFor(input: {
  reminders: Reminders;
  weights: WeightLog[];
  todayEntries: Entry[];
  today: string;
  /** Hour of the day, 0 to 23, on the person's own clock. */
  hour: number;
}): Nudge | null {
  const { reminders, weights, todayEntries, today, hour } = input;
  const last = weights.length ? weights[weights.length - 1].date : null;
  if (reminders.weigh && last && last <= addDays(today, -7)) {
    return {
      id: "weigh",
      title: "Time for your weekly weigh-in",
      body: "Your plan updates from your latest weight. First thing in the morning gives the steadiest reading.",
      href: "/journal/progress",
      action: "Weigh in",
    };
  }
  const hasFood = todayEntries.some((e) => e.kind === "food");
  if (reminders.log && !hasFood && hour >= 13) {
    return {
      id: "log",
      title: "Nothing logged yet today",
      body: "A rough entry is better than none. Logging as you go takes less than a minute a meal.",
      action: "Add food",
    };
  }
  return null;
}

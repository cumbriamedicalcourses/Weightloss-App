import { addDays } from "./dates";
import type { Reminders } from "./reminders";

export interface ReminderEmail {
  subject: string;
  text: string;
  html: string;
}

const SITE = "https://myweightlossjournal.com";

const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

/**
 * Decides whether someone gets a reminder email today, and writes it.
 * One email a day at most. Someone who has not logged for a week hears once
 * a week instead, and after a month of silence the emails stop on their own.
 */
export function reminderEmail(input: {
  name: string;
  reminders: Reminders;
  today: string;
  /** The day of the latest weigh-in, or null with none yet. */
  lastWeigh: string | null;
  /** The day of the latest journal entry, or null with none yet. */
  lastLog: string | null;
  unsubscribeUrl: string;
}): ReminderEmail | null {
  const { name, reminders, today, lastWeigh, lastLog, unsubscribeUrl } = input;
  if (!reminders.email) return null;
  if (reminders.lastEmail && reminders.lastEmail >= today) return null;

  // Activity of either kind counts as still using the journal.
  const lastSeen = [lastWeigh, lastLog].filter(Boolean).sort().at(-1) ?? null;
  if (!lastSeen || lastSeen < addDays(today, -30)) return null;
  const lapsed = !lastLog || lastLog < addDays(today, -7);
  if (lapsed && reminders.lastEmail && reminders.lastEmail > addDays(today, -7)) return null;

  const weighDue = reminders.weigh && Boolean(lastWeigh) && (lastWeigh as string) <= addDays(today, -7);
  const logDue = reminders.log && (!lastLog || lastLog < today);
  if (!weighDue && !logDue) return null;

  const lines: string[] = [];
  if (weighDue) lines.push("It has been a week since your last weigh-in. Your plan updates from your latest weight, so step on the scales tomorrow morning and add it on the Progress page.");
  if (logDue) {
    lines.push(
      lapsed
        ? "Your journal has been quiet for a few days. One meal logged today is enough to get going again."
        : "Nothing is in your journal for today yet. A rough entry is better than none, and it takes less than a minute a meal.",
    );
  }
  const subject = weighDue ? "Time for your weekly weigh-in" : lapsed ? "Your journal is waiting for you" : "Have you logged today?";
  const hello = name.trim() ? `Hello ${name.trim().split(/\s+/)[0]},` : "Hello,";
  const link = `${SITE}/journal`;

  const text = [hello, ...lines, `Open your journal: ${link}`, `My Weight Loss Journal\nTo stop these emails: ${unsubscribeUrl}`].join("\n\n");
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#1f2a37;max-width:520px">
<p>${escape(hello)}</p>
${lines.map((l) => `<p>${escape(l)}</p>`).join("\n")}
<p><a href="${link}" style="display:inline-block;background:#1d4f91;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">Open your journal</a></p>
<p style="font-size:13px;color:#667085;margin-top:28px">My Weight Loss Journal. You asked for these reminders on your Profile page.<br><a href="${escape(unsubscribeUrl)}" style="color:#667085">Stop these emails</a></p>
</div>`;
  return { subject, text, html };
}

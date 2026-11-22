import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { admin, sameSecret, unsubscribeToken } from "@/lib/admin";
import { reminderEmail } from "@/lib/reminder-email";
import { remindersOf } from "@/lib/reminders";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SITE = "https://myweightlossjournal.com";
/** Kept well under the mailbox's daily sending limit. */
const MAX_PER_RUN = 300;

/** Today's date in the UK, where the reminders are timed for. */
function ukToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

/**
 * Sends the day's reminder emails. A scheduled job on the host calls this
 * once each evening with the secret key. Running it twice in a day is safe:
 * nobody gets a second email.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  const given = url.searchParams.get("key") ?? req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!secret || !given || !sameSecret(given, secret)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }
  const fb = admin();
  const user = process.env.SMTP_USER || process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const pass = process.env.SMTP_PASSWORD;
  if (!fb || !user || !pass) {
    return NextResponse.json({ error: "Reminder emails are not set up yet.", missing: { database: !fb, mailbox: !user || !pass } }, { status: 503 });
  }
  const dryRun = url.searchParams.get("dry") === "1";

  const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: (Number(process.env.SMTP_PORT) || 465) === 465,
    auth: { user, pass },
  });

  const today = ukToday();
  const people = await fb.db.collection("users").where("reminders.email", "==", true).get();
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const doc of people.docs) {
    if (sent >= MAX_PER_RUN) break;
    try {
      const profile = doc.data() as Profile;
      const [weights, entries] = await Promise.all([
        doc.ref.collection("weights").orderBy("date", "desc").limit(1).get(),
        doc.ref.collection("entries").orderBy("date", "desc").limit(1).get(),
      ]);
      const email = reminderEmail({
        name: profile.name ?? "",
        reminders: remindersOf(profile),
        today,
        lastWeigh: (weights.docs[0]?.get("date") as string | undefined) ?? null,
        lastLog: (entries.docs[0]?.get("date") as string | undefined) ?? null,
        unsubscribeUrl: `${SITE}/api/reminders/off?u=${encodeURIComponent(doc.id)}&t=${unsubscribeToken(doc.id)}`,
      });
      if (!email) {
        skipped++;
        continue;
      }
      const account = await fb.auth.getUser(doc.id).catch(() => null);
      if (!account?.email) {
        skipped++;
        continue;
      }
      if (!dryRun) {
        await mailer.sendMail({
          from: `"My Weight Loss Journal" <${user}>`,
          to: account.email,
          subject: email.subject,
          text: email.text,
          html: email.html,
          headers: {
            "List-Unsubscribe": `<${SITE}/api/reminders/off?u=${encodeURIComponent(doc.id)}&t=${unsubscribeToken(doc.id)}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });
        await doc.ref.set({ reminders: { lastEmail: today } }, { merge: true });
      }
      sent++;
    } catch (err) {
      failed++;
      console.error("Reminder email failed:", (err as Error).message);
    }
  }
  return NextResponse.json({ date: today, dryRun, optedIn: people.size, sent, skipped, failed });
}

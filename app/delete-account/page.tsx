import type { Metadata } from "next";
import LegalPage, { CONTACT_EMAIL } from "@/components/legal-page";
import type { Block } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Delete your account",
  description: "How to delete your My Weight Loss Journal account and everything in it.",
};

const contact = CONTACT_EMAIL
  ? `email ${CONTACT_EMAIL} from the address you signed up with`
  : "contact us using the details on this website, from the address you signed up with";

const BODY: Block[] = [
  { p: "You can delete your My Weight Loss Journal account, and everything in it, at any time. This works the same on the website, the iPhone app and the Android app." },
  { h: "Delete it yourself" },
  { list: [
    "Sign in on myweightlossjournal.com or in the app.",
    "Open Profile.",
    "Scroll to Your data and choose Delete my account and data.",
    "Type DELETE to confirm and choose Delete everything.",
  ] },
  { p: "You do not need a membership to do this. For your security, you may be asked to sign out and sign in again first. If you would like a copy of your journal, choose Download my data on the same page before deleting." },
  { h: "Ask us to delete it" },
  { p: `If you can't sign in, ${contact} and ask us to delete your account. We will do it within 30 days and confirm by email.` },
  { h: "What is deleted" },
  { list: [
    "Your sign-in, email address and name.",
    "Your profile, targets and settings.",
    "Every journal entry: food, drink, exercise, weigh-ins, steps, water, fasting, measurements, injection records, saved meals and favourites.",
  ] },
  { p: "These are removed straight away. Copies in routine backups held by our providers are removed on their normal cycles. Progress photos and coach chats are only ever kept on your own device. Payment records held by Stripe are kept for as long as the law requires, and cancelling your account does not on its own cancel a membership, so please cancel that first under Profile, then Membership." },
];

export default function DeleteAccountPage() {
  return <LegalPage title="Delete your account" updated="26 November 2026" body={BODY} />;
}

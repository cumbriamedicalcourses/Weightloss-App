import type { Metadata } from "next";
import LegalPage, { CONTACT_EMAIL } from "@/components/legal-page";
import type { Block } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What My Weight Loss Journal collects, where it is kept, who it is shared with and how to delete it.",
};

const contact = CONTACT_EMAIL ? `email ${CONTACT_EMAIL}` : "use the contact details on this website";

const BODY: Block[] = [
  { p: "My Weight Loss Journal is the companion app to the Weight Loss Journal book. This page explains in plain words what information the app holds about you and what happens to it. We collect only what the journal needs to work, we do not sell it, and we do not use it for advertising." },
  { h: "What we collect" },
  { list: [
    "Your account: your email address and first name, and your basic Google profile if you sign in with Google. Passwords are handled by Google's sign-in service and we never see them.",
    "Your profile: sex, year of birth, height, weight, goal weight, activity level and chosen pace. These are used to work out your daily calorie target.",
    "Your journal: the food, drink and exercise you log, your water count, your weigh-ins, the foods you mark as favourites, and the meals and recipes you save, any step counts, fasting hours and body measurements you enter, and, if you choose to use it, the weight-loss injection you use and the dates you took it.",
    "Photos and descriptions of meals, only for the moment it takes to estimate them. They are not saved in your journal or on our servers.",
    "Progress photos, if you add them, are kept only in the browser on your own device. They are never sent to us or to anyone else, and deleting your account on that device removes them.",
  ] },
  { p: "Information about your weight and what you eat is health information, which the law treats as especially sensitive. We hold it only because you choose to enter it, and you can remove it at any time." },
  { h: "Where it is kept and who helps us run the app" },
  { p: "We use a small number of companies to provide the service. They handle your information only on our instructions." },
  { list: [
    "Google Firebase stores your account and your journal, and provides sign-in. Google may process account information in the United States and other countries under its standard legal safeguards.",
    "Hostinger hosts the website.",
    "Stripe takes membership payments. You enter your card details on Stripe's own secure page, and we never see or keep your full card number. Stripe tells us your membership status, your plan and when it renews, which we keep with your account. Stripe keeps payment records as the law requires and may process them in the United States under its standard legal safeguards.",
    "Anthropic provides the service that estimates calories from a photo or a description. The photo or text is sent for that purpose without your name or email address.",
    "Anthropic also writes the answers when you ask the coach a question. Your question, the recent messages in that chat and a summary of your journal (such as your age, height, weights, daily calorie totals, exercise and today's food) are sent for that purpose without your name or email address. The chat itself is kept only in the browser on your own device. We keep a count of how many questions each account asks in a day, to keep costs under control.",
    "USDA FoodData Central provides the food search. Only the words you search for are sent.",
    "Reminder emails are sent only if you switch them on in your Profile, to the email address you signed in with, from our own mailbox at Hostinger. Every email has a link to stop them.",
    "Open Food Facts provides the barcode lookup. Only the barcode number is sent. The camera picture used to read the barcode stays on your device.",
  ] },
  { h: "What is kept on your device" },
  { p: "Your browser keeps you signed in and holds a copy of your journal so that it works without a connection. It also remembers your choice of meal plan. We do not use advertising or tracking cookies, and we do not use analytics that follow you around the web." },
  { h: "How we use your information" },
  { list: [
    "To show you your journal on any device you sign in on.",
    "To calculate your targets, totals, charts and weekly check-in. These are worked out from your own entries.",
    "To keep the service secure and prevent misuse.",
  ] },
  { p: "We rely on your consent to hold your health information, and on our agreement with you to provide the account you asked for. We do not use your information to make automated decisions that have legal effects on you." },
  { h: "How long we keep it" },
  { p: "We keep your information for as long as you have an account. When you delete your account, your profile, journal entries, weigh-ins and sign-in are removed straight away. Copies in routine backups held by our providers are removed on their normal cycles." },
  { h: "Your choices and rights" },
  { list: [
    "See and correct your information at any time in the app.",
    "Download a copy: Profile, then Download my data.",
    "Delete everything: Profile, then Delete my account and data.",
    "Withdraw your consent by deleting your account.",
    "Complain to the Information Commissioner's Office (ico.org.uk) if you are unhappy with how your information is handled.",
  ] },
  { h: "Age" },
  { p: "The app is for adults aged 18 and over. Please do not use it if you are younger." },
  { h: "Changes and contact" },
  { p: `If we change this policy we will update this page and the date at the top. For any question about your information, ${contact}.` },
];

export default function PrivacyPage() {
  return <LegalPage title="Privacy policy" updated="23 November 2026" body={BODY} />;
}

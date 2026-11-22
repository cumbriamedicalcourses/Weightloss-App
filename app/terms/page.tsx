import type { Metadata } from "next";
import LegalPage, { CONTACT_EMAIL } from "@/components/legal-page";
import type { Block } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms for using My Weight Loss Journal.",
};

const contact = CONTACT_EMAIL ? `email ${CONTACT_EMAIL}` : "use the contact details on this website";

const BODY: Block[] = [
  { p: "These terms apply when you use My Weight Loss Journal. By creating an account you agree to them. They are written to be read, so please do." },
  { h: "What the app is" },
  { p: "My Weight Loss Journal is a tool for keeping a record of what you eat, how you move and what you weigh. It also offers meal plans and articles for general information." },
  { h: "Not medical advice" },
  { list: [
    "Nothing in the app is medical advice, a diagnosis or a treatment, and it does not replace a doctor, dietitian or other health professional.",
    "Calorie, nutrition and exercise figures are estimates. Estimates from photos and descriptions can be wrong, so check them before saving.",
    "Speak to your GP before starting a weight loss plan, especially if you have a health condition, take regular medication, are pregnant or breastfeeding, or have or have had an eating disorder.",
    "Stop and seek medical advice if you feel unwell while following a plan.",
  ] },
  { h: "Who can use it" },
  { p: "You must be 18 or over. The app is for your own personal use." },
  { h: "Your account" },
  { p: "Keep your sign-in details private and tell us if you think someone else has used your account. The information you enter is yours. You can download or delete it at any time from your profile, and our privacy policy explains how it is handled." },
  { h: "Fair use" },
  { list: [
    "Do not try to break, overload or gain unauthorised access to the service.",
    "Do not use automated tools to send requests in bulk.",
    "Do not upload anything unlawful or anything that is not yours to share.",
  ] },
  { p: "Photo and description estimates have a daily limit for each person so that the service stays available for everyone. We may suspend an account that is misused." },
  { h: "Our content" },
  { p: "The app, its design, meal plans and articles belong to My Weight Loss Journal. You may use them for yourself, and you may not copy or republish them without permission." },
  { h: "Availability and changes" },
  { p: "The app is free and provided as it is. We work to keep it running and accurate but cannot promise it will always be available or free of errors. We may add, change or remove features, and we will give reasonable notice before closing the service so that you can download your data." },
  { h: "Our responsibility to you" },
  { p: "We are not responsible for losses that we could not reasonably have foreseen, or for decisions you make based on estimates or general information in the app. Nothing in these terms limits any liability that cannot be limited by law, or your rights as a consumer." },
  { h: "Law" },
  { p: "These terms are governed by the law of England and Wales." },
  { h: "Changes and contact" },
  { p: `If we change these terms we will update this page and the date at the top. For any question, ${contact}.` },
];

export default function TermsPage() {
  return <LegalPage title="Terms of use" updated="22 November 2026" body={BODY} />;
}

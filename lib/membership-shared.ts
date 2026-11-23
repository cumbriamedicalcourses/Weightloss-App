/** Membership facts that both the browser and the server use. */

export type Plan = "monthly" | "yearly";

export const TRIAL_DAYS = 7;
export const GUARANTEE_DAYS = 30;

/** Prices as shown in the app. Checkout shows the real amount, in the visitor's currency where one is set up. */
export const PLANS: { id: Plan; name: string; price: string; per: string; note: string }[] = [
  { id: "monthly", name: "Monthly", price: "£7.99", per: "a month", note: "Cancel at any time" },
  { id: "yearly", name: "Yearly", price: "£59.99", per: "a year", note: "Works out at £5 a month. Save 37%" },
];

export interface MembershipView {
  /** False until membership is switched on, when everyone has full access. */
  required: boolean;
  access: boolean;
  /** On the free access list, such as the owner's own account. */
  free: boolean;
  status: string;
  plan: Plan | null;
  /** Unix seconds. */
  trialEnd: number | null;
  periodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  canManage: boolean;
  trialAvailable: boolean;
  trialDays: number;
}

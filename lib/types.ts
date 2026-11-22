export type Sex = "female" | "male";
export type WeightUnit = "kg" | "lb";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";

export interface Profile {
  name: string;
  sex: Sex;
  birthYear: number;
  heightCm: number;
  startWeightKg: number;
  goalWeightKg: number;
  activity: ActivityLevel;
  /** Planned loss per week, in kg. */
  pacePerWeekKg: number;
  weightUnit: WeightUnit;
  /** Optional manual override of the calculated daily target. */
  customTarget?: number | null;
}

export type Meal = "breakfast" | "lunch" | "dinner" | "snack";

export interface Entry {
  id: string;
  /** Local calendar day, YYYY-MM-DD. */
  date: string;
  kind: "food" | "exercise";
  name: string;
  calories: number;
  meal?: Meal;
  /** Free-text portion, e.g. "150 g" or "1 bowl". */
  portion?: string;
  minutes?: number;
  source?: "search" | "photo" | "manual";
  createdAt: number;
}

export type NewEntry = Omit<Entry, "id" | "createdAt">;

export interface WeightLog {
  /** YYYY-MM-DD, one weigh-in per day. */
  date: string;
  kg: number;
}

export interface FoodResult {
  id: string;
  name: string;
  kcalPer100g: number;
  measures: { label: string; grams: number }[];
}

export interface EstimateItem {
  name: string;
  portion: string;
  calories: number;
}

export interface EstimateResult {
  items: EstimateItem[];
  confidence: "low" | "medium" | "high";
  notes: string;
}

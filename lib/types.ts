export type Sex = "female" | "male";
export type WeightUnit = "kg" | "lb" | "st";
/** How much planned exercise the person has chosen. "none" leaves the whole calorie gap to food. */
export type ExerciseLevel = "none" | "starting" | "building" | "active";
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
  /** The day the person wants to reach their goal by (YYYY-MM-DD), when they chose a date rather than a pace. */
  targetDate?: string | null;
  exerciseLevel?: ExerciseLevel;
  /** Which reminders the person wants. Missing means the defaults. */
  reminders?: { log: boolean; weigh: boolean; email?: boolean; lastEmail?: string };
  /** Foods the person has starred for quick logging. */
  favourites?: Favourite[];
  /** Meals and recipes the person has saved to log again in one tap. */
  savedMeals?: SavedMeal[];
  /** Glasses of water drunk, by day (YYYY-MM-DD). */
  water?: Record<string, number>;
  /** Body measurements in centimetres, by day (YYYY-MM-DD). */
  measurements?: Record<string, Measurement>;
  /** Weight-loss injections, for people who use them. */
  glp1?: Glp1;
}

export interface Glp1 {
  /** Which medicine: semaglutide, tirzepatide, liraglutide or other. */
  medicine?: string;
  /** Injections by day (YYYY-MM-DD). */
  log?: Record<string, Injection>;
}

/** A logged injection. Only the day is recorded, as the key it is stored under. */
export interface Injection {
  taken: true;
}

/** Tape measurements in centimetres. Any of them can be left out. */
export interface Measurement {
  waist?: number;
  hips?: number;
  chest?: number;
  thigh?: number;
  arm?: number;
}

/** Protein, carbohydrate and fat in grams. Missing when not known. */
export interface Macros {
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Favourite extends Macros {
  name: string;
  calories: number;
  portion?: string;
  /** Alcohol units, for alcoholic drinks. */
  units?: number;
}

export interface SavedMeal {
  id: string;
  name: string;
  /** How many servings the items make. 1 for an ordinary meal. */
  servings: number;
  items: Favourite[];
}

export type Meal = "breakfast" | "lunch" | "dinner" | "snack";

export interface Entry extends Macros {
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
  /** Alcohol units, for alcoholic drinks. */
  units?: number;
  source?: "search" | "photo" | "manual" | "recent" | "copy" | "plan" | "describe" | "saved" | "drink";
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
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  measures: { label: string; grams: number }[];
}

export interface EstimateItem extends Macros {
  name: string;
  portion: string;
  calories: number;
}

export interface EstimateResult {
  items: EstimateItem[];
  confidence: "low" | "medium" | "high";
  notes: string;
}

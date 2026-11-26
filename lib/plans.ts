import type { Meal } from "./types";

export type Diet = "any" | "vegetarian" | "vegan";
export const DIETS: { id: Diet; label: string }[] = [
  { id: "any", label: "Non-vegetarian" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
];

export const BANDS = [1200, 1500, 1800, 2000] as const;
export type Band = (typeof BANDS)[number];

export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export interface PlanItem {
  name: string;
  /** What goes into it, in everyday amounts. */
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface PlanMeal {
  meal: Meal;
  items: PlanItem[];
}

// Each line: name, what goes into it, kcal, protein g, carbs g, fat g.
// Figures are worked out from McCance and Widdowson's Composition of Foods
// Integrated Dataset (CoFID 2021, Public Health England) for the amounts
// given. The working, with the CoFID food code used for each ingredient, is
// in docs/meal-plan-calories.md.
type Row = [string, string, number, number, number, number];
const item = ([name, portion, calories, protein, carbs, fat]: Row): PlanItem => ({
  name,
  portion,
  calories,
  protein,
  carbs,
  fat,
});

const PORRIDGE: Row = ["Porridge with banana", "40 g oats, 200 ml semi-skimmed milk, 1 small banana", 310, 13, 54, 7];
const EGGS_TOAST: Row = ["Scrambled eggs on toast", "2 eggs, 1 slice wholemeal toast, 1 tsp butter", 245, 16, 15, 14];
const YOGHURT: Row = ["Greek yoghurt with berries and granola", "150 g fat-free Greek yoghurt, 80 g berries, 40 g granola, 1 tsp honey", 290, 11, 51, 6];
const PB_TOAST: Row = ["Peanut butter and banana on toast", "2 slices wholemeal toast, 15 g peanut butter, half a banana", 290, 11, 42, 10];
const EGG_AVOCADO: Row = ["Poached egg and avocado on toast", "2 slices wholemeal toast, 1 egg, half a small avocado", 305, 14, 31, 15];
const BRAN: Row = ["Bran flakes with milk and berries", "50 g bran flakes, 200 ml semi-skimmed milk, 80 g berries", 285, 13, 52, 5];
const LENTIL_SOUP: Row = ["Lentil and vegetable soup with a roll", "400 g soup, 1 wholemeal roll, 1 tsp spread", 330, 17, 56, 5];
const FALAFEL_WRAP: Row = ["Hummus and falafel wrap", "1 wholemeal wrap, 3 falafel, 30 g hummus, salad", 375, 11, 47, 18];
const CHICKPEA_CURRY: Row = ["Chickpea and spinach curry with rice", "120 g chickpeas, tomato and spinach sauce, 1 tsp oil, 125 g cooked rice", 395, 18, 63, 10];
const TOFU_STIR_FRY: Row = ["Tofu stir fry with noodles", "200 g firm tofu, stir fry vegetables, 60 g dry noodles, 1 tsp oil", 450, 28, 55, 15];
const BEAN_CHILLI: Row = ["Three bean chilli with rice", "200 g mixed beans, tomatoes and peppers, 125 g cooked rice", 415, 22, 75, 5];

const MAINS: Record<Diet, { breakfast: Row[]; lunch: Row[]; dinner: Row[] }> = {
  any: {
    breakfast: [
      PORRIDGE,
      EGGS_TOAST,
      YOGHURT,
      PB_TOAST,
      EGG_AVOCADO,
      BRAN,
      ["Smoked salmon and cream cheese bagel", "1 bagel thin, 30 g light cream cheese, 50 g smoked salmon", 260, 19, 27, 9],
    ],
    lunch: [
      ["Chicken salad wrap", "1 wholemeal wrap, 100 g grilled chicken, salad, 1 tbsp light mayonnaise", 380, 38, 37, 10],
      ["Tuna and sweetcorn jacket potato", "200 g baked potato, 1 small tin tuna in water, 30 g sweetcorn, 1 tbsp light mayonnaise, salad", 385, 32, 52, 6],
      LENTIL_SOUP,
      ["Turkey salad sandwich and an apple", "2 slices wholemeal bread, 80 g turkey, salad, 1 tbsp light mayonnaise, 1 apple", 360, 27, 47, 8],
      ["Chicken, rice and vegetable bowl", "100 g chicken breast, 125 g cooked brown rice, vegetables, 1 tsp oil", 395, 40, 43, 8],
      ["Egg and new potato salad", "2 boiled eggs, 200 g new potatoes, salad, 1 tbsp light dressing, 1 slice wholemeal bread", 365, 21, 48, 10],
      ["Prawn and avocado salad with pitta", "100 g prawns, half an avocado, salad, 1 wholemeal pitta", 355, 24, 36, 14],
    ],
    dinner: [
      ["Salmon with new potatoes and greens", "120 g salmon fillet, 150 g new potatoes, broccoli and green beans", 405, 32, 28, 19],
      ["Chicken stir fry with noodles", "120 g chicken breast, stir fry vegetables, 50 g dry egg noodles, 1 tsp oil", 450, 49, 46, 9],
      ["Turkey chilli with rice", "125 g lean turkey mince, kidney beans and tomatoes, 125 g cooked rice", 485, 48, 53, 10],
      ["Baked cod with sweet potato mash and peas", "150 g cod, 200 g sweet potato, 80 g peas, 1 tsp butter", 435, 34, 65, 6],
      ["Spaghetti bolognese", "100 g lean beef mince, tomato sauce, 60 g dry wholewheat spaghetti, 10 g parmesan", 415, 38, 49, 9],
      ["Chicken tikka with rice and salad", "130 g chicken breast in yoghurt and spices, 150 g cooked rice, salad", 400, 48, 44, 5],
      ["Roast chicken dinner", "120 g chicken breast without skin, 150 g roast potatoes, vegetables, gravy", 485, 45, 50, 13],
    ],
  },
  vegetarian: {
    breakfast: [
      PORRIDGE,
      EGGS_TOAST,
      YOGHURT,
      PB_TOAST,
      EGG_AVOCADO,
      BRAN,
      ["Cottage cheese and tomato on toast", "2 slices wholemeal toast, 100 g cottage cheese, 1 tomato", 280, 17, 36, 8],
    ],
    lunch: [
      FALAFEL_WRAP,
      ["Cheese and beans jacket potato", "200 g baked potato, 200 g baked beans, 20 g cheddar", 440, 20, 75, 8],
      LENTIL_SOUP,
      ["Egg mayonnaise sandwich", "2 slices wholemeal bread, 2 boiled eggs, 1 tbsp light mayonnaise, cress", 330, 20, 31, 15],
      ["Halloumi and couscous salad", "60 g grilled halloumi, 50 g dry couscous, roasted vegetables, lemon", 435, 25, 51, 16],
      ["Greek salad with pitta", "50 g feta, olives, tomato and cucumber, 1 tsp olive oil, 1 wholemeal pitta", 370, 15, 38, 18],
      ["Vegetable omelette with salad", "2 eggs, vegetables, 20 g cheese, 1 tsp oil, 1 slice wholemeal bread", 380, 25, 22, 22],
    ],
    dinner: [
      CHICKPEA_CURRY,
      TOFU_STIR_FRY,
      BEAN_CHILLI,
      ["Meat-free bolognese", "100 g meat-free mince, tomato sauce, 75 g dry wholewheat spaghetti, 10 g hard cheese", 400, 29, 60, 7],
      ["Vegetable lasagne with salad", "400 g vegetable lasagne, side salad", 385, 18, 54, 13],
      ["Paneer tikka with rice and salad", "80 g paneer in yoghurt and spices, 100 g cooked rice, salad", 410, 26, 31, 21],
      ["Roasted vegetable and feta pasta", "60 g dry wholewheat pasta, roasted vegetables, 1 tsp olive oil, 40 g feta", 400, 19, 51, 15],
    ],
  },
  vegan: {
    breakfast: [
      ["Porridge with soya milk and banana", "40 g oats, 200 ml soya milk, 1 small banana", 305, 12, 50, 8],
      ["Tofu scramble on toast", "120 g firm tofu, 1 tsp oil, 2 slices wholemeal toast", 285, 16, 31, 11],
      ["Soya yoghurt with berries, granola and seeds", "150 g soya yoghurt, 80 g berries, 30 g granola, 10 g seeds", 310, 10, 44, 12],
      PB_TOAST,
      ["Avocado and tomato on toast", "2 slices wholemeal toast, half an avocado, tomatoes", 295, 9, 34, 14],
      ["Bran flakes with soya milk and berries", "50 g bran flakes, 200 ml soya milk, 80 g berries", 280, 12, 47, 6],
      ["Overnight oats with chia and berries", "40 g oats, 10 g chia seeds, 150 ml soya milk, 80 g berries", 300, 12, 39, 12],
    ],
    lunch: [
      FALAFEL_WRAP,
      ["Baked beans jacket potato", "200 g baked potato, 200 g baked beans, salad", 370, 16, 77, 2],
      ["Lentil and vegetable soup with a roll", "400 g soup, 1 wholemeal roll, 1 tsp dairy-free spread", 330, 17, 56, 5],
      ["Chickpea and sweetcorn sandwich", "2 slices wholemeal bread, 100 g mashed chickpeas, 1 tbsp vegan mayonnaise, sweetcorn", 350, 16, 54, 10],
      ["Tofu, rice and vegetable bowl", "150 g firm tofu, 150 g cooked brown rice, vegetables, 1 tsp oil", 390, 21, 51, 13],
      ["Quinoa and black bean salad", "75 g dry quinoa, 80 g black beans, peppers and sweetcorn, 1 tsp oil, lime", 385, 19, 60, 10],
      ["Peanut noodle salad", "50 g dry rice noodles, vegetables, 50 g edamame, 15 g peanut butter, soy sauce", 335, 15, 44, 12],
    ],
    dinner: [
      CHICKPEA_CURRY,
      TOFU_STIR_FRY,
      BEAN_CHILLI,
      ["Lentil bolognese", "100 g cooked lentils, tomato sauce, 1 tsp oil, 75 g dry wholewheat spaghetti", 420, 19, 74, 7],
      ["Butter bean and vegetable stew with bread", "150 g butter beans, tomatoes and vegetables, 1 tsp oil, 2 small slices of bread", 375, 21, 59, 8],
      ["Tofu tikka with rice and salad", "200 g firm tofu in soya yoghurt and spices, 1 tsp oil, 150 g cooked rice, salad", 400, 22, 46, 15],
      ["Roasted vegetable and white bean pasta", "60 g dry wholewheat pasta, roasted vegetables, 100 g cannellini beans, 1 tsp olive oil", 405, 20, 67, 8],
    ],
  },
};

// Extras are all plant based, so the same ones suit every plan.
const SNACK_LIGHT: Row[] = [
  ["Apple with almonds", "1 apple, 10 g almonds", 115, 3, 14, 6],
  ["Banana", "1 medium banana", 80, 1, 20, 0],
  ["Carrot sticks with hummus", "1 carrot, 30 g hummus", 120, 2, 9, 8],
  ["Pear and grapes", "1 pear, a small handful of grapes", 100, 1, 25, 0],
];
const SNACK_MEDIUM: Row[] = [
  ["Mixed nuts", "25 g unsalted mixed nuts", 155, 5, 2, 14],
  ["Oatcakes with peanut butter", "2 oatcakes, 10 g peanut butter", 160, 4, 15, 10],
  ["Soya yoghurt with berries and seeds", "150 g soya yoghurt, 50 g berries, 10 g seeds", 180, 7, 21, 8],
  ["Avocado on toast", "1 slice wholemeal toast, quarter of an avocado", 140, 4, 16, 7],
];
const SNACK_LARGE: Row[] = [
  ["Hummus with pitta", "40 g hummus, half a wholemeal pitta", 200, 5, 21, 11],
  ["Banana with peanut butter", "1 small banana, 15 g peanut butter", 155, 4, 18, 8],
  ["Nuts and raisins with a satsuma", "30 g nuts and raisins, 1 satsuma", 155, 4, 16, 9],
];
const BREAKFAST_EXTRA: Row[] = [
  ["Toast with peanut butter", "1 slice wholemeal toast, 10 g peanut butter", 140, 6, 16, 6],
  ["Orange juice and a banana", "150 ml orange juice, 1 medium banana", 135, 3, 33, 0],
  ["Seeds and nuts", "20 g mixed seeds and nuts", 120, 4, 2, 11],
];
const LUNCH_EXTRA: Row[] = [
  ["Wholemeal roll", "1 small wholemeal roll", 140, 6, 27, 2],
  ["Fruit and nuts", "1 piece of fruit, 15 g nuts", 150, 3, 14, 9],
  ["Three bean salad", "100 g three bean salad", 115, 8, 17, 2],
];
const DINNER_EXTRA: Row[] = [
  ["Extra rice, pasta or potatoes", "125 g more, cooked weight", 135, 4, 29, 1],
  ["Bread with olive spread", "1 slice crusty bread, 1 tsp olive spread", 150, 5, 26, 4],
  ["Fruit salad with soya yoghurt", "120 g fruit salad, 100 g soya yoghurt", 125, 4, 25, 2],
];

const pick = (rows: Row[], day: number) => item(rows[day % rows.length]);

export type MainMeal = "breakfast" | "lunch" | "dinner";
/** Which of the seven main dishes to use for a meal, in place of the day's own. */
export type Swaps = Partial<Record<MainMeal, number>>;

/** The seven main dishes a meal can be swapped between. */
export function mainOptions(diet: Diet, meal: MainMeal): PlanItem[] {
  return MAINS[diet][meal].map(item);
}

/** The meals for one day (0 = Monday) of a plan, with any swaps applied. */
export function planDay(diet: Diet, band: Band, day: number, swaps: Swaps = {}): PlanMeal[] {
  const mains = MAINS[diet];
  const main = (meal: MainMeal) => item(mains[meal][swaps[meal] ?? day] ?? mains[meal][day]);
  const breakfast = [main("breakfast")];
  const lunch = [main("lunch")];
  const dinner = [main("dinner")];
  const snack = [pick(SNACK_LIGHT, day)];
  if (band >= 1500) {
    snack.push(pick(SNACK_MEDIUM, day));
    dinner.push(pick(DINNER_EXTRA, day));
  }
  if (band >= 1800) {
    breakfast.push(pick(BREAKFAST_EXTRA, day));
    lunch.push(pick(LUNCH_EXTRA, day));
  }
  if (band >= 2000) snack.push(pick(SNACK_LARGE, day));
  return [
    { meal: "breakfast", items: breakfast },
    { meal: "lunch", items: lunch },
    { meal: "dinner", items: dinner },
    { meal: "snack", items: snack },
  ];
}

export function total(meals: PlanMeal[], key: "calories" | "protein" | "carbs" | "fat" = "calories") {
  return meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i[key], 0), 0);
}

/** The plan closest to a person's daily calorie target. */
export function nearestBand(target: number): Band {
  return BANDS.reduce((best, b) => (Math.abs(b - target) < Math.abs(best - target) ? b : best), BANDS[0]);
}

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
// Figures are estimates for the amounts given.
type Row = [string, string, number, number, number, number];
const item = ([name, portion, calories, protein, carbs, fat]: Row): PlanItem => ({
  name,
  portion,
  calories,
  protein,
  carbs,
  fat,
});

const PORRIDGE: Row = ["Porridge with banana", "40 g oats, 200 ml semi-skimmed milk, 1 small banana", 325, 13, 55, 6];
const EGGS_TOAST: Row = ["Scrambled eggs on toast", "2 eggs, 1 slice wholemeal toast, 1 tsp butter", 275, 17, 15, 16];
const YOGHURT: Row = ["Greek yoghurt with berries and granola", "150 g fat-free Greek yoghurt, 80 g berries, 30 g granola, 1 tsp honey", 275, 19, 38, 5];
const PB_TOAST: Row = ["Peanut butter and banana on toast", "2 slices wholemeal toast, 15 g peanut butter, half a banana", 315, 12, 45, 10];
const EGG_AVOCADO: Row = ["Poached egg and avocado on toast", "1 slice wholemeal toast, 1 egg, half a small avocado", 285, 11, 17, 19];
const BRAN: Row = ["Bran flakes with milk and berries", "40 g bran flakes, 200 ml semi-skimmed milk, 80 g berries", 265, 11, 45, 5];
const LENTIL_SOUP: Row = ["Lentil and vegetable soup with a roll", "400 g soup, 1 wholemeal roll, 1 tsp spread", 375, 17, 60, 6];
const FALAFEL_WRAP: Row = ["Hummus and falafel wrap", "1 wholemeal wrap, 3 falafel, 30 g hummus, salad", 420, 14, 50, 16];
const CHICKPEA_CURRY: Row = ["Chickpea and spinach curry with rice", "120 g chickpeas, tomato and spinach sauce, 1 tsp oil, 125 g cooked rice", 430, 16, 62, 11];
const TOFU_STIR_FRY: Row = ["Tofu stir fry with noodles", "150 g firm tofu, stir fry vegetables, 50 g dry noodles, 1 tsp oil", 455, 27, 45, 17];
const BEAN_CHILLI: Row = ["Three bean chilli with rice", "200 g mixed beans, tomatoes and peppers, 125 g cooked rice", 420, 19, 75, 4];

const MAINS: Record<Diet, { breakfast: Row[]; lunch: Row[]; dinner: Row[] }> = {
  any: {
    breakfast: [
      PORRIDGE,
      EGGS_TOAST,
      YOGHURT,
      PB_TOAST,
      EGG_AVOCADO,
      BRAN,
      ["Smoked salmon and cream cheese bagel", "1 bagel thin, 30 g light cream cheese, 50 g smoked salmon", 245, 18, 22, 9],
    ],
    lunch: [
      ["Chicken salad wrap", "1 wholemeal wrap, 100 g grilled chicken, salad, 1 tbsp light mayonnaise", 370, 34, 30, 11],
      ["Tuna and sweetcorn jacket potato", "200 g baked potato, 1 small tin tuna in water, 30 g sweetcorn, 1 tbsp light mayonnaise, salad", 350, 32, 45, 5],
      LENTIL_SOUP,
      ["Turkey salad sandwich and an apple", "2 slices wholemeal bread, 80 g turkey, salad, 1 tbsp light mayonnaise, 1 apple", 355, 28, 45, 6],
      ["Chicken, rice and vegetable bowl", "100 g chicken breast, 125 g cooked brown rice, vegetables, 1 tsp oil", 400, 36, 42, 9],
      ["Egg and new potato salad", "2 boiled eggs, 150 g new potatoes, salad, 1 tbsp light dressing, 1 slice wholemeal bread", 380, 19, 38, 14],
      ["Prawn and avocado salad with pitta", "100 g prawns, half an avocado, salad, 1 wholemeal pitta", 350, 26, 32, 13],
    ],
    dinner: [
      ["Salmon with new potatoes and greens", "120 g salmon fillet, 150 g new potatoes, broccoli and green beans", 400, 30, 25, 19],
      ["Chicken stir fry with noodles", "120 g chicken breast, stir fry vegetables, 50 g dry egg noodles, 1 tsp oil", 455, 40, 45, 11],
      ["Turkey chilli with rice", "125 g lean turkey mince, kidney beans and tomatoes, 125 g cooked rice", 440, 38, 48, 8],
      ["Baked cod with sweet potato mash and peas", "150 g cod, 200 g sweet potato, 80 g peas, 1 tsp butter", 380, 33, 48, 5],
      ["Spaghetti bolognese", "100 g lean beef mince, tomato sauce, 60 g dry wholewheat spaghetti, 10 g parmesan", 445, 35, 50, 10],
      ["Chicken tikka with rice and salad", "130 g chicken breast in yoghurt and spices, 125 g cooked rice, salad", 385, 42, 40, 6],
      ["Roast chicken dinner", "120 g chicken breast without skin, 150 g roast potatoes, vegetables, gravy", 490, 40, 45, 14],
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
      ["Cottage cheese and tomato on toast", "2 slices wholemeal toast, 100 g cottage cheese, 1 tomato", 290, 20, 34, 6],
    ],
    lunch: [
      FALAFEL_WRAP,
      ["Cheese and beans jacket potato", "200 g baked potato, 200 g baked beans, 20 g cheddar", 420, 20, 65, 8],
      LENTIL_SOUP,
      ["Egg mayonnaise sandwich", "2 slices wholemeal bread, 2 boiled eggs, 1 tbsp light mayonnaise, cress", 365, 21, 32, 16],
      ["Halloumi and couscous salad", "60 g grilled halloumi, 50 g dry couscous, roasted vegetables, lemon", 390, 20, 40, 16],
      ["Greek salad with pitta", "50 g feta, olives, tomato and cucumber, 1 tsp olive oil, 1 wholemeal pitta", 390, 15, 36, 20],
      ["Vegetable omelette with salad", "2 eggs, vegetables, 20 g cheese, 1 tsp oil, 1 slice wholemeal bread", 390, 23, 18, 24],
    ],
    dinner: [
      CHICKPEA_CURRY,
      TOFU_STIR_FRY,
      BEAN_CHILLI,
      ["Meat-free bolognese", "100 g meat-free mince, tomato sauce, 60 g dry wholewheat spaghetti, 10 g hard cheese", 415, 28, 52, 7],
      ["Vegetable lasagne with salad", "300 g vegetable lasagne, side salad", 400, 17, 42, 16],
      ["Paneer tikka with rice and salad", "80 g paneer in yoghurt and spices, 100 g cooked rice, salad", 400, 20, 34, 19],
      ["Roasted vegetable and feta pasta", "60 g dry wholewheat pasta, roasted vegetables, 1 tsp olive oil, 40 g feta", 435, 17, 50, 16],
    ],
  },
  vegan: {
    breakfast: [
      ["Porridge with soya milk and banana", "40 g oats, 200 ml soya milk, 1 small banana", 310, 11, 52, 6],
      ["Tofu scramble on toast", "120 g firm tofu, 1 tsp oil, 1 slice wholemeal toast", 275, 17, 16, 15],
      ["Soya yoghurt with berries, granola and seeds", "150 g soya yoghurt, 80 g berries, 30 g granola, 10 g seeds", 300, 12, 36, 11],
      PB_TOAST,
      ["Avocado and tomato on toast", "2 slices wholemeal toast, half an avocado, tomatoes", 300, 9, 34, 14],
      ["Bran flakes with soya milk and berries", "40 g bran flakes, 200 ml soya milk, 80 g berries", 250, 10, 42, 5],
      ["Overnight oats with chia and berries", "40 g oats, 10 g chia seeds, 150 ml soya milk, 80 g berries", 295, 11, 40, 9],
    ],
    lunch: [
      FALAFEL_WRAP,
      ["Baked beans jacket potato", "200 g baked potato, 200 g baked beans, salad", 340, 14, 65, 2],
      ["Lentil and vegetable soup with a roll", "400 g soup, 1 wholemeal roll, 1 tsp dairy-free spread", 375, 17, 60, 6],
      ["Chickpea and sweetcorn sandwich", "2 slices wholemeal bread, 100 g mashed chickpeas, 1 tbsp vegan mayonnaise, sweetcorn", 365, 15, 52, 9],
      ["Tofu, rice and vegetable bowl", "120 g firm tofu, 125 g cooked brown rice, vegetables, 1 tsp oil", 395, 20, 42, 15],
      ["Quinoa and black bean salad", "60 g dry quinoa, 80 g black beans, peppers and sweetcorn, 1 tsp oil, lime", 380, 16, 55, 10],
      ["Peanut noodle salad", "50 g dry rice noodles, vegetables, 50 g edamame, 15 g peanut butter, soy sauce", 370, 14, 48, 12],
    ],
    dinner: [
      CHICKPEA_CURRY,
      TOFU_STIR_FRY,
      BEAN_CHILLI,
      ["Lentil bolognese", "100 g cooked lentils, tomato sauce, 1 tsp oil, 60 g dry wholewheat spaghetti", 435, 20, 68, 7],
      ["Butter bean and vegetable stew with bread", "150 g butter beans, tomatoes and vegetables, 1 tsp oil, 2 small slices of bread", 400, 17, 60, 8],
      ["Tofu tikka with rice and salad", "150 g firm tofu in soya yoghurt and spices, 125 g cooked rice, salad", 390, 24, 42, 13],
      ["Roasted vegetable and white bean pasta", "60 g dry wholewheat pasta, roasted vegetables, 100 g cannellini beans, 1 tsp olive oil", 430, 18, 68, 7],
    ],
  },
};

// Extras are all plant based, so the same ones suit every plan.
const SNACK_LIGHT: Row[] = [
  ["Apple with almonds", "1 apple, 10 g almonds", 110, 3, 13, 5],
  ["Banana", "1 small banana", 90, 1, 20, 0],
  ["Carrot sticks with hummus", "1 carrot, 30 g hummus", 110, 3, 9, 7],
  ["Pear and grapes", "1 pear, a small handful of grapes", 100, 1, 24, 0],
];
const SNACK_MEDIUM: Row[] = [
  ["Mixed nuts", "25 g unsalted mixed nuts", 155, 5, 3, 14],
  ["Oatcakes with peanut butter", "2 oatcakes, 10 g peanut butter", 150, 5, 14, 9],
  ["Soya yoghurt with berries and seeds", "150 g soya yoghurt, 50 g berries, 10 g seeds", 165, 8, 10, 9],
  ["Avocado on toast", "1 slice wholemeal toast, quarter of an avocado", 150, 4, 15, 8],
];
const SNACK_LARGE: Row[] = [
  ["Hummus with pitta", "40 g hummus, half a wholemeal pitta", 195, 7, 23, 8],
  ["Banana with peanut butter", "1 small banana, 15 g peanut butter", 180, 5, 22, 8],
  ["Nuts and raisins with a satsuma", "30 g nuts and raisins, 1 satsuma", 175, 4, 20, 9],
];
const BREAKFAST_EXTRA: Row[] = [
  ["Toast with peanut butter", "1 slice wholemeal toast, 10 g peanut butter", 150, 6, 15, 7],
  ["Orange juice and a banana", "150 ml orange juice, 1 small banana", 160, 2, 36, 0],
  ["Seeds and nuts", "20 g mixed seeds and nuts", 120, 4, 2, 10],
];
const LUNCH_EXTRA: Row[] = [
  ["Wholemeal roll", "1 small wholemeal roll", 150, 6, 26, 2],
  ["Fruit and nuts", "1 piece of fruit, 15 g nuts", 145, 3, 14, 8],
  ["Three bean salad", "100 g three bean salad", 130, 7, 15, 4],
];
const DINNER_EXTRA: Row[] = [
  ["Extra rice, pasta or potatoes", "100 g more, cooked weight", 130, 3, 28, 0],
  ["Bread with olive spread", "1 slice crusty bread, 1 tsp olive spread", 140, 4, 20, 5],
  ["Fruit salad with soya yoghurt", "120 g fruit salad, 100 g soya yoghurt", 120, 5, 18, 3],
];

const pick = (rows: Row[], day: number) => item(rows[day % rows.length]);

/** The meals for one day (0 = Monday) of a plan. */
export function planDay(diet: Diet, band: Band, day: number): PlanMeal[] {
  const mains = MAINS[diet];
  const breakfast = [item(mains.breakfast[day])];
  const lunch = [item(mains.lunch[day])];
  const dinner = [item(mains.dinner[day])];
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

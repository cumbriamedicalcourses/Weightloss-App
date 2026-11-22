import type { PlanMeal } from "./plans";

export const AISLES = [
  "Fruit and vegetables",
  "Meat, fish and alternatives",
  "Dairy, eggs and alternatives",
  "Bread, grains and cereals",
  "Tins, pulses, nuts and seeds",
  "Store cupboard",
] as const;
export type Aisle = (typeof AISLES)[number];

export interface ShoppingItem {
  name: string;
  aisle: Aisle;
  /** "470 g", "7", "9 slices", or "" when the plan gives no amount. */
  amount: string;
}

const [VEG, MEAT, DAIRY, GRAIN, TINS, CUPBOARD] = AISLES;

// First match wins, so the more specific wording comes first.
// An optional fourth value names what is being counted, e.g. slices.
const RULES: [RegExp, string, Aisle, string?][] = [
  [/spinach sauce/, "Chopped tomatoes and spinach", VEG],
  [/tomato sauce/, "Tomato pasta sauce or chopped tomatoes", CUPBOARD],
  [/three bean salad/, "Three bean salad", TINS],
  [/fruit salad/, "Fruit salad", VEG],
  [/salad/, "Salad leaves", VEG],
  [/grapes/, "Grapes", VEG],
  [/apple/, "Apples", VEG],
  [/banana/, "Bananas", VEG],
  [/berries/, "Berries", VEG],
  [/avocado/, "Avocados", VEG],
  [/carrot/, "Carrots", VEG],
  [/pear/, "Pears", VEG],
  [/satsuma/, "Satsumas", VEG],
  [/piece of fruit/, "Fruit of your choice", VEG],
  [/lemon/, "Lemon", VEG],
  [/lime/, "Lime", VEG],
  [/cress/, "Cress", VEG],
  [/cucumber/, "Cucumber", VEG],
  [/broccoli/, "Broccoli", VEG],
  [/green beans/, "Green beans", VEG],
  [/peppers/, "Peppers", VEG],
  [/sweetcorn/, "Sweetcorn", TINS],
  [/stir fry vegetables/, "Stir fry vegetables", VEG],
  [/roasted vegetables/, "Vegetables for roasting", VEG],
  [/vegetables/, "Mixed vegetables", VEG],
  [/new potatoes/, "New potatoes", VEG],
  [/baked potato/, "Baking potatoes", VEG],
  [/roast potatoes/, "Potatoes for roasting", VEG],
  [/sweet potato/, "Sweet potatoes", VEG],
  [/^peas$/, "Peas", VEG],
  [/olives/, "Olives", TINS],

  [/turkey mince/, "Lean turkey mince", MEAT],
  [/turkey/, "Sliced turkey", MEAT],
  [/chicken/, "Chicken breast", MEAT],
  [/cod/, "Cod", MEAT],
  [/smoked salmon/, "Smoked salmon", MEAT],
  [/salmon/, "Salmon fillets", MEAT],
  [/prawns/, "Prawns", MEAT],
  [/beef mince/, "Lean beef mince", MEAT],
  [/tuna/, "Tuna in water", MEAT, "small tins"],
  [/tofu/, "Firm tofu", MEAT],
  [/meat-free mince/, "Meat-free mince", MEAT],
  [/falafel/, "Falafel", MEAT],
  [/vegetable lasagne/, "Vegetable lasagne (ready made)", MEAT],

  [/peanut butter/, "Peanut butter", TINS],
  [/eggs?$/, "Eggs", DAIRY],
  [/dairy-free spread/, "Dairy-free spread", DAIRY],
  [/spread/, "Olive spread", DAIRY],
  [/butter beans/, "Butter beans", TINS],
  [/butter/, "Butter", DAIRY],
  [/cottage cheese/, "Cottage cheese", DAIRY],
  [/cream cheese/, "Light cream cheese", DAIRY],
  [/parmesan/, "Parmesan", DAIRY],
  [/feta/, "Feta", DAIRY],
  [/halloumi/, "Halloumi", DAIRY],
  [/paneer/, "Paneer", DAIRY],
  [/cheddar|cheese/, "Cheddar or other hard cheese", DAIRY],
  [/greek yoghurt/, "Fat-free Greek yoghurt", DAIRY],
  [/soya yoghurt/, "Soya yoghurt", DAIRY],
  [/soya milk/, "Soya milk", DAIRY],
  [/milk/, "Semi-skimmed milk", DAIRY],

  [/bagel/, "Bagel thins", GRAIN],
  [/bran flakes/, "Bran flakes", GRAIN],
  [/oatcakes/, "Oatcakes", GRAIN],
  [/oats/, "Porridge oats", GRAIN],
  [/granola/, "Granola", GRAIN],
  [/couscous/, "Couscous", GRAIN],
  [/rice noodles/, "Rice noodles", GRAIN],
  [/egg noodles/, "Egg noodles", GRAIN],
  [/noodles/, "Noodles", GRAIN],
  [/quinoa/, "Quinoa", GRAIN],
  [/spaghetti/, "Wholewheat spaghetti", GRAIN],
  [/pasta/, "Wholewheat pasta", GRAIN],
  [/rice/, "Rice (cooked weight)", GRAIN],
  [/^more$/, "Extra rice, pasta or potatoes (cooked weight)", GRAIN],
  [/pitta/, "Wholemeal pittas", GRAIN],
  [/roll/, "Wholemeal rolls", GRAIN],
  [/wrap/, "Wholemeal wraps", GRAIN],
  [/wholemeal (bread|toast)/, "Wholemeal bread", GRAIN, "slices"],
  [/bread/, "Crusty bread", GRAIN, "slices"],

  [/soup/, "Lentil and vegetable soup", TINS],
  [/baked beans/, "Baked beans", TINS],
  [/black beans/, "Black beans", TINS],
  [/cannellini/, "Cannellini beans", TINS],
  [/kidney beans/, "Kidney beans", TINS],
  [/mixed beans/, "Mixed beans", TINS],
  [/chickpeas/, "Chickpeas", TINS],
  [/lentils/, "Cooked lentils", TINS],
  [/edamame/, "Edamame beans", TINS],
  [/hummus/, "Hummus", TINS],
  [/almonds/, "Almonds", TINS],
  [/nuts and raisins/, "Nuts and raisins", TINS],
  [/chia/, "Chia seeds", TINS],
  [/seeds/, "Mixed seeds", TINS],
  [/nuts/, "Unsalted mixed nuts", TINS],
  [/tomato/, "Tomatoes", VEG],

  [/oil/, "Olive oil", CUPBOARD],
  [/honey/, "Honey", CUPBOARD],
  [/vegan mayonnaise/, "Vegan mayonnaise", CUPBOARD],
  [/mayonnaise/, "Light mayonnaise", CUPBOARD],
  [/dressing/, "Light salad dressing", CUPBOARD],
  [/soy sauce/, "Soy sauce", CUPBOARD],
  [/gravy/, "Gravy", CUPBOARD],
  [/orange juice/, "Orange juice", CUPBOARD],
];

interface Tally {
  aisle: Aisle;
  g: number;
  ml: number;
  count: number;
  counted?: string;
}

function parse(part: string) {
  let text = part.trim().toLowerCase();
  let qty: number | null = null;
  let unit = "";
  const m = text.match(/^(\d+(?:\.\d+)?)\s*(g|ml|tsp|tbsp)?\s+(.+)$/);
  if (m) {
    qty = Number(m[1]);
    unit = m[2] ?? "count";
    text = m[3];
  } else if (/^half an? /.test(text)) {
    qty = 0.5;
    unit = "count";
  } else if (/^quarter of an? /.test(text)) {
    qty = 0.25;
    unit = "count";
  }
  return { text, qty, unit };
}

function format(t: Tally) {
  const parts: string[] = [];
  if (t.g) parts.push(t.g >= 1000 ? `${Math.round(t.g / 100) / 10} kg` : `${Math.round(t.g)} g`);
  if (t.ml) parts.push(t.ml >= 1000 ? `${Math.round(t.ml / 100) / 10} litres` : `${Math.round(t.ml)} ml`);
  if (t.count) {
    const n = Math.ceil(t.count);
    const what = t.counted ? ` ${n === 1 ? t.counted.replace(/s$/, "") : t.counted}` : "";
    parts.push(`${n}${what}`);
  }
  return parts.join(" + ");
}

/** Everything needed to cook the given days, added up and grouped by aisle. */
export function shoppingList(days: PlanMeal[][]): ShoppingItem[] {
  const tally = new Map<string, Tally>();
  const add = (name: string, aisle: Aisle, counted?: string) => {
    let t = tally.get(name);
    if (!t) tally.set(name, (t = { aisle, g: 0, ml: 0, count: 0, counted }));
    return t;
  };

  for (const day of days) {
    for (const meal of day) {
      for (const dish of meal.items) {
        for (const raw of dish.portion.split(/,\s*/)) {
          const { text, qty, unit } = parse(raw);
          if (text === "cooked weight") continue;
          if (/ and spices$/.test(text)) add("Tikka or curry spices and plain yoghurt", CUPBOARD);
          // "tomatoes and peppers" is two things to buy; "nuts and raisins" is one.
          const pieces = qty === null && !/sauce$/.test(text) ? text.split(" and ") : [text];
          for (const piece of pieces) {
            const rule = RULES.find(([re]) => re.test(piece));
            const t = rule
              ? add(rule[1], rule[2], rule[3])
              : add(piece.charAt(0).toUpperCase() + piece.slice(1), CUPBOARD);
            // Spoonfuls of oil or honey are not worth adding up.
            if (qty === null || unit === "tsp" || unit === "tbsp") continue;
            if (unit === "g") t.g += qty;
            else if (unit === "ml") t.ml += qty;
            else t.count += qty;
          }
        }
      }
    }
  }

  return [...tally.entries()]
    .map(([name, t]) => ({ name, aisle: t.aisle, amount: format(t) }))
    .sort((a, b) => AISLES.indexOf(a.aisle) - AISLES.indexOf(b.aisle) || a.name.localeCompare(b.name));
}

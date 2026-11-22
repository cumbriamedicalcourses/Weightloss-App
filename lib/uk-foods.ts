/**
 * The food database is American, so common British names are translated to
 * the names it uses before searching. Longer phrases are listed first so
 * they win over the single words inside them.
 */
const UK_TO_US: [string, string][] = [
  // Phrases that already mean the same in both countries, kept as they are.
  ["chocolate chips", "chocolate chips"],
  ["tortilla chips", "tortilla chips"],
  ["banana chips", "banana chips"],
  ["butternut squash", "butternut squash"],
  ["mince pie", "mince pie"],
  ["jelly beans", "jelly beans"],
  ["jelly babies", "gummy candy"],
  ["oven chips", "baked french fries"],
  ["semi-skimmed milk", "reduced fat milk"],
  ["semi skimmed milk", "reduced fat milk"],
  ["skimmed milk", "nonfat milk"],
  ["full fat milk", "whole milk"],
  ["double cream", "heavy cream"],
  ["single cream", "light cream"],
  ["natural yoghurt", "plain yogurt"],
  ["greek yoghurt", "greek yogurt"],
  ["porridge oats", "oats"],
  ["jacket potato", "baked potato"],
  ["new potatoes", "boiled potatoes"],
  ["mashed potato", "mashed potatoes"],
  ["fish fingers", "fish sticks"],
  ["fish and chips", "fried fish and french fries"],
  ["broad beans", "fava beans"],
  ["runner beans", "green beans"],
  ["butter beans", "lima beans"],
  ["spring onions", "scallions"],
  ["spring onion", "scallions"],
  ["minced beef", "ground beef"],
  ["beef mince", "ground beef"],
  ["turkey mince", "ground turkey"],
  ["pork mince", "ground pork"],
  ["lamb mince", "ground lamb"],
  ["back bacon", "bacon"],
  ["streaky bacon", "bacon"],
  ["wholemeal bread", "whole wheat bread"],
  ["wholemeal", "whole wheat"],
  ["brown bread", "whole wheat bread"],
  ["crumpet", "english muffin"],
  ["plain flour", "all-purpose flour"],
  ["self-raising flour", "self-rising flour"],
  ["icing sugar", "powdered sugar"],
  ["caster sugar", "sugar"],
  ["golden syrup", "syrup"],
  ["cornflour", "cornstarch"],
  ["digestive biscuits", "graham crackers"],
  ["digestive biscuit", "graham crackers"],
  ["rich tea", "tea biscuit"],
  ["ice lolly", "ice pop"],
  ["fizzy drink", "soda"],
  ["orange squash", "orange drink"],
  ["squash drink", "fruit drink"],
  ["fairy cake", "cupcake"],
  ["swiss roll", "jelly roll"],
  ["flapjack", "granola bar"],
  ["sausage roll", "sausage in pastry"],
  ["pasty", "meat pie"],
  ["toad in the hole", "sausage in batter"],
  ["bangers", "sausage"],
  ["porridge", "oatmeal"],
  ["courgettes", "zucchini"],
  ["courgette", "zucchini"],
  ["aubergines", "eggplant"],
  ["aubergine", "eggplant"],
  ["coriander", "cilantro"],
  ["rocket", "arugula"],
  ["beetroot", "beets"],
  ["swede", "rutabaga"],
  ["mangetout", "snow peas"],
  ["sweetcorn", "sweet corn"],
  ["gherkin", "pickle"],
  ["prawns", "shrimp"],
  ["prawn", "shrimp"],
  ["gammon", "ham"],
  ["mince", "ground beef"],
  ["crisps", "potato chips"],
  ["chips", "french fries"],
  ["biscuits", "cookies"],
  ["biscuit", "cookie"],
  ["sweets", "candy"],
  ["sultanas", "golden raisins"],
  ["tinned", "canned"],
  ["yoghurt", "yogurt"],
  ["jelly", "gelatin dessert"],
  ["candyfloss", "cotton candy"],
  ["rapeseed oil", "canola oil"],
  ["weetabix", "wheat biscuit cereal"],
  ["marmite", "yeast extract spread"],
];

/** Rewrites British food names in a search to the American names the database uses. */
export function toDatabaseTerms(query: string) {
  let q = ` ${query.toLowerCase().replace(/\s+/g, " ").trim()} `;
  const taken: string[] = [];
  for (const [uk, us] of UK_TO_US) {
    const at = q.indexOf(` ${uk} `);
    if (at === -1) continue;
    // Park each replacement behind a marker so later rules cannot rewrite it.
    q = `${q.slice(0, at)} \u0000${taken.length}\u0000 ${q.slice(at + uk.length + 2)}`;
    taken.push(us);
  }
  return q.replace(/\u0000(\d+)\u0000/g, (_, i) => taken[Number(i)]).trim();
}

# Meal plan calories

Every dish in the meal plans (`lib/plans.ts`) is worked out from McCance and Widdowson's
Composition of Foods Integrated Dataset (CoFID 2021, Public Health England), sheet
"1.3 Proximates". For each ingredient the table gives the weight used, the CoFID food code
and name, and the energy it adds. Where several codes are listed, their average is used.
Plan totals are rounded to the nearest 5 kcal and macros to the nearest gram.

Amounts that a dish gives loosely are taken as: salad = 30 g each of lettuce, cucumber and
cherry tomatoes; tomato sauce = 150 g canned tomatoes and 40 g onion; vegetables = mixed
vegetables, 80 to 150 g; 1 tsp oil = 4.5 g; 1 tsp butter or spread = 5 g; 1 tbsp light
mayonnaise or dressing = 15 g; 1 tsp honey = 7 g; 1 slice wholemeal bread = 36 g; 1 egg = 50 g;
small banana = 80 g and medium banana = 100 g (flesh); apple = 112 g; 200 ml milk = 206 g.
Chicken is taken at its cooked weight, and fish at its raw weight.

CoFID has no entry for a few foods, so the nearest match is used: firm tofu (steamed tofu,
13-570, which is lower in calories than most firm tofu sold in the UK), fat-free Greek yoghurt
(low fat plain yoghurt, 12-379), chia seeds (an average of sunflower, pumpkin and sesame seeds),
black beans (red kidney beans, 13-660), vegan mayonnaise (reduced fat mayonnaise, 17-679),
granola (crunchy clusters, 11-938), meat-free mince (Quorn pieces, 13-574), vegetable lasagne
(spinach lasagne, 15-186), wholemeal wrap (soft wheat tortilla, 11-925), wholemeal pitta
(white pitta, 11-974), wholemeal roll (soft brown roll, 11-983) and mixed nuts (an average of
almonds, cashews, Brazil nuts, walnuts and peanuts).

## Porridge with banana

Total: 312 kcal, protein 13 g, carbohydrate 54 g, fat 7 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| oats | 40 g | 11-788 Porridge oats, unfortified | 152 |
| semi milk | 206 g | 12-313 Milk, semi-skimmed, pasteurised, average | 95 |
| banana | 80 g | 14-318 Bananas, flesh only | 65 |

## Scrambled eggs on toast

Total: 246 kcal, protein 16 g, carbohydrate 15 g, fat 14 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| egg | 100 g | 12-937 Eggs, chicken, whole, raw | 131 |
| wm bread | 36 g | 11-981 Bread, wholemeal, average | 78 |
| butter | 5 g | 17-685 Butter, salted | 37 |

## Greek yoghurt with berries and granola

Total: 291 kcal, protein 11 g, carbohydrate 51 g, fat 6 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| greek yog 0% | 150 g | 12-379 Yogurt, low fat, plain | 86 |
| berries | 80 g | 14-325 Blueberries; 14-324 Strawberries, raw; 14-375 Raspberries, raw | 25 |
| granola | 40 g | 11-938 Breakfast cereal, crunchy clusters type, without nuts, unfortified | 160 |
| honey | 7 g | 17-050 Honey | 20 |

## Peanut butter and banana on toast

Total: 288 kcal, protein 11 g, carbohydrate 42 g, fat 10 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| wm bread | 72 g | 11-981 Bread, wholemeal, average | 156 |
| pb | 15 g | 14-892 Peanut butter, smooth | 91 |
| banana | 50 g | 14-318 Bananas, flesh only | 40 |

## Poached egg and avocado on toast

Total: 307 kcal, protein 14 g, carbohydrate 31 g, fat 15 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| wm bread | 72 g | 11-981 Bread, wholemeal, average | 156 |
| egg | 50 g | 12-937 Eggs, chicken, whole, raw | 66 |
| avocado | 50 g | 14-386 Avocado, Hass, flesh only | 86 |

## Bran flakes with milk and berries

Total: 287 kcal, protein 13 g, carbohydrate 52 g, fat 5 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| bran flakes | 50 g | 11-763 Breakfast cereal, bran flakes, fortified | 166 |
| semi milk | 206 g | 12-313 Milk, semi-skimmed, pasteurised, average | 95 |
| berries | 80 g | 14-325 Blueberries; 14-324 Strawberries, raw; 14-375 Raspberries, raw | 25 |

## Lentil and vegetable soup with a roll

Total: 330 kcal, protein 17 g, carbohydrate 56 g, fat 5 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| lentil soup | 400 g | 17-698 Soup, lentil, canned | 184 |
| brown roll | 50 g | 11-983 Bread rolls, brown, soft | 118 |
| spread | 5 g | 12-504 Fat spread, reduced fat (41-62%), not polyunsaturated | 28 |

## Hummus and falafel wrap

Total: 376 kcal, protein 11 g, carbohydrate 47 g, fat 18 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| wrap | 62 g | 11-925 Tortilla, wheat, soft | 177 |
| falafel | 51 g | 15-795 Falafel, fried in rapeseed oil, homemade | 93 |
| hummus | 30 g | 13-556 Houmous | 92 |
| lettuce | 30 g | 13-520 Lettuce, average, raw | 3 |
| cucumber | 30 g | 13-523 Cucumber, raw, flesh and skin | 4 |
| tomato | 30 g | 13-519 Tomatoes, cherry, raw | 7 |

## Chickpea and spinach curry with rice

Total: 397 kcal, protein 18 g, carbohydrate 63 g, fat 10 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| chickpeas | 120 g | 13-670 Beans, chick peas, canned, re-heated, drained | 155 |
| spinach | 80 g | 13-458 Spinach, frozen, boiled in unsalted water | 17 |
| oil | 4.5 g | 17-686 Oil, vegetable, average | 40 |
| white rice | 125 g | 11-858 Rice, white, basmati, boiled in unsalted water | 146 |
| tinned tom | 150 g | 13-530 Tomatoes, canned, whole contents | 28 |
| onion | 40 g | 13-500 Onions, boiled in unsalted water | 10 |

## Tofu stir fry with noodles

Total: 452 kcal, protein 28 g, carbohydrate 55 g, fat 15 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| tofu | 200 g | 13-570 Tofu, soya bean, steamed | 146 |
| veg | 150 g | 13-543 Vegetables, mixed, frozen, boiled in unsalted water | 63 |
| egg noodles dry | 60 g | 11-719 Noodles, egg, dried, raw | 203 |
| oil | 4.5 g | 17-686 Oil, vegetable, average | 40 |

## Three bean chilli with rice

Total: 416 kcal, protein 22 g, carbohydrate 75 g, fat 5 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| beans mixed | 200 g | 13-660 Beans, red kidney, canned in water, re-heated, drained; 13-666 Beans, cannellini, canned, re-heated, drained; 13-670 Beans, chick peas, canned, re-heated, drained | 222 |
| peppers | 60 g | 13-318 Peppers, capsicum, green, raw | 9 |
| white rice | 125 g | 11-858 Rice, white, basmati, boiled in unsalted water | 146 |
| tinned tom | 150 g | 13-530 Tomatoes, canned, whole contents | 28 |
| onion | 40 g | 13-500 Onions, boiled in unsalted water | 10 |

## Smoked salmon and cream cheese bagel

Total: 261 kcal, protein 19 g, carbohydrate 27 g, fat 9 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| bagel | 45 g | 11-970 Bagels, plain | 123 |
| cream cheese light | 30 g | 12-538 Cheese, spreadable, medium fat, soft, white | 46 |
| smoked salmon | 50 g | 16-412 Salmon, smoked (cold-smoked) | 92 |

## Chicken salad wrap

Total: 382 kcal, protein 38 g, carbohydrate 37 g, fat 10 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| wrap | 62 g | 11-925 Tortilla, wheat, soft | 177 |
| grilled chicken | 100 g | 18-323 Chicken, breast, grilled without skin, meat only | 148 |
| light mayo | 15 g | 17-679 Mayonnaise, reduced fat | 43 |
| lettuce | 30 g | 13-520 Lettuce, average, raw | 3 |
| cucumber | 30 g | 13-523 Cucumber, raw, flesh and skin | 4 |
| tomato | 30 g | 13-519 Tomatoes, cherry, raw | 7 |

## Tuna and sweetcorn jacket potato

Total: 384 kcal, protein 32 g, carbohydrate 52 g, fat 6 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| baked potato | 200 g | 13-491 Potatoes, old, baked, flesh and skin | 194 |
| tuna | 100 g | 16-416 Tuna, canned in brine, drained | 109 |
| sweetcorn | 30 g | 13-529 Sweetcorn kernels, canned in water, drained | 23 |
| light mayo | 15 g | 17-679 Mayonnaise, reduced fat | 43 |
| lettuce | 30 g | 13-520 Lettuce, average, raw | 3 |
| cucumber | 30 g | 13-523 Cucumber, raw, flesh and skin | 4 |
| tomato | 30 g | 13-519 Tomatoes, cherry, raw | 7 |

## Turkey salad sandwich and an apple

Total: 362 kcal, protein 27 g, carbohydrate 47 g, fat 8 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| wm bread | 72 g | 11-981 Bread, wholemeal, average | 156 |
| turkey slices | 80 g | 19-543 Turkey slices | 91 |
| light mayo | 15 g | 17-679 Mayonnaise, reduced fat | 43 |
| apple | 112 g | 14-319 Apples, eating, raw, flesh and skin | 57 |
| lettuce | 30 g | 13-520 Lettuce, average, raw | 3 |
| cucumber | 30 g | 13-523 Cucumber, raw, flesh and skin | 4 |
| tomato | 30 g | 13-519 Tomatoes, cherry, raw | 7 |

## Chicken, rice and vegetable bowl

Total: 395 kcal, protein 40 g, carbohydrate 43 g, fat 8 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| grilled chicken | 100 g | 18-323 Chicken, breast, grilled without skin, meat only | 148 |
| brown rice | 125 g | 11-869 Rice, brown, wholegrain, boiled in unsalted water | 165 |
| veg | 100 g | 13-543 Vegetables, mixed, frozen, boiled in unsalted water | 42 |
| oil | 4.5 g | 17-686 Oil, vegetable, average | 40 |

## Egg and new potato salad

Total: 364 kcal, protein 21 g, carbohydrate 48 g, fat 10 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| egg | 100 g | 12-937 Eggs, chicken, whole, raw | 131 |
| new potato | 200 g | 13-495 Potatoes, new and salad, boiled in unsalted water, flesh and skin | 136 |
| dressing | 15 g | 17-716 Dressing, French, fat free | 5 |
| wm bread | 36 g | 11-981 Bread, wholemeal, average | 78 |
| lettuce | 30 g | 13-520 Lettuce, average, raw | 3 |
| cucumber | 30 g | 13-523 Cucumber, raw, flesh and skin | 4 |
| tomato | 30 g | 13-519 Tomatoes, cherry, raw | 7 |

## Prawn and avocado salad with pitta

Total: 355 kcal, protein 24 g, carbohydrate 36 g, fat 14 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| prawns | 100 g | 16-389 Prawns, king, purchased cooked | 68 |
| avocado | 70 g | 14-386 Avocado, Hass, flesh only | 120 |
| pitta | 60 g | 11-974 Bread, pitta, white | 153 |
| lettuce | 30 g | 13-520 Lettuce, average, raw | 3 |
| cucumber | 30 g | 13-523 Cucumber, raw, flesh and skin | 4 |
| tomato | 30 g | 13-519 Tomatoes, cherry, raw | 7 |

## Salmon with new potatoes and greens

Total: 406 kcal, protein 32 g, carbohydrate 28 g, fat 19 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| salmon | 120 g | 16-356 Salmon, farmed, flesh only, raw | 260 |
| new potato | 150 g | 13-495 Potatoes, new and salad, boiled in unsalted water, flesh and skin | 102 |
| broccoli | 80 g | 13-583 Broccoli, green, boiled in salted water | 22 |
| green beans | 80 g | 13-515 Beans, green, boiled in unsalted water | 21 |

## Chicken stir fry with noodles

Total: 450 kcal, protein 49 g, carbohydrate 46 g, fat 9 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| grilled chicken | 120 g | 18-323 Chicken, breast, grilled without skin, meat only | 178 |
| veg | 150 g | 13-543 Vegetables, mixed, frozen, boiled in unsalted water | 63 |
| egg noodles dry | 50 g | 11-719 Noodles, egg, dried, raw | 169 |
| oil | 4.5 g | 17-686 Oil, vegetable, average | 40 |

## Turkey chilli with rice

Total: 485 kcal, protein 48 g, carbohydrate 53 g, fat 10 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| turkey mince | 125 g | 18-354 Turkey, mince, stewed | 220 |
| kidney beans | 80 g | 13-660 Beans, red kidney, canned in water, re-heated, drained | 80 |
| white rice | 125 g | 11-858 Rice, white, basmati, boiled in unsalted water | 146 |
| tinned tom | 150 g | 13-530 Tomatoes, canned, whole contents | 28 |
| onion | 40 g | 13-500 Onions, boiled in unsalted water | 10 |

## Baked cod with sweet potato mash and peas

Total: 436 kcal, protein 34 g, carbohydrate 65 g, fat 6 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| cod | 150 g | 16-372 Cod, flesh only, raw | 112 |
| sweet potato | 200 g | 13-672 Sweet potato, baked | 230 |
| peas | 80 g | 13-536 Peas, frozen, boiled in unsalted water | 56 |
| butter | 5 g | 17-685 Butter, salted | 37 |

## Spaghetti bolognese

Total: 414 kcal, protein 38 g, carbohydrate 49 g, fat 9 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| beef mince lean | 100 g | 18-507 Beef, mince, extra lean, stewed | 137 |
| ww spaghetti dry | 60 g | 11-718 Pasta, wholewheat, spaghetti, dried, raw | 197 |
| parmesan | 10 g | 12-526 Cheese, Parmesan, fresh | 42 |
| tinned tom | 150 g | 13-530 Tomatoes, canned, whole contents | 28 |
| onion | 40 g | 13-500 Onions, boiled in unsalted water | 10 |

## Chicken tikka with rice and salad

Total: 399 kcal, protein 48 g, carbohydrate 44 g, fat 5 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| grilled chicken | 130 g | 18-323 Chicken, breast, grilled without skin, meat only | 192 |
| low fat yog | 30 g | 12-379 Yogurt, low fat, plain | 17 |
| white rice | 150 g | 11-858 Rice, white, basmati, boiled in unsalted water | 176 |
| lettuce | 30 g | 13-520 Lettuce, average, raw | 3 |
| cucumber | 30 g | 13-523 Cucumber, raw, flesh and skin | 4 |
| tomato | 30 g | 13-519 Tomatoes, cherry, raw | 7 |

## Roast chicken dinner

Total: 484 kcal, protein 45 g, carbohydrate 50 g, fat 13 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| grilled chicken | 120 g | 18-323 Chicken, breast, grilled without skin, meat only | 178 |
| roast potato | 150 g | 13-534 Potatoes, old, roasted in rapeseed oil | 242 |
| broccoli | 80 g | 13-583 Broccoli, green, boiled in salted water | 22 |
| carrot | 80 g | 13-496 Carrots, old, raw | 27 |
| gravy | 50 g | 17-725 Gravy instant granules, made up with water | 15 |

## Cottage cheese and tomato on toast

Total: 278 kcal, protein 17 g, carbohydrate 36 g, fat 8 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| wm bread | 72 g | 11-981 Bread, wholemeal, average | 156 |
| cottage | 100 g | 12-539 Cheese, cottage, plain | 103 |
| tomato | 85 g | 13-519 Tomatoes, cherry, raw | 19 |

## Cheese and beans jacket potato

Total: 439 kcal, protein 20 g, carbohydrate 75 g, fat 8 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| baked potato | 200 g | 13-491 Potatoes, old, baked, flesh and skin | 194 |
| baked beans | 200 g | 13-532 Baked beans, canned in tomato sauce | 162 |
| cheddar | 20 g | 12-346 Cheese, Cheddar, English | 83 |

## Egg mayonnaise sandwich

Total: 331 kcal, protein 20 g, carbohydrate 31 g, fat 15 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| wm bread | 72 g | 11-981 Bread, wholemeal, average | 156 |
| egg | 100 g | 12-937 Eggs, chicken, whole, raw | 131 |
| light mayo | 15 g | 17-679 Mayonnaise, reduced fat | 43 |
| cress | 5 g | 13-297 Mustard and cress, raw | 1 |

## Halloumi and couscous salad

Total: 434 kcal, protein 25 g, carbohydrate 51 g, fat 16 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| halloumi | 60 g | 12-496 Cheese, Halloumi | 188 |
| couscous dry | 50 g | 11-901 Couscous, plain, raw | 182 |
| veg | 150 g | 13-543 Vegetables, mixed, frozen, boiled in unsalted water | 63 |
| lemon | 10 g | 14-277 Lemon juice, fresh | 1 |

## Greek salad with pitta

Total: 368 kcal, protein 15 g, carbohydrate 38 g, fat 18 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| feta | 50 g | 12-525 Cheese, Feta | 125 |
| olives | 20 g | 14-340 Olives, green, in brine, drained, flesh and skin | 21 |
| tomato | 80 g | 13-519 Tomatoes, cherry, raw | 18 |
| cucumber | 80 g | 13-523 Cucumber, raw, flesh and skin | 11 |
| olive oil | 4.5 g | 17-038 Oil, olive | 40 |
| pitta | 60 g | 11-974 Bread, pitta, white | 153 |

## Vegetable omelette with salad

Total: 380 kcal, protein 25 g, carbohydrate 22 g, fat 22 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| egg | 100 g | 12-937 Eggs, chicken, whole, raw | 131 |
| veg | 80 g | 13-543 Vegetables, mixed, frozen, boiled in unsalted water | 34 |
| cheddar | 20 g | 12-346 Cheese, Cheddar, English | 83 |
| oil | 4.5 g | 17-686 Oil, vegetable, average | 40 |
| wm bread | 36 g | 11-981 Bread, wholemeal, average | 78 |
| lettuce | 30 g | 13-520 Lettuce, average, raw | 3 |
| cucumber | 30 g | 13-523 Cucumber, raw, flesh and skin | 4 |
| tomato | 30 g | 13-519 Tomatoes, cherry, raw | 7 |

## Meat-free bolognese

Total: 400 kcal, protein 29 g, carbohydrate 60 g, fat 7 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| quorn | 100 g | 13-574 Quorn, pieces, as purchased | 73 |
| ww spaghetti dry | 75 g | 11-718 Pasta, wholewheat, spaghetti, dried, raw | 247 |
| parmesan | 10 g | 12-526 Cheese, Parmesan, fresh | 42 |
| tinned tom | 150 g | 13-530 Tomatoes, canned, whole contents | 28 |
| onion | 40 g | 13-500 Onions, boiled in unsalted water | 10 |

## Vegetable lasagne with salad

Total: 386 kcal, protein 18 g, carbohydrate 54 g, fat 13 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| veg lasagne | 400 g | 15-186 Lasagne, spinach, wholemeal, homemade | 372 |
| lettuce | 30 g | 13-520 Lettuce, average, raw | 3 |
| cucumber | 30 g | 13-523 Cucumber, raw, flesh and skin | 4 |
| tomato | 30 g | 13-519 Tomatoes, cherry, raw | 7 |

## Paneer tikka with rice and salad

Total: 411 kcal, protein 26 g, carbohydrate 31 g, fat 21 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| paneer | 80 g | 12-495 Cheese, Paneer | 262 |
| low fat yog | 30 g | 12-379 Yogurt, low fat, plain | 17 |
| white rice | 100 g | 11-858 Rice, white, basmati, boiled in unsalted water | 117 |
| lettuce | 30 g | 13-520 Lettuce, average, raw | 3 |
| cucumber | 30 g | 13-523 Cucumber, raw, flesh and skin | 4 |
| tomato | 30 g | 13-519 Tomatoes, cherry, raw | 7 |

## Roasted vegetable and feta pasta

Total: 401 kcal, protein 19 g, carbohydrate 51 g, fat 15 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| ww spaghetti dry | 60 g | 11-718 Pasta, wholewheat, spaghetti, dried, raw | 197 |
| veg | 150 g | 13-543 Vegetables, mixed, frozen, boiled in unsalted water | 63 |
| olive oil | 4.5 g | 17-038 Oil, olive | 40 |
| feta | 40 g | 12-525 Cheese, Feta | 100 |

## Porridge with soya milk and banana

Total: 303 kcal, protein 12 g, carbohydrate 50 g, fat 8 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| oats | 40 g | 11-788 Porridge oats, unfortified | 152 |
| soya milk | 200 g | 12-523 Milk, soya, non-dairy alternative to milk, sweetened, fortified | 86 |
| banana | 80 g | 14-318 Bananas, flesh only | 65 |

## Tofu scramble on toast

Total: 284 kcal, protein 16 g, carbohydrate 31 g, fat 11 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| tofu | 120 g | 13-570 Tofu, soya bean, steamed | 88 |
| oil | 4.5 g | 17-686 Oil, vegetable, average | 40 |
| wm bread | 72 g | 11-981 Bread, wholemeal, average | 156 |

## Soya yoghurt with berries, granola and seeds

Total: 311 kcal, protein 10 g, carbohydrate 44 g, fat 12 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| soya yog | 150 g | 12-609 Yogurt, soya, non-dairy alternative to yogurt, fruit, fortified | 108 |
| berries | 80 g | 14-325 Blueberries; 14-324 Strawberries, raw; 14-375 Raspberries, raw | 25 |
| granola | 30 g | 11-938 Breakfast cereal, crunchy clusters type, without nuts, unfortified | 120 |
| seeds | 10 g | 14-845 Sunflower seeds; 14-842 Pumpkin seeds; 14-844 Sesame seeds | 58 |

## Avocado and tomato on toast

Total: 294 kcal, protein 9 g, carbohydrate 34 g, fat 14 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| wm bread | 72 g | 11-981 Bread, wholemeal, average | 156 |
| avocado | 70 g | 14-386 Avocado, Hass, flesh only | 120 |
| tomato | 80 g | 13-519 Tomatoes, cherry, raw | 18 |

## Bran flakes with soya milk and berries

Total: 278 kcal, protein 12 g, carbohydrate 47 g, fat 6 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| bran flakes | 50 g | 11-763 Breakfast cereal, bran flakes, fortified | 166 |
| soya milk | 200 g | 12-523 Milk, soya, non-dairy alternative to milk, sweetened, fortified | 86 |
| berries | 80 g | 14-325 Blueberries; 14-324 Strawberries, raw; 14-375 Raspberries, raw | 25 |

## Overnight oats with chia and berries

Total: 300 kcal, protein 12 g, carbohydrate 39 g, fat 12 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| oats | 40 g | 11-788 Porridge oats, unfortified | 152 |
| chia | 10 g | 14-845 Sunflower seeds | 58 |
| soya milk | 150 g | 12-523 Milk, soya, non-dairy alternative to milk, sweetened, fortified | 64 |
| berries | 80 g | 14-325 Blueberries; 14-324 Strawberries, raw; 14-375 Raspberries, raw | 25 |

## Baked beans jacket potato

Total: 370 kcal, protein 16 g, carbohydrate 77 g, fat 2 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| baked potato | 200 g | 13-491 Potatoes, old, baked, flesh and skin | 194 |
| baked beans | 200 g | 13-532 Baked beans, canned in tomato sauce | 162 |
| lettuce | 30 g | 13-520 Lettuce, average, raw | 3 |
| cucumber | 30 g | 13-523 Cucumber, raw, flesh and skin | 4 |
| tomato | 30 g | 13-519 Tomatoes, cherry, raw | 7 |

## Chickpea and sweetcorn sandwich

Total: 352 kcal, protein 16 g, carbohydrate 54 g, fat 10 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| wm bread | 72 g | 11-981 Bread, wholemeal, average | 156 |
| chickpeas | 100 g | 13-670 Beans, chick peas, canned, re-heated, drained | 129 |
| vegan mayo | 15 g | 17-679 Mayonnaise, reduced fat | 43 |
| sweetcorn | 30 g | 13-529 Sweetcorn kernels, canned in water, drained | 23 |

## Tofu, rice and vegetable bowl

Total: 390 kcal, protein 21 g, carbohydrate 51 g, fat 13 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| tofu | 150 g | 13-570 Tofu, soya bean, steamed | 110 |
| brown rice | 150 g | 11-869 Rice, brown, wholegrain, boiled in unsalted water | 198 |
| veg | 100 g | 13-543 Vegetables, mixed, frozen, boiled in unsalted water | 42 |
| oil | 4.5 g | 17-686 Oil, vegetable, average | 40 |

## Quinoa and black bean salad

Total: 385 kcal, protein 19 g, carbohydrate 60 g, fat 10 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| quinoa dry | 75 g | 14-843 Quinoa, raw | 232 |
| black beans | 80 g | 13-660 Beans, red kidney, canned in water, re-heated, drained | 80 |
| peppers | 60 g | 13-318 Peppers, capsicum, green, raw | 9 |
| sweetcorn | 30 g | 13-529 Sweetcorn kernels, canned in water, drained | 23 |
| oil | 4.5 g | 17-686 Oil, vegetable, average | 40 |
| lemon | 10 g | 14-277 Lemon juice, fresh | 1 |

## Peanut noodle salad

Total: 337 kcal, protein 15 g, carbohydrate 44 g, fat 12 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| rice noodles | 150 g | 11-725 Noodles, rice, fine, dried, boiled in unsalted water | 134 |
| veg | 80 g | 13-543 Vegetables, mixed, frozen, boiled in unsalted water | 34 |
| edamame | 50 g | 13-667 Beans, edamame, frozen, boiled in unsalted water | 71 |
| pb | 15 g | 14-892 Peanut butter, smooth | 91 |
| soy sauce | 10 g | 17-721 Soy sauce, light and dark varieties | 8 |

## Lentil bolognese

Total: 418 kcal, protein 19 g, carbohydrate 74 g, fat 7 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| lentils | 100 g | 13-661 Lentils, green and brown, whole, dried, boiled in unsalted water | 92 |
| oil | 4.5 g | 17-686 Oil, vegetable, average | 40 |
| ww spaghetti dry | 75 g | 11-718 Pasta, wholewheat, spaghetti, dried, raw | 247 |
| tinned tom | 150 g | 13-530 Tomatoes, canned, whole contents | 28 |
| onion | 40 g | 13-500 Onions, boiled in unsalted water | 10 |

## Butter bean and vegetable stew with bread

Total: 373 kcal, protein 21 g, carbohydrate 59 g, fat 8 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| butter beans | 150 g | 13-665 Beans, haricot, canned, re-heated, drained | 144 |
| veg | 100 g | 13-543 Vegetables, mixed, frozen, boiled in unsalted water | 42 |
| oil | 4.5 g | 17-686 Oil, vegetable, average | 40 |
| wm bread | 50 g | 11-981 Bread, wholemeal, average | 108 |
| tinned tom | 150 g | 13-530 Tomatoes, canned, whole contents | 28 |
| onion | 40 g | 13-500 Onions, boiled in unsalted water | 10 |

## Tofu tikka with rice and salad

Total: 398 kcal, protein 22 g, carbohydrate 46 g, fat 15 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| tofu | 200 g | 13-570 Tofu, soya bean, steamed | 146 |
| soya yog | 30 g | 12-609 Yogurt, soya, non-dairy alternative to yogurt, fruit, fortified | 22 |
| oil | 4.5 g | 17-686 Oil, vegetable, average | 40 |
| white rice | 150 g | 11-858 Rice, white, basmati, boiled in unsalted water | 176 |
| lettuce | 30 g | 13-520 Lettuce, average, raw | 3 |
| cucumber | 30 g | 13-523 Cucumber, raw, flesh and skin | 4 |
| tomato | 30 g | 13-519 Tomatoes, cherry, raw | 7 |

## Roasted vegetable and white bean pasta

Total: 405 kcal, protein 20 g, carbohydrate 67 g, fat 8 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| ww spaghetti dry | 60 g | 11-718 Pasta, wholewheat, spaghetti, dried, raw | 197 |
| veg | 150 g | 13-543 Vegetables, mixed, frozen, boiled in unsalted water | 63 |
| cannellini | 100 g | 13-666 Beans, cannellini, canned, re-heated, drained | 104 |
| olive oil | 4.5 g | 17-038 Oil, olive | 40 |

## Apple with almonds

Total: 113 kcal, protein 3 g, carbohydrate 14 g, fat 6 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| apple | 112 g | 14-319 Apples, eating, raw, flesh and skin | 57 |
| almonds | 10 g | 14-896 Almonds, whole kernels | 55 |

## Banana

Total: 81 kcal, protein 1 g, carbohydrate 20 g, fat 0 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| banana | 100 g | 14-318 Bananas, flesh only | 81 |

## Carrot sticks with hummus

Total: 119 kcal, protein 2 g, carbohydrate 9 g, fat 8 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| carrot | 80 g | 13-496 Carrots, old, raw | 27 |
| hummus | 30 g | 13-556 Houmous | 92 |

## Pear and grapes

Total: 98 kcal, protein 1 g, carbohydrate 25 g, fat 0 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| pear | 150 g | 14-365 Pears, average, raw, flesh only | 66 |
| grapes | 50 g | 14-350 Grapes, average | 32 |

## Mixed nuts

Total: 153 kcal, protein 5 g, carbohydrate 2 g, fat 14 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| nuts | 25 g | 14-896 Almonds, whole kernels; 14-811 Cashew nuts, kernel only, plain; 14-871 Brazil nuts, kernel only; 14-879 Walnuts, kernel only; 14-877 Peanuts, kernel only, plain, unsalted | 153 |

## Oatcakes with peanut butter

Total: 160 kcal, protein 4 g, carbohydrate 15 g, fat 10 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| oatcakes | 22 g | 11-823 Oatcakes, plain, retail | 100 |
| pb | 10 g | 14-892 Peanut butter, smooth | 61 |

## Soya yoghurt with berries and seeds

Total: 182 kcal, protein 7 g, carbohydrate 21 g, fat 8 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| soya yog | 150 g | 12-609 Yogurt, soya, non-dairy alternative to yogurt, fruit, fortified | 108 |
| berries | 50 g | 14-325 Blueberries; 14-324 Strawberries, raw; 14-375 Raspberries, raw | 16 |
| seeds | 10 g | 14-845 Sunflower seeds; 14-842 Pumpkin seeds; 14-844 Sesame seeds | 58 |

## Avocado on toast

Total: 138 kcal, protein 4 g, carbohydrate 16 g, fat 7 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| wm bread | 36 g | 11-981 Bread, wholemeal, average | 78 |
| avocado | 35 g | 14-386 Avocado, Hass, flesh only | 60 |

## Hummus with pitta

Total: 199 kcal, protein 5 g, carbohydrate 21 g, fat 11 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| hummus | 40 g | 13-556 Houmous | 123 |
| pitta | 30 g | 11-974 Bread, pitta, white | 76 |

## Banana with peanut butter

Total: 156 kcal, protein 4 g, carbohydrate 18 g, fat 8 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| banana | 80 g | 14-318 Bananas, flesh only | 65 |
| pb | 15 g | 14-892 Peanut butter, smooth | 91 |

## Nuts and raisins with a satsuma

Total: 155 kcal, protein 4 g, carbohydrate 16 g, fat 9 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| nuts | 15 g | 14-896 Almonds, whole kernels; 14-811 Cashew nuts, kernel only, plain; 14-871 Brazil nuts, kernel only; 14-879 Walnuts, kernel only; 14-877 Peanuts, kernel only, plain, unsalted | 92 |
| raisins | 15 g | 14-393 Raisins, dried | 38 |
| satsuma | 60 g | 14-326 Citrus fruit, soft/easy peelers, flesh only | 25 |

## Toast with peanut butter

Total: 139 kcal, protein 6 g, carbohydrate 16 g, fat 6 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| wm bread | 36 g | 11-981 Bread, wholemeal, average | 78 |
| pb | 10 g | 14-892 Peanut butter, smooth | 61 |

## Orange juice and a banana

Total: 135 kcal, protein 3 g, carbohydrate 33 g, fat 0 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| oj | 150 g | 14-329 Orange juice, chilled | 54 |
| banana | 100 g | 14-318 Bananas, flesh only | 81 |

## Seeds and nuts

Total: 119 kcal, protein 4 g, carbohydrate 2 g, fat 11 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| seeds | 10 g | 14-845 Sunflower seeds; 14-842 Pumpkin seeds; 14-844 Sesame seeds | 58 |
| nuts | 10 g | 14-896 Almonds, whole kernels; 14-811 Cashew nuts, kernel only, plain; 14-871 Brazil nuts, kernel only; 14-879 Walnuts, kernel only; 14-877 Peanuts, kernel only, plain, unsalted | 61 |

## Wholemeal roll

Total: 142 kcal, protein 6 g, carbohydrate 27 g, fat 2 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| brown roll | 60 g | 11-983 Bread rolls, brown, soft | 142 |

## Fruit and nuts

Total: 149 kcal, protein 3 g, carbohydrate 14 g, fat 9 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| apple | 112 g | 14-319 Apples, eating, raw, flesh and skin | 57 |
| nuts | 15 g | 14-896 Almonds, whole kernels; 14-811 Cashew nuts, kernel only, plain; 14-871 Brazil nuts, kernel only; 14-879 Walnuts, kernel only; 14-877 Peanuts, kernel only, plain, unsalted | 92 |

## Three bean salad

Total: 114 kcal, protein 8 g, carbohydrate 17 g, fat 2 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| beans mixed | 100 g | 13-660 Beans, red kidney, canned in water, re-heated, drained; 13-666 Beans, cannellini, canned, re-heated, drained; 13-670 Beans, chick peas, canned, re-heated, drained | 111 |
| dressing | 10 g | 17-716 Dressing, French, fat free | 3 |

## Extra rice, pasta or potatoes

Total: 133 kcal, protein 4 g, carbohydrate 29 g, fat 1 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| 125 g cooked, one of | 125 g | 11-858 Rice, white, basmati, boiled in unsalted water | 146 |
| 125 g cooked, one of | 125 g | 11-723 Pasta, wholewheat, spaghetti, dried, boiled in unsalted water | 168 |
| 125 g cooked, one of | 125 g | 13-495 Potatoes, new and salad, boiled in unsalted water, flesh and skin | 85 |

The figure is the average of the three.

## Bread with olive spread

Total: 151 kcal, protein 5 g, carbohydrate 26 g, fat 4 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| white bread | 50 g | 11-923 Bread, white, crusty bloomer, unsliced, fresh, large | 124 |
| spread | 5 g | 12-504 Fat spread, reduced fat (41-62%), not polyunsaturated | 28 |

## Fruit salad with soya yoghurt

Total: 126 kcal, protein 4 g, carbohydrate 25 g, fat 2 g.

| Ingredient | Weight | CoFID code and food | kcal |
|---|---|---|---|
| fruit salad | 120 g | 14-336 Fruit cocktail, canned in juice, whole contents | 54 |
| soya yog | 100 g | 12-609 Yogurt, soya, non-dairy alternative to yogurt, fruit, fortified | 72 |

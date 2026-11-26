import type { Metadata } from "next";
import Link from "next/link";
import LearnChrome from "@/app/learn/chrome";
import { ACTIVITIES } from "@/lib/activities";

export const metadata: Metadata = {
  title: "How we calculate",
  description:
    "Where every calorie figure in My Weight Loss Journal comes from: food databases, your daily target, exercise and safety limits, with references.",
};

interface Ref {
  id: string;
  text: string;
  href?: string;
}

// Numbered in the order they are first cited on the page.
const REFS: Ref[] = [
  { id: "usda", text: "U.S. Department of Agriculture, Agricultural Research Service. FoodData Central. Survey (FNDDS), SR Legacy and Foundation Foods datasets.", href: "https://fdc.nal.usda.gov/" },
  { id: "off", text: "Open Food Facts. A free, open database of food products from around the world, built from product labels. Open Database Licence.", href: "https://world.openfoodfacts.org/" },
  { id: "cofid", text: "Public Health England. McCance and Widdowson's The Composition of Foods Integrated Dataset (CoFID), 2021.", href: "https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid" },
  { id: "units", text: "UK Chief Medical Officers. UK Chief Medical Officers' Low Risk Drinking Guidelines. Department of Health, 2016.", href: "https://www.gov.uk/government/publications/alcohol-consumption-advice-on-low-risk-drinking" },
  { id: "mifflin", text: "Mifflin MD, St Jeor ST, Hill LA, Scott BJ, Daugherty SA, Koh YO. A new predictive equation for resting energy expenditure in healthy individuals. American Journal of Clinical Nutrition 1990;51(2):241-247.", href: "https://doi.org/10.1093/ajcn/51.2.241" },
  { id: "frankenfield", text: "Frankenfield D, Roth-Yousey L, Compher C. Comparison of predictive equations for resting metabolic rate in healthy nonobese and obese adults: a systematic review. Journal of the American Dietetic Association 2005;105(5):775-789.", href: "https://doi.org/10.1016/j.jada.2005.02.005" },
  { id: "fao", text: "FAO, WHO and UNU. Human energy requirements. Report of a Joint FAO/WHO/UNU Expert Consultation. FAO Food and Nutrition Technical Report Series 1. Rome, 2004.", href: "https://www.fao.org/4/y5686e/y5686e00.htm" },
  { id: "wishnofsky", text: "Wishnofsky M. Caloric equivalents of gained or lost weight. American Journal of Clinical Nutrition 1958;6(5):542-546.", href: "https://doi.org/10.1093/ajcn/6.5.542" },
  { id: "hall", text: "Hall KD, Sacks G, Chandramohan D, et al. Quantification of the effect of energy imbalance on bodyweight. The Lancet 2011;378(9793):826-837.", href: "https://doi.org/10.1016/S0140-6736(11)60812-X" },
  { id: "nice", text: "National Institute for Health and Care Excellence. Overweight and obesity management. NICE guideline NG246, 2025.", href: "https://www.nice.org.uk/guidance/ng246" },
  { id: "nhlbi", text: "National Heart, Lung, and Blood Institute. Clinical Guidelines on the Identification, Evaluation, and Treatment of Overweight and Obesity in Adults: The Evidence Report. NIH Publication 98-4083, 1998.", href: "https://www.ncbi.nlm.nih.gov/books/NBK2003/" },
  { id: "who", text: "World Health Organization. Obesity: preventing and managing the global epidemic. WHO Technical Report Series 894. Geneva, 2000.", href: "https://iris.who.int/handle/10665/42330" },
  { id: "nice-bmi", text: "National Institute for Health and Care Excellence. BMI: preventing ill health and premature death in black, Asian and other minority ethnic groups. Public health guideline PH46, 2013.", href: "https://www.nice.org.uk/guidance/ph46" },
  { id: "leidy", text: "Leidy HJ, Clifton PM, Astrup A, et al. The role of protein in weight loss and maintenance. American Journal of Clinical Nutrition 2015;101(6):1320S-1329S.", href: "https://doi.org/10.3945/ajcn.114.084038" },
  { id: "ainsworth", text: "Ainsworth BE, Haskell WL, Herrmann SD, et al. 2011 Compendium of Physical Activities: a second update of codes and MET values. Medicine and Science in Sports and Exercise 2011;43(8):1575-1581.", href: "https://doi.org/10.1249/MSS.0b013e31821ece12" },
  { id: "herrmann", text: "Herrmann SD, Willis EA, Ainsworth BE, et al. 2024 Adult Compendium of Physical Activities: a third update of the energy costs of human activities. Journal of Sport and Health Science 2024;13(1):6-12.", href: "https://doi.org/10.1016/j.jshs.2023.10.010" },
  { id: "cmo", text: "UK Chief Medical Officers. UK Chief Medical Officers' Physical Activity Guidelines. Department of Health and Social Care, 2019.", href: "https://www.gov.uk/government/publications/physical-activity-guidelines-uk-chief-medical-officers-report" },
  { id: "tudor-cadence", text: "Tudor-Locke C, Han H, Aguiar EJ, et al. How fast is fast enough? Walking cadence (steps/min) as a practical estimate of intensity in adults: a narrative review. British Journal of Sports Medicine 2018;52(12):776-788.", href: "https://doi.org/10.1136/bjsports-2017-097628" },
  { id: "tudor-steps", text: "Tudor-Locke C, Bassett DR. How many steps/day are enough? Preliminary pedometer indices for public health. Sports Medicine 2004;34(1):1-8.", href: "https://doi.org/10.2165/00007256-200434010-00001" },
];

const NUM = Object.fromEntries(REFS.map((r, i) => [r.id, i + 1]));

/** A citation mark that jumps to the reference list. */
function Cite({ ids }: { ids: string[] }) {
  return (
    <sup className="ml-0.5 text-xs">
      [
      {ids.map((id, i) => (
        <span key={id}>
          {i ? ", " : ""}
          <a href={`#ref-${id}`} className="text-leaf underline-offset-2 hover:underline">{NUM[id]}</a>
        </span>
      ))}
      ]
    </sup>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="mt-10 scroll-mt-20 font-display text-2xl text-ink">{children}</h2>;
}

const walk = ACTIVITIES.find((a) => a.name === "Walking, brisk")?.met ?? 4.3;

export default function HowWeCalculatePage() {
  return (
    <LearnChrome note="Calorie figures are estimates to help you keep a journal. They are not medical advice.">
      <h1 className="mt-6 font-display text-4xl text-ink">How we calculate</h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
        Every calorie figure in the journal comes from a published source or a stated formula. This page lists them all, so
        you, or your GP, can check any number.
      </p>
      <p className="mt-3 text-sm text-muted">Last updated 26 November 2026</p>

      <nav aria-label="On this page" className="card mt-6 max-w-2xl p-4 text-sm">
        <ul className="grid gap-1.5 sm:grid-cols-2">
          <li><a href="#food" className="text-leaf hover:underline">Calories in food and drink</a></li>
          <li><a href="#target" className="text-leaf hover:underline">Your daily calorie target</a></li>
          <li><a href="#safety" className="text-leaf hover:underline">Safety limits</a></li>
          <li><a href="#exercise" className="text-leaf hover:underline">Exercise and steps</a></li>
          <li><a href="#deficit" className="text-leaf hover:underline">Your daily deficit</a></li>
          <li><a href="#limits" className="text-leaf hover:underline">How precise these figures are</a></li>
          <li><a href="#references" className="text-leaf hover:underline">References</a></li>
        </ul>
      </nav>

      <div className="max-w-2xl leading-relaxed text-ink">
        <H2 id="food">Calories in food and drink</H2>
        <p className="mt-3">
          Each food in your journal shows a small label saying where its calories came from. Where there is an exact record,
          the label links to it.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-6 marker:text-leaf">
          <li>
            <strong>USDA.</strong> Food search uses FoodData Central from the United States Department of Agriculture, one of
            the largest public food databases.<Cite ids={["usda"]} /> Figures are per 100 g, and we scale them to the amount
            you enter. British food names, such as &ldquo;semi-skimmed milk&rdquo; or &ldquo;jacket potato&rdquo;, are matched
            to their American names before searching.
          </li>
          <li>
            <strong>Product label.</strong> Barcode scans use Open Food Facts, which records the nutrition panel printed on
            the pack.<Cite ids={["off"]} /> If a label gives energy only in kilojoules, we divide by 4.184 to get kilocalories.
          </li>
          <li>
            <strong>UK food tables.</strong> The drinks list and the meal plans are worked out from McCance and
            Widdowson&rsquo;s Composition of Foods, the UK&rsquo;s official food tables, published by Public Health
            England.<Cite ids={["cofid"]} /> For drinks, beer, cider and wine are taken as 100 g per 100 ml and spirits as
            95 g per 100 ml. Alcohol units are the volume in millilitres times the strength, divided by 1,000.
            <Cite ids={["units"]} />
          </li>
          <li>
            <strong>AI estimate.</strong> When you describe a meal or take a photo, an AI model (Claude, made by Anthropic)
            estimates the calories. You see the estimate and can change it before it is saved. These are the least precise
            figures in the journal, and for packaged food a barcode scan is better.
          </li>
          <li>
            <strong>Your entry.</strong> Figures you type in yourself, for example from a menu or a recipe.
          </li>
        </ul>
        <p className="mt-3">
          The meal plan working, with the UK food table code for every ingredient, is published with the app&rsquo;s
          source code so it can be checked line by line.
        </p>

        <H2 id="target">Your daily calorie target</H2>
        <p className="mt-3">Your target is worked out in three steps from your profile.</p>
        <ol className="mt-3 list-decimal space-y-2 pl-6 marker:text-leaf">
          <li>
            <strong>Energy at rest</strong> (basal metabolic rate) uses the Mifflin-St Jeor equation, which a systematic
            review found the most accurate of the common equations for adults, including those living with obesity.
            <Cite ids={["mifflin", "frankenfield"]} />
            <span className="mt-2 block rounded-xl bg-leaf-soft px-4 py-3 text-sm">
              Women: 10 &times; weight (kg) + 6.25 &times; height (cm) &minus; 5 &times; age &minus; 161
              <br />
              Men: 10 &times; weight (kg) + 6.25 &times; height (cm) &minus; 5 &times; age + 5
            </span>
          </li>
          <li>
            <strong>Energy in a normal day</strong> is that figure times an activity factor for the level you choose: 1.2 for
            mostly sitting, 1.375 for lightly active, 1.55 for moderately active and 1.725 for very active. This follows the
            physical activity level approach of the FAO, WHO and UNU.<Cite ids={["fao"]} /> Our factors are at the cautious
            end, so they tend to give a slightly lower target rather than a higher one.
          </li>
          <li>
            <strong>The daily gap</strong> for your chosen pace is worked out from 7,700 kcal for each kilogram of body fat.
            <Cite ids={["wishnofsky"]} /> For example, 0.5 kg a week is 0.5 &times; 7,700 &divide; 7 = 550 kcal a day. Weight
            loss naturally slows as you get lighter,<Cite ids={["hall"]} /> so the journal recalculates your target from your
            latest weight, and if you set a goal date it re-paces the plan each week.
          </li>
        </ol>
        <p className="mt-3">
          Protein is set at 1.2 g per kilogram of body weight, kept between 60 g and 120 g a day, to help protect muscle and
          keep you full while you lose weight.<Cite ids={["leidy"]} />
        </p>

        <H2 id="safety">Safety limits</H2>
        <ul className="mt-3 list-disc space-y-2 pl-6 marker:text-leaf">
          <li>
            The fastest pace the journal will plan is 1 kg a week, in line with NICE guidance on safe, steady weight loss.
            <Cite ids={["nice"]} />
          </li>
          <li>
            The target never goes below 1,200 kcal a day for women or 1,500 kcal for men without medical supervision. These
            are at or above the lowest levels in the US National Institutes of Health guidelines.<Cite ids={["nhlbi"]} />
          </li>
          <li>
            The journal will not suggest a goal weight below a BMI of 18.5, the lower limit of the healthy range.
            <Cite ids={["who"]} /> People from Black, Asian and some other ethnic backgrounds have health risks at a lower BMI,
            so their healthy range may be lower; their GP can advise.<Cite ids={["nice-bmi"]} />
          </li>
          <li>
            Suggested first goals are a loss of 5% or 10% of body weight, where much of the health benefit comes.
            <Cite ids={["nice"]} />
          </li>
        </ul>

        <H2 id="exercise">Exercise and steps</H2>
        <p className="mt-3">
          Exercise calories use a different source from food. Each activity has a MET value (metabolic equivalent) from the
          Compendium of Physical Activities, the standard research list of the energy cost of activities.
          <Cite ids={["ainsworth", "herrmann"]} />
        </p>
        <p className="mt-3 rounded-xl bg-leaf-soft px-4 py-3 text-sm">
          Calories = MET &times; weight (kg) &times; hours. A 30 minute brisk walk ({walk} METs) for someone weighing 80 kg is{" "}
          {walk} &times; 80 &times; 0.5 = {Math.round(walk * 80 * 0.5)} kcal.
        </p>
        <p className="mt-3">
          MET figures include the energy your body would use at rest anyway, so they slightly overstate the extra calories an
          activity burns. That is one reason the journal never adds exercise calories back to your food allowance: exercise
          is a bonus on top of your plan. The daily deficit below counts only the extra burn. The exercise plans follow the UK Chief Medical Officers&rsquo; advice of 150 minutes
          of moderate activity a week plus strength work on two days.<Cite ids={["cmo"]} />
        </p>

        <H2 id="deficit">Your daily deficit: food, exercise and steps</H2>
        <p className="mt-3">
          Near the bottom of the Today page, the journal adds up your calorie deficit for the day, for information only. Your
          food target does not change because of it.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-6 marker:text-leaf">
          <li>
            <strong>From food:</strong> the energy you use on a usual day (from your target calculation above, before the
            planned gap) minus what you have eaten.
          </li>
          <li>
            <strong>From exercise:</strong> only the extra burn. We take away 1 MET, the energy your body uses at rest, so
            the time you spent exercising is not counted twice. A 30 minute brisk walk for someone weighing 80 kg adds (
            {walk} &minus; 1) &times; 80 &times; 0.5 = {Math.round((walk - 1) * 80 * 0.5)} kcal.
          </li>
          <li>
            <strong>From steps:</strong> walking at about 100 steps a minute is moderate activity of about 3 METs.
            <Cite ids={["tudor-cadence"]} /> Taking away the 1 MET used at rest, each step adds 2 &times; weight (kg)
            &divide; 6,000 kcal, so 1,000 steps for someone weighing 80 kg is about 27 kcal. Your activity level already
            allows for everyday walking, so only steps above a usual amount for that level are counted: 2,500 for mostly
            sitting, 5,000 for lightly active, 7,500 for moderately active and 10,000 for very active, following the step
            bands of Tudor-Locke and Bassett.<Cite ids={["tudor-steps"]} /> Steps taken during a walk or run you have
            logged are also left out (about 100 steps a minute walking and 160 running), so they are not counted twice.
          </li>
        </ul>
        <p className="mt-3">
          The weekly total adds up the days with food logged in the last seven days, and divides by 7,700 kcal to give a rough
          figure in kilograms of body fat.<Cite ids={["wishnofsky"]} /> A day with meals left out will look better than it
          really was.
        </p>

        <H2 id="limits">How precise these figures are</H2>
        <p className="mt-3">
          All of these are good estimates, not exact measurements. The same food varies from brand to brand and from one
          batch to the next, and equations predict the average person, not you exactly: Mifflin-St Jeor is within about 10%
          for most adults.<Cite ids={["frankenfield"]} /> That is why the journal checks your plan against your real weight
          each week. If your weight is not changing as expected after a few weeks, your trend is the best guide.
        </p>
        <p className="mt-3">
          Spotted a figure that looks wrong? Tell us, using the contact details on this website, with the food and where you
          saw it, and we will check it against the source. You can also read more in <Link href="/learn/how-weight-loss-works" className="text-leaf underline-offset-4 hover:underline">How weight loss works</Link>.
        </p>

        <H2 id="references">References</H2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm marker:text-muted">
          {REFS.map((r) => (
            <li key={r.id} id={`ref-${r.id}`} className="scroll-mt-20">
              {r.text}{" "}
              {r.href ? (
                <a href={r.href} target="_blank" rel="noopener noreferrer" className="break-all text-leaf underline-offset-2 hover:underline">
                  {r.href.replace(/^https:\/\//, "")}
                </a>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </LearnChrome>
  );
}

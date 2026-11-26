import type { Entry, Favourite } from "./types";

/**
 * Where a food's calories came from. Kept on each entry, and carried along
 * when a food is logged again from Recent, Favourites, a saved meal or
 * "copy yesterday", so anyone can see and check the source of a number.
 */
export type FoodOrigin = "usda" | "label" | "cofid" | "ai" | "you" | "typical" | "plan" | "mixed";

export interface SourceTag {
  label: string;
  /** A longer description, for screen readers and the hover title. */
  title: string;
  /** The exact record the number came from, when there is one. */
  href?: string;
}

const TAGS: Record<FoodOrigin, Omit<SourceTag, "href">> = {
  usda: { label: "USDA", title: "From the USDA FoodData Central database" },
  label: { label: "Product label", title: "From the product's nutrition label, via Open Food Facts" },
  cofid: { label: "UK food tables", title: "From McCance and Widdowson's Composition of Foods (CoFID), the UK's official food tables" },
  ai: { label: "AI estimate", title: "Estimated by AI from a description or photo, then checked by you" },
  you: { label: "Your entry", title: "A figure you typed in yourself" },
  typical: { label: "Typical figure", title: "A typical figure from an earlier version of the journal's drinks list" },
  plan: { label: "Meal plan", title: "From the journal's meal plans, worked out from the UK food tables (CoFID)" },
  mixed: { label: "Several sources", title: "Made up of foods from more than one source" },
};

/** The source of an entry, working it out from how it was added for entries saved before sources were kept. */
export function originOf(e: Pick<Entry, "origin" | "source">): FoodOrigin | undefined {
  if (e.origin) return e.origin;
  switch (e.source) {
    case "photo":
    case "describe":
      return "ai";
    case "manual":
      return "you";
    case "drink":
      return "typical";
    case "plan":
      return "plan";
    // Older searches and barcode scans were saved the same way, so we cannot tell which.
    default:
      return undefined;
  }
}

export function sourceTag(origin: FoodOrigin | undefined, ref?: string): SourceTag | null {
  if (!origin) return null;
  const tag: SourceTag = { ...TAGS[origin] };
  if (ref && origin === "usda" && /^\d+$/.test(ref)) tag.href = `https://fdc.nal.usda.gov/food-details/${ref}/nutrients`;
  if (ref && origin === "label" && /^\d{8,14}$/.test(ref)) tag.href = `https://world.openfoodfacts.org/product/${ref}`;
  return tag;
}

/** The source fields to copy when a food is logged again. */
export function sourceFields(x: Pick<Entry, "origin" | "ref" | "source">): Pick<Favourite, "origin" | "ref"> {
  const origin = originOf(x);
  return origin ? { origin, ref: x.ref } : {};
}

/** One source for a group of foods, such as a recipe logged as a single line. */
export function combinedOrigin(items: Pick<Favourite, "origin">[]): FoodOrigin | undefined {
  const all = new Set(items.map((i) => i.origin));
  if (all.size === 1) return items[0]?.origin;
  return all.size ? "mixed" : undefined;
}

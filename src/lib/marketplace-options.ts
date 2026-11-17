export function compactBrands<T>(brands: T[]) {
  return { visible: brands.slice(0, 7), others: brands.slice(7) };
}

export function countSubcategories(rows: { subcategory: string | null }[]) {
  return rows.reduce<Record<string, number>>((counts, row) => {
    if (row.subcategory) counts[row.subcategory] = (counts[row.subcategory] ?? 0) + 1;
    return counts;
  }, {});
}

export const canContactSeller = (signedIn: boolean) => signedIn;
const REFURB = ["Brand New", "Refurbished"];
const NEW_USED = ["Brand New", "Used"];
const NEW_USED_REFURB = ["Brand New", "Used", "Refurbished"];
const CONDITIONS: Record<string, string[]> = {
  cars: ["Brand New", "Foreign Used", "Locally Used"],
  property: ["New Development", "Resale"],
  "phones-tablets": REFURB,
  electronics: REFURB,
  "home-appliances": NEW_USED_REFURB,
  "commercial-equipment": NEW_USED_REFURB,
  "business-industry": NEW_USED_REFURB,
  furniture: NEW_USED_REFURB,
  fashion: NEW_USED,
  "babies-kids": NEW_USED,
  "leisure-sports": NEW_USED,
  agriculture: NEW_USED,
  "repair-construction": NEW_USED,
  "office-school": NEW_USED,
  jobs: ["Available"],
  services: ["Available"],
};
/** Condition choices relevant to a category (posting and filters). */
export const conditionOptionsFor = (slug: string) => CONDITIONS[slug] ?? ["Brand New"];

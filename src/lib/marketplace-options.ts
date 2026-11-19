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

const PROPERTY_SUBCATEGORY_FILTERS: Record<string, string[]> = {
  "short lets": ["Airbnb", "Lease"],
  "land and farms": ["Lands", "Farms", "Ranches"],
  "land & farms": ["Lands", "Farms", "Ranches"],
  land: ["Lands", "Farms", "Ranches"],
  "property services": ["Management", "Maintenance", "Cleaning", "Security"],
  "property service": ["Management", "Maintenance", "Cleaning", "Security"],
  commercial: ["Office Spaces", "Shops & Malls", "Warehouses", "Hospitals", "Schools"],
};

/** Condition choices relevant to a category and, where applicable, its subcategory.
 * A single "Brand New" choice adds no useful filter beyond "Any", so it is hidden.
 */
export const conditionOptionsFor = (slug: string, subcategory = "") => {
  if (slug === "food-stuff") return [];
  if (slug === "property") {
    const key = subcategory.trim().toLowerCase().replace(/\s+/g, " ");
    if (/^plots?\b/.test(key)) return [];
    if (PROPERTY_SUBCATEGORY_FILTERS[key]) return PROPERTY_SUBCATEGORY_FILTERS[key];
    if (/^(houses? to let|land for sale|plots? for sale|land and plots? for sale|plots? and land for sale)$/.test(key)) return [];
  }
  const options = CONDITIONS[slug] ?? ["Brand New"];
  return options.length === 1 && options[0] === "Brand New" ? [] : options;
};

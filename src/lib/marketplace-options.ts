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
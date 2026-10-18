import { useSyncExternalStore } from "react";

// One shared set of buyer filters, so search/price/location/sort apply on every listings page.
export type MarketFilters = { q: string; min: string; max: string; location: string; sort: "recent" | "price_asc" | "price_desc" };
export const emptyFilters: MarketFilters = { q: "", min: "", max: "", location: "", sort: "recent" };
let state: MarketFilters = emptyFilters;
const listeners = new Set<() => void>();

export function setMarketFilters(patch: Partial<MarketFilters>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
export function useMarketFilters(): MarketFilters {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => state,
    () => emptyFilters,
  );
}
export const activeFilterCount = (f: MarketFilters) =>
  [f.min, f.max, f.location].filter(Boolean).length + (f.sort !== "recent" ? 1 : 0);

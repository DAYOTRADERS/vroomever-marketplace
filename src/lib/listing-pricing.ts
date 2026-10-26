export type ListingCadence = "monthly" | "annual";
export const DEFAULT_MONTHLY = 150;
export const DEFAULT_ANNUAL = 1500;
export function validListingPrices(monthly: number, annual: number) {
  return Number.isInteger(monthly) && Number.isInteger(annual) && monthly >= 150 && annual <= 2500 && annual >= 150 && monthly <= 2500 && monthly < annual;
}
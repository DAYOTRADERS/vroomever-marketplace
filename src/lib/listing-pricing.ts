export type ListingCadence = "weekly" | "monthly" | "annual";
export const DEFAULT_WEEKLY = 50;
export const DEFAULT_MONTHLY = 150;
export const DEFAULT_ANNUAL = 1500;
export function validListingPrices(monthly: number, annual: number) {
  return Number.isInteger(monthly) && Number.isInteger(annual) && monthly >= 150 && annual <= 2500 && annual >= 150 && monthly <= 2500 && monthly < annual;
}
export function validWeeklyPrice(weekly: number, monthly: number) {
  return Number.isInteger(weekly) && weekly >= 50 && weekly <= 2500 && weekly <= monthly;
}
export function cadenceLabel(c: ListingCadence | string) {
  return c === "weekly" ? "Weekly · 7 days" : c === "monthly" ? "Monthly · 1 month" : "Yearly · 1 year";
}
export function feeFor(p: { weekly_ksh: number; monthly_ksh: number; annual_ksh: number }, c: ListingCadence) {
  return c === "weekly" ? p.weekly_ksh : c === "monthly" ? p.monthly_ksh : p.annual_ksh;
}

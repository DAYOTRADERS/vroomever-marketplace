import { describe, expect, it } from "bun:test";
import { DEFAULT_MONTHLY, DEFAULT_ANNUAL, validListingPrices } from "./listing-pricing";
describe("subcategory listing prices", () => {
  it("starts monthly at 150 KSh", () => expect(DEFAULT_MONTHLY).toBe(150));
  it("starts annual at 1500 KSh", () => expect(DEFAULT_ANNUAL).toBe(1500));
  it("rejects either price below 150", () => { expect(validListingPrices(149,1500)).toBe(false); expect(validListingPrices(150,149)).toBe(false); });
  it("caps both packages at 2500", () => { expect(validListingPrices(2501,2502)).toBe(false); expect(validListingPrices(150,2501)).toBe(false); expect(validListingPrices(150,2500)).toBe(true); });
  it("keeps monthly cheaper", () => { expect(validListingPrices(1500,1500)).toBe(false); expect(validListingPrices(1500,150)).toBe(false); });
});
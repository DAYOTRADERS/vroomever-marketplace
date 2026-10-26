import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { DEFAULT_MONTHLY, DEFAULT_ANNUAL, validListingPrices } from "./listing-pricing";
describe("subcategory listing prices", () => {
  it("starts monthly at 150 KSh", () => assert.equal(DEFAULT_MONTHLY,150));
  it("starts annual at 1500 KSh", () => assert.equal(DEFAULT_ANNUAL,1500));
  it("rejects either price below 150", () => { assert.equal(validListingPrices(149,1500),false); assert.equal(validListingPrices(150,149),false); });
  it("caps both packages at 2500", () => { assert.equal(validListingPrices(2501,2502),false); assert.equal(validListingPrices(150,2501),false); assert.equal(validListingPrices(150,2500),true); });
  it("keeps monthly cheaper", () => { assert.equal(validListingPrices(1500,1500),false); assert.equal(validListingPrices(1500,150),false); });
});
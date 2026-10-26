import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compactBrands, countSubcategories, canContactSeller } from "./marketplace-options";

describe("marketplace choices", () => {
  it("reserves the eighth slot for Others and retains every remaining brand", () => {
    const brands = Array.from({ length: 20 }, (_, i) => `Brand ${i}`);
    assert.deepEqual(compactBrands(brands).visible, brands.slice(0, 7));
    assert.deepEqual(compactBrands(brands).others, brands.slice(7));
  });
  it("counts actual listings separately for each subcategory", () => {
    assert.deepEqual(countSubcategories([{ subcategory: "Cars" }, { subcategory: "Trucks" }, { subcategory: "Cars" }, { subcategory: null }]), { Cars: 2, Trucks: 1 });
  });
  it("requires sign-in to expose seller contact controls", () => {
    assert.equal(canContactSeller(false), false);
    assert.equal(canContactSeller(true), true);
  });
});
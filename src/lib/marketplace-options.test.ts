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
import { conditionOptionsFor } from "./marketplace-options";
import { describe as d2, it as i2, expect as e2 } from "vitest";
d2("conditionOptionsFor", () => {
  i2("phones and electronics are refurbished, never used", () => {
    e2(conditionOptionsFor("phones-tablets")).toEqual(["Brand New", "Refurbished"]);
    e2(conditionOptionsFor("electronics")).not.toContain("Used");
  });
  i2("fashion offers used", () => e2(conditionOptionsFor("fashion")).toEqual(["Brand New", "Used"]));
});

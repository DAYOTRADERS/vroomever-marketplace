import { describe, expect, it } from "vitest";
import { compactBrands, countSubcategories, canContactSeller } from "./marketplace-options";

describe("marketplace choices", () => {
  it("reserves the eighth slot for Others and retains every remaining brand", () => {
    const brands = Array.from({ length: 20 }, (_, i) => `Brand ${i}`);
    expect(compactBrands(brands).visible).toEqual(brands.slice(0, 7));
    expect(compactBrands(brands).others).toEqual(brands.slice(7));
  });
  it("counts actual listings separately for each subcategory", () => {
    expect(countSubcategories([{ subcategory: "Cars" }, { subcategory: "Trucks" }, { subcategory: "Cars" }, { subcategory: null }])).toEqual({ Cars: 2, Trucks: 1 });
  });
  it("requires sign-in to expose seller contact controls", () => {
    expect(canContactSeller(false)).toBe(false);
    expect(canContactSeller(true)).toBe(true);
  });
});
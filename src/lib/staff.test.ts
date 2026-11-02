import { describe, expect, test } from "bun:test";
import { canOpenStaffPage, staffHome } from "./staff";
describe("staff pages", () => {
  test("customer care opens only /customeradmin", () => { expect(canOpenStaffPage("customer_care", "customer_care")).toBe(true); expect(canOpenStaffPage("secretary", "customer_care")).toBe(false); });
  test("buyers, sellers and admins cannot use staff pages", () => { for (const r of ["buyer", "seller", "admin", null]) expect(canOpenStaffPage("secretary", r)).toBe(false); });
  test("staff homes", () => { expect(staffHome.customer_care).toBe("/customeradmin"); expect(staffHome.secretary).toBe("/secretaryadmin"); });
});

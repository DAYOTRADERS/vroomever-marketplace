import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { canOpenStaffPage, staffHome } from "./staff";
describe("staff pages", () => {
  it("customer care opens only /customeradmin", () => { assert.equal(canOpenStaffPage("customer_care", "customer_care"), true); assert.equal(canOpenStaffPage("secretary", "customer_care"), false); });
  it("buyers, sellers and admins cannot use staff pages", () => { for (const r of ["buyer", "seller", "admin", null]) assert.equal(canOpenStaffPage("secretary", r), false); });
  it("staff homes", () => { assert.equal(staffHome.customer_care, "/customeradmin"); assert.equal(staffHome.secretary, "/secretaryadmin"); });
});

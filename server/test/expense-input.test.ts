import assert from "node:assert/strict";
import { test } from "node:test";
import { parseExpenseInput, parseReturnedInput } from "../src/expense-input.js";

const base = { title: "Club supplies", category: "EQUIPMENT", amountBaht: 50 };

test("T-05: expense input accepts valid title and whole-baht boundaries", () => {
  for (const amountBaht of [1, 100_000]) {
    assert.deepEqual(parseExpenseInput({ ...base, title: "  A  ", amountBaht }), {
      ...base, title: "A", amountBaht,
    });
  }
  const longest = "a".repeat(120);
  assert.deepEqual(parseExpenseInput({ ...base, title: ` ${longest} ` }), { ...base, title: longest });
  const unicodeTitle = "ค่าเดินทาง 🚆";
  assert.deepEqual(parseExpenseInput({ ...base, title: unicodeTitle }), { ...base, title: unicodeTitle });
});

test("T-05: expense input rejects invalid title, category, amount and extra fields", () => {
  // AC-L7-01/02: EQUIPMENT upper invalid boundary changes; all other negatives remain.
  for (const amountBaht of [0, 120_001, 1.5, "100"]) {
    assert.equal(parseExpenseInput({ ...base, amountBaht }), null, `Invalid amount: ${amountBaht}`);
  }
  for (const body of [
    { ...base, title: "   " },
    { ...base, title: "a".repeat(121) },
    { ...base, title: "invalid\0title" },
    { ...base, category: "OTHER" },
    { ...base, requesterId: "client-value" },
    null,
  ]) {
    assert.equal(parseExpenseInput(body), null, JSON.stringify(body));
  }
});

// Literal expected policy, intentionally independent of all production constants.
const policyCases = [
  ["ACTIVITY", 1, true], ["ACTIVITY", 150000, true], ["ACTIVITY", 150001, false],
  ["EQUIPMENT", 1, true], ["EQUIPMENT", 120000, true], ["EQUIPMENT", 120001, false],
  ["TRAVEL", 1, true], ["TRAVEL", 100000, true], ["TRAVEL", 100001, false],
  ["ACTIVITY", 125000, true], ["EQUIPMENT", 125000, false], ["TRAVEL", 125000, false],
  ["ACTIVITY", 110000, true], ["EQUIPMENT", 110000, true], ["TRAVEL", 110000, false],
] as const;
for (const parser of ["creation", "returned Save"] as const) {
  for (const [category, amountBaht, accepted] of policyCases) {
    test(`AC-L7-01/02 STS-L7-01 unit ${parser}: ${category} ${amountBaht} ${accepted ? "accepted" : "rejected"}`, () => {
      const fields = { ...base, category, amountBaht };
      const actual = parser === "creation" ? parseExpenseInput(fields) : parseReturnedInput({ ...fields, expectedRevision: 7 }, true);
      assert.deepEqual(actual, accepted ? parser === "creation" ? fields : { expectedRevision: 7, fields } : null);
    });
  }
  test(`AC-L7-02 STS-L7-01 unit ${parser}: unchanged invalid amount/category controls`, () => {
    for (const amountBaht of [0, -1, 1.5, "100000", null, true, {}, [], undefined, NaN, Infinity]) {
      const fields = { ...base, amountBaht };
      assert.equal(parser === "creation" ? parseExpenseInput(fields) : parseReturnedInput({ ...fields, expectedRevision: 7 }, true), null);
    }
    for (const category of ["UNKNOWN", "", null, undefined]) {
      const fields = { ...base, category };
      assert.equal(parser === "creation" ? parseExpenseInput(fields) : parseReturnedInput({ ...fields, expectedRevision: 7 }, true), null);
    }
  });
}

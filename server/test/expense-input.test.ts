import assert from "node:assert/strict";
import { test } from "node:test";
import { parseExpenseInput } from "../src/expense-input.js";

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
  for (const amountBaht of [0, 100_001, 1.5, "100"]) {
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

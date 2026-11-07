import assert from "node:assert/strict";
import { test } from "node:test";
import { parseDecisionInput } from "../src/expense-input.js";
import { canDecideExpense } from "../src/expense-requests.js";

test("T-07: decision input accepts approval and trimmed rejection reason boundaries", () => {
  assert.deepEqual(parseDecisionInput({ decision: "APPROVED" }), { decision: "APPROVED", reason: null });
  for (const reason of ["a", "x".repeat(300), "ตรวจสอบใหม่ 🚆"]) {
    assert.deepEqual(parseDecisionInput({ decision: "REJECTED", reason: ` ${reason} ` }), { decision: "REJECTED", reason });
  }
});

test("T-07: decision input rejects invalid shapes, reasons and extra fields", () => {
  for (const body of [
    null, {}, { decision: "RETURNED" }, { decision: "APPROVED", reason: "extra field" },
    { decision: "REJECTED" }, { decision: "REJECTED", reason: 1 },
    { decision: "REJECTED", reason: "" }, { decision: "REJECTED", reason: " ".repeat(3) },
    { decision: "REJECTED", reason: "x".repeat(301) },
    { decision: "REJECTED", reason: "bad\0reason" }, { decision: "REJECTED", reason: "\udfff" },
  ]) {
    assert.equal(parseDecisionInput(body), null, JSON.stringify(body));
  }
});

test("T-10: decision policy permits only an assigned reviewer who is not the requester", () => {
  const expense = { requesterId: "requester", assignedReviewerId: "reviewer" };
  assert.equal(canDecideExpense({ id: "reviewer", role: "REVIEWER" }, expense), true);
  assert.equal(canDecideExpense({ id: "other-reviewer", role: "REVIEWER" }, expense), false);
  assert.equal(canDecideExpense({ id: "reviewer", role: "REQUESTER" }, expense), false);
  assert.equal(canDecideExpense({ id: "reviewer", role: "REVIEWER" }, { ...expense, requesterId: "reviewer" }), false);
});

import assert from "node:assert/strict";
import test from "node:test";

test("Lab 5 C-02 intentionally fails to prove the required CI gate", () => {
  assert.fail("Intentional C-02 test failure. This evidence branch must never be merged.");
});

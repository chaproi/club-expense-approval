import { ExpenseCategory } from "@prisma/client";

// Unicode mode matches unpaired surrogates while allowing valid surrogate pairs.
const invalidText = /[\0\uD800-\uDFFF]/u;

const categoryCeilings = { ACTIVITY: 150_000, EQUIPMENT: 120_000, TRAVEL: 100_000 } as const;

function amountCeiling(category: unknown) {
  return typeof category === "string" && Object.hasOwn(categoryCeilings, category)
    ? categoryCeilings[category as keyof typeof categoryCeilings] : undefined;
}

export function expenseValidationMessage(body: unknown) {
  const category = body && typeof body === "object" ? (body as Record<string, unknown>).category : undefined;
  const ceiling = amountCeiling(category);
  return ceiling === undefined
    ? "Enter a title of 1–120 characters and select Activity, Equipment or Travel with a whole-baht amount."
    : `Enter a title of 1–120 characters and a whole amount of 1–${ceiling.toLocaleString("en-US")} baht for ${category}.`;
}

export function parseExpenseInput(body: unknown) {
  if (!body || typeof body !== "object" || Object.keys(body).length !== 3) return null;

  const { title, category, amountBaht } = body as Record<string, unknown>;
  const ceiling = amountCeiling(category);
  if (typeof title !== "string" || typeof amountBaht !== "number" ||
      ceiling === undefined || !Number.isInteger(amountBaht) || amountBaht < 1 || amountBaht > ceiling ||
      !Object.values(ExpenseCategory).includes(category as ExpenseCategory)) return null;

  const trimmedTitle = title.trim();
  if (trimmedTitle.length < 1 || trimmedTitle.length > 120 || invalidText.test(trimmedTitle)) return null;

  return { title: trimmedTitle, category: category as ExpenseCategory, amountBaht };
}

export function parseDecisionInput(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const { decision, reason, expectedRevision } = body as Record<string, unknown>;
  const versioned = Object.hasOwn(body, "expectedRevision");
  if (versioned && !validRevision(expectedRevision)) return null;
  const version = versioned ? { expectedRevision: expectedRevision as number } : {};
  const fieldCount = Object.keys(body).length;
  if (decision === "APPROVED" && fieldCount === 1 + Number(versioned)) {
    return { decision: "APPROVED" as const, reason: null, ...version };
  }
  if ((decision !== "REJECTED" && decision !== "RETURNED") ||
      (decision === "RETURNED" && !versioned) ||
      fieldCount !== 2 + Number(versioned) || typeof reason !== "string") return null;
  const trimmedReason = reason.trim();
  if (trimmedReason.length < 1 || trimmedReason.length > 300 || invalidText.test(trimmedReason)) return null;
  return { decision: decision as "REJECTED" | "RETURNED", reason: trimmedReason, ...version };
}

export function validRevision(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 2_147_483_647;
}

export function parseReturnedInput(body: unknown, edit: boolean) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const { expectedRevision, ...fields } = body as Record<string, unknown>;
  if (!validRevision(expectedRevision)) return null;
  if (!edit) return Object.keys(fields).length === 0 ? { expectedRevision, fields: {} } : null;
  const input = parseExpenseInput(fields);
  return input ? { expectedRevision, fields: input } : null;
}

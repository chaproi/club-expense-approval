import { ExpenseCategory } from "@prisma/client";

// Unicode mode matches unpaired surrogates while allowing valid surrogate pairs.
const invalidText = /[\0\uD800-\uDFFF]/u;

export function parseExpenseInput(body: unknown) {
  if (!body || typeof body !== "object" || Object.keys(body).length !== 3) return null;

  const { title, category, amountBaht } = body as Record<string, unknown>;
  if (typeof title !== "string" || typeof amountBaht !== "number" ||
      !Number.isInteger(amountBaht) || amountBaht < 1 || amountBaht > 100_000 ||
      !Object.values(ExpenseCategory).includes(category as ExpenseCategory)) return null;

  const trimmedTitle = title.trim();
  if (trimmedTitle.length < 1 || trimmedTitle.length > 120 || invalidText.test(trimmedTitle)) return null;

  return { title: trimmedTitle, category: category as ExpenseCategory, amountBaht };
}

export function parseDecisionInput(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const { decision, reason } = body as Record<string, unknown>;
  const fieldCount = Object.keys(body).length;
  if (decision === "APPROVED" && fieldCount === 1) {
    return { decision: "APPROVED" as const, reason: null };
  }
  if (decision !== "REJECTED" || fieldCount !== 2 || typeof reason !== "string") return null;
  const trimmedReason = reason.trim();
  if (trimmedReason.length < 1 || trimmedReason.length > 300 || invalidText.test(trimmedReason)) return null;
  return { decision: "REJECTED" as const, reason: trimmedReason };
}

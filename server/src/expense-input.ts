import { ExpenseCategory } from "@prisma/client";

export function parseExpenseInput(body: unknown) {
  if (!body || typeof body !== "object" || Object.keys(body).length !== 3) return null;

  const { title, category, amountBaht } = body as Record<string, unknown>;
  if (typeof title !== "string" || typeof amountBaht !== "number" ||
      !Number.isInteger(amountBaht) || amountBaht < 1 || amountBaht > 100_000 ||
      !Object.values(ExpenseCategory).includes(category as ExpenseCategory)) return null;

  const trimmedTitle = title.trim();
  // Unicode mode matches unpaired surrogates while allowing valid surrogate pairs.
  const invalidText = /[\0\uD800-\uDFFF]/u;
  if (trimmedTitle.length < 1 || trimmedTitle.length > 120 || invalidText.test(trimmedTitle)) return null;

  return { title: trimmedTitle, category: category as ExpenseCategory, amountBaht };
}

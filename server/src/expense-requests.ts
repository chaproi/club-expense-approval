import type { Prisma, PrismaClient } from "@prisma/client";
import { Router, type Response } from "express";
import { readSessionUser, requireSameOrigin } from "./auth.js";
import { parseExpenseInput } from "./expense-input.js";

const listFields = {
  id: true, title: true, category: true, amountBaht: true, status: true, createdAt: true,
} as const;

const detailFields = {
  ...listFields,
  updatedAt: true,
  events: {
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { type: true, createdAt: true, reason: true, actor: { select: { displayName: true } } },
  },
} satisfies Prisma.ExpenseRequestSelect;

type SessionUser = NonNullable<Awaited<ReturnType<typeof readSessionUser>>>;
type ExpenseResponse = Response<unknown, { user: SessionUser }>;

function visibleTo(user: SessionUser): Prisma.ExpenseRequestWhereInput {
  return user.role === "REQUESTER" ? { requesterId: user.id } : { assignedReviewerId: user.id };
}

function toDetail({ events, ...fields }: Prisma.ExpenseRequestGetPayload<{ select: typeof detailFields }>) {
  return {
    ...fields,
    history: events.map(({ actor, ...event }) => ({ ...event, actorDisplayName: actor.displayName })),
  };
}

export function createExpenseRouter(database: PrismaClient, appOrigin: string, defaultReviewerEmail?: string) {
  const expenses = Router();
  const reviewerEmail = defaultReviewerEmail?.trim().toLowerCase();

  expenses.use(async (request, response: ExpenseResponse, next) => {
    const user = await readSessionUser(database, request);
    if (!user) {
      response.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Log in to continue." } });
      return;
    }
    response.locals.user = user;
    next();
  });

  expenses.post("/", requireSameOrigin(appOrigin), async (request, response: ExpenseResponse) => {
    const user = response.locals.user;
    if (user.role !== "REQUESTER") {
      response.status(403).json({ error: { code: "FORBIDDEN", message: "Only requesters can submit expenses." } });
      return;
    }
    const input = parseExpenseInput(request.body);
    if (!input) {
      response.status(400).json({
        error: { code: "INVALID_INPUT", message: "Enter a title of 1–120 characters, a valid category, and a whole amount of 1–100,000 baht." },
      });
      return;
    }

    const expense = await database.$transaction(async (transaction) => {
      if (!reviewerEmail) return null;
      const reviewer = await transaction.user.findUnique({
        where: { email: reviewerEmail, role: "REVIEWER" },
        select: { id: true },
      });
      if (!reviewer || reviewer.id === user.id) return null;

      return transaction.expenseRequest.create({
        data: {
          ...input,
          requesterId: user.id,
          assignedReviewerId: reviewer.id,
          events: { create: { type: "SUBMITTED", actorId: user.id } },
        },
        select: detailFields,
      });
    });
    if (!expense) {
      response.status(503).json({ error: { code: "REVIEWER_UNAVAILABLE", message: "No reviewer is available for new requests." } });
      return;
    }
    response.status(201).json(toDetail(expense));
  });

  expenses.get("/", async (_request, response: ExpenseResponse) => {
    const items = await database.expenseRequest.findMany({
      where: visibleTo(response.locals.user),
      select: listFields,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    response.json({ items });
  });

  expenses.get("/:id", async (request, response: ExpenseResponse) => {
    const { id } = request.params;
    if (id.includes("\0")) {
      response.status(400).json({ error: { code: "INVALID_INPUT", message: "Invalid expense request ID." } });
      return;
    }
    const expense = await database.expenseRequest.findFirst({
      where: { id, ...visibleTo(response.locals.user) },
      select: detailFields,
    });
    if (!expense) {
      response.status(404).json({ error: { code: "NOT_FOUND", message: "Expense request not found." } });
      return;
    }
    response.json(toDetail(expense));
  });

  return expenses;
}

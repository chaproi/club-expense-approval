import type { ExpenseRequest, Prisma, PrismaClient, User } from "@prisma/client";
import { Router, type Response } from "express";
import { readSessionUser, requireSameOrigin } from "./auth.js";
import { parseDecisionInput, parseExpenseInput } from "./expense-input.js";

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

export function canDecideExpense(
  user: Pick<User, "id" | "role">,
  expense: Pick<ExpenseRequest, "requesterId" | "assignedReviewerId">,
) {
  return user.role === "REVIEWER" && expense.assignedReviewerId === user.id && expense.requesterId !== user.id;
}

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

  expenses.post("/:id/decision", requireSameOrigin(appOrigin), async (request, response: ExpenseResponse) => {
    const user = response.locals.user;
    if (user.role !== "REVIEWER") {
      response.status(403).json({ error: { code: "FORBIDDEN", message: "Only assigned reviewers can decide requests." } });
      return;
    }
    const { id } = request.params;
    const input = parseDecisionInput(request.body);
    if (typeof id !== "string" || id.includes("\0") || !input) {
      response.status(400).json({
        error: { code: "INVALID_INPUT", message: "Choose Approve or Reject. A rejection needs a reason of 1–300 characters." },
      });
      return;
    }
    const result = await database.$transaction(async (transaction) => {
      const expense = await transaction.expenseRequest.findFirst({
        where: { id, assignedReviewerId: user.id },
        select: { requesterId: true, assignedReviewerId: true },
      });
      if (!expense) {
        return { status: 404, error: { code: "NOT_FOUND", message: "Expense request not found." } };
      }
      if (!canDecideExpense(user, expense)) {
        return { status: 403, error: { code: "FORBIDDEN", message: "You cannot decide your own request." } };
      }
      const updated = await transaction.expenseRequest.updateMany({
        where: { id, assignedReviewerId: user.id, status: "SUBMITTED" },
        data: { status: input.decision },
      });
      if (updated.count === 0) {
        return { status: 409, error: { code: "INVALID_STATE", message: "This request has already been decided. Review its latest status." } };
      }
      await transaction.requestEvent.create({
        data: { requestId: id, actorId: user.id, type: input.decision, reason: input.reason },
      });
      const saved = await transaction.expenseRequest.findUniqueOrThrow({ where: { id }, select: detailFields });
      return { expense: saved };
    });
    if (result.error) {
      response.status(result.status).json({ error: result.error });
      return;
    }
    response.json(toDetail(result.expense));
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

import type { ExpenseRequest, Prisma, PrismaClient, User } from "@prisma/client";
import { Router, type Request, type Response } from "express";
import { readSessionUser, requireSameOrigin } from "./auth.js";
import { expenseValidationMessage, parseDecisionInput, parseExpenseInput, parseReturnedInput } from "./expense-input.js";

const listFields = {
  id: true, title: true, category: true, amountBaht: true, status: true, revision: true, createdAt: true,
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
        error: { code: "INVALID_INPUT", message: expenseValidationMessage(request.body) },
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

  expenses.get("/summary", async (request, response: ExpenseResponse) => {
    const user = response.locals.user;
    if (user.role !== "REVIEWER") {
      response.status(403).json({ error: { code: "FORBIDDEN", message: "Only reviewers can read summaries." } });
      return;
    }
    if (Object.keys(request.query).length) {
      response.status(400).json({ error: { code: "INVALID_INPUT", message: "Summary does not accept query parameters." } });
      return;
    }
    const counts = { SUBMITTED: 0, RETURNED: 0, APPROVED: 0, REJECTED: 0 };
    const groups = await database.expenseRequest.groupBy({
      by: ["status"], where: { assignedReviewerId: user.id }, _count: { _all: true },
    });
    for (const group of groups) counts[group.status] = group._count._all;
    response.setHeader("Cache-Control", "private, no-store");
    response.json({ counts, total: Object.values(counts).reduce((sum, count) => sum + count, 0) });
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
        error: { code: "INVALID_INPUT", message: "Choose Approve, Reject or Return. A rejection needs a reason of 1–300 characters; a return also needs a reason and current revision." },
      });
      return;
    }
    const result = await database.$transaction(async (transaction) => {
      const expense = await transaction.expenseRequest.findFirst({
        where: { id, assignedReviewerId: user.id },
        select: { requesterId: true, assignedReviewerId: true, revision: true },
      });
      if (!expense) {
        return { status: 404, error: { code: "NOT_FOUND", message: "Expense request not found." } };
      }
      if (!canDecideExpense(user, expense)) {
        return { status: 403, error: { code: "FORBIDDEN", message: "You cannot decide your own request." } };
      }
      if (expense.revision >= 2_147_483_647) {
        return { status: 409, error: { code: "INVALID_STATE", message: "This request cannot be changed further." } };
      }
      // Missing revision is compatible only with untouched Sprint 1 requests.
      // Once returned/resubmitted, an old tab must never decide a newer round.
      const updated = await transaction.expenseRequest.updateMany({
        where: { id, assignedReviewerId: user.id, status: "SUBMITTED", revision: input.expectedRevision ?? 0 },
        data: { status: input.decision, revision: { increment: 1 } },
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

  async function changeReturned(request: Request, response: ExpenseResponse, edit: boolean) {
    const user = response.locals.user;
    if (user.role !== "REQUESTER") {
      response.status(403).json({ error: { code: "FORBIDDEN", message: "Only request owners can edit or resubmit." } });
      return;
    }
    const id = request.params.id;
    const input = parseReturnedInput(request.body, edit);
    if (typeof id !== "string" || id.includes("\0") || !input) {
      response.status(400).json({ error: { code: "INVALID_INPUT", message: "Enter valid saved fields and the current request revision." + (edit ? " " + expenseValidationMessage(request.body) : "") } });
      return;
    }
    const result = await database.$transaction(async transaction => {
      const expense = await transaction.expenseRequest.findFirst({
        where: { id, requesterId: user.id }, select: { revision: true },
      });
      if (!expense) return { status: 404, error: { code: "NOT_FOUND", message: "Expense request not found." } };
      if (expense.revision >= 2_147_483_647) return { status: 409, error: { code: "INVALID_STATE", message: "This request cannot be changed further." } };
      const updated = await transaction.expenseRequest.updateMany({
        where: { id, requesterId: user.id, status: "RETURNED", revision: input.expectedRevision },
        data: { ...input.fields, ...(!edit ? { status: "SUBMITTED" as const } : {}), revision: { increment: 1 } },
      });
      if (!updated.count) return { status: 409, error: { code: "INVALID_STATE", message: "This request changed or is not returned. Reload its latest details." } };
      await transaction.requestEvent.create({ data: { requestId: id, actorId: user.id, type: edit ? "EDITED" : "RESUBMITTED" } });
      return { expense: await transaction.expenseRequest.findUniqueOrThrow({ where: { id }, select: detailFields }) };
    });
    if (result.error) response.status(result.status).json({ error: result.error });
    else response.json(toDetail(result.expense));
  }
  expenses.patch("/:id", requireSameOrigin(appOrigin), (request, response: ExpenseResponse) => changeReturned(request, response, true));
  expenses.post("/:id/resubmit", requireSameOrigin(appOrigin), (request, response: ExpenseResponse) => changeReturned(request, response, false));

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

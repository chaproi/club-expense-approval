import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";

const runId = process.env.E2E_RUN_ID;
if (!runId) throw new Error("Run this suite with the project Playwright configuration.");
const database = new PrismaClient({ datasourceUrl: process.env.TEST_DATABASE_URL });
const password = runId;
const requesterEmail = `requester-${runId}@example.test`;
const reviewerEmail = `reviewer-${runId}@example.test`;

test.beforeAll(async () => {
  const passwordHash = await hash(password);
  await database.user.createMany({ data: [
    { email: requesterEmail, displayName: "E2E Requester", role: "REQUESTER", passwordHash },
    { email: reviewerEmail, displayName: "E2E Reviewer", role: "REVIEWER", passwordHash },
  ] });
});

test.afterAll(async () => {
  try {
    await database.expenseRequest.deleteMany({ where: { requester: { email: requesterEmail } } });
    await database.user.deleteMany({ where: { email: { in: [requesterEmail, reviewerEmail] } } });
  } finally {
    await database.$disconnect();
  }
});

async function login(page: Page, email: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("button", { name: "Log out", exact: true })).toBeVisible();
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(page.getByRole("button", { name: "Log in", exact: true })).toBeVisible();
}

async function submit(page: Page, title: string) {
  await page.getByLabel("Title", { exact: true }).fill(title);
  await page.getByLabel("Category").selectOption("ACTIVITY");
  await page.getByLabel("Amount (baht)").fill("500");
  await page.getByRole("button", { name: "Submit request" }).click();
  await expect(page.getByText("Request submitted.")).toBeVisible();
  await expect(page.getByRole("button", { name: title, exact: true })).toBeVisible();
}

test("T-09: requester submits, reviewer approves or rejects, and requester reads both outcomes", async ({ page }) => {
  const approvalTitle = `Approve ${runId}`;
  const rejectionTitle = `Reject ${runId}`;
  await page.goto("/");
  await login(page, requesterEmail);
  await submit(page, approvalTitle);
  await submit(page, rejectionTitle);
  await logout(page);
  await login(page, reviewerEmail);
  await page.getByRole("button", { name: approvalTitle, exact: true }).click();
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(page.getByText("APPROVED by E2E Reviewer", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: rejectionTitle, exact: true }).click();
  await page.getByLabel("Rejection reason").fill("   ");
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("rejection needs a reason");
  await page.getByLabel("Rejection reason").fill("  Please provide the activity details  ");
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(page.getByText("REJECTED by E2E Reviewer", { exact: false })).toBeVisible();
  await logout(page);
  await login(page, requesterEmail);
  await page.reload();
  await page.getByRole("button", { name: approvalTitle, exact: true }).click();
  await expect(page.getByText("APPROVED by E2E Reviewer", { exact: false })).toBeVisible();
  await expect(page.getByRole("region", { name: "Request details" }).getByRole("button")).toHaveCount(0);
  await page.getByRole("button", { name: rejectionTitle, exact: true }).click();
  await expect(page.getByText("Please provide the activity details", { exact: true })).toBeVisible();
});

test("reviewer reloads the latest status after a stale decision returns 409", async ({ page }) => {
  const title = `Concurrent ${runId}`;
  await page.goto("/");
  await login(page, requesterEmail);
  await submit(page, title);
  await logout(page);
  await login(page, reviewerEmail);
  await page.getByRole("button", { name: title, exact: true }).click();
  await expect(page.getByRole("button", { name: "Approve", exact: true })).toBeVisible();
  const expense = await database.expenseRequest.findFirstOrThrow({ where: { title, requester: { email: requesterEmail } } });
  const externalDecision = await page.request.post(`/api/expense-requests/${expense.id}/decision`, {
    headers: { Origin: "http://127.0.0.1:4173" },
    data: { decision: "APPROVED" },
  });
  expect(externalDecision.status()).toBe(200);
  const conflict = page.waitForResponse((response) => response.url().endsWith("/decision") && response.status() === 409);
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await conflict;
  await expect(page.getByRole("alert")).toContainText("already been decided");
  await expect(page.getByText("APPROVED by E2E Reviewer", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve", exact: true })).toHaveCount(0);
});

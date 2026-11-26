import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
const require = createRequire(path.resolve("package.json"));
const { PrismaClient } = require("@prisma/client");
const { hash } = require("argon2");
const { chromium } = require("playwright");
const { expect } = require("@playwright/test");
const out = process.env.UI_OUT;
assert.ok(out, "UI_OUT must designate a separate evidence/runtime directory.");
const phase = process.argv[2];
assert.ok(["before", "after"].includes(phase));
const runtime = JSON.parse(fs.readFileSync(path.join(out, "runtime.private.json"), "utf8"));
assert.match(new URL(runtime.url).pathname, /^\/test_club_ui_/);
const database = new PrismaClient({ datasourceUrl: runtime.url });
const { createApp } = await import(pathToFileURL(path.resolve("dist/server/app.js")).href);
const evidence = {
  phase, source: execFileSync("git.exe", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  dirty: execFileSync("git.exe", ["status", "--porcelain"], { encoding: "utf8" }).trim(),
  startedAt: new Date().toISOString(), cases: [], pageErrors: [],
};
let server, browser, context;
const emails = ["ui-owner@example.test", "ui-reviewer@example.test"];
try {
  const [live] = await database.$queryRawUnsafe("select current_database() as db,current_user as owner,current_schema() as schema");
  assert.deepEqual(live, { db: runtime.db, owner: runtime.db, schema: "public" });
  evidence.liveTargetVerified = true;
  server = await new Promise((resolve, reject) => {
    const listener = createApp({ database, appOrigin: "http://127.0.0.1", defaultReviewerEmail: emails[1], webRoot: path.resolve("dist/client") }).listen(0, "127.0.0.1", () => resolve(listener));
    listener.once("error", reject);
  });
  // The same listener is rebound below with its actual exact browser origin.
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  const base = "http://127.0.0.1:" + port;
  server = await new Promise((resolve, reject) => {
    const listener = createApp({ database, appOrigin: base, defaultReviewerEmail: emails[1], webRoot: path.resolve("dist/client") }).listen(port, "127.0.0.1", () => resolve(listener));
    listener.once("error", reject);
  });
  const apiLogin = async email => {
    const response = await fetch(base + "/api/auth/login", { method: "POST", headers: { Origin: base, "Content-Type": "application/json" }, body: JSON.stringify({ email, password: runtime.password }) });
    assert.equal(response.status, 200);
    return response.headers.get("set-cookie").split(";")[0];
  };
  const api = async (cookie, suffix, method = "GET", body) => {
    const response = await fetch(base + "/api/expense-requests" + suffix, { method, headers: { Origin: base, Cookie: cookie, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    assert.equal(response.status, method === "POST" && suffix === "" ? 201 : 200, "fixture/read HTTP status");
    return response.json();
  };
  if (phase === "before") {
    assert.equal(await database.user.count(), 0, "new disposable fixture target");
    const passwordHash = await hash(runtime.password);
    await database.user.createMany({ data: [
      { email: emails[0], displayName: "Maya Chen", role: "REQUESTER", passwordHash },
      { email: emails[1], displayName: "Alexandra Rivera University Creative Activities Reviewer", role: "REVIEWER", passwordHash },
    ] });
    const owner = await apiLogin(emails[0]);
    runtime.items = [];
    for (const width of [761, 768, 800, 834]) {
      const title = ("Campus creative society " + width + " - shared equipment and materials for interdisciplinary student workshops and community activities").slice(0, 120);
      const row = await api(owner, "", "POST", { title, category: "EQUIPMENT", amountBaht: 2750 });
      runtime.items.push(row);
    }
    fs.writeFileSync(path.join(out, "runtime.private.json"), JSON.stringify(runtime));
  }
  const reviewer = await apiLogin(emails[1]);
  browser = await chromium.launch();
  evidence.chromium = browser.version();
  context = await browser.newContext({ viewport: { width: 761, height: 1000 } });
  const page = await context.newPage();
  page.on("pageerror", error => evidence.pageErrors.push(error.name + ": " + error.message));
  await page.goto(base);
  await page.getByLabel("Email", { exact: true }).fill(emails[1]);
  await page.getByLabel("Password", { exact: true }).fill(runtime.password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Assigned Requests", exact: true })).toBeVisible();
  for (const [index, width] of [761, 768, 800, 834].entries()) {
    const result = { width, height: 1000, passed: false };
    evidence.cases.push(result);
    try {
      await page.setViewportSize({ width, height: 1000 });
      const item = runtime.items[index];
      const card = page.getByRole("button", { name: item.title, exact: true });
      await card.focus();
      await page.keyboard.press("Enter");
      await expect(card).toHaveAttribute("aria-current", "true");
      const detail = page.getByRole("region", { name: "Request details", exact: true });
      await expect(detail.locator(".detail-title")).toHaveText(item.title);
      await page.getByLabel("Rejection reason", { exact: true }).fill("Please include the itemized supplier estimate for all shared workshop materials.");
      await page.getByLabel("Return reason", { exact: true }).fill("Please verify the final supplier quote and itemized materials breakdown for the student-led community workshops.");
      const controls = [
        page.getByRole("button", { name: "Approve", exact: true }),
        page.getByLabel("Rejection reason", { exact: true }),
        page.getByRole("button", { name: "Reject", exact: true }),
        page.getByLabel("Return reason", { exact: true }),
        page.getByRole("button", { name: "Return for correction", exact: true }),
      ];
      await controls[0].focus();
      for (let i = 0; i < controls.length; i++) {
        if (i) await page.keyboard.press("Tab");
        await expect(controls[i]).toBeFocused();
        await expect(controls[i]).toBeEnabled();
        await expect(controls[i]).toBeInViewport();
        const focus = await controls[i].evaluate(el => ({ outline: getComputedStyle(el).outlineStyle, width: parseFloat(getComputedStyle(el).outlineWidth) }));
        assert.ok(focus.outline !== "none" && focus.width >= 2, "visible keyboard focus");
      }
      await page.keyboard.press("Shift+Tab");
      await expect(controls[3]).toBeFocused();
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => {}))); });
      result.geometry = await page.evaluate(() => {
        const box = el => { const b = el.getBoundingClientRect(); return { x: b.x, right: b.right, width: b.width }; };
        const grid = document.querySelector(".reviewer-grid"), detail = document.querySelector(".detail-panel");
        const targets = [...document.querySelectorAll(".detail-panel button,.detail-panel textarea,.detail-title")];
        return { viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, columns: getComputedStyle(grid).gridTemplateColumns, grid: box(grid), detail: box(detail), controls: targets.map(el => ({ tag: el.tagName, ...box(el), fontSize: getComputedStyle(el).fontSize })) };
      });
      result.keyboard = "Enter selection, Tab/Shift+Tab across decision controls, visible focus";
      await page.screenshot({ path: path.join(out, phase + "-" + width + ".png"), fullPage: true });
      await page.emulateMedia({ reducedMotion: "reduce" });
      result.reducedMotion = await page.evaluate(() => [...document.querySelectorAll("*")].every(el => getComputedStyle(el).animationName === "none" && parseFloat(getComputedStyle(el).transitionDuration) === 0));
      assert.equal(result.reducedMotion, true);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      assert.ok(result.geometry.scrollWidth <= width && result.geometry.bodyWidth <= width, "No page-wide horizontal overflow");
      assert.ok(result.geometry.controls.every(c => c.x >= 0 && c.right <= width && c.width >= 44), "Essential content and controls fit the viewport");
      if (phase === "after") {
        const command = index === 1 ? "REJECTED" : index === 2 ? "RETURNED" : "APPROVED";
        const button = command === "APPROVED" ? "Approve" : command === "REJECTED" ? "Reject" : "Return for correction";
        const response = page.waitForResponse(r => new URL(r.url()).pathname === "/api/expense-requests/" + item.id + "/decision" && r.request().method() === "POST");
        await page.getByRole("button", { name: button, exact: true }).click();
        assert.equal((await response).status(), 200);
        await expect(detail.locator(".detail-metadata .status-tag")).toHaveText(command);
        const authoritative = await api(reviewer, "/" + item.id);
        assert.equal(authoritative.status, command);
        assert.equal(authoritative.revision, 1);
        assert.deepEqual(authoritative.history.map(event => event.type), ["SUBMITTED", command]);
        assert.equal(authoritative.title, item.title);
        assert.equal(authoritative.amountBaht, item.amountBaht);
        result.workflow = { command, http: 200, revision: 1, events: ["SUBMITTED", command], fieldsPreserved: true };
      }
      result.passed = true;
    } catch (error) {
      result.failure = { name: error.name, message: error.message };
    }
  }
  assert.deepEqual(evidence.pageErrors, []);
} catch (error) {
  evidence.infrastructureFailure = { name: error.name, message: error.message };
} finally {
  if (context) await context.close();
  if (browser) await browser.close();
  if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  const [activity] = await database.$queryRawUnsafe("select count(*)::int as count from pg_stat_activity where datname=current_database() and state='idle in transaction' and pid<>pg_backend_pid()");
  evidence.idleTransactionsAfterRun = activity.count;
  await database.$disconnect();
  evidence.finishedAt = new Date().toISOString();
  evidence.passed = evidence.cases.filter(c => c.passed).length;
  evidence.failed = evidence.cases.filter(c => !c.passed).length;
  fs.writeFileSync(path.join(out, phase + ".json"), JSON.stringify(evidence, null, 2) + "\n");
}
console.log(JSON.stringify(evidence));
if (evidence.infrastructureFailure || evidence.failed || evidence.cases.length !== 4) process.exitCode = 1;

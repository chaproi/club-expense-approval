import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { createApp } from "../src/app.js";

export type Category = "ACTIVITY" | "EQUIPMENT" | "TRAVEL";
export const oldFields = { title: "Lab7 synthetic expense", category: "ACTIVITY" as Category, amountBaht: 250 };

export async function verifyLab7Target(db: PrismaClient) {
  const raw = process.env.TEST_DATABASE_URL;
  const expected = process.env.LAB7_TEST_DATABASE_NAME;
  assert.ok(raw && expected && /^test_lab7_[a-f0-9]{16}$/.test(expected), "Explicit owned Lab7 database guard required");
  const url = new URL(raw);
  assert.ok(["127.0.0.1", "localhost"].includes(url.hostname), "Lab7 target must be loopback");
  assert.ok(url.pathname === "/" + expected && url.username === expected && url.searchParams.get("schema") === "public", "Owned database/role/schema must match guard");
  const [live] = await db.$queryRaw<{ db: string; role: string; schema: string }[]>`SELECT current_database() AS db, current_user AS role, current_schema() AS schema`;
  assert.ok(live.db === expected && live.role === expected && live.schema === "public", "Live database identity must match owned guard before writes");
}

export async function openLab7Harness(browser = false) {
  const db = new PrismaClient({ datasourceUrl: process.env.TEST_DATABASE_URL });
  let server: Server | undefined;
  const marker = randomUUID();
  const password = randomUUID();
  const origin = "http://localhost:5173";
  const actors = {
    owner: { email: `lab7-owner-${marker}@example.test`, displayName: "Lab7 Owner", role: "REQUESTER" },
    other: { email: `lab7-other-${marker}@example.test`, displayName: "Lab7 Other", role: "REQUESTER" },
    reviewer: { email: browser ? `reviewer-${process.env.E2E_RUN_ID}@example.test` : `lab7-reviewer-${marker}@example.test`, displayName: "Lab7 Reviewer", role: "REVIEWER" },
    outsider: { email: `lab7-outsider-${marker}@example.test`, displayName: "Lab7 Unassigned", role: "REVIEWER" },
  } as const;
  type Actor = keyof typeof actors;
  const emails = Object.values(actors).map(x => x.email); // Own before any insert; cleanup survives partial setup.
  const cookies = new Map<Actor, string>();
  const requestIds = new Set<string>();
  let api = "";

  async function close() {
    try {
      if (server) await new Promise<void>((resolve, reject) => server!.close(e => e ? reject(e) : resolve()));
      const owned = { email: { in: emails } };
      await db.expenseRequest.deleteMany({ where: { requester: owned } }); // Owned events cascade first.
      await db.session.deleteMany({ where: { user: owned } });
      await db.user.deleteMany({ where: owned });
      assert.equal(await db.expenseRequest.count({ where: { id: { in: [...requestIds] } } }), 0, "Owned requests removed");
      assert.equal(await db.user.count({ where: owned }), 0, "Owned users removed");
      console.log("LAB7_CLEANUP owned requests/events/sessions/users removed; listener closed");
    } finally { await db.$disconnect(); }
  }
  async function req(actor: Actor | undefined, suffix = "", method = "GET", body?: unknown, source = origin) {
    const response = await fetch(api + "/api/expense-requests" + suffix, {
      method, headers: { ...(actor ? { Cookie: cookies.get(actor)! } : {}), ...(method === "GET" ? {} : { Origin: source }), ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.status === 201) requestIds.add((await response.clone().json()).id);
    return response;
  }
  async function create(fields = oldFields) {
    const response = await req("owner", "", "POST", fields);
    assert.equal(response.status, 201, "Old-range fixture creation through real API");
    return response.json();
  }
  async function returned(fields = oldFields) {
    const item = await create(fields);
    const response = await req("reviewer", `/${item.id}/decision`, "POST", { decision: "RETURNED", reason: "Synthetic Lab7 correction", expectedRevision: item.revision });
    assert.equal(response.status, 200, "Real assigned Reviewer returns old-range fixture");
    return response.json();
  }
  const snapshot = (id: string) => db.expenseRequest.findUniqueOrThrow({ where: { id }, include: { events: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] } } });
  const domain = () => db.expenseRequest.findMany({ where: { requester: { email: { in: emails } } }, orderBy: { id: "asc" }, include: { events: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] } } });
  try {
    await verifyLab7Target(db);
    const passwordHash = await hash(password);
    await db.user.createMany({ data: Object.values(actors).map(a => ({ ...a, passwordHash })) });
    server = await new Promise<Server>((resolve, reject) => {
      const s = createApp({ database: db, appOrigin: origin, defaultReviewerEmail: actors.reviewer.email }).listen(0, "127.0.0.1", () => resolve(s));
      s.once("error", reject);
    });
    const address = server.address(); assert.ok(address && typeof address !== "string"); api = "http://127.0.0.1:" + address.port;
    for (const actor of Object.keys(actors) as Actor[]) {
      const response = await fetch(api + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify({ email: actors[actor].email, password }) });
      assert.equal(response.status, 200, "Real fixture authentication");
      const cookie = response.headers.get("set-cookie"); assert.ok(cookie); cookies.set(actor, cookie.split(";")[0]);
    }
    return { db, actors, password, req, create, returned, snapshot, domain, close };
  } catch (e) { await close(); throw e; }
}

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import { after, before, test } from "node:test";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { createApp } from "../src/app.js";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Set TEST_DATABASE_URL to a migrated PostgreSQL test database.");
}

const database = new PrismaClient({ datasourceUrl: databaseUrl });
const appOrigin = "http://localhost:5173";
const uniqueId = randomUUID();
const requesterEmail = `requester-${uniqueId}@example.test`;
const reviewerEmail = `reviewer-${uniqueId}@example.test`;
const password: string = randomUUID();
let server: Server | undefined;
let apiUrl: string;

before(async () => {
  const passwordHash = await hash(password);
  await database.user.createMany({
    data: [
      { email: requesterEmail, passwordHash, displayName: "Test Requester", role: "REQUESTER" },
      { email: reviewerEmail, passwordHash, displayName: "Test Reviewer", role: "REVIEWER" },
    ],
  });

  const app = createApp({ database, appOrigin });
  server = await new Promise<Server>((resolve, reject) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    listener.once("error", reject);
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  apiUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((error) => error ? reject(error) : resolve());
      });
    }
    await database.user.deleteMany({ where: { email: { in: [requesterEmail, reviewerEmail] } } });
  } finally {
    await database.$disconnect();
  }
});

function login(email = requesterEmail, submittedPassword = password, origin = appOrigin) {
  return fetch(`${apiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ email, password: submittedPassword }),
  });
}

function sessionCookie(response: Response) {
  const header = response.headers.get("set-cookie");
  assert.ok(header);
  return header.split(";")[0];
}

test("T-01: seeded roles log in and resolve their own identity from a session", async () => {
  for (const [email, role] of [[requesterEmail, "REQUESTER"], [reviewerEmail, "REVIEWER"]]) {
    const response = await login(email);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("set-cookie") ?? "", /HttpOnly/i);
    assert.match(response.headers.get("set-cookie") ?? "", /SameSite=Lax/i);
    const cookie = sessionCookie(response);
    const expected = await database.user.findUniqueOrThrow({
      where: { email },
      select: { id: true, displayName: true, role: true },
    });
    assert.equal(expected.role, role);
    assert.deepEqual(await response.json(), expected);

    const current = await fetch(`${apiUrl}/api/auth/me`, { headers: { Cookie: cookie } });
    assert.equal(current.status, 200);
    assert.deepEqual(await current.json(), expected);
  }
});

test("T-02: invalid credentials fail and logout revokes a previously issued cookie", async () => {
  const invalid = await login(requesterEmail, "wrong password");
  assert.equal(invalid.status, 401);
  assert.equal(invalid.headers.get("set-cookie"), null);

  const loggedIn = await login();
  assert.equal(loggedIn.status, 200);
  const cookie = sessionCookie(loggedIn);

  const loggedOut = await fetch(`${apiUrl}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookie, Origin: appOrigin },
  });
  assert.equal(loggedOut.status, 204);
  assert.match(loggedOut.headers.get("set-cookie") ?? "", /^club_session=;/);
  const replay = await fetch(`${apiUrl}/api/auth/me`, { headers: { Cookie: cookie } });
  assert.equal(replay.status, 401);
});

test("T-03: current user endpoint rejects a request without a session", async () => {
  const response = await fetch(`${apiUrl}/api/auth/me`);
  assert.equal(response.status, 401);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("a browser request from another origin cannot create a session", async () => {
  const response = await login(requesterEmail, password, "http://untrusted.example");
  assert.equal(response.status, 403);
  assert.equal(response.headers.get("set-cookie"), null);
});

test("an expired PostgreSQL session cannot identify a user", async () => {
  const response = await login();
  assert.equal(response.status, 200);
  const cookie = sessionCookie(response);
  const user = await database.user.findUniqueOrThrow({ where: { email: requesterEmail } });
  await database.session.updateMany({
    where: { userId: user.id },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });

  const current = await fetch(`${apiUrl}/api/auth/me`, { headers: { Cookie: cookie } });
  assert.equal(current.status, 401);
});

import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { request, type IncomingHttpHeaders, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import type { PrismaClient } from "@prisma/client";
import { createApp } from "../src/app.js";

const canonicalOrigin = "https://s981b09c9-4d7hbszvwq-as.a.run.app";
const canonicalHost = new URL(canonicalOrigin).host;
const aliasHost = "s981b09c9-670075229477.asia-southeast1.run.app";
let server: Server;
let port: number;
let webRoot: string;

before(async () => {
  webRoot = await mkdtemp(join(tmpdir(), "club-canonical-origin-"));
  await writeFile(join(webRoot, "index.html"), "<!doctype html><h1>Login fixture</h1>");
  // These static-page and rejected-origin requests must never access the database.
  const database = {} as PrismaClient;
  const app = createApp({ database, appOrigin: canonicalOrigin, webRoot });
  server = await new Promise<Server>((resolve, reject) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    listener.once("error", reject);
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  port = address.port;
});

after(async () => {
  if (server) await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
  if (webRoot) await rm(webRoot, { recursive: true, force: true });
});

function send(host: string, path = "/", method = "GET", origin?: string, extraHeaders: Record<string, string> = {}) {
  return new Promise<{ status: number; headers: IncomingHttpHeaders; body: string }>((resolve, reject) => {
    const req = request({
      hostname: "127.0.0.1", port, path, method,
      headers: { Host: host, ...extraHeaders, ...(origin ? { Origin: origin } : {}),
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}) },
    }, response => {
      const chunks: Buffer[] = [];
      response.on("data", chunk => chunks.push(Buffer.from(chunk)));
      response.once("error", reject);
      response.once("end", () => resolve({
        status: response.statusCode!, headers: response.headers,
        body: Buffer.concat(chunks).toString("utf8"),
      }));
    });
    req.once("error", reject);
    req.end(method === "POST" ? "{}" : undefined);
  });
}

test("DEF-TH038-02: the official Cloud Run alias redirects before serving the login form", async () => {
  const response = await send(aliasHost);
  assert.equal(response.status, 308);
  assert.equal(response.headers.location, canonicalOrigin + "/");
  assert.equal(response.headers["set-cookie"], undefined);
});

test("DEF-TH038-02: canonical host serves the page without a redirect loop", async () => {
  for (const host of [canonicalHost, canonicalHost.toUpperCase()]) {
    const response = await send(host);
    assert.equal(response.status, 200);
    assert.match(response.body, /Login fixture/);
    assert.equal(response.headers.location, undefined);
  }
});

test("DEF-TH038-02: alias HEAD navigation redirects to the same canonical URL", async () => {
  const response = await send(aliasHost, "/?from=cloud-run", "HEAD");
  assert.equal(response.status, 308);
  assert.equal(response.headers.location, canonicalOrigin + "/?from=cloud-run");
  assert.equal(response.body, "");
});

test("DEF-TH038-02: redirect destination cannot be supplied by Host, path or forwarded headers", async () => {
  for (const path of ["/?next=https://untrusted.example/", "//untrusted.example/path"]) {
    const response = await send("untrusted.example", path, "GET", undefined, {
      "X-Forwarded-Host": "untrusted-forwarded.example",
    });
    assert.equal(response.status, 308);
    assert.equal(response.headers.location, canonicalOrigin + path);
    assert.equal(new URL(response.headers.location!).origin, canonicalOrigin);
  }
});

test("DEF-TH038-02: alias and untrusted API writes stay blocked instead of redirecting", async () => {
  for (const origin of [`https://${aliasHost}`, "https://untrusted.example", undefined]) {
    const response = await send(aliasHost, "/api/auth/login", "POST", origin);
    assert.equal(response.status, 403);
    assert.deepEqual(JSON.parse(response.body), {
      error: { code: "FORBIDDEN_ORIGIN", message: "Request origin is not allowed." },
    });
    assert.equal(response.headers.location, undefined);
    assert.equal(response.headers["set-cookie"], undefined);
  }
});

test("DEF-TH038-02: anonymous API reads retain their JSON contract on the alias", async () => {
  const response = await send(aliasHost, "/api/auth/me");
  assert.equal(response.status, 401);
  assert.deepEqual(JSON.parse(response.body), {
    error: { code: "UNAUTHENTICATED", message: "Log in to continue." },
  });
  assert.equal(response.headers.location, undefined);
});

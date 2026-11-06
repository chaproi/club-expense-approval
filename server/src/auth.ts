import { createHash, randomBytes } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { argon2id, verify } from "argon2";
import { Router, type CookieOptions, type Request, type RequestHandler } from "express";

export const passwordHashOptions = { type: argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 };
const userIdentity = { id: true, displayName: true, role: true } as const;
const sessionCookie = "club_session";
const sessionLifetimeMs = 8 * 60 * 60 * 1000;

// Verify an equivalent hash when the email is unknown.
const unknownUserHash = "$argon2id$v=19$m=19456,t=2,p=1$rpTtKoC7qq9iAF2Yz2Okaw$1EtG4tG/dnT189W8qYK255JE/YfdbQ2ggUQlJSuVdvs";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionToken(request: Request): string | undefined {
  const token = request.cookies?.[sessionCookie];
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token) ? token : undefined;
}

export async function readSessionUser(database: PrismaClient, request: Request) {
  const token = sessionToken(request);
  if (!token) return null;

  const session = await database.session.findUnique({
    where: { tokenHash: hashToken(token), expiresAt: { gt: new Date() } },
    select: { user: { select: userIdentity } },
  });
  return session?.user ?? null;
}

export function createAuthRouter(database: PrismaClient, appOrigin: string) {
  const auth = Router();
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(appOrigin).protocol === "https:",
    path: "/",
  };
  const sameOrigin: RequestHandler = (request, response, next) => {
    if (request.get("Origin") !== appOrigin) {
      response.status(403).json({ error: { code: "FORBIDDEN_ORIGIN", message: "Request origin is not allowed." } });
      return;
    }
    next();
  };

  auth.post("/login", sameOrigin, async (request, response) => {
    const body = request.body;
    if (!body || Object.keys(body).length !== 2 || typeof body.email !== "string" ||
        typeof body.password !== "string" || body.password.length === 0 || body.password.length > 1024 ||
        body.email.trim().length === 0 || body.email.length > 254) {
      response.status(400).json({ error: { code: "INVALID_INPUT", message: "Enter an email and password." } });
      return;
    }

    const user = await database.user.findUnique({
      where: { email: body.email.trim().toLowerCase() },
      select: { ...userIdentity, passwordHash: true },
    });
    const passwordMatches = await verify(user?.passwordHash ?? unknownUserHash, body.password);
    if (!user || !passwordMatches) {
      response.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } });
      return;
    }

    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + sessionLifetimeMs);
    const previousToken = sessionToken(request);

    await database.$transaction(async (transaction) => {
      if (previousToken) {
        await transaction.session.deleteMany({ where: { tokenHash: hashToken(previousToken) } });
      }
      await transaction.session.create({ data: { tokenHash: hashToken(token), userId: user.id, expiresAt } });
    });

    response.cookie(sessionCookie, token, { ...cookieOptions, maxAge: sessionLifetimeMs });
    response.json({ id: user.id, displayName: user.displayName, role: user.role });
  });

  auth.get("/me", async (request, response) => {
    const user = await readSessionUser(database, request);
    if (!user) {
      response.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Log in to continue." } });
      return;
    }
    response.json(user);
  });

  auth.post("/logout", sameOrigin, async (request, response) => {
    const token = sessionToken(request);
    if (token) {
      await database.session.deleteMany({ where: { tokenHash: hashToken(token) } });
    }
    response.clearCookie(sessionCookie, cookieOptions).sendStatus(204);
  });

  return auth;
}

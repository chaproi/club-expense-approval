import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { createApp } from "./app.js";

const origin = process.env.APP_ORIGIN;
if (!process.env.DATABASE_URL || !origin) {
  throw new Error("Set DATABASE_URL and APP_ORIGIN before starting the server.");
}

const appOrigin = new URL(origin).origin;
if (!/^https?:\/\//.test(appOrigin) || appOrigin !== origin) {
  throw new Error("APP_ORIGIN must be an HTTP(S) origin without a trailing slash.");
}

const database = new PrismaClient();
await database.$connect();

const port = Number(process.env.PORT ?? "3000");
const app = createApp({ database, appOrigin, webRoot: resolve("dist/client") });
const server = app.listen(port, () => console.log(`API listening on port ${port}`));

function shutdown() {
  server.close(() => {
    void database.$disconnect();
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

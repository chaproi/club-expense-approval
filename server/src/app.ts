import type { PrismaClient } from "@prisma/client";
import cookieParser from "cookie-parser";
import express, { type ErrorRequestHandler } from "express";
import { createAuthRouter } from "./auth.js";
import { createExpenseRouter } from "./expense-requests.js";

export type AppOptions = {
  database: PrismaClient;
  appOrigin: string;
  defaultReviewerEmail?: string;
  webRoot?: string;
};

export function createApp(options: AppOptions) {
  const app = express();
  app.disable("x-powered-by");
  app.use("/api", (_request, response, next) => {
    response.set("Cache-Control", "no-store");
    next();
  });
  app.use("/api", express.json({ limit: "16kb" }), cookieParser());
  app.use("/api/auth", createAuthRouter(options.database, options.appOrigin));
  app.use("/api/expense-requests", createExpenseRouter(options.database, options.appOrigin, options.defaultReviewerEmail));
  app.use("/api", (_request, response) => {
    response.status(404).json({ error: { code: "NOT_FOUND", message: "Endpoint not found." } });
  });

  if (options.webRoot) {
    app.use(express.static(options.webRoot));
  }

  const handleError: ErrorRequestHandler = (error, _request, response, next) => {
    if (response.headersSent) {
      next(error);
      return;
    }
    if (error.type === "entity.parse.failed" || error.type === "entity.too.large") {
      response.status(error.status).json({ error: { code: "INVALID_INPUT", message: "Invalid request body." } });
      return;
    }
    if (error.status === 400 && error instanceof URIError) {
      response.status(400).json({ error: { code: "INVALID_INPUT", message: "Invalid request URL." } });
      return;
    }
    console.error("Unhandled API error:", error.name ?? "Error");
    response.status(500).json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." } });
  };

  app.use(handleError);
  return app;
}

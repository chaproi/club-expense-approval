import type { PrismaClient } from "@prisma/client";
import express from "express";

export type AppOptions = {
  database: PrismaClient;
  appOrigin: string;
  webRoot?: string;
};

export function createApp(options: AppOptions) {
  const app = express();
  app.disable("x-powered-by");

  if (options.webRoot) {
    app.use(express.static(options.webRoot));
  }

  return app;
}

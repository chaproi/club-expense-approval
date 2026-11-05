import { PrismaClient, type Role } from "@prisma/client";
import { hash } from "argon2";
import { passwordHashOptions } from "./auth.js";

const password = process.env.SEED_DEMO_PASSWORD;
if (!password || password.length < 12 || password.length > 1024) {
  throw new Error("Set SEED_DEMO_PASSWORD to a local demo password of 12–1024 characters.");
}

const accounts: { email: string; displayName: string; role: Role }[] = [
  { email: "requester1@example.test", displayName: "Requester One", role: "REQUESTER" },
  { email: "requester2@example.test", displayName: "Requester Two", role: "REQUESTER" },
  { email: "reviewer1@example.test", displayName: "Reviewer One", role: "REVIEWER" },
  { email: "reviewer2@example.test", displayName: "Reviewer Two", role: "REVIEWER" },
];
const database = new PrismaClient();
try {
  const passwordHash = await hash(password, passwordHashOptions);
  const result = await database.user.createMany({
    data: accounts.map((account) => ({ ...account, passwordHash })),
    skipDuplicates: true,
  });
  console.log(`Created ${result.count} local demo accounts.`);
} finally {
  await database.$disconnect();
}

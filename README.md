# Club Expense Approval

CPE 334 project TH-038. The [Sprint 1 baseline](docs/sprint-1-baseline.md) describes the feature contracts and acceptance tests.

## Run locally

Install Node.js 24, npm and PostgreSQL. Create a local development database and a separate test database. From the repository root, copy `.env.example` to `.env` and set both connection URLs. Set `SEED_DEMO_PASSWORD` to a local demo password of at least 12 characters. The seed creates two Requesters and two Reviewers with the email addresses in `server/src/seed.ts`. Rerunning it leaves existing demo accounts unchanged.

```powershell
Copy-Item .env.example .env
# Edit the connection URLs and demo password in .env.
npm.cmd ci
npm.cmd run db:migrate
npm.cmd run db:seed
```

For development, run `npm.cmd run dev:api` and `npm.cmd run dev:web` in two terminals, then open http://localhost:5173. Keep `APP_ORIGIN=http://localhost:5173` in `.env` for this setup. Log in with a seeded email such as `requester1@example.test` or `reviewer1@example.test` and the demo password you set.

To verify the bundled app, run `npm.cmd run build`, set `APP_ORIGIN=http://localhost:3000` in `.env`, then run `npm.cmd start` and open http://localhost:3000. If you change `PORT`, use the matching origin for the bundled app.

## Run the F-01 API tests

Migrate the separate test database using its connection URL, then run the suite with `TEST_DATABASE_URL` from `.env`. The suite creates and removes its own uniquely named test accounts.

```powershell
# In a fresh PowerShell terminal, use the same test URL as in .env.
$env:DATABASE_URL = '<your local test database URL>'
npm.cmd run db:migrate
Remove-Item Env:DATABASE_URL
npm.cmd test
```

In Bash, use `npm` in place of `npm.cmd`. To migrate the test database, run `DATABASE_URL='<your local test database URL>' npm run db:migrate` followed by `npm test`.

# Lab 5 deployment

## Stack

Club Expense Approval uses React and Vite for the UI, Express on Node.js 24 for the API,
and Prisma with PostgreSQL for users, sessions, expense requests, and decision history.
[The Dockerfile](../../../Dockerfile) builds the client and server and serves them from one
container. [Compose](../../../compose.yaml) runs a local PostgreSQL instance with a named
volume. The course Cloud Portal provisions the GCP resources, Cloud Run serves the app,
and Cloud SQL holds its durable data.

## Environment variables

Fill in private values outside the repository. The checked-in
[environment example](../../../.env.example) shows the local keys with sample values.

| Variable | Purpose | Secret | Source |
| --- | --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection for the app, migrations, and seed | Yes | Local Compose constructs it from `LAB5_DB_PASSWORD`. Cloud Run and the Cloud Run migration job use a Secret Manager reference provisioned for the service. |
| `APP_ORIGIN` | Exact HTTP(S) origin used for request-origin validation | No | Compose sets the local origin. The deploy workflow reads the existing Cloud Run service URL. Use an origin without a trailing slash. |
| `PORT` | HTTP port for the Node.js server | No | Defaults to `3000` locally. Cloud Run injects its configured container port. |
| `DEFAULT_REVIEWER_EMAIL` | Reviewer assigned to new expense requests when the account is eligible | No | Set by Compose and the deploy workflow to the demo Reviewer One email. |
| `SEED_DEMO_PASSWORD` | Password used when creating the demo accounts | Yes | Set privately when running the local seed. The Compose seed service reads it from `LAB5_DEMO_PASSWORD`. |
| `LAB5_DB_PASSWORD` | Password for the local Compose PostgreSQL user | Yes | Generate a local value in the ignored `.env.compose` file. |
| `LAB5_DEMO_PASSWORD` | Password supplied to the local Compose seed service | Yes | Generate a separate local value in the ignored `.env.compose` file. |
| `TEST_DATABASE_URL` | Connection for the isolated PostgreSQL test database | Yes | Set privately for local tests. CI uses a disposable PostgreSQL service. |
| `E2E_RUN_ID` | Identifies the data created by a Playwright run | No | Optional. The Playwright configuration generates a UUID by default. |

### GitHub Actions environment

Configure these variables in the repository's `demo` environment. They identify resources
and commands. Google Cloud authentication uses Workload Identity Federation.

| Variable | Purpose and source |
| --- | --- |
| `GCP_PROJECT_ID` | Project ID assigned by the course portal, `cpe-se-course-2026`. |
| `GCP_REGION` | Assigned region, `asia-southeast1`. |
| `WIF_PROVIDER` | Workload Identity Federation provider identifier from the course portal. |
| `WIF_SERVICE_ACCOUNT` | Deployer service account identity from the course portal. |
| `MIGRATE_COMMAND` | Required command for the Cloud Run migration job, `npm run db:migrate`. |
| `APP_PORT` | Optional Cloud Run container port override. Leave unset to retain the service's configured port. |

## C-03: Run the app from a clean clone

Use Git and Docker with the Compose plugin. Run the PowerShell commands from a new checkout. The standard setup uses port 3000. Use the parallel setup below if an existing stack already uses that port.

```powershell
git clone --branch main https://github.com/chaproi/club-expense-approval.git
Set-Location club-expense-approval
docker compose version
```

The Compose variables are listed in [`.env.example`](../../../.env.example). Create `.env.compose` in the repository root with only those two keys. This command generates separate URL-safe values and writes them directly to the file.

```powershell
if (Test-Path -LiteralPath .env.compose) { throw '.env.compose already exists' }
$credentials = foreach ($key in 'LAB5_DB_PASSWORD', 'LAB5_DEMO_PASSWORD') {
    $bytes = New-Object byte[] 24
    $random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $random.GetBytes($bytes) } finally { $random.Dispose() }
    "$key=$([System.BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant())"
}
[System.IO.File]::WriteAllLines((Join-Path (Get-Location).Path '.env.compose'), $credentials)
Remove-Variable credentials
git check-ignore -- .env.compose
git ls-files -- .env.compose
```

The first Git check should report `.env.compose` and the second should produce no output. Keep the file private. PostgreSQL uses the database password when it initializes the volume. Keep that value for subsequent starts with the same volume.

Set the default values for the commands below.

```powershell
$composeArgs = @('--env-file', '.env.compose')
$appUrl = 'http://localhost:3000'
```

### Run beside an existing stack

With [Docker Compose 2.24.4 or later](https://docs.docker.com/reference/compose-file/merge/#replace-value), use a temporary override to replace the published port and give the verification image a separate tag. Check that localhost port 3015 and the project name `club-expense-c03` are free first. The project name gives this run a separate network and database volume.

```powershell
$overridePath = Join-Path ([System.IO.Path]::GetTempPath()) "club-expense-c03-$([Guid]::NewGuid().ToString('N')).yaml"
$override = @'
services:
  app:
    image: club-expense-approval:c03
    environment:
      APP_ORIGIN: http://localhost:3015
    ports: !override
      - "127.0.0.1:3015:3000"
  migrate:
    image: club-expense-approval:c03
  seed:
    image: club-expense-approval:c03
'@
[System.IO.File]::WriteAllText($overridePath, $override)
$composeArgs = @('--project-name', 'club-expense-c03', '--env-file', '.env.compose', '-f', 'compose.yaml', '-f', $overridePath)
$appUrl = 'http://localhost:3015'
```

### Build, migrate, seed, and verify

```powershell
docker compose @composeArgs config --quiet
docker compose @composeArgs build --no-cache app
docker compose @composeArgs up -d --no-build
docker compose @composeArgs ps -a
docker compose @composeArgs logs migrate
docker compose @composeArgs run --rm --no-deps seed
(Invoke-WebRequest -Uri $appUrl -UseBasicParsing).StatusCode
```

The build installs from the npm lockfile and generates Prisma Client. Compose waits for the database health check, runs `npm run db:migrate` in the one-shot migration service, and starts the app after migration succeeds. Check for a healthy database, migration exit code `0`, a running app, and HTTP status `200`. The seed service runs `npm run db:seed` against the Compose database. On a fresh volume it creates four demo accounts.

Open the exact URL in `$appUrl` and sign in as `requester1@example.test` using the private `LAB5_DEMO_PASSWORD` from `.env.compose`. Confirm that **My Requests** and **Log out** appear.

To stop the project and keep its data, run `docker compose @composeArgs down`. For the disposable parallel verification project only, use `docker compose @composeArgs down --volumes` to remove its database volume, then remove the temporary override with `Remove-Item -LiteralPath $overridePath`.


## Run the automated tests

Use Node.js 24 and an isolated PostgreSQL test database. Set `DATABASE_URL` and
`TEST_DATABASE_URL` to that same disposable database for the commands below. The first
variable is used by the migration command, and the second is used by the automated tests.

```powershell
npm ci
npm run db:migrate
npm test
npm run build
npx playwright install chromium
npm run test:e2e
docker build -t club-expense-approval:lab5 .
```

[CI](../../../.github/workflows/ci-docker.yml) runs on pull requests targeting
`staging/sprint-1` and `main`. It provisions a PostgreSQL test service and runs database
migrations, unit and API tests, the application build, Playwright tests, and the Docker build.

## GCP resources

| Resource | Name |
| --- | --- |
| Project | `cpe-se-course-2026` |
| Region | `asia-southeast1` |
| Cloud Run service | `s981b09c9` |
| Cloud Run migration job | `s981b09c9-migrate` |
| Cloud SQL for PostgreSQL | `s981b09c9-pg` |
| Artifact Registry repository and image | Repository `s981b09c9`, image `s981b09c9` |
| Deployment identity | Course portal's `s981b09c9-deployer` service account |

[Public app](https://s981b09c9-4d7hbszvwq-as.a.run.app) ·
[Cloud Run revision history](https://console.cloud.google.com/run/detail/asia-southeast1/s981b09c9/revisions?project=cpe-se-course-2026)

## Release from staging to main

1. Start from `staging/sprint-1` on a feature or fix branch. Link the work to its GitHub Issue
   and open a pull request into `staging/sprint-1`. Merge after peer review and green CI.
2. Open a release pull request from `staging/sprint-1` into `main`. Confirm that the review
   and required `verify` check pass before merging. The
   [Main CI gate](https://github.com/chaproi/club-expense-approval/rules/27762118)
   requires both.
3. The merge starts [Deploy to Google Cloud](../../../.github/workflows/deploy.yml).
   The workflow runs CI, authenticates to Google Cloud via federation, and builds and pushes
   an image tagged with the full commit SHA. It waits for the Cloud Run migration job to succeed
   before deploying the image to the service.
4. In [GitHub Actions](https://github.com/chaproi/club-expense-approval/actions/workflows/deploy.yml),
   open the run and confirm `ci / verify` and `deploy` succeeded. The Summary records the
   image tag and public URL. The deploy log identifies the Cloud Run revision. In **Revision History**,
   verify that this revision is serving traffic. Use the image tag to match the running revision
   to the commit, then open the public URL to verify the app.
5. To redeploy the current accepted `main`, use **Run workflow** on the deployment workflow
   and select `main`. Repeat the same checks after the run finishes.

### Lab 5 release evidence

[PR #15](https://github.com/chaproi/club-expense-approval/pull/15) was reviewed and merged into
staging. [PR #16](https://github.com/chaproi/club-expense-approval/pull/16) released commit
`b5a5a4f22ed64a65e6f75ad0929679def6c6c625` to `main`.
[Deployment run #2](https://github.com/chaproi/club-expense-approval/actions/runs/44827499077)
released that commit as revision `s981b09c9-00003-98r`.
[Manual redeploy run #3](https://github.com/chaproi/club-expense-approval/actions/runs/44833935127)
deployed the same commit as revision `s981b09c9-00004-cvz`, which was serving 100% of traffic
at the time of verification. The Lab 5 test expense remained readable after a Cloud Run
instance restart and after run #3.

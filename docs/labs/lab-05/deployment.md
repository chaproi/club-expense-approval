# Lab 5 deployment

## C-03: Run the app from a clean clone

Use Git and Docker with the Compose plugin. Run the PowerShell commands from a new checkout. The standard setup uses port 3000. Use the parallel setup below if an existing stack already uses that port.

```powershell
git clone --branch lab5/shared-cloud https://github.com/chaproi/club-expense-approval.git
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

This procedure covers the local Compose deployment. Cloud deployment has its own verification.

# Dependency remediation plan

25 November 2026. [Issue #44](https://github.com/chaproi/club-expense-approval/issues/44) tracks this work independently from draft recovery #42. Base staging is 7ab41689df7961ec8bab279cdd98d1afddf7a912. This plan precedes the package change.

## Findings and chosen scope

- [GHSA-ggr8-5vv4-36mx / CVE-2026-40345](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) affects deepmerge-ts below 8.0.0. The locked 7.1.5 is under prisma 6.19.3 ? @prisma/config 6.19.3.
- [GHSA-7589-6fvf-x4pw / CVE-2026-121707](https://github.com/advisories/GHSA-7589-6fvf-x4pw) affects effect through 3.22.0. The locked 3.21.0 follows the same dependency path.
- The earlier isolated assessment observed four High audit entries from these two advisories and their ancestors. Registry queries found no later stable Prisma 6 release. Prisma 7.10.1 failed this application's unchanged schema generation with P1012 and retained vulnerable Effect 3.20.0. Its audit still had three High entries.

Keep Prisma and Client 6.19.3. Scope the overrides to @prisma/config@6.19.3, setting deepmerge-ts 8.0.0 and effect 3.22.1. Generate the lockfile with npm and inspect every resolved change. No business, schema or API changes are planned.

## Compatibility and runtime impact

deepmerge-ts 8 is outside Prisma's exact dependency pin. Its [release notes](https://github.com/RebeccaStevens/deepmerge-ts/releases/tag/v8.0.0) change default deep Map merging, deepmergeInto mutation behavior and type names. Installed config code dynamically imports deepmerge-ts as c12's merger and imports Effect. CLI resolution observation established both imports during generate. This project has no direct application imports or custom Prisma config file, but that does not establish complete exploitability or compatibility.

The previous override experiment passed install/generate/TypeScript/build and had zero audit findings. Its Docker image included the corrected packages and started the migration CLI. Those observations precede this candidate and do not substitute for its verification.

Docker retains all node_modules, including CLI and tsx, for actual migration/seed commands. Dependency declaration changes alone would not remove them from the image. The current deployment waits for its migration job before service update. This batch will exercise real migration and HTTP reads using the new image with isolated PostgreSQL.

## Prospective verification

1. Record before audits, full and omit=dev, on the original lockfile. Apply only the version-scoped override and inspect package/lockfile diffs.
2. Run fresh npm ci, explain/ls, explicit validate/generate, both audits. Keep all command exits and audit JSON without calling audit failures browser RED.
3. Commit the dependency candidate. On that clean SHA run the complete unit/API suite (previously 47), the complete browser suite (previously 19), TypeScript, production build and Docker build. Report actual totals.
4. Verify resolved package versions inside the image. Execute its actual db:migrate against a new owned PostgreSQL target, seed disposable accounts and check authenticated HTTP smoke from the image. Retain only redacted results.
5. Rerun populated upgrade from corrected Sprint 1 baseline 43aa8d7472aa8852654d0d634d7239c3765c5869 to the NEW committed candidate SHA. Verify immediate snapshots/revision backfill before intentional workflow writes, guards and app/client restart. Parameterize and verify the candidate SHA in the harness.
6. Independently verify cleanup and original environment preservation. Commit evidence separately, publish the feature branch, then await review.

The [063d80d populated-upgrade result](https://github.com/chaproi/club-expense-approval/blob/063d80ddd0a73c62b5c0c600695af77f716da53d/docs/evidence/deliverable-2/populated-upgrade/evidence.md) remains historical evidence at its original dependency state.

## Limits and override removal

Overrides are an explicit compatibility choice pending independent review. A clean audit alone does not prove application safety, complete domain behavior or production readiness. No risk acceptance, release acceptance or deployment is recorded.

Remove the overrides when a reviewed upstream Prisma/config release incorporates patched dependency versions with compatible configuration behavior. Upgrade CLI/Client together if required, inspect the new dependency tree, repeat clean audits, domain/browser/Docker checks and populated upgrade, and prove that removing overrides does not reintroduce either advisory. Reassess on new advisories or changes to custom Prisma configuration.

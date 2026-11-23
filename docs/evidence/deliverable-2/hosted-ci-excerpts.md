# Hosted verification excerpts — 24 Nov 2026

Captured from actual job logs; timestamps are UTC. These are PR checks, not deployed acceptance.

## [PR40 API head feea765](https://github.com/chaproi/club-expense-approval/actions/runs/45236047280)

```text
2026-11-23T18:13:54.6383146Z ##[group]Run npm test
2026-11-23T18:13:57.9822847Z ℹ tests 47
2026-11-23T18:13:57.9823565Z ℹ pass 47
2026-11-23T18:13:57.9823772Z ℹ fail 0
2026-11-23T18:13:57.9824216Z ℹ skipped 0
2026-11-23T18:13:57.9968615Z ##[group]Run npm run build
2026-11-23T18:14:31.8823255Z   2 passed (10.0s)
2026-11-23T18:14:31.8999687Z ##[group]Run docker build -t club-expense-approval:ci .
2026-11-23T18:15:08.8763107Z #21 exporting to image
2026-11-23T18:15:09.0460898Z #21 naming to docker.io/library/club-expense-approval:ci done
```

## [PR41 UI head 830346b](https://github.com/chaproi/club-expense-approval/actions/runs/45237202381)

```text
2026-11-23T18:20:20.5331866Z ##[group]Run npm test
2026-11-23T18:20:24.3311426Z ℹ tests 47
2026-11-23T18:20:24.3312219Z ℹ pass 47
2026-11-23T18:20:24.3312558Z ℹ fail 0
2026-11-23T18:20:24.3313265Z ℹ skipped 0
2026-11-23T18:20:24.3485924Z ##[group]Run npm run build
2026-11-23T18:21:04.8056546Z   3 passed (12.1s)
2026-11-23T18:21:06.4823841Z ##[group]Run docker build -t club-expense-approval:ci .
2026-11-23T18:21:33.5767907Z #21 exporting to image
2026-11-23T18:21:45.9390069Z #21 naming to docker.io/library/club-expense-approval:ci done
```

Both completed SUCCESS, including production build and Docker image build. PR41 had 47 unit/API passes plus 3 browser passes. Its synthetic screenshots/browser output are retained in hosted-45237202381; the ZIP SHA256 was verified against artifact digest a9ca2a9ee332be7982c801805b7fa194450b7d4016981e7206dd30cc0215e786.

Earlier [UI run45236223085](https://github.com/chaproi/club-expense-approval/actions/runs/45236223085) at9a64fc5 failed one new browser case (2 passed, 1 failed): exact Corrected category label was not found because its accessible name included option text. Commit830346b corrected the explicit label relationship; the original selector/assertion was retained. This history is not replaced by the later green run.

A follow-up adds explicit self-return/int32-exhaustion assertions and current documentation; local47/47 PASS. Its exact-head hosted verification is to be linked from the reviewer handoff/PR after publication.


# Prepared UI pull request

Title: Redesign Club Expense Approval with a campus studio interface

Base: `staging/sprint-2`
Head: `feat/sprint2-campus-ui`

Publication prerequisite: PR #46 must merge and its latest staging documentation must be integrated first. This file is a prepared body, not evidence that a PR exists.

---

## What changes

Give the existing university club workflow an original pine, ivory and terracotta visual identity: local campus SVG artwork, an accessible login composition, an account header, responsive creation/list/detail panels, readable status and amount treatments, and a history timeline. Distinct saved/draft/conflict surfaces retain the existing Restore/Discard/retry behavior.

Add short entrances, hover/press feedback and subtle decorative movement, with reduced-motion suppression. Preserve existing control names, account-keyed state reset, authentication, authorization, revision handling, business mutations and API/data contracts. No new filtering, approval stages, metrics or dependencies.

## Verification

On clean source commit `465ebea693c5cebe6e6ebeb4460f8e2d79162d3b`:

- TypeScript and production build passed.
- 47/47 unit/API tests passed; zero failed or skipped.
- Complete unchanged browser suite: 19/19 passed, one Chromium worker.
- Actual desktop 1440×1000 and mobile 390×844 captures inspected; tablet 834×1112 overflow check passed.
- Keyboard traversal, visible focus, native request selection/skip link, reduced motion, real pending feedback and a 20-event history passed.
- Controlled one-shot transport abort recovered through real GET-only Retry. This is injected-failure evidence.
- Original artwork is local; no third-party asset download or new dependency.

See [verification](verification.md), [before/after screenshots](verification.md#beforeafter-screenshots) and [asset provenance](assets.md). Those relative links must be replaced with commit-pinned GitHub links when publishing the PR.

The evidence preserves the initial capture/recorder infrastructure failures and their narrow corrections. Application source passed; none of those attempts is claimed as tests-first RED. Local Chromium evidence is not cross-browser, screen-reader or certified WCAG coverage. No deployment or hosted CI is claimed by these local results.

## Review

Review the visual hierarchy, responsive scrolling, focus/motion behavior and latest-vs-draft clarity while retaining all current workflow contracts. Independent peer approval and any integration checks remain pending. No merge or deployment is authorized by this PR.

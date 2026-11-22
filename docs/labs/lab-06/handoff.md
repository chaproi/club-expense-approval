# Lab 6 Part A — Sprint 1 UAT handoff (TH-038 ↔ TH-033_P3)

**Document status: historical preparation handoff; current execution and acceptance are recorded separately.**

This handoff was first prepared on 21 November 2026. TH-033_P3 used documentation commit `402bf67ea94c840283241549b0284acc0248e858` for its initial UAT. The original document remains available at that immutable commit. The PENDING account/version/session entries below describe that preparation snapshot; they are not a claim that the completed handoff or subsequent execution never occurred.

Formal documentation review of PR #29 is being requested on 22 November, **after** independent execution. Do not backdate that review or describe it as pre-UAT approval. This revision corrects requirement references only; numbered actions, input boundaries and expected behavior are unchanged.

For current incoming results, defect disposition and correction evidence, see [the versioned correction record](https://github.com/chaproi/club-expense-approval/blob/43aa8d7472aa8852654d0d634d7239c3765c5869/docs/labs/lab-06/defect-correction.md), [reviewed source PR #32](https://github.com/chaproi/club-expense-approval/pull/32) and [deployed release PR #33](https://github.com/chaproi/club-expense-approval/pull/33). The initial partner report records 18 scripted sub-cases PASS and two exploratory Medium defects; corrected-release independent retest and final acceptance remain pending at this documentation update. These results do not turn the reusable blank templates into executed records.
Tracking: [Issue #28](https://github.com/chaproi/club-expense-approval/issues/28).
Course deadline: 22 November 2026, 23:59 Asia/Bangkok. Agree an initial session and a correction/retest session before the deadline.

## 1. Teams, scope and release gate

| Item | Recorded value |
| --- | --- |
| Product Team | TH-038, Club Expense Approval, author/operator `chaproi`; solo exception is recorded in the engineering baseline |
| Independent UAT Team for this product | TH-033_P3, partner repository https://github.com/cottonlnwza/TTworkshop |
| Reciprocal duty | TH-038 independently tests the partner's agreed Sprint 1 handoff; those results must be recorded separately |
| Participant identities | Actual tester names, student IDs and roles must be confirmed for the course PDF/private handoff; repository access or PR review alone is not UAT |
| Public URL | https://s981b09c9-4d7hbszvwq-as.a.run.app |
| Proposed application baseline | `main@1cc7df74c3f3240cff0c8a4d422f3f685a8acbce` |
| Recorded deployed revision | `s981b09c9-00005-9sk`, [deploy run 44907366428](https://github.com/chaproi/club-expense-approval/actions/runs/44907366428); recorded rollout on 21 November 2026 at 20:11:57 Asia/Bangkok |
| Contract | [Sprint 1 baseline at the application SHA](https://github.com/chaproi/club-expense-approval/blob/1cc7df74c3f3240cff0c8a4d422f3f685a8acbce/docs/sprint-1-baseline.md), §E, F-01–F-03 / AC-01–AC-10 |
| Serving-version confirmation | PENDING operator confirmation immediately before the UAT session. Record run/image/revision evidence and tester acknowledgement; do not infer the live SHA from repository HEAD alone |

Scope: login/session/logout; Requester creation and owner-scoped list/detail/history; assigned Reviewer approval/rejection; input, ownership and state rules. One reviewer per request belongs to this delivered Sprint 1 scope. Two-stage approval, status filters, payment, uploads, sign-up and request editing are outside this acceptance. A PATCH check below verifies that editing remains unavailable.

The documentation branch/PR SHA is not the deployed application SHA. If any release changes during UAT, the Product Team informs the UAT Team first, records the new revision/commit, and agrees which affected cases to rerun. Acceptance identifies one exact final release.

## 2. Private account handoff and safe data

The operator must confirm that these intended synthetic accounts actually exist in the live DB, have the stated roles, and can log in. Source seed declarations do not establish their live readiness.

| Label | Synthetic identity | Intended role/use | Live/private handoff status |
| --- | --- | --- | --- |
| R1 | requester1@example.test | Requester, owns case records | PENDING confirmation |
| R2 | requester2@example.test | Different Requester, ownership denial | PENDING confirmation |
| V1 | reviewer1@example.test | Default assigned Reviewer | PENDING confirmation |
| V2 | reviewer2@example.test | Unassigned Reviewer, ownership denial | PENDING confirmation |

Share passwords through the agreed private course handoff only. Never put passwords, cookie values, tokens or connection strings in GitHub, this document, a screenshot/PDF, or agent chat. The private handoff receipt records recipient, account labels, date/time and confirmation of access, without secret values.

Use separate browser profiles for R1, R2, V1 and V2, or explicitly log out before switching. Verify the displayed account and role at every switch. Do not reuse somebody else's session.

Choose one run marker `RUN=YYYYMMDD-HHMM-TH033P3` in Asia/Bangkok. Record the concrete value. Create only synthetic titles beginning `UAT6-TH038-<RUN>-<case/subcase>`. Category Activity corresponds to API `ACTIVITY`; valid categories are `EQUIPMENT`, `ACTIVITY`, `TRAVEL`. Amount is whole baht 1–100000 inclusive; title is trimmed and 1–120 characters.

**Do not modify the Lab 5 record `96da5843-9984-4a30-a6f2-883e19243420` or unrelated records.** Sprint 1 has no delete/reset endpoint. Cleanup means logging out, closing test profiles and listing created IDs/dispositions for the operator; retain UAT evidence. Do not run seed, truncate tables, change roles, delete rows or reset the cloud database to prepare/clean up UAT.

Each case creates its own records. UAT-01 needs no expense; UAT-02–UAT-09 use distinct case/subcase titles. Any helper creation is part of that case, not a dependency on a previous case's PASS. If an account or necessary setup is unavailable, record BLOCKED and notify the Product Team.

## 3. Manual execution and evidence rules

The primary journeys use the live browser UI. Safe same-origin manual API checks below supplement boundary/ownership rules that the UI hides. They are independent live UAT actions by the named tester, not a replacement developer unit-test run.

For each numbered step, record observed values, IDs, status/message, time, tester and application commit/revision. Do not copy the expected result into actual results. Use PASS only after the required observations; FAIL for observed wrong behavior; BLOCKED when a prerequisite prevents execution. The initial template has no outcomes.

Capture readable UI and selected Network response evidence with URL and context. Do not capture request Cookie/Authorization headers, login request bodies, browser storage, passwords or secret values. For denied actions, compare protected record state/history before and after from its authorized owner/assigned-reviewer session and verify the response discloses no protected detail.

### Manual API helper (optional browser-console aid)

Open DevTools on the public app origin while signed in to the account specified by the case. Never use a third-party origin. This helper uses the browser's current session and does not print cookies. It makes a single requested operation, not a test-suite run. Do not call login with a password in the console.

```javascript
async function uatRequest(path, method = "GET", body) {
  const response = await fetch(path, {
    method,
    credentials: "same-origin",
    ...(body === undefined ? {} : {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: response.status, data };
}
```

Use concrete case-created IDs where a path contains `<id>`. GET list returns `{items}`; detail returns the record and `history`. Success status codes: login 200, create 201, decision 200, logout 204. Contract errors: invalid input 400, anonymous 401, forbidden role 403, hidden/unowned record 404, already decided 409. On a brand-new record history contains one SUBMITTED event; after one decision it contains exactly SUBMITTED plus that decision, in chronological order.

### UAT-01 — Authentication and session revocation

**References:** F-01, FR-01, NFR-01, AC-01–AC-03. **Category:** authentication/access. **Roles:** R1 and anonymous. **Preconditions/input:** confirmed private R1 credentials; wrong password `wrong-UAT6-<RUN>`, not a real credential.

1. In a fresh profile, open the public URL; confirm the login form. Manually GET `/api/auth/me` and `/api/expense-requests` without signing in.
2. Enter R1 email with the deliberately wrong synthetic password and click Log in.
3. Log in using the privately supplied correct R1 password; GET `/api/auth/me`, reload, and inspect the displayed user/role and My Requests.
4. Click Log out. GET me/list again in the same profile, reload the page, and inspect the login form.

**Expected:** step 1 both 401 with no protected data; wrong login rejected with no signed-in UI; correct login/me 200 and correct R1/Requester identity; reload retains the session; logout 204 and subsequent me/list 401. No login/session secret is retained as evidence.
**Evidence:** login UI before/after, safe status/message observations and time/version.

### UAT-02 — Submit, approve, and Requester readback

**References:** F-02/F-03, FR-02/FR-03, BR-02/BR-06, AC-04, AC-07, AC-08/T-09. **Category:** normal domain journey. **Roles:** R1 and V1. **Input:** title `UAT6-TH038-<RUN>-U02`, Activity, 100 baht.

1. As R1, submit that form; record the created ID and returned detail.
2. Reload, select the same item, and verify detail/history. Confirm no request-edit control is shown. To verify the explicit no-edit contract, manually PATCH `/api/expense-requests/<id>` with `{title:"UAT6-no-edit"}`, then reread the detail as R1.
3. As V1, open Assigned Requests, find the exact created ID/title, and click Approve.
4. As R1, reload, select that record and inspect status and history.

**Expected:** create 201, original title/ACTIVITY/100, SUBMITTED and one submission event; still present after reload. PATCH returns 404 and changes no field/history. V1 can see the assigned record and approval returns 200. R1 sees APPROVED, original values, and exactly two chronological events (SUBMITTED, APPROVED) with the correct actor display names; no editing UI appears.
**Evidence:** successful submission, V1 decision and R1 final detail/history, safe API status for PATCH.

### UAT-03 — Rejection validation and recorded reason

**References:** F-03, BR-03/BR-04/BR-07, AC-07. **Category:** business-rule rejection/state. **Roles:** R1, V1. **Input:** fresh U03 title, ACTIVITY, 100; invalid reasons three spaces and 301 ASCII `x` characters; valid input `  UAT6 budget unavailable  `.

1. R1 creates a fresh U03 expense; record ID, SUBMITTED and initial one-event history.
2. V1 opens it. Try Reject with an empty reason in the UI. The browser may block the empty required field; record what actually happens. Use the helper to POST `/api/expense-requests/<id>/decision` with `{decision:"REJECTED",reason:"   "}`, then repeat with `reason:"x".repeat(301)`.
3. Reread the authorized detail after each invalid attempt.
4. In the UI submit the valid reason with leading/trailing spaces; as R1 reload and open the result.

**Expected:** whitespace-only and 301-character API reasons return 400; both leave SUBMITTED and the original one-event history unchanged. Valid rejection returns 200, state REJECTED and one rejection event; R1 sees stored trimmed reason `UAT6 budget unavailable`, exactly two total events, and no extra event from either rejected attempt.
**Evidence:** rejection feedback/status, unchanged protected detail after invalid input, final reason/history.

### UAT-04 — Input boundary matrix without unintended inserts

**References:** F-02, BR-01, AC-05. **Category:** boundary/business rules. **Role:** R1.
Use a unique subcase title for every attempt. Before each attempt record the owner's list IDs/count; afterwards compare newly created IDs for that subcase. UI validation is recorded separately from a manual API response.

| Subcase | Manual API create body variation | Expected |
| --- | --- | --- |
| A | normal unique title, ACTIVITY, amountBaht 0 | 400, no new expense/event |
| B | same valid shape, amountBaht 1 | 201, stored 1 |
| C | same valid shape, amountBaht 100000 | 201, stored 100000 |
| D | same valid shape, amountBaht 100001 | 400, no new expense/event |
| E | same valid shape, amountBaht 1.5 | 400, no new expense/event |
| F | title three spaces, ACTIVITY, 100 | 400, no new expense/event |
| G | title exactly 120 ASCII characters including the run prefix, ACTIVITY, 100 | 201, exact stored title |
| H | title exactly 121 ASCII characters including the run prefix, ACTIVITY, 100 | 400, no new expense/event |
| I | normal unique title, category `INVALID_UAT6`, amountBaht 100 | 400, no new expense/event |

1. As R1, try the normal form with amount 0 and 1.5 and record native/UI rejection if present; it does not establish backend validation by itself.
2. POST each matrix body to `/api/expense-requests` with the helper, one at a time.
3. For G/H calculate and record the actual title string and `.length` before sending; use prefix plus ASCII padding to exactly 120/121. Do not substitute a vague “long title”.
4. Compare list IDs and read every accepted record's saved detail.

**Expected:** every matrix row matches its specified outcome; rejected attempts create no record, accepted records retain exact normalized fields. Record row-level PASS/FAIL/BLOCKED, not only one overall icon.
**Evidence:** exact synthetic inputs, response status/message, ID/count comparison and accepted details.

### UAT-05 — Ownership and unassigned-reviewer denial

**References:** F-02/F-03, BR-03, NFR-01, AC-06. **Category:** forbidden ownership. **Roles:** R1, R2, V1, V2. **Input:** independent fresh U05 expense created by R1; ID known only from this authorized setup.

1. R1 creates U05 and records its fields/status/one-event history; V1 verifies it is assigned.
2. As R2, load My Requests and GET the protected detail by its exact ID.
3. As V2, load Assigned Requests, GET the same detail, and POST decision `{decision:"APPROVED"}` for it.
4. R1 or V1 rereads the protected record after each unauthorized operation.

**Expected:** lists for R2/V2 omit that record; R2/V2 detail 404 and V2 decision 404, without protected expense fields/history in the error response. The authorized record remains SUBMITTED with its original fields and exactly one event. V2's role is confirmed Reviewer, so this exercises assignment rather than merely wrong-role rejection.
**Evidence:** attacker-account identity, denied response without sensitive fields, authorized before/after snapshots.

### UAT-06 — Forbidden role and no Requester self-decision

**References:** F-02/F-03, AC-06, AC-09. **Category:** forbidden role. **Roles:** R1, V1. **Input:** fresh R1-owned U06 expense.

1. As R1, open its detail; confirm no Approve/Reject controls. POST decision `{decision:"APPROVED"}` for its own expense using the helper.
2. Reread the record as R1.
3. As V1, confirm Assigned Requests has no New expense request form; manually POST a valid fresh U06-reviewer-create body to `/api/expense-requests`.
4. R1 and V1 verify no reviewer-created expense was inserted.

**Expected:** R1 decision 403 and original record remains SUBMITTED with one event. Reviewer creation 403 with no inserted record. UI hides the inappropriate controls. This checks Requester self-decision denial; do not alter DB roles/assignments to invent a self-review fixture.
**Evidence:** correct roles, missing controls, safe response statuses and unchanged records.

### UAT-07 — Sequential duplicate decision from stale UI

**References:** F-03, AC-10 (sequential branch). **Category:** state/history. **Roles:** R1, V1. **Input:** fresh U07 expense, valid rejection reason `UAT6 duplicate attempt`.

1. R1 creates the fresh expense. In two tabs under V1, select it while it is SUBMITTED.
2. In tab A click Approve and wait for success.
3. Without reloading tab B, attempt Reject with the valid reason.
4. R1 reloads and reads the final detail/history; record decision request statuses in Network without cookies.

**Expected:** first decision 200, second 409 (stale UI handles the conflict and refreshes). Final state APPROVED, exactly one APPROVED decision event plus the submission; no REJECTED event and no duplicate decision. A case where no second request was sent does not by itself establish the 409 contract.
**Evidence:** original stale UI state, first success, second conflict, final owner history.

### UAT-08 — Readback and coordinated application restart

**References:** F-03/NFR-02, AC-08/T-08. **Category:** history/persistence. **Roles:** R1, V1, Product operator.
**Precondition:** agree the operator's authorized restart/redeploy action and testing window before starting. The UAT tester does not change GCP resources or run migrations/seed.

1. Within this case R1 creates a fresh U08 expense and V1 rejects it with `UAT6 persistence reason`. Save ID, fields, timestamps, actor names and two-event history.
2. Log out and back in as R1, reload, and compare the complete saved detail.
3. The Product operator performs the separately reviewed/authorized application restart or same-commit redeploy while preserving the database. Record the actual action/run, before/after commit and revision, timestamp and evidence establishing the new application process. Browser reload alone is not a restart.
4. TH-033_P3 independently signs in as R1 after the action and compares the exact expense ID, values, decision reason, timestamps and history.

**Expected:** unchanged saved record/history after readback and after the confirmed new application process. Sessions need not be claimed to persist unless explicitly tested. If step 3 cannot be performed/verified, record the restart subcase BLOCKED; do not turn a reload-only check into a persistence PASS. If a new application commit is deployed, record it and agree affected-case retests.
**Evidence:** independent before/after detail, original ID, operator restart/run evidence and exact tested versions.

### UAT-09 — Concurrent decision invariant (manual API-assisted)

**References:** F-03, AC-10 (concurrent branch). **Category:** concurrency/state. **Roles:** R1, V1. **Input:** fresh U09 expense; reason `UAT6 concurrent attempt`.

1. R1 creates a fresh SUBMITTED U09 expense. V1 opens its detail and records the ID.
2. V1 executes the following once in the same-origin console, substituting the case's concrete ID:
```javascript
await Promise.all([
  uatRequest("/api/expense-requests/<id>/decision", "POST", {decision:"APPROVED"}),
  uatRequest("/api/expense-requests/<id>/decision", "POST",
    {decision:"REJECTED",reason:"UAT6 concurrent attempt"})
]);
```
3. Record both actual statuses/results. R1 reloads and reads the final detail/history.

**Expected:** unordered statuses exactly one 200 and one 409. Either decision may win; final status/reason must match the 200 response. Exactly one decision event plus SUBMITTED is stored. A second execution on an already decided record is a different setup and cannot be counted as this case.
**Evidence:** fresh precondition, two actual responses and final authorized state/history.

## 4. Coverage and completion

| Contract | UAT cases |
| --- | --- |
| AC-01–AC-03 | UAT-01; anonymous/wrong-role/ownership evidence is supplemented by UAT-05/06 |
| AC-04 | UAT-02 (create/read/no editing) |
| AC-05 | UAT-04 with row-level results |
| AC-06 | UAT-05 and UAT-06 |
| AC-07 | UAT-02 and UAT-03 |
| AC-08 | UAT-02 browser journey and UAT-08 readback/restart |
| AC-09 | UAT-06; baseline automated policy tests support the structural self-review rule |
| AC-10 | UAT-07 sequential and UAT-09 concurrent |

Use [the execution/finding/acceptance templates](records-template.md). Execute all agreed cases, not only four. Account confirmation, version confirmation and tester acknowledgement are required handoff work; these documents alone do not complete Part A.

Critical/Major defects block acceptance until fixed and independently retested. Minor defects must be fixed or explicitly accepted by the UAT Team as limitations. If no legitimate defect is found, request an instructor/TA-approved isolated controlled exercise; do not fabricate a finding or break the healthy live release. Lab 5's intentional C-02 failure is not that exercise.

Lab 6's final course PDF must embed complete cases, relevant contract sections, actual results, findings/dispositions, RED/GREEN assertions and output, relevant fix diff, substantive review/CI/release/retest evidence, exact-version independent acceptance, contributions/AI use and limitations. It cannot consist only of repository links. Use Parts A–D from handout §3.1–3.4 and include all assessed evidence requested in §4.

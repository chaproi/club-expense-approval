import sys,pathlib,json,re,hashlib,subprocess,base64,html,os
root=pathlib.Path(sys.argv[1]);qa=pathlib.Path(sys.argv[2]);tools=pathlib.Path(sys.argv[3]);pw=sys.argv[4]
sys.path.insert(0,str(tools))
import pymupdf as fitz
from markdown_it import MarkdownIt
from fontTools.ttLib import TTFont
packet=root/'docs/reports/lab-07';packet.mkdir(parents=True,exist_ok=True)
evidence=root/'docs/labs/lab-07/postdeploy-2026-11-28'
md=MarkdownIt('commonmark',{'html':True}).enable('table')
read=lambda p:p.read_text(encoding='utf-8-sig')
data=json.loads(read(evidence/'metrics-source.json'));tests=json.loads(read(evidence/'exact-main-results.json'));deploy=json.loads(read(evidence/'deployment-identity.json'));reviews=json.loads(read(evidence/'review-chain.json'))
contract=read(root/'docs/labs/lab-07/contract-proposed-v1.md')
livefile=evidence/'live-checks.json'
live=json.loads(read(livefile)) if livefile.exists() else None
authenticated=bool(live and live.get('status')=='PASS')
missing='Authenticated live checks NOT RUN: established private UAT handoff not found; requested only its local path. No password guessing, seed, live fault injection or synthetic write was attempted.'
pages=[]
def add(area,title,text,small=False):
 pages.append({'area':area,'title':title,'text':text.strip(),'small':small})
def table(headers,rows):return '| '+' | '.join(headers)+' |\n|'+ '|'.join(['---']*len(headers))+'|\n'+'\n'.join('| '+' | '.join(str(v).replace('|','/').replace('\n',' ') for v in row)+' |' for row in rows)+'\n\n'
def fence(s,lang='text'):return '\n~~~'+lang+'\n'+s.rstrip()+'\n~~~\n'
def excerpt(path,start,end):return '\n'.join(read(root/path).splitlines()[start-1:end])
def constraint_rows(prefix):return [line for line in contract.splitlines() if line.startswith('| '+prefix)]
def review(n):return next(r for r in reviews if r['number']==n)
def navcover():
 return """# Club Expense Approval
## Lab 7 - Software maintenance, metrics and readiness
**นายสิริกร ฝันนิมิตร / 67070507215 / TH-038**<br>
Solo with instructor permission. External peer review retains its actual attribution.

Repository: https://github.com/chaproi/club-expense-approval<br>
Deployed application: https://s981b09c9-4d7hbszvwq-as.a.run.app

Released main: **c259afe45eb49311c1f7bb9e166c4443041b9b82**<br>
Log-reported revision: **s981b09c9-00009-fwv**,100% traffic.

Report dated28November2026 (Asia/Bangkok). Due29November2026,23:59 Thailand. The original instructor-approval clause is superseded only by the student-supplied announcement; no personal instructor approval is invented.

**Owner-directed automated checks**, not external peer UAT. This packet is not a claim of final owner acceptance or LEB2 submission.

<MAIN_NAV>

### Scope and current verdict
"""+("**READY for the bounded maintained functionality on the recorded evidence; owner final acceptance/submission is separate.**" if authenticated else "**NOT READY to declare the selected deployed maintenance scope fully verified: authenticated post-deploy cases remain NOT RUN. Deployment/CI/public checks passed.**")+"""
F-06 category totals,F-07 two-stage approval and F-08 filtering remain **Planned**. No video or unchanged full SRS/application dump is included. The completed D2 packet is preserved separately.
"""
add('Cover','Report identity and navigation',navcover())
add('A','A. Old/new rule and authority (25)',"""
## A1. Genuine maintenance of a Sprint1 rule
Accepted Sprint1 reference **43aa8d7472aa8852654d0d634d7239c3765c5869** enforced whole-baht1-100000 for every category. Actual pre-change source **453528073038a3122ecd7abb0adac7bf09a1dc41** has the same application bytes as previously deployed **cc6b04c8e98191be591a3b755d25988148523909**; later-sprint Return/Edit/Resubmit/count-only behavior coexists.

**OLD BR-01 assessed excerpt:**<br>
> รายการหลัง trim มี1-120ตัวอักษร หมวดต้องอยู่ในรายการที่กำหนด ยอดเป็นจำนวนเต็ม1-100,000บาท

**NEW accepted candidate BR-01:**<br>
> รายการหลัง trim มี1-120ตัวอักษร หมวดต้องอยู่ในรายการที่กำหนด ยอดเป็นจำนวนเต็มตั้งแต่1บาท โดย ACTIVITYไม่เกิน150,000บาท EQUIPMENTไม่เกิน120,000บาท และTRAVELไม่เกิน100,000บาท ต้องตรวจหมวดและยอดร่วมกัน

"""+table(['Category','Inclusive integer range','Maximum+1 rejected'],[['ACTIVITY','1-150000','150001'],['EQUIPMENT','1-120000','120001'],['TRAVEL','1-100000','100001']])+"""
125000 is valid only for ACTIVITY;110000 for ACTIVITY/EQUIPMENT but not TRAVEL. Unknown/empty categories have no fallback. Policy selected by the student, not by the instructor or an external financial authority.

## A2. Approval-waiver announcement - verbatim supplied evidence
> Announcement. Lab 7 Spec Sheet Change. You need not get Instructor or TA Approval for your change request to Sprint 1. Think of a good change to Sprint 1 among yourselves, but do try to make it a complex enough added feature and not just a trivial change.

Student supplied this text; recorded27November2026. Original publication date/URL and independent channel verification were not supplied. **Instructor/TA approval: Not required under updated instructor announcement**, not Approved. Peer contract review still preceded implementation.
""")
add('A','A. Impact and revised interfaces',"""
## A3. Impact analysis and unchanged guarantees
"""+table(['Requirement / feature','Affected contract and module','Impact / preserved guarantee'],[
['BR-01 / FR-02 / F-02','SRS scope/BR-01; Feature SDS creation; expense-input.ts, expense-requests.ts, creation form','Validate known category+integer pair; accurate range400 feedback; same body/DTO/assignment/one SUBMITTED event.'],
['BR-01 / FR-05 / F-05','F-05 v1.1 API/UI; shared parser and returned-edit form','Same RETURNED owner/current revision; invalid pair400 changes no fields/time/revision/history.'],
['BR-05/06 / AC-F05-07-11','Existing draft reconciliation and BF-01','Restore changed fields over latest; retain invalid mixed pair visibly; no auto write/clamp; manual correction/Save/Resubmit.'],
['FR-01 / NFR-01 / BR-02/03','auth.ts and inherited router guards','No auth/role/ownership/Origin/session/assignment/DTO protocol change; verify valid-pair denials.'],
['BR-04/05/06 / NFR-02','Conditional updates and atomic event transactions','Preserve races, stale/terminal denial, receipt-free existing workflow and old history. No concurrency/budget changes.'],
['BR-01 / NFR-02','System SDS named CHECK; one new migration','Transactional replacement; no old row/event rewrite, backfill, model/enum/type/index change. INTEGER supports150000.'],
['FR-06 / count-only checkpoint','Existing assigned status summary','Counts use status/assignee scope, not ceiling. No count implementation change. Totals remain Planned.'],
['Delivery / Issue49','Lab5 pipeline and CI environment','Migrate before service update. CI-only owned target provisioning satisfies existing guards; no deployment/dependency change.'],
])+"""
## A4. Relevant revised Feature / System SDS
POST /api/expense-requests takes exactly title/category/amountBaht. Owner PATCH /:id takes those fields plus expectedRevision; Resubmit takes revision only. Valid creation201 starts revision0/one SUBMITTED; Save200 keeps RETURNED, increments once and adds one EDITED. Invalid pair400 INVALID_INPUT leaves authoritative state exact.

Both forms keep number/min1/step1/required and existing accessible names. Category changes retain amount, update max/linked feedback and prevent invalid submission. Restoring an amount over a newer lower category does not change user intent silently. Title Unicode/UTF-16 counting, draft lifecycle, read-only states and exact Origin remain inherited.
""",True)
add('A','A. Accepted AC-L7-01 through08',"""
The following complete observable ACs are the accepted pre-implementation contract. Their original planning labels remain historical; current executions are mapped in PartB. Requirement IDs were not renumbered.

| AC | Required observable outcome | STS |
|---|---|---|
"""+'\n'.join(constraint_rows('AC-L7-'))+"""

No scope is moved into future Issues to excuse an incomplete maintenance requirement. Local, hosted and live coverage are distinguished later. AC-L7-08's release/submission acceptance is not inferred from source approval.
""",True)
sts=constraint_rows('STS-L7-')
for inds in [(0,3),(3,6),(6,10)]:
 add('A','A. Accepted STS inputs and expectations '+str(inds[0]+1)+'-'+str(inds[1]),"""
These are the actual accepted input/precondition/expected-result cases, versioned at c7f1c88 before test/code work. Status phrases such as future/unexecuted describe that design checkpoint; current results appear in PartB.

| STS | Preconditions / inputs / level | Independent expected results |
|---|---|---|
"""+'\n'.join(sts[inds[0]:inds[1]])+"""
Source: docs/labs/lab-07/contract-proposed-v1.md at reviewedc7f1c88; original uniform proposal12d40ec preserved. No expected matrix derives its values from the new production helper.
""",True)
r50=review(50);rv=r50['reviews'][-1]
add('A','A. Substantive review before implementation',"""
## A5. PR50 independent contract review
"""+table(['Field','Verified value'],[['Author / branch',r50['author']+' / '+r50['headBranch']],['Reviewer','thananun-7203'],['Reviewed head',rv['sha']],['Approval UTC',rv['at']],['Merge / UTC',r50['mergeSha']+' / '+r50['mergedAt']]])+"""
**Recorded decision summary:**
"""+fence('APPROVE (substantive pre-implementation Lab7 contract review only; not implementation/release readiness)')+"""
The submitted six-axis review covered identity/history/announcement, bounded requirement scope/AC8/STS10, server/UI/DB consistency and preservation/rollback design, meaningful RED strategy, honest unexecuted status, and completeness. **No binding findings.**

Substantive implementation guidance: keep creation category/amount controlled so category changes preserve input and successful201 resets it; give truthful category-specific API messages; make restored lower-category/high-amount pairs visibly invalid with linked feedback and no Save. All three notes were addressed by the later implementation and reviewed again in PR51.

Chronology is objective: review c7f1c88 at06:11:30Z and merge4535280 at07:05:24Z preceded testsf08672d, RED17aba6f and sourceec10dd4. The earlier teacher-Pending and uniform150000 proposal remain historical, not current gates.

**Evidence A5:** full actual submitted review is embedded in packet review-chain.json; GitHub review6084244796. The short decision wording above is a labelled summary, not a new approval.
""")
add('B','B. Tests-first chronology and versions (50)',"""
## B1. Immutable evidence sequence
"""+table(['Stage','Actual source / outcome'],[
['Accepted Sprint1','43aa8d7472aa8852654d0d634d7239c3765c5869; Lab6 acceptance applies to this version only.'],
['Pre-change','453528073038a3122ecd7abb0adac7bf09a1dc41; app bytes match deployedcc6b04c.'],
['Tests / RED','f08672dda573907cba0ef686c5d80e74f81a53e2 before code; evidence17aba6f.116 focused executions:87pass/29semantic fail/0skip.'],
['Implementation','ec10dd44140ee41f41826763c1500097d9b626e9;3 source files+1 new migration.'],
['Supplementary checks','a0d1e9d; extra54SQL/security cases and populated worker. Not retrospective RED.'],
['Image helper / evidence','d406cb8 helper;48608e2 GREEN record. No later publication-HEAD relabelling.'],
['CI adaptation / code review','b7cbdd1552f0cd0c3c818bb478c467577b1b44a1; PR51 approval19:02:13Z27Nov; stagingcc4b732 at19:38:24Z.'],
['Release review / merge','PR52 reviewedcc4b732; approval28Nov05:26:51Z; merged mainc259afe45eb49311c1f7bb9e166c4443041b9b82 at07:15:32Z.'],
['Deployment','Existing run46120371207, revision00009-fwv; no duplicate deployment.'],
])+"""
The three reviewed/tested/staging trees share hash5fcc7cc7fe7fc8c66ccce4d3dc57d542490b0007. PR51 checkouteee3f1b and PR52 checkout5207814 are distinct test-merge commits; actual-main CI now testsc259afe exactly.

Legitimately superseded negatives only: EQUIPMENT100001-invalid became120001-invalid; ACTIVITY100001-invalid became150001-invalid. New positive/cross-category cases supplement them; TRAVEL100001 and unrelated negatives remain. Frozen RED assertions/helpers are byte-preserved through GREEN.
""",True)
unit=excerpt(pathlib.Path('server/test/expense-input.test.ts'),36,51)
redlog=read(root/'docs/labs/lab-07/evidence/red-2026-11-27/unit-1.log')
redlines=redlog.splitlines()
first_failure=next(i for i,x in enumerate(redlines) if i>redlines.index('✖ failing tests:') and x.startswith('✖ AC-L7-01/02 STS-L7-01 unit creation: ACTIVITY 150000 accepted'))
redsummary='\n'.join(x for x in redlines if x.startswith('ℹ '))+'\n\n'+'\n'.join(redlines[first_failure:first_failure+17])
add('B','B. Meaningful unit RED and same-test GREEN',"""
## B2. Independent policy fixture and assertion - exact test excerpt
File server/test/expense-input.test.ts, committedf08672d before production changes. Current interfaces only; no missing-helper or compile-error RED.
"""+fence(unit,'typescript')+"""
**Actual RED command:** node --import tsx --test server/test/expense-input.test.ts<br>
TestsSHAf08672d; unchanged production4535280. Output:
"""+fence(redsummary)+"""
**Same test GREEN:** 34/34,0fail/skip at cleanec10dd4; runner226.2607ms. The overall RED stage also executed API51(35pass/16fail), browser4(1pass/3fail) and inherited27/27.29 failures were semantic, with successful fixtures/collection; not116 unique new tests.
""",True)
sql=excerpt(pathlib.Path('server/test/category-limits.test.ts'),107,127)
add('B','B. PostgreSQL RED and newly reached browser path',"""
## B3. Actual CHECK probe with valid prerequisites
Fixture: guard verifies owned loopback database/role/public schema; real authenticated old-range250-baht creation. Probe uses savepoint rollback before independent policy assertion.
"""+fence(sql,'typescript')+"""
On old migrated database,5 newly permitted pairs returned native23514 instead of one affected row; the category-only chain stopped at its first ACTIVITY125000 assertion. No future migration file was required for collection. Unit/API/browser failures and unreached statements were individually recorded.

**GREEN:** all51 original API/SQL cases pass at ec10dd4. The high pair succeeds, so EQUIPMENT/TRAVEL category-only rejection checks now execute. Supplemental54 at a0d1e9d add INSERT/amount-only/category-only, literal pairs, high-value access/race/revoked checks.

Browser4/4 at ec10dd4 now reaches actual stale409, latest TRAVEL100000 versus draft125000, Restore retaining invalid TRAVEL125000, linked feedback/no write, explicit correction/manual Save with newest revision and Resubmit/history. Full23 includes inherited draft lifecycle, GET-only retry, repeated conflict, transport-failure simulations and both BF-01 tests. Simulated transport tests are not live outage evidence.
""",True)
diff=lambda file:subprocess.check_output(['git','diff','ec10dd4^','ec10dd4','--',file],cwd=root,text=True,encoding='utf-8')
rawdiff=''.join(diff(f) for f in ['server/src/expense-input.ts','server/src/expense-requests.ts','client/src/expense-requests.tsx','prisma/migrations/20261127000000_category_amount_limits/migration.sql'])
(evidence/'implementation-diff.json').write_text(json.dumps({'from':'ec10dd4^','to':'ec10dd44140ee41f41826763c1500097d9b626e9','rawGitDiff':rawdiff},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(evidence/'implementation.diff').write_text(re.sub(r'[ \t]+$','',rawdiff,flags=re.M),encoding='utf8')
serverdiff=diff('server/src/expense-input.ts')
add('B','B. Bounded server correction - actual diff',"""
## B4. Shared creation / returned parser
Actual ec10dd4 diff excerpt; no auth/revision/transaction implementation changes.
"""+fence(serverdiff,'diff')+"""
Router message changes import expenseValidationMessage, replace the old uniform100000 creation message, and append truthful range feedback to returned-Save invalid input. API shapes/codes are unchanged. Full raw diff is in implementation-diff.json; implementation.diff is its whitespace-normalized print copy. No unrelated app/schema/dependency change is hidden.

Object.hasOwn prevents prototype/unknown category keys from obtaining a maximum. Numeric JSON integer validation, title length/trim/invalid text and body-shape checks remain inherited.
""",True)
uisource=read(root/'client/src/expense-requests.tsx')
ui=uisource.splitlines()
policy_function=re.search(r'function amountPolicy[\s\S]+?\n}',uisource).group()
save_function=re.search(r'  function saveEdit[\s\S]+?\n  }',uisource).group()
add('B','B. UI correction and unchanged draft reconciliation',"""
## B5. Actual released UI excerpts
"""+fence(policy_function,'tsx')+"""
Creation selection/amount are local state and reset after successful201. Pending controls remain unavailable during writes. Category changes update only the category state, never mutate or clamp the amount.

Returned Save guard and linked invalid feedback:
"""+fence(save_function,'tsx')+"""
Nonadjacent returned-form JSX excerpt from the same released file:
"""+fence('\n'.join(ui[287:297]),'tsx')+"""
Same draft functions captureDraft, stageRestoredDraft, restoreDraft, discardDraft and changeEdit are unchanged; same-value Restore/reversion still clears phantom drafts. Successful Save/Resubmit clears only the selected request draft under existing lifecycle rules. Native validity and explicit handler guards protect invalid pairs independently of backend validation.

**No automatic write:** selection/Restore/Discard/retry do not mutate. Dirty Resubmit stays disabled. Browser assertions observe actual requests; no business response was fabricated.
""",True)
add('B','B. New additive migration and rollback limits',"""
## B6. Complete new migration - exact released SQL
"""+fence(read(root/'prisma/migrations/20261127000000_category_amount_limits/migration.sql'),'sql')+"""
All3 applied files and Prisma schema/INTEGER/enum/indexes remain unchanged. The old validated constraint definition is checked before replacement under the same transaction/lock. Every formerly valid record remains valid because each new cap is at least100000; no backfill or domain rewrite.

Rollback cannot safely restore the old CHECK while larger values exist. Never delete/clamp data to make rollback succeed. Reviewed forward correction is preferred; app-only rollback retains data but loses high-value creation/edit capability. A narrowing data policy requires separate review. No destructive rollback was executed.
""",True)
add('B','B. Verification and data-preservation boundaries',"""
## B7. Actual local and hosted results - distinct sources
"""+table(['Source','Actual counts / result'],[
['RED f08672d /17aba6f','Unit24/34;API35/51;browser1/4;inherited27/27.29 semantic fail,0skip. Earlier failed/unreached evidence retained.'],
['GREEN ec10dd4','Same unit34/API51/browser4 all pass; earlier blocked SQL/browser assertions execute.'],
['Supplementary a0d1e9d','Additional54/54;full184/184 unit/API;23/23browser;types/build/Docker pass;0fail/skip.'],
['PR51 testedeee3f1b','Run45978536607:184/23pass,migrations4,build/Docker pass.'],
['PR52 tested5207814','Run46103018541:184/23pass,migrations4,build/Docker pass.'],
['Exact mainc259afe','Run46120371207 ci/verify:184/23pass,migrations4,build/Docker pass. Details next pages.'],
])+"""
## B8. Populated upgrade - historical owned database, not live preservation
Actual pre-change4535280 application created24 requests/42events across3categories,1/100000 boundaries and SUBMITTED/RETURNED/APPROVED/REJECTED. Before intentional writes, candidate migration preserved exact IDs/assignment/fields/timestamps/revisions/events and private auth snapshots;3 old migration checksums unchanged.

Then6 old SUBMITTED records traversed Return/maximum Save/Resubmit/Approve: final24requests/66events;12 old terminal records and6 old RETURNED records unchanged. Assigned counts0/6/12/6, unassigned zeros, high-value guards and new app/Prisma/HTTP readback passed.

Image builtoa0d1e9d contained4 real migrations with matching hashes. Actual image migration/seed/HTTP workflow via helperd406cb8 passed, with3requests/15events and cleanup. This was a separate owned target; it does not prove live Cloud SQL preservation or a pre-deployment snapshot comparison. Private files never enter Git.
""",True)
for number in [51,52]:
 r=review(number);rv=r['reviews'][-1]
 add('B','B. Independent '+('implementation' if number==51 else 'release')+' review #'+str(number),"""
## B9. Substantive peer review and disposition
"""+table(['Field','Actual verified metadata'],[['Author / head',r['author']+' / '+r['headBranch']],['Reviewer','thananun-7203'],['Reviewed exact head',rv['sha']],['Decision / UTC',rv['state']+' / '+rv['at']],['Merged / UTC',r['mergeSha']+' / '+r['mergedAt']]])+"""
The submitted six-axis review independently covered identity/provenance, bounded requirement scope, correctness/security/migration, actual tests/evidence, truthful status documentation and completeness. **Binding findings: None.**

"""+("""PR51 verified the4 production/migration paths, no protected-file drift, actual CASE/CHECK parity, prototype-safe category validation, linked UI range feedback, restored invalid draft guard and unchanged BF-01. It assessed the job-owned CI target rather than weakening guards. The reviewer independently ran build and43 pure unit/canonical-origin cases; these reviewer checks retain their attribution and are not our exact-main suite.

**Non-blocking release note:** inspect the actual live named CHECK when authorized direct access exists, and separately record actual main, migration execution, revision/digest/traffic/live checks. Preparation disclosed direct access unavailable. No local result was relabelled as live. Deployment success now supplies execution/revision evidence; direct SQL/revision-digest reads remain unavailable.
""" if number==51 else """PR52 independently verified the staging/reviewed tree identity,12ahead/0behind main, full128-path scope, unchanged protected deploy/dependency/schema/prior-migration files and migration-before-service ordering. It assessed fresh release CI184/23 and the qualified local populated/image evidence. The reviewer independently ran build,43pure-unit tests and both audits; those are reviewer evidence, not executions performed for this packet.

The release approval authorized the main-release review decision only. Main mergec259afe and existing deployment46120371207 happened afterward. The peer did not issue a new independent live UAT or final Lab7 submission acceptance.
""")+"""
The packet review-chain.json retains all actual submitted review text/URLs. No new reviewer request, message or self-approval was sent during report preparation.
""",True)
ex=read(evidence/'command-excerpts.log')
unitpart=ex[ex.index('## MAIN-UNIT'):ex.index('## DEPLOY-PUSH')]
add('B','B. Exact-main CI - actual command output',"""
## B10. Named complete suite on the released main
Run46120371207, job140903331799, ci/verify. Checkout and git log identify **c259afe45eb49311c1f7bb9e166c4443041b9b82**, not a PR merge. Commands: npm ci; npm run db:migrate; npm test; npm run build; npm run test:e2e; docker build.
"""+fence(unitpart)+"""
Collected/executed184,passed184,failed0,skipped0,cancelled0; test runner5252.856194ms. Browser23pass,0fail/skip,53.3s. Full output inventories are retained in exact-main-unit-output.log and exact-main-browser-output.log. JobsJSON confirms every required step succeeded, including post-job service cleanup.

This new main execution is separate from local a0d1e9d, PR51eee3f1b and PR525207814. The report task did not rerun local passing suites or trigger another deployment. CI's ephemeral target satisfied the unchanged guard; GITHUB_ENV exports matched its database/role/public schema before migrations.
""",True)
add('B','B. Actual deployment identity and limitations',"""
## B11. Existing pipeline completed successfully
"""+table(['Identity','Observed value'],[['Main',deploy['release']],['Run','46120371207 / attempt1'],['Migration execution',deploy['execution']],['Migration completion / service step start UTC','07:19:49.735 /07:19:49.876 on28Nov'],['Revision / reported traffic',deploy['revision']+' /100%'],['Pushed registry digest',deploy['pushedRegistryDigest']],['Image tag','s981b09c9:c259afe45eb49311c1f7bb9e166c4443041b9b82'],['Application origin',deploy['url']]])+fence(ex[ex.index('## DEPLOY-MIGRATION'):])+"""
**Evidence source:** GitHub deployment logs. The registry digest is a pushed digest, not a directly resolved serving-revision digest. No authorized local gcloud/SQL connection was available; no direct Cloud Run revision/traffic/SQL query is claimed.

Exact-main CI identifies all four migrations, including the category-limit migration. Actual CI log excerpt (not production job stdout):
"""+fence('\n'.join(line for line in ex.splitlines() if ('Applying migration `20261127000000_category_amount_limits`' in line or 'All migrations have been successfully applied.' in line)))+"""
The production job used the same main-tagged image and completed before service update. Runtime job Prisma stdout/applied rows were not directly available; the live CHECK was not queried. These are deployment-log observations, not direct cloud reads.
""",True)
add('B','B. Public deployed checks and screen evidence',"""
## B12. Owner-directed public browser/HTTP results
"""+table(['Case','Precondition / expected','Actual'],[['L7-P01','Anonymous desktop root/login','HTTP200 and real login form PASS'],['L7-P02','Anonymous me/list/summary','All401 UNAUTHENTICATED,safe envelope PASS'],['L7-P03','390x844 mobile login','Readable/reachable login,scrollWidth390=viewport390 PASS']])+"""
Executed28Nov07:22:45-07:22:56Z with Chromium151.0.7922.34 against the stated origin after successful deployment. Owned browser/context closed. These are real automated browser observations, not manual testing, Narrator audio or external independent UAT.

<img src="ASSET/public-login-desktop.png" class="screen compact" alt="Live anonymous login desktop">
<img src="ASSET/public-login-mobile.png" class="screen compact" alt="Live anonymous login mobile">
<p class="caption">B12-1/2: actual public application captures; synthetic/public state only. Desktop1440x1000 and mobile390x844. Capture timestamps and runtime in public-checks.json.</p>
""")
live_summary=table(['Case','Requirement / expected live observation','Status'],[
['L7-A01','RealR1/R2/V1/two-session login;existing authorized snapshots','PASS' if authenticated else 'NOT RUN'],
['L7-A02','All3 category maxima saved/retrieved exact','PASS' if authenticated else 'NOT RUN'],
['L7-A03','Max+1/cross-category rejected,no domain writes','PASS' if authenticated else 'NOT RUN'],
['L7-A04','UI switch retains amount,feedback,no auto write','PASS' if authenticated else 'NOT RUN'],
['L7-A05','Important role/owner/Origin/state/revision denial','PASS' if authenticated else 'NOT RUN'],
['L7-A06','Preserved approve/reject/reason/owner history','PASS' if authenticated else 'NOT RUN'],
['L7-A07','Real409→latest/draft→invalidRestore→manualSave/Resubmit','PASS' if authenticated else 'NOT RUN'],
['L7-A08','Reload/readback;authorized old samples unchanged','PASS' if authenticated else 'NOT RUN']])
add('B','B. Authenticated live coverage and retained records',"""
## B13. Selected changed/preserved checks
"""+live_summary+"""
"""+(table(['Retained synthetic ID','Category / amount','Final state / revision'],[[x['id'],x['category']+' /'+str(x['amountBaht']),x['status']+' /'+str(x['revision'])] for x in live['inventory']])+"""
New records are labelledUAT-L7 and retained. No reset/seed/delete or real-record alteration. Existing authorized snapshots were captured after deployment/before these writes and compared afterward; this is preservation during our checks only, not a pre-deployment comparison. Roles/preconditions/time/expected/actual and HTTP redaction are in live-checks.json. Owned sessions logged out and contexts closed.
""" if authenticated else missing+"""

**Retained synthetic inventory:0 records created in this report task.** Public checks were read-only and all contexts closed. No authenticated preservation snapshots were obtained; exact existing-record preservation during checks cannot be claimed. No guessed credential, shared seed, reset, fault injection or fabricated response was used.

Concrete next action: owner supplies the established private local handoff or browser sign-in, then run only these bounded cases, retain labelled records and update this PartB/PartD/PDF before declaring the maintained deployed scope verified. Historical local/CI coverage does not substitute for these live observations.
"""))
if authenticated:
 add('B','B. Live category-switch and recovery captures',"""
## B14. Actual live UI captures - selected synthetic record only
<div style="display:flex;gap:5mm;align-items:flex-start"><div style="width:39%"><img src="ASSET/live-create-form-crop.png" style="width:100%" alt="Category change retains invalid 125000 amount"><p class="caption">Creation: TRAVEL retains125000, linked100000 ceiling feedback and disabled Submit. No automatic write.</p></div><div style="width:59%"><img src="ASSET/live-restored-detail-crop.png" style="width:100%;max-height:208mm;object-fit:contain" alt="Restored invalid Travel150000 with disabled Save and Resubmit"><p class="caption">Real stale409 then Restore: latest TRAVEL100000 remains saved; draft amount150000 is retained and invalid. Save/Resubmit disabled until explicit correction.</p></div></div>

These are lossless crops of actual masked screenshots, not regenerated UI. Source images, timestamps, crop coordinates and hashes are retained. Unrelated request cards were masked at capture. Capture sizes1440x1000; full-page originals retained.
""",True)
 add('B','B. Live final history and execution provenance',"""
## B15. Real final readback and preserved first attempt
<div style="display:flex;gap:6mm;align-items:flex-start"><img src="ASSET/live-final-detail-crop.png" style="width:57%;max-height:207mm;object-fit:contain" alt="Final approved150000 record and six history events"><div style="width:41%">

The recovery record ends APPROVED, ACTIVITY150000, revision5. Exact six events: SUBMITTED, RETURNED, EDITED (second owner session), EDITED (explicit manual correction), RESUBMITTED, APPROVED.

The first attempt passed A01-A03, then failed A04's unsupported exact Category locator before a browser mutation. Four records were retained; four sessions logged out204. This was a harness error, not policy RED.

Continuation reused the four records and inherited /^Category/ combobox selector. It executed A01 and A04-A08: six passing cases; A02/A03 remain original passing observations, not reruns. All eight selected case requirements now have passing evidence. Original failure and both runners are preserved.

Six actor-specific snapshot comparisons cover three distinct pre-existing records. They were captured before continuation writes and unchanged afterward. No pre-deployment snapshot claim.

</div></div>
""",True)
add('C','C. Five dated metrics (15)',"""
## C1. Definitions, fixed window and values
Repository scope: chaproi/club-expense-approval only. Common window **27Nov2026 00:00+07 (26Nov17:00Z) through28Nov07:22:14.1862118Z**. Snapshot time is fixed, not final submission time. Defect Issue status corroboration is a later read on the same report day; historical/source retest versions remain explicit.

"""+table(['Metric','Definition / actual value','Source / qualification'],[
['M1 Completed Issues','6 completed total;0Lab7/6other project. No excluded duplicate/cancelled closure.','#34,#35,#36,#37,#42,#44,each completed in window;#49 remainsopen. Complete list nextpage.'],
['M2 Merged PRs','3Lab7:2to staging,1to main;0other merged within window.','PR50,51,52;separate PR activities,not3different completedfeatures. Listsnextpage.'],
['M3 Automated suite','npm test on exactmainc259afe:184collected/executed/pass;0fail/skip/cancel.','Run46120371207 ci/verify; actual summaryPartB10. Browser23separate,not207unit/API.'],
['M4 Defect status','8known records:6resolved,2deferredLow;severityHigh1/Medium3/Low3/unclassified1.','Version-specific registerPartD. No new binding Lab7 finding in3submittedreviews; not a claim of zero undiscovered/live defects.'],
['M5 CI outcomes','5run-attempts:5success/0failed/0cancelled/0timedout/0other/0running;5/5completed=100%.','Proposal,implementation,release,main runs inexplicitSHAinventory. Reusablejobs not extra runs. AllIDs nextpage.'],
])+"""
GitHub pagination:52 Issue/PR entries,29 PRs and45 workflow runs read; pagination terminated below100/page. Exact compact underlying sources are embedded nextpage and retained in metrics-source.json. Earlier semantic RED29 and setup failures are not CI failures and are not erased by M5's healthy values.
""",True)
add('C','C. Offline-reconcilable source lists',"""
## C2. Completed Issues -6 (all other project work)
"""+table(['Issue','Closed UTC / reason','Scope'],[[str(x['number']),x['closedAt']+' /'+x['reason'],x['scope']] for x in data['completedIssueEntries']])+"""
The UTC26Nov closures are inside the window because27Nov00:00Bangkok=26Nov17:00Z. Issue49 stays open; no closure was performed to inflate a metric.

## C3. Merged PRs -3
"""+table(['PR / target','Merged UTC','Merge SHA prefix'],[[str(x['number'])+' /'+x['base'],x['mergedAt'],x['mergeSha'][:12]] for x in data['mergedPRs']])+"""
## C4. Workflow attempts -5
"""+table(['Run / attempt','Scope / head','Outcome'],[[str(x['id'])+'/'+str(x['attempt']),x['branch']+' /'+x['sha'][:7],x['conclusion']] for x in data['ciAttempts']])+"""
**Interpretation (at most100 words; actual word count checked):**<br>
Three reviewed PRs and five successful workflow attempts connect the contract to deployment, while Issue49 remains open. The six completed Issues are unrelated project closures, so they do not establish maintenance completion. Exact-main184/23 results are healthy, but selected authenticated live checks and direct cloud observations remain distinct evidence. Owner chaproi will complete the bounded authenticated checks using the private handoff before marking maintained-scope readiness, retaining all failures and the labelled test-record inventory.
""",True)
defects=[
['DEF-TH038-01 /#30','Medium /resolved','Malformed-email500 fixed/retested on43aa8d7;originalLab6peeracceptance only. Mainunit/auth regression retained.'],
['DEF-TH038-02 /#31','Medium /resolved','Alias/Origin login correction;original308/canonical login retest on43aa8d7. Not a new peerUAT onc259afe.'],
['#42 (F-05 draftloss)','Medium /resolved technical','Real409draft retention fixedffefb2d;BF-01 follow-upcb05d62;reviewedreleasedcc6b04c. Main23includesrecovery.'],
['Save error wording(no historicalID)','Low /resolved technical','Decision-worded Save error corrected inIssue42;action-specific transport tests retained. No invented historicalID.'],
['BF-01 /PR43 review','Severitynotassigned /resolved','Phantomclean draft fixedcb05d62;approvedf487956;both tests pass exactmain.'],
['#44 advisoryremediation','High(advisory basis) /resolved','Scopedoverrides at a6c93ab,reviewedPR45;Prisma6.19.3retained;compatibility debtremains.'],
['OBS-TH038-01','Low /deferred','Cross-tab authenticatedUI canremainafter other-tab logout;backenddenial enforced. No newfixclaimed.'],
['OBS-TH038-02','Low /deferred','UTF-16 titlecounting discrepancy retained;no Unicode-contractchange.'],
]
add('D','D. Scoped readiness and defects (10)',"""
## D1. Maintained Sprint1 functionality - """+('READY on recorded technicalchecks' if authenticated else 'NOT READY for full live-verification declaration')+"""
"""+table(['Readiness item','Actual state / owner action'],[
['Rule/contract/peer chronology','PASS:3reviewedPRs,testsfirstRED→GREEN,allcategorylayers;announcementwaivesteachergate.'],
['Exact-mainregression/deployment','PASS:184/23,migrations4,build/Docker,jobbeforeService,revision00009-fwv.'],
['Publicchanged/preservedchecks','PASS publicroot/login/401/mobile only. '+('AuthenticatedcasesPASS.' if authenticated else 'AuthenticatedcasesNOTRUN;privatehandoffrequired. Ownerchaproi completesboundedchecks.')],
['Liveidentity/preservationlimits','Log-reportedrevision/traffic;registrydigestnotdirectrevisiondigest;no directSQL. '+('During-check snapshots compared;no predeploybaseline.' if authenticated else 'No authenticated existing-record snapshot obtained.')],
['Configuration/runbook','Existingsecrets/Origin/deployworkflow unchanged;ownedlocal setup only;no operationalreset.'],
['Finalownerdecision/submission','Separate,not performed. Wholeproductnotcomplete:F-06totals/F-07/F-08Planned.'],
])+"""
## D2. Defects - known record snapshot, not undiscovered-defect count
"""+table(['ID / source','Severity / status','Version-specific resolution or limitation'],defects)+"""
Resolved requires a recorded fix+retest, not closed status alone. GitHubIssue30/31/42/44arecompleted;Lowobservationsremaindeferred;BF-01severitywasnotinvented. No binding findings inPR50/51/52. Ownerchaproi reviews deferredLowdispositions during5-7Decemberhardening;no promisedfixdate.
""",True)
add('D','D. Debt, runbook and retrospective',"""
## D3. Technical debt - separate from incorrect behavior
"""+table(['Debt / impact','Priority','Disposition / owner'],[
['Prisma config scoped deepmerge-ts8override exceedsupstreampin;compatibilitymaintenancecost','Medium','chaproi retainsremovalcriteria;aftercompatibleupstreamfixrerunaudit/API/browser/Docker/populatedupgrade. No dependencychangehere.'],
['Policy duplicated inserver/UI/SQL;futureeditscandrift','Medium','chaproi preservesindependentliteralpair tests andcoordinatedmigrationreview;no speculativecoupling/refactor.'],
['No directSQL/revisiondigestcaptureinthissession','Evidence limitation','Disclose;useexistingauthorizedreadaccesswhenavailable. No newapprovalgate fabricated.'],
])+"""
## D4. Configuration and concise runbook
Node24/npm/PostgreSQL; separate owned development/test databases. Privately setDATABASE_URL,TEST_DATABASE_URL andmatchingAPP_ORIGIN/PORT. Existing npm ci→db:migrate→db:seed appliesonlytoanewownedlocal/demoDB. Testhelperrequiresloopbacktest_lab7_<16hex> databaseandmatchingrole/publicschema/liveidentity;CIprovisionsitautomatically.

Normal reviewedrelease→main→reusableCI→imagepush→migrationjob--wait→serviceupdate→selectedlivechecks. Neverseed/resetsharedDB. Newpolicy requiresnewCHECKbeforeapp;oldapp/CHECKrollbackoverlargervaluesisunsafe. Keepcourseprivateaccounthandoffoutsidereport.

## D5. Brief record-based retrospective (not a new personal confirmation)
1. **What helped?** Versioned paired contracts and literal boundary matrices made29 meaningful RED failures distinguishable from fixture/collection errors. Reusing frozen assertions verified the same behavior in GREEN and through exact-main CI.
2. **What hurt?** CI's originalclub_citarget did not satisfy the new strict guard; a separately reviewed owned-target adaptation was necessary. Direct-cloud evidence and the missing privateUAT handoff constrainwhatthisreportcanclaim;healthyCIalonecannotfillthosegaps.
3. **What changes before Final?** Ownerchaproi will keep private test-account handoff locatable and prepare deployment-observation/readiness ownership before Final5-7Decemberhardening, then executeonlytheboundedmissingchecks andretainactual failures.

These are engineering conclusions grounded in commits/logs; they do not invent student experiences, equal pairwork or new student approval.
""",True)
add('D','D. Contributions, limitations and source map',"""
## D6. Contribution and AI use
**นายสิริกร ฝันนิมิตร /67070507215 /TH-038**,solo with instructor permission,directed requirements and implementation,reviewed AI-assisted work and checked recorded results. The previously student-confirmed factual declaration remains: AItools assistedanalysis,implementation,tests andreportpreparation. **ChatGPT and Codex** assistedthose tasks. Independent reviews bythananun-7203 andoriginalLab6UATretainactual attribution. No newstudentconfirmation orlongpersonalreflection is claimed.

## D7. Limits and remaining actions
"""+(missing+'\n\n' if not authenticated else '')+"""
- DirectCloudRun/SQLreads unavailable. Log-reportedrevision/100%traffic andpushedregistrydigestareseparatefromdirectrevision-digestresolution.
- Productionjobexecution succeeded;categorymigration isidentifiedinexact-mainCI andmainimage/sourcechain,notadirectqueryofproductionapplied-migrationrows.
- Populatedrehearsal isisolatedevidence;oldLab6peeracceptanceappliesto43aa8d7only. OurchecksarenotexternalUAT.
- OriginalRED/setupfailures,warnings,publicationSHAs andD2packet remainpreserved. No benchmark,newdeployment,unrelatedfeature,Issueclosure orLEB2submission wasperformed.
- F-06totals,F-07,F-08 remainPlanned. Scope readiness doesnotclaimwhole-productcompletion or ownerfinalacceptance.

## D8. Corroboration and reproducibility
Repository https://github.com/chaproi/club-expense-approval<br>
Issue49;contractPR50,implementationPR51,releasePR52. Fullactualreviews:postdeploy-2026-11-28/review-chain.json. Metrics lists:metrics-source.json. Exact-main logs anddeploymentidentity:command-excerpts.log/exact-main-results.json/deployment-identity.json. Public/livecase records carrytimestamps,roles,expected/actual andcleanup. HistoricalRED/GREENartifacts remainintheLab7directoryat theiroriginalcommits.

Original7pagecoursePDF SHA256:13a82d2ec507a84aecd56811bf21f532439e5bb89c34002863d28098cf8b24cb. The suppliedannouncement supersedesonlyits instructor/TAapprovalgate. A-Dweights25/50/15/10arenotmarksawarded. Deadline29November2026,23:59Thailandunchanged.
""",True)

# Split dense source/register pages rather than reducing legibility.
for index in range(len(pages)-1,-1,-1):
 x=pages[index]
 for divider,title in [('## C4.','C. Workflow outcomes and interpretation'),('## D2.','D. Version-specific defect register')]:
  if divider in x['text']:
   first,second=x['text'].split(divider,1);x['text']=first
   pages.insert(index+1,{'area':x['area'],'title':title,'text':divider+second,'small':True})

# Readable current summaries; original quoted contracts and actual code/output remain unchanged.
for x in pages:
 if x['title']=='D. Debt, runbook and retrospective':
  x['text']="""## D3. Technical debt, separate from defects
"""+table(['Debt / impact','Priority','Disposition / owner'],[
['Scoped Prisma config deepmerge-ts8 override exceeds upstream pin; future compatibility cost.','Medium','chaproi retains removal criteria; after a compatible upstream fix, repeat audit/API/browser/Docker/populated-upgrade checks. No dependency change here.'],
['Category policy appears in server, UI and SQL; a future edit can drift.','Medium','chaproi preserves independent literal pair tests and coordinated migration review. No speculative refactor.'],
['No direct SQL or revision-digest read in this session.','Evidence limitation','Disclose the distinction. Use existing authorized read access when available; no invented approval gate.'],
])+"""
## D4. Configuration and concise runbook
Use Node24/npm/PostgreSQL and separate owned development/test databases. Privately configure DATABASE_URL, TEST_DATABASE_URL and matching APP_ORIGIN/PORT. Existing npm ci -> db:migrate -> db:seed is for a new owned local/demo database only.

The strict helper requires a loopback test_lab7_<16hex> database, matching role, public schema and live identity. CI provisions this target. Normal delivery is reviewed release -> main -> reusable CI -> image push -> migration job --wait -> service update -> selected live checks. Never seed/reset a shared database. Rollback over larger saved values requires review; do not clamp/delete data.

## D5. Brief record-based engineering retrospective
1. **What helped?** Versioned pair contracts and literal boundary matrices made29 semantic RED failures distinguishable from fixture errors. Frozen assertions verified the same behavior in GREEN and through exact-main CI.
2. **What hurt?** The old club_ci target did not satisfy the strict guard, requiring a separately reviewed CI adaptation. Direct-cloud access and an unavailable private UAT handoff constrain what this report can claim; passing CI cannot fill those evidence gaps.
3. **What changes before Final?** Owner chaproi will keep the private handoff locatable and assign deployment-observation/readiness ownership before5-7December hardening, then execute only the bounded missing checks and preserve their actual outcomes.

These are conclusions grounded in commits/logs, not a quotation of newly confirmed personal experience.
"""
 if x['title']=='D. Contributions, limitations and source map':
  x['text']="""## D6. Contributions and AI use
**นายสิริกร ฝันนิมิตร /67070507215 /TH-038**, solo with instructor permission, directed requirements and implementation, reviewed AI-assisted work and checked recorded results. The earlier student-confirmed factual declaration is retained: AI tools assisted analysis, implementation, tests and report preparation. **ChatGPT and Codex** assisted these tasks. Reviews by thananun-7203 and original Lab6 UAT retain their actual attribution. No new student confirmation or long personal reflection is claimed.

## D7. Limitations and remaining actions
"""+(missing+'\n\n' if not authenticated else '')+"""
- Direct Cloud Run/SQL reads are unavailable. Log-reported revision/traffic and pushed registry digest are distinct from a directly resolved revision digest.
- The production migration job succeeded. Category migration is identified in exact-main CI and the main-image/source chain, not a direct production migration-row query.
- The populated rehearsal is isolated evidence. Original Lab6 peer acceptance applies to43aa8d7 only; our checks are not external UAT.
- Original RED/setup failures, warnings, source attribution and the completed D2 packet remain preserved. No additional deployment, unrelated feature, Issue closure or LEB2 submission was performed.
- F-06 totals, F-07 and F-08 remain Planned. Technical evidence is separate from the owner's final acceptance/submission decision.

## D8. Source map
Repository: https://github.com/chaproi/club-expense-approval<br>
Issue49 / contractPR50 / implementationPR51 / releasePR52. Full submitted reviews are in review-chain.json; metrics lists in metrics-source.json; main logs and deployment identity in command-excerpts.log, exact-main-results.json and deployment-identity.json. Evidence links: [contract review](https://github.com/chaproi/club-expense-approval/pull/50#pullrequestreview-6084244796), [implementation review](https://github.com/chaproi/club-expense-approval/pull/51#pullrequestreview-6092360927), [release review](https://github.com/chaproi/club-expense-approval/pull/52#pullrequestreview-6096017531), [actual-main run](https://github.com/chaproi/club-expense-approval/actions/runs/46120371207), [pinned GREEN evidence](https://github.com/chaproi/club-expense-approval/blob/48608e2289079a7858f56141fb4e1875f0bc9e9b/docs/labs/lab-07/green-verification-2026-11-27.md). Public/live case files identify role, time, expected/actual, version and cleanup.

Original seven-page course PDF SHA256:
13a82d2ec507a84aecd56811bf21f532439e5bb89c34002863d28098cf8b24cb.
The student-supplied announcement supersedes only its instructor/TA approval gate. Weights25/50/15/10 are not awarded marks. Deadline29November2026,23:59Thailand is unchanged.
"""

# Current, readable readiness and version-specific register; original history is not rewritten.
for x in pages:
 if x['title']=='C. Five dated metrics (15)':
  x['text']='''## C1. Definitions, fixed window and values
Repository: chaproi/club-expense-approval only. Common window: **27 November2026 00:00+07 (26 November17:00Z) through28 November07:22:14.1862118Z**. This is a fixed snapshot, not submission time. Later defect-status corroboration retains its actual read time; version-specific retest attribution remains explicit.

'''+table(['Metric','Definition / actual value','Source / qualification'],[
 ['M1 Completed Issues','6 completed:0 Lab7,6 other project. No duplicate/cancelled closure counted.','#34/#35/#36/#37/#42/#44, each completed within the window. Issue49 stays open. Full list on page25.'],
 ['M2 Merged PRs','3 Lab7 PRs:2 to staging,1 to main. No unrelated merge in window.','PR50/51/52 are three PR activities, not three different completed features. Full list on page25.'],
 ['M3 Automated suite','npm test at exact main c259afe:184 collected/executed/passed;0 failed/skipped/cancelled.','Run46120371207, ci/verify. Actual summary on page18. Browser23 is separate; not207 unit/API.'],
 ['M4 Defect status','8 known records:6 resolved,2 deferred Low. Severity:1 High,3 Medium,3 Low,1 unclassified.','Version-specific register on page28. No binding finding in three submitted Lab7 reviews; not zero undiscovered/live defects.'],
 ['M5 CI outcomes','5 run-attempts:5 success;0 failed/cancelled/timed-out/other/running. Completed success5/5=100%.','Proposal, implementation, release and main run inventory on page26. Reusable jobs are not extra workflow runs.'],
 ])+'''GitHub pagination read52 Issue/PR entries,29 PRs and45 workflow runs, ending below100 per page. Compact source lists are embedded on pages25-26 and retained in metrics-source.json. Earlier29 semantic RED failures and setup failures remain distinct from CI outcomes and are not erased by these values.
'''
 if x['title']=='D. Scoped readiness and defects (10)':
  x['text']='## D1. Maintained Sprint1 functionality - '+('READY on bounded technical evidence' if authenticated else 'NOT READY: authenticated checks pending')+'\n\n'+table(['Readiness item','Actual state / owner action'],[
   ['Rule / contract / peer review','PASS: PR50/51/52 reviewed; tests-first RED then GREEN; category policy agrees across all three layers. Instructor gate waived by recorded announcement.'],
   ['Exact-main regression / deployment','PASS:184 unit/API and23 browser; four migrations, build/Docker; migration job completed before service update. Log-reported revision00009-fwv.'],
   ['Changed / preserved live checks','PASS: three public cases and eight selected authenticated case requirements. First locator failure preserved; continuation executes six cases and reuses two original passes.' if authenticated else missing],
   ['Live identity / preservation limits','Revision/traffic from deploy logs; registry digest is not a direct revision digest. No direct SQL. Six actor-read comparisons cover three distinct existing records during continuation only.'],
   ['Configuration / runbook','Existing secrets, Origin and deployment workflow unchanged. Only authorized synthetic records created; no seed/reset/delete.'],
   ['Final owner decision / submission','Separate and not performed. Scope readiness is not whole-product completion: F-06 totals/F-07/F-08 remain Planned.'],
  ])
 if x['title']=='D. Version-specific defect register':
  x['text']='## D2. Defects - known records, not an undiscovered-defect count\n\n'+table(['ID / source','Severity / status','Version-specific resolution or limitation'],[
   ['DEF-TH038-01 / #30','Medium / resolved','Malformed-email500 fixed/retested at43aa8d7; original Lab6 peer acceptance only. Main unit/auth regression retained.'],
   ['DEF-TH038-02 / #31','Medium / resolved','Alias/Origin correction; original308/canonical-login retest at43aa8d7. Not new peer UAT on c259afe.'],
   ['#42 (F-05 draft loss)','Medium / resolved technical','Real409 draft retention fixed at ffefb2d; BF-01 follow-up cb05d62; reviewed release cc6b04c. Exact-main23 includes recovery.'],
   ['Save error wording (no historical ID)','Low / resolved technical','Action-specific Save error corrected in Issue42; transport tests retained. No historical ID invented.'],
   ['BF-01 / PR43 review','Not assigned / resolved','Phantom clean draft fixed at cb05d62; approved f487956. Both tests pass in exact-main suite.'],
   ['#44 advisory remediation','High (advisory basis) / resolved','Scoped overrides at a6c93ab, reviewed PR45. Prisma6.19.3 retained; compatibility debt remains.'],
   ['OBS-TH038-01','Low / deferred','Cross-tab authenticated UI can remain after other-tab logout; backend denial enforced. No new fix claimed.'],
   ['OBS-TH038-02','Low / deferred','UTF-16 title counting discrepancy retained. No Unicode-contract change.'],
  ])+'\nResolved requires a recorded fix and relevant retest, not closed status alone. Issue30/31/42/44 are completed; Low observations remain deferred. No binding finding in PR50/51/52. Owner chaproi reviews deferred Low dispositions during5-7December hardening; no promised fix date. The live locator defect was test-only, corrected without application changes, and is preserved separately.\n'
 if authenticated:
  x['text']=x['text'].replace('New records are labelledUAT-L7 and retained.','New records are labelled UAT-L7 and retained.').replace('Existing authorized snapshots were captured after deployment/before these writes and compared afterward;','Existing authorized snapshots were captured after deployment, before continuation writes, and compared afterward;')
  if x['title']=='C. Workflow outcomes and interpretation':
   x['text']=x['text'].split('**Interpretation')[0]+'''**Interpretation (at most100 words; actual word count checked):**
Three reviewed PRs and five successful workflows connect the contract to deployment. Six completed Issues are unrelated closures, not Lab7 completion. Exact-main184/23 results and selected live checks passed; the initial locator failure remains preserved. Direct cloud observations and pre-deployment preservation are still limited. Owner chaproi will retain the private handoff outside Git and review the recorded limitations before the final submission decision, while carrying deferred Low observations into December hardening.
'''
  if x['title']=='D. Debt, runbook and retrospective':
   x['text']=x['text'].replace('Direct-cloud access and an unavailable private UAT handoff constrain what this report can claim; passing CI cannot fill those evidence gaps.','Direct-cloud access was unavailable; the initial exact Category locator also stopped live checks. Reusing the inherited combobox selector corrected the harness without production changes.').replace('then execute only the bounded missing checks and preserve their actual outcomes.','then carry the remaining direct-observation and deferred-Low limitations into the final review.')
 # Deliberate prose-only replacements. Do not modify code/log fences or accepted AC/STS quotations.
 if not ('Accepted AC-' in x['title'] or 'Accepted STS' in x['title']):
  replacements={'at most100':'at most100','Issue49':'Issue49','made29':'made29','before5-7December':'before5-7 December','Weights25/50/15/10':'Weights25/50/15/10','Deadline29November2026,23:59Thailand':'Deadline29 November2026,23:59 Thailand'}
  for a,b in replacements.items():x['text']=x['text'].replace(a,b)

# Four report-only corrections, extracted from immutable original evidence.
correction=json.loads(read(packet/'correction-evidence.json'))
def quote_exact(s):return '\n'.join('> '+line if line else '>' for line in s.splitlines())+'\n\n'
def insert_after(title,page):
 index=next(i for i,x in enumerate(pages) if x['title']==title)
 pages.insert(index+1,page)
insert_after('A. Old/new rule and authority (25)',{'area':'A','title':'A. Original student-proposed rationale','small':False,'text':'''## Student-proposed rationale - recorded before implementation
Source: proposal.md at reviewed contract commit **c7f1c88e0b3bc78322d1dcc34c9ceb4c397361eb**, section2. This is the student's proposed policy, not a stakeholder request or an instructor/financial-authority choice.

**Verbatim original rationale:**
'''+quote_exact(correction['rationale']['verbatim'])+'''**Author explanation of that original proposal:** the categories distinguish activity planning, equipment purchases and travel requests. Activity receives the proposed150000 maximum, Equipment120000 and Travel retains100000. The distinction creates a category/amount dependency rather than one larger global ceiling. Amounts remain bounded integer whole-baht values, and the same paired rule applies to creation and owner-authorized RETURNED Save.

The original proposal preserves the existing assigned-reviewer approval workflow, authorization, revision/history rules and explicit Save/Resubmit. Category switches and restored drafts require validation without clamping or automatic writes. Because every proposed cap is at least the previous100000 ceiling, existing valid records remain valid without rewriting history.

The source gives this qualitative maintenance rationale; it does not establish that the numerical ceilings were financially optimized or demanded by a stakeholder. No retrospective stakeholder request, financial approval or new student confirmation is invented.

This source was peer-reviewed before tests and implementation. Its then-Proposed/Unexecuted status remains historical; later technical results retain their actual source revisions.
'''})
insert_after('B. Meaningful unit RED and same-test GREEN',{'area':'B','title':'B. Matched original unit GREEN output','small':True,'text':'''## Same expense-input suite - actual retained GREEN output
Suite: **server/test/expense-input.test.ts**. Recorded command: `node --import tsx --test server/test/expense-input.test.ts`.

Tested clean source: **ec10dd44140ee41f41826763c1500097d9b626e9**. The original GREEN ledger attributes unit-1 to this source. The preceding page retains the same suite's pre-change RED; this page quotes the original GREEN log, not a later full suite or a newly executed run.

**Verbatim selected output:** command, two newly accepted boundary assertions, complete runner summary and actual runner envelope, in original order. Nonselected passing test lines are omitted; no line is reconstructed.
'''+fence(correction['green']['verbatimExcerpt'])+'''Actual result: **34 executed,34 passed,0 failed,0 skipped** (also0 cancelled). Original runner time **226.2607ms**; process envelope **289ms**, exit0, no signal/spawn error/runner termination. These are different timing measures from the same recorded command.

Original log: docs/labs/lab-07/evidence/green-2026-11-27/candidate/unit-1.log. Its byte hash and exact excerpt are in correction-evidence.json. The RED assertions were preserved through GREEN. No application test was rerun for this correction.
'''})
for rv in correction['reviews']:
 number=rv['pr'];kind={50:'contract',51:'implementation',52:'release'}[number]
 after='A. Substantive review before implementation' if number==50 else 'B. Independent '+kind+' review #'+str(number)
 disposition={
  50:'PR51 later explicitly records all three implementation notes addressed: controlled Create state/reset, category-specific API messages, and the restored-invalid-pair guard. Optional cosmetic spacing was non-blocking; no claim of universal prose cleanup is made. This remains pre-implementation contract approval, not code/release approval.',
  51:'Release preparation disclosed direct live SQL access unavailable and retained the fail-closed migration guard; it did not invent a successful CHECK read. Subsequent main deployment logs and bounded synthetic checks are recorded separately. Direct SQL and directly resolved revision-digest limitations remain. This approval concerns the implementation/migration source, not main or final submission.',
  52:'The owner later merged c259afe and the existing deployment run46120371207 succeeded. Migration execution preceded service update; log-reported revision/traffic and pushed registry digest, plus owner-directed live checks, are separately evidenced. Direct Cloud Run/SQL reads remain unavailable. No independent live UAT or final submission acceptance is attributed to this release review.'
 }[number]
 text='## PR #'+str(number)+' - actual submitted '+kind+' review excerpts\n\n'+table(['Reviewer / original UTC','Reviewed exact SHA / submitted state'],[[rv['reviewer']+' / '+rv['submittedAt'],rv['reviewedSha']+' / '+rv['state']]])
 text+='**Verbatim excerpts** below retain the reviewer\'s original wording and scope. Separate source passages are quoted separately; omitted review text is not replaced by an author summary. Full submitted text remains in the preserved JSON.\n\n'
 text+=''.join(quote_exact(ex) for ex in rv['verbatimExcerpts'])
 text+='**Author disposition (not a quotation):** '+disposition+'\n\n[Original submitted review]('+rv['url']+'). Original body/SHA/timestamp/state match authenticated GitHub records; corroboration is recorded in review-corroboration-2026-11-28.json.\n'
 insert_after(after,{'area':'A' if number==50 else 'B','title':kind.title()+' review verbatim #'+str(number),'small':True,'text':text})

page_number=lambda title:next(i+1 for i,x in enumerate(pages) if x['title']==title)
# Resolve old print references against the new actual sections rather than shifting prose blindly.
for x in pages:
 if x['title']=='C. Five dated metrics (15)':
  for oldtitle,newtitle in [('page25','C. Offline-reconcilable source lists'),('page18','B. Exact-main CI - actual command output'),('page28','D. Version-specific defect register'),('page26','C. Workflow outcomes and interpretation')]:
   x['text']=x['text'].replace(oldtitle,'page'+str(page_number(newtitle)))
  x['text']=x['text'].replace('pages25-26','pages'+str(page_number('C. Offline-reconcilable source lists'))+'-'+str(page_number('C. Workflow outcomes and interpretation')))
evidence_spans=[
 ('L7-A1','A','A. Old/new rule and authority (25)','A. Original student-proposed rationale'),
 ('L7-A2','A','A. Impact and revised interfaces','A. Impact and revised interfaces'),
 ('L7-A3','A','A. Accepted AC-L7-01 through08','Contract review verbatim #50'),
 ('L7-B1','B','B. Tests-first chronology and versions (50)','B. PostgreSQL RED and newly reached browser path'),
 ('L7-B2','B','B. Bounded server correction - actual diff','B. New additive migration and rollback limits'),
 ('L7-B3','B','B. Verification and data-preservation boundaries','B. Verification and data-preservation boundaries'),
 ('L7-B4','B','B. Independent implementation review #51','B. Actual deployment identity and limitations'),
 ('L7-B5','B','B. Actual deployment identity and limitations','B. Live final history and execution provenance'),
 ('L7-C1','C','C. Five dated metrics (15)','C. Offline-reconcilable source lists'),
 ('L7-C2','C','C. Workflow outcomes and interpretation','C. Workflow outcomes and interpretation'),
 ('L7-D1','D','D. Scoped readiness and defects (10)','D. Debt, runbook and retrospective'),
 ('L7-D2','D','D. Debt, runbook and retrospective','D. Debt, runbook and retrospective'),
 ('L7-D3','D','D. Contributions, limitations and source map','D. Contributions, limitations and source map')]
index=[{'id':id,'part':part,'firstPage':page_number(start),'lastPage':page_number(end),'firstSection':start,'lastSection':end} for id,part,start,end in evidence_spans]
(packet/'evidence-index.json').write_text(json.dumps(index,indent=2)+'\n',encoding='utf8')

# Assets embedded from current evidence; no hotlinks or D2 edits.
fontdir=pathlib.Path(os.environ.get('WINDIR','C:/Windows'))/'Fonts'
font=lambda name:base64.b64encode((fontdir/name).read_bytes()).decode()
css="""@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;color:#193439;font-family:Body,sans-serif;font-size:9.5pt;line-height:1.42}h1{font-size:21pt;line-height:1.15;color:#174d49;margin:0 0 12pt}h2{font-size:12pt;line-height:1.25;color:#174d49;margin:12pt 0 7pt}h3{font-size:10.5pt}p{margin:6pt 0 9pt}a{color:#216d80;word-break:break-all}strong{color:#173e3e}ul,ol{padding-left:17pt}li{margin:4pt 0}.sheet{width:210mm;height:297mm;padding:15mm 16mm 17mm;break-after:page;position:relative}.sheet:last-child{break-after:auto}.content{height:258mm;overflow:visible}.sheet.small .content{font-size:8.9pt;line-height:1.38}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:8.1pt;line-height:1.35;margin:8pt 0 12pt}th,td{border:.5pt solid #adc5c2;padding:5pt;vertical-align:top;overflow-wrap:anywhere}th{background:#e1eeeb;text-align:left}tr:nth-child(even){background:#f5f8f7}pre{white-space:pre-wrap;word-break:break-all;overflow-wrap:anywhere;font:7.4pt/1.35 Mono,monospace;background:#edf3f1;padding:8pt;border-left:3pt solid #53847c;margin:9pt 0}code{font-family:Mono,Body,monospace}blockquote{margin:9pt 0;padding-left:10pt;border-left:3pt solid #96b8ae}.foot{position:absolute;bottom:9mm;left:16mm;right:16mm;font-size:7pt;color:#4c6867;display:flex;justify-content:space-between}.screen{max-width:100%;object-fit:contain;display:inline-block}.screen.compact{height:105mm;max-width:61%;vertical-align:top}.screen.compact:nth-of-type(2){max-width:35%}.caption{font-size:7.8pt;color:#4b6264}.kicker{font-size:8pt;letter-spacing:.1em;color:#597a73;margin-bottom:7pt}"""
css="@font-face{font-family:Body;src:url(data:font/ttf;base64,"+font('tahoma.ttf')+")}@font-face{font-family:Body;src:url(data:font/ttf;base64,"+font('tahomabd.ttf')+");font-weight:700}@font-face{font-family:Mono;src:url(data:font/ttf;base64,"+font('consola.ttf')+")}"+css
nav=[]
for area,weight in [('A',25),('B',50),('C',15),('D',10)]:
 inds=[i+1 for i,x in enumerate(pages) if x['area']==area]
 ids='<br>'.join('<a href="#page-'+str(row['firstPage'])+'">'+row['id']+'</a> ('+str(row['firstPage'])+('-'+str(row['lastPage']) if row['lastPage']!=row['firstPage'] else '')+')' for row in index if row['part']==area)
 nav.append([area,str(weight),'<a href="#page-'+str(min(inds))+'">'+str(min(inds))+'-'+str(max(inds))+'</a>',ids])
navigation='<div class="contents">'+md.render(table(['Part','Weight','PDF pages','Existing evidence IDs / pages'],nav))+'</div>'
css+='.contents th:nth-child(1){width:10%}.contents th:nth-child(2){width:12%}.contents th:nth-child(3){width:18%}.contents th:nth-child(4){width:60%}em{font-style:normal}code{font-weight:400;font-style:normal}'
pages[0]['text']=pages[0]['text'].replace('<MAIN_NAV>',navigation)
for x in pages:
 x['text']=re.sub(r'(?m)^(\|[^\n]*\|)\n(?=[^\n|])',r'\1\n\n',x['text'])
 x['text']=re.sub(r'[ \t]+$','',x['text'],flags=re.M)
source='\n\n---\n\n'.join('<!-- PDF page '+str(i+1)+' /'+x['area']+' -->\n'+x['text'] for i,x in enumerate(pages))
(packet/'report.md').write_text(source,encoding='utf-8')
sections=[]
for i,x in enumerate(pages):
 text=x['text'].replace('ASSET/',str(evidence).replace('\\','/')+'/')
 body=md.render(text)
 body=re.sub(r'src="([^"]+\.png)"',lambda m:'src="data:image/png;base64,'+base64.b64encode(pathlib.Path(m[1]).read_bytes()).decode()+'"',body)
 sections.append('<section class="sheet'+(' small' if x['small'] else '')+'" id="page-'+str(i+1)+'"><div class="content"><div class="kicker">TH-038 / LAB 7 / '+x['area']+'</div>'+body+'</div><div class="foot"><span>Releasedc259afe |28November2026 |Owner acceptance separate</span><span>Page '+str(i+1)+' /'+str(len(pages))+'</span></div></section>')
htmlfile=qa/'report-print.html';htmlfile.write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>TH-038 Lab7</title><style>'+css+'</style></head><body>'+''.join(sections)+'</body></html>',encoding='utf-8')
(packet/'pages.json').write_text(json.dumps([{'page':i+1,'area':x['area'],'title':x['title']} for i,x in enumerate(pages)],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'pages':len(pages),'html':str(htmlfile),'packet':str(packet),'navigation':nav,'authenticated':authenticated}))

"""Extract existing, immutable report evidence; never executes tests or live checks."""
import sys,pathlib,subprocess,json,hashlib
root=pathlib.Path(sys.argv[1]).resolve();packet=root/'docs/reports/lab-07'
source='c7f1c88e0b3bc78322d1dcc34c9ceb4c397361eb'
proposal=subprocess.check_output(['git','show',source+':docs/labs/lab-07/proposal.md'],cwd=root).decode('utf8')
rationale=next(x for x in proposal.splitlines() if x.startswith('**Student-proposed rationale:**'))
reviews=json.loads((root/'docs/labs/lab-07/postdeploy-2026-11-28/review-chain.json').read_text(encoding='utf-8-sig'))
records=[]
for r in reviews:
 rv=r['reviews'][-1];body=rv['body'];lines=body.splitlines()
 decision=next(x for x in lines if x.startswith('- **Decision:**'))
 if r['number']==50:
  excerpts=[decision,next(x for x in lines if x.startswith('1. **Complexity & scope:**'))]
  excerpts += [next(x for x in lines if x.startswith('   - **'+label)) for label in ['Controlled state in the Create form','Category-specific API error messages','Restored invalid pair guard']]
  excerpts += [next(x for x in lines if x.startswith('3. **Cosmetic spacing:**'))]
 elif r['number']==51:
  closure=next(x for x in lines if x.startswith('| **6. Closure'))
  excerpts=[decision,closure.split('|',3)[3].rsplit('|',1)[0].strip(),'**Binding findings:** None.']
  start=body.index('**Non-blocking release note:**');excerpts.append(body[start:].strip())
 else:
  correct=next(x for x in lines if x.startswith('| **3. Implementation'))
  excerpts=[decision,correct.split('|',3)[3].rsplit('|',1)[0].strip(),'**Binding findings:** None.']
  start=body.index('**Post-merge deployment checklist reminder (non-blocking):**');excerpts.append(body[start:].strip())
 for x in excerpts:assert x in body,'Quote must be exact source substring'
 records.append({'pr':r['number'],'reviewer':rv['reviewer'],'reviewedSha':rv['sha'],'submittedAt':rv['at'],'state':rv['state'],'url':rv['url'],'bodySha256':hashlib.sha256(body.encode()).hexdigest(),'verbatimExcerpts':excerpts})
logpath=root/'docs/labs/lab-07/evidence/green-2026-11-27/candidate/unit-1.log';raw=logpath.read_text(encoding='utf8');lines=raw.splitlines()
selected=[lines[0],*[x for x in lines if 'ACTIVITY 150000 accepted' in x],*[x for x in lines if x.startswith('ℹ ')],next(x for x in lines if x.startswith('{"id":"unit-1"'))]
for x in selected:assert x in raw
result={'rationale':{'sourceCommit':source,'path':'docs/labs/lab-07/proposal.md','verbatim':rationale,'sourceSha256':hashlib.sha256(proposal.encode()).hexdigest()},'reviews':records,'green':{'sourceCommit':'ec10dd44140ee41f41826763c1500097d9b626e9','path':str(logpath.relative_to(root)).replace('\\','/'),'originalLogSha256':hashlib.sha256(logpath.read_bytes()).hexdigest(),'verbatimExcerpt':'\n'.join(selected),'suiteCommand':'node --import tsx --test server/test/expense-input.test.ts','executed':34,'passed':34,'failed':0,'skipped':0,'runnerMs':226.2607,'elapsedMs':289,'qualification':'Retained original run, not re-executed. Source attribution is corroborated by the original GREEN ledger.'}}
(packet/'correction-evidence.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Original rationale, three submitted review excerpts and same-suite GREEN extracted without execution.')

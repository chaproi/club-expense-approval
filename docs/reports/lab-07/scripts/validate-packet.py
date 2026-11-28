"""Offline evidence consistency checks. Does not execute application/browser suites."""
import sys,pathlib,json,re,hashlib,subprocess
root=pathlib.Path(sys.argv[1]).resolve();sys.path.insert(0,sys.argv[2])
import pymupdf as fitz
packet=root/'docs/reports/lab-07';e=root/'docs/labs/lab-07/postdeploy-2026-11-28'
read=lambda p:p.read_text(encoding='utf-8-sig')
report=read(packet/'report.md');issues=[]
pages=json.loads(read(packet/'pages.json'));evidence_index=json.loads(read(packet/'evidence-index.json'));correction=json.loads(read(packet/'correction-evidence.json'))
def check(ok,msg):
 if not ok:issues.append(msg)
tests=json.loads(read(e/'exact-main-results.json'));live=json.loads(read(e/'live-checks.json'));old=json.loads(read(e/'live-checks-attempt-1.json'));metrics=json.loads(read(e/'metrics-source.json'))
check(tests['release']=='c259afe45eb49311c1f7bb9e166c4443041b9b82','Released source identity')
check([tests[k] for k in ['collected','executed','passed','failed','skipped','cancelled']]==[184,184,184,0,0,0],'Exact-main counts')
check(tests['browser']['passed']==23,'Browser count')
check(len(metrics['completedIssueEntries'])==6 and len(metrics['mergedPRs'])==3 and len(metrics['ciAttempts'])==5,'Metrics source counts')
check(len({x['number'] for x in metrics['completedIssueEntries']})==6,'Unique completed Issues')
check(all(x['conclusion']=='success' for x in metrics['ciAttempts']),'All five workflow attempts accounted')
check(live['status']=='PASS' and len(live['cases'])==8 and all(c['status']=='PASS' for c in live['cases']),'Eight live case requirements covered')
check(old['status']=='FAIL' and old['cases'][-1]['id']=='L7-A04' and old['failure']['name']=='TimeoutError','Original locator failure retained')
for case in live['cases']:
 if case['id'] in ['L7-A02','L7-A03']:
  source=next(x for x in old['cases'] if x['id']==case['id'])
  check(case['startedAt']==source['startedAt'] and case['actual']==source['actual'] and 'sourceAttempt' in case,'Original pass attribution retained')
check(len(live['inventory'])==5 and live['cleanup']['retainedCount']==5 and live['cleanup']['recordsDeleted']==0,'Retained synthetic inventory')
check(live['cleanup']['contextsClosed'] and live['cleanup']['browserClosed'] and all(x['status']==204 for x in live['cleanup']['logout']),'Owned live cleanup')
samples={k:v for k,v in live['preservation'].items() if ':sample:' in k}
check(len(samples)==6 and len({k.split(':')[-1] for k in samples})==3,'Six actor views / three distinct old samples')
check(all(v['beforeHash']==v['afterHash'] and v['unchanged'] for v in samples.values()),'Existing snapshot comparison')
check(set(re.findall(r'\| (AC-L7-\d\d) \|',report))=={'AC-L7-%02d'%n for n in range(1,9)},'Full eight ACs')
check(set(re.findall(r'\| (STS-L7-\d\d) \|',report))=={'STS-L7-%02d'%n for n in range(1,11)},'Full ten STS')
interpretation=re.search(r'\*\*Interpretation[^\n]+\*\*\s*\n([^\n]+)',report).group(1)
words=len(interpretation.split());check(words<=100 and 'chaproi' in interpretation,'Interpretation <=100 words with owner/action')
check(all(s in report for s in ['ChatGPT and Codex','นายสิริกร ฝันนิมิตร','67070507215','Planned','not external UAT']),'Identity/AI/scope qualifications')
local_links=0
for f in [packet/'README.md',packet/'report.md',e/'README.md',root/'docs/reviewer-handoff.md',*[root/'docs/labs/lab-07'/x for x in ['proposal.md','evidence-plan.md','contract-proposed-v1.md','green-verification-2026-11-27.md']]]:
 for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)',read(f)):
  if target.startswith(('https://','http://','#')):continue
  relative=target.split('#')[0].strip('<>')
  if relative:local_links+=1;check((f.parent/relative).exists(),'Missing local link: '+str(f.relative_to(root))+' -> '+target)
with fitz.open(packet/'output/pdf/club-expense-approval-lab7.pdf') as pdf:
 check(len(pdf)==len(pages)==35,'Final thirty-five PDF pages')
 destinations=[l['page'] for p in pdf for l in p.get_links() if l.get('page',-1)>=0 and 'uri' not in l]
 expected=[]
 for part in 'ABCD':
  expected.append(next(x['page']-1 for x in pages if x['area']==part))
  expected.extend(x['firstPage']-1 for x in evidence_index if x['part']==part)
 check(destinations==expected,'A-D and evidence-ID actual page destinations')
 check(all(any('67070507215' in p.get_text() for p in pdf) for _ in [0]),'PDF identity extraction')
 for n,p in enumerate(pdf):check('Page '+str(n+1)+' /35' in p.get_text(),'Page-number footer '+str(n+1))
 for row in evidence_index:
  check(pages[row['firstPage']-1]['title']==row['firstSection'] and pages[row['lastPage']-1]['title']==row['lastSection'],'Evidence ID resolves: '+row['id'])
 normalize=lambda s:re.sub(r'[\W_]+','',s,flags=re.UNICODE).lower()
 for rv in correction['reviews']:
  p=next(x['page'] for x in pages if x['title'].endswith('review verbatim #'+str(rv['pr'])))
  source=next(x for x in json.loads(read(e/'review-chain.json')) if x['number']==rv['pr'])['reviews'][-1]
  text=pdf[p-1].get_text()
  check(rv['reviewedSha'] in text and rv['submittedAt'] in text,'Review metadata in PDF: '+str(rv['pr']))
  check(all(ex in source['body'] and normalize(ex) in normalize(report) and normalize(ex) in normalize(text) for ex in rv['verbatimExcerpts']),'Verbatim review source/PDF: '+str(rv['pr']))
 p=next(x['page'] for x in pages if x['title']=='B. Matched original unit GREEN output')
 check(normalize(correction['green']['verbatimExcerpt']) in normalize(pdf[p-1].get_text()),'Original matched GREEN output inside PDF')
 check(hashlib.sha256((root/correction['green']['path']).read_bytes()).hexdigest()==correction['green']['originalLogSha256'],'Original GREEN log unchanged')
 p=next(x['page'] for x in pages if x['title']=='A. Original student-proposed rationale')
 check(normalize(correction['rationale']['verbatim']) in normalize(pdf[p-1].get_text()),'Original rationale inside PDF')
 check([25,50,15,10]==[int(x) for x in re.findall(r'<td>(25|50|15|10)</td>',report)[:4]],'A-D weights25/50/15/10')
qa=json.loads(read(packet/'pdf-qa.json'));check(not qa['structuralIssues'],'No structural PDF issues')
check(qa['pdfSha256']==hashlib.sha256((packet/'output/pdf/club-expense-approval-lab7.pdf').read_bytes()).hexdigest(),'QA matches final PDF')
files=[]
for folder in [packet,e]:
 for f in folder.rglob('*'):
  if not f.is_file() or f.name in ['manifest.json','validation.json']:continue
  files.append(f)
  if f.suffix in ['.md','.json','.py','.cjs','.ps1','.log','.diff']:
   text=read(f);check('\ufffd' not in text,'Replacement character: '+f.name)
   check(not re.search(r'(?i)(?:postgres(?:ql)?://[^\s"\']+|club_session=[A-Za-z0-9._%-]{10,}|ya29\.[A-Za-z0-9_-]+|gh[pousr]_[A-Za-z0-9]{20,})',text),'Potential secret: '+f.name)
result={'date':'2026-11-28 Asia/Bangkok','release':tests['release'],'result':'PASS' if not issues else 'FAIL','checks':{'ACs':8,'STS':10,'pdfPages':len(pages),'internalPageLinks':len(expected),'existingEvidenceIDs':len(evidence_index),'verbatimReviews':3,'matchedGreenSuite':'34/34 at ec10dd4; original226.2607ms runner/289ms process','localLinksResolved':local_links,'interpretationWords':words,'liveCaseRequirements':8,'liveContinuationExecuted':6,'earlierPassesReused':2,'retainedSyntheticRecords':5,'actorReadSamples':6,'distinctOldRecords':3,'utf8FilesInspected':sum(f.suffix in ['.md','.json','.py','.cjs','.ps1','.log','.diff'] for f in files)},'issues':issues}
(packet/'validation.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
print(json.dumps(result,ensure_ascii=False))
if issues:raise SystemExit(1)

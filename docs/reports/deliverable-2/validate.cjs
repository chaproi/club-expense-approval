// Documentation-only consistency checks; no app, database or test suite is started.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../..'),parent='802a111ac0c424ce1da470bd0658cca3ffbd1d08';
const git=(...args)=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['pipe','pipe','pipe']});
const read=p=>new TextDecoder('utf-8',{fatal:true}).decode(fs.readFileSync(path.join(root,p))).replace(/\r\n/g,'\n');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function assert(ok,message){if(!ok)throw new Error(message);}
const changed=git('diff','--name-only',parent).trim().split('\n').filter(Boolean),untracked=git('ls-files','--others','--exclude-standard').trim().split('\n').filter(Boolean),files=[...new Set([...changed,...untracked])];
assert(files.every(p=>p==='README.md'||p.startsWith('docs/')),'Non-documentation change');
const text=files.filter(p=>/\.(md|json|cjs)$/.test(p));let localLinks=0,tableRows=0,tables=0,pinnedLinks=0;
const warnings=[],pinSet=new Set();
function prose(s){return s.replace(/^(```|~~~)[\s\S]*?^\1[^\n]*$/gm,'');}
const slug=s=>s.toLowerCase().replace(/<[^>]*>/g,'').replace(/[^\p{L}\p{N}\p{M}_\-\s]/gu,'').replace(/ /g,'-');
function anchors(s){const ids=new Set(),dupes=new Map();for(const line of prose(s).split('\n')){const h=line.match(/^#{1,6}\s+(.+?)(?:\s+#+)?$/);if(h){const a=slug(h[1]),n=dupes.get(a)||0;ids.add(a+(n?'-'+n:''));dupes.set(a,n+1);}for(const m of line.matchAll(/\bid=["']([^"']+)["']/g))ids.add(m[1]);}return ids;}
for(const p of text){const s=read(p);assert(!s.includes('\ufffd'),'Replacement character in '+p);
 assert(!/(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|new\d{10}%|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@)/.test(s),'Potential secret in '+p);
 if(!p.endsWith('.md'))continue;const body=prose(s);
 for(const m of body.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)){
  const url=m[1];if(/^[a-z]+:/i.test(url)){
   const pin=url.match(/^https:\/\/github\.com\/chaproi\/club-expense-approval\/blob\/([a-f0-9]{40})\/([^#?]+)/);
   if(pin){pinSet.add(pin[1]+':'+decodeURI(pin[2]));pinnedLinks++;}continue;
  }
  const [f,a]=url.split('#'),target=f?path.posix.normalize(path.posix.join(path.posix.dirname(p),decodeURI(f))):p;
  assert(fs.existsSync(path.join(root,target)),'Missing local link '+p+' -> '+target);localLinks++;
  if(a&&target.endsWith('.md'))assert(anchors(read(target)).has(decodeURI(a)),'Missing anchor '+p+' -> '+url);
 }
 let expected=null,inTable=false;
 for(const [i,line]of body.split('\n').entries()){
  if(!line.startsWith('|')){expected=null;inTable=false;continue;}
  const cells=line.replace(/`[^`]*`/g,'CODE').replace(/\\\|/g,'PIPE').split('|').slice(1,-1);
  if(!inTable){tables++;expected=cells.length;inTable=true;}
  tableRows++;if(cells.length!==expected)warnings.push({path:p,line:i+1,expected,actual:cells.length});
 }
}
const objects=[...pinSet];if(objects.length){const result=cp.execFileSync('git',['cat-file','--batch-check'],{cwd:root,input:objects.join('\n')+'\n',encoding:'utf8'});assert(!result.includes(' missing'),'Missing pinned Git object');}
const prefaced=['docs/srs.md','docs/system-sds.md','docs/traceability.md','docs/reviewer-handoff.md','docs/sprints/deliverable-2.md','docs/labs/lab-06/defect-correction.md',...fs.readdirSync(path.join(root,'docs/contracts')).filter(x=>/^f-0[4-8].*\.md$/.test(x)).map(x=>'docs/contracts/'+x)];
for(const p of [...prefaced,'docs/features.md']){const old=git('show',parent+':'+p).replace(/\r\n/g,'\n'),body=old.slice(old.indexOf('\n')+1).trimStart();assert(read(p).endsWith(body),'Historical body changed: '+p);}
const oldSrs=git('show',parent+':docs/srs.md'),srs=read('docs/srs.md');
for(const kind of ['FR','BR','NFR']){const re=new RegExp('\\b'+kind+'-\\d{2}\\b','g'),a=[...new Set(oldSrs.match(re))].sort(),b=[...new Set(srs.match(re))].sort();assert(JSON.stringify(a)===JSON.stringify(b),'Requirement IDs changed');}
const completion=read('docs/sprints/d2-completion-2026-11-26.md'),sprint2=completion.split('## Sprint 2 per-AC completion')[1].split('### Sprint 3')[0];
assert((sprint2.match(/^\| AC-F0[45]-\d{2} \|/gm)||[]).length===16,'Expected 16 Sprint2 rows');
const manifest=JSON.parse(read('docs/reports/deliverable-2/manifest.json'));
for(const x of manifest.inputs)assert(hash(Buffer.from(read(x.path)))===x.sha256,'Input hash mismatch: '+x.path);
for(const x of manifest.assets){const b=fs.readFileSync(path.join(__dirname,x.path));assert(hash(b)===x.sha256,'Asset hash mismatch');assert(b.equals(fs.readFileSync(path.join(root,x.source))),'Historical image changed');}
assert(hash(fs.readFileSync(path.join(__dirname,'report.md')))===manifest.report.sha256,'Report hash mismatch');
for(const x of manifest.testExcerpts){const source=git('show',x.release+':'+x.path).replace(/\r\n/g,'\n'),snippet=source.split('\n').slice(x.fromLine-1,x.toLine).join('\n');assert(hash(snippet)===x.normalizedLfSha256,'Test excerpt mismatch');assert(read('docs/reports/deliverable-2/report.md').includes(snippet),'Missing report excerpt');}
const report=read('docs/reports/deliverable-2/report.md');for(const x of manifest.fullDocuments)assert(report.includes('<a id="'+x.anchor+'"></a>'),'Missing appendix');
assert(!/\{\{[A-Z_]+\}\}/.test(report),'Unexpanded generated token');
assert(warnings.length===0,'Malformed Markdown table rows: '+JSON.stringify(warnings));
console.log(JSON.stringify({verdict:'PASS',changedOrNewFiles:files.length,utf8TextFiles:text.length,markdownFiles:text.filter(p=>p.endsWith('.md')).length,localLinks,markdownTables:tables,markdownTableRows:tableRows,pinnedLinkOccurrences:pinnedLinks,distinctPinnedObjects:objects.length,historicalBodiesPreserved:prefaced.length+1,sprint2AcRows:16,requirementIds:{FR:8,BR:10,NFR:2},manifestInputs:manifest.inputs.length,fullAppendices:manifest.fullDocuments.length,exactReleasedTestExcerpts:manifest.testExcerpts.length,unchangedImageCopies:manifest.assets.length,secretPatternFindings:0,limitations:'Structural/source validation only; no final PDF exported or visually certified; remote HTTP link availability not probed.'},null,2));

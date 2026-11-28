const fs=require('fs'),p=require('path'),assert=require('node:assert/strict'),crypto=require('crypto'),{createRequire}=require('module');
const [root,out,privatePath,resumePath]=process.argv.slice(2),req=createRequire(p.join(root,'package.json')),{chromium}=req('playwright'),{expect}=req('@playwright/test');
const previous=resumePath?JSON.parse(fs.readFileSync(resumePath,'utf8')):null;
const creds=JSON.parse(fs.readFileSync(privatePath,'utf8')),base='https://s981b09c9-4d7hbszvwq-as.a.run.app',ep='/api/expense-requests',marker='UAT-L7-'+new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
const e={release:'c259afe45eb49311c1f7bb9e166c4443041b9b82',revisionLogReported:'s981b09c9-00009-fwv',url:base,marker,startedAt:new Date().toISOString(),cases:[],http:[],inventory:[],screenshots:[],qualification:'Owner-directed real browser/HTTP checks; not independent external UAT. New synthetic records retained; no cloud SQL direct inspection.'};
const sessions={},owned=new Map((previous?.inventory??[]).map(x=>[x.id,x])),baseline=new Map();let browser;
if(previous){e.marker=previous.marker;e.continuationOf='live-checks-attempt-1.json';e.correction='Use inherited /^Category/ combobox locator instead of unsupported exact label; reuse four previously created synthetic records. Original failed attempt preserved.';}
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const label=(page,name)=>page.getByLabel(name,{exact:true}),detail=page=>page.getByRole('region',{name:'Request details',exact:true});
function sanitize(s){for(const a of Object.values(creds))if(a.password)s=String(s).split(a.password).join('[REDACTED]');return String(s).replace(/club_session=[^\s;]+/g,'[REDACTED]');}
async function run(id,role,expected,fn){const c={id,role,expected,startedAt:new Date().toISOString(),status:'FAIL'};e.cases.push(c);try{c.actual=await fn();c.status='PASS';}catch(err){c.error={name:err.name,message:sanitize(err.message)};throw err;}finally{c.finishedAt=new Date().toISOString();fs.writeFileSync(p.join(out,'live-checks.partial.json'),JSON.stringify(e,null,2)+'\n')}}
async function http(alias,path='',method='GET',data,expected=200,origin=base){
 const r=await sessions[alias].context.request.fetch(base+ep+path,{method,headers:{Origin:origin},...(data===undefined?{}:{data})});const j=await r.json();
 e.http.push({at:new Date().toISOString(),caseId:e.cases.at(-1)?.id,actor:alias,method,path:owned.has(path.split('/')[1])?ep+path:ep+(path===''?'':path==='/summary'?path:'/[existing-or-denied]'),status:r.status(),...(j.error?{error:{code:j.error.code,message:j.error.message}}:{})});
 assert.equal(r.status(),expected,'Actual HTTP '+method+' expected status');assert.ok(!/passwordHash|tokenHash|assignedReviewerId|requesterId/.test(JSON.stringify(j)));return j;
}
async function create(title,category,amountBaht){const j=await http('R1','','POST',{title:marker+'-'+title,category,amountBaht},201);owned.set(j.id,j);assert.equal(j.category,category);assert.equal(j.amountBaht,amountBaht);assert.equal(j.revision,0);assert.deepEqual(j.history.map(x=>x.type),['SUBMITTED']);return j;}
async function ownSnapshot(){const results=[];for(const id of owned.keys())results.push(await http('R1','/'+id));return results;}
async function unchanged(fn){const before=await ownSnapshot();const ids=(await http('R1')).items.map(x=>x.id).sort();await fn();assert.deepEqual(await ownSnapshot(),before);assert.deepEqual((await http('R1')).items.map(x=>x.id).sort(),ids);}
const watch=(page,id,method)=>page.waitForResponse(r=>new URL(r.url()).pathname===ep+id&&r.request().method()===method);
async function open(alias,row){const page=sessions[alias].page;await page.reload();await page.getByRole('button',{name:row.title,exact:true}).click();await expect(detail(page).locator('.detail-title')).toHaveText(row.title);return page;}
async function capture(alias,file){const page=sessions[alias].page;await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});const masks=page.locator('.request-card').filter({hasNotText:marker});await page.screenshot({path:p.join(out,file),fullPage:true,mask:[masks]});e.screenshots.push({file,actor:alias,viewport:page.viewportSize(),at:new Date().toISOString(),redaction:'Unrelated request cards masked; only selected owned synthetic detail unmasked'});}
async function decision(row,status,reason){return http('V1','/'+row.id+'/decision','POST',{decision:status,...(status==='APPROVED'?{}:{reason}),expectedRevision:row.revision});}
(async()=>{try{
 for(const a of ['R1','R2','V1'])assert.ok(creds[a]?.email&&creds[a]?.password,'Private authorized UAT handoff missing alias '+a);
 browser=await chromium.launch();e.browser=browser.version();
 await run('L7-A01','R1/R2/V1 plus secondR1','Real login/current role; capture representative authorized existing records before writes',async()=>{
  for(const alias of ['R1','R2','V1','S2']){const source=alias==='S2'?'R1':alias,context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();sessions[alias]={context,page};
   await page.goto(base);await label(page,'Email').fill(creds[source].email);await label(page,'Password').fill(creds[source].password);
   const r=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/auth/login'&&r.request().method()==='POST');await page.getByRole('button',{name:'Log in',exact:true}).click();assert.equal((await r).status(),200);
   await expect(page.getByRole('heading',{name:alias==='V1'?'Assigned Requests':'My Requests',exact:true})).toBeVisible();const me=await context.request.get(base+'/api/auth/me');assert.equal(me.status(),200);assert.equal((await me.json()).role,alias==='V1'?'REVIEWER':'REQUESTER');
  }
  for(const a of ['R1','V1']){const list=await http(a);for(const row of list.items.filter(x=>!owned.has(x.id)).slice(0,3)){const value=await http(a,'/'+row.id);baseline.set(a+':'+row.id,{alias:a,id:row.id,value});}}
  e.preservation={sampleCount:baseline.size,scope:'Up to3 existing authorized records per owner/assigned role; captured after deployment, before these writes. No pre-deployment preservation claim.'};
  return {authenticatedContexts:4,existingReadSamples:baseline.size};
 });
 let maxA,maxE,maxT,cross,recovery;
 if(previous){
  for(const c of previous.cases.filter(x=>['L7-A02','L7-A03'].includes(x.id)))e.cases.push({...c,sourceAttempt:'live-checks-attempt-1.json; preserved original execution, not rerun'});
  for(const id of owned.keys()){const row=await http('R1','/'+id);assert.equal(row.status,'SUBMITTED');assert.equal(row.revision,0);owned.set(id,row);}
  [maxA,maxE,maxT,cross]=[...owned.values()];
 }else{
 await run('L7-A02','R1','All category maxima accepted and retrieved exactly',async()=>{maxA=await create('ACTIVITY-max','ACTIVITY',150000);maxE=await create('EQUIPMENT-max','EQUIPMENT',120000);maxT=await create('TRAVEL-max','TRAVEL',100000);for(const r of [maxA,maxE,maxT])assert.deepEqual(await http('R1','/'+r.id),r);return {rows:[maxA,maxE,maxT].map(r=>({id:r.id,category:r.category,amount:r.amountBaht,revision:r.revision}))};});
 await run('L7-A03','R1','Maximum+1 and cross-category invalid pairs rejected400 without domain change;110000 valid forEQUIPMENT',async()=>{
  await unchanged(async()=>{for(const [category,amountBaht] of [['ACTIVITY',150001],['EQUIPMENT',120001],['TRAVEL',100001],['EQUIPMENT',125000],['TRAVEL',125000],['TRAVEL',110000]]){const j=await http('R1','','POST',{title:marker+'-invalid',category,amountBaht},400);assert.equal(j.error.code,'INVALID_INPUT');}});
  cross=await create('cross110000','EQUIPMENT',110000);return {rejectedPairs:6,validCrossRecord:cross.id,validCrossAmount:110000};
 });
 }
 await run('L7-A04','R1/browser','Category changes retain125000,update linked feedback,prevent invalid writes;switch back explicitlycreates',async()=>{
  const page=sessions.R1.page;await page.reload();const writes=[];const observer=r=>{if(new URL(r.url()).pathname.startsWith(ep)&&['POST','PATCH'].includes(r.method()))writes.push(r.method());};page.on('request',observer);
  try{await label(page,'Title').fill(e.marker+'-recovery');const category=page.getByRole('combobox',{name:/^Category/}),amount=label(page,'Amount (baht)');await category.selectOption('ACTIVITY');await amount.fill('125000');await expect(amount).toHaveAttribute('max','150000');
   await category.selectOption('EQUIPMENT');await expect(amount).toHaveValue('125000');await expect(amount).toHaveAttribute('max','120000');await expect(amount).toHaveAccessibleDescription(/120[,. ]?000/);await expect(page.getByRole('button',{name:'Submit request',exact:true})).toBeDisabled();
   await category.selectOption('TRAVEL');await expect(amount).toHaveValue('125000');await expect(amount).toHaveAccessibleDescription(/100[,. ]?000/);assert.deepEqual(writes,[]);await capture('R1','live-create-invalid-pair.png');
   await category.selectOption('ACTIVITY');await expect(amount).toHaveValue('125000');const response=watch(page,'','POST');await page.getByRole('button',{name:'Submit request',exact:true}).click();const r=await response;assert.equal(r.status(),201);recovery=await r.json();owned.set(recovery.id,recovery);assert.equal(recovery.amountBaht,125000);assert.deepEqual(writes,['POST']);await expect(amount).toHaveValue('');await expect(category).toHaveValue('');
   return {retainedAmount:125000,automaticWrites:0,explicitCreate:recovery.id};
  }finally{page.off('request',observer)}
 });
 await run('L7-A05','R1/R2/V1','Important role/owner/Origin/stale-state denials preserve exact synthetic state',async()=>{
  await unchanged(async()=>{
   await http('V1','','POST',{title:marker+'-role',category:'ACTIVITY',amountBaht:150000},403);
   await http('R2','/'+maxA.id,'GET',undefined,404);
   await http('R2','/'+maxA.id,'PATCH',{title:maxA.title,category:'ACTIVITY',amountBaht:150000,expectedRevision:0},404);
   await http('V1','/'+maxA.id,'PATCH',{title:maxA.title,category:'ACTIVITY',amountBaht:150000,expectedRevision:0},403);
   await http('R1','/'+maxT.id,'PATCH',{title:maxT.title,category:'TRAVEL',amountBaht:100000,expectedRevision:0},403,'https://untrusted.example');
   await http('R1','/'+maxT.id,'PATCH',{title:maxT.title,category:'TRAVEL',amountBaht:100000,expectedRevision:0},409);
  });return {denials:6,noDomainChange:true};
 });
 await run('L7-A06','V1 decisions/R1 read','Preserved approve/reject,reason and owner history;terminal edits denied',async()=>{
  maxA=await decision(maxA,'APPROVED');maxE=await decision(maxE,'REJECTED','Lab7 synthetic preserved rejection');
  for(const row of [maxA,maxE]){assert.equal(row.revision,1);assert.deepEqual(row.history.map(x=>x.type),['SUBMITTED',row.status]);assert.deepEqual(await http('R1','/'+row.id),row);const before=await http('R1','/'+row.id);await http('R1','/'+row.id,'PATCH',{title:row.title,category:row.category,amountBaht:row.amountBaht,expectedRevision:1},409);assert.deepEqual(await http('R1','/'+row.id),before);}
  assert.equal(maxE.history[1].reason,'Lab7 synthetic preserved rejection');return {approval:maxA.id,rejection:maxE.id};
 });
 await run('L7-A07','Two realR1 sessions/V1','Real409→latest/draft→invalid restoredTRAVEL150000→manual correction/Save/Resubmit',async()=>{
  recovery=await decision(recovery,'RETURNED','Lab7 synthetic correction');const page=await open('R1',recovery);await label(page,'Corrected amount (baht)').fill('150000');await expect(label(page,'Corrected category')).toHaveValue('ACTIVITY');
  const latest=await http('S2','/'+recovery.id,'PATCH',{title:recovery.title,category:'TRAVEL',amountBaht:100000,expectedRevision:1});assert.equal(latest.revision,2);
  const writes=[];const observer=r=>{if(new URL(r.url()).pathname===ep+'/'+recovery.id&&r.method()==='PATCH')writes.push(r.postDataJSON());};page.on('request',observer);
  try{
   const response=watch(page,'/'+recovery.id,'PATCH');await page.getByRole('button',{name:'Save changes',exact:true}).click();const stale=await response;assert.equal(stale.status(),409);assert.equal((await stale.json()).error.code,'INVALID_STATE');
   await expect(page.getByRole('region',{name:'Latest saved values',exact:true})).toContainText('Travel');await expect(page.getByRole('region',{name:'Unsaved draft',exact:true})).toContainText('150000');
   await page.getByRole('button',{name:'Restore draft',exact:true}).click();await expect(label(page,'Corrected category')).toHaveValue('TRAVEL');await expect(label(page,'Corrected amount (baht)')).toHaveValue('150000');await expect(label(page,'Corrected amount (baht)')).toHaveAccessibleDescription(/100[,. ]?000/);await expect(page.getByRole('button',{name:'Save changes',exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:'Resubmit request',exact:true})).toBeDisabled();assert.equal(writes.length,1);assert.deepEqual(await http('R1','/'+recovery.id),latest);await capture('R1','live-restored-invalid-pair.png');
   await label(page,'Corrected category').selectOption('ACTIVITY');await expect(label(page,'Corrected amount (baht)')).toHaveValue('150000');const manual=watch(page,'/'+recovery.id,'PATCH');await page.getByRole('button',{name:'Save changes',exact:true}).click();assert.equal((await manual).status(),200);await expect(page.getByRole('status').filter({hasText:'Changes saved.'})).toBeVisible();assert.equal(writes.length,2);assert.equal(writes[1].expectedRevision,2);
   const sub=watch(page,'/'+recovery.id+'/resubmit','POST');await page.getByRole('button',{name:'Resubmit request',exact:true}).click();assert.equal((await sub).status(),200);recovery=await http('R1','/'+recovery.id);assert.equal(recovery.revision,4);assert.equal(recovery.status,'SUBMITTED');recovery=await decision(recovery,'APPROVED');assert.equal(recovery.revision,5);assert.equal(recovery.amountBaht,150000);assert.deepEqual(recovery.history.map(x=>x.type),['SUBMITTED','RETURNED','EDITED','EDITED','RESUBMITTED','APPROVED']);
   return {id:recovery.id,realStaleStatus:409,recoveryControlWrites:0,explicitManualSave:true,finalRevision:5,historyTypes:recovery.history.map(x=>x.type)};
  }finally{page.off('request',observer)}
 });
 await run('L7-A08','R1 reload/V1 scopedreads','Browser reload retains final details/history;summary matches assigned list;existing sampled records preserved',async()=>{
  const page=await open('R1',recovery);await expect(detail(page).locator('.history')).toContainText('RESUBMITTED');await page.reload();await page.getByRole('button',{name:recovery.title,exact:true}).click();await expect(detail(page).locator('.history')).toContainText('RESUBMITTED');assert.deepEqual(await http('R1','/'+recovery.id),recovery);await capture('R1','live-final-history.png');
  const list=await http('V1'),counts={SUBMITTED:0,RETURNED:0,APPROVED:0,REJECTED:0};for(const r of list.items)counts[r.status]++;
  assert.deepEqual(await http('V1','/summary'),{counts,total:list.items.length});await http('R1','/summary','GET',undefined,403);
  for(const [key,item] of baseline){const current=await http(item.alias,'/'+item.id);assert.deepEqual(current,item.value);e.preservation[key.replace(/:.*/,':sample')+':'+hash(item.id).slice(0,8)]={beforeHash:hash(item.value),afterHash:hash(current),unchanged:true};}
  e.preservation.outcome='PASS';return {reloadExact:true,existingSamplesUnchanged:baseline.size,summaryMatchesAuthorizedList:true,directDatabaseCountInspection:false};
 });
} catch(err){e.failure={name:err.name,message:sanitize(err.message)};process.exitCode=1;}
finally{
 for(const [id] of owned){try{const row=await http('R1','/'+id);e.inventory.push({id:row.id,title:row.title,category:row.category,amountBaht:row.amountBaht,status:row.status,revision:row.revision,historyTypes:row.history.map(x=>x.type),retained:true});}catch{}}
 e.cleanup={recordsDeleted:0,retainedCount:e.inventory.length,logout:[],contextsClosed:false,browserClosed:false};
 for(const [alias,s] of Object.entries(sessions)){try{const r=await s.context.request.post(base+'/api/auth/logout',{headers:{Origin:base}});e.cleanup.logout.push({alias,status:r.status()});}catch{e.cleanup.logout.push({alias,status:'unavailable'})}await s.context.close().catch(()=>{});}
 e.cleanup.contextsClosed=true;if(browser){await browser.close();e.cleanup.browserClosed=true;}e.finishedAt=new Date().toISOString();e.status=e.failure?'FAIL':'PASS';fs.writeFileSync(p.join(out,'live-checks.json'),JSON.stringify(e,null,2)+'\n');console.log(JSON.stringify({status:e.status,cases:e.cases.map(c=>({id:c.id,status:c.status})),inventory:e.inventory,cleanup:e.cleanup,failure:e.failure},null,2));
}})();

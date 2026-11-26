import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {createRequire} from "node:module";
const require=createRequire(path.resolve("package.json"));
const {chromium,request}=require("playwright"),{expect}=require("@playwright/test");
const out=process.env.PD_OUT,creds=JSON.parse(fs.readFileSync(path.join(out,"accounts.private.json"),"utf8"));
const base="https://s981b09c9-4d7hbszvwq-as.a.run.app",endpoint="/api/expense-requests";
const marker="UAT-D2-"+new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z";
const evidence={release:"cc6b04c8e98191be591a3b755d25988148523909",url:base,marker,startedAt:new Date().toISOString(),cases:[],http:[],ownedRecords:[],screenshots:[],pageErrors:[],qualification:"Our post-deployment checks, not external independent acceptance."};
const sessions={},owned=new Set(),baseline=new Map(),seenOld=new Map();
let browser;
const digest=value=>crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
const detail=page=>page.getByRole("region",{name:"Request details",exact:true});
const field=(page,label)=>label==="Category"?page.getByRole("combobox",{name:/^Category\b/}):page.getByLabel(label,{exact:true});
async function check(id,roles,condition,expected,fn){
 const result={id,roles,startingConditions:condition,expected,status:"FAIL",startedAt:new Date().toISOString()};evidence.cases.push(result);
 try{result.actual=await fn();result.status="PASS";}catch(e){result.error={name:e.name,message:safe(e.message)};throw e;}finally{result.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(out,"authenticated-checks.partial.json"),JSON.stringify(evidence,null,2));}
}
function safe(text){for(const a of Object.values(creds)){text=text.split(a.password).join("[REDACTED]");}return text.replace(/Cookie:[^\r\n]+/gi,"[REDACTED]");}
async function http(alias,suffix="",method="GET",body,expected=200,headers={}){
 const r=await sessions[alias].context.request.fetch(base+endpoint+suffix,{method,headers:{Origin:base,...headers},...(body?{data:body}:{} )});
 const json=await r.json();const record={at:new Date().toISOString(),caseId:evidence.cases.at(-1)?.id,actor:alias,method,path:(!owned.has(suffix.slice(1))&&/^\/[a-f0-9-]{36}$/.test(suffix)?endpoint+"/[existing-record]":endpoint+suffix),status:r.status(),cacheControl:r.headers()["cache-control"]};
 if(json.error)record.error={code:json.error.code,message:json.error.message};
 if(owned.has(json.id)){record.ownedProjection={id:json.id,status:json.status,revision:json.revision,historyTypes:json.history?.map(e=>e.type)};}
 evidence.http.push(record);assert.equal(r.status(),expected,method+" "+suffix+" status");return json;
}
function watch(page,suffix,method){return page.waitForResponse(r=>new URL(r.url()).pathname===endpoint+suffix&&r.request().method()===method);}
async function settle(page){await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});}
async function capture(alias,name){
 const page=sessions[alias].page;await settle(page);
 const masks=page.locator(".request-card").filter({hasNotText:marker});
 await page.screenshot({path:path.join(out,name),fullPage:true,mask:[masks]});
 evidence.screenshots.push({file:name,actor:alias,viewport:page.viewportSize(),at:new Date().toISOString(),redaction:"Only unrelated historical request cards are masked; selected owned synthetic detail is unmasked."});
}
async function login(alias,context,page){
 await page.goto(base);await field(page,"Email").fill(creds[alias].email);await field(page,"Password").fill(creds[alias].password);
 const response=page.waitForResponse(r=>new URL(r.url()).pathname==="/api/auth/login"&&r.request().method()==="POST");
 await page.getByRole("button",{name:"Log in",exact:true}).click();assert.equal((await response).status(),200);
 await expect(page.getByRole("heading",{name:alias.startsWith("R")?"My Requests":"Assigned Requests",exact:true})).toBeVisible();
 const me=await context.request.get(base+"/api/auth/me");assert.equal(me.status(),200);const identity=await me.json();assert.equal(identity.role,alias.startsWith("R")?"REQUESTER":"REVIEWER");
 return identity;
}
async function open(alias,row){
 const page=sessions[alias].page;await page.reload();const card=page.getByRole("button",{name:row.title,exact:true});await card.click();
 await expect(detail(page).locator(".detail-title")).toHaveText(row.title);return page;
}
async function create(alias,label,category="ACTIVITY",amountBaht=125){
 const page=sessions[alias].page;await page.reload();await expect(page.getByRole("heading",{name:"My Requests",exact:true})).toBeVisible();
 const title=marker+"-"+label;await field(page,"Title").fill(title);await field(page,"Category").selectOption(category);await field(page,"Amount (baht)").fill(String(amountBaht));
 const response=watch(page,"","POST");await page.getByRole("button",{name:"Submit request",exact:true}).click();const r=await response;assert.equal(r.status(),201);
 const row=await r.json();owned.add(row.id);evidence.ownedRecords.push({id:row.id,title:row.title,owner:alias,status:row.status,revision:row.revision,createdAt:row.createdAt});
 await expect(detail(page).locator(".detail-title")).toHaveText(title);
 assert.equal(row.status,"SUBMITTED");assert.equal(row.revision,0);assert.deepEqual(row.history.map(x=>x.type),["SUBMITTED"]);
 return row;
}
async function decide(row,command,reason){
 const page=await open("V1",row);
 const name=command==="APPROVED"?"Approve":command==="REJECTED"?"Reject":"Return for correction";
 if(command==="REJECTED")await field(page,"Rejection reason").fill(reason);
 if(command==="RETURNED")await field(page,"Return reason").fill(reason);
 const waiting=watch(page,"/"+row.id+"/decision","POST");await page.getByRole("button",{name,exact:true}).click();const response=await waiting;assert.equal(response.status(),200);
 const saved=await response.json();await expect(detail(page).locator(".detail-metadata .status-tag")).toHaveText(command);
 return saved;
}
async function ownPreserved(id,fn){const before=await http("R1","/"+id);await fn(before);const after=await http("R1","/"+id);assert.deepEqual(after,before,"denials must preserve exact authoritative owned detail/history");}
try{
 browser=await chromium.launch();evidence.chromium=browser.version();
 await check("PD-A01",["R1","R2","V1","V2"],"User privately confirmed all four existing synthetic accounts and roles","Real login/current-session, logout204 and old-session401; account roles correct",async()=>{
  for(const alias of ["R1","R2","V1","V2"]){const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();page.on("pageerror",e=>evidence.pageErrors.push({actor:alias,name:e.name,message:safe(e.message)}));sessions[alias]={context,page,identity:await login(alias,context,page)};}
  const r1=sessions.R1,oldCookie=(await r1.context.cookies(base)).map(c=>c.name+"="+c.value).join(";");const response=r1.page.waitForResponse(r=>new URL(r.url()).pathname==="/api/auth/logout");
  await r1.page.getByRole("button",{name:"Log out",exact:true}).click();assert.equal((await response).status(),204);await expect(r1.page.getByRole("button",{name:"Log in",exact:true})).toBeVisible();
  const revoked=await request.newContext({baseURL:base,extraHTTPHeaders:{Cookie:oldCookie}});
  try{for(const target of ["/api/auth/me",endpoint]){const denied=await revoked.get(target);assert.equal(denied.status(),401);assert.equal((await denied.json()).error.code,"UNAUTHENTICATED");evidence.http.push({at:new Date().toISOString(),caseId:"PD-A01",actor:"R1 revoked session",method:"GET",path:target,status:401,error:{code:"UNAUTHENTICATED"}});}}finally{await revoked.dispose();}
  r1.identity=await login("R1",r1.context,r1.page);
  return {accounts:4,rolesVerified:true,logout:204,revokedSessionDenials:2,relogin:200};
 });
 await check("PD-A02",["R1","R2","V1","V2"],"Before any new acceptance expense is created","Capture current existing accessible domain snapshots without publishing contents",async()=>{
  for(const alias of ["R1","R2","V1","V2"]){
   const list=await http(alias);assert.ok(list.items.length<=150,"bounded existing-record inspection");
   const records=[];
   for(const row of list.items){if(!seenOld.has(row.id))seenOld.set(row.id,{alias,data:await http(alias,"/"+row.id)});records.push(seenOld.get(row.id).data);}
   records.sort((a,b)=>a.id.localeCompare(b.id));baseline.set(alias,records);
  }
  return {scopes:Object.fromEntries([...baseline].map(([alias,rows])=>[alias,{records:rows.length,sha256:digest(rows)}])),qualification:"Baseline is immediately before our checks, after deployment; it is not a pre-release preservation baseline."};
 });
 let approval,rejection,returned,conflict;
 await check("PD-A03",["R1","V1"],"Fresh synthetic SUBMITTED request; assigned Reviewer","Sprint1 submit/approve; owner reads same ID and exact SUBMITTED/APPROVED history",async()=>{
  approval=await create("R1","A03-approve");const approved=await decide(approval,"APPROVED");const page=await open("R1",approved);await expect(detail(page).locator(".history li")).toHaveCount(2);
  const row=await http("R1","/"+approval.id);assert.equal(row.status,"APPROVED");assert.deepEqual(row.history.map(e=>e.type),["SUBMITTED","APPROVED"]);assert.equal(row.revision,1);
  return {id:row.id,status:row.status,revision:row.revision,history:row.history.map(e=>e.type)};
 });
 await check("PD-A04",["R1","V1"],"A second independent synthetic request","Sprint1 reject with reason; owner reads reason and exact retained history",async()=>{
  rejection=await create("R1","A04-reject","TRAVEL",250);const saved=await decide(rejection,"REJECTED","Synthetic UAT: request a clearer travel-cost breakdown.");
  await open("R1",saved);await expect(detail(sessions.R1.page).getByText("Synthetic UAT: request a clearer travel-cost breakdown.",{exact:true})).toBeVisible();
  const row=await http("R1","/"+saved.id);assert.equal(row.status,"REJECTED");assert.deepEqual(row.history.map(e=>e.type),["SUBMITTED","REJECTED"]);assert.equal(row.revision,1);
  return {id:row.id,status:row.status,revision:row.revision,history:row.history.map(e=>e.type),reasonRetained:true};
 });
 await check("PD-A05",["R1","V1"],"Fresh synthetic request, retained original ID/createdAt","Return -> owner reason -> Edit/Save -> Resubmit -> Review -> owner complete history; explicit saves only",async()=>{
  returned=await create("R1","A05-return-edit","EQUIPMENT",375);const first=returned;
  returned=await decide(returned,"RETURNED","Synthetic UAT: itemize the shared equipment materials.");
  let page=await open("R1",returned);await expect(detail(page).getByText("Synthetic UAT: itemize the shared equipment materials.",{exact:true})).toBeVisible();
  await field(page,"Corrected title").fill(marker+"-A05-corrected-shared-equipment");
  await field(page,"Corrected category").selectOption("ACTIVITY");await field(page,"Corrected amount (baht)").fill("425");
  await expect(page.getByRole("button",{name:"Resubmit request",exact:true})).toBeDisabled();
  let response=watch(page,"/"+returned.id,"PATCH");await page.getByRole("button",{name:"Save changes",exact:true}).click();let r=await response;assert.equal(r.status(),200);returned=await r.json();await expect(page.getByText("Changes saved.",{exact:true})).toBeVisible();
  assert.equal(returned.status,"RETURNED");assert.equal(returned.revision,2);
  response=watch(page,"/"+returned.id+"/resubmit","POST");await page.getByRole("button",{name:"Resubmit request",exact:true}).click();r=await response;assert.equal(r.status(),200);returned=await r.json();await expect(detail(page).locator(".detail-metadata .status-tag")).toHaveText("SUBMITTED");
  returned=await decide(returned,"APPROVED");
  page=await open("R1",returned);await expect(detail(page).locator(".history li")).toHaveCount(5);
  const row=await http("R1","/"+returned.id);assert.equal(row.id,first.id);assert.equal(row.createdAt,first.createdAt);assert.equal(row.title,marker+"-A05-corrected-shared-equipment");assert.equal(row.amountBaht,425);assert.equal(row.category,"ACTIVITY");assert.equal(row.revision,4);assert.deepEqual(row.history.map(e=>e.type),["SUBMITTED","RETURNED","EDITED","RESUBMITTED","APPROVED"]);
  await capture("R1","deployed-owner-complete-history.png");
  return {id:row.id,status:row.status,revision:row.revision,history:row.history.map(e=>e.type),sameIdAndCreatedAt:true,fields:{category:row.category,amountBaht:row.amountBaht}};
 });
 await check("PD-A06",["R1","R2","V1","V2"],"Independent owned synthetic APPROVED record","Wrong role, cross owner/reviewer, authenticated Origin and stale/terminal denial preserve domain",async()=>{
  const before=await http("R1","/"+approval.id);
  await http("R1","/summary","GET",undefined,403);
  await http("V1","","POST",{title:marker+"-forbidden-reviewer",category:"ACTIVITY",amountBaht:100},403);
  await http("R2","/"+approval.id,"GET",undefined,404);
  await http("V2","/"+approval.id,"GET",undefined,404);
  await http("R1","/"+approval.id+"/decision","POST",{decision:"APPROVED",expectedRevision:before.revision},403);
  await http("V1","/"+approval.id+"/decision","POST",{decision:"APPROVED",expectedRevision:0},409);
  await http("R1","/"+approval.id,"PATCH",{title:before.title,category:before.category,amountBaht:before.amountBaht,expectedRevision:before.revision},409);
  await http("R1","/"+approval.id,"PATCH",{title:before.title,category:before.category,amountBaht:before.amountBaht,expectedRevision:before.revision},403,{Origin:"https://not-authorized.example.test"});
  assert.deepEqual(await http("R1","/"+approval.id),before);
  const foreign=await http("R2");assert.ok(!foreign.items.some(x=>owned.has(x.id)));
  return {id:approval.id,denials:{wrongRole:403,crossOwner:404,unassignedReviewer:404,staleDecision:409,terminalEdit:409,wrongOrigin:403},exactOwnedDetailHistoryUnchanged:true};
 });
 await check("PD-A07",["R1","V1"],"Fresh own RETURNED request; separate real session for the same owner","Real stale Save409; latest/draft separation; Restore changed fields only, no automatic write; explicit manual Save",async()=>{
  conflict=await create("R1","A07-conflict","ACTIVITY",510);conflict=await decide(conflict,"RETURNED","Synthetic UAT: verify the current supplier estimate.");
  const page=await open("R1",conflict),id=conflict.id;
  const second=await request.newContext({baseURL:base,extraHTTPHeaders:{Origin:base}});
  try{
   const auth=await second.post("/api/auth/login",{data:creds.R1});assert.equal(auth.status(),200);
   await field(page,"Corrected title").fill(marker+"-A07-owner-draft");
   const parallel=await second.patch(endpoint+"/"+id,{data:{title:marker+"-A07-latest-saved",category:"TRAVEL",amountBaht:610,expectedRevision:conflict.revision}});assert.equal(parallel.status(),200);const latest=await parallel.json();
   const writes=[];const observer=req=>{const p=new URL(req.url()).pathname;if(p.startsWith(endpoint)&&!["GET","HEAD"].includes(req.method()))writes.push({method:req.method(),path:p});};page.on("request",observer);
   try{
    let waiting=watch(page,"/"+id,"PATCH");await page.getByRole("button",{name:"Save changes",exact:true}).click();let response=await waiting;assert.equal(response.status(),409);
    await expect(page.getByRole("region",{name:"Latest saved values",exact:true})).toContainText(latest.title);await expect(page.getByRole("region",{name:"Unsaved draft",exact:true})).toContainText(marker+"-A07-owner-draft");
    await expect(detail(page).getByText("Title conflict",{exact:true})).toBeVisible();
    assert.deepEqual(await http("R1","/"+id),latest);assert.equal(writes.length,1);
    await capture("R1","deployed-real-conflict-draft.png");
    await page.getByRole("button",{name:"Restore draft",exact:true}).click();
    await expect(field(page,"Corrected title")).toHaveValue(marker+"-A07-owner-draft");await expect(field(page,"Corrected category")).toHaveValue("TRAVEL");await expect(field(page,"Corrected amount (baht)")).toHaveValue("610");
    assert.deepEqual(await http("R1","/"+id),latest);assert.equal(writes.length,1);
    await expect(page.getByRole("button",{name:"Resubmit request",exact:true})).toBeDisabled();
    waiting=watch(page,"/"+id,"PATCH");await page.getByRole("button",{name:"Save changes",exact:true}).click();response=await waiting;assert.equal(response.status(),200);
    conflict=await response.json();await expect(page.getByRole("region",{name:"Unsaved draft",exact:true})).toHaveCount(0);
    assert.equal(writes.length,2);assert.equal(conflict.id,id);assert.equal(conflict.revision,latest.revision+1);assert.equal(conflict.title,marker+"-A07-owner-draft");assert.equal(conflict.category,"TRAVEL");assert.equal(conflict.amountBaht,610);assert.deepEqual(conflict.history.map(e=>e.type),["SUBMITTED","RETURNED","EDITED","EDITED"]);
    assert.deepEqual(await http("R1","/"+id),conflict);
   }finally{page.off("request",observer);}
   await second.post("/api/auth/logout");
  }finally{try{await second.post("/api/auth/logout");}finally{await second.dispose();}}
  return {id,status:conflict.status,revision:conflict.revision,realStaleSave:409,restoreWrites:0,browserWrites:"one rejected stale Save, one explicit current-revision Save",history:conflict.history.map(e=>e.type),untouchedLatestCategoryAmountRetained:true};
 });
 await check("PD-A08",["V1","V2"],"Real assigned lists after each accepted mutation","All four status bins/count total equal independent current scoped lists, V2 excludes our V1 assignments",async()=>{
  const observations={};
  for(const alias of ["V1","V2"]){
   const list=await http(alias),counts={SUBMITTED:0,RETURNED:0,APPROVED:0,REJECTED:0};
   for(const row of list.items){assert.ok(Object.hasOwn(counts,row.status));counts[row.status]++;}
   const summary=await http(alias,"/summary");assert.deepEqual(summary,{counts,total:list.items.length});
   const page=sessions[alias].page;await page.reload();await expect(page.getByRole("heading",{name:"Assigned Requests",exact:true})).toBeVisible();
   for(const [status,n]of Object.entries(counts))await expect(page.getByTestId("summary-"+status)).toHaveText(String(n));
   await expect(page.getByTestId("summary-total")).toHaveText(String(list.items.length));
   if(alias==="V2")assert.ok(!list.items.some(x=>owned.has(x.id)));else for(const id of owned)assert.ok(list.items.some(x=>x.id===id));
   observations[alias]={counts,total:list.items.length,ownedAssignments:alias==="V1"?owned.size:0};
  }return observations;
 });
 await check("PD-A09",["V1"],"Existing owned RETURNED conflict record; terminal decision record; exact 768px Reviewer viewport","Long detail/decision controls, keyboard selection/focus and reduced motion fit without horizontal overflow",async()=>{
  // Use a new synthetic pending record so decision controls are genuinely authorized.
  const pending=await create("R1","A09-responsive-long-shared-equipment-for-student-club-planning-and-campus-community-workshops","EQUIPMENT",735);
  const page=await open("V1",pending);await page.setViewportSize({width:768,height:1000});
  const card=page.getByRole("button",{name:pending.title,exact:true});await card.focus();await page.keyboard.press("Enter");await expect(card).toHaveAttribute("aria-current","true");
  await expect(detail(page).locator(".detail-title")).toHaveText(pending.title);
  const buttons=[page.getByRole("button",{name:"Approve",exact:true}),field(page,"Rejection reason"),page.getByRole("button",{name:"Reject",exact:true}),field(page,"Return reason"),page.getByRole("button",{name:"Return for correction",exact:true})];
  await buttons[0].focus();for(let i=0;i<buttons.length;i++){if(i)await page.keyboard.press("Tab");await expect(buttons[i]).toBeFocused();await expect(buttons[i]).toBeEnabled();await expect(buttons[i]).toBeInViewport();}
  await page.keyboard.press("Shift+Tab");await expect(buttons[3]).toBeFocused();
  await capture("V1","deployed-reviewer-768.png");
  const geometry=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,columns:getComputedStyle(document.querySelector(".reviewer-grid")).gridTemplateColumns}));assert.equal(geometry.scrollWidth,768);
  await page.emulateMedia({reducedMotion:"reduce"});assert.ok(await page.evaluate(()=>[...document.querySelectorAll("*")].every(el=>getComputedStyle(el).animationName==="none")));
  await page.setViewportSize({width:1440,height:1000});await capture("V1","deployed-reviewer-desktop.png");
  return {id:pending.id,...geometry,keyboard:true,reducedMotion:true,controls:"Approve/Reject/Return with both labelled reason fields; no decision made in this case"};
 });
 await check("PD-A10",["R1"],"Owned records created by our checks remain; historical records not edited","Owner mobile readback, reload consistency; pre-existing scoped detail/history checksums unchanged during our session",async()=>{
  const page=await open("R1",returned);await page.setViewportSize({width:390,height:844});await expect(detail(page).locator(".history li")).toHaveCount(5);
  await capture("R1","deployed-owner-mobile.png");
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const oldResults={};
  for(const [alias,rows]of baseline){
   const current=[];for(const row of rows)current.push(await http(alias,"/"+row.id));
   assert.deepEqual(current,rows,"pre-existing data changed during our post-deployment session");
   oldResults[alias]={records:rows.length,before:digest(rows),after:digest(current),unchanged:true};
  }
  for(const row of evidence.ownedRecords){const final=await http(row.owner,"/"+row.id);row.status=final.status;row.revision=final.revision;row.historyTypes=final.history.map(e=>e.type);}
  return {mobileWidth:390,mobileScrollWidth:await page.evaluate(()=>document.documentElement.scrollWidth),existingScopedRecords:oldResults,qualification:"Exact comparison covers our post-deployment session only, not preservation across release: no suitable pre-release domain snapshot was available."};
 });
}catch(error){evidence.stopped={name:error.name,message:safe(error.message),at:new Date().toISOString()};}
finally{
 const logout=[];
 for(const [alias,session]of Object.entries(sessions)){
  try{const r=await session.context.request.post(base+"/api/auth/logout",{headers:{Origin:base}});logout.push({actor:alias,status:r.status()});assert.equal(r.status(),204);const denied=await session.context.request.get(base+"/api/auth/me");assert.equal(denied.status(),401);}
  catch(e){logout.push({actor:alias,error:e.name});}
  await session.context.close();
 }
 if(browser)await browser.close();
 evidence.cleanup={logout,contextsClosed:true,browserClosed:true,sharedDataDeleted:false,syntheticRequestsRetained:evidence.ownedRecords.map(r=>r.id),privateCredentialFileRemoved:false};
 evidence.finishedAt=new Date().toISOString();evidence.passed=evidence.cases.filter(c=>c.status==="PASS").length;evidence.failed=evidence.cases.filter(c=>c.status==="FAIL").length;
 fs.writeFileSync(path.join(out,"authenticated-checks.json"),JSON.stringify(evidence,null,2)+"\n");
}
console.log(JSON.stringify({startedAt:evidence.startedAt,finishedAt:evidence.finishedAt,marker:evidence.marker,cases:evidence.cases,ownedRecords:evidence.ownedRecords,cleanup:evidence.cleanup,passed:evidence.passed,failed:evidence.failed,stopped:evidence.stopped}));if(evidence.failed||evidence.stopped)process.exitCode=1;

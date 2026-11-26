
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import net from "node:net";
import {createRequire} from "node:module";
import {pathToFileURL} from "node:url";
const require=createRequire(path.resolve("package.json"));
const {expect}=require("@playwright/test");
const {PrismaClient}=require("@prisma/client"),{hash}=require("argon2"),{chromium}=require("playwright");
const out=process.env.UI_OUT,phase=process.argv[2],runtime=JSON.parse(fs.readFileSync(path.join(out,"runtime.private.json"),"utf8"));
assert.match(new URL(runtime.url).pathname,/^\/test_club_ui_/);
const database=new PrismaClient({datasourceUrl:runtime.url});
const {createApp}=await import(pathToFileURL(path.resolve("dist/server/app.js")).href);
const evidence={phase,source:require("node:child_process").execFileSync("git.exe",["rev-parse","HEAD"],{encoding:"utf8"}).trim(),dirty:require("node:child_process").execFileSync("git.exe",["status","--porcelain"],{encoding:"utf8"}).trim(),checks:[],screenshots:[],startedAt:new Date().toISOString()};
let server,browser;
try{
 const [identity]=await database.$queryRawUnsafe("select current_database() as db,current_user as owner,current_schema() as schema");
 assert.deepEqual(identity,{db:runtime.db,owner:runtime.db,schema:"public"});
 const probe=net.createServer();await new Promise((ok,fail)=>{probe.once("error",fail);probe.listen(0,"127.0.0.1",ok);});const port=probe.address().port;await new Promise(ok=>probe.close(ok));
 const base="http://127.0.0.1:"+port;
 server=await new Promise((resolve,reject)=>{const listener=createApp({database,appOrigin:base,defaultReviewerEmail:"ui-reviewer@example.test",webRoot:path.resolve("dist/client")}).listen(port,"127.0.0.1",()=>resolve(listener));listener.on("error",reject);});


 browser=await chromium.launch();evidence.chromium=browser.version();
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},extraHTTPHeaders:{Origin:base}});
 const page=await ctx.newPage();
 const errors=[];page.on("pageerror",e=>errors.push(e.name+": "+e.message));
 const login=async(email)=>{await page.getByLabel("Email",{exact:true}).fill(email);await page.getByLabel("Password",{exact:true}).fill(runtime.password);await page.getByRole("button",{name:"Log in",exact:true}).click();await page.getByRole("heading",{name:email.includes("reviewer")?"Assigned Requests":"My Requests",exact:true}).waitFor();};
 const capture=async(name)=>{await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});await page.screenshot({path:path.join(out,phase+"-"+name+".png"),fullPage:true});evidence.screenshots.push(phase+"-"+name+".png");};
 async function api(actor,suffix="",method="GET",body){
  const r=await fetch(base+"/api/expense-requests"+suffix,{method,headers:{Cookie:actor,Origin:base,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
  assert.ok(r.status<400,"API fixture status "+r.status);return r.json();
 }
 const apiLogin=async(email)=>{const r=await fetch(base+"/api/auth/login",{method:"POST",headers:{Origin:base,"Content-Type":"application/json"},body:JSON.stringify({email,password:runtime.password})});assert.equal(r.status,200);return r.headers.get("set-cookie").split(";")[0];};
 if(phase==="before"){
  await database.user.deleteMany({where:{email:{in:["ui-owner@example.test","ui-reviewer@example.test"]}}});
  const passwordHash=await hash(runtime.password);
  for(const [email,displayName,role]of [["ui-owner@example.test","Maya Chen","REQUESTER"],["ui-reviewer@example.test","Alex Rivera","REVIEWER"]])await database.user.create({data:{email,displayName,role,passwordHash}});
  const owner=await apiLogin("ui-owner@example.test"),reviewer=await apiLogin("ui-reviewer@example.test");
  const titles=["Campus arts festival - materials for the student-led creative workshops","Community garden tools and shared equipment","Inter-university volunteer travel","Welcome week photography supplies","Student makers club exhibition","Annual campus music showcase"];
  runtime.items=[];
  for(const [i,title]of titles.entries()){
   let row=await api(owner,"","POST",{title,category:["ACTIVITY","EQUIPMENT","TRAVEL"][i%3],amountBaht:[2450,1800,3200,950,1200,4500][i]});
   if(i===0||i===1)row=await api(reviewer,"/"+row.id+"/decision","POST",{decision:"RETURNED",reason:"Please include the workshop materials breakdown and confirm the final supplier quote.",expectedRevision:row.revision});
   if(i===2||i===3)row=await api(reviewer,"/"+row.id+"/decision","POST",{decision:i===2?"APPROVED":"REJECTED",...(i===3?{reason:"Please use equipment already available through the club office."}:{}),expectedRevision:row.revision});
   runtime.items.push(row);
  }
  fs.writeFileSync(path.join(out,"runtime.private.json"),JSON.stringify(runtime));
 }
 if(phase==="after"){
  const actor=await apiLogin("ui-owner@example.test");
  const current=await api(actor,"/"+runtime.items[0].id);
  runtime.items[0]=await api(actor,"/"+current.id,"PATCH",{title:"Campus arts festival - materials for the student-led creative workshops",category:"ACTIVITY",amountBaht:2450,expectedRevision:current.revision});
  fs.writeFileSync(path.join(out,"runtime.private.json"),JSON.stringify(runtime));
 }
 await page.goto(base);await page.getByRole("button",{name:"Log in",exact:true}).waitFor();
 await capture("login-desktop");
 await page.setViewportSize({width:390,height:844});await capture("login-mobile");
 await page.setViewportSize({width:1440,height:1000});
 if(phase==="after"){
  await page.getByLabel("Email",{exact:true}).focus();assert.equal(await page.locator(":focus").getAttribute("name"),"email");
  await page.keyboard.press("Tab");assert.equal(await page.locator(":focus").getAttribute("name"),"password");
  await page.keyboard.press("Tab");assert.equal(await page.locator(":focus").textContent(),"Log in");
  await page.keyboard.press("Shift+Tab");assert.equal(await page.locator(":focus").getAttribute("name"),"password");
  evidence.checks.push("Login keyboard traversal Email, Password, Log in, Shift+Tab");
 }
 await login("ui-owner@example.test");
 await page.getByRole("button",{name:runtime.items[0].title,exact:true}).click();
 await page.getByRole("heading",{name:"History",exact:true}).waitFor();
 await capture("workspace-desktop");
 await page.setViewportSize({width:390,height:844});await capture("workspace-mobile");
 if(phase==="after"){
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"mobile page overflow");
  await page.getByLabel("Corrected title",{exact:true}).focus();
  assert.ok(await page.locator(":focus").evaluate(el=>getComputedStyle(el).outlineStyle!=="none"),"Visible focus");
  evidence.checks.push("Mobile 390x844 has no page-wide overflow; editable control reachable with visible focus");
  await page.setViewportSize({width:1440,height:1000});
  const owner=await apiLogin("ui-owner@example.test"),current=await api(owner,"/"+runtime.items[0].id);
  await page.getByLabel("Corrected title",{exact:true}).fill("Campus arts festival - owner draft");
  await api(owner,"/"+current.id,"PATCH",{title:"Campus arts festival - updated supplier quote",category:"TRAVEL",amountBaht:2750,expectedRevision:current.revision});
  const stale=page.waitForResponse(r=>r.request().method()==="PATCH"&&new URL(r.url()).pathname.endsWith(current.id));
  await page.getByRole("button",{name:"Save changes",exact:true}).click();assert.equal((await stale).status(),409);
  await page.getByRole("region",{name:"Unsaved draft",exact:true}).waitFor();
  await page.getByRole("region",{name:"Latest saved values",exact:true}).waitFor();
  await capture("conflict-desktop");
  await page.setViewportSize({width:390,height:844});await capture("conflict-mobile");
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.emulateMedia({reducedMotion:"reduce"});
  const moving=await page.evaluate(()=>[...document.querySelectorAll("*")].filter(el=>{const s=getComputedStyle(el);return s.animationName!=="none"&&parseFloat(s.animationDuration)>0.001;}).length);
  assert.equal(moving,0);evidence.checks.push("prefers-reduced-motion suppresses nonessential CSS animations");
  await page.getByRole("button",{name:"Log out",exact:true}).click();await page.getByRole("button",{name:"Log in",exact:true}).waitFor();
  await page.setViewportSize({width:1440,height:1000});await login("ui-reviewer@example.test");
  await page.getByRole("button",{name:runtime.items[4].title,exact:true}).click();await page.getByRole("button",{name:"Approve",exact:true}).waitFor();
  await capture("reviewer-desktop");
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  evidence.checks.push("Reviewer summary and decision forms use real authorized records; desktop no page overflow");
// Additional presentation observations coordinate real requests; no business response is fabricated.
  await page.setViewportSize({width:390,height:844});
  const decisionPath="/api/expense-requests/"+runtime.items[4].id+"/decision";
  let releaseWrite;const writeGate=new Promise(ok=>releaseWrite=ok);
  let routeWork;const pendingHandler=route=>{routeWork=(async()=>{await writeGate;await route.continue();})();return routeWork;};
  await page.route(base+decisionPath,pendingHandler);
  const writeResponse=page.waitForResponse(r=>new URL(r.url()).pathname===decisionPath&&r.request().method()==="POST");
  try{
   await page.getByRole("button",{name:"Approve",exact:true}).click();
   await expect(page.getByRole("region",{name:"Request details",exact:true})).toHaveAttribute("aria-busy","true");
   await expect(page.getByRole("button",{name:"Approve",exact:true})).toBeDisabled();
   await expect(page.getByText("Updating your request\u2026",{exact:true})).toBeVisible();
  }finally{releaseWrite();if(routeWork)await routeWork;await page.unroute(base+decisionPath,pendingHandler);}
  assert.equal((await writeResponse).status(),200);
  await expect(page.getByText("APPROVED by Alex Rivera",{exact:false})).toBeVisible();
  evidence.checks.push("Real approval: pending aria-busy/disabled controls and loading feedback, then authoritative success at mobile size");
  await page.getByRole("button",{name:"Log out",exact:true}).click();await page.getByRole("button",{name:"Log in",exact:true}).waitFor();
  let aborts=0;
  const listPath=base+"/api/expense-requests";
  const failList=async route=>{aborts++;await route.abort("failed");};
  await page.route(listPath,failList,{times:1});
  try{await login("ui-owner@example.test");await expect(page.getByText("Could not load expense requests.",{exact:true})).toBeVisible();}
  finally{await page.unroute(listPath,failList);}
  assert.equal(aborts,1);await page.getByRole("button",{name:"Retry loading requests",exact:true}).click();
  await expect(page.getByRole("button",{name:runtime.items[1].title,exact:true})).toBeVisible();
  evidence.checks.push("Controlled one-shot list transport abort: honest error, real GET-only retry and authoritative recovery");
  // Populate a genuinely long history using the inherited workflow.
  const longOwner=await apiLogin("ui-owner@example.test"),longReviewer=await apiLogin("ui-reviewer@example.test");
  let long=await api(longOwner,"","POST",{title:"Community garden - extended equipment review",category:"EQUIPMENT",amountBaht:1800});
  long=await api(longReviewer,"/"+long.id+"/decision","POST",{decision:"RETURNED",reason:"Please confirm the supplier estimate.",expectedRevision:long.revision});
  for(let i=0;i<6;i++){
   long=await api(longOwner,"/"+long.id,"PATCH",{title:long.title,category:long.category,amountBaht:1801+i,expectedRevision:long.revision});
   long=await api(longOwner,"/"+long.id+"/resubmit","POST",{expectedRevision:long.revision});
   long=await api(longReviewer,"/"+long.id+"/decision","POST",{decision:"RETURNED",reason:"Please confirm the itemized shared-equipment cost before resubmitting.",expectedRevision:long.revision});
  }
  await page.reload();await page.getByRole("button",{name:long.title,exact:true}).click();
  const history=page.getByRole("region",{name:"Request details",exact:true}).locator(".history li");
  await expect(history).toHaveCount(20);
  await history.last().scrollIntoViewIfNeeded();await expect(history.last()).toBeVisible();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  evidence.checks.push("20 genuine workflow history events remain reachable and wrapped on 390px mobile");
  // Keyboard control and selection remain native; reduced motion also tested on login artwork.
  const card=page.getByRole("button",{name:runtime.items[3].title,exact:true});
  await card.focus();await page.keyboard.press("Enter");await expect(card).toHaveAttribute("aria-current","true");
  await expect(page.getByRole("region",{name:"Request details",exact:true}).locator(".detail-title")).toHaveText(runtime.items[3].title);
  const skip=page.getByRole("link",{name:"Skip to content",exact:true});
  await skip.focus();await expect(skip).toBeInViewport();await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(()=>document.activeElement?.id),"main-content");
  evidence.checks.push("Keyboard Enter selects exact request; skip link receives focus and moves focus to main content");
  await page.setViewportSize({width:834,height:1112});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  evidence.checks.push("834x1112 tablet has no page-wide horizontal overflow");
  await page.getByRole("button",{name:"Log out",exact:true}).click();await page.getByRole("button",{name:"Log in",exact:true}).waitFor();
  assert.equal(await page.locator(".campus-art").evaluate(el=>getComputedStyle(el).animationName),"none");
  // Non-certificate representative contrast calculation from actual computed styles.
  function contrast(a,b){const c=s=>s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});const l=s=>{const v=c(s);return .2126*v[0]+.7152*v[1]+.0722*v[2];};return (Math.max(l(a),l(b))+.05)/(Math.min(l(a),l(b))+.05);}
  evidence.contrast=await page.locator(".intro,.login-form button").evaluateAll(els=>els.map(el=>{const s=getComputedStyle(el);let p=el,bg=s.backgroundColor;while(bg==="rgba(0, 0, 0, 0)"&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}if(bg==="rgba(0, 0, 0, 0)")bg="rgb(245, 244, 238)";return {element:el.className||el.tagName,color:s.color,background:bg};}));
  evidence.contrast=evidence.contrast.map(v=>({...v,ratio:Number(contrast(v.color,v.background).toFixed(2))}));assert.ok(evidence.contrast.every(v=>v.ratio>=4.5));

 }
 assert.deepEqual(errors,[]);evidence.pageErrors=errors;
 await ctx.close();
}finally{
 if(browser)await browser.close();
 if(server)await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
 await database.$disconnect();evidence.finishedAt=new Date().toISOString();
 fs.writeFileSync(path.join(out,phase+"-visual.json"),JSON.stringify(evidence,null,2)+"\n");
}
console.log(JSON.stringify(evidence));

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {createRequire} from "node:module";
const require=createRequire(path.resolve("package.json"));
const {chromium}=require("playwright"),{expect}=require("@playwright/test");
const out=process.env.PD_OUT;assert.ok(out);fs.mkdirSync(out,{recursive:true});
const evidence={release:"cc6b04c8e98191be591a3b755d25988148523909",run:"https://github.com/chaproi/club-expense-approval/actions/runs/45786768391",startedAt:new Date().toISOString(),cases:[],screenshots:[],http:[],pageErrors:[]};
let browser,context;
async function run(id,expected,fn){const result={id,role:"Anonymous",expected,status:"FAIL",startedAt:new Date().toISOString()};evidence.cases.push(result);try{result.actual=await fn();result.status="PASS";}catch(e){result.error={name:e.name,message:e.message};}result.finishedAt=new Date().toISOString();}
try{
 browser=await chromium.launch();evidence.chromium=browser.version();context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.on("pageerror",e=>evidence.pageErrors.push({name:e.name,message:e.message}));
 const reported="https://s981b09c9-670075229477.asia-southeast1.run.app",documented="https://s981b09c9-4d7hbszvwq-as.a.run.app";
 await run("PD-P01","Documented public root resolves to HTTPS login with HTTP 200",async()=>{
  const response=await page.goto(documented);assert.equal(response.status(),200);await expect(page.getByRole("button",{name:"Log in",exact:true})).toBeVisible();
  const chain=[];let req=response.request();while(req){chain.unshift({url:req.url(),status:(await req.response())?.status()});req=req.redirectedFrom();}
  evidence.url=new URL(page.url()).origin;evidence.documentedRoot=chain;
  return {documented,status:response.status(),finalUrl:page.url(),redirectChain:chain};
 });
 assert.ok(evidence.url,"authoritative public origin");
 await run("PD-P02","Deployment-reported public root reaches the same login origin",async()=>{
  const response=await page.goto(reported);assert.equal(response.status(),200);await expect(page.getByRole("heading",{name:"Welcome back.",exact:true})).toBeVisible();assert.equal(new URL(page.url()).origin,evidence.url);
  return {reported,status:200,finalUrl:page.url()};
 });
 await run("PD-P03","Anonymous current-session/list/summary reads return safe 401",async()=>{
  const results=[];
  for(const endpoint of ["/api/auth/me","/api/expense-requests","/api/expense-requests/summary"]){
   const r=await context.request.get(evidence.url+endpoint);const body=await r.json();assert.equal(r.status(),401);assert.deepEqual(body,{error:{code:"UNAUTHENTICATED",message:"Log in to continue."}});
   assert.match(r.headers()["cache-control"],/no-store/);
   const item={method:"GET",path:endpoint,status:r.status(),body,cacheControl:r.headers()["cache-control"]};results.push(item);evidence.http.push({...item,at:new Date().toISOString()});
  }return results;
 });
 await run("PD-P04","Wrong Origin login is denied before credential processing; no session established",async()=>{
  const r=await context.request.post(evidence.url+"/api/auth/login",{headers:{Origin:"https://not-authorized.example.test"},data:{email:"synthetic-origin-check@example.test",password:"intentionally-invalid-synthetic-value"}});
  const body=await r.json();assert.equal(r.status(),403);assert.deepEqual(body,{error:{code:"FORBIDDEN_ORIGIN",message:"Request origin is not allowed."}});
  assert.equal(r.headers()["set-cookie"],undefined);
  const observation={method:"POST",path:"/api/auth/login",status:403,body,cacheControl:r.headers()["cache-control"]};evidence.http.push({...observation,at:new Date().toISOString()});return observation;
 });
 for(const [id,width,height]of [["PD-P05",1440,1000],["PD-P06",390,844]]){
  await run(id,"Real public login layout is readable with no page-wide overflow",async()=>{
   await page.setViewportSize({width,height});await page.goto(evidence.url);await expect(page.getByRole("button",{name:"Log in",exact:true})).toBeVisible();
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});
   const geometry=await page.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
   assert.ok(geometry.scrollWidth<=width);
   for(const control of [page.getByLabel("Email",{exact:true}),page.getByLabel("Password",{exact:true}),page.getByRole("button",{name:"Log in",exact:true})]){await control.scrollIntoViewIfNeeded();await expect(control).toBeInViewport();}
   await page.getByLabel("Email",{exact:true}).focus();await page.keyboard.press("Tab");await expect(page.getByLabel("Password",{exact:true})).toBeFocused();await page.keyboard.press("Tab");await expect(page.getByRole("button",{name:"Log in",exact:true})).toBeFocused();await page.keyboard.press("Shift+Tab");await expect(page.getByLabel("Password",{exact:true})).toBeFocused();
   assert.ok(await page.getByLabel("Password",{exact:true}).evaluate(el=>getComputedStyle(el).outlineStyle!=="none"));
   await page.getByLabel("Password",{exact:true}).blur();await page.evaluate(()=>scrollTo(0,0));
   const name="deployed-login-"+width+".png";await page.screenshot({path:path.join(out,name),fullPage:true});evidence.screenshots.push({file:name,width,height,at:new Date().toISOString()});
   return {...geometry,height,keyboard:"Email > Password > Log in; Shift+Tab; visible focus",screenshot:name};
  });
 }
 await run("PD-P07","Deployed login respects prefers-reduced-motion",async()=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  const motion=await page.locator(".campus-art").evaluate(el=>({animation:getComputedStyle(el).animationName,transition:getComputedStyle(el).transitionDuration}));
  assert.equal(motion.animation,"none");assert.equal(parseFloat(motion.transition),0);return motion;
 });
 await run("PD-P08","Served HTML asset names and downloaded immutable asset hashes match the release build",async()=>{
  const response=await context.request.get(evidence.url);const html=await response.text();const names=[...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(m=>m[1]);assert.ok(names.length>=2);
  const observations=[];
  for(const asset of names){
   const r=await context.request.get(evidence.url+asset);assert.equal(r.status(),200);const bytes=await r.body();const local=fs.readFileSync(path.join(process.cwd(),"dist/client",asset));assert.ok(bytes.equals(local),"public bundle must equal release-equivalent built bytes");observations.push({path:asset,bytes:bytes.length,sha256:crypto.createHash("sha256").update(bytes).digest("hex")});
  }return {assets:observations,qualification:"Static UI bytes match the release-equivalent local build; server image identity/traffic comes from deployment logs, not an application version endpoint."};
 });
}finally{
 if(context)await context.close();if(browser)await browser.close();
 evidence.finishedAt=new Date().toISOString();evidence.passed=evidence.cases.filter(c=>c.status==="PASS").length;evidence.failed=evidence.cases.filter(c=>c.status==="FAIL").length;
 evidence.cleanup={ownedBrowserContextClosed:true,ownedBrowserClosed:true,domainWrites:0,syntheticRequestsCreated:0,retainedCredentials:false};
 fs.writeFileSync(path.join(out,"public-checks.json"),JSON.stringify(evidence,null,2)+"\n");
}
console.log(JSON.stringify(evidence));if(evidence.failed)process.exitCode=1;

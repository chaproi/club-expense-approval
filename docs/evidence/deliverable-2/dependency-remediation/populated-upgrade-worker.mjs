
import fs from "node:fs";
import assert from "node:assert/strict";
import {isDeepStrictEqual} from "node:util";
const samePrivate=(actual,expected,label)=>assert.ok(isDeepStrictEqual(actual,expected),label);
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
const require=createRequire(path.resolve("package.json"));
const {PrismaClient}=require("@prisma/client");
const {hash}=require("argon2");
const {createApp}=await import(pathToFileURL(path.resolve("dist/server/app.js")).href);
const mode=process.argv[2], file=process.env.UPGRADE_SNAPSHOT;
assert.ok(["baseline","candidate"].includes(mode));
assert.match(new URL(process.env.TEST_DATABASE_URL).pathname,/^\/test_upgrade_[a-f0-9]+$/);
assert.equal(process.env.DATABASE_URL,process.env.TEST_DATABASE_URL);
let database=new PrismaClient(), server,origin;
const data=mode==="candidate"?JSON.parse(fs.readFileSync(file,"utf8")):{password:process.env.UPGRADE_PASSWORD};
const checks=[];
function mark(name){checks.push(name);}
async function start(){
 server=await new Promise((resolve,reject)=>{
  const s=createApp({database,appOrigin:"http://localhost:5173",defaultReviewerEmail:"upgrade-reviewer@example.test"}).listen(0,"127.0.0.1",()=>resolve(s));
  s.on("error",reject);
 });
 origin="http://127.0.0.1:"+server.address().port;
}
async function stop(){
 if(server){await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));server=undefined;}
 await database.$disconnect();
}
const cookies={};
async function login(actor){
 const r=await fetch(origin+"/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json",Origin:"http://localhost:5173"},body:JSON.stringify({email:"upgrade-"+actor+"@example.test",password:data.password})});
 assert.equal(r.status,200,"login "+actor);
 cookies[actor]=r.headers.get("set-cookie").split(";")[0];
}
async function request(actor,suffix="",method="GET",body,expected=200,code){
 const r=await fetch(origin+"/api/expense-requests"+suffix,{method,headers:{...(actor?{Cookie:cookies[actor]}:{}),...(method!=="GET"?{Origin:"http://localhost:5173"}:{}),...(body?{"Content-Type":"application/json"}:{})},body:body?JSON.stringify(body):undefined});
 assert.equal(r.status,expected,method+" expense request");
 const json=await r.json();
 if(code){assert.deepEqual(Object.keys(json),["error"]);assert.equal(json.error.code,code);}
 assert.ok(!/passwordHash|tokenHash|requesterId|assignedReviewerId/.test(JSON.stringify(json)),"safe DTO");
 return json;
}
const snap=async()=>JSON.parse(JSON.stringify({
 users:await database.user.findMany({orderBy:{id:"asc"}}),
 sessions:await database.session.findMany({orderBy:{tokenHash:"asc"}}),
 requests:await database.expenseRequest.findMany({orderBy:{id:"asc"}}),
 events:await database.requestEvent.findMany({orderBy:{id:"asc"}})
}));
function domain(s){return {users:s.users,requests:s.requests,events:s.events};}
try{
 if(mode==="baseline"){
  const [identity]=await database.$queryRawUnsafe("select current_database() as db, current_user as owner, current_schema() as schema");
  assert.equal(identity.db,process.env.UPGRADE_DB);assert.equal(identity.owner,process.env.UPGRADE_DB);assert.equal(identity.schema,"public");
  assert.equal(await database.user.count(),0);
  const passwordHash=await hash(data.password);
  for(const [name,role] of [["owner","REQUESTER"],["foreign","REQUESTER"],["reviewer","REVIEWER"],["outsider","REVIEWER"]]){
   await database.user.create({data:{email:"upgrade-"+name+"@example.test",displayName:"Upgrade "+name,role,passwordHash}});
  }
  await start();for(const actor of ["owner","foreign","reviewer","outsider"])await login(actor);
  data.items=[];
  for(const [index,status] of ["SUBMITTED","APPROVED","REJECTED"].entries()){
   let row=await request("owner","","POST",{title:"Legacy "+status+" expense",category:["ACTIVITY","TRAVEL","EQUIPMENT"][index],amountBaht:[500,700,900][index]},201);
   if(status!=="SUBMITTED")row=await request("reviewer","/"+row.id+"/decision","POST",{decision:status,...(status==="REJECTED"?{reason:"Legacy rejected justification"}:{})});
   assert.equal(row.status,status);assert.equal(row.history.length,status==="SUBMITTED"?1:2);
   data.items.push(row);
  }
  data.snapshot=await snap();
  assert.equal(data.snapshot.requests.length,3);assert.equal(data.snapshot.events.length,5);
  assert.ok(data.snapshot.requests.every(r=>!("revision" in r)));
  fs.writeFileSync(file,JSON.stringify(data),{flag:"wx",mode:0o600});
  mark("Sprint 1 real login/submit/approve/reject created 3 requests and 5 events");
 }else{
  // First operation after migrations is exact preservation checking, before candidate auth/session writes.
  const migrated=await snap();
  samePrivate(migrated.users,data.snapshot.users,"Private users preserved");
  samePrivate(migrated.sessions,data.snapshot.sessions,"Private session snapshot preserved");
  assert.deepEqual(migrated.events,data.snapshot.events);
  assert.deepEqual(migrated.requests,data.snapshot.requests.map(r=>({...r,revision:0})));
  mark("Immediate migration preservation exact, all 3 revisions backfilled to zero");
  const original=domain(migrated);
  await start();for(const actor of ["owner","foreign","reviewer","outsider"])await login(actor);
  async function readAll(){
   for(const actor of ["owner","reviewer"]){
    const list=await request(actor);assert.equal(list.items.length,3);
    assert.deepEqual(list.items.map(i=>i.id).sort(),data.items.map(i=>i.id).sort());
    for(const item of data.items){
     const detail=await request(actor,"/"+item.id);
     if(!data.final){assert.deepEqual(detail,{...item,revision:0});}
     else assert.deepEqual(detail,data.final[item.id]);
    }
   }
  }
  await readAll();mark("Candidate owner and assigned reviewer list/detail/history retain all legacy data");
  samePrivate(domain(await snap()),original,"Domain preserved");mark("Authorized legacy reads preserve domain");
  const id=data.items[0].id;
  await request(undefined,"/"+id,"GET",undefined,401,"UNAUTHENTICATED");
  await request("foreign","/"+id,"GET",undefined,404,"NOT_FOUND");
  await request("outsider","/"+id,"GET",undefined,404,"NOT_FOUND");
  await request("reviewer","/"+id,"PATCH",{title:"Denied edit",category:"ACTIVITY",amountBaht:500,expectedRevision:0},403,"FORBIDDEN");
  await request("foreign","/"+id,"PATCH",{title:"Denied edit",category:"ACTIVITY",amountBaht:500,expectedRevision:0},404,"NOT_FOUND");
  for(const item of data.items.slice(1)){
   await request("owner","/"+item.id,"PATCH",{title:item.title,category:item.category,amountBaht:item.amountBaht,expectedRevision:0},409,"INVALID_STATE");
   await request("owner","/"+item.id+"/resubmit","POST",{expectedRevision:0},409,"INVALID_STATE");
   await request("reviewer","/"+item.id+"/decision","POST",{decision:"RETURNED",reason:"Terminal guard",expectedRevision:0},409,"INVALID_STATE");
  }
  samePrivate(domain(await snap()),original,"Domain preserved");mark("Anonymous/role/ownership/terminal denials preserve exact domain");
  let row=await request("reviewer","/"+id+"/decision","POST",{decision:"RETURNED",reason:"Clarify legacy details",expectedRevision:0});
  assert.equal(row.revision,1);assert.equal(row.status,"RETURNED");
  const edited={title:"Corrected legacy expense",category:"TRAVEL",amountBaht:650};
  row=await request("owner","/"+id,"PATCH",{...edited,expectedRevision:1});assert.equal(row.revision,2);assert.equal(row.status,"RETURNED");
  row=await request("owner","/"+id+"/resubmit","POST",{expectedRevision:2});assert.equal(row.revision,3);assert.equal(row.status,"SUBMITTED");
  row=await request("reviewer","/"+id+"/decision","POST",{decision:"APPROVED",expectedRevision:3});assert.equal(row.revision,4);assert.equal(row.status,"APPROVED");
  assert.equal(row.id,id);for(const k of Object.keys(edited))assert.equal(row[k],edited[k]);
  const final=domain(await snap()), before=data.snapshot.requests.find(r=>r.id===id),after=final.requests.find(r=>r.id===id);
  assert.equal(after.id,before.id);assert.equal(after.requesterId,before.requesterId);assert.equal(after.assignedReviewerId,before.assignedReviewerId);assert.equal(after.createdAt,before.createdAt);
  assert.ok(new Date(after.updatedAt)>new Date(before.updatedAt));
  samePrivate(final.users,original.users,"Private users preserved after workflow");
  assert.equal(final.requests.length,3);assert.equal(final.events.length,9);
  for(const event of original.events)assert.deepEqual(final.events.find(e=>e.id===event.id),event);
  for(const terminal of original.requests.filter(r=>r.id!==id))assert.deepEqual(final.requests.find(r=>r.id===terminal.id),terminal);
  const events=await database.requestEvent.findMany({where:{requestId:id},orderBy:[{createdAt:"asc"},{id:"asc"}]});
  assert.deepEqual(events.map(e=>e.type),["SUBMITTED","RETURNED","EDITED","RESUBMITTED","APPROVED"]);
  assert.deepEqual(events.slice(1).map(e=>e.actorId),[after.assignedReviewerId,after.requesterId,after.requesterId,after.assignedReviewerId]);
  mark("Legacy SUBMITTED completes real Return/Edit/Resubmit/Decide with same ID, 4 new events and preserved earlier history");
  data.final={};for(const item of data.items)data.final[item.id]=await request("owner","/"+item.id);
  await stop();database=new PrismaClient();await start();
  for(const actor of ["owner","reviewer"])await login(actor);
  await readAll();samePrivate(domain(await snap()),final,"Post-restart domain preserved");
  mark("New Express listener and Prisma client read exact final records/history after restart");
 }
}finally{
 await stop();
}
console.log(JSON.stringify({mode,result:"PASS",checks,requests:3,events:mode==="baseline"?5:9}));

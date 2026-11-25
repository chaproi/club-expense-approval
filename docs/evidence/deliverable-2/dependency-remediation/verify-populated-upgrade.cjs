
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto'),net=require('node:net'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const w=process.cwd(),out=process.env.F05_OUT,sha=process.env.F05_SHA;
fs.mkdirSync(out,{recursive:true});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'f05-lifecycle-')), root=path.join(temp,'checkout');
const mode='populated-upgrade';
const pwd=crypto.randomBytes(24).toString('hex'),runId=crypto.randomUUID();
const name='upgrade-'+crypto.randomBytes(6).toString('hex'), db='test_'+name.replaceAll('-','_');
const privateFile=path.join(temp,'pg.env'), reportFile=path.join(temp,'report.json');
const cleanEnv=Object.fromEntries(Object.entries(process.env).filter(([x])=>!/^(DATABASE_URL|TEST_DATABASE_URL|PG[A-Z_]*|PRISMA_[A-Z_]*|E2E_RUN_ID|PWDEBUG|NODE_DEBUG|NODE_OPTIONS|NODE_ENV|DEBUG|PORT|APP_ORIGIN|CI|DOCKER_HOST|DOCKER_CONTEXT|PLAYWRIGHT_[A-Z_]*)$/i.test(x)));
const state={testedSha:sha,mode,startedAt:new Date().toISOString(),commands:[],cleanup:{}};
let owned,volumes=[], originalDocker, failure;
function scrub(value){
 return String(value??'').replace(/\x1b\[[0-9;]*[A-Za-z]/g,'').replaceAll(pwd,'[redacted]').replaceAll(runId,'[fixture]').replaceAll(logins,'[redacted]')
   .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi,'[database-url redacted]')
   .replace(/(?:set-cookie|cookie|authorization)\s*:\s*[^\r\n]+/gi,'[header redacted]')
   .replace(/(?<![\da-f])[\da-f]{48}(?![\da-f])/gi,'[redacted]')
   .replace(/\$argon2[^\s"']+/gi,'[hash redacted]');
}
const save=(file,raw)=>fs.writeFileSync(path.join(out,file),scrub(raw),{flag:'wx'});
function cmd(id,exe,args,opts={}){
 const startedAt=new Date().toISOString(),start=performance.now();
 const r=spawnSync(exe,args,{cwd:opts.cwd??root,env:{...cleanEnv,...opts.env},encoding:'utf8',timeout:opts.timeout??120000,maxBuffer:24*1024*1024,windowsHide:true});
 const command=opts.label??[exe,...args].join(' ');
 const step={id,startedAt,command,exit:r.status,elapsedMs:Math.round(performance.now()-start),signal:r.signal,spawnError:r.error?.code??null};
 state.commands.push(step);
 save(id+'.log',startedAt+' $ '+command+'\n'+(r.stdout??'')+'\n'+(r.stderr??'')+'\n'+(r.error?.message??'')+'\n'+JSON.stringify(step)+'\n');
 console.log(id+' exit='+step.exit+' ms='+step.elapsedMs);
 return {step,stdout:(r.stdout??'').trim()};
}
function must(r){if(r.step.exit!==0||r.step.spawnError)throw Error(r.step.id+' failed; see log');return r.stdout;}
const git=(id,args,cwd=root)=>cmd(id,'git.exe',args,{cwd});
const docker=(id,args)=>cmd(id,'docker.exe',['--context','desktop-linux',...args],{cwd:w});
const npm=(id,args,env={},timeout)=>cmd(id,'cmd.exe',['/d','/c','npm.cmd '+args],{label:'npm.cmd '+args,env,timeout});
const beforeEnv=Object.fromEntries(fs.readdirSync(w).filter(n=>/^\.env(?:\.|$)/.test(n)&&n!=='.env.example').map(n=>[n,crypto.createHash('sha256').update(fs.readFileSync(path.join(w,n))).digest('hex')]));
const inventory=id=>must(docker(id,['ps','-a','--format','{{.ID}}|{{.Names}}|{{.State}}'])).split(/\r?\n/).filter(Boolean).sort();
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function free(){
 const probe=net.createServer();
 await new Promise((ok,fail)=>{probe.once('error',fail);probe.listen({host:'127.0.0.1',port:4173,exclusive:true},ok);});
 await new Promise((ok,fail)=>probe.close(e=>e?fail(e):ok()));
}

const baseline="43aa8d7472aa8852654d0d634d7239c3765c5869";
const candidate=process.env.UPGRADE_CANDIDATE;
assert.match(candidate??"",/^[0-9a-f]{40}$/);
assert.equal(sha,candidate);
const baselineRoot=path.join(temp,"sprint1");
const snapshot=path.join(temp,"private-snapshot.json");
const worker=process.env.UPGRADE_WORKER;
const logins=crypto.randomBytes(24).toString("hex");
state.baseline=baseline;state.candidate=candidate;
async function run(){
 try{
  state.originalHead=must(git("01-original-head",["rev-parse","HEAD"],w));
  state.originalStatus=must(git("01-original-status",["status","--porcelain=v1"],w));
  state.node=must(cmd("01-node","node.exe",["--version"],{cwd:w}));
  state.npm=must(cmd("01-npm","cmd.exe",["/d","/c","npm.cmd --version"],{cwd:w,label:"npm.cmd --version"}));
  originalDocker=inventory("01-containers-before");
  must(git("02-clone-candidate",["clone","--no-local","--",w,root],temp));
  must(git("02-candidate-fetch",["fetch",w,candidate]));
  must(git("02-candidate-checkout",["checkout","--detach",candidate]));
  assert.equal(must(git("02-candidate-sha",["rev-parse","HEAD"])),candidate);
  const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
  assert.equal(pkg.dependencies["@prisma/client"],"6.19.3");assert.equal(pkg.devDependencies.prisma,"6.19.3");
  assert.deepEqual(pkg.overrides,{"@prisma/config@6.19.3":{"deepmerge-ts":"8.0.0","effect":"3.22.1"}});
  state.candidateDependencies={prisma:pkg.devDependencies.prisma,client:pkg.dependencies["@prisma/client"],overrides:pkg.overrides};
  must(git("02-clone-baseline",["clone","--no-local","--",w,baselineRoot],temp));
  must(git("02-baseline-fetch",["fetch",w,baseline],baselineRoot));
  must(git("02-baseline-checkout",["checkout","--detach",baseline],baselineRoot));
  assert.equal(must(git("02-baseline-sha",["rev-parse","HEAD"],baselineRoot)),baseline);
  const npmAt=(id,args,cwd,env={})=>cmd(id,"cmd.exe",["/d","/c","npm.cmd "+args],{cwd,env,label:"npm.cmd "+args,timeout:180000});
  must(npmAt("03-baseline-ci","ci",baselineRoot));
  must(npmAt("03-baseline-build","run build",baselineRoot));
  must(npmAt("03-candidate-ci","ci",root));
  must(npmAt("03-candidate-build","run build",root));
  fs.writeFileSync(privateFile,"POSTGRES_DB="+db+"\nPOSTGRES_USER="+db+"\nPOSTGRES_PASSWORD="+pwd+"\n",{flag:"wx"});
  owned=must(docker("04-create",["run","-d","--name",name,"--label","upgrade.owner="+name,"--env-file",privateFile,"-p","127.0.0.1::5432","postgres:17-bookworm"]));
  fs.unlinkSync(privateFile);
  volumes=must(docker("04-volumes",["inspect","--format",'{{range .Mounts}}{{if eq .Type "volume"}}{{println .Name}}{{end}}{{end}}',owned])).split(/\r?\n/).filter(Boolean);
  const binding=must(docker("04-binding",["port",owned,"5432/tcp"])).match(/^127\.0\.0\.1:(\d+)$/);assert.ok(binding);
  const port=Number(binding[1]);
  const privateEnv=fs.existsSync(path.join(w,".env"))?require("node:util").parseEnv(fs.readFileSync(path.join(w,".env"),"utf8")):{};
  for(const x of [process.env.DATABASE_URL,process.env.TEST_DATABASE_URL,privateEnv.DATABASE_URL,privateEnv.TEST_DATABASE_URL].filter(Boolean)){
   const u=new URL(x);assert.notEqual(u.pathname,"/"+db);
   if(["127.0.0.1","localhost","[::1]"].includes(u.hostname))assert.notEqual(Number(u.port||5432),port);
  }
  let ready=false;
  for(let i=0;i<25;i++){const r=docker("04-readiness-"+i,["exec",owned,"pg_isready","-U",db,"-d",db]);if(r.step.exit===0){ready=true;break;}await pause(1000);}
  assert.ok(ready);
  const probe=must(docker("04-identity",["exec",owned,"psql","-U",db,"-d",db,"-At","-c","select current_database(),current_user,current_schema(),(select count(*) from information_schema.tables where table_schema='public'),current_setting('server_version');"]));
  const fields=probe.split("|");assert.equal(fields[0],db);assert.equal(fields[1],db);assert.equal(fields[2],"public");assert.equal(fields[3],"0");
  state.target={dedicatedOwnedContainer:true,loopback:true,distinctFromExisting:true,schema:"public",initialTables:0,postgres:fields[4]};
  const url="postgresql://"+db+":"+pwd+"@127.0.0.1:"+port+"/"+db+"?schema=public";
  const env={DATABASE_URL:url,TEST_DATABASE_URL:url,UPGRADE_DB:db,UPGRADE_SNAPSHOT:snapshot,UPGRADE_PASSWORD:logins};
  must(npmAt("05-baseline-migrate","run db:migrate",baselineRoot,env));
  state.baselineOutcome=JSON.parse(must(cmd("05-baseline-fixtures","node.exe",[worker,"baseline"],{cwd:baselineRoot,env,label:"node populated-upgrade-worker.mjs baseline",timeout:60000})));
  // Owned writes are stopped and baseline client disconnected before migration.
  must(npmAt("06-candidate-migrate","run db:migrate",root,env));
  state.candidateOutcome=JSON.parse(must(cmd("06-candidate-verification","node.exe",[worker,"candidate"],{env,label:"node populated-upgrade-worker.mjs candidate",timeout:60000})));
  state.migrations=must(docker("06-migrations",["exec",owned,"psql","-U",db,"-d",db,"-At","-c",'select migration_name from "_prisma_migrations" where finished_at is not null order by migration_name;'])).split(/\r?\n/);
  state.finalRows=must(docker("07-final-rows",["exec",owned,"psql","-U",db,"-d",db,"-At","-c",'select (select count(*) from "User"),(select count(*) from "ExpenseRequest"),(select count(*) from "RequestEvent");']));
  assert.equal(state.finalRows,"4|3|9");
 }catch(e){failure=e;state.error=scrub(e.stack??e);console.error(state.error);}
 finally{
  function check(name,fn){try{fn();state.cleanup[name]=true;}catch(e){state.cleanup[name]=scrub(e.message);failure??=e;}}
  if(owned){
   check("noRemainingDatabaseClients",()=>{
    const result=must(docker("08-client-absence",["exec",owned,"psql","-U",db,"-d",db,"-At","-c","select count(*) from pg_stat_activity where datname=current_database() and pid<>pg_backend_pid() and backend_type='client backend';"]));assert.equal(result,"0");
   });
   check("ownedContainerVolumeRemoved",()=>{
    assert.equal(must(docker("08-ownership",["inspect","--format",'{{index .Config.Labels "upgrade.owner"}}',owned])),name);
    must(docker("08-remove",["rm","-fv",owned]));
    assert.equal(must(docker("08-container-absence",["ps","-aq","--filter","label=upgrade.owner="+name])),"");
    const remaining=must(docker("08-volume-absence",["volume","ls","-q"])).split(/\r?\n/);assert.ok(volumes.every(v=>!remaining.includes(v)));
   });
  }
  if(originalDocker)check("originalContainersUnchanged",()=>assert.deepEqual(inventory("08-original-containers"),originalDocker));
  check("originalEnvironmentUnchanged",()=>{for(const [n,h] of Object.entries(beforeEnv))assert.equal(crypto.createHash("sha256").update(fs.readFileSync(path.join(w,n))).digest("hex"),h);});
  check("originalCheckoutPreserved",()=>{
   assert.equal(must(git("08-original-head",["rev-parse","HEAD"],w)),state.originalHead);
   assert.equal(must(git("08-original-status",["status","--porcelain=v1"],w)),state.originalStatus);
  });
  check("ownedTempRemoved",()=>{
   const resolved=fs.realpathSync(temp),parent=fs.realpathSync(os.tmpdir());assert.equal(path.dirname(resolved).toLowerCase(),parent.toLowerCase());assert.match(path.basename(resolved),/^f05-lifecycle-[A-Za-z0-9]+$/);
   fs.rmSync(resolved,{recursive:true});assert.equal(fs.existsSync(resolved),false);
  });
  state.finishedAt=new Date().toISOString();state.verdict=failure?"FAIL":"PASS";
  save("run.json",JSON.stringify(state,null,2)+"\n");
  console.log(JSON.stringify({verdict:state.verdict,baseline:state.baselineOutcome,candidate:state.candidateOutcome,cleanup:state.cleanup,error:state.error}));
  process.exitCode=failure?1:0;
 }
}
run().catch(e=>{console.error(scrub(e.stack??e));process.exitCode=1;});

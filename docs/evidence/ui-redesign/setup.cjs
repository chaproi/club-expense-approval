
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),assert=require("node:assert/strict"),{spawnSync}=require("node:child_process");
const out=process.env.UI_OUT,name="club-ui-"+crypto.randomBytes(6).toString("hex"),db="test_"+name.replaceAll("-","_"),password=crypto.randomBytes(24).toString("hex");
const cmds=[],run=(args)=>{const t=performance.now(),r=spawnSync("docker.exe",["--context","desktop-linux",...args],{encoding:"utf8",timeout:60000,windowsHide:true});cmds.push({operation:args.slice(0,2).join(" "),exit:r.status,elapsedMs:Math.round(performance.now()-t)});assert.equal(r.status,0,"Docker "+args[0]);return r.stdout.trim();};
const original=run(["ps","-a","--format","{{.ID}}|{{.Names}}|{{.State}}"]);
const secret=path.join(out,"pg.private.env");
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(secret,"POSTGRES_USER="+db+"\nPOSTGRES_DB="+db+"\nPOSTGRES_PASSWORD="+password+"\n",{flag:"wx"});
const id=run(["run","-d","--name",name,"--label","club.ui.owner="+name,"--env-file",secret,"-p","127.0.0.1::5432","postgres:17-bookworm"]);fs.unlinkSync(secret);
const binding=run(["port",id,"5432/tcp"]).match(/^127\.0\.0\.1:(\d+)$/);assert.ok(binding);
const volumes=run(["inspect","--format",'{{range .Mounts}}{{if eq .Type "volume"}}{{println .Name}}{{end}}{{end}}',id]).split(/\r?\n/).filter(Boolean);
const url="postgresql://"+db+":"+password+"@127.0.0.1:"+binding[1]+"/"+db+"?schema=public";
fs.writeFileSync(path.join(out,"runtime.private.json"),JSON.stringify({id,name,db,password,url,volumes,original}),{flag:"wx"});
console.log(JSON.stringify({ownedContainer:true,loopback:true,guardedDbPrefix:db.startsWith("test_"),commands:cmds}));

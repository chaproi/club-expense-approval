// Documentation-only assembler. Run from any working directory with Node.js 24.
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),cp=require("node:child_process");
const here=__dirname,root=path.resolve(here,"../../.."),release="cc6b04c8e98191be591a3b755d25988148523909",archive="7b62e8f95fd808acb1e59c9105c6e80bab70d358";
const hash=x=>crypto.createHash("sha256").update(x).digest("hex"),read=p=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r\n/g,"\n");
const included=[
 ["docs/sprint-1-baseline.md","baseline","Original Sprint 1 engineering baseline, full text"],
 ["docs/srs.md","srs","Current product SRS, full text"],
 ["docs/features.md","inventory","Feature inventory with historical checkpoint, full text"],
 ["docs/system-sds.md","sds","System-level SDS, full text"],
 ["docs/traceability.md","traceability","Full requirement/test traceability"],
 ["docs/contracts/f-04-return.md","f04","F-04 contract / feature SDS / API / AC / STS, full text"],
 ["docs/contracts/f-05-edit-resubmit.md","f05","F-05 v1.1 contract / feature SDS / API / AC / STS, full text"],
 ["docs/contracts/f-06-summary.md","f06","F-06 complete count checkpoint and planned totals contract, full text"],
 ["docs/contracts/f-07-two-stage.md","f07","F-07 complete planned contract, full text"],
 ["docs/contracts/f-08-status-filter.md","f08","F-08 complete planned contract, full text"],
 ["docs/labs/lab-06/retest-status-2026-11-26.md","lab6","Original Lab 6 UAT/retest reconciliation, full text"],
 ["docs/evidence/deliverable-2/postdeploy-2026-11-26/evidence.md","postdeploy","Deployment and owner-directed live record, full text"]
];
const inputs=[],record=p=>{const b=Buffer.from(read(p),"utf8");inputs.push({path:p,normalization:"UTF-8 / LF",bytes:b.length,sha256:hash(b)});};
const targetMap=new Map(included.map(([file,id])=>[file,"#appendix-"+id]));
targetMap.set("docs/sprints/d2-completion-2026-11-26.md","#completion-reference");
targetMap.set("docs/reports/deliverable-2/README.md","#packet-guide");
function rewrite(s,source){return s.replace(/(!?\[[^\]]*\])\(([^)]+)\)/g,(all,label,url)=>{
 if(/^[a-z]+:\/\//i.test(url)||url.startsWith("data:"))return all;
 const [file,fragment]=url.split("#");const resolved=file?path.posix.normalize(path.posix.join(path.posix.dirname(source),file)):source;
 const internal=targetMap.get(resolved);
 if(internal)return label+"("+internal+")";
 if(!fs.existsSync(path.join(root,resolved)))throw new Error("Missing source link: "+resolved);
 return label+"(https://github.com/chaproi/club-expense-approval/blob/"+archive+"/"+resolved+(fragment?"#"+fragment:"")+")";
});}
const completionPath="docs/sprints/d2-completion-2026-11-26.md",completion=read(completionPath);
record(completionPath);record("docs/reports/deliverable-2/report-source.md");
function section(start,end){const a=completion.indexOf(start),b=end?completion.indexOf(end,a+start.length):completion.length;if(a<0||b<0)throw new Error("Missing completion section");return rewrite(completion.slice(a,b).trim(),completionPath);}
let report=read("docs/reports/deliverable-2/report-source.md")
 .replace("## Reading this packet",'<a id="packet-guide"></a>\n\n## Reading this packet')
 .replace("{{RUBRIC}}",section("## Actual Project Deliverable 2 rubric","## Per-feature technical completion"))
 .replace("{{COMPLETION}}",'<a id="completion-reference"></a>\n\n'+section("## Per-feature technical completion","## Current release and report checklist"))
 .replace("{{PLAN}}",section("## Current release and report checklist"));
const excerpts=[];
for(const [file,start,end,token]of [
 ["server/test/return-resubmit-summary.test.ts",'test("T-F05-05: stale edits and repeated concurrent resubmits','test("T-F05-05: edit-versus-resubmit',"{{API_EXCERPT}}"],
 ["server/test/return-resubmit-summary.test.ts",'test("T-F05-03: owner/role/state/Origin restrictions','test("T-F05-05: stale edits',"{{ACCESS_EXCERPT}}"],
 ["client/test/f05-draft-recovery.spec.ts","async function expectRecoveryCleared",'test("BF-01 AC-F05-08/09 reverting',"{{BROWSER_EXCERPT}}"]
]){
 const actual=cp.execFileSync("git",["show",release+":"+file],{cwd:root,encoding:"utf8"}).replace(/\r\n/g,"\n");
 if(read(file)!==actual)throw new Error("Released test excerpt source differs");
 const a=actual.indexOf(start),b=actual.indexOf(end,a+start.length);if(a<0||b<0)throw new Error("Excerpt marker missing");
 const code=actual.slice(a,b).trimEnd(),from=actual.slice(0,a).split("\n").length,to=from+code.split("\n").length-1;
 excerpts.push({path:file,release,fromLine:from,toLine:to,normalizedLfSha256:hash(code)});
 report=report.replace(token,"Released source lines "+from+"–"+to+".\n\n~~~typescript\n"+code+"\n~~~");
}
const logs=[];
for(const [file,token]of [
 ["docs/reports/deliverable-2/ci-command-excerpts.log","{{CI_OUTPUT}}"],
 ["docs/evidence/deliverable-2/postdeploy-2026-11-26/deploy-excerpts.log","{{DEPLOY_OUTPUT}}"]
]){
 record(file);const raw=read(file);logs.push({path:file,normalizedLfSha256:hash(raw),qualification:"Verbatim retained lines; terminal ANSI color escapes omitted for PDF display only."});
 report=report.replace(token,"~~~text\n"+raw.replace(/\x1b\[[0-9;]*m/g,"").trimEnd()+"\n~~~");
}
const reviewPath="docs/reports/deliverable-2/review-chains-2026-11-26.json";
record(reviewPath);const metadata=JSON.parse(read(reviewPath));
function chain(n){const p=metadata.pullRequests.find(p=>p.number===n);
 return ["| Event | Verified metadata (timestamps UTC) |","|---|---|",
 `| Author / branch | ${p.author}; ${p.head} → ${p.base} |`,
 `| Opened | ${p.created} |`,
 ...p.reviews.map(r=>`| ${r.state} by ${r.author} | ${r.submitted}; reviewed ${r.commit}; [submitted review](${r.url}) |`),
 `| Staging merge | ${p.merged}; ${p.mergeSha} |`,
 "| Main release | PR48 staging/sprint-2 → main; author chaproi; approved by thananun-7203; merged 2026-11-26T08:51:46Z as "+release+" |"].join("\n");}
report=report.replace("{{CHAIN43_METADATA}}",chain(43)).replace("{{CHAIN45_METADATA}}",chain(45));
for(const [file,id,title]of included){
 record(file);const original=read(file);
 report+='\n\n---\n\n<a id="appendix-'+id+'"></a>\n\n## Appendix — '+title+'\n\nSource: '+file+'. Complete text follows; original language/IDs and historical records retained.\n\n'+rewrite(original,file).trimEnd()+"\n";
}
if(/\{\{[A-Z_]+\}\}/.test(report))throw new Error("Unexpanded report token");
fs.mkdirSync(path.join(here,"assets"),{recursive:true});const assets=[];
for(const name of ["deployed-login-1440.png","deployed-owner-complete-history.png","deployed-real-conflict-draft.png","deployed-reviewer-768.png","deployed-owner-mobile.png"]){
 const source="docs/evidence/deliverable-2/postdeploy-2026-11-26/screenshots/"+name,b=fs.readFileSync(path.join(root,source));
 fs.writeFileSync(path.join(here,"assets",name),b);assets.push({source,path:"assets/"+name,bytes:b.length,sha256:hash(b)});
}
fs.writeFileSync(path.join(here,"report.md"),report.trimEnd()+"\n");
const manifest={release,documentationParent:archive,preparationDate:"2026-11-26 Asia/Bangkok",qualification:"Documentation assembly only; no application execution or owner acceptance. Input digests identify the current documentation snapshot before publication.",fullDocuments:included.map(([file,id])=>({path:file,anchor:"appendix-"+id})),inputs,testExcerpts:excerpts,verbatimLogs:logs,reviewMetadata:{path:reviewPath,readDate:metadata.readDate},assets,report:{path:"report.md",sha256:hash(fs.readFileSync(path.join(here,"report.md")))}};
if(fs.existsSync(path.join(here,"pdf-validation.json"))){
 const q=JSON.parse(fs.readFileSync(path.join(here,"pdf-validation.json"),"utf8"));
 if(q.reportSha256===manifest.report.sha256)manifest.pdf={path:q.pdf,sha256:q.pdfSha256,pages:q.pages,navigationPages:q.navigationPages,validation:"pdf-validation.json"};
}
fs.writeFileSync(path.join(here,"manifest.json"),JSON.stringify(manifest,null,2)+"\n");
console.log(JSON.stringify({fullDocuments:included.length,sourceInputs:inputs.length,testExcerpts:excerpts.length,localAssets:assets.length,reportBytes:fs.statSync(path.join(here,"report.md")).size}));

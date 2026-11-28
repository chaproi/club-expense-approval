const fs=require('fs'),p=require('path'),crypto=require('crypto');
const [root,qa]=process.argv.slice(2),out=p.join(root,'docs/labs/lab-07/postdeploy-2026-11-28');fs.mkdirSync(out,{recursive:true});
const clean=s=>String(s).replace(/^\ufeff/,'').replaceAll('\r\n','\n').replace(/\x1b\[[0-9;]*[A-Za-z]/g,'').replace(/[ \t]+$/gm,'').replace(/postgres(?:ql)?:\/\/[^\s"']+/gi,'[database-url redacted]').replace(/club_session=[^\s;]+/g,'[session redacted]');
for(const name of ['run.json','jobs.json','metrics-source.json','review-chain.json','public-checks.json'])fs.writeFileSync(p.join(out,name),clean(fs.readFileSync(p.join(qa,name),'utf8')));
for(const name of ['public-login-desktop.png','public-login-mobile.png'])fs.copyFileSync(p.join(qa,name),p.join(out,name));
const ci=p.join(qa,'logs','ci _ verify'),deploy=p.join(qa,'logs','deploy');
const read=(folder,name)=>clean(fs.readFileSync(p.join(folder,name),'utf8'));
const unit=read(ci,'8_Run unit and API tests.txt'),browser=read(ci,'11_Run Playwright tests.txt'),checkout=read(ci,'3_Check out repository.txt');
const tests={release:'c259afe45eb49311c1f7bb9e166c4443041b9b82',run:46120371207,job:140903331799,command:'npm test',collected:Number(unit.match(/ℹ tests (\d+)/)[1]),executed:Number(unit.match(/ℹ tests (\d+)/)[1]),passed:Number(unit.match(/ℹ pass (\d+)/)[1]),failed:Number(unit.match(/ℹ fail (\d+)/)[1]),skipped:Number(unit.match(/ℹ skipped (\d+)/)[1]),cancelled:Number(unit.match(/ℹ cancelled (\d+)/)[1]),runnerMs:Number(unit.match(/ℹ duration_ms ([\d.]+)/)[1]),browser:{command:'npm run test:e2e',passed:Number(browser.match(/(\d+) passed \(/)[1]),failed:0,skipped:0,reportSeconds:Number(browser.match(/passed \(([\d.]+)s\)/)[1])}};
if(tests.passed!==184||tests.browser.passed!==23)throw Error('Unexpected actual-main counts');
fs.writeFileSync(p.join(out,'exact-main-results.json'),JSON.stringify(tests,null,2)+'\n');
fs.writeFileSync(p.join(out,'exact-main-unit-output.log'),unit);
fs.writeFileSync(p.join(out,'exact-main-browser-output.log'),browser);
const snippets=[];
for(const [id,folder,name,pattern] of [
 ['MAIN-CHECKOUT',ci,'3_Check out repository.txt',/HEAD is now|--format=%H| c259afe[0-9a-f]*$/],
 ['MAIN-MIGRATIONS',ci,'7_Apply database migrations.txt',/migration|202611|successfully/],
 ['MAIN-UNIT',ci,'8_Run unit and API tests.txt',/ℹ (tests|pass|fail|skipped|cancelled|duration_ms)/],
 ['MAIN-BROWSER',ci,'11_Run Playwright tests.txt',/Running \d+ tests|\d+ passed \(/],
 ['MAIN-BUILD',ci,'9_Build application.txt',/tsc --noEmit|vite v|built in/],
 ['DEPLOY-PUSH',deploy,'7_Build and push the image.txt',/digest: sha256/],
 ['DEPLOY-MIGRATION',deploy,'8_Run the required database migration.txt',/Creating execution|Running execution|Execution \[|npm run db:migrate|--wait/],
 ['DEPLOY-SERVICE',deploy,'9_Deploy to Cloud Run.txt',/revision \[|Service URL:|IMAGE: /],
 ]){
 snippets.push('## '+id+' | actual original log excerpts\n'+read(folder,name).split('\n').filter(l=>pattern.test(l)).join('\n'));
}
fs.writeFileSync(p.join(out,'command-excerpts.log'),snippets.join('\n\n')+'\n');
const push=read(deploy,'7_Build and push the image.txt'),migration=read(deploy,'8_Run the required database migration.txt'),service=read(deploy,'9_Deploy to Cloud Run.txt');
const identity={release:tests.release,run:'https://github.com/chaproi/club-expense-approval/actions/runs/46120371207',outcome:'success',evidenceSource:'GitHub deployment logs;not direct cloud reads',imageTag:'asia-southeast1-docker.pkg.dev/cpe-se-course-2026/s981b09c9/s981b09c9:'+tests.release,pushedRegistryDigest:push.match(/digest: (sha256:[a-f0-9]+)/)[1],migrationJob:'s981b09c9-migrate',execution:migration.match(/Execution \[([^\]]+)\] has successfully completed/)[1],migrationCompletionUtc:'2026-11-28T07:19:49.7350443Z',serviceDeployStepStartedUtc:'2026-11-28T07:19:49.8765835Z',revision:service.match(/revision \[([^\]]+)\]/)[1],reportedTrafficPercent:100,url:'https://s981b09c9-4d7hbszvwq-as.a.run.app',reportedServiceUrl:'https://s981b09c9-670075229477.asia-southeast1.run.app',directRevisionDigest:null,directCloudSqlCheck:null,categoryMigrationEvidence:'Exact-main CI reports all4 migrations including20261127000000_category_amount_limits;deployed image tagged actual main,job updated to same image,execution successful. Runtime job Prisma stdout/applied-migration rows not directly available;no direct SQL claim.'};
fs.writeFileSync(p.join(out,'deployment-identity.json'),JSON.stringify(identity,null,2)+'\n');
console.log(JSON.stringify({output:out,tests,identity},null,2));

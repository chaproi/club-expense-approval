// Documentation-only local HTML printing; uses an explicitly supplied existing Playwright installation.
const {pathToFileURL}=require('node:url');
const [html,pdf,playwrightPath]=process.argv.slice(2);
if(!html||!pdf||!playwrightPath)throw new Error('Usage: node render-pdf.cjs HTML PDF PLAYWRIGHT_MODULE');
(async()=>{
 const {chromium}=require(playwrightPath),browser=await chromium.launch({headless:true});
 try {
  const page=await browser.newPage();
  await page.goto(pathToFileURL(html).href,{waitUntil:'load'});
  await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const overflow=await page.evaluate(()=>[...document.querySelectorAll('table,pre,img')].filter(x=>x.scrollWidth>x.clientWidth+2).map(x=>({tag:x.tagName,width:x.clientWidth,scroll:x.scrollWidth})));
  if(overflow.length)throw new Error('HTML overflow: '+JSON.stringify(overflow));
  await page.pdf({path:pdf,format:'A4',printBackground:true,preferCSSPageSize:true,tagged:true,outline:true,displayHeaderFooter:true,
   headerTemplate:'<div style="font-family:Arial;font-size:8px;color:#52606a;width:100%;margin:0 15mm">TH-038 / Club Expense Approval / Deliverable 2</div>',
   footerTemplate:'<div style="font-family:Arial;font-size:8px;color:#52606a;width:100%;margin:0 15mm;display:flex;justify-content:space-between"><span>Released main cc6b04c | Owner acceptance/submission not recorded</span><span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'});
  console.log(JSON.stringify({browser:browser.version(),localHtmlOnly:true,htmlOverflowElements:overflow.length}));
 } finally {await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});

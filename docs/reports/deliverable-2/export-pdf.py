"""Build/inspect a documentation PDF; never starts an application or connects to a database."""
import argparse, base64, hashlib, html, io, json, math, os, re, subprocess, sys
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('--python-tools',required=True,help='Isolated markdown-it-py / PyMuPDF / fonttools directory')
parser.add_argument('--playwright',required=True,help='Existing Playwright module directory; no app dependency changes')
parser.add_argument('--qa-dir',required=True,help='Owned external directory for intermediate HTML and page PNGs')
args=parser.parse_args();sys.path.insert(0,args.python_tools)
import pymupdf as fitz
from markdown_it import MarkdownIt
from fontTools.ttLib import TTFont
from PIL import Image

here=Path(__file__).resolve().parent
qa=Path(args.qa_dir).resolve();qa.mkdir(parents=True,exist_ok=True)
out=here/'output'/'pdf';out.mkdir(parents=True,exist_ok=True)
pdf=out/'club-expense-approval-d2.pdf'
source=(here/'report.md').read_text(encoding='utf-8')
fontdir=Path(os.environ.get('WINDIR','C:/Windows'))/'Fonts'
fonts={'normal':fontdir/'tahoma.ttf','bold':fontdir/'tahomabd.ttf','code':fontdir/'consola.ttf'}
for p in fonts.values():
 if not p.exists():raise RuntimeError('Required document font unavailable: '+p.name)
md=MarkdownIt('commonmark',{'html':True,'typographer':False}).enable('table')
body=md.render(source)
body=body.replace('<pre><code class="language-typescript">async function expectRecoveryCleared','<pre class="additional"><code class="language-typescript">async function expectRecoveryCleared',1)
for letter in 'ABCDE':
 body=body.replace('<h1>'+letter+'. ',f'<h1 class="chapter" id="rubric-{letter.lower()}">'+letter+'. ',1)
body=body.replace('<h1>Full source appendices</h1>','<h1 class="chapter">Full source appendices</h1>')
body=body.replace('<h2>Appendix ', '<h2 class="appendix chapter">Appendix ')
body=re.sub(r'<hr\s*/?>\s*<p><a id="(appendix-[^\"]+)"></a></p>\s*<h2 class="appendix chapter">',r'<h2 class="appendix chapter" id="\1">',body)
def image(match):
 p=(here/match.group(1)).resolve()
 if not p.is_relative_to(here):raise RuntimeError('Unexpected image target')
 return 'src="data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode()+'" data-capture="'+p.name+'"'
body=re.sub(r'src="(assets/[^\"]+)"',image,body)
def crop_tall(match):
 raw=base64.b64decode(match.group(1));im=Image.open(io.BytesIO(raw));w,h=im.size
 if h<=w*1.9:return '<figure>'+match.group(0)+'<figcaption>Retained deployed capture; original image bytes and capture provenance remain in the source manifest.</figcaption></figure>'
 name=re.search(r'data-capture="([^\"]+)"',match.group(0)).group(1)
 # Preserve the original capture in assets; print relevant header/detail excerpts,
 # omitting only the long privacy-masked request-list region between them.
 ranges={'deployed-reviewer-768.png':[(0,700),(1420,h)],'deployed-owner-mobile.png':[(0,800),(1280,h)]}[name]
 count=len(ranges);parts=[]
 for n,(top,bottom) in enumerate(ranges):
  buf=io.BytesIO();im.crop((0,top,w,bottom)).save(buf,format='PNG')
  parts.append('<figure><img src="data:image/png;base64,'+base64.b64encode(buf.getvalue()).decode()+'"><figcaption>Retained capture, display excerpt '+str(n+1)+'/'+str(count)+'; original pixel rows '+str(top)+'–'+str(bottom)+'. The intervening privacy-masked list region is omitted from print; the complete original PNG remains in packet assets. No new capture or state change.</figcaption></figure>')
 return ''.join(parts)
body=re.sub(r'<img src="data:image/png;base64,([^\"]+)"[^>]*>',crop_tall,body)
body=re.sub(r'<p>((?:<figure>.*?</figure>)+)</p>',r'\1',body,flags=re.S)
css='\n'.join('@font-face{font-family:'+('Mono' if k=='code' else 'Body')+';font-style:normal;font-weight:'+('700' if k=='bold' else '400')+';src:url(data:font/ttf;base64,'+base64.b64encode(p.read_bytes()).decode()+') format("truetype");}' for k,p in fonts.items())
css+='''
@page {size:A4;margin:17mm 15mm 18mm;}
*{box-sizing:border-box}html{font-family:Body,Tahoma,sans-serif;color:#24323e;font-size:10pt;line-height:1.44}
body{margin:0}p{margin:0 0 8pt;overflow-wrap:anywhere}a{color:#17647d;text-decoration:none;overflow-wrap:anywhere}
h1,h2,h3,h4{font-weight:700;color:#153a47;line-height:1.25;break-after:avoid;overflow-wrap:anywhere}
h1{font-size:19pt;margin:16pt 0 10pt}h2{font-size:14pt;margin:16pt 0 8pt}h3{font-size:11pt;margin:12pt 0 6pt}h4{font-size:10pt}
.chapter{break-before:page;margin-top:0;padding-top:4pt;border-top:4pt solid #2b7b80}
ul,ol{padding-left:18pt;margin:5pt 0 10pt}li{margin-bottom:5pt;overflow-wrap:anywhere}
table{width:100%;table-layout:fixed;border-collapse:collapse;margin:10pt 0 14pt;font-size:8.4pt;line-height:1.42}
thead{display:table-header-group}tr{break-inside:avoid}th,td{padding:6pt;border:0.5pt solid #bacad0;vertical-align:top;overflow-wrap:anywhere}
th{background:#e7f1f2;font-weight:700;color:#153a47}tbody tr:nth-child(even){background:#f6f8fa}
td p,th p{margin:0}pre{white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-all;font-family:Mono,monospace;font-size:8pt;line-height:1.4;padding:9pt;background:#f2f5f7;border-left:3pt solid #4b7a85;break-inside:auto}
code{font-family:Mono,Body,monospace;font-size:.92em;overflow-wrap:anywhere}pre code{font-size:inherit}
pre.additional{font-size:7.5pt}
img{display:block;max-width:100%;width:auto;max-height:206mm;object-fit:contain;margin:8pt auto;break-inside:avoid}
figure{margin:10pt 0;break-inside:avoid}figcaption{font-size:8pt;color:#52606a;margin:5pt 0 10pt}
hr{border:0;border-top:.5pt solid #bfcfd5;margin:14pt 0}blockquote{margin:8pt 0;padding-left:10pt;border-left:3pt solid #b5cbd0}
.navigation{padding:12pt 15pt;border:1pt solid #94b9be;background:#edf5f5;margin:12pt 0 18pt;break-inside:avoid}
.navigation h2{margin-top:0}.navigation table{font-size:10pt;margin:0}.navigation td{border:0;padding:4pt}
.navigation td:first-child{width:16%}.navigation td:last-child{width:16%;text-align:right}.navigation .note{font-size:8pt;margin-top:8pt}
'''
titles={'A':'Sprint 1 continuity and change status (5)','B':'Sprint 2 contracts and working increment (25)','C':'Sprint 3 contracts and working progress (15)','D':'Updated requirements and test traceability (10)','E':'Integrated release candidate (15)'}
def make_html(pages):
 rows=''.join(f'<tr><td><a href="#rubric-{k.lower()}">Area {k}</a></td><td>{v}</td><td>p. {pages.get(k,"00")}</td></tr>' for k,v in titles.items())
 nav='<section class="navigation"><h2>A–E navigation / actual PDF pages</h2><table>'+rows+'</table><p class="note">Weights are the supplied rubric weights, not marks awarded. Page references are computed from this PDF. Full source appendices follow Area E.</p></section>'
 # Cover identification precedes navigation; all main chapter references are generated, not estimated.
 marker='<h2>Reading this packet</h2>'
 content=body.replace(marker,nav+marker,1)
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>TH-038 Deliverable 2</title><style>'+css+'</style></head><body>'+content+'</body></html>'
def print_pdf(pages):
 h=qa/'report-print.html';h.write_text(make_html(pages),encoding='utf-8')
 result=subprocess.run(['node',str(here/'render-pdf.cjs'),str(h),str(pdf),str(Path(args.playwright).resolve())],capture_output=True,text=True,encoding='utf-8',check=True)
 print(result.stdout.strip());return json.loads(result.stdout.strip())
def locate(doc):
 pages={}
 for k,v in titles.items():
  hits=[n+1 for n,p in enumerate(doc) if p.search_for(k+'. '+v.split(' (')[0])]
  if len(hits)!=1:raise RuntimeError('Nonunique rubric heading: '+k+' '+str(hits))
  pages[k]=hits[0]
 return pages
print_pdf({})
with fitz.open(pdf) as doc:nav=locate(doc)
runtime=print_pdf(nav)
with fitz.open(pdf) as doc:
 if locate(doc)!=nav:raise RuntimeError('Navigation page references shifted')
 font_records={};issues=[];images=[];page_info=[]
 for i,page in enumerate(doc):
  text=page.get_text();rect=page.rect
  if not any(s['size']>=7 and s['text'].strip() for b in page.get_text('dict')['blocks'] if 'lines' in b for l in b['lines'] for s in l['spans']):issues.append({'page':i+1,'problem':'blank body page'})
  if '\ufffd' in text:issues.append({'page':i+1,'problem':'replacement character'})
  for b in page.get_text('dict')['blocks']:
   if 'lines' not in b:continue
   for line in b['lines']:
    for s in line['spans']:
     x0,y0,x1,y1=s['bbox']
     if x0<-1 or x1>rect.width+1 or y0<-1 or y1>rect.height+1:issues.append({'page':i+1,'problem':'text outside page'})
     if '\x00' in s['text']:issues.append({'page':i+1,'problem':'null glyph'})
  for f in page.get_fonts(full=True):
   if f[0] not in font_records:
    name,ext,typ,data=doc.extract_font(f[0]);font_records[f[0]]={'name':name,'format':ext,'type':typ,'embeddedBytes':len(data)}
  for span in page.get_texttrace():
   for char in span['chars']:
    if char[1]==0 and char[0] not in (0,32):issues.append({'page':i+1,'problem':'missing glyph','unicode':char[0]})
  pix=page.get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False)
  dest=qa/f'page-{i+1:03d}.png';pix.save(dest);images.append(str(dest))
  page_info.append({'page':i+1,'textCharacters':len(text),'widthPt':rect.width,'heightPt':rect.height,'raster':dest.name,'rasterSha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
 if any(f['embeddedBytes']==0 for f in font_records.values()):issues.append({'problem':'font not embedded'})
 # A Thai cover probe and complete screenshot inventory complement visual inspection.
 cover=doc[0].get_text()
 if '67070507215' not in cover or not re.search('[\u0e00-\u0e7f]',cover):issues.append({'problem':'cover identity text absent'})
 record={'date':'2026-11-26 Asia/Bangkok','release':'cc6b04c8e98191be591a3b755d25988148523909','documentParent':'7b0194d24a3a7fcac6e52589bd0a176d8ff7aa5f','pdf':str(pdf.relative_to(here)).replace('\\','/'),'pdfSha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'reportSha256':hashlib.sha256((here/'report.md').read_bytes()).hexdigest(),'pages':len(doc),'navigationPages':nav,'runtime':runtime,'tools':{'PyMuPDF':fitz.version[0],'markdown-it-py':__import__('markdown_it').__version__},'fonts':list(font_records.values()),'sourceFonts':'Locally installed Windows Tahoma regular/bold and Consolas; PDF embeds subsets, raw font files are not redistributed.','pageChecks':page_info,'structuralIssues':issues,'qualification':'Structural checks and per-page PNG rendering; visual inspection is recorded separately. No application execution or owner acceptance.'}
 (here/'pdf-validation.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 manifest=json.loads((here/'manifest.json').read_text(encoding='utf-8'))
 manifest['pdf']={'path':record['pdf'],'sha256':record['pdfSha256'],'pages':record['pages'],'navigationPages':nav,'validation':'pdf-validation.json'}
 (here/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'pdf':str(pdf),'pages':len(doc),'navigation':nav,'fonts':list(font_records.values()),'issues':issues},ensure_ascii=False))
 if issues:raise RuntimeError('PDF structural checks failed')

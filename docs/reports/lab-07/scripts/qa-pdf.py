import sys,pathlib,json,hashlib,re
sys.path.insert(0,sys.argv[3])
import pymupdf as fitz
root=pathlib.Path(sys.argv[1]);out=pathlib.Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
packet=root/'docs/reports/lab-07';pdf=packet/'output/pdf/club-expense-approval-lab7.pdf';pages=json.loads((packet/'pages.json').read_text(encoding='utf8'))
issues=[];fonts={};records=[]
with fitz.open(pdf) as d:
 if len(d)!=len(pages):issues.append({'problem':'PDF page count differs','actual':len(d),'expected':len(pages)})
 for n,page in enumerate(d):
  text=page.get_text()
  if not text.strip():issues.append({'page':n+1,'problem':'empty page'})
  if '\ufffd' in text:issues.append({'page':n+1,'problem':'replacement glyph'})
  for b in page.get_text('dict')['blocks']:
   for line in b.get('lines',[]):
    for s in line['spans']:
     if s['bbox'][0]<0 or s['bbox'][2]>page.rect.width+1 or s['bbox'][1]<0 or s['bbox'][3]>page.rect.height+1:issues.append({'page':n+1,'problem':'outside page'})
  for f in page.get_fonts(full=True):
   if f[0] not in fonts:
    name,ext,kind,data=d.extract_font(f[0]);fonts[f[0]]={'name':name,'format':ext,'embeddedBytes':len(data)}
  for span in page.get_texttrace():
   for c in span['chars']:
    if c[1]==0 and c[0] not in (0,32):issues.append({'page':n+1,'problem':'missing glyph','unicode':c[0]})
  image=out/f'page-{n+1:02}.png';page.get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False).save(image)
  records.append({'page':n+1,'textCharacters':len(text),'raster':image.name,'sha256':hashlib.sha256(image.read_bytes()).hexdigest()})
 cover=d[0].get_text()
 if '67070507215' not in cover or 'นายสิริกร' not in cover:issues.append({'problem':'Thai identity extraction absent'})
 if any(x['embeddedBytes']==0 for x in fonts.values()):issues.append({'problem':'nonembedded font'})
 links=[l for page in d for l in page.get_links()]
 record={'date':'2026-11-28 Asia/Bangkok','release':'c259afe45eb49311c1f7bb9e166c4443041b9b82','pages':len(d),'pdfSha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'sourceSha256':hashlib.sha256((packet/'report.md').read_bytes()).hexdigest(),'fonts':list(fonts.values()),'pageChecks':records,'links':len(links),'structuralIssues':issues,'visualInspection':'Pending actual per-page review; not established by structural checks'}
 (packet/'pdf-qa.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print(json.dumps({k:v for k,v in record.items() if k not in ('pageChecks',)},ensure_ascii=False))
 if issues:raise SystemExit(1)

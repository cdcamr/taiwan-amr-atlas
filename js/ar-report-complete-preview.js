(()=>{'use strict';
const domainLock=document.currentScript?.dataset?.domain==='mdro'?'mdro':'important';
const prefix=domainLock==='mdro'?'mdr-':'imp-';
// Domain-locked component: load twice with data-domain="important" and data-domain="mdro".
const main=document.querySelector('main');if(!main)return;
const section=document.createElement('section');section.id=domainLock==='mdro'?'arMdroSection':'arImportantSection';section.className='panel ar-full-preview';
section.innerHTML='<div class="ap-head"><div><div class="eyebrow">2024 TAIWAN AMR ANNUAL REPORT · INTERACTIVE PREVIEW</div><h2>重要菌種抗藥性與多重抗藥菌監測</h2><p>依正式年報圖型製作完整互動示意；模擬值不代表官方監測結果，正式資料匯入後可逐筆替換。</p></div><div class="ap-mode">完整示意版 · 非正式數值</div></div>'+
'<div class="ap-controls-top" role="group" aria-label="選擇分析類型"><button type="button" data-ap-domain="important" aria-pressed="true">重要菌種抗藥性</button><button type="button" data-ap-domain="mdro" aria-pressed="false">多重抗藥菌（MDRO）趨勢</button></div>'+
'<div class="ap-filter">'+
'<label>菌種／MDRO<select id="apOrganism" aria-label="選擇菌種或多重抗藥菌"></select></label>'+
'<label id="apOriginWrap" hidden>感染來源<select id="apOrigin"><option value="CO+HO">CO＋HO 合併</option><option value="CO">社區相關感染（CO）</option><option value="HO">醫療相關感染（HO）</option></select></label>'+
'<label id="apSpecimenWrap">檢體別<select id="apSpecimen"><option value="all">年報完整分圖</option></select></label>'+
'<label id="apDrugWrap">抗生素<select id="apDrug"><option value="all">全部抗生素</option></select></label>'+
'<label id="apYearWrap" hidden>年度重點<select id="apYear"><option value="all">108–113 年全期間</option><option value="2019">108 年</option><option value="2020">109 年</option><option value="2021">110 年</option><option value="2022">111 年</option><option value="2023">112 年</option><option value="2024">113 年</option></select></label>'+
'</div>'+
'<details class="ap-pdf-check"><summary>與年報原圖對照（選用本機 PDF）</summary><p>選取 2024 年臺灣抗生素抗藥性監視年報 PDF，即可依目前菌種及感染來源定位原圖。PDF 僅在本機瀏覽器開啟，不會上傳網站。</p><div class="ap-pdf-controls"><input type="file" id="apPdfFile" accept=".pdf,application/pdf" aria-label="選取 2024 年報 PDF"><button type="button" id="apPdfOpen" disabled>在新分頁檢視原圖</button></div><p id="apPdfState" role="status" aria-live="polite">尚未選取年報 PDF</p><iframe id="apPdfView" title="本機 2024 年報原圖預覽" hidden loading="lazy"></iframe></details>'+'<div class="ap-warning" role="note"><strong>資料辨識：</strong><span class="ap-key"><i class="ap-sample"></i>示意估計值</span><span class="ap-key"><i class="ap-narrative"></i>年報文字明載／經核對值</span><span class="ap-key"><b>＊</b> 年報未發布（檢測株數不足等）</span><p>本頁主要用來試看完整圖形及操作流程。示意估計值並非年報圖形的精確數位化結果，不得引用作為正式統計、信賴區間或政策績效。</p></div>'+
'<div class="ap-toolbar"><button type="button" id="apTableToggle" aria-expanded="false">查看資料表</button><button type="button" id="apCsvDownload">下載目前圖表 CSV</button><button type="button" id="apCopyLink">複製篩選連結</button><span id="apStatus" role="status" aria-live="polite">圖表載入中…</span></div>'+
'<div id="apFigures"></div><div id="apSourceDetails" aria-live="polite" class="ap-info">將滑鼠移至色塊或資料點，或以 Tab／Enter 查看數值、資料品質與年報圖號。</div>'+
'<div id="apTableWrap" hidden class="ap-table-wrap"></div><div class="ap-bottom"><strong>資料來源與限制</strong><p>圖型、分圖順序及配色參考《2024 年臺灣抗生素抗藥性監視年報》第三、四章。此處缺少正式數值的序列，先由示意模型產生，不能視為原報告測量結果。圖上不重建尚未取得的誤差線與 95% CI。</p></div>';
section.querySelector('.ap-head h2').textContent=domainLock==='mdro'?'多重抗藥菌（MDRO）歷年趨勢':'重要菌種抗藥性百分比';
section.querySelector('.ap-head p').textContent=domainLock==='mdro'?'依年報第 4 章呈現九類多重抗藥菌，分別切換 CO＋HO、CO 或 HO 的菌株數堆疊圖及抗藥率折線圖。':'依年報第 3 章呈現十二類重要菌種，（A）CO＋HO、（B）CO、（C）HO 及適用檢體分圖。';
section.querySelector('.ap-controls-top')?.remove();
section.querySelectorAll('[id]').forEach(el=>el.id=prefix+el.id);
const anchor=document.getElementById('reportFigure21')||document.getElementById('chartTitle')?.closest('.panel');
if(domainLock==='mdro'){
 const previous=document.getElementById('arImportantSection');
 if(previous)previous.after(section);else if(anchor)anchor.after(section);else main.append(section);
}else if(anchor)anchor.after(section);else main.append(section);
const $=id=>document.getElementById(prefix+id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\u0027':'&#39;'}[c]));
const mdros=[['CRAB','CRAB'],['CRE','CRE'],['CR_ECOLI','CR E. coli'],['CRKP','CRKP'],['CRPA','CRPA'],['MRSA','MRSA'],['VRE','VRE'],['VR_EFAECALIS','VR E. faecalis'],['VR_EFAECIUM','VR E. faecium']];
const levels=['medical_center','regional_hospital','district_hospital'], allLevels=[...levels,'national'];
const label={medical_center:'醫學中心',regional_hospital:'區域醫院',district_hospital:'地區醫院',national:'全國','CO+HO':'社區與醫療（CO＋HO）相關感染',CO:'社區相關感染（CO）',HO:'醫療相關感染（HO）',all:'全部檢體',blood:'血液檢體',urine:'尿液檢體',stool:'糞便檢體',wound:'膿或傷口檢體'};
const lineColors={medical_center:'#4674b9',regional_hospital:'#df783e',district_hospital:'#979797',national:'#efb33b'};
const stackColors={medical_center:['#95bcdc','#3f5994'],regional_hospital:['#ecaa8b','#b75d34'],district_hospital:['#aea9ab','#777578']};
const refQuery=new URLSearchParams(location.search),paramBase=domainLock==='mdro'?'mdro':'imp',state={
 domain:domainLock,
 organism:refQuery.get(paramBase+'Indicator')||(refQuery.get('previewDomain')===domainLock?refQuery.get('previewIndicator'):'')||'',
 origin:refQuery.get('mdroOnset')||'CO+HO',
 specimen:refQuery.get('impSpecimen')||'all-panels',
 drug:refQuery.get('impDrug')||'all',
 year:refQuery.get('mdroYear')||'all'
};
let data=[],species=[],currentRows=[],displayCharts=[],officialCount=0,pdfUrl=null;
const fmtn=v=>Math.round(+v||0).toLocaleString('zh-TW');
const fmtr=r=>r.precision==='not_reported_lt20'?'＊ 未呈現':r.domain==='mdro'&&r.component!=='R'?fmtn(r.isolates)+' 株':Number(r.resistance_pct).toFixed(1)+'%';
const quality=r=>r.precision==='official_verified'?'已核對正式原始資料':r.precision==='narrative_exact'?'年報文字明載值':r.precision==='not_reported_lt20'?'年報未列示／檢測株數不足':'示意估計值（非官方）';
const metadata=r=>[r.organism,r.year+'（民國'+(+r.year-1911)+'）',label[r.onset]||r.onset,label[r.specimen]||r.specimen,label[r.hospital_level]||r.hospital_level,r.antibiotic||r.component,fmtr(r),quality(r),'年報圖 '+r.source_figure+'／印刷第 '+r.printed_page+' 頁'].filter(Boolean).join(' · ');
function parseCSV(text){
 const lines=text.trim().split(/\r?\n/),keys=lines.shift().split(',');
 return lines.map(line=>{const parts=line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v=>v.replace(/^"|"$/g,'').replace(/""/g,'"'));return Object.fromEntries(keys.map((k,i)=>[k,parts[i]??'']))}).filter(r=>['important','mdro'].includes(r.domain)&&['illustrative_estimate','narrative_exact','not_reported_lt20','official_verified'].includes(r.precision)&&r.indicator);
}
function svgMark(r){return 'data-ap-row="'+data.indexOf(r)+'" tabindex="0" role="img" aria-label="'+esc(metadata(r))+'" class="ap-svg-hit"'}
function svgTitle(r){return '<title>'+esc(metadata(r))+'</title>'}
function card(name,subtitle,content,source){
 return '<figure class="ap-figure"><div class="ap-figure-heading"><h3>'+esc(name)+'</h3><button type="button" class="ap-png" aria-label="下載'+esc(name)+' PNG">↓ PNG</button></div><div class="ap-figure-meta">'+subtitle+'</div><div class="ap-paper"><div class="ap-svg-scroll">'+content+'</div></div><figcaption>年報圖 '+esc(source)+'；估計值僅供展示互動式版型。</figcaption></figure>';
}
function waterMark(W,H){
 return '<text x="'+(W/2)+'" y="'+(H/2)+'" font-size="24" fill="#d2d2d2" opacity=".28" text-anchor="middle" transform="rotate(-20 '+(W/2)+' '+(H/2)+')">示意數據 · 非正式年報統計</text>';
}
function hBar(rows,name,color,subLabel,source){
 const W=580,L=151,R=31,T=23,B=44,rowH=30,H=T+B+Math.max(rows.length,1)*rowH,plotW=W-L-R;
 let svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(name+' 抗藥性百分比水平長條圖')+'"><rect width="'+W+'" height="'+H+'" fill="#fff"/>';
 for(let t=0;t<=100;t+=25){const x=L+plotW*t/100;svg+='<text x="'+x+'" y="'+(H-20)+'" text-anchor="middle" font-size="12" fill="#222">'+t+'%</text>';if(t===0)svg+='<line x1="'+x+'" y1="'+T+'" x2="'+x+'" y2="'+(H-B)+'" stroke="#b9b9b9"/>'}
 rows.forEach((r,i)=>{const cy=T+(i+.5)*rowH;svg+='<text x="'+(L-9)+'" y="'+(cy+4)+'" font-size="12" text-anchor="end" fill="#262626">'+esc(r.antibiotic)+'</text>';
 if(r.precision==='not_reported_lt20'){svg+='<text x="'+(L+8)+'" y="'+(cy+5)+'" font-size="19" font-weight="700" fill="#666" '+svgMark(r)+'>＊'+svgTitle(r)+'</text>';}
 else{const w=Math.max(.9,plotW*(+r.resistance_pct)/100),border=['official_verified','narrative_exact'].includes(r.precision)?' stroke="#202020" stroke-width="1.5"':'';svg+='<rect x="'+L+'" y="'+(cy-9)+'" width="'+w+'" height="18" fill="'+color+'"'+border+' '+svgMark(r)+'>'+svgTitle(r)+'</rect>'}
 });
 svg+=waterMark(W,H)+'<text x="'+(L+plotW/2)+'" y="'+(H-4)+'" font-size="11" fill="#222" text-anchor="middle">抗藥性百分比 (%)</text></svg>';
 return card(name,esc(subLabel),svg,source);
}
function important(){
 const all=data.filter(r=>r.domain==='important'&&r.indicator===state.organism);
 const names=[...new Set(all.map(r=>r.antibiotic))],availableParts=[...new Set(all.filter(r=>r.onset==='CO+HO').map(r=>r.specimen))];
 const pick=state.drug==='all'?all:all.filter(r=>r.antibiotic===state.drug);
 const focus=state.specimen==='all-panels'?availableParts:availableParts.filter(x=>x===state.specimen);
 const source=all[0]?.source_figure||'3-2';
 const A=focus.map(spec=>{const list=pick.filter(r=>r.onset==='CO+HO'&&r.specimen===spec);return hBar(list,label[spec],all[0]?.color||'#806B9E','（A）社區與醫療（CO＋HO）相關感染',source)});
 const B=pick.filter(r=>r.onset==='CO'&&r.specimen==='all'),C=pick.filter(r=>r.onset==='HO'&&r.specimen==='all');
 displayCharts=A.concat([hBar(B,'（B）社區相關感染（CO）',all[0]?.color||'#806B9E','全部檢體',source),hBar(C,'（C）醫療相關感染（HO）',all[0]?.color||'#806B9E','全部檢體',source)]);
 currentRows=pick.filter(r=>r.onset!=='CO+HO'||focus.includes(r.specimen));
 const aLayout=(A.length===3&&focus[0]==='all')?'<div class="ap-figure-grid ap-a-top">'+A[0]+'<div class="ap-figure-spacer" aria-hidden="true"></div></div><div class="ap-figure-grid">'+A.slice(1).join('')+'</div>':'<div class="ap-figure-grid'+(A.length===1?' ap-one-panel':'')+'">'+A.join('')+'</div>';$('apFigures').innerHTML='<div class="ap-intro"><h3>'+esc(all[0]?.organism||state.organism)+'｜113 年抗藥性百分比</h3><p>依年報原圖的抗生素順序、菌種配色及（A）（B）（C）分圖呈現；未發布的組合以＊標示。</p></div><h4 class="ap-figure-group">（A）社區與醫療（CO＋HO）相關感染</h4>'+aLayout+'<div class="ap-figure-grid">'+displayCharts.slice(A.length).join('')+'</div>';
 return{availableParts,names};
}
function lineChart(rows,name,source){
 const W=950,H=390,L=77,R=38,T=35,B=63,w=W-L-R,h=H-T-B,top=state.organism==='CRAB'?100:Math.max(10,Math.min(100,Math.ceil((Math.max(0,...rows.map(r=>+r.resistance_pct))+6)/10)*10)),x=i=>L+i*w/5,y=v=>T+h-h*(+v)/top;
 let svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(name+' 108至113年抗藥率趨勢折線圖')+'"><rect width="'+W+'" height="'+H+'" fill="#fff"/>';
 for(let k=0;k<=5;k++){const p=top*k/5,Y=y(p);svg+='<text x="'+(L-11)+'" y="'+(Y+4)+'" font-size="13" text-anchor="end" fill="#222">'+p.toFixed(top<20?1:0)+'%</text>';if(k===0)svg+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y+'" y2="'+Y+'" stroke="#bbb"/>'}
 for(let i=0;i<6;i++)svg+='<text x="'+x(i)+'" y="'+(H-31)+'" font-size="15" fill="#222" text-anchor="middle">'+(108+i)+'</text>';
 svg+='<text x="'+(L+w/2)+'" y="'+(H-5)+'" font-size="15" fill="#222" text-anchor="middle">年度</text><text transform="translate(20,'+(T+h/2)+') rotate(-90)" font-size="14" fill="#222" text-anchor="middle">抗藥性百分比 (%)</text>';
 for(const level of allLevels){const list=rows.filter(r=>r.hospital_level===level).sort((a,b)=>+a.year-+b.year);let d=list.map((r,i)=>(i?'L':'M')+x(+r.year-2019)+','+y(r.resistance_pct)).join(' ');
 svg+='<path d="'+d+'" fill="none" stroke="'+lineColors[level]+'" stroke-width="3"/>';
 for(const r of list){const dim=state.year!=='all'&&String(r.year)!==state.year;svg+='<circle cx="'+x(+r.year-2019)+'" cy="'+y(r.resistance_pct)+'" r="'+(dim?4:5.5)+'" fill="'+lineColors[level]+'" opacity="'+(dim?.28:1)+'" '+svgMark(r)+'>'+svgTitle(r)+'</circle>'}
 }
 svg+=waterMark(W,H)+'</svg>';
 const legend='<div class="ap-legend">'+allLevels.map(l=>'<span><i style="background:'+lineColors[l]+'"></i>'+label[l]+'</span>').join('')+'</div>';
 return card(name,legend,svg,source);
}
function stackChart(rows,onset,name,source){
 const W=1010,H=500,L=80,R=30,T=32,B=146,w=W-L-R,h=H-T-B,gw=w/6,bw=28;
 const components=onset==='CO+HO'?['CO','HO']:['I+R','S'];
 const maxStack=Math.max(1,...levels.flatMap(l=>Array.from({length:6},(_,i)=>rows.filter(r=>r.hospital_level===l&&+r.year===2019+i).reduce((n,r)=>n+(+r.isolates||0),0))));
 const top=state.organism==='CRAB'?(onset==='CO+HO'?14000:onset==='CO'?6000:8000):Math.max(1000,Math.ceil(maxStack/5000)*5000),tick=state.organism==='CRAB'?(onset==='CO+HO'?2000:1000):top/5,y=v=>T+h-h*(+v)/top;
 let svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(name)+'"><rect width="'+W+'" height="'+H+'" fill="#fff"/>';
 for(let v=0;v<=top+0.0001;v+=tick){const Y=y(v);svg+='<text x="'+(L-9)+'" y="'+(Y+5)+'" font-size="13" text-anchor="end" fill="#222">'+Math.round(v).toLocaleString('en-US')+'</text>';if(v===0)svg+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y+'" y2="'+Y+'" stroke="#bbb"/>'}
 svg+='<text transform="translate(22,'+(T+h/2)+') rotate(-90)" font-size="15" fill="#222" text-anchor="middle">菌株數</text>';
 for(let yi=0;yi<6;yi++){const center=L+(yi+.5)*gw,dim=state.year!=='all'&&state.year!==String(2019+yi);if(yi)svg+='<line x1="'+(L+yi*gw)+'" x2="'+(L+yi*gw)+'" y1="'+(T+h)+'" y2="'+(H-8)+'" stroke="#d4d4d4"/>';
  for(let j=0;j<3;j++){const lev=levels[j],bx=center+(j-1)*(bw+10)-bw/2;let accum=0;
   for(let ci=0;ci<2;ci++){const r=rows.find(r=>+r.year===2019+yi&&r.hospital_level===lev&&r.component===components[ci]);if(!r)continue;const v=+r.isolates||0;
   svg+='<rect x="'+bx+'" y="'+y(accum+v)+'" width="'+bw+'" height="'+(h*v/top)+'" fill="'+stackColors[lev][ci]+'" opacity="'+(dim?.27:1)+'" '+svgMark(r)+'>'+svgTitle(r)+'</rect>';accum+=v}
   svg+='<text x="'+(bx+bw/2)+'" y="'+(T+h+13)+'" writing-mode="tb" font-size="12" fill="#222">'+label[lev]+'</text>';
  }
  svg+='<text x="'+center+'" y="'+(H-15)+'" font-size="15" fill="#222" font-weight="600" text-anchor="middle">'+(108+yi)+'年</text>';
 }
 svg+=waterMark(W,H)+'</svg>';
 const legend='<div class="ap-legend ap-legend-stacked">'+levels.map(l=>'<span><strong>'+label[l]+'</strong>'+components.map((c,i)=>'<i style="background:'+stackColors[l][i]+'"></i>'+c).join(' ')+'</span>').join('')+'</div>';
 return card(name,legend,svg,source);
}
function mdro(){
 const all=data.filter(r=>r.domain==='mdro'&&r.indicator===state.organism&&r.onset===state.origin),i=mdros.findIndex(x=>x[0]===state.organism)+1,j=['CO+HO','CO','HO'].indexOf(state.origin)+1;
 const counts=all.filter(r=>r.component!=='R'),rates=all.filter(r=>r.component==='R'),originLabel=label[state.origin];
 displayCharts=[stackChart(counts,state.origin,'菌株數－'+originLabel,'4-'+i+'-'+j+'-1'),lineChart(rates,'抗藥性百分比－'+originLabel,'4-'+i+'-'+j+'-2')];
 currentRows=state.year==='all'?all:all.filter(r=>String(r.year)===state.year);
 $('apFigures').innerHTML='<div class="ap-intro"><h3>'+esc(mdros.find(x=>x[0]===state.organism)?.[1]||state.organism)+'｜108–113 年醫院層級別趨勢</h3><p>先依年報呈現菌株數堆疊柱狀圖，再呈現醫學中心、區域醫院、地區醫院、全國之抗藥性百分比折線圖。</p></div>'+displayCharts.join('');
}
function table(){
 const keys=['year','onset','specimen','hospital_level','antibiotic','component','isolates','resistance_pct','precision','source_figure','printed_page','verified_by'];
 const headings=['年度','感染來源','檢體','醫院層級','抗生素','類別','菌株數','抗藥率 R%','資料品質','年報圖號','頁碼','核對人／依據'];
 $('apTableWrap').innerHTML='<table><caption>目前選取之示意／精確資料與來源</caption><thead><tr>'+headings.map(v=>'<th scope="col">'+v+'</th>').join('')+'</tr></thead><tbody>'+
 currentRows.map(r=>'<tr>'+keys.map(k=>'<td>'+esc(k==='precision'?quality(r):k==='resistance_pct'&&r[k]!==''?Number(r[k]).toFixed(1)+'%':k==='isolates'&&r[k]!==''?fmtn(r[k]):r[k]||'—')+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
}

function activePdfPrintedPage(){
 if(state.domain==='important'){const r=data.find(r=>r.domain==='important'&&r.indicator===state.organism);return r?Number(r.printed_page):53}
 return 69+mdros.findIndex(m=>m[0]===state.organism)*4+['CO+HO','CO','HO'].indexOf(state.origin);
}
function refreshPdf(){
 if(!pdfUrl)return;
 const printed=activePdfPrintedPage(),physical=printed+8;
 $('apPdfView').src=pdfUrl+'#page='+physical;
 $('apPdfState').textContent='目前選擇的年報原圖：印刷第 '+printed+' 頁（PDF 第 '+physical+' 頁）';
 $('apPdfView').hidden=false;$('apPdfOpen').disabled=false;
}
$('apPdfFile').onchange=()=>{
 if(pdfUrl){URL.revokeObjectURL(pdfUrl);pdfUrl=null}
 const f=$('apPdfFile').files?.[0];$('apPdfView').hidden=true;$('apPdfOpen').disabled=true;
 if(!f){$('apPdfState').textContent='尚未選取 PDF';return}
 if(!/\.pdf$/i.test(f.name)&&f.type!=='application/pdf'){$('apPdfState').textContent='請選擇 PDF 格式';return}
 pdfUrl=URL.createObjectURL(f);refreshPdf();
};
$('apPdfOpen').onclick=()=>{if(pdfUrl)window.open(pdfUrl+'#page='+(activePdfPrintedPage()+8),'_blank','noopener')};
window.addEventListener('beforeunload',()=>{if(pdfUrl)URL.revokeObjectURL(pdfUrl)});
function urlState(){const u=new URL(location.href);const params=domainLock==='mdro'?{mdroIndicator:state.organism,mdroOnset:state.origin,mdroYear:state.year}:{impIndicator:state.organism,impSpecimen:state.specimen,impDrug:state.drug};Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));history.replaceState({},'',u);return u.href}
function updateOptions(){
 const all=data.filter(r=>r.domain===state.domain),choices=state.domain==='important'?[...new Map(all.map(r=>[r.indicator,r.organism])).entries()]:mdros;
 const select=$('apOrganism');select.innerHTML=choices.map(([code,name])=>'<option value="'+esc(code)+'">'+esc(name)+'</option>').join('');
 if(!choices.some(x=>x[0]===state.organism))state.organism=choices[0][0];select.value=state.organism;
 $('apOriginWrap').hidden=state.domain!=='mdro';$('apSpecimenWrap').hidden=state.domain==='mdro';$('apDrugWrap').hidden=state.domain==='mdro';$('apYearWrap').hidden=state.domain==='important';
 if(!['CO+HO','CO','HO'].includes(state.origin))state.origin='CO+HO';$('apOrigin').value=state.origin;
 if(state.domain==='important'){
  const rows=all.filter(r=>r.indicator===state.organism&&r.onset==='CO+HO'),spec=[...new Set(rows.map(r=>r.specimen))];
  const options=[['all-panels','年報完整分圖'],...spec.map(k=>[k,label[k]||k])];$('apSpecimen').innerHTML=options.map(([v,t])=>'<option value="'+v+'">'+esc(t)+'</option>').join('');if(!options.some(x=>x[0]===state.specimen))state.specimen='all-panels';$('apSpecimen').value=state.specimen;
  const drugs=[...new Set(rows.map(r=>r.antibiotic))];$('apDrug').innerHTML='<option value="all">全部抗生素（年報順序）</option>'+drugs.map(d=>'<option value="'+esc(d)+'">'+esc(d)+'</option>').join('');if(!drugs.includes(state.drug))state.drug='all';$('apDrug').value=state.drug;
 } else {$('apYear').value=['2019','2020','2021','2022','2023','2024'].includes(state.year)?state.year:'all'}
}
function draw(){
 updateOptions();
 if(state.domain==='important')important();else mdro();
 table();urlState();refreshPdf();
 const n=currentRows.length,ex=currentRows.filter(r=>['narrative_exact','official_verified'].includes(r.precision)).length,blocked=currentRows.filter(r=>r.precision==='not_reported_lt20').length;
 $('apStatus').textContent='顯示 '+displayCharts.length+' 張圖、'+n+' 筆；年報明載 '+ex+' 筆、未發布 '+blocked+' 筆，其餘為示意估計。';
 $('apTableWrap').hidden=$('apTableToggle').getAttribute('aria-expanded')!=='true';
 section.querySelectorAll('.ap-png').forEach((b,i)=>{b.onclick=()=>png(b.closest('figure')?.querySelector('svg'),'AR-'+state.domain+'-'+state.organism+'-'+state.origin+'-'+(i+1)+'.png')});
}
function fileDownload(data,name,type){const b=new Blob([data],{type}),url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function png(svg,name){if(!svg)return;const src=new XMLSerializer().serializeToString(svg),url=URL.createObjectURL(new Blob([src],{type:'image/svg+xml;charset=utf-8'})),img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=Math.ceil(svg.viewBox.baseVal.width*2);c.height=Math.ceil(svg.viewBox.baseVal.height*2);const cx=c.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,c.width,c.height);cx.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);c.toBlob(blob=>{if(blob)fileDownload(blob,name,'image/png')})};img.onerror=()=>{URL.revokeObjectURL(url);$('apStatus').textContent='圖片轉檔失敗，請使用 CSV 匯出'};img.src=url}
function showInfo(el,x,y){const r=data[Number(el.dataset.apRow)];if(!r)return;$('apSourceDetails').textContent=metadata(r);const tip=$('apFloat');tip.textContent=metadata(r);tip.hidden=false;if(typeof x==='number'&&typeof y==='number'){const left=Math.max(10,Math.min(window.innerWidth-300,x+12));tip.style.left=left+'px';tip.style.top=Math.max(10,Math.min(window.innerHeight-100,y+12))+'px'}}
function hideTip(){const tip=$('apFloat');if(tip)tip.hidden=true}
let tooltip=document.createElement('div');tooltip.id=prefix+'apFloat';tooltip.className='ap-floating-tip';tooltip.setAttribute('role','tooltip');tooltip.hidden=true;document.body.append(tooltip);
section.addEventListener('mouseover',e=>{const el=e.target.closest('[data-ap-row]');if(el)showInfo(el,e.clientX,e.clientY)});
section.addEventListener('mousemove',e=>{const el=e.target.closest('[data-ap-row]');if(el)showInfo(el,e.clientX,e.clientY)});
section.addEventListener('mouseout',e=>{if(e.target.closest('[data-ap-row]'))hideTip()});
section.addEventListener('focusin',e=>{const el=e.target.closest('[data-ap-row]');if(el)showInfo(el)});
section.addEventListener('focusout',hideTip);
section.addEventListener('click',e=>{const el=e.target.closest('[data-ap-row]');if(el)showInfo(el)});
section.addEventListener('keydown',e=>{const el=e.target.closest('[data-ap-row]');if(el&&(e.key==='Enter'||e.key===' ')){e.preventDefault();showInfo(el)}});
section.querySelectorAll('[data-ap-domain]').forEach(b=>b.onclick=()=>{state.domain=b.dataset.apDomain;state.organism='';state.drug='all';state.specimen='all-panels';section.querySelectorAll('[data-ap-domain]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw()});
$('apOrganism').onchange=v=>{state.organism=$('apOrganism').value;state.drug='all';state.specimen='all-panels';draw()};
$('apOrigin').onchange=()=>{state.origin=$('apOrigin').value;draw()};
$('apSpecimen').onchange=()=>{state.specimen=$('apSpecimen').value;draw()};
$('apDrug').onchange=()=>{state.drug=$('apDrug').value;draw()};
$('apYear').onchange=()=>{state.year=$('apYear').value;draw()};
$('apTableToggle').onclick=()=>{const now=$('apTableToggle').getAttribute('aria-expanded')==='true';$('apTableToggle').setAttribute('aria-expanded',String(!now));$('apTableToggle').textContent=now?'查看資料表':'隱藏資料表';$('apTableWrap').hidden=now};
$('apCsvDownload').onclick=()=>{const keys=['domain','indicator','organism','year','onset','specimen','hospital_level','antibiotic','component','isolates','resistance_pct','precision','source_figure','printed_page','notes','verified_by'];const csv='\uFEFF'+keys.join(',')+'\n'+currentRows.map(r=>keys.map(k=>'"'+String(r[k]??'').replace(/"/g,'""')+'"').join(',')).join('\n');fileDownload(csv,'AR-PREVIEW-'+state.domain+'-'+state.organism+'-'+state.origin+'.csv','text/csv;charset=utf-8')};
$('apCopyLink').onclick=()=>{const u=urlState();if(navigator.clipboard?.writeText){navigator.clipboard.writeText(u).then(()=>{$('apStatus').textContent='篩選連結已複製'}).catch(()=>{$('apStatus').textContent='無法複製，請直接複製瀏覽器網址'})}else $('apStatus').textContent='請直接複製瀏覽器網址'};

function key(r){return [r.domain,r.indicator,r.year,r.onset,r.specimen,r.hospital_level,r.antibiotic,r.component].join('|')}
function importOfficial(rows){
 const indexed=new Map(data.map((r,i)=>[key(r),i]));
 const seen=new Set();
 for(const r of rows){
  const identity=key(r),found=indexed.get(identity),val=r.component==='R'?Number(r.resistance_pct):Number(r.isolates);
  const filled=r.component==='R'?r.resistance_pct!==''&&r.isolates==='':r.isolates!==''&&r.resistance_pct==='';
  if(found===undefined||seen.has(identity)||r.precision!=='official_verified'||!r.verified_by||!r.source_figure||!r.printed_page||!filled||!Number.isFinite(val)||val<0||(r.component==='R'&&val>100))continue;
  seen.add(identity);
  data[found]={...data[found],...r};
  officialCount++;
 }
}
Promise.all([
 fetch('./data/ar_2024_full_demo_preview.csv',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('示意資料 HTTP '+r.status);return r.text()}),
 fetch('./data/ar_2024_full_official_import.csv',{cache:'no-store'}).then(r=>r.ok?r.text():'').catch(()=>'')
]).then(([demo,official])=>{
 data=parseCSV(demo);if(new Set(data.filter(r=>r.domain==='important').map(r=>r.indicator)).size!==12||new Set(data.filter(r=>r.domain==='mdro').map(r=>r.indicator)).size!==9)throw Error('重要菌種或MDRO資料不完整');
 if(official)importOfficial(parseCSV(official));
 species=[...new Map(data.filter(r=>r.domain==='important').map(r=>[r.indicator,r.organism])).entries()];
 draw();
 if(officialCount)$('apStatus').textContent+='；已以 '+officialCount+' 筆正式核對資料覆寫示意值。';
}).catch(e=>{$('apStatus').textContent='示意圖表資料讀取失敗：'+e.message});

})();
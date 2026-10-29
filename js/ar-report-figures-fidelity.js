(()=>{'use strict';
const root=document.querySelector('main'),old=document.getElementById('resistanceReportPanels');if(!root)return;
const section=document.createElement('section');section.className='panel report-style-charts';section.id='reportStyleCharts';
section.innerHTML=
'<div class="rsc-heading"><div><div class="eyebrow">REPORT STYLE · 2024 EDITION</div><h2>重要菌種抗藥性與多重抗藥菌趨勢</h2><p>比照年報圖型、分圖結構及固定配色。圖形讀取數值以「約」標示，不作為正式精確統計資料。</p></div><div class="rsc-actions"><button type="button" id="rscTableBtn">資料表</button><button type="button" id="rscCsvBtn">CSV 下載</button><button type="button" id="rscPngBtn">PNG 下載</button></div></div>'+
'<div class="rsc-tabs"><button type="button" data-rsc="important" aria-pressed="true">重要菌種抗藥性</button><button type="button" data-rsc="mdro" aria-pressed="false">多重抗藥菌趨勢（CRAB）</button></div>'+
'<div class="rsc-controls"><label>菌種／指標<select id="rscOrganism"></select></label><label id="rscOnsetWrap" hidden>感染來源<select id="rscOnset"><option value="CO+HO">CO＋HO</option><option value="CO">CO</option><option value="HO">HO</option></select></label><label>年報版本<select id="rscEdition"><option value="2024">2024 年報（113 年）</option></select></label></div>'+
'<p class="rsc-evidence">資料品質：除年報文字明載的數值外，其他數值採圖形估讀（chart_estimate），目的是還原原圖視覺效果；原圖誤差線因欠缺精確信賴區間資料，未另行繪製。<span id="rscCount"></span></p>'+
'<p class="small" id="rscStatus" role="status" aria-live="polite">正在載入年報圖形資料…</p><div id="rscPlots"></div>'+
'<div id="rscDetail" role="status" aria-live="polite" class="rsc-detail">移至圖形、點擊或使用 Tab 聚焦即可顯示數值與來源。</div>'+
'<div id="rscTable" class="scroll" hidden></div><p class="small">資料來源：2024 年版《臺灣抗生素抗藥性監視年報》第 53、69、70 頁。抗藥性百分比為 R%，不同於 Antibiogram 的 S%；估讀值不得據以計算 95% CI。</p>';
if(old)old.replaceWith(section);else{const anchor=[...root.querySelectorAll('.panel')].find(el=>el.textContent.includes('進階分析'));if(anchor)anchor.before(section);else root.append(section)}
const $=id=>document.getElementById(id),html=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const drugOrder=['Tigecycline','Minocycline','Gentamicin','Amikacin','Imipenem','Meropenem','Doripenem'];
const levels=['medical_center','regional_hospital','district_hospital'];
const labels={medical_center:'醫學中心',regional_hospital:'區域醫院',district_hospital:'地區醫院',national:'全國','CO+HO':'CO＋HO',CO:'CO',HO:'HO',blood:'血液檢體',all:'全部檢體'};
const lineColors={medical_center:'#4074B6',regional_hospital:'#E77845',district_hospital:'#A0A0A0',national:'#EFAF39'};
const fills={medical_center:['#8FB8D8','#405F97'],regional_hospital:['#EBA687','#BB6137'],district_hospital:['#AAA8AA','#79777B']};
let points=[],shown=[],tab='important',basePoints=[],hoPoints=[],kpPoints=[],narrative=[];
function parse(txt){const a=txt.trim().split(/\r?\n/),h=a.shift().split(',');return a.map(line=>{const cells=line.split(',');return Object.fromEntries(h.map((k,i)=>[k,cells[i]??'']))}).filter(r=>{const v=Number(r.value);return Number.isFinite(v)&&v>=0&&((r.unit==='percent'&&v<=100)||r.unit==='isolates')&&['narrative_exact','chart_estimate'].includes(r.precision)})}
const fmt=r=>{
 if(r.relation==='exact')return Number(r.lower_pct).toFixed(1)+'%';
 if(r.relation==='range'||r.relation==='range_approx')return (r.relation==='range_approx'?'約 ':'')+Number(r.lower_pct).toFixed(1)+'–'+Number(r.upper_pct).toFixed(1)+'%';
 if(r.relation==='less_than')return '低於 '+Number(r.upper_pct).toFixed(1)+'%';
 if(r.relation==='greater_than')return '高於 '+Number(r.lower_pct).toFixed(1)+'%';
 const v=Number(r.value);
 return (r.precision==='chart_estimate'?'約 ':'')+(r.unit==='percent'?v.toFixed(1)+'%':v.toLocaleString('zh-TW')+' 株');
};
function describe(r){return[r.indicator,r.year+'（民國'+(+r.year-1911)+'）',labels[r.hospital_level]||r.hospital_level,labels[r.onset]||r.onset,labels[r.specimen]||r.specimen,r.antibiotic||r.component,fmt(r),r.precision==='chart_estimate'?'圖形估讀，非精確值':'年報文字核對值','圖'+r.source_figure+'，第'+r.source_page+'頁',r.narrative_page?'文字數值來源：第'+r.narrative_page+'頁':''].filter(Boolean).join(' · ')}
function mark(r){return ' class="rsc-mark" tabindex="0" data-point="'+points.indexOf(r)+'" aria-label="'+html(describe(r))+'"'}
function card(title,subtitle,svg,source){return '<figure class="rsc-card"><div class="rsc-card-head"><h3>'+html(title)+'</h3><button type="button" class="rsc-figure-png" aria-label="下載此圖 PNG">↓ PNG</button></div><div class="rsc-subtitle">'+subtitle+'</div><div class="rsc-paper"><div class="rsc-scroll">'+svg+'</div></div><figcaption>2024 年報 '+source+'。圖形估讀值不代表精確資料。</figcaption></figure>'}
function horizontal(onset,spec,title,subtitle){
 const rows=drugOrder.map(d=>points.find(r=>r.section==='important'&&r.onset===onset&&r.specimen===spec&&r.antibiotic===d));
 const W=530,H=335,L=130,R=29,T=28,B=47,w=W-L-R,rowH=(H-T-B)/7;
 let svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+html(title+subtitle+'抗藥率水平長條圖')+'"><rect width="'+W+'" height="'+H+'" fill="#fff"/>';
 for(let v=0;v<=100;v+=25){let x=L+w*v/100;svg+='<text x="'+x+'" y="'+(H-20)+'" fill="#282828" text-anchor="middle" font-size="12">'+v+'%</text>'+(v===0?'<line x1="'+x+'" y1="'+T+'" x2="'+x+'" y2="'+(H-B)+'" stroke="#c7c7c7"/>':'')}
 drugOrder.forEach((d,i)=>{let r=rows[i],cy=T+(i+.5)*rowH;svg+='<text x="'+(L-10)+'" y="'+(cy+4)+'" fill="#333" text-anchor="end" font-size="12">'+d+'</text>';if(r)svg+='<rect x="'+L+'" y="'+(cy-9)+'" width="'+(w*(+r.value)/100)+'" height="18" fill="#806A9C"'+mark(r)+'><title>'+html(describe(r))+'</title></rect>'});
 svg+='<text x="'+(L+w/2)+'" y="'+(H-2)+'" text-anchor="middle" font-size="12" fill="#333">抗藥性百分比 (%)</text></svg>';
 return card(title,subtitle,svg,'圖 3-2-1，第 53 頁');
}

const organisms=[
 ['A_baumannii','Acinetobacter baumannii',53,'3-2-1'],
 ['E_coli','Escherichia coli',54,'3-2-2'],
 ['K_pneumoniae','Klebsiella pneumoniae',56,'3-2-3'],
 ['P_aeruginosa','Pseudomonas aeruginosa',58,'3-2-4'],
 ['E_faecalis','Enterococcus faecalis',59,'3-2-5'],
 ['E_faecium','Enterococcus faecium',60,'3-2-6'],
 ['S_aureus','Staphylococcus aureus',61,'3-2-7'],
 ['N_gonorrhoeae','Neisseria gonorrhoeae',62,'3-2-8'],
 ['S_pneumoniae','Streptococcus pneumoniae',63,'3-2-9'],
 ['Shigella','Shigella spp.',64,'3-2-10'],
 ['NTS','Non-typhoidal Salmonella',65,'3-2-11'],
 ['H_influenzae','Haemophilus influenzae',67,'3-2-12']
];
const mdroGroups=[
 ['CRAB','CRAB','A. baumannii',100,8000],
 ['CRE','CRE','Enterobacterales',30,35000],
 ['CR_ECOLI','CR E. coli','E. coli',20,15000],
 ['CRKP','CRKP','K. pneumoniae',50,15000],
 ['CRPA','CRPA','P. aeruginosa',40,14000],
 ['MRSA','MRSA','S. aureus',100,8000],
 ['VRE','VRE','Enterococcus spp.',50,18000],
 ['VR_EFAECALIS','VR E. faecalis','E. faecalis',10,8000],
 ['VR_EFAECIUM','VR E. faecium','E. faecium',100,15000]
];
const officialReport='https://www.cdc.gov.tw/Category/Page/tx7G1t-G3lyodZ8m8uoYMA';
function statusFigure(title,reference){
 return '<div class="rsc-source-only"><strong>'+html(title)+'</strong><p>此菌種的年報圖像已確認，但尚未逐點核對完整的菌藥百分比與檢測分母，因此不顯示可能誤導的柱高。</p><p>參考：2024 年報'+html(reference)+'。<a href="'+officialReport+'" target="_blank" rel="noopener noreferrer">查看疾管署正式年報下載頁</a></p></div>';
}
function kpBars(){
 const data=[
 {antibiotic:'Ceftazidime',blood:28.9,urine:39.8},
 {antibiotic:'Co-trimoxazole',blood:33.3,urine:44.4}
 ];
 const cells=data.map(r=>'<div class="rsc-verified-drug"><strong>'+html(r.antibiotic)+'</strong>'+
 '<div class="rsc-verified-bar"><span>血液檢體</span><div class="rsc-scale"><i style="width:'+r.blood+'%;background:#806A9C"></i></div><b>'+r.blood.toFixed(1)+'%</b></div>'+
 '<div class="rsc-verified-bar"><span>尿液檢體</span><div class="rsc-scale"><i style="width:'+r.urine+'%;background:#B0A0C2"></i></div><b>'+r.urine.toFixed(1)+'%</b></div></div>').join('');
 return '<div class="rsc-source-only"><h3>K. pneumoniae：血液與尿液的已核對抗藥率</h3><p>2024 年報第 56 頁明確記載的兩種抗生素（R%）。其餘菌藥及 CO／HO 分圖仍待取得完整精確數值。</p>'+cells+'</div>';
}

const narrativeSource='https://www.cdc.gov.tw/Category/Page/tx7G1t-G3lyodZ8m8uoYMA';
const narrativeType={exact:'年報明載值',range:'年報明載藥物範圍',range_approx:'年報約略範圍',less_than:'年報上界',greater_than:'年報下界'};
function narrativeValue(r){
 const x=r.lower_pct,y=r.upper_pct;
 if(r.relation==='exact')return Number(x).toFixed(1)+'%';
 if(r.relation==='less_than')return '低於 '+Number(y).toFixed(1)+'%';
 if(r.relation==='greater_than')return '高於 '+Number(x).toFixed(1)+'%';
 return (r.relation==='range_approx'?'約 ':'')+Number(x).toFixed(1)+'–'+Number(y).toFixed(1)+'%';
}
function narrativeScope(r){
 const labels={all:'全部檢體',blood:'血液',urine:'尿液',stool:'糞便',national:'全國',medical_center:'醫學中心',regional_hospital:'區域醫院',district_hospital:'地區醫院'};
 return [r.onset==='CO+HO'?'CO＋HO':r.onset,labels[r.specimen]||r.specimen,labels[r.hospital_level]||r.hospital_level,r.year+'年'].join(' · ');
}
function narrativeRow(r){
 return {section:r.indicator_type==='MDRO'?'mdro_verified':'important_verified',record_type:'narrative',indicator:r.code,year:r.year,onset:r.onset,specimen:r.specimen,hospital_level:r.hospital_level,antibiotic:r.label,component:'R',value:r.relation==='exact'?r.lower_pct:null,lower_pct:r.lower_pct,upper_pct:r.upper_pct,relation:r.relation,unit:'percent',precision:r.precision,source_page:r.source_page,narrative_page:r.source_page,source_figure:r.indicator_type==='MDRO'?'4-'+(mdroGroups.findIndex(x=>x[0]===r.code)+1):'3-2-'+(organisms.findIndex(x=>x[0]===r.code)+1),extraction_method:'transcribed_from_2024_report_narrative',note:r.note||''};
}
function narrativePlot(code,domain){
 const records=narrative.filter(x=>x.code===code&&(domain==='mdro'?(x.indicator_type==='MDRO'):(x.indicator_type!=='MDRO')));
 if(!records.length)return '';
 const cards=records.map((r,i)=>{
  const min=Number.isFinite(Number(r.lower_pct))&&r.lower_pct!==null?Number(r.lower_pct):0;
  const max=Number.isFinite(Number(r.upper_pct))&&r.upper_pct!==null?Number(r.upper_pct):100;
  const val=r.relation==='exact'?max:0;
  let left=r.relation==='range'||r.relation==='range_approx'?min:r.relation==='greater_than'?min:0;
  let width=r.relation==='exact'?val:r.relation==='less_than'?max:r.relation==='greater_than'?100-min:max-min;
  left=Math.max(0,Math.min(100,left));width=Math.max(.2,Math.min(100-left,width));
  const className=r.relation==='exact'?'rsc-official-solid':'rsc-official-range';
  const txt=r.label+' '+narrativeValue(r)+' '+narrativeScope(r)+'；年報第 '+r.source_page+' 頁';
  return '<button type="button" class="rsc-official-row" data-narrative-point="'+narrative.indexOf(r)+'" title="'+html(txt)+'" aria-label="'+html(txt)+'">'+
  '<span class="rsc-official-drug">'+html(r.label)+'<small>'+html(narrativeScope(r))+'</small></span>'+
  '<span class="rsc-official-track"><i class="'+className+'" style="left:'+left+'%;width:'+width+'%"></i></span>'+
  '<strong class="rsc-official-value">'+html(narrativeValue(r))+'</strong></button>';
 }).join('');
 return '<section class="rsc-official-section" aria-label="'+html(code)+' 年報文字精確值與範圍">'+
 '<div class="rsc-official-head"><h3>年報內文數值（非圖像估讀）</h3><span>'+records.length+' 筆來源敘述</span></div>'+
 '<p>此區只顯示年報直接列示的數值或範圍；範圍表示不同抗生素品項的結果，不是同一藥物的信賴區間。</p>'+
 '<div class="rsc-official-scale"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>'+
 cards+'<p class="rsc-official-foot">實心紫色＝年報明載單一數值；紫色斜紋＝原文範圍或界限。<a href="'+narrativeSource+'" rel="noopener noreferrer" target="_blank">疾管署正式年報下載頁</a></p></section>';
}

function verifiedNarrativeSvg(){
 const code=$('rscOrganism').value,domain=tab==='mdro'?'MDRO':'organism',onset=tab==='mdro'?$('rscOnset').value:'CO+HO';
 const list=narrative.filter(r=>r.code===code&&(domain==='MDRO'?r.indicator_type==='MDRO'&&r.onset===onset:!r.indicator_type));
 if(!list.length)return null;
 const W=1050,L=340,R=145,H=66+list.length*56,chartWidth=W-L-R,barTop=46;
 let result='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="2024 年報文字明載抗藥率">';
 result+='<rect width="'+W+'" height="'+H+'" fill="#ffffff"/><text x="20" y="27" font-size="20" fill="#202020" font-weight="bold">2024 年報內文核對值（R%）</text>';
 result+='<defs><pattern id="verifiedStripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="10" height="10" fill="#d4c4e2"/><rect width="5" height="10" fill="#8d75a7"/></pattern></defs>';
 for(let t=0;t<=100;t+=25){let x=L+chartWidth*t/100;result+='<text x="'+x+'" y="44" font-size="13" fill="#333" text-anchor="middle">'+t+'%</text>'}
 list.forEach((r,i)=>{
  const y=barTop+i*56+10,lo=r.lower_pct===null?0:Number(r.lower_pct),hi=r.upper_pct===null?100:Number(r.upper_pct);
  let left=r.relation==='range'||r.relation==='range_approx'||r.relation==='greater_than'?lo:0;
  let wide=r.relation==='exact'?hi:r.relation==='less_than'?hi:r.relation==='greater_than'?100-lo:hi-lo;
  left=Math.max(0,Math.min(100,left));wide=Math.max(.3,Math.min(100-left,wide));
  result+='<text x="20" y="'+(y+14)+'" fill="#222" font-size="14">'+html(r.label.length>42?r.label.slice(0,40)+'…':r.label)+'</text>';
  result+='<rect x="'+L+'" y="'+y+'" width="'+chartWidth+'" height="21" fill="#f2f2f2"/>';
  result+='<rect x="'+(L+chartWidth*left/100)+'" y="'+y+'" width="'+chartWidth*wide/100+'" height="21" fill="'+(r.relation==='exact'?'#806A9C':'url(#verifiedStripes)')+'"/>';
  result+='<text x="'+(W-15)+'" y="'+(y+15)+'" fill="#222" text-anchor="end" font-size="15" font-weight="bold">'+html(narrativeValue(r))+'</text>';
  result+='<text x="20" y="'+(y+34)+'" fill="#555" font-size="11">'+html(narrativeScope(r))+' · p.'+r.source_page+'</text>';
 });
 result+='</svg>';
 const wrap=document.createElement('div');wrap.innerHTML=result;return wrap.querySelector('svg');
}
function sourceReference(name,figure,page){
 return '<section class="rsc-figure-ref" role="note"><strong>年報原圖：'+html(name)+'</strong>'+
 '<p>請參閱圖 '+html(figure)+'（第 '+page+' 頁）。原圖部分菌藥組合或醫院分層未提供可完整核對的原始數表，目前以年報文字精確值呈現可驗證的部分，不用估值補滿其餘柱體。</p>'+
 '<a href="'+narrativeSource+'" target="_blank" rel="noopener noreferrer">開啟疾管署正式年報頁面，下載並查看原圖</a></section>';
}

function important(){
 const code=$('rscOrganism').value,entry=organisms.find(x=>x[0]===code)||organisms[0];
 const [key,name,page,fig]=entry;
 const official=narrative.filter(r=>r.code===key&&!r.indicator_type).map(narrativeRow);
 const intro='<div class="rsc-intro"><strong>'+html(name)+'｜113 年抗生素抗藥性百分比</strong><p>年報圖 '+html(fig)+'，第 '+page+' 頁；下方實心／區間長條僅使用年報文字敘述的數值。</p></div>';
 if(key==='A_baumannii'){
  $('rscPlots').innerHTML=intro+narrativePlot(key,'important')+
  '<p class="rsc-estimates-label">下列四格採原圖型式，但仍包含未取得原始數表的圖形估讀值；不能視為精確數據。</p>'+
  '<div class="rsc-grid">'+horizontal('CO+HO','all','（A）CO＋HO','全部檢體')+horizontal('CO+HO','blood','（A）CO＋HO','血液檢體')+'</div>'+
  '<div class="rsc-grid">'+horizontal('CO','all','（B）社區相關感染（CO）','全部檢體')+horizontal('HO','all','（C）醫療相關感染（HO）','全部檢體')+'</div>';
  shown=official.concat(basePoints.filter(r=>r.section==='important'));
  $('rscStatus').textContent='已顯示年報文字明列數值，以及圖 3-2-1 的四格估讀式圖形（來源精度分開標註）。';
 } else {
  $('rscPlots').innerHTML=intro+narrativePlot(key,'important')+sourceReference(name,'圖 '+fig,page);
  shown=official;
  $('rscStatus').textContent='已依年報第 '+page+' 頁提供 '+official.length+' 筆文字明載數值／範圍；原圖其餘菌藥組合未經精確數位化，不會用估計柱高補值。';
 }
}
function lineChart(){
 const W=930,H=395,L=78,R=42,T=26,B=57,w=W-L-R,h=H-T-B,xx=i=>L+w*i/5,yy=v=>T+h-h*v/100;
 let legend='<div class="rsc-legend">'+[...levels,'national'].map(l=>'<span><i style="background:'+lineColors[l]+'"></i>'+labels[l]+'</span>').join('')+'</div>';
 let svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" xmlns="http://www.w3.org/2000/svg" aria-label="CRAB 六年醫院層級別抗藥性百分比折線圖"><rect width="'+W+'" height="'+H+'" fill="#fff"/>';
 for(let v=0;v<=100;v+=20){const y=yy(v);svg+='<text x="'+(L-13)+'" y="'+(y+5)+'" text-anchor="end" font-size="16" fill="#222">'+v+'</text>'+(v===0?'<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="#bfbfbf"/>':'')}
 for(let i=0;i<6;i++)svg+='<text x="'+xx(i)+'" y="'+(H-28)+'" text-anchor="middle" font-size="16" fill="#222">'+(108+i)+'</text>';
 svg+='<text x="'+(L+w/2)+'" y="'+(H-3)+'" text-anchor="middle" font-size="16" fill="#222">年度</text><text transform="translate(22,'+(T+h/2)+') rotate(-90)" text-anchor="middle" font-size="16" fill="#222">抗藥性百分比 (%)</text>';
 for(const l of [...levels,'national']){const rs=points.filter(r=>r.section==='mdro_resistance'&&r.hospital_level===l).sort((a,b)=>a.year-b.year);svg+='<polyline fill="none" stroke-width="3.2" stroke="'+lineColors[l]+'" points="'+rs.map(r=>xx(Number(r.year)-2019)+','+yy(r.value)).join(' ')+'"/>';for(const r of rs)svg+='<circle cx="'+xx(Number(r.year)-2019)+'" cy="'+yy(r.value)+'" r="5" fill="'+lineColors[l]+'"'+mark(r)+'><title>'+html(describe(r))+'</title></circle>'}
 svg+='</svg>';return card('CRAB 抗藥性百分比趨勢',legend,svg,'圖 4-1-1-2，第 69 頁');
}
function stackChart(sectionKey,title,components,limit,figure){
 const W=970,H=520,L=78,R=22,T=36,B=145,w=W-L-R,h=H-T-B,groupW=w/6,barW=30;
 let legend='<div class="rsc-legend">'+levels.map(l=>'<span><strong>'+labels[l]+'</strong>'+components.map((n,i)=>'<i style="background:'+fills[l][i]+'"></i>'+n).join(' ')+'</span>').join('')+'</div>';
 let svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" xmlns="http://www.w3.org/2000/svg" aria-label="'+html(title)+'"><rect width="'+W+'" height="'+H+'" fill="#fff"/>';
 for(let v=0;v<=limit;v+=limit===14000?2000:1000){const y=T+h-h*v/limit;svg+='<text x="'+(L-9)+'" y="'+(y+5)+'" text-anchor="end" font-size="14" fill="#222">'+v.toLocaleString('en-US')+'</text>'+(v===0?'<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="#c0c0c0"/>':'')}
 svg+='<text transform="translate(22,'+(T+h/2)+') rotate(-90)" text-anchor="middle" font-size="17" fill="#222">菌株數</text>';
 for(let yi=0;yi<6;yi++){let center=L+(yi+.5)*groupW;if(yi)svg+='<line x1="'+(L+yi*groupW)+'" x2="'+(L+yi*groupW)+'" y1="'+(T+h)+'" y2="'+(H-16)+'" stroke="#d0d0d0"/>';
  for(let li=0;li<3;li++){let level=levels[li],x=center+(li-1)*(barW+11)-barW/2,sum=0;
   for(let j=0;j<2;j++){let r=points.find(r=>r.section===sectionKey&&r.year==2019+yi&&r.hospital_level===level&&r.component===components[j]);if(!r)continue;let v=+r.value,hh=h*v/limit,y=T+h-h*(sum+v)/limit;svg+='<rect x="'+x+'" y="'+y+'" width="'+barW+'" height="'+hh+'" fill="'+fills[level][j]+'"'+mark(r)+'><title>'+html(describe(r))+'</title></rect>';sum+=v}
   svg+='<text x="'+(x+barW/2)+'" y="'+(T+h+14)+'" writing-mode="tb" font-size="12" text-anchor="start" fill="#222">'+labels[level]+'</text>';
  }
  svg+='<text x="'+center+'" y="'+(H-12)+'" text-anchor="middle" font-size="16" font-weight="600" fill="#222">'+(108+yi)+'年</text>';
 }
 svg+='</svg>';return card(title,legend,svg,figure);
}

function hoLine(group,index){
 const [code,label,organism,maxY]=group,rows=hoPoints.filter(r=>r.indicator===code&&r.record_type==='resistance');
 const W=930,H=395,L=78,R=42,T=26,B=57,w=W-L-R,h=H-T-B,xx=i=>L+w*i/5,yy=v=>T+h-h*(+v)/maxY;
 const legend='<div class="rsc-legend">'+[...levels,'national'].map(l=>'<span><i style="background:'+lineColors[l]+'"></i>'+labels[l]+'</span>').join('')+'</div>';
 let svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" xmlns="http://www.w3.org/2000/svg" aria-label="'+html(label+' HO 108–113 年醫院層級別抗藥性百分比折線圖')+'"><rect width="'+W+'" height="'+H+'" fill="#fff"/>';
 const step=maxY===100?20:maxY===50?10:maxY===30?5:maxY===40?10:maxY===20?5:2;
 for(let v=0;v<=maxY;v+=step){const y=yy(v);svg+='<text x="'+(L-13)+'" y="'+(y+5)+'" text-anchor="end" font-size="16" fill="#222">'+v+'</text>'+(v===0?'<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="#bbb"/>':'')}
 for(let i=0;i<6;i++)svg+='<text x="'+xx(i)+'" y="'+(H-28)+'" text-anchor="middle" font-size="16" fill="#222">'+(108+i)+'</text>';
 svg+='<text x="'+(L+w/2)+'" y="'+(H-3)+'" text-anchor="middle" font-size="16" fill="#222">年度</text><text transform="translate(22,'+(T+h/2)+') rotate(-90)" text-anchor="middle" font-size="16" fill="#222">抗藥性百分比 (%)</text>';
 for(const l of [...levels,'national']){
   const series=rows.filter(r=>r.hospital_level===l).sort((a,b)=>a.year-b.year);
   const d=series.map((r,j)=>(j?'L':'M')+xx(+r.year-2019)+' '+yy(r.value)).join(' ');
   svg+='<path d="'+d+'" fill="none" stroke-width="3.2" stroke="'+lineColors[l]+'"/>';
   for(const r of series)svg+='<circle cx="'+xx(+r.year-2019)+'" cy="'+yy(r.value)+'" r="5.1" fill="'+lineColors[l]+'"'+mark(r)+'><title>'+html(describe(r))+'</title></circle>';
 }
 svg+='</svg>';
 return card(label+' 抗藥性百分比－醫療相關感染（HO）',legend,svg,'圖 4-'+index+'-3-2，第 '+(67+4*index)+' 頁');
}
function hoStack(group,index){
 const [code,label,organism,maxY,maxCount]=group,rows=hoPoints.filter(r=>r.indicator===code&&r.record_type==='counts');
 const W=970,H=520,L=78,R=22,T=36,B=145,w=W-L-R,h=H-T-B,gw=w/6,bw=30;
 const legend='<div class="rsc-legend">'+levels.map(l=>'<span><strong>'+labels[l]+'</strong><i style="background:'+fills[l][0]+'"></i>I+R <i style="background:'+fills[l][1]+'"></i>S</span>').join('')+'</div>';
 let svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" xmlns="http://www.w3.org/2000/svg" aria-label="'+html(label+' 醫療相關感染菌株數 I+R/S 年度堆疊柱狀圖')+'"><rect width="'+W+'" height="'+H+'" fill="#fff"/>';
 const step=maxCount<=8000?1000:maxCount<=18000?2000:5000;
 for(let val=0;val<=maxCount;val+=step){const y=T+h-h*val/maxCount;svg+='<text x="'+(L-9)+'" y="'+(y+5)+'" text-anchor="end" font-size="13" fill="#222">'+val.toLocaleString('en-US')+'</text>'+(val===0?'<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="#c0c0c0"/>':'')}
 svg+='<text transform="translate(22,'+(T+h/2)+') rotate(-90)" text-anchor="middle" font-size="17" fill="#222">菌株數</text>';
 let missing=0;
 for(let yi=0;yi<6;yi++){const center=L+(yi+.5)*gw;if(yi)svg+='<line x1="'+(L+yi*gw)+'" x2="'+(L+yi*gw)+'" y1="'+(T+h)+'" y2="'+(H-16)+'" stroke="#d0d0d0"/>';
   for(let li=0;li<3;li++){
     const lev=levels[li],x=center+(li-1)*(bw+11)-bw/2;let sum=0;
     const pair=['I+R','S'].map(comp=>rows.find(r=>+r.year===2019+yi&&r.hospital_level===lev&&r.component===comp));
     if(pair.some(x=>!x)){missing++;continue}
     pair.forEach((r,j)=>{const v=+r.value,hh=h*v/maxCount,y=T+h-h*(sum+v)/maxCount;svg+='<rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+hh+'" fill="'+fills[lev][j]+'"'+mark(r)+'><title>'+html(describe(r))+'</title></rect>';sum+=v});
     svg+='<text x="'+(x+bw/2)+'" y="'+(T+h+14)+'" writing-mode="tb" font-size="12" fill="#222">'+labels[lev]+'</text>';
   }
   svg+='<text x="'+center+'" y="'+(H-12)+'" text-anchor="middle" font-size="16" font-weight="600" fill="#222">'+(108+yi)+'年</text>';
 }
 svg+='</svg>';
 return card(label+' 菌株數－醫療相關感染（HO）',legend+(missing?'<p>有 '+missing+' 組醫院年度的低比例柱體無法可靠估讀，已留白（非零值）。</p>':''),svg,'圖 4-'+index+'-3-1，第 '+(67+4*index)+' 頁');
}
function mdro(){
 const code=$('rscOrganism').value,group=mdroGroups.find(x=>x[0]===code)||mdroGroups[0];
 const index=mdroGroups.findIndex(x=>x[0]===code)+1,onset=$('rscOnset').value;const official=narrative.filter(r=>r.code===code&&r.indicator_type==='MDRO'&&r.onset===onset).map(narrativeRow);
 const title='<div class="rsc-intro"><strong>'+html(group[1])+'｜108–113 年醫院層級別監測</strong><p>感染來源：'+html(onset)+'，與年報第四章相同的醫院層級配色與年度編排。</p></div>';
 if(onset==='HO'){
   $('rscPlots').innerHTML=title+hoLine(group,index)+hoStack(group,index);
   shown=hoPoints.filter(r=>r.indicator===code&&r.onset==='HO');
   $('rscStatus').textContent=group[1]+'：HO 抗藥率六年折線圖與 I+R／S 堆疊柱狀圖；所有數值為圖形估讀。';
 } else if(code==='CRAB'&&onset==='CO+HO'){
   $('rscPlots').innerHTML=title+narrativePlot(code,'mdro')+lineChart()+stackChart('mdro_counts_onset','A. baumannii 菌株數－CO＋HO',['CO','HO'],14000,'圖 4-1-1-1，第 69 頁');
   shown=official.concat(basePoints.filter(r=>r.section==='mdro_resistance'||r.section==='mdro_counts_onset'));
   $('rscStatus').textContent='CRAB 的 CO＋HO 六年抗藥率與 CO／HO 堆疊圖已載入。';
 } else if(code==='CRAB'&&onset==='CO'){
   $('rscPlots').innerHTML=title+stackChart('mdro_counts_ast','A. baumannii 菌株數－社區相關感染（CO）',['I+R','S'],6000,'圖 4-1-2-1，第 70 頁')+
   statusFigure('CRAB／CO 抗藥率趨勢','圖 4-1-2-2，第 70 頁');
   shown=official.concat(basePoints.filter(r=>r.section==='mdro_counts_ast'));
   $('rscStatus').textContent='CRAB 的 CO I+R／S 圖已載入；CO 抗藥率仍待逐點核對。';
 } else {
   const page=68+4*(index-1)+(onset==='CO'?2:1);
   const figs=onset==='CO'?['4-'+index+'-2-1','4-'+index+'-2-2']:['4-'+index+'-1-1','4-'+index+'-1-2'];
   $('rscPlots').innerHTML=title+narrativePlot(code,'mdro')+sourceReference(group[1]+' '+onset,'圖 '+figs.join('、'),page);
   shown=official;
   $('rscStatus').textContent=group[1]+'／'+onset+'：目前 '+official.length+' 筆年報文字精確值；其他年報圖形尚無完整原始數表。可切換 HO 查看已標示為估讀值的六年圖表。';
 }
}
function addHover(){
 section.querySelectorAll('[data-point]').forEach(el=>{const r=points[Number(el.dataset.point)];if(!r)return;const fn=()=>{$('rscDetail').textContent=describe(r)};
 el.addEventListener('mouseenter',fn);el.addEventListener('focus',fn);el.addEventListener('click',fn);
 el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}})});
 section.querySelectorAll('[data-narrative-point]').forEach(el=>{
 const r=narrative[Number(el.dataset.narrativePoint)];if(!r)return;
 const fn=()=>{$('rscDetail').textContent=r.label+'：'+narrativeValue(r)+'；'+narrativeScope(r)+'。'+narrativeType[r.relation]+'，2024年報第'+r.source_page+'頁'+(r.note?'。'+r.note:'')};
 el.addEventListener('mouseenter',fn);el.addEventListener('focus',fn);el.addEventListener('click',fn);
 });
}
function table(){
 const cols=['section','record_type','indicator','year','onset','specimen','hospital_level','antibiotic','component','value','lower_pct','upper_pct','relation','unit','precision','source_figure','source_page','narrative_page','extraction_method','note'];
 $('rscTable').innerHTML='<table><caption>年報式圖表監測資料與來源／估讀註記</caption><thead><tr>'+cols.map(x=>'<th scope="col">'+x+'</th>').join('')+'</tr></thead><tbody>'+shown.map(r=>'<tr>'+cols.map(k=>'<td>'+html(k==='value'?fmt(r):r[k]||'—')+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
}
function render(){if(tab==='important')important();else mdro();$('rscDetail').textContent='將滑鼠移至圖中的色塊或資料點、點擊或按 Tab 聚焦，即可查看數值及來源。';$('rscCount').textContent='目前 '+shown.length+' 筆；含資料品質標記';$('rscCsvBtn').disabled=!shown.length;$('rscTableBtn').disabled=!shown.length;$('rscPngBtn').disabled=!$('rscPlots').querySelector('svg')&&!narrative.some(r=>r.code===$('rscOrganism').value&&(tab==='important'?!r.indicator_type:r.indicator_type==='MDRO'&&r.onset===$('rscOnset').value));$('rscTable').hidden=true;$('rscTableBtn').textContent='資料表';table();addHover();section.querySelectorAll('.rsc-figure-png').forEach((b,i)=>b.onclick=()=>exportSvg(b.closest('figure').querySelector('svg'),'report-'+tab+'-figure-'+(i+1)+'.png'))}

function setupSelectors(){
 const current=$('rscOrganism').value;
 const opts=tab==='important'?organisms.map(x=>[x[0],x[1]]):mdroGroups.map(x=>[x[0],x[1]]);
 $('rscOrganism').innerHTML=opts.map(([k,t])=>'<option value="'+html(k)+'">'+html(t)+'</option>').join('');
 if(opts.some(x=>x[0]===current))$('rscOrganism').value=current;
 $('rscOnsetWrap').hidden=tab==='important';
 if(tab==='mdro')$('rscOnset').value='HO';
}
$('rscOrganism').addEventListener('change',render);
$('rscOnset').addEventListener('change',render);
section.querySelectorAll('[data-rsc]').forEach(btn=>btn.onclick=()=>{tab=btn.dataset.rsc;section.querySelectorAll('[data-rsc]').forEach(x=>x.setAttribute('aria-pressed',String(x===btn)));setupSelectors();render()});
$('rscTableBtn').onclick=()=>{$('rscTable').hidden=!$('rscTable').hidden;$('rscTableBtn').textContent=$('rscTable').hidden?'資料表':'隱藏資料表'};
function download(data,name,type){let a=document.createElement('a'),u=URL.createObjectURL(new Blob([data],{type}));a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}
$('rscCsvBtn').onclick=()=>{const keys=['section','record_type','indicator','year','onset','specimen','hospital_level','antibiotic','component','value','lower_pct','upper_pct','relation','unit','precision','source_figure','source_page','narrative_page','extraction_method','note'];download('\uFEFF'+keys.join(',')+'\n'+shown.map(r=>keys.map(k=>'"'+String(r[k]??'').replaceAll('"','""')+'"').join(',')).join('\n'),'report-'+tab+'-with-precision.csv','text/csv;charset=utf-8')};
function exportSvg(svg,filename){
 if(!svg){$('rscStatus').textContent='目前沒有可下載的圖表';return}
 const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml;charset=utf-8'})),img=new Image();
 img.onload=()=>{const c=document.createElement('canvas');c.width=svg.viewBox.baseVal.width*2;c.height=svg.viewBox.baseVal.height*2;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);c.toBlob(blob=>{if(!blob)return;const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(u),1800)})};
 img.onerror=()=>{URL.revokeObjectURL(url);$('rscStatus').textContent='圖像匯出失敗，請改用 CSV'};
 img.src=url;
}
$('rscPngBtn').textContent='第一張圖 PNG';
$('rscPngBtn').onclick=()=>exportSvg($('rscPlots').querySelector('svg')||verifiedNarrativeSvg(),'report-'+tab+'-first-figure.png');
const sources=['./data/ar_2024_report_style_chart_estimates.csv','./data/ar_2024_mdro_HO_report_estimates.csv','./data/ar_2024_key_resistance_report_points.csv','./data/ar_2024_report_verified_narrative.json'];
Promise.allSettled(sources.map(url=>fetch(url,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status+' '+url);return r.text()}))).then(results=>{
 const got=i=>results[i].status==='fulfilled'?results[i].value:'';
 basePoints=got(0)?parse(got(0)):[];
 hoPoints=got(1)?parse(got(1)):[];
 const c=got(2),oldRows=c?c.trim().split(/\r?\n/):[],head=oldRows.shift()?.split(',')||[];
 kpPoints=oldRows.map(line=>Object.fromEntries(head.map((k,i)=>[k,line.split(',')[i]]))).filter(r=>r.domain==='important').map(r=>({section:'important',record_type:'resistance',indicator:'K_pneumoniae',year:r.year,onset:'CO+HO',specimen:r.specimen,hospital_level:'national',antibiotic:r.antibiotic,component:'R',value:r.resistance_pct,unit:'percent',precision:'narrative_exact',source_figure:r.source_figure,source_page:r.printed_page,narrative_page:r.printed_page,extraction_method:'report_narrative'}));
 const narrativeJson=got(3)?JSON.parse(got(3)):null;
 narrative=(narrativeJson?.records||[]).filter(r=>r&&r.code&&['exact','range','range_approx','less_than','greater_than'].includes(r.relation)&&Number.isInteger(Number(r.year))&&Number(r.year)>=2019&&Number(r.year)<=2024&&(r.lower_pct===null||Number(r.lower_pct)>=0&&Number(r.lower_pct)<=100)&&(r.upper_pct===null||Number(r.upper_pct)>=0&&Number(r.upper_pct)<=100));
 if(!narrative.length&&!basePoints.length&&!hoPoints.length)throw Error('無可用年報文字或趨勢資料');
 const accurate=narrative.filter(r=>r.relation==='exact'&&r.indicator_type==='MDRO'&&r.onset==='CO+HO');
 basePoints.forEach(p=>{
  if(p.section!=='mdro_resistance')return;
  const n=accurate.find(x=>x.code===p.indicator&&String(x.year)===String(p.year)&&x.hospital_level===p.hospital_level);
  if(n){p.value=String(n.lower_pct);p.precision='narrative_exact';p.narrative_page=n.source_page}
 });
 points=basePoints.concat(hoPoints,kpPoints);
 setupSelectors();render();
 const failures=results.map((x,i)=>x.status==='rejected'?sources[i]:'').filter(Boolean);
 if(failures.length)$('rscStatus').textContent+='；注意：'+failures.length+' 個資料檔案暫無法讀取，已使用現有可驗證資料顯示。';
}).catch(e=>{$('rscStatus').textContent='年報資料載入失敗：'+e.message});
})();
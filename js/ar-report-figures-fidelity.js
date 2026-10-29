(()=>{'use strict';
const root=document.querySelector('main'),old=document.getElementById('resistanceReportPanels');if(!root)return;
const section=document.createElement('section');section.className='panel report-style-charts';section.id='reportStyleCharts';
section.innerHTML=
'<div class="rsc-heading"><div><div class="eyebrow">REPORT STYLE · 2024 EDITION</div><h2>重要菌種抗藥性與多重抗藥菌趨勢</h2><p>比照年報圖型、分圖結構及固定配色。圖形讀取數值以「約」標示，不作為正式精確統計資料。</p></div><div class="rsc-actions"><button type="button" id="rscTableBtn">資料表</button><button type="button" id="rscCsvBtn">CSV 下載</button><button type="button" id="rscPngBtn">PNG 下載</button></div></div>'+
'<div class="rsc-tabs"><button type="button" data-rsc="important" aria-pressed="true">重要菌種抗藥性</button><button type="button" data-rsc="mdro" aria-pressed="false">多重抗藥菌趨勢（CRAB）</button></div>'+
'<div class="rsc-controls"><label>菌種／指標<select id="rscOrganism"><option>A. baumannii</option></select></label><label>年報版本<select id="rscEdition"><option value="2024">2024 年報（113 年）</option></select></label></div>'+
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
let points=[],shown=[],tab='important';
function parse(txt){const a=txt.trim().split(/\r?\n/),h=a.shift().split(',');return a.map(line=>{const cells=line.split(',');return Object.fromEntries(h.map((k,i)=>[k,cells[i]??'']))}).filter(r=>{const v=Number(r.value);return Number.isFinite(v)&&v>=0&&((r.unit==='percent'&&v<=100)||r.unit==='isolates')&&['narrative_exact','chart_estimate'].includes(r.precision)})}
const fmt=r=>(r.precision==='chart_estimate'?'約 ':'')+(r.unit==='percent'?Number(r.value).toFixed(1)+'%':Number(r.value).toLocaleString('zh-TW')+' 株');
function describe(r){return[r.indicator,r.year+'（民國'+(+r.year-1911)+'）',labels[r.hospital_level]||r.hospital_level,labels[r.onset]||r.onset,labels[r.specimen]||r.specimen,r.antibiotic||r.component,fmt(r),r.precision==='chart_estimate'?'圖形估讀，非精確值':'年報文字核對值','圖'+r.source_figure+'，第'+r.source_page+'頁'].filter(Boolean).join(' · ')}
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
function important(){
 $('rscOrganism').innerHTML='<option value="aba">Acinetobacter baumannii</option>';
 $('rscPlots').innerHTML='<div class="rsc-intro"><strong>Acinetobacter baumannii 抗生素抗藥性百分比</strong><p>（A）社區與醫療（CO+HO）相關感染</p></div>'+
 '<div class="rsc-grid">'+horizontal('CO+HO','all','（A）CO＋HO','全部檢體')+horizontal('CO+HO','blood','（A）CO＋HO','血液檢體')+'</div>'+
 '<div class="rsc-grid">'+horizontal('CO','all','（B）社區相關感染（CO）','全部檢體')+horizontal('HO','all','（C）醫療相關感染（HO）','全部檢體')+'</div>';
 shown=points.filter(r=>r.section==='important');
 $('rscStatus').textContent='與年報一致的（A）（B）（C）分圖配置；四格均使用紫色 0–100% 水平長條圖。';
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
function mdro(){
 $('rscOrganism').innerHTML='<option value="CRAB">CRAB（Carbapenem-resistant A. baumannii）</option>';
 $('rscPlots').innerHTML='<div class="rsc-intro"><strong>CRAB｜108–113 年醫院層級別監測</strong><p>與年報一樣：四系列折線圖及按年度、醫院層級分組的堆疊柱狀圖。</p></div>'+
 lineChart()+
 stackChart('mdro_counts_onset','A. baumannii 菌株數－CO＋HO',['CO','HO'],14000,'圖 4-1-1-1，第 69 頁')+
 stackChart('mdro_counts_ast','A. baumannii 菌株數－社區相關感染（CO）',['I+R','S'],6000,'圖 4-1-2-1，第 70 頁');
 shown=points.filter(r=>r.section.startsWith('mdro'));
 $('rscStatus').textContent='CRAB 六年四系列折線圖 + CO／HO 堆疊柱狀圖 + CO 的 I+R／S 堆疊柱狀圖；圖形估讀值均加註。';
}
function addHover(){
 section.querySelectorAll('[data-point]').forEach(el=>{const r=points[Number(el.dataset.point)];if(!r)return;const fn=()=>{$('rscDetail').textContent=describe(r)};
 el.addEventListener('mouseenter',fn);el.addEventListener('focus',fn);el.addEventListener('click',fn);
 el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}})});
}
function table(){
 const cols=['section','indicator','year','onset','specimen','hospital_level','antibiotic','component','value','unit','precision','source_figure','source_page'];
 $('rscTable').innerHTML='<table><caption>年報式圖表監測資料與來源／估讀註記</caption><thead><tr>'+cols.map(x=>'<th scope="col">'+x+'</th>').join('')+'</tr></thead><tbody>'+shown.map(r=>'<tr>'+cols.map(k=>'<td>'+html(k==='value'?fmt(r):r[k]||'—')+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
}
function render(){if(tab==='important')important();else mdro();$('rscCount').textContent='目前 '+shown.length+' 筆';table();addHover();section.querySelectorAll('.rsc-figure-png').forEach((b,i)=>b.onclick=()=>exportSvg(b.closest('figure').querySelector('svg'),'report-'+tab+'-figure-'+(i+1)+'.png'))}
section.querySelectorAll('[data-rsc]').forEach(btn=>btn.onclick=()=>{tab=btn.dataset.rsc;section.querySelectorAll('[data-rsc]').forEach(x=>x.setAttribute('aria-pressed',String(x===btn)));render()});
$('rscTableBtn').onclick=()=>{$('rscTable').hidden=!$('rscTable').hidden;$('rscTableBtn').textContent=$('rscTable').hidden?'資料表':'隱藏資料表'};
function download(data,name,type){let a=document.createElement('a'),u=URL.createObjectURL(new Blob([data],{type}));a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}
$('rscCsvBtn').onclick=()=>{const keys=['section','indicator','year','onset','specimen','hospital_level','antibiotic','component','value','unit','precision','source_figure','source_page'];download('\uFEFF'+keys.join(',')+'\n'+shown.map(r=>keys.map(k=>'"'+String(r[k]??'').replaceAll('"','""')+'"').join(',')).join('\n'),'report-'+tab+'-with-precision.csv','text/csv;charset=utf-8')};
function exportSvg(svg,filename){
 if(!svg){$('rscStatus').textContent='目前沒有可下載的圖表';return}
 const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml;charset=utf-8'})),img=new Image();
 img.onload=()=>{const c=document.createElement('canvas');c.width=svg.viewBox.baseVal.width*2;c.height=svg.viewBox.baseVal.height*2;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);c.toBlob(blob=>{if(!blob)return;const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(u),1800)})};
 img.onerror=()=>{URL.revokeObjectURL(url);$('rscStatus').textContent='圖像匯出失敗，請改用 CSV'};
 img.src=url;
}
$('rscPngBtn').textContent='第一張圖 PNG';
$('rscPngBtn').onclick=()=>exportSvg($('rscPlots').querySelector('svg'),'report-'+tab+'-first-figure.png');
fetch('./data/ar_2024_report_style_chart_estimates.csv',{cache:'no-store'}).then(r=>r.ok?r.text():Promise.reject(Error('HTTP '+r.status))).then(t=>{points=parse(t);if(points.length!==124)throw Error('資料列數不符 '+points.length);render()}).catch(e=>$('rscStatus').textContent='圖表資料載入失敗：'+e.message);
})();
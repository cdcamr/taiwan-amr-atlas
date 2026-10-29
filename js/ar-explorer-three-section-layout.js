(()=>{'use strict';
const main=document.querySelector('main');
const report=document.getElementById('reportFigure21');
const detailPlot=document.getElementById('chartTitle')?.closest('.panel');
const filterPanel=document.getElementById('edition')?.closest('.panel');
const compare=document.getElementById('compareSection');
const metrics=main?.querySelector('.cards');
if(!main||!report||!detailPlot||!filterPanel||!compare)return;

const icons={
 rank:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg>',
 trend:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 19h18M5 15l5-5 4 3 5-7"/><circle cx="5" cy="15" r="1"/><circle cx="10" cy="10" r="1"/><circle cx="14" cy="13" r="1"/><circle cx="19" cy="6" r="1"/></svg>',
 compare:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18M5 16l4-3 4 2 6-9"/><rect x="5" y="17" width="3" height="3"/><rect x="11" y="13" width="3" height="7"/><rect x="17" y="11" width="3" height="9"/></svg>',
 report:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11M3 14h18"/></svg>'
};
const actions=[
 {kind:'rank',label:'排行柱狀圖',hint:'檢視單年度菌種數量／占比'},
 {kind:'trend',label:'歷年折線圖',hint:'檢視所選菌種六年變化'},
 {kind:'compare',label:'多菌種比較',hint:'折線圖及分組柱狀圖'},
 {kind:'report',label:'年報表格',hint:'比對六年各菌種數量'}
];
const root=document.createElement('section');
root.id='isolateRankingSection';
root.className='isolate-primary';
root.setAttribute('aria-labelledby','isolateRankingHeading');
root.innerHTML='<div class="isolate-heading"><div><div class="eyebrow">SECTION 01 · ISOLATE RANKING</div><h2 id="isolateRankingHeading">分離菌株排名與組成</h2><p>主圖保留年報式堆疊柱狀圖。可直接切換年報版本、檢體及感染來源；其他圖型由下方圖示開啟。</p></div><span class="isolate-main-label">主要圖表：堆疊柱狀圖</span></div>'+
'<div id="isolateMetricsSlot"></div><div id="isolateStackSlot"></div>'+
'<div class="isolate-secondary-heading"><h3>其他分析圖表</h3><p>選擇圖示查看折線圖、柱狀圖或年報表格，不會更動上方主要堆疊圖。</p></div>'+
'<div class="isolate-shortcuts" role="group" aria-label="展開分離菌株其他圖表">'+actions.map(item=>
 '<button type="button" class="isolate-icon-action" data-isolate-kind="'+item.kind+'" aria-expanded="false" aria-pressed="false" aria-controls="isolateSecondary" title="'+item.hint+'">'+icons[item.kind]+'<span class="isolate-icon-text"><strong>'+item.label+'</strong><small>'+item.hint+'</small></span></button>').join('')+'</div>'+
'<div id="isolateSecondary" class="isolate-secondary" hidden><div class="isolate-secondary-top"><div><div class="eyebrow">ADDITIONAL ANALYSIS</div><h3 id="isolateSecondaryTitle">延伸分析</h3><p id="isolateSecondaryDesc">可利用下方選單調整年度及菌種。</p></div><button type="button" id="isolateCloseSecondary" class="isolate-close" aria-label="收起其他圖表並返回主要堆疊柱狀圖">✕ <span>收起圖表</span></button></div><div id="isolateFilterSlot"></div><div id="isolateSingleSlot"></div><div id="isolateCompareSlot"></div></div>';
report.before(root);
const navigatorBar=document.createElement('nav');
navigatorBar.className='ar-section-links';
navigatorBar.setAttribute('aria-label','AR 監測三大主區塊');
navigatorBar.innerHTML='<a href="#isolateRankingSection"><span aria-hidden="true">▥</span> 分離菌株排名</a><a href="#arImportantSection"><span aria-hidden="true">▤</span> 重要菌種抗藥性</a><a href="#arMdroSection"><span aria-hidden="true">▧</span> MDRO 趨勢</a>';
root.before(navigatorBar);
if(metrics)root.querySelector('#isolateMetricsSlot').append(metrics);
root.querySelector('#isolateStackSlot').append(report);
root.querySelector('#isolateFilterSlot').append(filterPanel);
root.querySelector('#isolateSingleSlot').append(detailPlot);
root.querySelector('#isolateCompareSlot').append(compare);
const secondary=root.querySelector('#isolateSecondary'),title=root.querySelector('#isolateSecondaryTitle'),desc=root.querySelector('#isolateSecondaryDesc');
const buttons=[...root.querySelectorAll('[data-isolate-kind]')],closeButton=root.querySelector('#isolateCloseSecondary');
let active=null;
function setMode(kind,focusRegion){
 if(!actions.some(x=>x.kind===kind))return;
 if(active===kind&&!secondary.hidden){collapse();return}
 active=kind;secondary.hidden=false;filterPanel.hidden=false;
 const item=actions.find(x=>x.kind===kind);
 title.textContent=item.label;
 desc.textContent=kind==='compare'?'可切換折線圖或分組柱狀圖，並選取最多 4 種菌種。':kind==='trend'?'此處的折線圖呈現選定年報版本與菌種的歷年趨勢。':kind==='rank'?'此處顯示單年度的菌種排名柱狀圖。':'此處提供年報表 2-1 六年各菌種數量。';
 const showCompare=kind==='compare';
 detailPlot.hidden=showCompare;compare.hidden=!showCompare;
 const graphType=document.getElementById('chartType');
 if(!showCompare){
   if(kind==='trend'&&graphType)graphType.value='line';
   if(kind==='rank'&&graphType)graphType.value='bar';
   const view=kind==='trend'?'trend':kind==='rank'?'rank':'report';
   const viewButton=filterPanel.querySelector('[data-view="'+view+'"]');
   viewButton?.click();
 }else{
   const table=compare.querySelector('#compareTabular');
   if(table&&table.hidden===false){} // preserve current in-panel table state
 }
 buttons.forEach(b=>{
   const selected=b.dataset.isolateKind===kind;
   b.setAttribute('aria-expanded',String(selected));
   b.setAttribute('aria-pressed',String(selected));
 });
 if(focusRegion)title.setAttribute('tabindex','-1'),title.focus({preventScroll:true});
 const url=new URL(location.href);url.searchParams.set('extraChart',kind);history.replaceState({},'',url);
}
function collapse(){
 const previously=active;
 active=null;secondary.hidden=true;
 buttons.forEach(b=>{b.setAttribute('aria-expanded','false');b.setAttribute('aria-pressed','false')});
 const url=new URL(location.href);url.searchParams.delete('extraChart');history.replaceState({},'',url);
 if(previously)buttons.find(b=>b.dataset.isolateKind===previously)?.focus({preventScroll:true});
}
buttons.forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.isolateKind,true)));
closeButton.addEventListener('click',collapse);
secondary.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();collapse()}});
filterPanel.hidden=true;detailPlot.hidden=true;compare.hidden=true;secondary.hidden=true;
const requested=new URLSearchParams(location.search).get('extraChart');
if(actions.some(x=>x.kind===requested))setMode(requested,false);
const mainIntro=main.querySelector('h1 + p');
if(mainIntro)mainIntro.textContent='依序查看分離菌株排名、重要菌種抗藥性及多重抗藥菌（MDRO）趨勢。排名以堆疊柱狀圖為主，其他分析圖型改由圖示開啟。';
})();
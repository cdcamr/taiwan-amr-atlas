(()=>{'use strict';
const $=id=>document.getElementById(id);
const species=$('abSpecies'),category=$('abCategory'),search=$('abSearch'),show=$('abShow');
if(!species||!category)return;
const holder=species.closest('.ab-toolbar');if(!holder)return;
const yearLabel=document.createElement('label');yearLabel.textContent='監測年度';yearLabel.innerHTML='監測年度 <select id="abAvailableYear" aria-label="已完成核對的圖譜年度"><option value="2024">2024（已核對）</option></select>';
const drugLabel=document.createElement('label');drugLabel.innerHTML='單一抗生素 <select id="abExactDrug" aria-label="依菌種與類別連動的抗生素"><option value="all">全部有資料藥品</option></select>';
holder.insertBefore(yearLabel,species.closest('label'));
holder.insertBefore(drugLabel,show.closest('label'));
const drug=$('abExactDrug');
const origin=window.fetch.bind(window);
let entries=[];
const allowedSet=new Set(['pen','ceph','other']);
const categories={pen:['AM','SAM','AMC','TZP'],ceph:['CZ','FOX','CXM','FUR','CTX','CRO','CFM','CFP','CAZ','FEP']};
const classify=a=>categories.pen.includes(a)?'pen':categories.ceph.includes(a)?'ceph':'other';
const unquote=s=>String(s).replace(/^"|"$/g,'');
function permitted(){
 const org=species.value,cat=category.value;
 return [...new Set(entries.filter(r=>(org==='all'||r.organism===org)&&(cat==='all'||classify(r.antibiotic)===cat)).map(r=>r.antibiotic))].sort()
}
function recompute(){
 const available=permitted(),prior=drug.value;
 drug.innerHTML='<option value="all">全部有資料藥品</option>'+available.map(v=>'<option value="'+v+'">'+v+'</option>').join('');
 drug.value=available.includes(prior)?prior:'all';
 filterGrid();
}
function filterGrid(){
 const selected=drug.value;
 document.querySelectorAll('#abModernGrid .ab-row').forEach(row=>{
  let headers=row.querySelectorAll('.ab-label'), cells=row.querySelectorAll('.ab-cell,.ab-empty');
  if(selected==='all'){row.hidden=false;row.style.removeProperty('--cols');[...headers,...cells].forEach(x=>x.hidden=false);return}
  if(headers.length>1){
   [...headers].slice(1).forEach(h=>{h.hidden=h.textContent.trim()!==selected});
   row.style.setProperty('--cols','1');
  }else if(cells.length){
   cells.forEach(c=>{const code=c.dataset.code||'';c.hidden=code!==selected});
   row.style.setProperty('--cols','1');
  }
 });
 const status=$('abCount');
 if(status&&selected!=='all')status.textContent+=' · 抗生素 '+selected;
}
const notify=()=>{const el=$('abModernDetail');if(el)el.textContent='篩選條件已更新。點選熱圖格子查看詳細資料。'};
const updateUrl=()=>{let u=new URL(location.href);u.searchParams.set('antibiotic',drug.value);history.replaceState({},'',u)};
drug.addEventListener('change',()=>{filterGrid();notify();updateUrl()});
[species,category].forEach(x=>x.addEventListener('change',()=>{queueMicrotask(()=>{recompute();notify()})}));
if(search)search.addEventListener('input',()=>queueMicrotask(filterGrid));
if(show)show.addEventListener('change',()=>queueMicrotask(filterGrid));
const target=$('abModernGrid');
if(target){let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;filterGrid()})}).observe(target,{childList:true})}
origin('./data/antibiogram_2024_validated.csv',{cache:'no-store'}).then(r=>r.ok?r.text():Promise.reject(Error('HTTP '+r.status))).then(s=>{
 let lines=s.trim().split(/\r?\n/);let cols=lines.shift().split(',');let oi=cols.indexOf('organism'),ai=cols.indexOf('antibiotic');
 entries=lines.map(l=>{let cells=l.split(',');return{organism:unquote(cells[oi]),antibiotic:unquote(cells[ai])}});
 recompute();
 const p=new URLSearchParams(location.search),a=p.get('antibiotic');
 if(a&&permitted().includes(a)){drug.value=a;filterGrid()}
}).catch(()=>{drug.disabled=true;yearLabel.title='目前僅完成 2024 年完整敏感性圖譜核對'});
const originalReset=$('abModernReset');if(originalReset)originalReset.addEventListener('click',()=>{drug.value='all';filterGrid()});
const originalExport=$('abModernCsv');if(originalExport)originalExport.addEventListener('click',e=>{
 if(drug.value==='all')return;
 e.stopImmediatePropagation();
 const org=species.value,cat=category.value, term=search?.value.toLowerCase().trim()||'';
 const records=entries.filter(r=>r.antibiotic===drug.value&&(org==='all'||r.organism===org)&&(cat==='all'||classify(r.antibiotic)===cat)&&(!term||[r.organism,r.antibiotic].some(x=>x.toLowerCase().includes(term))));
 const all=records.map(r=>r.organism+'|'+r.antibiotic);
 origin('./data/antibiogram_2024_validated.csv').then(r=>r.text()).then(t=>{let rows=t.trim().split(/\r?\n/),headers=rows.shift();let csv=headers+'\n'+rows.filter(line=>{let x=line.split(',');return all.includes(unquote(x[1])+'|'+unquote(x[2]))}).join('\n');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='antibiogram-2024-'+drug.value+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
},true);
})();
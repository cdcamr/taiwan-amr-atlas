"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const cats={news:"最新消息",event:"活動資訊",report:"監測報告",resource:"研究與資源"};
  let remoteEntries=[],entries=[];
  const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
  const element=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el};
  const url=source=>{try{const u=new URL(source,location.href);return u.protocol==="https:"?u.href:null}catch{return null}};
  const local=()=>window.AMRNewsPreview?window.AMRNewsPreview.list().filter(a=>a.status==="published"): [];
  const allowed=a=>a && a.status==="published" && Object.hasOwn(cats,a.category) && /^[A-Za-z0-9_-]{3,100}$/.test(a.id||"") && /^\d{4}-\d{2}-\d{2}$/.test(a.published_at||"") && a.published_at<=today() && typeof a.title==="string";
  const setTheme=()=>{document.body.classList.toggle("light");try{localStorage.setItem("amr-news-theme",document.body.classList.contains("light")?"light":"dark")}catch(_){}};
  try {if(localStorage.getItem("amr-news-theme")==="light")document.body.classList.add("light")}catch(_){}
  $("themeToggle").onclick=setTheme;
  function showDetail(article){
    $("articles").hidden=true;
    $("articleDetail").hidden=false;
    const body=$("detailBody");
    body.replaceChildren();
    body.append(element("span","tag",cats[article.category]||"消息"));
    if(article.local_preview)body.append(element("span","tag demo-tag","本機示意"));
    body.append(element("h2","",article.title),element("p","meta",(article.published_at||"")+(article.featured?" · 精選":"")));
    body.append(element("p","",article.body||article.summary||""));
    if(article.event_date)body.append(element("p","meta","活動日期："+article.event_date));
    const link=url(article.link_url);
    if(link){const p=element("p"),a=element("a","","開啟相關資源 ↗");a.href=link;a.target="_blank";a.rel="noopener noreferrer";p.append(a);body.append(p)}
    if(article.local_preview)body.append(element("p","small","本篇僅為此瀏覽器的示意發布，其他訪客無法看到。"));
    history.replaceState(null,"","#article="+encodeURIComponent(article.id));
  }
  function showList(clearHash){
    const keyword=$("search").value.trim().toLocaleLowerCase();
    const category=$("category").value;
    const results=entries.filter(a=>(category==="all"||a.category===category)&&[a.title,a.summary,Array.isArray(a.tags)?a.tags.join(" "):""].join(" ").toLocaleLowerCase().includes(keyword))
      .sort((a,b)=>($("order").value==="oldest"?1:-1)*String(a.published_at||"").localeCompare(String(b.published_at||"")));
    $("articles").replaceChildren();$("articles").hidden=false;$("articleDetail").hidden=true;
    for(const article of results){
      const card=element("article","item");
      card.append(element("span","tag",cats[article.category]||"消息"));
      if(article.local_preview)card.append(element("span","tag demo-tag","本機示意"));
      if(article.featured)card.append(element("span","tag","精選"));
      card.append(element("p","meta",article.published_at||""));
      const heading=element("h2"),a=element("a","",article.title);a.href="#article="+encodeURIComponent(article.id);
      a.onclick=e=>{e.preventDefault();showDetail(article)};
      heading.append(a);
      card.append(heading,element("p","muted",article.summary||""));
      if(article.event_date)card.append(element("p","meta","活動日期："+article.event_date));
      $("articles").append(card);
    }
    $("status").textContent=results.length?"共 "+results.length+" 則消息":"目前沒有符合條件的消息；可由後台建立示意內容。";
    if(clearHash)history.replaceState(null,"",location.pathname+location.search);
  }
  function sync(showHash){
    const localPublished=local().filter(allowed).map(a=>({...a,local_preview:true}));
    const ids=new Set(localPublished.map(a=>a.id));
    entries=localPublished.concat(remoteEntries.filter(a=>!ids.has(a.id)));
    for(const k of Object.keys(cats))$("count-"+k).textContent=entries.filter(a=>a.category===k).length;
    $("demoNotice").hidden=!localPublished.length;
    if(showHash){
      const hash=decodeURIComponent(location.hash.slice(1));
      if(hash.startsWith("article=")){
        const article=entries.find(a=>a.id===hash.slice(8));
        if(article){showDetail(article);return}
      }
    }
    showList(false);
  }
  $("back").onclick=()=>showList(true);
  for(const id of ["category","search","order"])$(id).addEventListener(id==="search"?"input":"change",()=>showList(true));
  window.addEventListener("storage",e=>{if(e.key==="taiwan-amr-news-local-preview-v1")sync(true)});
  window.addEventListener("amr-news-local-changed",()=>sync(true));
  sync(true);
  fetch("./data/news/manifest.json",{cache:"no-store"})
    .then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()})
    .then(result=>{remoteEntries=(Array.isArray(result.articles)?result.articles:[]).filter(allowed);sync(true)})
    .catch(()=>{$("status").textContent="公開清單無法載入；本機示意文章仍可預覽。";});
})();

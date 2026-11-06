"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const cats={news:"最新消息",event:"活動資訊",report:"監測報告",resource:"研究與資源"};
  const i18n=window.AMRNewsI18n;
  const ui={
    zh:{categories:cats,local:"僅本機預覽",pending:"共用部署中",featured:"精選",event:"活動日期：",
      open:"開啟相關資源 ↗",count:n=>"共 "+n+" 則消息",
      empty:"目前沒有符合條件的消息；可由後台建立示意內容。",
      unavailable:"部分欄位尚無譯文，已顯示原文。",back:"← 返回列表",
      onlyLocal:"本篇仍僅存於此瀏覽器，手機無法查看。請於原後臺使用批次同步。",
      awaiting:"本篇已提交共用網站，若手機尚未看到，請等待 GitHub Pages 部署完成後重新載入。"},
    en:{categories:{news:"News",event:"Events",report:"Surveillance reports",resource:"Research & resources"},
      local:"Local preview only",pending:"Public deployment pending",featured:"Featured",event:"Event date: ",
      open:"Open related resource ↗",count:n=>n+" articles",
      empty:"No matching articles. You can create an article in the editor.",
      unavailable:"Some sections are not yet translated and are shown in the original language.",back:"← Back to articles",
      onlyLocal:"This article is stored only in this browser. Publish it to the shared website to view it on other devices.",
      awaiting:"The article was submitted to the shared website. Please reload once GitHub Pages has deployed."},
    ja:{categories:{news:"お知らせ",event:"イベント",report:"サーベイランス報告",resource:"研究・資料"},
      local:"この端末のみ",pending:"公開反映待ち",featured:"おすすめ",event:"開催日：",
      open:"関連資料を開く ↗",count:n=>n+"件の記事",
      empty:"該当する記事がありません。編集画面から登録できます。",
      unavailable:"一部の項目には翻訳がなく、原文を表示しています。",back:"← 一覧に戻る",
      onlyLocal:"この記事はこのブラウザーのみに保存されています。別の端末で閲覧するには共通サイトへ公開してください。",
      awaiting:"共通サイトに送信済みです。GitHub Pagesの反映後に再読み込みしてください。"}
  };
  const currentLocale=()=>i18n?.currentLanguage?.()||"zh";
  const strings=()=>ui[currentLocale()]||ui.zh;
  const localized=article=>i18n?.localize?.(article,currentLocale())||article;
  let remoteEntries=[],entries=[];
  const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
  const element=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el};
  const url=source=>{try{const u=new URL(source,location.href);return u.protocol==="https:"?u.href:null}catch{return null}};
  const local=()=>window.AMRNewsPreview?window.AMRNewsPreview.list().filter(a=>a.status==="published"): [];
  const allowed=a=>a && a.status==="published" && Object.hasOwn(cats,a.category) && /^[A-Za-z0-9_-]{3,100}$/.test(a.id||"") && /^\d{4}-\d{2}-\d{2}$/.test(a.published_at||"") && a.published_at<=today() && typeof a.title==="string";
  // Shared js/site-preferences.js restores theme, and site-branding.js owns its toggle.
  function showDetail(article){
    const lang=strings(),view=localized(article);
    $("articles").hidden=true;
    $("articleDetail").hidden=false;
    $("back").textContent=lang.back;
    const body=$("detailBody");
    body.replaceChildren();
    body.append(element("span","tag",lang.categories[article.category]||"News"));
    if(article.local_preview)body.append(element("span","tag demo-tag",lang.local));
    if(article.public_pending)body.append(element("span","tag pending-tag",lang.pending));
    body.append(element("h2","",view.title),element("p","meta",
      (article.published_at||"")+(article.featured?" · "+lang.featured:"")));
    if(view.translationFallback){
      body.append(element("p","translation-note",lang.unavailable));
    }
    // The image sources stay unchanged. Alt text and captions follow the selected language.
    if(window.AMRNewsMedia&&Array.isArray(view.images)){
      const gallery=window.AMRNewsMedia.gallery(view.images,{allowInline:!!article.local_preview});
      if(gallery.children.length)body.append(gallery);
    }
    body.append(element("p","article-content",view.body||view.summary||""));
    if(article.event_date)body.append(element("p","meta",lang.event+article.event_date));
    const link=url(article.link_url);
    if(link){
      const p=element("p"),a=element("a","",lang.open);
      a.href=link;a.target="_blank";a.rel="noopener noreferrer";
      p.append(a);body.append(p);
    }
    if(article.local_preview)body.append(element("p","small",lang.onlyLocal));
    if(article.public_pending)body.append(element("p","small",lang.awaiting));
    history.replaceState(null,"","#article="+encodeURIComponent(article.id));
  }
  function showList(clearHash){
    const lang=strings();
    const keyword=$("search").value.trim().toLocaleLowerCase();
    const category=$("category").value;
    const results=entries.map(article=>({article,view:localized(article)}))
      .filter(({article,view})=>(category==="all"||article.category===category)
        &&[view.title,view.summary,view.body,article.title,article.summary,
          Array.isArray(article.tags)?article.tags.join(" "):""]
          .join(" ").toLocaleLowerCase().includes(keyword))
      .sort((a,b)=>($("order").value==="oldest"?1:-1)
        *String(a.article.published_at||"").localeCompare(String(b.article.published_at||"")));
    $("articles").replaceChildren();$("articles").hidden=false;$("articleDetail").hidden=true;
    for(const {article,view} of results){
      const card=element("article","item");
      card.append(element("span","tag",lang.categories[article.category]||"News"));
      if(article.local_preview)card.append(element("span","tag demo-tag",lang.local));
      if(article.public_pending)card.append(element("span","tag pending-tag",lang.pending));
      if(article.featured)card.append(element("span","tag",lang.featured));
      card.append(element("p","meta",article.published_at||""));
      if(window.AMRNewsMedia&&Array.isArray(view.images)){
        const cover=window.AMRNewsMedia.gallery(view.images,{allowInline:!!article.local_preview,cover:true});
        if(cover.children.length)card.append(cover);
      }
      const heading=element("h2"),a=element("a","",view.title);
      a.href="#article="+encodeURIComponent(article.id);
      a.onclick=e=>{e.preventDefault();showDetail(article)};
      heading.append(a);
      card.append(heading,element("p","muted",view.summary||""));
      if(view.translationFallback)card.append(element("p","translation-note",lang.unavailable));
      if(article.event_date)card.append(element("p","meta",lang.event+article.event_date));
      $("articles").append(card);
    }
    $("status").textContent=results.length?lang.count(results.length):lang.empty;
    if(clearHash)history.replaceState(null,"",location.pathname+location.search);
  }
  function sync(showHash){
    const localPublished=local().filter(allowed).map(a=>({
      ...a,local_preview:!a.public_synced_at,public_pending:!!a.public_synced_at
    }));
    const publiclyAvailable=new Set(remoteEntries.map(a=>a.id));
    // A successfully migrated article should use the shared version once Pages serves it.
    // Until then, retain a clearly marked local placeholder instead of hiding it.
    // Once a shared article with the same ID is available, always use it instead of an older browser-local preview.
    const localVisible=localPublished.filter(a=>!publiclyAvailable.has(a.id));
    const ids=new Set(localVisible.map(a=>a.id));
    entries=localVisible.concat(remoteEntries.filter(a=>!ids.has(a.id)));
    for(const k of Object.keys(cats))$("count-"+k).textContent=entries.filter(a=>a.category===k).length;
    const localOnly=localVisible.filter(a=>a.local_preview).length;
    const awaiting=localVisible.filter(a=>a.public_pending).length;
    $("demoNotice").hidden=!localOnly&&!awaiting;
    $("demoNotice").textContent=[
      localOnly?"有 "+localOnly+" 則消息仍僅存於此瀏覽器，請到後臺使用「一次同步既有已發布消息」，才可由手機查看。":"",
      awaiting?"有 "+awaiting+" 則已提交共用網站，等待 GitHub Pages 部署；完成後手機可直接由此網址查閱。":""
    ].filter(Boolean).join(" ");
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
  window.addEventListener("storage",e=>{
    if(e.key==="taiwan-amr-news-local-preview-v1"||e.key==="taiwan-amr-platform-language")sync(true);
  });
  // The shared language selector is added after this script by site-branding.js.
  // Delegation lets the already-open page re-render when that selector changes.
  document.addEventListener("change",event=>{
    if(event.target?.id==="siteLanguage"||event.target?.id==="lang")sync(true);
  });
  window.addEventListener("amr-news-local-changed",()=>sync(true));
  sync(true);
  fetch("./data/news/manifest.json",{cache:"no-store"})
    .then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()})
    .then(result=>{remoteEntries=(Array.isArray(result.articles)?result.articles:[]).filter(allowed);sync(true)})
    .catch(()=>{$("status").textContent="公開清單無法載入；本機示意文章仍可預覽。";});
})();

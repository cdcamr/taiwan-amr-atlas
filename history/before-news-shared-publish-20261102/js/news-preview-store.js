"use strict";
(() => {
  const KEY = "taiwan-amr-news-local-preview-v1";
  const MAX_ARTICLES = 100;
  const MAX_LENGTH = 3200000;
  const read = () => {
    try {
      const raw=localStorage.getItem(KEY);
      const parsed=raw?JSON.parse(raw):[];
      return Array.isArray(parsed)?parsed.filter(a=>a && typeof a==="object" && typeof a.id==="string" && /^[A-Za-z0-9_-]{3,100}$/.test(a.id)).slice(0,MAX_ARTICLES):[];
    } catch (_) { return []; }
  };
  const write = items => {
    const text=JSON.stringify(items);
    if(items.length>MAX_ARTICLES||text.length>MAX_LENGTH) throw Error("示意文章與圖片超過本機儲存容量，請移除部分圖片或舊文章。");
    try { localStorage.setItem(KEY,text); } catch (_) { throw Error("無法使用瀏覽器本機儲存，請確認隱私模式及儲存空間。"); }
    window.dispatchEvent(new Event("amr-news-local-changed"));
  };
  window.AMRNewsPreview = Object.freeze({
    list: read,
    upsert(article) {
      const articles=read();
      const idx=articles.findIndex(x=>x.id===article.id);
      const updated={...article,local_preview:true,updated_at:new Date().toISOString()};
      if(idx>=0)articles[idx]=updated;else articles.unshift(updated);
      write(articles);
      return updated;
    },
    setStatus(id,status) {
      if(!["published","unpublished"].includes(status))throw Error("不支援的狀態。");
      const articles=read(),article=articles.find(a=>a.id===id);
      if(!article)throw Error("找不到文章。");
      article.status=status;article.updated_at=new Date().toISOString();
      write(articles);
    },
    remove(id) {write(read().filter(a=>a.id!==id));}
  });
})();

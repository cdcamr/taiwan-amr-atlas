"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const store = window.AMRNewsPreview;
  const media = window.AMRNewsMedia;
  const CATEGORIES = ["news","event","report","resource"];
  const MAX_IMAGES = 4;
  const MAX_UPLOAD = 8 * 1024 * 1024;
  const MAX_INLINE = 300000;
  const GITHUB_REPO = "https://api.github.com/repos/cdcamr/taiwan-amr-atlas/contents/";
  const MANIFEST = "data/news/manifest.json";
  let images = [];
  let importingImages = false;

  const message = (text,id) => {
    const box=$("message");
    box.replaceChildren(document.createTextNode(text));
    if(id){
      const anchor=document.createElement("a");
      anchor.href="./news.html#article="+encodeURIComponent(id);
      anchor.target="_blank";
      anchor.rel="noopener noreferrer";
      anchor.textContent=" 查看前台 ↗";
      box.append(anchor);
    }
  };
  const demoMessage = (text,id) => {
    const box=$("demoMessage");
    box.replaceChildren(document.createTextNode(text));
    if(id){
      const a=document.createElement("a");
      a.href="./news.html#article="+encodeURIComponent(id);
      a.target="_blank";
      a.rel="noopener noreferrer";
      a.textContent=" 查看前台 ↗";
      box.append(a);
    }
  };
  const node=(tag,text)=>{
    const el=document.createElement(tag);
    if(text!==undefined)el.textContent=String(text);
    return el;
  };
  const today=()=>{
    const d=new Date();
    return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
  };
  const build=(status="draft")=>({
    id:$("id").value.trim(),
    title:$("title").value.trim(),
    category:$("category").value,
    summary:$("summary").value.trim(),
    body:$("body").value,
    tags:$("tags").value.split(",").map(v=>v.trim()).filter(Boolean),
    published_at:$("published_at").value,
    event_date:$("event_date").value,
    link_url:$("link_url").value.trim(),
    featured:$("featured").value==="true",
    status,
    images:media.cleanImages(images,true)
  });
  const ensureId=()=>{
    if(!$("id").value.trim()){
      $("id").value="demo-"+new Date().toISOString().replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,7);
    }
  };
  const validate=(a,{dateLimit=false}={})=>{
    if(!/^[A-Za-z0-9_-]{3,100}$/.test(a.id))return "文章代碼應為 3–100 字元的英數、底線或連字號。";
    if(!a.title||!a.summary)return "文章標題及摘要不可空白。";
    if(!CATEGORIES.includes(a.category))return "請確認文章分類。";
    if(!/^\d{4}-\d{2}-\d{2}$/.test(a.published_at))return "請設定有效發布日期。";
    if(dateLimit&&a.published_at>today())return "一鍵立即發布的日期不能晚於今天。";
    if(a.link_url){
      try {if(new URL(a.link_url).protocol!=="https:")throw Error();}
      catch(_) {return "來源／報名網址須為有效的 HTTPS 連結。";}
    }
    if(images.length>MAX_IMAGES||a.images.length!==images.length)return "圖片數量或格式不符，請先移除不支援的圖片。";
    return "";
  };
  const toggleBusy=busy=>{
    importingImages=busy;
    ["demoPublish","directPublish","download","importBtn","imageFiles"].forEach(id=>{$(id).disabled=busy});
  };
  function renderImages(){
    const list=$("imageItems");
    list.replaceChildren();
    if(!images.length){
      list.append(node("p","目前未加入圖片，可直接發布純文字消息。"));
      return;
    }
    images.forEach((entry,index)=>{
      const box=node("div");
      box.className="image-editor-item";
      const title=node("strong",index===0?"圖片 "+(index+1)+" · 消息封面":"圖片 "+(index+1));
      const img=node("img");
      img.src=entry.src;
      img.alt=entry.alt||entry.caption||"圖片預覽";
      img.loading="lazy";
      const labelCaption=node("label","圖片說明（顯示於圖片下方）");
      const caption=node("input");
      caption.type="text";
      caption.maxLength=300;
      caption.value=entry.caption||"";
      caption.setAttribute("aria-label","圖片 "+(index+1)+" 的圖說");
      caption.placeholder="例如：抗生素合理使用衛教活動現場";
      caption.oninput=()=>{entry.caption=caption.value};
      const labelAlt=node("label","替代文字（供螢幕閱讀器使用）");
      const alt=node("input");
      alt.type="text";
      alt.maxLength=180;
      alt.value=entry.alt||"";
      alt.setAttribute("aria-label","圖片 "+(index+1)+" 的替代文字");
      alt.oninput=()=>{entry.alt=alt.value;img.alt=alt.value||entry.caption||"圖片預覽"};
      const remove=node("button","移除此圖片");
      remove.type="button";
      remove.className="remove-photo";
      remove.onclick=()=>{images.splice(index,1);renderImages();$("imageStatus").textContent="已移除圖片 "+(index+1)+"。"};
      const capField=node("div");capField.className="field";capField.append(labelCaption,caption);
      const altField=node("div");altField.className="field";altField.append(labelAlt,alt);
      box.append(title,img,capField,altField,remove);
      list.append(box);
    });
  }
  async function compress(file){
    if(!["image/jpeg","image/png","image/webp"].includes(file.type))throw Error("僅支援 JPEG、PNG 或 WebP 圖片。");
    if(file.size>MAX_UPLOAD)throw Error("圖片「"+file.name+"」超過 8 MB。");
    const objectUrl=URL.createObjectURL(file);
    try{
      const image=new Image();
      const loaded=new Promise((resolve,reject)=>{
        image.onload=resolve;
        image.onerror=()=>reject(Error("圖片無法讀取，請確認檔案格式。"));
      });
      image.src=objectUrl;
      await loaded;
      if(!image.naturalWidth||!image.naturalHeight)throw Error("圖片尺寸不正確。");
      const canvas=document.createElement("canvas");
      const ctx=canvas.getContext("2d");
      if(!ctx)throw Error("此瀏覽器不支援圖片處理。");
      for(const limit of [1280,1024,800,640,480]){
        const ratio=Math.min(1,limit/Math.max(image.naturalWidth,image.naturalHeight));
        canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));
        canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(image,0,0,canvas.width,canvas.height);
        for(const quality of [0.80,0.68,0.55,0.42]){
          const src=canvas.toDataURL("image/webp",quality);
          if(media.validSource(src,true)&&src.length<=MAX_INLINE){
            return {src,alt:file.name.replace(/\.[^.]+$/,"").slice(0,180)||"消息配圖",caption:""};
          }
        }
      }
      throw Error("圖片壓縮後仍過大，請先縮小解析度再上傳。");
    }finally{URL.revokeObjectURL(objectUrl)}
  }
  $("published_at").value=today();
  $("imageFiles").addEventListener("change",async event=>{
    const files=Array.from(event.target.files||[]);
    if(!files.length)return;
    if(images.length+files.length>MAX_IMAGES){
      $("imageStatus").textContent="每篇最多 "+MAX_IMAGES+" 張圖片，請先移除部分圖片。";
      event.target.value="";
      return;
    }
    toggleBusy(true);
    try{
      for(const file of files){
        $("imageStatus").textContent="正在壓縮圖片："+file.name;
        images.push(await compress(file));
      }
      renderImages();
      $("imageStatus").textContent="已加入 "+files.length+" 張圖片，可填寫各張圖片說明。";
    }catch(e){
      renderImages();
      $("imageStatus").textContent=e.message;
    }finally{toggleBusy(false);event.target.value=""}
  });
  function preview(){
    const a=build("draft"),area=$("previewArea");
    area.replaceChildren(node("h2",a.title||"未命名文章"));
    const meta=node("p",a.published_at+" · "+a.category);
    meta.className="meta";
    area.append(meta,node("p",a.summary),node("p",a.body));
    const gallery=media.gallery(a.images,{allowInline:true});
    if(gallery.children.length)area.append(gallery);
    message("已更新圖片與文章預覽，尚未正式發布。");
  }
  function fill(a){
    ["id","title","category","summary","body","published_at","event_date","link_url"].forEach(k=>{$(k).value=a[k]||""});
    $("tags").value=Array.isArray(a.tags)?a.tags.join(", "):"";
    $("featured").value=a.featured?"true":"false";
    $("status").value=a.status==="pending_approval"?"pending_approval":"draft";
    images=media.cleanImages(a.images,true);
    renderImages();
    window.scrollTo({top:0,behavior:"smooth"});
    demoMessage("已載入「"+a.title+"」及其圖片，修改後可再次一鍵發布。");
  }
  $("preview").onclick=preview;
  $("download").onclick=()=>{
    if(importingImages)return;
    ensureId();
    const a=build($("status").value);
    const err=validate(a);
    if(err){message(err);return}
    const json=JSON.stringify(a,null,2);
    const blob=new Blob([json],{type:"application/json"});
    const u=URL.createObjectURL(blob),link=node("a");
    link.href=u;
    link.download=a.id+"-draft-with-images.json";
    link.click();
    setTimeout(()=>URL.revokeObjectURL(u),1000);
    message("已下載含圖片與圖說的草稿備份，尚未發布。");
  };
  $("importBtn").onclick=()=>{$("importFile").click()};
  $("importFile").addEventListener("change",async event=>{
    const file=event.target.files?.[0];
    event.target.value="";
    if(!file)return;
    if(file.size>3500000){message("草稿檔案不可超過 3.5 MB。");return}
    try{
      const doc=JSON.parse(await file.text());
      if(!doc||typeof doc!=="object"||Array.isArray(doc))throw Error("草稿資料格式不正確。");
      if(Array.isArray(doc.images)&&doc.images.length>MAX_IMAGES)throw Error("圖片不可超過 "+MAX_IMAGES+" 張。");
      if(Array.isArray(doc.images)&&media.cleanImages(doc.images,true).length!==doc.images.length)throw Error("草稿含不支援的圖片格式或大小。");
      fill(doc);
      message("已匯入草稿與圖片，請核對圖說及內容。");
    }catch(e){message(e.message||"無法匯入 JSON 草稿。")}
  });
  function refreshLocalList(){
    const list=$("demoList");
    list.replaceChildren();
    const articles=store.list();
    if(!articles.length){list.append(node("p","目前尚無本機示意文章。"));return}
    articles.forEach(a=>{
      const box=node("div");box.className="demo-entry";
      const info=node("div");
      const title=node("h3",a.title||a.id);
      const badge=node("p",(a.published_at||"")+" · "+(a.status==="published"?"本機已發布":"已下架")+" · "+a.id+" · "+(a.images?.length||0)+" 張圖片");
      badge.className="small";badge.style.margin="2px 0";
      info.append(title,badge);
      const actions=node("div");actions.className="actions";
      const edit=node("button","編輯");edit.type="button";edit.onclick=()=>fill(a);
      const state=node("button",a.status==="published"?"下架":"重新發布");
      state.type="button";
      state.onclick=()=>{try{store.setStatus(a.id,a.status==="published"?"unpublished":"published");demoMessage("文章狀態已更新。");refreshLocalList()}catch(e){demoMessage(e.message)}};
      const remove=node("button","刪除");remove.type="button";
      remove.onclick=()=>{if(!confirm("確定刪除本機文章「"+a.title+"」及其圖片？"))return;store.remove(a.id);refreshLocalList();demoMessage("本機文章已刪除。")};
      actions.append(edit,state,remove);box.append(info,actions);list.append(box);
    });
  }
  $("demoPublish").onclick=()=>{
    if(importingImages)return;
    ensureId();
    const a=build("published"),err=validate(a,{dateLimit:true});
    if(err){demoMessage(err);return}
    try{
      store.upsert(a);
      refreshLocalList();
      demoMessage("已一鍵示意發布文章及 "+a.images.length+" 張圖片（僅此瀏覽器可見）。",a.id);
    }catch(e){demoMessage(e.message||"本機儲存失敗。")}
  };

  const encodeUTF8=s=>btoa(Array.from(new TextEncoder().encode(s),byte=>String.fromCharCode(byte)).join(""));
  const decodeUTF8=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,"")),byte=>byte.charCodeAt(0)));
  const headers=token=>({
    Accept:"application/vnd.github+json",
    Authorization:"Bearer "+token,
    "X-GitHub-Api-Version":"2022-11-28"
  });
  async function publishPhoto(photo,articleId,token){
    if(!photo.src.startsWith("data:")){
      if(!media.validSource(photo.src,false))throw Error("圖片網址不是受允許的網站檔案。");
      return {...photo};
    }
    if(!media.validSource(photo.src,true))throw Error("不支援的圖片內容。");
    const type=photo.src.match(/^data:image\/(webp|jpeg|png);base64,/)[1];
    const ext=media.imageTypes[type];
    const base64=photo.src.split(",")[1];
    const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),b=>b.toString(16).padStart(2,"0")).join("").slice(0,16);
    const path="assets/news/images/"+articleId+"/"+hash+"."+ext;
    const endpoint=GITHUB_REPO+path;
    const auth=headers(token);
    const exists=await fetch(endpoint+"?ref=main",{headers:auth,cache:"no-store"});
    if(exists.status===404){
      const put=await fetch(endpoint,{
        method:"PUT",
        headers:{...auth,"Content-Type":"application/json"},
        body:JSON.stringify({message:"content(news): upload photo "+articleId+"/"+hash,content:base64,branch:"main"})
      });
      if(!put.ok)throw Error("圖片上傳失敗（HTTP "+put.status+"），請檢查 GitHub 權限或稍後重試。");
    }else if(!exists.ok){
      throw Error("無法確認圖片版本（HTTP "+exists.status+"）。");
    }
    return {src:"./"+path,alt:photo.alt,caption:photo.caption};
  }
  $("directPublish").addEventListener("click",async()=>{
    if(importingImages)return;
    ensureId();
    const article=build("published");
    const error=validate(article,{dateLimit:true});
    if(error){message(error);return}
    const token=$("githubToken").value.trim();
    if(!token){message("請先輸入具備 GitHub 儲存庫 Contents 寫入權限的權杖。");return}
    if(!confirm("即將把文章「"+article.title+"」及 "+article.images.length+" 張圖片提交至公開 GitHub Pages，確認繼續？"))return;
    toggleBusy(true);
    try{
      const auth=headers(token);
      message("正在讀取網站發布清單…");
      const r=await fetch(GITHUB_REPO+MANIFEST+"?ref=main",{headers:auth,cache:"no-store"});
      if(!r.ok)throw Error("無法讀取 GitHub 文章清單（HTTP "+r.status+"）。");
      const info=await r.json();
      const manifest=JSON.parse(decodeUTF8(info.content));
      if(!Array.isArray(manifest.articles))throw Error("GitHub 文章清單格式不正確。");
      const publicImages=[];
      for(let index=0;index<article.images.length;index++){
        message("正在同步第 "+(index+1)+"／"+article.images.length+" 張圖片…");
        publicImages.push(await publishPhoto(article.images[index],article.id,token));
      }
      article.images=publicImages;
      const ix=manifest.articles.findIndex(row=>row.id===article.id);
      if(ix>=0)manifest.articles[ix]=article;else manifest.articles.unshift(article);
      message("圖片已同步，正在發布文章…");
      const published=await fetch(GITHUB_REPO+MANIFEST,{
        method:"PUT",
        headers:{...auth,"Content-Type":"application/json"},
        body:JSON.stringify({
          message:"content(news): publish "+article.id+" with "+publicImages.length+" images",
          content:encodeUTF8(JSON.stringify(manifest,null,2)+"\n"),
          sha:info.sha,
          branch:"main"
        })
      });
      if(!published.ok){
        if(published.status===409)throw Error("發布清單同時有其他更新，請重新發布。已上傳圖片會保留供重試。");
        throw Error("GitHub 文章清單更新失敗（HTTP "+published.status+"）。已上傳圖片可能保留，請確認發布結果。");
      }
      $("githubToken").value="";
      message("GitHub 已提交文章及圖片；待 GitHub Pages 完成部署後可在 NEWS & EVENTS 查閱。",article.id);
    }catch(e){message(e.message||"GitHub 同步發布失敗。")}
    finally{toggleBusy(false)}
  });
  window.addEventListener("storage",event=>{if(event.key==="taiwan-amr-news-local-preview-v1")refreshLocalList()});
  renderImages();
  refreshLocalList();
})();

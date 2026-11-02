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
    ["demoPublish","directPublish","migrateExisting","checkGitHubAccess","backupLegacy","download","importBtn","imageFiles"].forEach(id=>{$(id).disabled=busy});
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
      img.alt=entry.alt||entry.caption||"圖片預覽";
      img.loading="lazy";
      const issue=node("p");
      issue.className="upload-warning";
      issue.hidden=true;
      img.addEventListener("error",()=>{
        img.hidden=true;
        issue.hidden=false;
        issue.textContent="第 "+(index+1)+" 張圖片無法預覽；請移除後重新上傳。";
        $("imageStatus").textContent=issue.textContent;
      });
      img.src=entry.src;
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
      box.append(title,img,issue,capField,altField,remove);
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
    const originalImageCount=Array.isArray(a.images)?a.images.length:0;
    if(originalImageCount>images.length){
      $("imageStatus").textContent="有 "+(originalImageCount-images.length)+" 張舊圖片來源無法辨識，請重新選擇圖片並發布。";
    }
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
    const pending=articles.filter(a=>a.status==="published"&&!a.public_synced_at);
    $("legacyCount").textContent=articles.length
      ? "目前瀏覽器保存 "+articles.length+" 則文章，其中 "+pending.length+" 則已發布示意消息尚未同步至共用網站。"
      : "此瀏覽器沒有找到舊版發布資料；請回到最初發布消息的電腦及同一瀏覽器操作。";
    $("migrateExisting").disabled=importingImages || pending.length===0;
    if(!articles.length){list.append(node("p","目前尚無本機示意文章。"));return}
    articles.forEach(a=>{
      const box=node("div");box.className="demo-entry";
      const info=node("div");
      const title=node("h3",a.title||a.id);
      const badge=node("p",(a.published_at||"")+" · "+(a.public_synced_at?"已提交共用網站":a.status==="published"?"已發布（僅本機）":"已下架（本機）")+" · "+a.id+" · "+(a.images?.length||0)+" 張圖片");
      badge.className="small";badge.style.margin="2px 0";
      info.append(title,badge);
      const actions=node("div");actions.className="actions";
      const edit=node("button","編輯");edit.type="button";edit.onclick=()=>fill(a);
      const state=node("button",a.status==="published"?"本機下架":"本機重新發布");
      state.type="button";
      state.onclick=()=>{
        if(a.public_synced_at&&!confirm("此文章已提交至共用網站。此處只會變更本機狀態，手機上已公開的文章不會下架。確定繼續？"))return;
        try{store.setStatus(a.id,a.status==="published"?"unpublished":"published");demoMessage("本機狀態已更新；共用網站內容不受影響。");refreshLocalList()}catch(e){demoMessage(e.message)}
      };
      const remove=node("button","刪除");remove.type="button";
      remove.onclick=()=>{if(!confirm("確定刪除本機文章「"+a.title+"」及其圖片？若已同步到共用網站，公開文章不會被刪除。"))return;store.remove(a.id);refreshLocalList();demoMessage("本機文章已刪除；共用網站內容不受影響。")};
      actions.append(edit,state,remove);box.append(info,actions);list.append(box);
    });
  }
  async function verifyImageDecoding(){
    for(let i=0;i<images.length;i++){
      const src=media.normalizeSource(images[i].src,true);
      if(!src)throw Error("第 "+(i+1)+" 張圖片的網址格式不正確，請重新上傳。");
      await new Promise((resolve,reject)=>{
        const image=new Image();
        image.onload=resolve;
        image.onerror=()=>reject(Error("第 "+(i+1)+" 張圖片無法載入，請移除並重新上傳。"));
        image.src=src;
      });
    }
  }
  $("demoPublish").onclick=async()=>{
    if(importingImages)return;
    ensureId();
    const a=build("published"),err=validate(a,{dateLimit:true});
    if(err){demoMessage(err);return}
    toggleBusy(true);
    try{
      await verifyImageDecoding();
      store.upsert(a);
      refreshLocalList();
      demoMessage("已一鍵示意發布文章及 "+a.images.length+" 張圖片（僅此瀏覽器可見）。",a.id);
    }catch(e){demoMessage(e.message||"本機儲存失敗。")}
    finally{toggleBusy(false)}
  };

  const encodeUTF8=s=>btoa(Array.from(new TextEncoder().encode(s),byte=>String.fromCharCode(byte)).join(""));
  const decodeUTF8=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,"")),byte=>byte.charCodeAt(0)));
  const headers=token=>({
    Accept:"application/vnd.github+json",
    Authorization:"Bearer "+token,
    "X-GitHub-Api-Version":"2022-11-28"
  });

  async function githubError(response,stage){
    const status=response.status;
    let responseMessage="";
    try{
      const info=await response.json();
      responseMessage=String(info?.message||"").replace(/\s+/g," ").slice(0,260);
    }catch(_){}
    const permissions=response.headers?.get?.("X-Accepted-GitHub-Permissions")||"";
    const remain=response.headers?.get?.("x-ratelimit-remaining")||"";
    const limited=/(?:secondary |primary )?rate limit|abuse detection/i.test(responseMessage)||remain==="0"||status===429;
    const pieces=[stage+"失敗（HTTP "+status+"）"];
    if(responseMessage)pieces.push("GitHub 原因："+responseMessage);
    if(permissions)pieces.push("該 API 所需權限："+permissions);
    if(status===401)pieces.push("Token 可能無效、已過期或已撤銷；請重新登入 GitHub 檢查。");
    else if(limited)pieces.push("GitHub API 達到速率限制，請依 GitHub 提示稍後重試，勿連續點擊發布。");
    else if(status===403)pieces.push("建議點選上方「檢查 GitHub 授權」，確認是 cdcamr 帳號（或已有此儲存庫寫入權限的帳號），且 Token 已選 taiwan-amr-atlas，Contents 為 Read and write。");
    else if(status===404)pieces.push("請確認 Token 的授權儲存庫是 cdcamr/taiwan-amr-atlas，且沒有過期。");
    return pieces.join("。").replace(/。{2,}/g,"。");
  }
  $("checkGitHubAccess").onclick=async()=>{
    const output=$("githubAccessStatus");
    const token=$("githubToken").value.trim();
    if(!token){output.textContent="請先輸入 Token，才能檢查其對應帳號與儲存庫權限。";return}
    $("checkGitHubAccess").disabled=true;
    output.textContent="正在檢查 Token 所屬帳號及儲存庫權限（不會修改檔案）…";
    try{
      const auth=headers(token);
      const who=await fetch("https://api.github.com/user",{headers:auth,cache:"no-store"});
      if(!who.ok)throw Error(await githubError(who,"GitHub 帳號驗證"));
      const user=await who.json();
      const account=String(user?.login||"").slice(0,80);
      if(!account)throw Error("GitHub 未回傳帳號名稱。");
      const response=await fetch("https://api.github.com/repos/cdcamr/taiwan-amr-atlas",{headers:auth,cache:"no-store"});
      if(!response.ok)throw Error(await githubError(response,"儲存庫存取權限檢查"));
      const repo=await response.json();
      const permission=repo?.permissions;
      const advice=[];
      advice.push("Token 所屬帳號："+account+"。");
      if(account.toLowerCase()!=="cdcamr")advice.push("此庫由 cdcamr 個人帳號持有；若目前帳號不是獲授權的協作者，請切換至 cdcamr 再建立 Token。");
      if(permission?.push===false)advice.push("GitHub 未顯示此憑證具有儲存庫推送能力，請檢查帳號和 Token 的 Contents: Read and write 權限。");
      else if(permission?.push===true)advice.push("帳號顯示具儲存庫推送能力，但仍須確認 Token 本身已授予 Contents: Read and write。");
      else advice.push("GitHub 未提供推送權限明細，請在 Token 設定中確認 Resource owner、Repository access 及 Contents 寫入權限。");
      advice.push("此檢查不會寫入檔案，因此不能完全保證圖片上傳成功。若再次出現 403，可提供錯誤中的「GitHub 原因」文字以利判讀；請勿提供 Token。");
      output.textContent=advice.join(" ");
    }catch(e){
      output.textContent="權限檢查未通過："+(e.message||"無法連線至 GitHub API。");
    }finally{$("checkGitHubAccess").disabled=false}
  };

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
      if(!put.ok)throw Error(await githubError(put,"圖片上傳"));
    }else if(!exists.ok){
      throw Error(await githubError(exists,"圖片檔案存取"));
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
      await verifyImageDecoding();
      const auth=headers(token);
      message("正在讀取網站發布清單…");
      const r=await fetch(GITHUB_REPO+MANIFEST+"?ref=main",{headers:auth,cache:"no-store"});
      if(!r.ok)throw Error(await githubError(r,"共用文章清單讀取"));
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
        throw Error((await githubError(published,"共用文章清單發布"))+" 已上傳圖片可能保留，請確認發布結果。");
      }
      let commit="";
      try{const response=await published.json();commit=response?.commit?.sha||""}catch(_){}
      try{store.markSynced([article.id],commit)}catch(_){}
      refreshLocalList();
      $("githubToken").value="";
      message("已提交至共用網站；待 GitHub Pages 部署後，手機可直接開啟 NEWS & EVENTS 查看。",article.id);
    }catch(e){message(e.message||"GitHub 同步發布失敗。")}
    finally{toggleBusy(false)}
  });

  function migrationStatus(text,link=false){
    const container=$("migrationStatus");
    container.replaceChildren(document.createTextNode(text));
    if(link){
      const a=node("a"," 開啟共用 NEWS & EVENTS ↗");
      a.href="./news.html";a.target="_blank";a.rel="noopener noreferrer";
      container.append(a);
    }
  }

  $("backupLegacy").onclick=()=>{
    const articles=store.list();
    if(!articles.length){migrationStatus("此瀏覽器目前沒有可備份的舊消息。");return}
    try{
      const backup={
        schema_version:1,
        source:"taiwan-amr-atlas browser-local news backup",
        exported_at:new Date().toISOString(),
        articles
      };
      const blob=new Blob([JSON.stringify(backup,null,2)],{type:"application/json"});
      const url=URL.createObjectURL(blob);
      const link=node("a");
      link.href=url;
      link.download="taiwan-amr-news-local-backup-"+today()+".json";
      link.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      migrationStatus("已下載 "+articles.length+" 則本機消息與圖片的完整 JSON 備份。請妥善保管；檔案內可能包含文章及圖片資料，但不含 GitHub Token。");
    }catch(e){migrationStatus("下載備份失敗："+(e.message||"瀏覽器無法建立檔案。"))}
  };

  const migrationCandidates=()=>store.list().filter(article=>article.status==="published"&&!article.public_synced_at);
  function validateLegacy(article){
    if(!article||typeof article!=="object")return "資料格式不正確";
    if(!/^[A-Za-z0-9_-]{3,100}$/.test(article.id||""))return "文章代碼不符合規範";
    if(typeof article.title!=="string"||!article.title.trim()||typeof article.summary!=="string"||!article.summary.trim())return "標題或摘要空白";
    if(!CATEGORIES.includes(article.category))return "分類不正確";
    if(!/^\d{4}-\d{2}-\d{2}$/.test(article.published_at||"")||article.published_at>today())return "發布日期無效或尚未到期";
    if(article.link_url){
      try{if(new URL(article.link_url).protocol!=="https:")throw Error()}catch(_){return "外部連結非 HTTPS"}
    }
    if(article.images!==undefined&&!Array.isArray(article.images))return "圖片欄位格式不正確";
    if((article.images||[]).length>MAX_IMAGES)return "圖片超過四張";
    if(media.cleanImages(article.images||[],true).length!==(article.images||[]).length)return "圖片格式無效或資料遺失";
    return "";
  }
  const validateLegacyImages=async(article)=>{
    for(let i=0;i<article.images.length;i++){
      const src=media.normalizeSource(article.images[i].src,true);
      if(!src)throw Error("第 "+(i+1)+" 張圖片來源無效");
      await new Promise((resolve,reject)=>{
        const img=new Image();
        img.onload=resolve;
        img.onerror=()=>reject(Error("第 "+(i+1)+" 張圖片無法載入"));
        img.src=src;
      });
    }
  };
  const getPublicManifest=async(auth)=>{
    const response=await fetch(GITHUB_REPO+MANIFEST+"?ref=main",{headers:auth,cache:"no-store"});
    if(!response.ok)throw Error(await githubError(response,"共用消息清單讀取"));
    const info=await response.json();
    const manifest=JSON.parse(decodeUTF8(info.content));
    if(!Array.isArray(manifest.articles))throw Error("網站消息清單格式不正確。");
    return {info,manifest};
  };
  $("migrateExisting").addEventListener("click",async()=>{
    if(importingImages)return;
    const originals=migrationCandidates();
    if(!originals.length){migrationStatus("沒有需要轉移的舊消息。若以前用其他瀏覽器發布，請回到原瀏覽器。");return}
    const token=$("githubToken").value.trim();
    if(!token){migrationStatus("請先在上方輸入具有 GitHub Contents 寫入權限的授權權杖。");return}
    if(!confirm("將一次同步這個瀏覽器中 "+originals.length+" 則既有已發布消息，以及其圖片與圖說到共用網站；手機和其他訪客都能看到。已在網站上有相同文章代碼者將略過，不會覆蓋。是否繼續？"))return;
    toggleBusy(true);
    const skipped=[];
    const ready=[];
    let duplicate=0;
    let responseCommit="";
    try{
      const auth=headers(token);
      migrationStatus("正在讀取共用消息清單…");
      const initial=await getPublicManifest(auth);
      const already=new Set(initial.manifest.articles.map(a=>a.id));
      for(let i=0;i<originals.length;i++){
        const original=originals[i];
        if(already.has(original.id)){duplicate++;continue}
        const err=validateLegacy(original);
        if(err){skipped.push((original.title||original.id||"未命名消息")+"："+err);continue}
        const images=media.cleanImages(original.images||[],true);
        const article={
          id:original.id,title:original.title,category:original.category,
          summary:original.summary,body:String(original.body||""),
          tags:Array.isArray(original.tags)?original.tags.filter(x=>typeof x==="string").slice(0,30):[],
          published_at:original.published_at,event_date:String(original.event_date||""),
          link_url:String(original.link_url||""),featured:!!original.featured,
          status:"published",images:[]
        };
        migrationStatus("正在轉移第 "+(i+1)+"／"+originals.length+" 則：「"+article.title+"」及圖片…");
        try{
          await validateLegacyImages({...article,images});
        }catch(error){skipped.push(article.title+"："+error.message);continue}
        // GitHub API / network failures stop the batch, avoiding repeated bad uploads.
        for(const image of images){
          article.images.push(await publishPhoto(image,article.id,token));
        }
        ready.push(article);
      }
      if(!ready.length){
        migrationStatus("沒有新消息可同步：網站已有相同代碼 "+duplicate+" 則；資料不完整 "+skipped.length+" 則。"+(skipped.length?" 請檢查："+skipped.slice(0,2).join("；"):""));
        return;
      }
      // Refresh after uploads to reduce SHA conflicts and avoid overwriting
      // articles published by other contributors during this migration.
      let success=[],conflicts=0;
      for(let attempt=0;attempt<2;attempt++){
        const current=await getPublicManifest(auth);
        const ids=new Set(current.manifest.articles.map(a=>a.id));
        const additions=ready.filter(a=>!ids.has(a.id));
        conflicts=ready.length-additions.length;
        if(!additions.length)break;
        current.manifest.articles.unshift(...additions);
        migrationStatus("正在提交 "+additions.length+" 則消息至共用網站…");
        const put=await fetch(GITHUB_REPO+MANIFEST,{
          method:"PUT",
          headers:{...auth,"Content-Type":"application/json"},
          body:JSON.stringify({
            message:"content(news): migrate "+additions.length+" existing local published posts",
            content:encodeUTF8(JSON.stringify(current.manifest,null,2)+"\n"),
            sha:current.info.sha,
            branch:"main"
          })
        });
        if(put.status===409 && attempt===0)continue;
        if(!put.ok)throw Error((await githubError(put,"舊消息批次同步"))+" 上傳過的圖片會保留，重新點選可安全重試。");
        success=additions.map(a=>a.id);
        try{const commit=await put.json();responseCommit=commit?.commit?.sha||""}catch(_){}
        break;
      }
      if(success.length){
        try{store.markSynced(success,responseCommit)}
        catch(_){migrationStatus("共用網站提交成功，但本機同步標記寫入失敗。請勿立即重複操作；可先在手機確認。",true);return}
      }
      const other=duplicate+conflicts;
      let report="已提交 "+success.length+" 則舊消息及其圖片；"+(other?"跳過網站已有文章 "+other+" 則；":"")+(skipped.length?"資料有問題未轉移 "+skipped.length+" 則。":"");
      if(skipped.length)report+=" 需檢查："+skipped.slice(0,3).join("；");
      report+=" 待 GitHub Pages 完成部署，即可用手機網址查看。";
      migrationStatus(report,true);
      refreshLocalList();
      if(success.length)$("githubToken").value="";
    }catch(error){
      migrationStatus("批次同步未完成："+(error.message||"發生未知錯誤")+"。尚未提交的舊消息仍保留在原瀏覽器。");
    }finally{
      toggleBusy(false);
      refreshLocalList();
    }
  });

  $("copyPublicLink").onclick=async()=>{
    const url=new URL("./news.html",location.href).href;
    try{
      await navigator.clipboard.writeText(url);
      message("已複製共用消息網址，可貼到手機開啟："+url);
    }catch(_){
      message("請複製此網址到手機："+url);
    }
  };
  window.addEventListener("storage",event=>{if(event.key==="taiwan-amr-news-local-preview-v1")refreshLocalList()});
  renderImages();
  refreshLocalList();
})();

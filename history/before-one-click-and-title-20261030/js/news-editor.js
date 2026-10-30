"use strict";(()=>{const $=id=>document.getElementById(id),keys=["id","title","category","summary","body","tags","published_at","event_date","link_url","featured","status"];const get=()=>{const d=Object.fromEntries(keys.map(k=>[k,$(k).value]));d.tags=d.tags.split(",").map(x=>x.trim()).filter(Boolean);d.featured=d.featured==="true";return d};const valid=d=>{if(!/^[A-Za-z0-9_-]{3,100}$/.test(d.id))return "請輸入 3–100 字元的英數文章代碼。";if(!d.title.trim()||!d.summary.trim())return "標題及摘要不可空白。";if(!/^\d{4}-\d{2}-\d{2}$/.test(d.published_at))return "請設定發布日期。";if(d.link_url){try{const u=new URL(d.link_url);if(u.protocol!=="https:")return "外部連結請使用 HTTPS。"}catch{return "連結格式錯誤。"}}return ""};$("published_at").value=new Date().toISOString().slice(0,10);$("preview").onclick=()=>{const d=get(),p=$("previewArea");p.replaceChildren();const h=document.createElement("h2");h.textContent=d.title||"未命名文章";const m=document.createElement("p");m.className="meta";m.textContent=d.published_at+" · "+d.category+" · "+d.status;const a=document.createElement("p");a.textContent=d.summary;const b=document.createElement("p");b.style.whiteSpace="pre-wrap";b.textContent=d.body;p.append(h,m,a,b);$("message").textContent="僅供本機預覽，未對外發布。"};$("download").onclick=()=>{const d=get(),error=valid(d);if(error){$("message").textContent=error;return}const blob=new Blob([JSON.stringify(d,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=d.id+"-pending-review.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$("message").textContent="已匯出待審核草稿，尚未發布。"};$("importBtn").onclick=()=>$("importFile").click();$("importFile").onchange=async e=>{const file=e.target.files[0];if(!file)return;if(file.size>1000000){$("message").textContent="檔案不可超過 1 MB。";return}try{const d=JSON.parse(await file.text());for(const k of keys){let v=d[k];if(k==="tags")v=Array.isArray(v)?v.join(","):"";if(k==="featured")v=v?"true":"false";if(k==="status"&&v==="published")v="pending_approval";if(v!==undefined&&v!==null)$(k).value=String(v)}$("message").textContent="草稿已匯入本機，請再次確認內容。"}catch{$("message").textContent="無法讀取 JSON 草稿。"}}})();

/* Direct publishing prototype: user-supplied short-lived, fine-grained GitHub token; never stored. */
(()=>{
const $=id=>document.getElementById(id);
const api="https://api.github.com/repos/cdcamr/taiwan-amr-atlas/contents/data/news/manifest.json";
const msg=text=>{$("message").textContent=text};
const b64=s=>btoa(Array.from(new TextEncoder().encode(s),b=>String.fromCharCode(b)).join(""));
const fromB64=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replaceAll("\n","")),c=>c.charCodeAt(0)));
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const btn=$("directPublish");
btn.addEventListener("click",async()=>{
const token=$("githubToken").value.trim();
const d={id:$("id").value.trim(),title:$("title").value.trim(),category:$("category").value,summary:$("summary").value.trim(),body:$("body").value,tags:$("tags").value.split(",").map(x=>x.trim()).filter(Boolean),published_at:$("published_at").value,event_date:$("event_date").value,link_url:$("link_url").value.trim(),featured:$("featured").value==="true",status:"published"};
if(!/^[a-zA-Z0-9_-]{3,100}$/.test(d.id)||!d.title||!d.summary||!["news","event","report","resource"].includes(d.category)||!/^\\d{4}-\\d{2}-\\d{2}$/.test(d.published_at)){msg("文章代碼、標題、摘要、分類與發布日期必須正確填寫。");return}
if(d.published_at>today()){msg("直接發布不接受未來日期；請改為今日或過去日期。");return}
if(d.link_url){try{if(new URL(d.link_url).protocol!=="https:")throw Error()}catch{msg("外部連結必須為有效 HTTPS 網址。");return}}
if(!token){msg("請先填入具有此儲存庫 Contents 寫入權限的 GitHub 權杖。");return}
if(!confirm("即將直接將「"+d.title+"」發布至公開網站（同文章代碼將覆蓋舊文章）。確認已獲內容核定並繼續？"))return;
btn.disabled=true;msg("正在讀取最新發布清單…");
try{
const headers={Accept:"application/vnd.github+json",Authorization:"Bearer "+token,"X-GitHub-Api-Version":"2022-11-28"};
const res=await fetch(api+"?ref=main",{headers,cache:"no-store"});
if(!res.ok)throw Error("無法取得發布清單（HTTP "+res.status+"），請確認 GitHub 權杖、儲存庫權限及分支規則。");
const current=await res.json(),manifest=JSON.parse(fromB64(current.content));
if(!Array.isArray(manifest.articles))throw Error("發布清單格式不正確。");
const ix=manifest.articles.findIndex(a=>a.id===d.id);
if(ix>=0)manifest.articles[ix]=d;else manifest.articles.unshift(d);
const update=await fetch(api,{method:"PUT",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({message:"content(news): publish "+d.id,content:b64(JSON.stringify(manifest,null,2)),sha:current.sha,branch:"main"})});
if(!update.ok){if(update.status===409)throw Error("發布清單已由其他人修改，請重新點選發布以取得最新版本。");throw Error("GitHub 發布失敗（HTTP "+update.status+"），請確認權限或分支保護規則。")}
msg("GitHub 提交成功，請在 Pages 部署完成後檢視 News & Events 前台。");
$("githubToken").value="";
}catch(err){msg(err.message||"發布失敗，請稍後重試。")}finally{btn.disabled=false}
});
})();

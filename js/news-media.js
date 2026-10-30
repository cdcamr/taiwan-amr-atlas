"use strict";
(() => {
  const TYPES = Object.freeze({webp:"webp",jpeg:"jpg",png:"png"});
  const RELATIVE = /^assets\/news\/images\/[A-Za-z0-9_-]{3,100}\/[A-Za-z0-9._-]{1,120}\.(?:webp|jpe?g|png)$/i;
  const FILE_SUFFIX = /^[A-Za-z0-9_-]{3,100}\/[A-Za-z0-9._-]{1,120}\.(?:webp|jpe?g|png)$/i;
  const INLINE = /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/i;
  const INLINE_LIMIT = 3200000;
  function normalizeSource(input,allowInline=false) {
    if(typeof input!=="string")return null;
    const src=input.trim();
    if(allowInline&&src.toLowerCase().startsWith("data:image/")){
      // Some JSON editors insert line breaks in Base64; remove whitespace safely.
      const normalized=src.replace(/\s+/g,"");
      return normalized.length<=INLINE_LIMIT&&INLINE.test(normalized)?normalized:null;
    }
    const relative=src.replace(/^\.\/+/,"");
    if(RELATIVE.test(relative))return "./"+relative;
    // Also accept a same-origin absolute URL (or /site-root/assets/... path).
    // Never allow an external origin, SVG, javascript: or path traversal.
    try {
      const base=new URL("./assets/news/images/",location.href);
      const actual=new URL(src,location.href);
      if(actual.origin!==base.origin||!actual.pathname.startsWith(base.pathname))return null;
      const suffix=decodeURIComponent(actual.pathname.slice(base.pathname.length));
      if(FILE_SUFFIX.test(suffix))return "./assets/news/images/"+suffix;
    } catch (_) {}
    return null;
  }
  const validSource=(src,allowInline=false)=>normalizeSource(src,allowInline)!==null;
  function cleanImages(value,allowInline=true){
    if(!Array.isArray(value))return [];
    return value.slice(0,4).flatMap(item=>{
      if(!item||typeof item!=="object")return [];
      const src=normalizeSource(item.src||item.url||item.image_url,allowInline);
      if(!src)return [];
      return [{
        src,
        alt:String(item.alt||item.caption||"消息配圖").slice(0,180),
        caption:String(item.caption||item.description||"").slice(0,300)
      }];
    });
  }
  function errorMessage(inline,invalid){
    if(invalid)return "圖片網址或格式不符合規範。請返回後臺重新選擇圖片並發布。";
    return inline
      ?"此圖片的本機資料無法讀取，請返回後臺重新上傳並一鍵發布。"
      :"圖片尚未載入：請確認已完成 GitHub 圖片同步上傳及 Pages 部署。";
  }
  function figure(image,mode,allowInline){
    const box=document.createElement("figure");
    box.className=mode==="cover"?"news-cover":"news-figure";
    const src=normalizeSource(image?.src||image?.url||image?.image_url,allowInline);
    const isInline=!!src&&src.startsWith("data:image/");
    const error=document.createElement("p");
    error.className="news-image-error";
    error.setAttribute("role","status");
    error.hidden=true;
    if(src){
      const img=document.createElement("img");
      img.src=src;
      img.alt=String(image.alt||image.caption||"消息配圖").slice(0,180);
      img.loading=mode==="cover"?"eager":"lazy";
      img.decoding="async";
      let retried=false;
      img.addEventListener("error",()=>{
        if(!isInline&&!retried){
          retried=true;
          try {
            const refreshed=new URL(src,location.href);
            refreshed.searchParams.set("retry",String(Date.now()));
            img.src=refreshed.href;
            return;
          }catch(_){}
        }
        img.hidden=true;
        box.classList.add("news-image-failed");
        error.textContent=errorMessage(isInline,false);
        error.hidden=false;
      });
      box.append(img);
    }else{
      box.classList.add("news-image-failed");
      error.textContent=errorMessage(false,true);
      error.hidden=false;
    }
    box.append(error);
    if(mode!=="cover"&&image?.caption){
      const caption=document.createElement("figcaption");
      caption.textContent=String(image.caption).slice(0,300);
      box.append(caption);
    }
    return box;
  }
  function gallery(images,{allowInline=false,cover=false}={}){
    const wrap=document.createElement("div");
    wrap.className=cover?"news-card-image":"news-gallery";
    if(!Array.isArray(images))return wrap;
    for(const image of (cover?images.slice(0,1):images.slice(0,4))){
      if(!image||typeof image!=="object")continue;
      wrap.append(figure(image,cover?"cover":"detail",allowInline));
    }
    return wrap;
  }
  window.AMRNewsMedia=Object.freeze({validSource,normalizeSource,cleanImages,gallery,imageTypes:TYPES});
})();

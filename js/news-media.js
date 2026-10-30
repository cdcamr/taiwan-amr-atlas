"use strict";
(() => {
  const TYPES = {webp:"webp",jpeg:"jpg",png:"png"};
  const RELATIVE = /^\.\/assets\/news\/images\/[A-Za-z0-9_-]{3,100}\/[a-f0-9]{16}\.(webp|jpg|png)$/;
  const INLINE = /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/;
  function validSource(src,allowInline) {
    if (typeof src!=="string") return false;
    if (RELATIVE.test(src)) return true;
    return !!allowInline && src.length<=350000 && INLINE.test(src);
  }
  function cleanImages(value,allowInline=true) {
    if(!Array.isArray(value))return [];
    return value.slice(0,4).filter(item=>item&&validSource(item.src,allowInline)).map(item=>({
      src:item.src,
      alt:String(item.alt||"消息配圖").slice(0,180),
      caption:String(item.caption||"").slice(0,300)
    }));
  }
  function figure(image,mode,allowInline) {
    if(!validSource(image.src,allowInline))return null;
    const box=document.createElement("figure");
    box.className=mode==="cover"?"news-cover":"news-figure";
    const img=document.createElement("img");
    img.src=image.src;
    img.alt=String(image.alt||image.caption||"消息配圖").slice(0,180);
    img.loading="lazy";
    img.decoding="async";
    box.append(img);
    if(mode!=="cover"&&image.caption){
      const caption=document.createElement("figcaption");
      caption.textContent=String(image.caption).slice(0,300);
      box.append(caption);
    }
    return box;
  }
  function gallery(images,{allowInline=false,cover=false}={}) {
    const wrap=document.createElement("div");
    wrap.className=cover?"news-card-image":"news-gallery";
    const cleaned=cleanImages(images,allowInline);
    (cover?cleaned.slice(0,1):cleaned).forEach(item=>{
      const el=figure(item,cover?"cover":"detail",allowInline);
      if(el)wrap.append(el);
    });
    return wrap;
  }
  window.AMRNewsMedia=Object.freeze({validSource,cleanImages,gallery,imageTypes:TYPES});
})();

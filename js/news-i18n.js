"use strict";
(() => {
  const LANGUAGES = Object.freeze(["zh","en","ja"]);
  const TRANSLATED = Object.freeze(["en","ja"]);
  const FIELDS = Object.freeze(["title","summary","body"]);
  const readText=(value,max)=>typeof value==="string"?value.slice(0,max):"";
  function cleanTranslations(input,imageCount=0){
    if(!input||typeof input!=="object"||Array.isArray(input))return {};
    const count=Math.max(0,Math.min(4,Number.isInteger(imageCount)?imageCount:0));
    const result={};
    for(const locale of TRANSLATED){
      const raw=input[locale];
      if(!raw||typeof raw!=="object"||Array.isArray(raw))continue;
      const entry={
        title:readText(raw.title,180).trim(),
        summary:readText(raw.summary,6000).trim(),
        body:readText(raw.body,50000),
        images:Array.from({length:count},(_,i)=>{
          const pic=Array.isArray(raw.images)?raw.images[i]:null;
          return {
            alt:readText(pic?.alt,180).trim(),
            caption:readText(pic?.caption,300).trim()
          };
        })
      };
      if(entry.title||entry.summary||entry.body||entry.images.some(i=>i.alt||i.caption)){
        result[locale]=entry;
      }
    }
    return result;
  }
  function currentLanguage(){
    const preferred=window.AMRSitePreferences?.getLanguage?.();
    if(LANGUAGES.includes(preferred))return preferred;
    try{
      const stored=localStorage.getItem("taiwan-amr-platform-language");
      if(LANGUAGES.includes(stored))return stored;
    }catch(_){}
    return "zh";
  }
  function localize(article,language=currentLanguage()){
    if(!article||typeof article!=="object")return article;
    const code=LANGUAGES.includes(language)?language:"zh";
    if(code==="zh")return {...article,language:"zh",translationFallback:false};
    const originalImages=Array.isArray(article.images)?article.images:[];
    const localized=cleanTranslations(article.translations,originalImages.length)[code]||{};
    let incomplete=false;
    const result={...article,language:code};
    for(const field of FIELDS){
      const translated=localized[field]||"";
      const original=readText(article[field],field==="title"?180:field==="summary"?6000:50000);
      if(!translated&&original)incomplete=true;
      result[field]=translated||original;
    }
    result.images=originalImages.map((picture,index)=>{
      const requested=localized.images?.[index]||{};
      const origAlt=typeof picture.alt==="string"?picture.alt:"";
      const origCaption=typeof picture.caption==="string"?picture.caption:"";
      if(origAlt&&!requested.alt)incomplete=true;
      if(origCaption&&!requested.caption)incomplete=true;
      return {...picture,alt:requested.alt||origAlt,caption:requested.caption||origCaption};
    });
    result.translationFallback=incomplete;
    return result;
  }
  window.AMRNewsI18n=Object.freeze({LANGUAGES,TRANSLATED,cleanTranslations,currentLanguage,localize});
})();

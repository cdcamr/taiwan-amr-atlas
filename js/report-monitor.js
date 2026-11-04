"use strict";
(() => {
  const domain=document.body.dataset.reportDomain;
  if(!["AU","HAI"].includes(domain))return;
  const $=id=>document.getElementById(id),NS="http://www.w3.org/2000/svg",qs=new URLSearchParams(location.search);
  const levels=["醫學中心","區域醫院","地區醫院"],colors=["#2b98ce","#f19c47","#9aaab6"];
  const namesAU={did:"抗生素使用量密度（DID）",access_pct:"AWaRe Access 使用占比",facility_access_pct:"院所層級別 AWaRe Access 占比"};
  const namesHAI={site_density:"感染部位別感染密度",icu_density:"加護病房種類別感染密度",device_density:"侵入性醫療裝置相關感染密度",device_utilization:"侵入性醫療裝置使用比率",device_share:"感染個案之裝置相關比例"};
  const scopes={site_density:["感染部位合計","血流感染","肺炎","泌尿道感染","其他部位"],icu_density:["全部ICU","內科ICU","外科ICU","心臟科ICU","兒科ICU","綜合科ICU","<10床",">=10床"],device_density:["中心導管相關血流感染","呼吸器相關肺炎","導尿管相關泌尿道感染"],device_utilization:["中心導管","呼吸器","導尿管"],device_share:["血流","肺炎","泌尿道"]};
  const unit={did:"DID",access_pct:"%",facility_access_pct:"%",site_density:"感染人次／千住院人日",icu_density:"感染人次／千住院人日",device_density:"感染人次／千導管使用人日",device_utilization:"%",device_share:"%"};
  const node=(tag,label,cls)=>{const n=document.createElement(tag);if(label!==undefined)n.textContent=String(label);if(cls)n.className=cls;return n;};
  const shape=(tag,attrs,text)=>{const n=document.createElementNS(NS,tag);Object.entries(attrs||{}).forEach(([k,v])=>n.setAttribute(k,String(v)));if(text!==undefined)n.textContent=String(text);return n;};
  const num=x=>{if(x===undefined||x===null||x==="")return null;const n=Number(String(x).replaceAll(",",""));return Number.isFinite(n)?n:null;};
  const fmt=n=>Number(n).toLocaleString("zh-TW",{maximumFractionDigits:3});
  const rate=(a,b,s)=>Number.isFinite(a)&&Number.isFinite(b)&&a>=0&&b>0?Math.round(a/b*s*100000)/100000:null;
  const point=(metric,year,level,condition,icu,numerator,denominator,scale,origin)=>{
    const value=rate(numerator,denominator,scale);
    return value===null?null:{metric,year:Number(year),level,condition,icu,numerator,denominator,value,unit:unit[metric],origin,precision:"calculated_from_official_counts"};
  };
  const rowsOf=collection=>collection.rows.map(a=>Object.fromEntries(collection.fields.map((key,i)=>[key,a[i]])));
  function totalRows(raw,metric,scale){
    const groups=new Map();
    raw.forEach(r=>{const id=[r.year,r.level,r.condition].join("|");if(!groups.has(id))groups.set(id,{...r,icu:"全部ICU",numerator:0,denominator:0});const g=groups.get(id);g.numerator+=r.numerator;g.denominator+=r.denominator;});
    return [...groups.values()].map(g=>point(metric,g.year,g.level,g.condition,"全部ICU",g.numerator,g.denominator,scale,g.origin)).filter(Boolean);
  }
  function normalizeHAI(data){
    const result=[];
    for(const r of rowsOf(data.collections.site)){
      const den=num(r["住院人日數"]),year=r["統計年度"],level=r["醫院層級"];
      const counts=[["血流感染",num(r["血流感染人次數"])],["肺炎",num(r["肺炎感染人次數"])],["泌尿道感染",num(r["泌尿道感染人次數"])],["其他部位",num(r["其他部位感染人次數"])]];
      counts.forEach(([site,n])=>{const p=point("site_density",year,level,site,"全部ICU",n,den,1000,"site");if(p)result.push(p);});
      if(counts.every(x=>Number.isFinite(x[1]))){const p=point("site_density",year,level,"感染部位合計","全部ICU",counts.reduce((sum,x)=>sum+x[1],0),den,1000,"site");if(p)result.push(p);}
    }
    const typeRows=[];
    for(const r of rowsOf(data.collections.icu)){
      const p=point("icu_density",r["統計年度"],r["醫院層級"],r["加護病房種類"],r["加護病房種類"],num(r["感染人次數"]),num(r["住院人日數"]),1000,"icu");
      if(p)typeRows.push(p);
    }
    result.push(...typeRows,...totalRows(typeRows.map(r=>({...r,condition:"全部ICU"})),"icu_density",1000));
    const devices=[];
    for(const r of rowsOf(data.collections.device)){
      const year=r["統計年度"],level=r["醫院層級"],icu=r["ICU種類"],deviceDays=num(r["導管使用人日數"]),patientDays=num(r["住院人日數"]);
      const d=point("device_density",year,level,r["感染類別"],icu,num(r["感染人次數"]),deviceDays,1000,"device");
      const u=point("device_utilization",year,level,r["導管種類"],icu,deviceDays,patientDays,100,"device");
      if(d)devices.push(d);if(u)devices.push(u);
    }
    result.push(...devices,...totalRows(devices.filter(r=>r.metric==="device_density"),"device_density",1000),...totalRows(devices.filter(r=>r.metric==="device_utilization"),"device_utilization",100));
    for(const r of rowsOf(data.collections.related)){
      const p=point("device_share",r["統計年度"],r["醫院層級"],r["感染部位"],"全部ICU",num(r["導管相關感染人次數"]),num(r["感染人次數"]),100,"related");
      if(p)result.push(p);
    }
    return result;
  }
  const normalizeAU=data=>data.records.filter(r=>Number.isFinite(Number(r.value))).map(r=>({metric:r.metric,year:Number(r.year),level:r.setting,condition:r.setting,icu:"不適用",numerator:null,denominator:null,value:Number(r.value),unit:r.unit,origin:"official_notice",precision:r.precision,source_url:r.source_url,atc:r.atc}));
  let source=null,all=[],years=[],chosenLevels=new Set(levels),visible=[],estimateRecords=[],modelLoadError="";
  const estimated = r => !!(r&&typeof r.precision==="string"&&r.precision.startsWith("illustrative_"));
  const qualityLabel = r => estimated(r)
    ? (domain==="AU"?"示意估計（官方錨點間插補／趨勢假設）":"2024 示意推估（2022–2023 趨勢外推）")
    : (domain==="AU"?"年報公告已核對值":"CDC 開放資料計算值");
  const normalizePreview = data => {
    if(!data||data.domain!==domain||!Array.isArray(data.records))throw Error("示意資料格式不正確");
    return data.records.map(r=>({
      metric:r.metric,year:Number(r.year),level:domain==="AU"?r.setting:r.level,
      condition:domain==="AU"?r.setting:r.condition,icu:domain==="AU"?"不適用":r.icu,
      numerator:null,denominator:null,value:Number(r.value),unit:r.unit,
      origin:estimated(r)?"illustrative_estimate":"official_notice",precision:r.precision,
      source_url:r.source_url||data.official_notice_url||"",method:r.method||r.rule||"",model_years:r.from_years
    })).filter(r=>Number.isFinite(r.value)&&r.value>=0&&Number.isInteger(r.year));
  };

  // Organize pages by verified annual-report themes, rather than a single
  // generic chart selector. No figure numbers are asserted without source PDFs.
  const sectionDefinitions={
    AU:[
      {id:"national",title:"全國門住診使用量",sub:"總體 DID 趨勢",metric:"did",scope:"全國門住診",note:"2014=15.0、2023=19.5、2024=21.2 為官方明列值；其餘部分年度為依發布函敘述之示意估計。"},
      {id:"inpatient",title:"住院使用量",sub:"住院 DID 趨勢",metric:"did",scope:"住院",note:"住院使用量以每千住院人日 DID 呈現，不與每千人口人日資料合併。"},
      {id:"aware",title:"AWaRe 合理使用",sub:"Access 占比",metric:"access_pct",scope:"全國門住診",note:"全國門住診 Access 百分比；2024 年 73%，年報公告提及 70% 參考目標。"},
      {id:"aware-ward",title:"住院 AWaRe",sub:"住院 Access 占比",metric:"access_pct",scope:"住院",note:"住院 Access 百分比依年呈現；Watch 與 Reserve 完整原始百分比尚待匯入。"},
      {id:"atc",title:"ATC 類別排名",sub:"2024 年已公告順序",note:"保留年報公告的 ATC 順序。因尚無各類完整 DID 數值，不以長條高度假裝精確用量。"},
      {id:"facility",title:"醫療院所層級別",sub:"醫學中心／診所 Access",metric:"facility_access_pct",scope:"醫學中心",note:"發布函明列醫學中心 2014 年 58%、2024 年 52%，診所 2024 年 83%；醫學中心中間年份為示意插補，其餘院所精確資料待匯入。"},
      {id:"correlation",title:"使用量與抗藥性",sub:"CRAB／CRE／VRE 相關性",note:"年報公告描述 Carbapenems 與 CRAB、CRE 及 Glycopeptides 與 VRE 的相關趨勢；配對觀察值尚未匯入，不以估計值重製相關圖。"}
    ],
    HAI:[
      {id:"sites",title:"ICU 感染部位",sub:"感染部位別密度",metric:"site_density",scope:"感染部位合計",note:"以感染部位／住院人日分母呈現。可再選血流、肺炎、泌尿道與其他部位。"},
      {id:"icu",title:"ICU 類型別",sub:"內外科與其他 ICU",metric:"icu_density",scope:"全部ICU",note:"依 ICU 類型比較，全部 ICU 數值由各 ICU 分子分母加總後計算。"},
      {id:"device",title:"裝置相關感染",sub:"CLABSI／VAP／CAUTI",metric:"device_density",scope:"中心導管相關血流感染",note:"以裝置相關感染人次除以相應裝置使用人日計算密度。"},
      {id:"utilization",title:"醫療裝置使用",sub:"中心導管／呼吸器／導尿管",metric:"device_utilization",scope:"中心導管",note:"裝置使用人日除以住院人日，以百分比呈現。"},
      {id:"association",title:"裝置相關感染比例",sub:"感染部位別占比",metric:"device_share",scope:"血流",note:"裝置相關感染人次／同部位全部感染人次；不同於裝置相關感染密度。"}
    ]
  };
  let activeSection=null;
  let reportEdition=domain==="HAI"&&qs.get("report")==="district"?"district":"above";
  let tierCheckboxes=[];
  let sectionButtons=[];
  let editionButtons=[];
  const permittedLevel=level=>domain!=="HAI"||(reportEdition==="district"?level==="地區醫院":level==="醫學中心"||level==="區域醫院");
  const currentConfig=()=>sectionDefinitions[domain].find(x=>x.id===activeSection)||null;
  function syncSectionButtons(){
    for(const {button,config} of sectionButtons){
      const selected=config.id===activeSection;
      button.setAttribute("aria-pressed",String(selected));
      button.setAttribute("aria-current",selected?"true":"false");
    }
  }
  function syncEditionButtons(){
    for(const {button,edition} of editionButtons)button.setAttribute("aria-pressed",String(reportEdition===edition));
    for(const {input,level} of tierCheckboxes){
      input.disabled=!permittedLevel(level);
      input.checked=permittedLevel(level)&&chosenLevels.has(level);
    }
  }
  function chooseEdition(edition,shouldDraw=true){
    if(domain!=="HAI")return;
    reportEdition=edition==="district"?"district":"above";
    if(shouldDraw){
      chosenLevels=new Set(reportEdition==="district"?["地區醫院"]:["醫學中心","區域醫院"]);
    }else{
      chosenLevels=new Set([...chosenLevels].filter(permittedLevel));
      if(!chosenLevels.size)chosenLevels=new Set(reportEdition==="district"?["地區醫院"]:["醫學中心","區域醫院"]);
    }
    syncEditionButtons();
    if(shouldDraw){
      scopesForMetric(false);
      draw();
    }
  }
  function chooseSection(id,shouldDraw=true){
    const config=sectionDefinitions[domain].find(x=>x.id===id);
    if(!config)return;
    activeSection=config.id;
    if(config.metric){
      $("metric").value=config.metric;
      scopesForMetric(false);
      $("scope").value=config.scope;
      if(["device_density","device_utilization"].includes(config.metric))$("icuType").value="全部ICU";
    }
    syncSectionButtons();
    if(shouldDraw)draw();
  }
  function reportTopicSummary(){
    const selected=currentConfig(),title=selected?.title||"自行調整的篩選條件";
    const base=selected?.note||"使用下方篩選器調整年報式監測圖表。";
    const additional=domain==="HAI"
      ?"（"+(reportEdition==="above"?"區域級以上醫院：醫學中心／區域醫院":"地區醫院")+"；截至 2023 年為 CDC 開放資料；2024 年若勾選為歷史趨勢示意外推，非年報原圖估讀。）"
      :"（正式公告已核對值與示意插補分開標示；未讀取 PDF 原圖，不可視為逐圖精確估讀。）";
    $("reportStatus").textContent=title+"："+base+additional;
    $("figureContext").textContent="對應分析主題："+title+"。"+(domain==="HAI"?"報告對象："+(reportEdition==="above"?"區域級以上醫院":"地區醫院")+"。":"使用年報發布公告已明列的年度與分母。");
  }
  function setupReportTopics(){
    const host=$("reportSections");
    host.replaceChildren();
    sectionButtons=[];
    sectionDefinitions[domain].forEach((config,index)=>{
      const button=node("button",undefined,"report-section");
      button.type="button";
      const number=node("span",String(index+1).padStart(2,"0"),"section-number");
      const words=node("span",undefined,"section-text");
      words.append(node("strong",config.title),node("small",config.sub));
      button.append(number,words);
      button.addEventListener("click",()=>chooseSection(config.id));
      host.append(button);
      sectionButtons.push({button,config});
    });
    if(domain==="HAI"){
      const editions=[
        ["above","2024 區域級以上醫院年報"],
        ["district","2024 地區醫院年報"]
      ];
      const editionHost=$("reportEdition");editionHost.replaceChildren();
      editions.forEach(([edition,title])=>{
        const button=node("button",title);
        button.type="button";
        button.addEventListener("click",()=>chooseEdition(edition));
        editionHost.append(button);
        editionButtons.push({button,edition});
      });
      chooseEdition(reportEdition,false);
    }
    const requested=qs.get("section");
    if(sectionDefinitions[domain].some(x=>x.id===requested))chooseSection(requested,false);
    else if(qs.has("metric")){activeSection=null;syncSectionButtons();}
    else chooseSection(sectionDefinitions[domain][0].id,false);
    syncEditionButtons();
    reportTopicSummary();
  }

  function populate(id,values,wanted){
    const element=$(id);element.replaceChildren();
    values.forEach(([v,label])=>{const option=node("option",label);option.value=String(v);element.append(option);});
    element.value=values.some(x=>String(x[0])===String(wanted))?String(wanted):String(values[0]?.[0]??"");
  }
  function scopesForMetric(initial){
    const metric=$("metric").value;
    let candidates=domain==="AU"?(metric==="facility_access_pct"?["醫學中心","診所"]:["全國門住診","住院"]):scopes[metric];
    if(domain==="HAI"&&metric==="icu_density"){
      candidates=candidates.filter(scope=>scope==="全部ICU"||
        all.some(r=>r.metric===metric&&r.condition===scope&&permittedLevel(r.level)));
    }
    populate("scope",candidates.map(x=>[x,x]),initial?qs.get("scope"):$("scope").value);
    const device=["device_density","device_utilization"].includes(metric);
    $("icuField").hidden=!device;
    if(device){const types=["全部ICU",...new Set(all.filter(r=>r.metric===metric&&r.icu!=="全部ICU"&&permittedLevel(r.level)).map(r=>r.icu))];populate("icuType",types.map(x=>[x,x]),initial?qs.get("icu"):"全部ICU");}
  }
  function setup(){
    const metrics=domain==="AU"?namesAU:namesHAI;
    populate("metric",Object.entries(metrics),qs.get("metric"));
    if(domain==="AU")$("hospitalOptions").hidden=true;
    else{
      chosenLevels=new Set(reportEdition==="district"?["地區醫院"]:["醫學中心","區域醫院"]);
      if(qs.has("levels")){
        const wanted=new Set(qs.get("levels").split(",").filter(x=>levels.includes(x)&&permittedLevel(x)));
        if(wanted.size)chosenLevels=wanted;
      }
      const box=$("hospitalOptions");box.replaceChildren();
      tierCheckboxes=[];
      levels.forEach((level,i)=>{
        const label=node("label"),check=node("input");
        check.type="checkbox";check.checked=chosenLevels.has(level);check.disabled=!permittedLevel(level);
        check.addEventListener("change",()=>{
          if(check.disabled)return;
          if(check.checked)chosenLevels.add(level);else chosenLevels.delete(level);
          draw();
        });
        label.style.color=colors[i];
        label.append(check,node("span",level));box.append(label);
        tierCheckboxes.push({input:check,level});
      });
    }
    const nums=Array.from({length:Math.max(...years)-Math.min(...years)+1},(_,i)=>Math.min(...years)+i);
    populate("startYear",nums.map(y=>[y,y]),qs.get("start")||(domain==="AU"?2013:2017));
    populate("endYear",nums.map(y=>[y,y]),qs.get("end")||Math.max(...years));
    if(["line","bar","table"].includes(qs.get("view")))$("view").value=qs.get("view");
    scopesForMetric(true);
    $("metric").addEventListener("change",()=>{activeSection=null;syncSectionButtons();scopesForMetric(false);draw();});
    ["scope","icuType"].forEach(id=>$(id).addEventListener("change",()=>{activeSection=null;syncSectionButtons();draw();}));
    ["startYear","endYear","view"].forEach(id=>$(id).addEventListener("change",draw));
    $("includeEstimates").checked=qs.get("estimates")!=="0"&&estimateRecords.some(estimated);
    $("includeEstimates").disabled=!estimateRecords.some(estimated);
    $("includeEstimates").addEventListener("change",draw);
    $("download").addEventListener("click",download);
    $("copyLink").addEventListener("click",share);
  }
  function filter(){
    const metric=$("metric").value,scope=$("scope").value,start=Number($("startYear").value),end=Number($("endYear").value),icu=$("icuType").value;
    if(start>end)return [];
    return all.filter(r=>(!estimated(r)||$("includeEstimates").checked)&&r.metric===metric&&r.condition===scope&&r.year>=start&&r.year<=end
      &&(domain==="AU"||(permittedLevel(r.level)&&chosenLevels.has(r.level)))
      &&(domain==="AU"||!["device_density","device_utilization"].includes(metric)||r.icu===icu))
      .sort((a,b)=>a.year-b.year||a.level.localeCompare(b.level,"zh-TW"));
  }
  const color=level=>domain==="AU"?(level==="全國門住診"?colors[0]:level==="醫學中心"?"#2b98ce":level==="診所"?"#f19c47":colors[1]):colors[levels.indexOf(level)]||colors[0];
  const detail=r=>r.year+"年／"+r.level+"／"+r.condition+"："+fmt(r.value)+" "+r.unit+
    "【"+qualityLabel(r)+"】"+
    (r.numerator!==null?"；分子 "+fmt(r.numerator)+"；分母 "+fmt(r.denominator):"；沒有本資料點的公開分子／分母")+
    (r.icu!=="全部ICU"&&r.icu!=="不適用"?"；"+r.icu:"")+
    (estimated(r)?"；"+(domain==="AU"?"依公告值及趨勢假設插補，不是原圖估讀":"由 2022–2023 歷史資料趨勢推算，非年報報告值"):"");
  function graph(records){
    const chart=$("chart");chart.replaceChildren();
    const legend=$("legend");legend.replaceChildren();
    const groups=[...new Set(records.map(r=>r.level))].sort((a,b)=>domain==="AU"?a.localeCompare(b):levels.indexOf(a)-levels.indexOf(b));
    groups.forEach(g=>{const item=node("span",undefined,"legend-item"),sw=node("span",undefined,"legend-swatch");sw.style.background=color(g);item.append(sw,node("span",g));legend.append(item);});
    if($("view").value==="table"){chart.append(node("div","資料表模式：請查看下方明細數值。","empty"));return;}
    if(!records.length){chart.append(node("div","目前篩選條件無資料；不會填入估計值或零值。","empty"));return;}
    const start=Number($("startYear").value),end=Number($("endYear").value),W=940,H=365,L=75,R=22,T=24,B=62,PW=W-L-R,PH=H-T-B;
    const x=year=>L+(year-start)/Math.max(1,end-start)*PW;
    const isPercent=records[0].unit==="%";const max=Math.max(...records.map(r=>r.value));
    const top=isPercent?Math.max(10,Math.min(100,Math.ceil(max/10)*10)):Math.max(1,Math.ceil(max*1.17*10)/10);
    const y=value=>T+PH-(value/top)*PH;
    const root=shape("svg",{viewBox:"0 0 "+W+" "+H,role:"img","aria-label":$("chartTitle").textContent+" 共 "+records.length+" 筆資料"});
    // Keep the figure a legible, white scientific-report surface in both themes.
    root.append(shape("rect",{x:0,y:0,width:W,height:H,fill:"#fff"}));
    for(let k=0;k<=5;k++){const v=top*k/5,yy=y(v);root.append(shape("line",{x1:L,x2:L+PW,y1:yy,y2:yy,class:"gridline"}),shape("text",{x:L-8,y:yy+4,"text-anchor":"end",class:"axis-label"},Number(v.toFixed(2)).toLocaleString("zh-TW")));}
    if(domain==="AU"&&$("metric").value==="access_pct"&&$("scope").value==="全國門住診"&&top>=70){
      const limitY=y(70);
      root.append(shape("line",{x1:L,x2:W-R,y1:limitY,y2:limitY,class:"report-threshold"}));
      root.append(shape("text",{x:W-R-5,y:limitY-7,"text-anchor":"end",class:"threshold-label"},"Access 70% 參考目標"));
    }
    const stride=Math.max(1,Math.ceil((end-start+1)/10));
    for(let year=start;year<=end;year++)if((year-start)%stride===0||year===end)root.append(shape("text",{x:x(year),y:H-B+22,"text-anchor":"middle",class:"axis-label"},year));
    root.append(shape("text",{x:W/2,y:H-8,"text-anchor":"middle",class:"axis-label"},"監測年度"));
    const display=r=>{$("pointDetails").textContent=detail(r);};
    if($("view").value==="line"){
      for(const group of groups){
        const subset=records.filter(r=>r.level===group).sort((a,b)=>a.year-b.year);
        // An estimated endpoint makes the connecting segment dashed;
        // verified-to-verified consecutive segments remain solid.
        let previous=null;
        for(const r of subset){
          if(previous&&r.year-previous.year===1){
            const synthetic=estimated(previous)||estimated(r);
            root.append(shape("line",{
              x1:x(previous.year),y1:y(previous.value),x2:x(r.year),y2:y(r.value),
              stroke:color(group),"stroke-width":synthetic?2:3,
              ...(synthetic?{"stroke-dasharray":"6 5"}:{})
            }));
          }
          previous=r;
        }
        for(const r of subset){
          const synthetic=estimated(r);
          const c=shape("circle",{
            cx:x(r.year),cy:y(r.value),r:synthetic?6.5:5.5,
            fill:synthetic?"#fff":color(group),
            stroke:synthetic?color(group):"#fff","stroke-width":synthetic?2.6:1.3,
            tabindex:0,role:"button","aria-label":detail(r),
            class:synthetic?"point estimated-circle":"point official-circle"
          });
          c.append(shape("title",{},detail(r)));
          ["mouseenter","focus","click"].forEach(ev=>c.addEventListener(ev,()=>display(r)));
          root.append(c);
        }
      }
    }else{
      const barW=Math.max(2,Math.min(19,PW/(end-start+1)/Math.max(1,groups.length)-2));
      for(const r of records){
        const left=x(r.year)+groups.indexOf(r.level)*barW-groups.length*barW/2,yy=y(r.value),synthetic=estimated(r);
        const rect=shape("rect",{
          x:left,y:yy,width:barW-1,height:T+PH-yy,
          fill:synthetic?"#fff":color(r.level),stroke:synthetic?color(r.level):"none",
          "stroke-width":synthetic?2.5:0,
          tabindex:0,role:"button","aria-label":detail(r)
        });
        rect.append(shape("title",{},detail(r)));
        ["mouseenter","focus","click"].forEach(ev=>rect.addEventListener(ev,()=>display(r)));
        root.append(rect);
      }
    }
    if(records.some(estimated)){
      root.append(shape("text",{x:L+3,y:T+14,class:"estimate-key"},"○ 虛線／空心點：示意估計，非年報原始數值"));
    }
    chart.append(root);
  }
  function renderTable(rows){
    const host=$("tableBox");host.replaceChildren();
    if(!rows.length){host.append(node("div","尚無符合條件的數值。","empty"));return;}
    const fields=[["年度",r=>r.year],["層級／對象",r=>r.level],["分析項目",r=>r.condition],["ICU類型",r=>r.icu],["數值",r=>fmt(r.value)],["單位",r=>r.unit],["分子",r=>r.numerator===null?"—":fmt(r.numerator)],["分母",r=>r.denominator===null?"—":fmt(r.denominator)],["資料性質",r=>qualityLabel(r)]];
    const table=node("table"),thead=node("thead"),tr=node("tr");
    fields.forEach(([name])=>tr.append(node("th",name)));thead.append(tr);table.append(thead);
    const tbody=node("tbody");[...rows].sort((a,b)=>b.year-a.year).forEach(r=>{const row=node("tr");fields.forEach(([name,fn],i)=>{const cell=node("td",fn(r));if([4,6,7].includes(i))cell.className="numeric";row.append(cell);});tbody.append(row);});
    table.append(tbody);host.append(table);
  }
  function summary(rows){
    const host=$("summaryCards");host.replaceChildren();
    if(!rows.length){host.append(node("div","沒有已核實資料","empty"));return;}
    for(const level of new Set(rows.map(r=>r.level))){const last=rows.filter(r=>r.level===level).sort((a,b)=>b.year-a.year)[0],card=node("div",undefined,"metric-card");card.append(node("small",level+"／"+last.year+"年"),node("strong",fmt(last.value)),node("small",last.unit+" · "+qualityLabel(last)));host.append(card);}
  }
  function ranking(){
    if(domain!=="AU")return;
    $("rankingPanel").hidden=false;
    const host=$("rankings");host.replaceChildren();
    for(const r of source.atc_rankings||[]){const box=node("div",undefined,"metric-card"),ol=node("ol");box.append(node("h3",r.year+" 年／"+r.setting));r.classes.forEach(item=>{const li=node("li"),code=node("code",item);li.append(code);ol.append(li);});box.append(ol,node("small","公告僅列名次，未提供本頁可核對之使用量數值。"));host.append(box);}
  }
  function sources(){
    const host=$("sources");host.replaceChildren();
    const urls=domain==="AU"?
      [
        ["2024 年 AU 年報 PDF（官方原件）",source.report_style_reference?.official_pdf_url],
        ["疾管署 AU 年報發布索引",source.report_style_reference?.index_url||source.official_report_url],
        ...source.sources.map(x=>[x.report_year+" 年 AU 年報公告摘述",x.url])
      ]:
      [
        ...(source.report_style_references||[]).map(x=>[x.report_title+" PDF（官方原件）",x.official_pdf_url]),
        ["疾管署 HAI 年報下載索引",source.annual_report_2024_url],
        ...Object.values(source.collections).map(x=>[x.title+"（開放資料）",x.official_dataset_url])
      ];
    urls.forEach(([label,url])=>{try{if(new URL(url).protocol!=="https:")return;const a=node("a",label+" ↗");a.href=url;a.target="_blank";a.rel="noopener noreferrer";host.append(a);}catch(_){}});
    $("sourceFootnote").textContent=domain==="AU"
      ?"2024 AU 年報原件已提供連結。官方發布函直接列明的 DID／AWaRe 錨點與中間年度「示意估計」以不同符號標示；示意值不是年報 PDF 原圖估讀或正式數值。DID 每千人口人日與每千住院人日分母不可混用。"
      :"2024 HAI 兩份官方年報 PDF 已提供連結。2008–2023 年為疾管署開放資料實際分子、分母計算值；2024 年若顯示空心點，僅為依 2022–2023 歷史趨勢產生的模型示意，並非從 PDF 年報圖形擷取。";
  }
  function draw(){
    if(!source)return;
    const config=currentConfig();
    if(config&&!config.metric){
      visible=[];
      $("chartTitle").textContent=config.title+" · 年報分析主題";
      $("chartSubtitle").textContent="2024 年年報索引；本頁尚未匯入此主題的完整精確資料";
      $("dataBadge").textContent="項目已列入 · 數值待核對";
      $("status").textContent=config.title+"：尚未取得可重繪的逐項原始精確數值；未以示意值代替。";
      $("chart").replaceChildren(node("div","此主題尚無完整精確資料可重繪，請參考下方來源年報；目前不以估讀值產生圖表。","figure-not-ready"));
      $("legend").replaceChildren();
      $("pointDetails").textContent="本主題目前僅呈現年報公告可確認的分析方向，沒有可用作圖的數值。";
      $("figureCaption").textContent="對應："+config.title+"；待完整原始資料核對後加入年報圖表。";
      $("chartNote").textContent=config.note;
      renderTable([]);summary([]);
      $("rankingPanel").hidden=domain!=="AU"||config.id!=="atc";
      $("download").disabled=true;
      reportTopicSummary();
      return;
    }
    $("download").disabled=false;
    $("rankingPanel").hidden=true;
    visible=filter();const metric=$("metric").value,names=domain==="AU"?namesAU:namesHAI;
    $("chartTitle").textContent=names[metric]+" · "+$("scope").value;
    $("chartSubtitle").textContent=$("startYear").value+"–"+$("endYear").value+"年 · "+(visible[0]?.unit||unit[metric])+(domain==="HAI"&&["device_density","device_utilization"].includes(metric)?" · "+$("icuType").value:"");
    const estimatesInView=visible.filter(estimated).length;
    const verifiedInView=visible.length-estimatesInView;
    $("dataBadge").textContent=domain==="AU"
      ?"年報公告錨點"+(estimatesInView?"＋"+estimatesInView+"個示意估計":"")
      :"CDC 開放資料 2008–2023"+(estimatesInView?"＋"+estimatesInView+"個2024示意推估":"");
    $("status").textContent="目前篩選 "+visible.length+" 筆資料（已核對 "+verifiedInView+"、示意估計 "+estimatesInView+"）。"+
      (estimatesInView?" 估計值僅供頁面設計與趨勢展示，非年報正式統計。":" 目前未包含示意估計。")+
      (modelLoadError?" 示意資料載入提醒："+modelLoadError:"");
    $("chartNote").textContent=domain==="AU"
      ?"實心點為官方公布錨點；虛線、空心點為由錨點及公布趨勢設計的示意數值，未讀取 PDF 圖形，非逐圖估讀；不同 DID 分母不能混算。"
      :"截至 2023 年為 CDC 開放資料分子分母計算值；2024 年空心點為由 2022–2023 趨勢外推且年變動上限 8% 的示意值，非 2024 年報估讀或正式數據。";
    $("figureCaption").textContent="監測年報參考示意圖｜"+names[metric]+" · "+$("scope").value+"；"+
      $("startYear").value+"–"+$("endYear").value+" 年。"+(domain==="HAI"?"對象："+(reportEdition==="above"?"區域級以上醫院":"地區醫院")+"。":"")+
      " 已核對數值 "+verifiedInView+" 筆，示意估計 "+estimatesInView+" 筆；非年報原圖。";
    reportTopicSummary();
    graph(visible);renderTable(visible);summary(visible);
  }
  function download(){
    if(!visible.length)return;
    const fields=["year","level","metric","condition","icu","value","unit","numerator","denominator","precision","origin","method","source_url"];
    const safe=value=>{let s=String(value??"");if(/^[=+@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
    const csv="\ufeff"+fields.join(",")+"\r\n"+visible.map(r=>fields.map(k=>safe(r[k])).join(",")).join("\r\n");
    const u=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})),a=node("a");a.href=u;a.download=domain.toLowerCase()+"-annual-data.csv";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
  }
  async function share(){
    const url=new URL(location.href);
    const args={metric:$("metric").value,scope:$("scope").value,icu:$("icuType").value,start:$("startYear").value,end:$("endYear").value,view:$("view").value,levels:[...chosenLevels].join(","),section:activeSection||"",report:domain==="HAI"?reportEdition:"",estimates:$("includeEstimates").checked?"1":"0"};
    Object.entries(args).forEach(([k,v])=>url.searchParams.set(k,v));
    try{await navigator.clipboard.writeText(url.href);$("status").textContent="已複製篩選網址："+url.href;}catch(_){$("status").textContent="可複製此篩選網址："+url.href;}
  }
  async function init(){
    try{
      const file=domain==="AU"?"./data/au/au_report_verified_2013_2024.json":"./data/hai/hai_open_2008_2023.json";
      const response=await fetch(file,{cache:"no-store"});
      if(!response.ok)throw Error("HTTP "+response.status);
      source=await response.json();
      if(source.domain!==domain)throw Error("資料集領域不符");
      all=domain==="AU"?normalizeAU(source):normalizeHAI(source);
      if(!all.length||all.some(r=>!Number.isFinite(r.value)||r.value<0))throw Error("資料缺漏或數值格式異常");
      // Preview points are a separate dataset and never overwrite official
      // historical data. The public source remains usable if model loading fails.
      const previewFile=domain==="AU"
        ?"./data/au/au_2024_illustrative_estimates.json"
        :"./data/hai/hai_2024_illustrative_estimates.json";
      try{
        const previewResponse=await fetch(previewFile,{cache:"no-store"});
        if(!previewResponse.ok)throw Error("HTTP "+previewResponse.status);
        estimateRecords=normalizePreview(await previewResponse.json());
        const originalKeys=new Set(all.map(r=>[r.metric,r.year,r.level,r.condition,r.icu].join("|")));
        const seen=new Set();
        estimateRecords=estimateRecords.filter(r=>{
          const key=[r.metric,r.year,r.level,r.condition,r.icu].join("|");
          if(originalKeys.has(key)||seen.has(key))return false;
          seen.add(key);return true;
        });
        all.push(...estimateRecords);
      }catch(error){modelLoadError=String(error.message||error);estimateRecords=[];}
      years=[...new Set(all.map(r=>r.year))].sort((a,b)=>a-b);
      setup();ranking();sources();setupReportTopics();draw();
      if(window.__AMR_REPORT_TEST__)window.__AMR_REPORT_TEST__.ready={all,visible,source};
    }catch(err){$("status").textContent="讀取失敗："+err.message;$("chart").replaceChildren(node("div","來源資料無法讀取，網站不會以示意估計值取代所有正式數值。","empty"));}
  }
  if(window.__AMR_REPORT_TEST__)window.__AMR_REPORT_TEST__.helpers={normalizeHAI,normalizeAU,rate,filter};
  init();
})();

/* Progressive keyboard and assistive-technology support; no surveillance values are changed. */
(()=>{'use strict';
function setup(){
 const main=document.querySelector('main');
 if(!main)return;
 if(!main.id)main.id='main-content';
 if(!main.hasAttribute('tabindex'))main.setAttribute('tabindex','-1');
 if(!document.querySelector('.a11y-skip')){
   const a=document.createElement('a');a.className='a11y-skip';a.href='#'+main.id;a.textContent='跳至主要內容';document.body.insertBefore(a,document.body.firstChild);
 }
 if(!document.getElementById('a11y-announcer')){
  const s=document.createElement('div');s.id='a11y-announcer';s.className='a11y-visually-hidden';s.setAttribute('role','status');s.setAttribute('aria-live','polite');s.setAttribute('aria-atomic','true');document.body.appendChild(s);
 }
 document.querySelectorAll('main table').forEach(t=>{
  if(!t.querySelector('caption')){const caption=document.createElement('caption');caption.className='a11y-visually-hidden';caption.textContent='監測資料明細表';t.prepend(caption)}
  t.querySelectorAll('thead th').forEach(th=>{if(!th.hasAttribute('scope'))th.setAttribute('scope','col')});
 });
 document.querySelectorAll('.gridwrap,.ab-scroller,.wide').forEach(el=>{
  if(el.dataset.a11yReady)return;el.dataset.a11yReady='1';
  el.setAttribute('role','region');el.setAttribute('aria-label','可水平捲動的監測資料圖表');
  el.setAttribute('tabindex','0');
  const hint=document.createElement('p');hint.className='a11y-scroll-hint';hint.textContent='提示：在手機可左右滑動表格；使用鍵盤時可先聚焦圖表，再以方向鍵捲動。';el.parentNode.insertBefore(hint,el);
 });
 document.querySelectorAll('button').forEach(b=>{if(!b.getAttribute('type')&&!b.closest('form'))b.type='button'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();

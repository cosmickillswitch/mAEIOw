/* Learn page: renders window.LEARN (see learn-content.js).
   Item fields (all optional except h):
     h: heading · hFm: heading is a formula · fm: a formula line · p: [paragraphs]
     rows: [[label, value, isFormula]] · pair: [[label, formula], [label, formula]]
     try: [href, label] · sep: SEP slug */
(function(){
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SEP='https://plato.stanford.edu/entries/';
const L=window.LEARN;
const fm=s=>`<span class="fm">${esc(s)}</span>`;
function item(it){
  let h=`<article class="entry"><h3>${it.hFm?fm(it.h):esc(it.h)}</h3>`;
  if(it.fm)h+=`<p>${fm(it.fm)}</p>`;
  if(it.pair)h+=`<div class="pair">${it.pair.map(([l,f])=>`<div><span class="lbl">${esc(l)}</span>${fm(f)}</div>`).join('')}</div>`;
  (it.p||[]).forEach(t=>{h+=`<p>${esc(t)}</p>`;});
  (it.rows||[]).forEach(([l,v,isF])=>{h+=`<p class="ex"><span class="lbl">${esc(l)}</span> ${isF?fm(v):esc(v)}</p>`;});
  const links=[];
  if(it.try)links.push(`<a class="try" href="${esc(it.try[0])}">${esc(it.try[1]||'Try it')} →</a>`);
  if(it.sep)links.push(`<a href="${SEP}${it.sep}/" target="_blank" rel="noopener">SEP: ${esc((L.sepNames||{})[it.sep]||it.sep)}</a>`);
  if(links.length)h+=`<div class="links">${links.join('')}</div>`;
  return h+'</article>';
}
let view=L.tabs[0].id;
try{const v=localStorage.getItem(L.key+'-view');if(L.tabs.some(t=>t.id===v))view=v;}catch(e){}
$('ltabs').innerHTML=L.tabs.map(t=>`<button role="tab" data-v="${t.id}">${esc(t.label)}</button>`).join('');
$('ltabs').style.gridTemplateColumns=`repeat(${L.tabs.length},minmax(0,1fr))`;
function render(){
  const tab=L.tabs.find(t=>t.id===view);
  document.querySelectorAll('#ltabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.v===view)));
  $('searchrow').hidden=!tab.search;
  const q=($('q').value||'').trim().toLowerCase();
  const items=tab.search&&q?tab.items.filter(it=>JSON.stringify(it).toLowerCase().includes(q)):tab.items;
  $('list').innerHTML=(tab.lead?`<p class="lead">${esc(tab.lead)}</p>`:'')+(items.length?items.map(item).join(''):'<p class="empty">No entries match.</p>');
}
$('ltabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;view=b.dataset.v;try{localStorage.setItem(L.key+'-view',view);}catch(e){}render();});
$('q').addEventListener('input',render);
render();
})();

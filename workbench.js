/* ================= app state ================= */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY='maeiow-v1';
const S=(boxes,ops,quants,neg)=>({neg:!!neg,quants:quants||[],boxes:boxes.map(b=>typeof b==='string'?{text:b,neg:false}:b),ops:ops||[]});
const N=t=>({text:t,neg:true});
const PRESETS={
  prop:[
    {name:'Chain of conditionals',vars:[['P','it is raining'],['Q','the pitch is wet'],['R','the match is cancelled']],prem:[S(['P','Q'],['imp']),S(['Q','R'],['imp'])],concl:S(['P','R'],['imp'])},
    {name:'Disjunctive syllogism',vars:[['P','the key is in the kitchen'],['Q','the key is in the car']],prem:[S(['P','Q'],['or']),S([N('P')])],concl:S(['Q'])},
    {name:'Excluded middle',vars:[['P','it will rain tomorrow']],prem:[],concl:S(['P',N('P')],['or'])},
    {name:'De Morgan',vars:[['P','the shop is open'],['Q','the café is open']],prem:[S(['P','Q'],['and'],[],true)],concl:S([N('P'),N('Q')],['or'])},
    {name:'Affirming the consequent',vars:[['P','it is raining'],['Q','the ground is wet']],prem:[S(['P','Q'],['imp']),S(['Q'])],concl:S(['P'])},
  ],
  fol:[
    {name:'Socrates is mortal',preds:[['H',1,'x is human'],['M',1,'x is mortal']],consts:[['s','Socrates']],prem:[S(['Hx','Mx'],['imp'],['∀x']),S(['Hs'])],concl:S(['Ms'])},
    {name:'Some frogs are green',preds:[['F',1,'x is a frog'],['G',1,'x is green']],consts:[],prem:[S(['Fx','Gx'],['imp'],['∀x']),S(['Fx'],[],['∃x'])],concl:S(['Gx'],[],['∃x'])},
    {name:'Quantifier negation',preds:[['F',1,'x can fly']],consts:[],prem:[S(['Fx'],[],['∀x'],true)],concl:S([N('Fx')],[],['∃x'])},
    {name:'Someone loved by all',preds:[['L',2,'x loves y']],consts:[],prem:[S(['Lxy'],[],['∃y','∀x'])],concl:S(['Lxy'],[],['∀x','∃y'])},
    {name:'Quantifier swap (invalid)',preds:[['L',2,'x loves y']],consts:[],prem:[S(['Lxy'],[],['∀x','∃y'])],concl:S(['Lxy'],[],['∃y','∀x'])},
  ],
  hol:[
    {name:'Indiscernibles share properties',preds:[['F',1,'x is friendly']],consts:[['a','Alice'],['b','Bob']],prem:[S(['Xa','Xb'],['iff'],['∀X']),S(['Fa'])],concl:S(['Fb'])},
    {name:'Alice has some property',preds:[['F',1,'x is friendly']],consts:[['a','Alice']],prem:[S(['Fa'])],concl:S(['Xa'],[],['∃X'])},
    {name:'Every property at once',preds:[['F',1,'x is friendly'],['G',1,'x is generous']],consts:[['a','Alice']],prem:[S(['Xa'],[],['∀X'])],concl:S(['Fa','Ga'],['and'])},
    {name:'Telling apart ≠ the same (invalid)',preds:[['F',1,'x is friendly']],consts:[['a','Alice'],['b','Bob']],prem:[S(['Xa',N('Xb')],['and'],['∃X'])],concl:S(['Xa','Xb'],['imp'],['∀X'])},
  ],
  cat:[
    {name:'Barbara',terms:[['S','Greeks'],['M','humans'],['P','mortals']],prem:[{q:'A',s:1,p:2},{q:'A',s:0,p:1}],concl:{q:'A',s:0,p:2},imp:false},
    {name:'Celarent',terms:[['S','snakes'],['M','reptiles'],['P','mammals']],prem:[{q:'E',s:1,p:2},{q:'A',s:0,p:1}],concl:{q:'E',s:0,p:2},imp:false},
    {name:'Darapti (needs import)',terms:[['S','horned animals'],['M','unicorns'],['P','magical creatures']],prem:[{q:'A',s:1,p:2},{q:'A',s:1,p:0}],concl:{q:'I',s:0,p:2},imp:false},
    {name:'Undistributed middle',terms:[['S','cats'],['M','mammals'],['P','dogs']],prem:[{q:'A',s:2,p:1},{q:'A',s:0,p:1}],concl:{q:'A',s:0,p:2},imp:false},
    {name:'Conversion of E',terms:[['S','fish'],['P','birds']],prem:[{q:'E',s:0,p:1}],concl:{q:'E',s:1,p:0},imp:false},
  ]
};
const DEF_PROP=['P','Q','R','S','T','U','V','W'],DEF_PRED=['F','G','H','J','K','L'],DEF_CONST=['a','b','c','d','e','f'],DEF_TERM=['S','M','P','R'];
function fromPreset(tab,p){
  const c=x=>JSON.parse(JSON.stringify(x));
  if(tab==='prop')return{vars:p.vars.map(([l,m])=>({l,m})),prem:c(p.prem),concl:c(p.concl)};
  if(tab==='cat')return{terms:p.terms.map(([l,m])=>({l,m})),prem:c(p.prem),concl:c(p.concl),imp:p.imp};
  return{preds:p.preds.map(([l,ar,m])=>({l,ar,m})),consts:p.consts.map(([l,m])=>({l,m})),prem:c(p.prem),concl:c(p.concl)};
}
function defaults(){return{tab:'prop',logic:'classical',prop:fromPreset('prop',PRESETS.prop[0]),fol:fromPreset('fol',PRESETS.fol[0]),hol:fromPreset('hol',PRESETS.hol[0]),cat:fromPreset('cat',PRESETS.cat[0])};}
let state=defaults();
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.prop&&s.fol&&s.hol&&s.cat)state=Object.assign(defaults(),s);}catch(e){}
if(!["cat"].includes(state.tab))state.tab='cat';
let saveT;function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}},300);}
const T=()=>state[state.tab];
const modeOf=tab=>tab==='prop'?'prop':tab;

const INTRO={
  cat:'Aristotle’s logic of terms. Every statement has the form All / No / Some S are P. Each term stands for a group of things.',
  prop:'Whole statements joined by connectives. Each variable stands for a sentence that is true or false.',
  fol:'First-order logic: predicates describe objects, names pick out objects, and ∀x / ∃x quantify over objects.',
  hol:'Higher-order logic: you can also quantify over properties with ∀X / ∃X. Property variables are filled in with the predicates you define here.'
};
const LOGICS={classical:'Classical',intuitionistic:'Intuitionistic',minimal:'Minimal'};
const OPNAMES={and:'∧  and',or:'∨  or',imp:'→  if…then',iff:'↔  iff'};
const CATQ={A:['All','are'],E:['No','are'],I:['Some','are'],O:['Some','are not']};

/* ================= symbol tables & English ================= */
function symbols(tab){
  const t=state[tab],sym={prop:{},pred:{},cons:{}};
  if(tab==='prop')t.vars.forEach(v=>sym.prop[v.l]=v.m);
  else if(tab!=='cat'){t.preds.forEach(p=>sym.pred[p.l]=p.m);t.consts.forEach(c=>sym.cons[c.l]=c.m);}
  return sym;}
function eng(f,sym,top){
  const E=g=>eng(g,sym,false);
  const W=(c,p)=>{const t=E(c);return(SYM[c.t]&&c.t!==p.t)?'('+t+')':t;};
  switch(f.t){
    case'atom':{
      if(!f.args.length)return(sym.prop[f.p]||sym.pred[f.p]||f.p).trim()||f.p;
      const names=f.args.map(a=>(sym.cons[a]||'').trim()||a);
      const tpl=(sym.pred[f.p]||'').trim();
      if(tpl)return tpl.replace(/\b([xyz])\b/g,m=>{const k='xyz'.indexOf(m);return k<names.length?names[k]:m;});
      if(isPV(f.p)&&names.length===1)return names[0]+' has property '+f.p;
      return f.p+' holds of '+names.join(' and ');}
    case'bot':return'a contradiction';
    case'not':return'it is not the case that '+E(f.a);
    case'and':return W(f.a,f)+' and '+W(f.b,f);
    case'or':return'either '+W(f.a,f)+' or '+W(f.b,f);
    case'imp':return'if '+W(f.a,f)+', then '+W(f.b,f);
    case'iff':return W(f.a,f)+' if and only if '+W(f.b,f);
    case'all':return(isPV(f.v)?'for every property '+f.v:'for every '+f.v)+', '+E(f.a);
    case'ex':return(isPV(f.v)?'there is a property '+f.v:'there is some '+f.v)+' such that '+E(f.a);
  }}
const sentence=s=>s.replace(/[a-z]/,c=>c.toUpperCase())+'.';
const catEng=(st,terms)=>{const[a,b]=CATQ[st.q];const nm=i=>(terms[i].m||'').trim()||terms[i].l;return`${a} ${nm(st.s)} ${b} ${nm(st.p)}.`;};

function buildStmt(st,mode){
  let f=null;
  st.boxes.forEach((b,i)=>{
    if(!b.text.trim())throw new Error(`Box ${i+1} is empty.`);
    let g;try{g=parse(b.text,mode);}catch(e){throw new Error((st.boxes.length>1?`Box ${i+1}: `:'')+e.message);}
    if(b.neg)g=mk('not',g);
    f=i===0?g:mk(st.ops[i-1]||'and',f,g);});
  for(let i=st.quants.length-1;i>=0;i--){const q=st.quants[i];if(!q)continue;f=quant(q[0]==='∀'?'all':'ex',q.slice(1),f);}
  if(st.neg)f=mk('not',f);
  return f;}
function freeVarWarn(f){const o=names(f);const fv=[...o.terms].filter(t=>/^[xyzw]/.test(t));
  return fv.length?`${fv.join(', ')} ${fv.length>1?'are':'is'} not bound by ∀ or ∃ here, so ${fv.length>1?'they are':'it is'} treated as a name.`:'';}

/* ================= builder rendering ================= */
const opt=(v,label,sel)=>`<option value="${esc(v)}"${sel?' selected':''}>${esc(label)}</option>`;
const range=(a,b,cur)=>{let s='';for(let i=a;i<=b;i++)s+=opt(i,i,i===cur);return s;};
function qOptions(tab,cur){
  const vs=tab==='hol'?['x','y','z','X','Y']:['x','y','z'];let s=opt('','— none',!cur);
  for(const v of vs)for(const q of['∀','∃'])s+=opt(q+v,q+v,cur===q+v);return s;}
function stmtHTML(tab,st,id,label){
  const isC=id==='c';
  if(tab==='cat'){
    const terms=state.cat.terms.slice(0,state.cat.terms.n||state.cat.terms.length);
    const tsel=(act,cur)=>`<select data-act="${act}" aria-label="Term">${terms.map((t,i)=>opt(i,t.l+(t.m?' · '+t.m:''),i===cur)).join('')}</select>`;
    return`<div class="stmt${isC?' concl':''}" data-st="${id}">
      <div class="stmthead"><span class="label">${label}</span></div>
      <div class="catline"><select data-act="cq" aria-label="Quantity">${Object.entries(CATQ).map(([k,[a,b]])=>opt(k,`${k}: ${a} … ${b}`,st.q===k)).join('')}</select>
      ${tsel('cs',st.s)}<span class="word">${CATQ[st.q][1]}</span>${tsel('cp',st.p)}</div>
      <div class="preview" data-prev></div></div>`;}
  const quants=tab==='prop'?'':`<div class="qrow">${st.quants.map((q,qi)=>`<select data-act="qs" data-q="${qi}" aria-label="Quantifier ${qi+1}">${qOptions(tab,q)}</select>`).join('')}
    <button class="mini" data-act="qadd">+ quantifier</button>${st.quants.length?'<button class="mini" data-act="qrm" aria-label="Remove last quantifier">−</button>':''}</div>`;
  const boxes=st.boxes.map((b,bi)=>`${bi?`<select class="op" data-act="op" data-b="${bi-1}" aria-label="Operator">${Object.entries(OPNAMES).map(([k,v])=>opt(k,v,(st.ops[bi-1]||'and')===k)).join('')}</select>`:''}<span class="slot"><select class="bneg" data-act="bneg" data-b="${bi}" aria-label="Negate box ${bi+1}">${opt('','·',!b.neg)}${opt('1','¬',b.neg)}</select><input class="box" data-act="box" data-b="${bi}" id="box-${tab}-${id}-${bi}" value="${esc(b.text)}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Box ${bi+1}"></span>`).join('');
  return`<div class="stmt${isC?' concl':''}" data-st="${id}">
    <div class="stmthead"><span class="label">${label}</span><select data-act="sneg" aria-label="Negate whole statement">${opt('','as written',!st.neg)}${opt('1','¬( whole statement )',st.neg)}</select></div>
    ${quants}<div class="boxes">${boxes}<button class="mini" data-act="badd">+ box</button>${st.boxes.length>1?'<button class="mini" data-act="brm" aria-label="Remove last box">−</button>':''}</div>
    <div class="preview" data-prev></div></div>`;}
function renderBuilder(){
  const tab=state.tab,t=T();
  document.querySelectorAll('#tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));
  $('intro').textContent=INTRO[tab];
  let sym='';
  if(tab==='prop'){
    sym=`<div class="cardhead"><h2>Variables</h2><label class="ctl">How many <select data-act="nvars">${range(1,8,t.vars.length)}</select></label></div>
      <div class="symgrid">${t.vars.map((v,i)=>`<div class="symrow"><input class="sl" data-act="vl" data-i="${i}" id="vl-${i}" value="${esc(v.l)}" maxlength="3" aria-label="Letter"><input class="sm" data-act="vm" data-i="${i}" id="vm-${i}" value="${esc(v.m)}" placeholder="what ${esc(v.l)} stands for" aria-label="Meaning of ${esc(v.l)}"></div>`).join('')}</div>`;
  }else if(tab==='cat'){
    sym=`<div class="cardhead"><h2>Terms</h2><label class="ctl">How many <select data-act="nterms">${range(2,4,t.terms.length)}</select></label></div>
      <div class="symgrid">${t.terms.map((v,i)=>`<div class="symrow"><input class="sl" data-act="tl" data-i="${i}" id="tl-${i}" value="${esc(v.l)}" maxlength="3" aria-label="Letter"><input class="sm" data-act="tm" data-i="${i}" id="tm-${i}" value="${esc(v.m)}" placeholder="a plural noun, e.g. dogs" aria-label="Meaning of ${esc(v.l)}"></div>`).join('')}</div>
      <label class="check"><input type="checkbox" data-act="imp" id="imp"${t.imp?' checked':''}><span>Assume every term names something that exists (the traditional Aristotelian reading). Off = modern Boolean reading.</span></label>`;
  }else{
    sym=`<div class="cardhead"><h2>Predicates</h2><label class="ctl">How many <select data-act="npred">${range(1,6,t.preds.length)}</select></label></div>
      <div class="symgrid">${t.preds.map((p,i)=>`<div class="symrow"><input class="sl" data-act="pl" data-i="${i}" id="pl-${i}" value="${esc(p.l)}" maxlength="3" aria-label="Predicate letter"><select class="sa" data-act="par" data-i="${i}" aria-label="Places">${opt(1,'1 place',p.ar==1)}${opt(2,'2 places',p.ar==2)}${opt(3,'3 places',p.ar==3)}</select><input class="sm" data-act="pm" data-i="${i}" id="pm-${i}" value="${esc(p.m)}" placeholder="${p.ar==1?'x is human':p.ar==2?'x loves y':'x gives y to z'}" aria-label="Meaning of ${esc(p.l)}"></div>`).join('')}</div>
      <div class="symsub"><h2 style="margin:0;font-family:var(--f-formula);font-size:1.2rem">Names</h2><label class="ctl">How many <select data-act="nconst">${range(0,6,t.consts.length)}</select></label></div>
      <div class="symgrid">${t.consts.map((c,i)=>`<div class="symrow"><input class="sl" data-act="cl" data-i="${i}" id="cl-${i}" value="${esc(c.l)}" maxlength="3" aria-label="Name letter"><input class="sm" data-act="cm" data-i="${i}" id="cm-${i}" value="${esc(c.m)}" placeholder="who or what ${esc(c.l)} is" aria-label="Meaning of ${esc(c.l)}"></div>`).join('')}</div>
      <p class="hint">Write predicates before their names: <code>Fa</code>, <code>Lab</code> or <code>L(a, b)</code>. Use <code>x y z</code> as variables${tab==='hol'?' and <code>X Y</code> as property variables, e.g. <code>Xa</code>':''}. Fill in meanings using x, y, z as placeholders.</p>`;
  }
  const logicSeg=tab==='cat'?'':`<div><div class="label" id="logiclbl">Logic</div><div class="seg" role="group" aria-labelledby="logiclbl">${Object.entries(LOGICS).map(([k,v])=>`<button data-act="logic" data-logic="${k}" aria-pressed="${state.logic===k}">${v}</button>`).join('')}</div></div>`;
  const keys=tab==='cat'?'':(()=>{
    const ks=['¬','∧','∨','→','↔','(',')','⊥'];if(tab!=='prop')ks.push('∀','∃');
    const letters=tab==='prop'?t.vars.map(v=>v.l):[...t.preds.map(p=>p.l),...t.consts.map(c=>c.l),'x','y','z',...(tab==='hol'?['X','Y']:[])];
    return`<div class="keys" id="keys" aria-label="Symbol keys">${ks.map(k=>`<button class="k-sym" data-k="${esc(k)}">${esc(k)}</button>`).join('')}${letters.map(k=>`<button data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div>`;})();
  const nprem=t.prem.length;
  const stmts=t.prem.map((st,i)=>stmtHTML(tab,st,'p'+i,'Premise '+(i+1))).join('')+stmtHTML(tab,t.concl,'c','Conclusion');
  $('builder').innerHTML=`
    <section class="card" aria-label="Symbols">${sym}</section>
    <section class="card" aria-label="Argument">
      <div class="cardhead"><h2>Argument</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><label class="ctl">Premises <select data-act="nprem">${range(tab==='cat'?1:0,tab==='cat'?3:5,nprem)}</select></label>
        <select data-act="preset" aria-label="Load an example">${opt('','Examples…',true)}${PRESETS[tab].map((p,i)=>opt(i,p.name,false)).join('')}</select></div></div>
      ${logicSeg}${keys}${stmts}
      <button class="go" data-act="run">Check &amp; prove</button>
    </section>`;
  updatePreviews();
}
function updatePreviews(){
  const tab=state.tab,t=T(),sym=symbols(tab);
  document.querySelectorAll('#builder .stmt').forEach(el=>{
    const id=el.dataset.st,st=id==='c'?t.concl:t.prem[+id.slice(1)],pv=el.querySelector('[data-prev]');
    if(tab==='cat'){pv.innerHTML=`<span class="pe">${esc(catEng(st,t.terms))}</span>`;return;}
    try{const f=buildStmt(st,modeOf(tab));const w=tab==='prop'?'':freeVarWarn(f);
      pv.innerHTML=`<span class="pf">${esc(str(f))}</span><span class="pe">${esc(sentence(eng(f,sym,true)))}</span>${w?`<span class="pwarn">${esc(w)}</span>`:''}`;}
    catch(e){pv.innerHTML=`<span class="perr">${esc(e.message)}</span>`;}
  });}

/* ================= running ================= */
let R=null; // current result for proof stepper
function fmtModel(M,tab,sym){
  const out=[];
  if(tab==='prop'){M.preds.forEach(([p])=>out.push(`${p} = ${M.pm[p]?'T':'F'}${sym.prop[p]?' ('+sym.prop[p]+(M.pm[p]?'':' is false')+')':''}`));return out;}
  const dom=[...Array(M.n)].map((_,i)=>i+1);
  out.push(`Domain: {${dom.join(', ')}}`);
  Object.entries(M.cm).forEach(([c,v])=>out.push(`${c} = ${v+1}${sym.cons[c]?' ('+sym.cons[c]+')':''}`));
  M.preds.forEach(([p,a])=>{const m=M.pm[p];
    if(a===0){out.push(`${p} is ${m?'true':'false'}`);return;}
    const tuples=[];for(let i=0;i<Math.pow(M.n,a);i++)if((m>>i)&1){const t=[];let x=i;for(let k=0;k<a;k++){t.push(x%M.n+1);x=Math.floor(x/M.n);}tuples.push(a===1?t[0]:'⟨'+t.join(', ')+'⟩');}
    out.push(`${p} = {${tuples.join(', ')}}${sym.pred[p]?'  ('+sym.pred[p]+')':''}`);});
  return out;}
function truthTable(prem,goal){
  const o={terms:new Set(),preds:new Map(),arity:[]};[...prem,goal].forEach(f=>names(f,null,o));
  const as=[...o.preds.keys()];if(as.length>6)return'';
  const cols=[...prem,goal];
  let rows='';
  for(let m=0;m<(1<<as.length);m++){const pm={};as.forEach((a,i)=>pm[a]=(m>>(as.length-1-i))&1);
    const M={n:1,cm:{},pm};const vals=cols.map(f=>ev(f,M,{}));const cx=vals.slice(0,-1).every(Boolean)&&!vals[vals.length-1];
    rows+=`<tr${cx?' class="cx"':''}>${as.map(a=>`<td>${pm[a]?'T':'F'}</td>`).join('')}${vals.map((v,i)=>`<td${i===0?' class="sep"':''}>${v?'T':'F'}</td>`).join('')}</tr>`;}
  return`<details class="panel"><summary>Truth table</summary><div class="tt"><table><thead><tr>${as.map(a=>`<th>${esc(a)}</th>`).join('')}${cols.map((f,i)=>`<th${i===0?' class="sep"':''}>${esc(str(f))}${i===cols.length-1?' ⊢':''}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
    <p class="legend">A highlighted row has every premise true and the conclusion false.</p></details>`;}
function vennSVG(terms,n,prem){
  if(n<2||n>3)return'<p class="legend">Venn diagrams are drawn for 2 or 3 terms.</p>';
  const r=74,C=n===2?[[125,112],[215,112]]:[[128,104],[212,104],[170,180]],W=340,H=n===2?230:285;
  const inside=(x,y,i)=>(x-C[i][0])**2+(y-C[i][1])**2<=r*r;
  const acc={};for(let x=0;x<W;x+=3)for(let y=0;y<H;y+=3){let m=0;for(let i=0;i<n;i++)if(inside(x,y,i))m|=1<<i;if(!m)continue;const a=acc[m]||(acc[m]=[0,0,0]);a[0]+=x;a[1]+=y;a[2]++;}
  const ctr={};for(const m in acc)ctr[m]=[acc[m][0]/acc[m][2],acc[m][1]/acc[m][2]];
  const shaded=new Set();
  prem.forEach(st=>{if(st.q==='A'||st.q==='E')for(let g=1;g<(1<<n);g++){const s=(g>>st.s)&1,p=(g>>st.p)&1;if(s&&(st.q==='A'?!p:p))shaded.add(g);}});
  const xs=[];let clash=false;
  prem.forEach(st=>{if(st.q==='I'||st.q==='O'){const cand=[];for(let g=1;g<(1<<n);g++){const s=(g>>st.s)&1,p=(g>>st.p)&1;if(s&&(st.q==='I'?p:!p)&&!shaded.has(g))cand.push(g);}
    if(!cand.length){clash=true;return;}xs.push([cand.reduce((a,g)=>a+ctr[g][0],0)/cand.length,cand.reduce((a,g)=>a+ctr[g][1],0)/cand.length]);}});
  const u='v'+Math.random().toString(36).slice(2,7);
  let defs=`<pattern id="${u}h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" class="hl"/></pattern>`;
  C.slice(0,n).forEach((c,i)=>defs+=`<clipPath id="${u}c${i}"><circle cx="${c[0]}" cy="${c[1]}" r="${r}"/></clipPath>`);
  let body='';
  shaded.forEach(g=>{defs+=`<mask id="${u}m${g}"><rect width="${W}" height="${H}" fill="#fff"/>${C.slice(0,n).map((c,i)=>(g>>i)&1?'':`<circle cx="${c[0]}" cy="${c[1]}" r="${r}" fill="#000"/>`).join('')}</mask>`;
    let inner=`<rect width="${W}" height="${H}" fill="url(#${u}h)"/>`;for(let i=0;i<n;i++)if((g>>i)&1)inner=`<g clip-path="url(#${u}c${i})">${inner}</g>`;
    body+=`<g mask="url(#${u}m${g})">${inner}</g>`;});
  const lab=n===2?[[C[0][0]-62,C[0][1]-r+6,'end'],[C[1][0]+62,C[1][1]-r+6,'start']]:[[C[0][0]-60,C[0][1]-r+8,'end'],[C[1][0]+60,C[1][1]-r+8,'start'],[C[2][0],C[2][1]+r+20,'middle']];
  const circles=C.slice(0,n).map(c=>`<circle class="vc" cx="${c[0]}" cy="${c[1]}" r="${r}"/>`).join('');
  const labels=lab.map((l,i)=>`<text class="vl" x="${l[0]}" y="${l[1]}" text-anchor="${l[2]}">${esc(terms[i].l)}</text>`).join('');
  const X=xs.map(([x,y])=>`<text class="vx" x="${x}" y="${y+6}" text-anchor="middle">X</text>`).join('');
  return`<svg class="venn" viewBox="0 0 ${W} ${H}" role="img" aria-label="Venn diagram of the premises"><defs>${defs}</defs>${body}${circles}${labels}${X}</svg>
    <p class="legend">${terms.slice(0,n).map(t=>`<b>${esc(t.l)}</b> = ${esc(t.m||t.l)}`).join(' · ')}<br>Hatched = empty. X = at least one thing is here; an X on a line could be on either side.${clash?' The premises contradict each other: a particular statement has nowhere left to go.':''}</p>`;}
function seqString(prem,goal){return(prem.map(str).join(', ')+(prem.length?' ':'')+'⊢ '+str(goal));}
function run(){
  const tab=state.tab,t=T(),box=$('result');R=null;
  let parts=[];
  if(tab==='cat'){
    const n=t.terms.length,letters=t.terms.map(x=>x.l);
    const res=catCheck(t.prem,t.concl,n,t.imp);
    const form=catForm(t.prem,t.concl);
    let st=res.valid?`<div class="status ok"><strong>Valid.</strong> Whenever the premises are true, the conclusion is true${t.imp?' (given that every term names something)':''}.</div>`
      :`<div class="status bad"><strong>Not valid.</strong> ${(()=>{const parts=[];for(let g=0;g<(1<<n);g++)if((res.model>>g)&1)parts.push(t.terms.map((x,i)=>((g>>i)&1?'':'not ')+(x.m||x.l)).join(', '));
        return parts.length?'Counterexample: a world containing only things that are '+parts.map(p=>'['+esc(p)+']').join(' and ')+'. The premises hold there but the conclusion fails.':'Counterexample: a world where nothing exists in any of these groups. The premises hold but the conclusion fails.';})()}</div>`;
    parts.push(st);
    let formHTML='';
    if(form){formHTML=`<p><b>Form:</b> <span class="mono">${form.code}</span>${form.name?` (${form.name})`:''}. Mood ${form.mood}, figure ${form.fig}.${form.conditional?' This form is only valid on the traditional reading, where every term names something.':''}${form.swapped?' Tip: the standard order lists the major premise (the one with the conclusion’s predicate) first.':''}</p>`;}
    parts.push(`<section class="panel"><h3>Venn diagram</h3>${vennSVG(t.terms,n,t.prem)}${formHTML}</section>`);
    const premF=t.prem.map(s=>catToFOL(s,letters));
    if(t.imp){const used=new Set();[...t.prem,t.concl].forEach(s=>{used.add(s.s);used.add(s.p);});[...used].sort().forEach(i=>premF.push(quant('ex','x',atom(letters[i],['x']))));}
    const goal=catToFOL(t.concl,letters);
    if(res.valid){const pr=proveSequent(premF,goal,'classical');if(pr.ok)R={lines:pr.lines,step:pr.lines.length,seq:seqString(premF,goal),logic:'First-order translation'};}
    else parts.push(`<p class="legend">In first-order logic this argument reads: <span class="f">${esc(seqString(premF,goal))}</span></p>`);
  }else{
    const mode=modeOf(tab);let prem,goal;
    try{prem=t.prem.map(s=>buildStmt(s,mode));goal=buildStmt(t.concl,mode);}
    catch(e){box.innerHTML=`<div class="status bad"><strong>Can’t read the argument.</strong> ${esc(e.message)}</div>`;return;}
    const o={terms:new Set(),preds:new Map(),arity:[]};[...prem,goal].forEach(f=>names(f,null,o));
    if(o.arity.length){box.innerHTML=`<div class="status bad"><strong>Mixed arguments.</strong> ${esc(o.arity[0])} is used with different numbers of names. Give each predicate a fixed number of places.</div>`;return;}
    const sym=symbols(tab);
    const sigPreds=new Map(tab==='prop'?[]:t.preds.map(p=>[p.l,+p.ar]));
    const pr=proveSequent(prem,goal,state.logic,{sigPreds,sigConsts:tab==='prop'?[]:t.consts.map(c=>c.l)});
    const mres=findModel(prem,goal,tab==='prop'?1:3);
    const L=LOGICS[state.logic].toLowerCase();
    if(pr.ok){parts.push(`<div class="status ok"><strong>Valid.</strong> Proved in ${pr.lines.length} lines with ${L} rules. Use the controls to step through it.</div>`);
      R={lines:pr.lines,step:pr.lines.length,seq:seqString(prem,goal),logic:LOGICS[state.logic]+' logic'};}
    else if(mres.model){parts.push(`<div class="status bad"><strong>Not valid.</strong> Here is a ${tab==='prop'?'row of the truth table':'small world'} where every premise is true and the conclusion is false:</div>
      <section class="panel"><h3>Counterexample</h3><div class="model">${fmtModel(mres.model,tab,sym).map(l=>`<span>${esc(l)}</span>`).join('')}</div></section>`);}
    else if(state.logic!=='classical'&&proveSequent(prem,goal,'classical',{sigPreds}).ok){
      parts.push(`<div class="status bad"><strong>No ${L} proof found.</strong> The argument is classically valid, but it seems to need ${state.logic==='minimal'?'ex falso or indirect proof':'indirect proof'}. Try ${state.logic==='minimal'?'Intuitionistic or Classical':'Classical'}.</div>`);}
    else parts.push(`<div class="status bad"><strong>No proof found.</strong> No counterexample turned up with up to ${mres.searched||1} object${mres.searched>1?'s':''} either. ${tab==='prop'?'':'First-order validity can’t always be settled automatically, so it may need a longer proof or a larger counterexample.'}${tab==='hol'?' In HOL, property variables are only filled in with your defined predicates, not with complex formulas.':''}</div>`);
    if(tab==='prop')parts.push(truthTable(prem,goal));
  }
  const sheet=R?`<section class="sheet" aria-label="Proof"><div class="sheethead"><span class="seqshow">${esc(R.seq)}</span><span class="label">${esc(R.logic)}</span></div>
    <div class="scroller"><div class="proof" id="proofrows"></div></div>
    <div class="controls"><button data-act="first">Start</button><button data-act="prev">◀ Back</button><button data-act="next">Next ▶</button><button data-act="all">Show all</button>
      <input type="range" data-act="slider" id="slider" min="1" max="${R.lines.length}" value="${R.step}" aria-label="Proof step"><span class="counter" id="counter"></span></div>
    <div class="explain" id="explain"></div></section>`:'';
  box.innerHTML=parts.join('')+sheet;
  if(R)renderProof();
}

/* ================= proof stepper ================= */
const F=f=>`<span class="f">${esc(str(f))}</span>`;
const ruleLabel=r=>r==='X'?'⊥E':r;
const refText=refs=>refs.map(r=>Array.isArray(r)?(r[0]===r[1]?r[0]:r[0]+'–'+r[1]):r).join(', ');
function explain(L,lines){
  const at=n=>lines[n-1].f,ln=n=>`line ${n}`,rng=r=>r[0]===r[1]?`line ${r[0]}`:`lines ${r[0]}–${r[1]}`,R=L.refs;
  switch(L.rule){
    case'Premise':return`A premise. We may use ${F(L.f)} from the start.`;
    case'Assumption':{const T=L.target;switch(L.purpose){
      case'imp':return`Open a subproof by assuming ${F(L.f)}. If ${F(T)} follows inside it, →I gives the conditional.`;
      case'not':return`Assume ${F(L.f)} and aim for a contradiction (⊥). Reaching ⊥ lets ¬I conclude ${F(mk('not',L.f))}.`;
      case'iff1':return`First half of ↔I: assume ${F(L.f)} and show ${F(T)}.`;
      case'iff2':return`Second half of ↔I: assume ${F(L.f)} and show ${F(T)}.`;
      case'case1':return`∨E, first case: suppose the left side of ${F(at(L.disj))} (${ln(L.disj)}), ${F(L.f)}, and show ${F(T)}.`;
      case'case2':return`∨E, second case: suppose the right side, ${F(L.f)}, and show ${F(T)} again.`;
      case'ip':return`Indirect proof: assume the opposite of what we want, ${F(L.f)}. If that leads to ⊥, IP gives ${F(L.f.a)}.`;
      case'exE':return`∃E: ${F(at(L.exline))} (${ln(L.exline)}) says something fits. Call it ${esc(L.fresh)}, a name used nowhere else, and assume ${F(L.f)}. Now show ${F(T)}.`;
    }return'Assumption.';}
    case'∧E':return`∧ elimination. ${F(at(R[0]))} (${ln(R[0])}) is a conjunction, so its part ${F(L.f)} holds on its own.`;
    case'∧I':return`∧ introduction. We have ${F(at(R[0]))} (${ln(R[0])}) and ${F(at(R[1]))} (${ln(R[1])}), so we have both together.`;
    case'∨I':return`∨ introduction. ${F(at(R[0]))} holds (${ln(R[0])}), so any disjunction with it as one side holds too.`;
    case'∨E':return`∨ elimination. From ${F(at(R[0]))} (${ln(R[0])}), both cases (${rng(R[1])} and ${rng(R[2])}) reach ${F(L.f)}, so it holds either way.`;
    case'→I':return`→ introduction. Assuming ${F(at(R[0][0]))} led to ${F(at(R[0][1]))} (${rng(R[0])}), so we close the subproof and conclude ${F(L.f)}.`;
    case'→E':return`→ elimination (modus ponens). ${F(at(R[0]))} (${ln(R[0])}) and its antecedent ${F(at(R[1]))} (${ln(R[1])}) give ${F(L.f)}.`;
    case'↔I':return`↔ introduction. Each side was derived from the other (${rng(R[0])} and ${rng(R[1])}).`;
    case'↔E':return`↔ elimination. ${F(at(R[0]))} (${ln(R[0])}) and one side, ${F(at(R[1]))} (${ln(R[1])}), give the other side.`;
    case'¬I':return`¬ introduction. Assuming ${F(at(R[0][0]))} produced ⊥ (${rng(R[0])}), so the assumption must be false.`;
    case'¬E':return`¬ elimination. ${F(at(R[0]))} (${ln(R[0])}) and ${F(at(R[1]))} (${ln(R[1])}) contradict each other, which gives ⊥.`;
    case'X':return`Ex falso (⊥E). ⊥ on ${ln(R[0])} lets us infer anything, here ${F(L.f)}. Minimal logic lacks this rule.`;
    case'IP':return`Indirect proof. Assuming ${F(at(R[0][0]))} led to ⊥ (${rng(R[0])}), so ${F(L.f)}. This rule is what makes the logic classical.`;
    case'R':return`Reiteration. Copy ${F(L.f)} from ${ln(R[0])} so this subproof can end on it.`;
    case'∀E':return`∀ elimination. ${F(at(R[0]))} (${ln(R[0])}) holds for every ${isPV(at(R[0]).v)?'property':'thing'}, so in particular for ${esc(L.term)}: ${F(L.f)}.`;
    case'∀I':return`∀ introduction. ${esc(L.fresh)} is a brand-new name that appears in no premise or open assumption, so proving ${F(at(R[0]))} (${ln(R[0])}) about it shows the claim holds for anything.`;
    case'∃I':return`∃ introduction. ${F(at(R[0]))} (${ln(R[0])}) gives a witness, ${esc(L.term)}, so ${F(L.f)}.`;
    case'∃E':return`∃ elimination. From ${F(at(R[0]))} we named an arbitrary witness ${esc(L.fresh)} (${rng(R[1])}) and reached ${F(L.f)}, which doesn’t mention ${esc(L.fresh)}. So it holds outright and the subproof closes.`;
  }return'';}
function renderProof(){
  if(!R)return;const lines=R.lines,n=lines.length,step=R.step,cur=lines[step-1];
  const refset=new Set();cur.refs.forEach(r=>{if(Array.isArray(r)){for(let k=r[0];k<=r[1];k++)refset.add(k);}else refset.add(r);});
  const lastPrem=lines.reduce((m,L,i)=>L.rule==='Premise'?i:m,-1);
  $('proofrows').innerHTML=lines.slice(0,step).map((L,i)=>{
    const line=L.rule==='Assumption'||i===lastPrem;
    const cls='row'+(i===step-1?' cur':refset.has(i+1)?' isref':'');
    const just=L.rule==='Premise'?'Premise':L.rule==='Assumption'?'Assumption':ruleLabel(L.rule)+' '+refText(L.refs);
    const flag=L.rule==='Assumption'&&L.fresh?`<span class="flag">${esc(L.fresh)}</span>`:'';
    return`<div class="${cls}"><span class="num">${i+1}</span><div class="fcell">${'<span class="bar"></span>'.repeat(L.depth+1)}<span class="ftxt${line?' line':''}"><span>${flag}${esc(str(L.f))}</span></span></div><span class="just">${esc(just)}</span></div>`;}).join('');
  const sl=$('slider');sl.max=n;sl.value=step;
  $('counter').textContent=`line ${step} of ${n}`;
  const q=a=>document.querySelector(`#result [data-act="${a}"]`);
  q('first').disabled=q('prev').disabled=step<=1;q('next').disabled=q('all').disabled=step>=n;
  const title=cur.rule==='Premise'?'Premise':cur.rule==='Assumption'?'Assumption':ruleLabel(cur.rule);
  $('explain').innerHTML=`<div class="label">Line ${step}</div><h4>${esc(title)}</h4><p>${explain(cur,lines)}</p>`;}

/* ================= events ================= */
let lastBox=null;
function stmtOf(el){const s=el.closest('.stmt');if(!s)return null;const id=s.dataset.st;return id==='c'?T().concl:T().prem[+id.slice(1)];}
function newStmt(){const t=T();if(state.tab==='cat')return{q:'A',s:0,p:1};const first=state.tab==='prop'?t.vars[0].l:(t.preds[0].l+'x');return S([first]);}
function resize(arr,n,make){while(arr.length<n)arr.push(make(arr.length));arr.length=n;}
function unusedLetter(list,used){return list.find(l=>!used.includes(l))||list[0];}
$('tabs')&&$('tabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.tab=b.dataset.tab;save();renderBuilder();run();});
$('builder').addEventListener('focusin',e=>{if(e.target.classList.contains('box'))lastBox=e.target;});
$('builder').addEventListener('input',e=>{
  const el=e.target,act=el.dataset.act,t=T(),i=+el.dataset.i;if(!act)return;
  if(act==='box'){stmtOf(el).boxes[+el.dataset.b].text=el.value;}
  else if(act==='vl')t.vars[i].l=el.value.trim();else if(act==='vm')t.vars[i].m=el.value;
  else if(act==='tl')t.terms[i].l=el.value.trim();else if(act==='tm')t.terms[i].m=el.value;
  else if(act==='pl')t.preds[i].l=el.value.trim();else if(act==='pm')t.preds[i].m=el.value;
  else if(act==='cl')t.consts[i].l=el.value.trim();else if(act==='cm')t.consts[i].m=el.value;
  else return;
  save();updatePreviews();});
$('builder').addEventListener('change',e=>{
  const el=e.target,act=el.dataset.act,t=T(),v=el.value;if(!act)return;
  const st=stmtOf(el);let rerender=true;
  switch(act){
    case'nvars':resize(t.vars,+v,()=>({l:unusedLetter(DEF_PROP,t.vars.map(x=>x.l)),m:''}));break;
    case'nterms':resize(t.terms,+v,()=>({l:unusedLetter(DEF_TERM,t.terms.map(x=>x.l)),m:''}));
      [...t.prem,t.concl].forEach(s=>{if(s.s>=+v)s.s=0;if(s.p>=+v)s.p=Math.min(1,+v-1);});break;
    case'npred':resize(t.preds,+v,()=>({l:unusedLetter(DEF_PRED,t.preds.map(x=>x.l)),ar:1,m:''}));break;
    case'nconst':resize(t.consts,+v,()=>({l:unusedLetter(DEF_CONST,t.consts.map(x=>x.l)),m:''}));break;
    case'par':t.preds[+el.dataset.i].ar=+v;break;
    case'imp':t.imp=el.checked;rerender=false;break;
    case'nprem':resize(t.prem,+v,newStmt);break;
    case'preset':if(v==='')return;state[state.tab]=fromPreset(state.tab,PRESETS[state.tab][+v]);save();renderBuilder();run();return;
    case'sneg':st.neg=!!v;rerender=false;break;
    case'bneg':st.boxes[+el.dataset.b].neg=!!v;rerender=false;break;
    case'op':st.ops[+el.dataset.b]=v;rerender=false;break;
    case'qs':st.quants[+el.dataset.q]=v;rerender=false;break;
    case'cq':st.q=v;break;case'cs':st.s=+v;rerender=false;break;case'cp':st.p=+v;rerender=false;break;
    default:return;}
  save();if(rerender)renderBuilder();else updatePreviews();});
$('builder').addEventListener('pointerdown',e=>{if(e.target.closest('#keys button'))e.preventDefault();});
$('builder').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.k!=null){const inp=lastBox&&document.body.contains(lastBox)?lastBox:document.querySelector('#builder .box');if(!inp)return;
    const s=inp.selectionStart??inp.value.length,t2=inp.selectionEnd??s,k=b.dataset.k;
    inp.value=inp.value.slice(0,s)+k+inp.value.slice(t2);inp.setSelectionRange(s+k.length,s+k.length);lastBox=inp;
    inp.dispatchEvent(new Event('input',{bubbles:true}));return;}
  const act=b.dataset.act,st=stmtOf(b);
  switch(act){
    case'logic':state.logic=b.dataset.logic;save();renderBuilder();run();return;
    case'run':run();$('result').scrollIntoView({behavior:'smooth',block:'start'});return;
    case'badd':st.boxes.push({text:'',neg:false});st.ops.push('and');break;
    case'brm':st.boxes.pop();st.ops.length=Math.max(0,st.boxes.length-1);break;
    case'qadd':st.quants.push(state.tab==='hol'&&st.quants.length===0?'∀X':['∀x','∃y','∀z'][st.quants.length%3]);break;
    case'qrm':st.quants.pop();break;
    default:return;}
  save();renderBuilder();
});
$('result').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!R)return;
  const a=b.dataset.act;if(a==='first')R.step=1;else if(a==='prev'&&R.step>1)R.step--;else if(a==='next'&&R.step<R.lines.length)R.step++;else if(a==='all')R.step=R.lines.length;else return;renderProof();});
$('result').addEventListener('input',e=>{if(e.target.dataset.act==='slider'&&R){R.step=+e.target.value;renderProof();}});
document.addEventListener('keydown',e=>{if(!R||(e.target.tagName==='INPUT'&&e.target.type!=='range')||e.target.tagName==='SELECT')return;
  if(e.key==='ArrowRight'&&R.step<R.lines.length){R.step++;renderProof();}if(e.key==='ArrowLeft'&&R.step>1){R.step--;renderProof();}});
renderBuilder();run();

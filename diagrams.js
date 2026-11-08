/* mAEIOw Diagrams: one syllogism, five ways of seeing it. Standalone (no engine file needed). */
(function(){
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const INK='fill:var(--ink)',MUTED='fill:var(--muted)',FM='font-family:var(--f-formula)',BODY='font-family:var(--f-body)';
const svgOpen=(w,h,label)=>`<svg class="dg" viewBox="0 0 ${w} ${h}" width="${w}" role="img" aria-label="${esc(label)}">`;
const txt=(x,y,s,o={})=>`<text x="${x}" y="${y}" text-anchor="${o.a||'middle'}" dominant-baseline="central" style="${o.st||INK};${o.f||FM};font-size:${o.size||18}px${o.w?';font-weight:'+o.w:''}">${esc(s)}</text>`;
const line=(x1,y1,x2,y2,st='stroke:var(--ink)',w=2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="${st};stroke-width:${w};stroke-linecap:round"/>`;

/* ---------- state ---------- */
let MOOD='AAA',FIG=1,IMP=0,VIEW='venn',NAMES={S:'',M:'',P:''},SQ=null;
try{const s=JSON.parse(localStorage.getItem('maeiow-diagrams')||'null');if(s){MOOD=s.MOOD||MOOD;FIG=s.FIG||FIG;IMP=s.IMP||0;VIEW=s.VIEW||VIEW;NAMES=Object.assign(NAMES,s.NAMES||{});}}catch(e){}
{const q=new URLSearchParams(location.search);if(/^[AEIO]{3}$/.test(q.get('m')||''))MOOD=q.get('m');if(/^[1-4]$/.test(q.get('fig')||''))FIG=+q.get('fig');if(q.get('imp')!=null)IMP=+q.get('imp')?1:0;if(q.get('v'))VIEW=q.get('v');}
const save=()=>{try{localStorage.setItem('maeiow-diagrams',JSON.stringify({MOOD,FIG,IMP,VIEW,NAMES}));}catch(e){}};

/* ---------- logic ---------- */
const FIGS={1:[['M','P'],['S','M']],2:[['P','M'],['S','M']],3:[['M','P'],['M','S']],4:[['P','M'],['M','S']]};
const TERMS=['S','M','P'];
const NAMES_VALID={'1AAA':'Barbara','1EAE':'Celarent','1AII':'Darii','1EIO':'Ferio','1AAI':'Barbari','1EAO':'Celaront',
 '2EAE':'Cesare','2AEE':'Camestres','2EIO':'Festino','2AOO':'Baroco','2EAO':'Cesaro','2AEO':'Camestros',
 '3AAI':'Darapti','3IAI':'Disamis','3AII':'Datisi','3EAO':'Felapton','3OAO':'Bocardo','3EIO':'Ferison',
 '4AAI':'Bramantip','4AEE':'Camenes','4IAI':'Dimaris','4EAO':'Fesapo','4EIO':'Fresison','4AEO':'Camenop'};
function syl(mood,fig){const f=FIGS[fig];return[{q:mood[0],s:f[0][0],p:f[0][1]},{q:mood[1],s:f[1][0],p:f[1][1]},{q:mood[2],s:'S',p:'P'}];}
// region r: bit 0 = in S, bit 1 = in M, bit 2 = in P
const inT=(r,t)=>!!((r>>TERMS.indexOf(t))&1);
function holds(st,model){let any=false;for(let r=0;r<8;r++){if(!((model>>r)&1))continue;const s=inT(r,st.s),p=inT(r,st.p);
  if(st.q==='A'&&s&&!p)return false;if(st.q==='E'&&s&&p)return false;if(st.q==='I'&&s&&p)any=true;if(st.q==='O'&&s&&!p)any=true;}
  return st.q==='A'||st.q==='E'?true:any;}
const nonEmpty=(model,t)=>{for(let r=0;r<8;r++)if((model>>r)&1&&inT(r,t))return true;return false;};
const pc=m=>{let c=0;while(m){c+=m&1;m>>=1;}return c;};
const MODELS=[...Array(256).keys()].sort((a,b)=>pc(a)-pc(b));
function check(st3,imp){
  for(const m of MODELS){if(imp&&!TERMS.every(t=>nonEmpty(m,t)))continue;
    if(holds(st3[0],m)&&holds(st3[1],m)&&!holds(st3[2],m))return{valid:false,model:m};}
  return{valid:true};}
const nm=t=>NAMES[t]?NAMES[t]:t;
function eng(st){const S=nm(st.s),P=nm(st.p);return{A:`All ${S} are ${P}`,E:`No ${S} are ${P}`,I:`Some ${S} are ${P}`,O:`Some ${S} are not ${P}`}[st.q];}
function regionWords(r){return TERMS.map(t=>(inT(r,t)?'':'not ')+nm(t)).join(', ');}

/* ---------- shared Venn geometry ---------- */
const VC={S:{x:140,y:118,r:78},P:{x:220,y:118,r:78},M:{x:180,y:186,r:78}};
const inC=(x,y,c)=>(x-c.x)**2+(y-c.y)**2<c.r*c.r;
const CENT=(()=>{const acc={};for(let x=60;x<300;x+=4)for(let y=36;y<266;y+=4){let r=0;TERMS.forEach((t,i)=>{if(inC(x,y,VC[t]))r|=1<<i;});if(!r)continue;(acc[r]=acc[r]||[0,0,0]);acc[r][0]+=x;acc[r][1]+=y;acc[r][2]++;}
  const o={};Object.entries(acc).forEach(([r,[a,b,c]])=>o[r]={x:a/c,y:b/c});return o;})();
const regionsOf=(t1,want1,t2,want2)=>[...Array(8).keys()].filter(r=>inT(r,t1)===want1&&inT(r,t2)===want2);
function marks(st3,imp){
  // which regions are shaded (empty) and where Xs go
  const shaded=new Set(),xs=[];
  st3.slice(0,2).forEach(st=>{if(st.q==='A')regionsOf(st.s,true,st.p,false).forEach(r=>shaded.add(r));if(st.q==='E')regionsOf(st.s,true,st.p,true).forEach(r=>shaded.add(r));});
  const place=(cands,kind)=>{const live=cands.filter(r=>!shaded.has(r));if(!live.length)return;xs.push({regions:live,kind});};
  st3.slice(0,2).forEach(st=>{if(st.q==='I')place(regionsOf(st.s,true,st.p,true),'x');if(st.q==='O')place(regionsOf(st.s,true,st.p,false),'x');});
  if(imp)TERMS.forEach(t=>{const live=[...Array(8).keys()].filter(r=>r&&inT(r,t)&&!shaded.has(r));
    if(xs.some(x=>x.regions.every(r=>inT(r,t))))return;
    if(live.length===1||live.length===2)xs.push({regions:live,kind:'import'});});
  return{shaded,xs};
}
function xPos(regs){
  if(regs.length===1)return CENT[regs[0]];
  if(regs.length===2){const a=CENT[regs[0]],b=CENT[regs[1]];const diff=regs[0]^regs[1];const t=TERMS[Math.log2(diff)];const c=VC[t];
    const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,d=Math.hypot(mx-c.x,my-c.y)||1;return{x:c.x+(mx-c.x)*c.r/d,y:c.y+(my-c.y)*c.r/d,onLine:true};}
  const p=regs.map(r=>CENT[r]);return{x:p.reduce((s,q)=>s+q.x,0)/p.length,y:p.reduce((s,q)=>s+q.y,0)/p.length,onLine:true};
}

/* ---------- views ---------- */
function verdictHTML(st3){
  const c=check(st3,IMP),name=NAMES_VALID[FIG+MOOD];
  const valid=c.valid;
  let h=`<p class="verdict ${valid?'ok':'bad'}"><strong>${valid?'Valid':'Invalid'}</strong> ${valid?'':'— '}${IMP?'with':'without'} existential import.${name?` This is <em>${esc(name)}</em>.`:''}</p>`;
  if(!valid){const occ=[...Array(8).keys()].filter(r=>(c.model>>r)&1);
    h+=`<p class="dnote">Counterexample: both premises are true but the conclusion is false when the only things that exist are ${occ.length?occ.map(r=>'<em>'+esc(regionWords(r))+'</em>').join('; and '):'none at all'}.</p>`;}
  if(!valid&&!IMP&&check(st3,1).valid)h+=`<p class="dnote">It becomes valid if you assume every term names something (turn on existential import).</p>`;
  return h;
}
function venn(st3){
  const {shaded,xs}=marks(st3,IMP);
  const W=360,H=290;
  let s=svgOpen(W,H,'Venn diagram of the syllogism')+'<defs>'+TERMS.map(t=>`<clipPath id="mc${t}"><circle cx="${VC[t].x}" cy="${VC[t].y}" r="${VC[t].r}"/></clipPath>`).join('');
  [...Array(8).keys()].forEach(r=>{const out=TERMS.filter((t,i)=>!((r>>i)&1));s+=`<mask id="mm${r}"><rect width="${W}" height="${H}" style="fill:#fff"/>${out.map(t=>`<circle cx="${VC[t].x}" cy="${VC[t].y}" r="${VC[t].r}" style="fill:#000"/>`).join('')}</mask>`;});
  s+='</defs>'+`<rect x="10" y="10" width="${W-20}" height="${H-20}" style="fill:var(--paper);stroke:var(--ink);stroke-width:2"/>`;
  shaded.forEach(r=>{if(!r)return;let el=`<rect width="${W}" height="${H}" mask="url(#mm${r})" style="fill:var(--shade)"/>`;TERMS.forEach((t,i)=>{if((r>>i)&1)el=`<g clip-path="url(#mc${t})">${el}</g>`;});s+=el;});
  TERMS.forEach(t=>{s+=`<circle cx="${VC[t].x}" cy="${VC[t].y}" r="${VC[t].r}" style="fill:none;stroke:var(--ink);stroke-width:2"/>`;});
  xs.forEach(x=>{const p=xPos(x.regions);s+=txt(p.x,p.y,'✕',{size:x.kind==='import'?16:20,w:700,f:BODY,st:x.kind==='import'?'fill:var(--accent)':INK});});
  s+=txt(56,36,nm('S'),{a:'start',size:17,st:INK+';font-style:italic'})+txt(304,36,nm('P'),{a:'end',size:17,st:INK+';font-style:italic'})+txt(180,278,nm('M'),{size:17,st:INK+';font-style:italic'});
  s+='</svg>';
  return{title:'Venn diagram',lead:'Draw only the premises. Shading means “nothing here” (from A and E); ✕ means “something here” (from I and O). An ✕ on a line means it could be on either side. Then check whether the conclusion is already drawn.',
    body:`<div class="dgwrap">${s}</div>${IMP?'<p class="dnote">Green ✕ marks what existential import adds: each term names at least one thing.</p>':''}`};
}
function carroll(st3){
  const {shaded,xs}=marks(st3,IMP);
  const W=340,H=330,o={x:30,y:30,s:260},inn={x:95,y:95,s:130};
  // cell centres: S left / not-S right, P top / not-P bottom, M inner square
  const cell=r=>{const S=inT(r,'S'),P=inT(r,'P'),M=inT(r,'M');
    const ix=S?inn.x+inn.s/4:inn.x+inn.s*3/4,iy=P?inn.y+inn.s/4:inn.y+inn.s*3/4;
    if(M)return{x:ix,y:iy};return{x:S?o.x+28:o.x+o.s-28,y:P?o.y+28:o.y+o.s-28};};
  let s=svgOpen(W,H,'Lewis Carroll’s diagram')+`<rect x="${o.x}" y="${o.y}" width="${o.s}" height="${o.s}" style="fill:var(--paper);stroke:var(--ink);stroke-width:2"/>`+
    line(o.x+o.s/2,o.y,o.x+o.s/2,o.y+o.s)+line(o.x,o.y+o.s/2,o.x+o.s,o.y+o.s/2)+
    `<rect x="${inn.x}" y="${inn.y}" width="${inn.s}" height="${inn.s}" style="fill:none;stroke:var(--ink);stroke-width:2"/>`;
  s+=txt(o.x+o.s/4,o.y-14,nm('S'),{size:15,st:INK+';font-style:italic'})+txt(o.x+o.s*3/4,o.y-14,'not '+nm('S'),{size:15,st:INK+';font-style:italic'});
  s+=`<text x="${o.x-12}" y="${o.y+o.s/4}" transform="rotate(-90 ${o.x-12} ${o.y+o.s/4})" text-anchor="middle" dominant-baseline="central" style="${INK};${FM};font-size:15px;font-style:italic">${esc(nm('P'))}</text>`;
  s+=`<text x="${o.x-12}" y="${o.y+o.s*3/4}" transform="rotate(-90 ${o.x-12} ${o.y+o.s*3/4})" text-anchor="middle" dominant-baseline="central" style="${INK};${FM};font-size:15px;font-style:italic">not ${esc(nm('P'))}</text>`;
  s+=txt(o.x+o.s/2,o.y+o.s+16,'inner square: '+nm('M'),{size:12,f:BODY,st:MUTED});
  const counter=(p,kind)=>`<circle cx="${p.x}" cy="${p.y}" r="11" style="fill:${kind==='0'?'var(--shade)':kind==='import'?'var(--accent)':'#C8462F'};stroke:var(--ink);stroke-width:1.5"/>`+txt(p.x,p.y,kind==='0'?'0':'1',{size:12,w:700,f:BODY,st:kind==='0'?INK:'fill:#fff'});
  shaded.forEach(r=>{s+=counter(cell(r),'0');});
  xs.forEach(x=>{let p;if(x.regions.length===1)p=cell(x.regions[0]);else{const [r1,r2]=x.regions,a=cell(r1),b=cell(r2);
      if((r1^r2)===2){const ins=inT(r1,'M')?r1:r2;p={x:inT(ins,'S')?inn.x:inn.x+inn.s,y:cell(ins).y};}
      else p={x:(a.x+b.x)/2,y:(a.y+b.y)/2};}
    s+=counter(p,x.kind==='import'?'import':'1');});
  s+='</svg>';
  return{title:'Lewis Carroll’s diagram (The Game of Logic, 1886)',lead:'Carroll split a square into S / not-S and P / not-P, with an inner square for M, so every one of the eight classes is a cell. A grey 0 counter means the cell is empty; a red 1 counter means something is there. A counter on a line could be in either cell.',body:`<div class="dgwrap">${s}</div>`};
}
const GERG=[['identity','S and P coincide'],['sub','S inside P'],['sup','P inside S'],['overlap','S and P overlap'],['disjoint','S and P apart']];
const FITS={A:['identity','sub'],E:['disjoint'],I:['identity','sub','sup','overlap'],O:['sup','overlap','disjoint']};
function miniEuler(rel,on,sName,pName){
  const W=96,H=70;let s=`<svg class="mini${on?' on':''}" viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="${esc(rel)}">`;
  const st=`fill:none;stroke:${on?'var(--accent)':'var(--rule)'};stroke-width:2`;
  const C=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" style="${st}"/>`;
  const L=(x,y,t)=>txt(x,y,t,{size:17,st:(on?INK:MUTED)+';font-style:italic',f:FM});
  if(rel==='identity')s+=C(48,35,24)+C(48,35,27)+L(48,35,sName+' = '+pName);
  if(rel==='sub')s+=C(48,35,28)+C(40,38,13)+L(40,38,sName)+L(66,22,pName);
  if(rel==='sup')s+=C(48,35,28)+C(40,38,13)+L(40,38,pName)+L(66,22,sName);
  if(rel==='overlap')s+=C(36,35,22)+C(60,35,22)+L(28,35,sName)+L(68,35,pName);
  if(rel==='disjoint')s+=C(25,35,19)+C(71,35,19)+L(25,35,sName)+L(71,35,pName);
  return s+'</svg>';
}
function euler(st3){
  const ab=t=>t;
  const rows=st3.map((st,i)=>`<div class="erow"><p class="elabel"><span class="lbl">${['Major premise','Minor premise','Conclusion'][i]}</span> ${esc(eng(st))} <span class="fm">(${st.q})</span></p><div class="eset">${GERG.map(([k,d])=>`<figure>${miniEuler(k,FITS[st.q].includes(k),ab(st.s),ab(st.p))}<figcaption>${esc(d.replace('S',st.s).replace('P',st.p))}</figcaption></figure>`).join('')}</div></div>`).join('');
  return{title:'Euler diagrams (Gergonne’s five relations)',lead:'Two non-empty classes can relate in only five ways. Each statement rules some out; the coloured ones are the situations the statement allows. (Euler diagrams assume each class has members.)',body:rows};
}
const SQRULE={trad:{A:{t:{E:'F',I:'T',O:'F'},f:{O:'T',E:'?',I:'?'}},E:{t:{A:'F',I:'F',O:'T'},f:{I:'T',A:'?',O:'?'}},I:{t:{E:'F',A:'?',O:'?'},f:{E:'T',A:'F',O:'T'}},O:{t:{A:'F',E:'?',I:'?'},f:{A:'T',I:'T',E:'F'}}},
 modern:{A:{t:{O:'F',E:'?',I:'?'},f:{O:'T',E:'?',I:'?'}},E:{t:{I:'F',A:'?',O:'?'},f:{I:'T',A:'?',O:'?'}},I:{t:{E:'F',A:'?',O:'?'},f:{E:'T',A:'?',O:'?'}},O:{t:{A:'F',E:'?',I:'?'},f:{A:'T',E:'?',I:'?'}}}};
function square(st3){
  const c=st3[2];const sel=SQ||c.q;
  const W=360,H=330,P={A:{x:70,y:70},E:{x:290,y:70},I:{x:70,y:250},O:{x:290,y:250}};
  const trad=!!IMP,dim='stroke:var(--rule)',on='stroke:var(--ink)';
  let s=svgOpen(W,H,'Square of opposition');
  s+=line(P.A.x+30,P.A.y,P.E.x-30,P.E.y,trad?on:dim+';stroke-dasharray:5 5')+txt(180,P.A.y-12,'contraries',{size:12,f:BODY,st:trad?INK:MUTED});
  s+=line(P.I.x+30,P.I.y,P.O.x-30,P.O.y,trad?on:dim+';stroke-dasharray:5 5')+txt(180,P.I.y+16,'subcontraries',{size:12,f:BODY,st:trad?INK:MUTED});
  s+=line(P.A.x+22,P.A.y+22,P.O.x-22,P.O.y-22,on)+line(P.E.x-22,P.E.y+22,P.I.x+22,P.I.y-22,on)+`<rect x="135" y="182" width="90" height="18" rx="4" style="fill:var(--paper)"/>`+txt(180,191,'contradictories',{size:12,f:BODY,st:INK});
  s+=line(P.A.x,P.A.y+26,P.I.x,P.I.y-26,trad?on:dim+';stroke-dasharray:5 5')+line(P.E.x,P.E.y+26,P.O.x,P.O.y-26,trad?on:dim+';stroke-dasharray:5 5');
  s+=`<text x="${P.A.x-12}" y="160" transform="rotate(-90 ${P.A.x-12} 160)" text-anchor="middle" style="${trad?INK:MUTED};${BODY};font-size:12px">subalterns</text>`;
  s+=`<text x="${P.E.x+12}" y="160" transform="rotate(90 ${P.E.x+12} 160)" text-anchor="middle" style="${trad?INK:MUTED};${BODY};font-size:12px">subalterns</text>`;
  Object.entries(P).forEach(([k,p])=>{const isSel=k===sel;s+=`<g class="sqc" data-q="${k}" role="button" tabindex="0" aria-label="${k}"><circle cx="${p.x}" cy="${p.y}" r="24" style="fill:${isSel?'var(--accent)':'var(--paper)'};stroke:var(--accent);stroke-width:2"/>`+txt(p.x,p.y,k,{size:20,w:700,f:BODY,st:isSel?'fill:var(--accent-ink)':INK})+'</g>';
    const st={q:k,s:c.s,p:c.p};s+=txt(p.x,p.y+(p.y<150?-40:42),eng(st),{size:12,f:BODY,st:MUTED});});
  s+='</svg>';
  const R=SQRULE[trad?'trad':'modern'][sel];const st=q=>eng({q,s:c.s,p:c.p});
  const tv=v=>v==='T'?'<span class="tvT">true</span>':v==='F'?'<span class="tvF">false</span>':'<span class="tvU">can’t tell</span>';
  const tbl=`<p class="dnote">Selected: <strong>${sel}: ${esc(st(sel))}</strong></p><table class="sqt"><thead><tr><th></th><th>If true</th><th>If false</th></tr></thead><tbody>${['A','E','I','O'].filter(k=>k!==sel).map(k=>`<tr><th>${k}: ${esc(st(k))}</th><td>${tv(R.t[k])}</td><td>${tv(R.f[k])}</td></tr>`).join('')}</tbody></table>`;
  return{title:'Square of opposition',lead:`Tap a corner to see what follows if it’s true or false. ${trad?'With existential import, all four relations hold (the traditional square).':'Without existential import only the diagonals (contradictories) survive; the dashed relations fail when there are no '+nm(c.s)+'.'}`,body:`<div class="dgwrap" id="sq">${s}</div><div class="tt">${tbl}</div>`};
}
function moods(){
  let h='';
  for(let f=1;f<=4;f++){const vals=[];
    for(const a of 'AEIO')for(const b of 'AEIO')for(const c of 'AEIO'){const m=a+b+c,st=syl(m,f);const v0=check(st,0).valid,v1=v0||check(st,1).valid;if(v1)vals.push([m,v0]);}
    h+=`<div class="mfig"><p class="elabel"><span class="lbl">Figure ${f}</span> ${FIGS[f].map(([x,y])=>x+'–'+y).join(', ')}</p><div class="mchips">${vals.map(([m,v0])=>`<button type="button" class="mchip${v0?'':' cond'}${f===FIG&&m===MOOD?' on':''}" data-m="${m}" data-f="${f}">${m}-${f}<small>${esc(NAMES_VALID[f+m]||'')}</small></button>`).join('')}</div></div>`;}
  return{title:'All valid moods',lead:'Of the 256 possible mood-and-figure combinations, these are the valid ones. Solid chips are valid in modern logic; dashed chips need existential import. Tap one to load it.',body:h+'<p class="dnote">15 are valid outright and 9 more need existential import: 24 in all, matching the medieval list.</p>'};
}
const VIEWS={venn,carroll,euler,square,moods};

/* ---------- rendering ---------- */
function render(){
  ['m1','m2','m3'].forEach((id,i)=>$(id).value=MOOD[i]);$('fig').value=FIG;$('imp').checked=!!IMP;
  ['S','M','P'].forEach(t=>{if(document.activeElement!==$('n'+t))$('n'+t).value=NAMES[t];});
  document.querySelectorAll('#dtabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.v===VIEW)));
  const st3=syl(MOOD,FIG);
  $('argshow').innerHTML=st3.map((st,i)=>`<li${i===2?' class="concl"':''}>${i===2?'<span class="lbl">So</span> ':''}${esc(eng(st))}</li>`).join('');
  $('verdict').innerHTML=verdictHTML(st3);
  const r=(VIEWS[VIEW]||venn)(st3);
  $('view').innerHTML=`<h2>${esc(r.title)}</h2>${r.lead?`<p class="lead">${esc(r.lead)}</p>`:''}${r.body}`;
  document.querySelectorAll('.sqc').forEach(g=>{const go=()=>{SQ=g.dataset.q;render();};g.addEventListener('click',go);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});});
  document.querySelectorAll('.mchip').forEach(b=>b.addEventListener('click',()=>{MOOD=b.dataset.m;FIG=+b.dataset.f;SQ=null;save();render();}));
}
['m1','m2','m3'].forEach(id=>$(id).addEventListener('change',()=>{MOOD=$('m1').value+$('m2').value+$('m3').value;SQ=null;save();render();}));
$('fig').addEventListener('change',()=>{FIG=+$('fig').value;save();render();});
$('imp').addEventListener('change',()=>{IMP=$('imp').checked?1:0;save();render();});
['S','M','P'].forEach(t=>$('n'+t).addEventListener('input',()=>{NAMES[t]=$('n'+t).value.trim();save();render();}));
$('dtabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;VIEW=b.dataset.v;save();render();});
render();
})();

/* ================= formulas ================= */
const BOT={t:'bot'};
const mk=(t,a,b)=>({t,a,b});
const atom=(p,args)=>({t:'atom',p,args:args||[]});
const quant=(t,v,a)=>({t,v,a});
const SYM={and:'∧',or:'∨',imp:'→',iff:'↔'};
const isQ=f=>f.t==='all'||f.t==='ex';
const isPV=v=>/^[A-Z]/.test(v);
function key(f){switch(f.t){case'atom':return f.p+(f.args.length?'('+f.args.join(',')+')':'');case'bot':return'⊥';case'not':return'¬'+key(f.a);
  case'all':return'∀'+f.v+'.'+key(f.a);case'ex':return'∃'+f.v+'.'+key(f.a);default:return'('+key(f.a)+SYM[f.t]+key(f.b)+')';}}
const simple=f=>f.t==='atom'||f.t==='bot'||f.t==='not'||isQ(f);
function str(f){
  switch(f.t){
    case'atom':{if(!f.args.length)return f.p;const sm=f.p.length===1&&f.args.every(a=>a.length===1);return f.p+(sm?f.args.join(''):'('+f.args.join(', ')+')');}
    case'bot':return'⊥';
    case'not':{const s=str(f.a);return'¬'+(simple(f.a)?s:'('+s+')');}
    case'all':case'ex':{const s=str(f.a),q=(f.t==='all'?'∀':'∃')+f.v;if(f.a.t==='atom'||f.a.t==='bot')return q+' '+s;return q+(simple(f.a)?s:'('+s+')');}
  }
  const wrap=(c,right)=>{const s=str(c);if(c.t==='atom'||c.t==='bot'||c.t==='not')return s;if(isQ(c))return right?s:'('+s+')';
    if(c.t===f.t&&(f.t==='and'||f.t==='or'||(f.t==='imp'&&right)))return s;return'('+s+')';};
  return wrap(f.a,false)+' '+SYM[f.t]+' '+wrap(f.b,true);
}
const OPS=[['<->','iff'],['<=>','iff'],['↔','iff'],['≡','iff'],['->','imp'],['=>','imp'],['→','imp'],['⊃','imp'],['/\\','and'],['∧','and'],['&&','and'],['&','and'],['^','and'],['\\/','or'],['∨','or'],['||','or'],['|','or'],['¬','not'],['~','not'],['!','not'],['-','not'],['⊥','bot'],['#','bot'],['(','('],[')',')'],['∀','all'],['∃','ex'],[',',',']];
function tokenize(s,mode){
  const toks=[];let i=0;
  while(i<s.length){const c=s[i];if(/\s/.test(c)){i++;continue;}
    const m=OPS.find(([k])=>s.startsWith(k,i));if(m){toks.push({t:m[1]});i+=m[0].length;continue;}
    if(mode==='prop'){
      const w=/^[A-Za-z][A-Za-z0-9_']*/.exec(s.slice(i));
      if(!w)throw new Error('I don’t recognise “'+c+'”.');
      const kw={and:'and',or:'or',not:'not',implies:'imp',iff:'iff',bot:'bot',false:'bot'}[w[0].toLowerCase()];
      toks.push(kw?{t:kw}:{t:'atom',p:w[0],args:[]});i+=w[0].length;continue;
    }
    const nm=/^[A-Za-z][0-9']*/.exec(s.slice(i));
    if(!nm)throw new Error('I don’t recognise “'+c+'”.');
    const name=nm[0];i+=name.length;
    const prev=toks[toks.length-1];
    if(prev&&(prev.t==='all'||prev.t==='ex')){toks.push({t:'var',n:name});continue;}
    if(/[a-z]/.test(name[0]))throw new Error('“'+name+'” is a name or variable, so it needs a predicate in front, like F'+name+'.');
    const args=[];
    const am=/^\(\s*([a-z][0-9']*(?:\s*,\s*[a-z][0-9']*)*)\s*\)/.exec(s.slice(i));
    if(am){am[1].split(',').forEach(a=>args.push(a.trim()));i+=am[0].length;}
    else{while(i<s.length&&/[a-z]/.test(s[i])){const t=/^[a-z][0-9']*/.exec(s.slice(i))[0];args.push(t);i+=t.length;}}
    toks.push({t:'atom',p:name,args});
  }
  return toks;
}
function parse(s,mode){
  const toks=tokenize(s,mode);let p=0;
  const peek=()=>toks[p]&&toks[p].t;
  const nameOf=t=>SYM[t.t]||(t.t==='all'?'∀':t.t==='ex'?'∃':t.p||t.n||t.t);
  const iff=()=>{let l=imp();while(peek()==='iff'){p++;l=mk('iff',l,imp());}return l;};
  const imp=()=>{const l=or();if(peek()==='imp'){p++;return mk('imp',l,imp());}return l;};
  const or=()=>{let l=and();while(peek()==='or'){p++;l=mk('or',l,and());}return l;};
  const and=()=>{let l=un();while(peek()==='and'){p++;l=mk('and',l,un());}return l;};
  const un=()=>{const t=toks[p];
    if(!t)throw new Error('The formula ends too early.');
    if(t.t==='not'){p++;return mk('not',un());}
    if(t.t==='all'||t.t==='ex'){
      if(mode==='prop')throw new Error('Quantifiers belong in the FOL or HOL tab.');
      p++;const v=toks[p];
      if(!v||v.t!=='var')throw new Error('Put a variable after '+nameOf(t)+', like '+nameOf(t)+'x.');
      if(mode==='fol'&&isPV(v.n))throw new Error('Quantifying over properties (like ∀'+v.n+') belongs in the HOL tab.');
      p++;return quant(t.t,v.n,un());}
    if(t.t==='('){p++;const f=iff();if(peek()!==')')throw new Error('A “(” is missing its “)”.');p++;return f;}
    if(t.t==='atom'){p++;return atom(t.p,t.args);}
    if(t.t==='bot'){p++;return BOT;}
    throw new Error('Expected a formula but found “'+nameOf(t)+'”.');};
  if(!toks.length)throw new Error('Empty box.');
  const f=iff();if(p<toks.length)throw new Error('Unexpected “'+nameOf(toks[p])+'” after a complete formula.');
  return f;
}
function subst(f,x,t){switch(f.t){case'atom':return atom(f.p===x?t:f.p,f.args.map(a=>a===x?t:a));case'bot':return f;case'not':return mk('not',subst(f.a,x,t));
  case'all':case'ex':return f.v===x?f:quant(f.t,f.v,subst(f.a,x,t));default:return mk(f.t,subst(f.a,x,t),subst(f.b,x,t));}}
function names(f,bound,out){bound=bound||new Set();out=out||{terms:new Set(),preds:new Map(),arity:[]};
  switch(f.t){case'atom':if(!bound.has(f.p)){if(out.preds.has(f.p)&&out.preds.get(f.p)!==f.args.length)out.arity.push(f.p);out.preds.set(f.p,f.args.length);}
      f.args.forEach(a=>{if(!bound.has(a))out.terms.add(a);});break;
    case'bot':break;case'not':names(f.a,bound,out);break;
    case'all':case'ex':{const b=new Set(bound);b.add(f.v);names(f.a,b,out);break;}
    default:names(f.a,bound,out);names(f.b,bound,out);}
  return out;}
function varArity(f,v){if(f.t==='atom')return f.p===v?f.args.length:-1;if(f.t==='bot')return-1;if(isQ(f))return f.v===v?-1:varArity(f.a,v);
  const a=varArity(f.a,v);if(a>=0)return a;return f.b?varArity(f.b,v):-1;}
const hasNeg=f=>f.t==='not'||f.t==='bot'||(f.a&&(hasNeg(f.a)||(f.b&&hasNeg(f.b))));
const hasQ=f=>isQ(f)||(f.a&&(hasQ(f.a)||(f.b&&hasQ(f.b))));
const sub=(g,f)=>key(f)===key(g)||(f.a&&(sub(g,f.a)||(f.b&&sub(g,f.b))));

/* ================= prover ================= */
const LIMIT={};
function proveSequent(premises,goal,logic,opts){
  opts=opts||{};const sigPreds=opts.sigPreds||new Map(),sigConsts=opts.sigConsts||[];
  let lines=[],nodes=0;const MAXN=opts.maxNodes||160000;
  const emit=(f,rule,refs,depth,extra)=>{lines.push(Object.assign({f,rule,refs,depth},extra||{}));return lines.length-1;};
  const find=(ctx,f)=>{const k=key(f);return ctx.find(e=>e.k===k);};
  const addCtx=(ctx,f,ln)=>find(ctx,f)?ctx:[...ctx,{f,k:key(f),ln}];
  const allNames=(ctx,goal)=>{const o={terms:new Set(),preds:new Map(),arity:[]};ctx.forEach(e=>names(e.f,null,o));names(goal,null,o);return o;};
  const IND='abcdefghijklmnopqrstuv'.split(''),PRD='KLNOQRSTUVWABCDE'.split('');
  function fresh(ctx,goal,pred){const o=allNames(ctx,goal);
    const used=new Set([...o.terms,...o.preds.keys(),...sigPreds.keys(),...sigConsts]);
    for(const c of(pred?PRD:IND))if(!used.has(c))return c;
    let i=1;while(used.has((pred?'K':'a')+i))i++;return(pred?'K':'a')+i;}
  function candidates(ctx,goal,v,body){
    const o=allNames(ctx,goal);
    if(isPV(v)){const ar=varArity(body,v);const s=new Set();o.preds.forEach((a,p)=>{if(a===ar)s.add(p);});sigPreds.forEach((a,p)=>{if(a===ar)s.add(p);});return[...s];}
    const t=[...o.terms];return t.length?t:[fresh(ctx,goal,false)];}
  function saturate(ctx,goal,d){
    ctx=ctx.slice();let changed=true,guard=0;
    const push=(f,rule,refs,extra)=>{if(find(ctx,f)||ctx.length>=110)return false;ctx.push({f,k:key(f),ln:emit(f,rule,refs,d,extra)});return true;};
    while(changed&&guard++<10){changed=false;
      for(let i=0;i<ctx.length;i++){const e=ctx[i],f=e.f;
        if(f.t==='and'){if(push(f.a,'∧E',[e.ln]))changed=true;if(push(f.b,'∧E',[e.ln]))changed=true;}
        else if(f.t==='imp'){const a=find(ctx,f.a);if(a&&push(f.b,'→E',[e.ln,a.ln]))changed=true;}
        else if(f.t==='iff'){let a=find(ctx,f.a);if(a&&push(f.b,'↔E',[e.ln,a.ln]))changed=true;a=find(ctx,f.b);if(a&&push(f.a,'↔E',[e.ln,a.ln]))changed=true;}
        else if(f.t==='not'){const a=find(ctx,f.a);if(a&&push(BOT,'¬E',[a.ln,e.ln]))changed=true;}
        else if(f.t==='all'){for(const t of candidates(ctx,goal,f.v,f.a))if(push(subst(f.a,f.v,t),'∀E',[e.ln],{term:t}))changed=true;}
      }}
    return ctx;}
  function prove(goal,ctx,d,depth,used,stack){
    if(++nodes>MAXN)throw LIMIT;
    const mark=lines.length;
    ctx=saturate(ctx,goal,d);
    const hit=find(ctx,goal);if(hit)return hit.ln;
    const bot=find(ctx,BOT);
    if(bot&&logic!=='minimal')return emit(goal,'X',[bot.ln],d);
    const sk=key(goal)+'|'+ctx.map(e=>e.k).sort().join(',');
    if(stack.has(sk)){lines.length=mark;return null;}
    stack.add(sk);
    const sat=lines.length,reset=()=>{lines.length=sat;};
    const subp=(assume,target,purpose,dd,u,extra)=>{
      const s=emit(assume,'Assumption',[],d+1,Object.assign({purpose,target},extra||{}));
      let ln=prove(target,addCtx(ctx,assume,s),d+1,dd,u||used,stack);
      if(ln==null){lines.length=s;return null;}
      if(ln<s)ln=emit(target,'R',[ln],d+1);
      return[s,ln];};
    const g=goal;
    const attempt=()=>{
      if(g.t==='imp'){const r=subp(g.a,g.b,'imp',depth);return r?emit(g,'→I',[r],d):null;}
      if(g.t==='not'){const r=subp(g.a,BOT,'not',depth);return r?emit(g,'¬I',[r],d):null;}
      if(g.t==='and'){const a=prove(g.a,ctx,d,depth,used,stack);if(a==null)return null;const b=prove(g.b,ctx,d,depth,used,stack);if(b==null){reset();return null;}return emit(g,'∧I',[a,b],d);}
      if(g.t==='iff'){const r1=subp(g.a,g.b,'iff1',depth);if(!r1)return null;const r2=subp(g.b,g.a,'iff2',depth);if(!r2){reset();return null;}return emit(g,'↔I',[r1,r2],d);}
      if(g.t==='all'){const c=fresh(ctx,g,isPV(g.v));const ln=prove(subst(g.a,g.v,c),ctx,d,depth,used,stack);return ln==null?null:emit(g,'∀I',[ln],d,{fresh:c});}
      if(g.t==='or'){const a=find(ctx,g.a)||find(ctx,g.b);if(a)return emit(g,'∨I',[a.ln],d);}
      if(g.t==='ex'){for(const t of candidates(ctx,g,g.v,g.a)){const h=find(ctx,subst(g.a,g.v,t));if(h)return emit(g,'∃I',[h.ln],d,{term:t});}}
      if(depth<=0)return null;
      if(g.t==='or'){for(const side of[g.a,g.b]){const a=prove(side,ctx,d,depth-1,used,stack);if(a!=null)return emit(g,'∨I',[a],d);reset();}}
      if(g.t==='ex'){for(const t of candidates(ctx,g,g.v,g.a)){const a=prove(subst(g.a,g.v,t),ctx,d,depth-1,used,stack);if(a!=null)return emit(g,'∃I',[a],d,{term:t});reset();}}
      for(const e of ctx){const f=e.f;
        const dirs=f.t==='imp'?[[f.a,f.b]]:f.t==='iff'?[[f.a,f.b],[f.b,f.a]]:[];
        for(const[A,B]of dirs){
          if(find(ctx,B))continue;
          if(!(sub(g,B)||B.t==='bot'||B.t==='or'||hasQ(B)||(g.t==='bot'&&hasNeg(B))))continue;
          const a=prove(A,ctx,d,depth-1,used,stack);if(a==null){reset();continue;}
          const bl=emit(B,f.t==='imp'?'→E':'↔E',[e.ln,a],d);
          const r=prove(g,addCtx(ctx,B,bl),d,depth-1,used,stack);if(r==null){reset();continue;}
          return r;}}
      if(g.t==='bot'){for(const e of ctx){if(e.f.t!=='not')continue;
        const a=prove(e.f.a,ctx,d,depth-1,used,stack);if(a==null){reset();continue;}return emit(BOT,'¬E',[a,e.ln],d);}}
      for(const e of ctx){if(e.f.t!=='ex'||used.includes(e.k))continue;
        const c=fresh(ctx,g,isPV(e.f.v));
        const r=subp(subst(e.f.a,e.f.v,c),g,'exE',depth-1,[...used,e.k],{fresh:c,exline:e.ln});if(!r)continue;
        return emit(g,'∃E',[e.ln,r],d,{fresh:c});}
      for(const e of ctx){if(e.f.t!=='or'||used.includes(e.k))continue;
        const u2=[...used,e.k];
        const r1=subp(e.f.a,g,'case1',depth-1,u2,{disj:e.ln});if(!r1)continue;
        const r2=subp(e.f.b,g,'case2',depth-1,u2,{disj:e.ln});if(!r2){reset();continue;}
        return emit(g,'∨E',[e.ln,r1,r2],d);}
      if(logic!=='minimal'&&g.t!=='bot'&&ctx.some(e=>hasNeg(e.f))){
        const b=prove(BOT,ctx,d,depth-1,used,stack);if(b!=null)return emit(g,'X',[b],d);reset();}
      if(logic==='classical'&&g.t!=='bot'&&!find(ctx,mk('not',g))){
        const r=subp(mk('not',g),BOT,'ip',depth-1);if(r)return emit(g,'IP',[r],d);}
      return null;};
    const r=attempt();
    stack.delete(sk);
    if(r==null)lines.length=mark;
    return r;}
  let found=null,gaveUp=false;
  try{
    for(let D=0;D<=8&&found==null;D++){
      lines=[];const ctx=[];
      premises.forEach(p=>{const ln=emit(p,'Premise',[],0);if(!find(ctx,p))ctx.push({f:p,k:key(p),ln});});
      let r=prove(goal,ctx,0,D,[],new Set());
      if(r!=null){if(r<premises.length)r=emit(goal,'R',[r],0);found=r;}
    }
  }catch(e){if(e!==LIMIT)throw e;gaveUp=true;}
  if(found==null)return{ok:false,gaveUp};
  const extraRefs=L=>[L.disj,L.exline].filter(x=>x!=null);
  const need=new Set(premises.map((_,i)=>i)),q=[found];
  while(q.length){const i=q.pop();if(need.has(i)&&i!==found&&i>=premises.length)continue;need.add(i);
    for(const r of[...lines[i].refs,...extraRefs(lines[i])])for(const x of(Array.isArray(r)?r:[r]))if(!need.has(x))q.push(x);}
  const keep=[...need].sort((a,b)=>a-b),num={};keep.forEach((o,i)=>num[o]=i+1);
  const out=keep.map(o=>{const L=lines[o];return Object.assign({},L,{refs:L.refs.map(r=>Array.isArray(r)?r.map(x=>num[x]):num[r]),
    disj:L.disj!=null?num[L.disj]:undefined,exline:L.exline!=null?num[L.exline]:undefined});});
  return{ok:true,lines:out};
}

/* ================= finite models (classical semantics) ================= */
function ev(f,M,env){
  switch(f.t){
    case'atom':{const rel=(f.p in env)?env[f.p]:M.pm[f.p];let idx=0,mul=1;for(const a of f.args){idx+=((a in env)?env[a]:M.cm[a])*mul;mul*=M.n;}return((rel/Math.pow(2,idx))|0)%2===1;}
    case'bot':return false;case'not':return!ev(f.a,M,env);
    case'and':return ev(f.a,M,env)&&ev(f.b,M,env);case'or':return ev(f.a,M,env)||ev(f.b,M,env);
    case'imp':return!ev(f.a,M,env)||ev(f.b,M,env);case'iff':return ev(f.a,M,env)===ev(f.b,M,env);
    case'all':case'ex':{const all=f.t==='all';
      const range=isPV(f.v)?Math.pow(2,Math.pow(M.n,Math.max(0,varArity(f.a,f.v)))):M.n;
      for(let x=0;x<range;x++){const v=ev(f.a,M,Object.assign({},env,{[f.v]:x}));if(all&&!v)return false;if(!all&&v)return true;}
      return all;}
  }}
function findModel(premises,goal,maxN,budget){
  maxN=maxN||3;budget=budget||120000;
  const o={terms:new Set(),preds:new Map(),arity:[]};[...premises,goal].forEach(f=>names(f,null,o));
  const preds=[...o.preds],consts=[...o.terms];
  for(let n=1;n<=maxN;n++){
    const sizes=preds.map(([,a])=>Math.pow(n,a));const total=sizes.reduce((s,x)=>s+x,0);
    if(total>22||Math.pow(2,total)*Math.pow(n,consts.length)>budget)return{model:null,searched:n-1};
    for(let ci=0;ci<Math.pow(n,consts.length);ci++){
      const cm={};let x=ci;consts.forEach(c=>{cm[c]=x%n;x=Math.floor(x/n);});
      for(let bits=0;bits<Math.pow(2,total);bits++){
        const pm={};let off=0;preds.forEach(([p],i)=>{pm[p]=(bits>>off)&((1<<sizes[i])-1);off+=sizes[i];});
        const M={n,cm,pm,preds};
        if(premises.every(f=>ev(f,M,{}))&&!ev(goal,M,{}))return{model:M,searched:n};
      }}}
  return{model:null,searched:maxN};
}

/* ================= categorical ================= */
function catHolds(st,model,n){
  let any=false;
  for(let r=0;r<(1<<n);r++){if(!((model>>r)&1))continue;const s=(r>>st.s)&1,p=(r>>st.p)&1;
    if(st.q==='A'&&s&&!p)return false;if(st.q==='E'&&s&&p)return false;
    if(st.q==='I'&&s&&p)any=true;if(st.q==='O'&&s&&!p)any=true;}
  return st.q==='A'||st.q==='E'?true:any;}
function catCheck(prem,concl,n,imp){
  const used=new Set();[...prem,concl].forEach(s=>{used.add(s.s);used.add(s.p);});
  const R=1<<n,models=[];for(let m=0;m<(1<<R);m++)models.push(m);
  const pc=m=>{let c=0;while(m){c+=m&1;m>>=1;}return c;};
  models.sort((a,b)=>pc(a)-pc(b));
  for(const m of models){
    if(imp&&[...used].some(t=>{for(let r=0;r<R;r++)if((m>>r)&1&&(r>>t)&1)return false;return true;}))continue;
    if(prem.every(s=>catHolds(s,m,n))&&!catHolds(concl,m,n))return{valid:false,model:m};}
  return{valid:true};}
const VALID_FORMS={'AAA-1':'Barbara','EAE-1':'Celarent','AII-1':'Darii','EIO-1':'Ferio','EAE-2':'Cesare','AEE-2':'Camestres','EIO-2':'Festino','AOO-2':'Baroco',
  'IAI-3':'Disamis','AII-3':'Datisi','OAO-3':'Bocardo','EIO-3':'Ferison','AEE-4':'Camenes','IAI-4':'Dimaris','EIO-4':'Fresison'};
const IMPORT_FORMS={'AAI-1':'Barbari','EAO-1':'Celaront','AEO-2':'Camestros','EAO-2':'Cesaro','AAI-3':'Darapti','EAO-3':'Felapton','AEO-4':'Camenos','AAI-4':'Bramantip','EAO-4':'Fesapo'};
function catForm(prem,concl){
  if(prem.length!==2)return null;const S=concl.s,P=concl.p;if(S===P)return null;
  const all=new Set();[...prem,concl].forEach(s=>{all.add(s.s);all.add(s.p);});if(all.size!==3)return null;
  const M=[...all].find(t=>t!==S&&t!==P);
  const has=(st,a,b)=>(st.s===a&&st.p===b)||(st.s===b&&st.p===a);
  const major=prem.find(st=>has(st,M,P)),minor=prem.find(st=>has(st,S,M));
  if(!major||!minor||major===minor)return null;
  const fig=major.s===M?(minor.p===M?1:3):(minor.p===M?2:4);
  const code=major.q+minor.q+concl.q+'-'+fig;
  return{code,mood:major.q+minor.q+concl.q,fig,name:VALID_FORMS[code]||IMPORT_FORMS[code]||null,conditional:!!IMPORT_FORMS[code],swapped:prem[0]!==major};}
function catToFOL(st,letters){const S=atom(letters[st.s],['x']),P=atom(letters[st.p],['x']);
  switch(st.q){case'A':return quant('all','x',mk('imp',S,P));case'E':return quant('all','x',mk('imp',S,mk('not',P)));
    case'I':return quant('ex','x',mk('and',S,P));case'O':return quant('ex','x',mk('and',S,mk('not',P)));}}

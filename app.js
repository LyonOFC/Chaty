const $=s=>document.querySelector(s);
const ic=(n,c='')=>`<svg class="i ${c}"><use href="#i-${n}"/></svg>`;
function theme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem('ct',t)}catch(e){}[$('#th1'),$('#th2')].forEach(b=>b.innerHTML=ic(t=='dark'?'sun':'moon'));const tc=document.querySelector('meta[name=theme-color]');tc&&tc.setAttribute('content',t=='dark'?'#000000':'#ffffff')}
const tog=()=>theme(document.documentElement.dataset.theme=='dark'?'light':'dark');
let me,chats=[],cur=null,CT=[],pickN=null,ST={},ctx=null,tn=0,lastL='',pbusy=0;
const now=()=>Date.now()/1e3|0;
function shrink(file,S=256){return new Promise(ok=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),m=Math.min(im.width,im.height);x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,S,S);ok(c.toDataURL('image/jpeg',.82))};im.onerror=()=>ok('');im.src=URL.createObjectURL(file)})}
async function api(a,d={}){try{const o={a};for(const k in d)o[k]=d[k] instanceof File?await shrink(d[k]):d[k];
 const r=await fetch('/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)});const j=await r.json();if(r.status==401&&me)location.reload();return j}catch(e){return{err:'Sin conexión'}}}
const cols=['#e07a5f','#6c63ff','#2a9d8f','#d6578a','#3a86ff','#e5575b','#d98e1f','#3d9bd6'];
const hue=id=>[...String(id)].reduce((a,c)=>a+c.charCodeAt(0),0);
function av(u,cls=''){if(u.photo){const i=document.createElement('img');i.src=u.photo;i.className='av '+cls;return i}
 const d=document.createElement('div');d.className='av '+cls;d.style.background=cols[hue(u.id)%cols.length];d.style.backgroundImage='linear-gradient(160deg,#ffffff3d,#00000026)';d.textContent=([...(u.name||'?')][0]||'?').toUpperCase();return d}
const fmt=n=>'+'+n,hm=t=>new Date(t*1e3).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
/* ---- emojis estilo iPhone: nativos en Apple, imágenes Apple en el resto ---- */
const APPLE=/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
const ER=/\p{Extended_Pictographic}(?:\uFE0F|[\u{1F3FB}-\u{1F3FF}]|\u200D\p{Extended_Pictographic}\uFE0F?)*|\p{Regional_Indicator}{2}/gu;
const EH=['https://cdnjs.cloudflare.com/ajax/libs/emoji-datasource-apple/15.0.1/img/apple/64/','https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/'];
function emUrls(ch){const cp=[...ch].map(c=>c.codePointAt(0).toString(16).padStart(4,'0')),a=cp.join('-'),b=cp.filter(x=>x!='fe0f').join('-'),N=[...new Set([a,b+'-fe0f',b])];return EH.flatMap(h=>N.map(n=>h+n+'.png'))}
function emImg(ch){const L=emUrls(ch);let k=0;const i=document.createElement('img');i.className='em';i.alt=ch;i.draggable=false;i.decoding='async';
 i.onerror=()=>{if(++k<L.length)i.src=L[k];else i.replaceWith(ch)};i.src=L[0];return i}
function rich(e,t){e.textContent='';if(APPLE){e.textContent=t;return}let p=0;for(const m of t.matchAll(ER)){if(m.index>p)e.append(t.slice(p,m.index));e.append(emImg(m[0]));p=m.index+m[0].length}if(p<t.length)e.append(t.slice(p))}
const EC=['😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶 😏 😒 🙄 😬 🤥 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🥵 🥶 🥴 😵 🤯 🤠 🥳 😎 🤓 🧐 😕 😟 🙁 😮 😯 😲 😳 🥺 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 💩 🤡 👻 👽 🤖',
'👍 👎 👌 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ ✋ 🤚 🖐️ 🖖 👋 🤝 🙏 👏 🙌 👐 🤲 💪 ✍️ 🤳 💅 👀 👅 👄 🧠 👶 👦 👧 👨 👩 🧑 👴 👵',
'❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💯 ✨ 🔥 ⭐ 🌟 💫 💥 💢 💤 🎉 🎊 ✅ ❌ ❓ ❗ ⚡ 🌈',
'🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐔 🐧 🐦 🦆 🦉 🐺 🐴 🦄 🐝 🦋 🐢 🐍 🐙 🐬 🐳 🦈 🌸 🌹 🌻 🌴 🍀',
'🍎 🍌 🍉 🍇 🍓 🍒 🍑 🥭 🍍 🥑 🍅 🌽 🥕 🍞 🧀 🍗 🍔 🍟 🍕 🌭 🌮 🍿 🍩 🍪 🎂 🍰 🍫 🍬 🍭 ☕ 🍺 🍷 🥤 🍹',
'⚽ 🏀 🏈 ⚾ 🎾 🏐 🎮 🎯 🎵 🎶 🎤 🎧 📱 💻 📷 🎬 📚 ✏️ 💡 🔑 🎁 💰 💎 🚗 ✈️ 🚀 🏠 ⌚ 📞 🔔'];
const ET=['😀','👍','❤️','🐶','🍎','⚽'];
const sendState=()=>$('#bar').classList.toggle('has',!!$('#mi').value.trim());
function ePick(k){const g=$('#egrid');g.innerHTML='';g.scrollTop=0;EC[k].split(' ').forEach(ch=>{const b=mk('button');b.type='button';b.dataset.e=ch;rich(b,ch);g.append(b)});[...$('#etabs').children].forEach((x,i)=>x.classList.toggle('on',i==k))}
function eInit(){const t=$('#etabs');ET.forEach((ch,k)=>{const b=mk('button');b.type='button';rich(b,ch);b.onclick=()=>ePick(k);t.append(b)});
 $('#egrid').onclick=e=>{const b=e.target.closest('button');if(!b)return;const i=$('#mi'),s=i.selectionStart??i.value.length;i.setRangeText(b.dataset.e,s,i.selectionEnd??s,'end');sendState()};$('#mi').oninput=sendState;
 $('#eb').onclick=()=>{const p=$('#emo');p.classList.toggle('hidden');if(!p.classList.contains('hidden')&&!$('#egrid').children.length)ePick(0)}}
/* ---- auth ---- */
function showAuth(r){$('#splash').classList.add('hidden');$('#app').classList.add('hidden');$('#auth').classList.remove('hidden');$('#fl').classList.toggle('hidden',r);$('#fr').classList.toggle('hidden',!r)}
$('#go-r').onclick=()=>showAuth(1);$('#go-l').onclick=()=>showAuth(0);
$('#fl').onsubmit=async e=>{e.preventDefault();const r=await api('login',{number:$('#ln').value,pass:$('#lp').value});r.err?$('#le').textContent=r.err:start()};
$('#rp').onchange=e=>{const f=e.target.files[0];if(f){const i=mk('img','av');i.src=URL.createObjectURL(f);$('#pvw').replaceWith(i);i.id='pvw'}};
async function genNums(){pickN=null;const n=await api('numbers',{cc:$('#rc').value});const c=$('#chips');c.innerHTML='';if(!Array.isArray(n))return;n.forEach(x=>{const b=mk('button','chip',fmt(x));b.type='button';b.onclick=()=>{pickN=x;[...c.children].forEach(y=>y.classList.remove('on'));b.classList.add('on')};c.append(b)})}
$('#rn').onclick=genNums;$('#rc').onchange=genNums;
$('#fr').onsubmit=async e=>{e.preventDefault();if(!pickN)return $('#re').textContent='Elige un número de la lista';
 const d={number:pickN,name:$('#rname').value,pass:$('#rpass').value};const f=$('#rp').files[0];if(f)d.photo=f;
 const r=await api('register',d);r.err?$('#re').textContent=r.err:start()};
async function loadCountries(){if(CT.length)return;const r=await api('countries');if(!Array.isArray(r))return;CT=r;$('#rc').innerHTML=CT.map(c=>`<option value="${c.code}">${c.name} (+${c.dial})</option>`).join('');await genNums()}
async function start(){loadCountries();const m=await api('me');if(m.err)return showAuth(0);me=m;
 $('#auth').classList.add('hidden');$('#app').classList.remove('hidden');$('#splash').classList.add('hidden');head();await loadChats(1);pushInit();
 const c=new URLSearchParams(location.search).get('chat');if(c){history.replaceState(null,'','/');openChat(c)}}
/* ---- notificaciones push ---- */
const u8=k=>Uint8Array.from(atob(k.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-k.length%4)%4)),c=>c.charCodeAt(0));
const info=t=>modal(s=>{s.append(mk('div','sub',t));const b=mk('button','btn','Entendido');b.onclick=()=>$('#modal').classList.add('hidden');s.append(b)});
async function subscribe(key){const reg=await navigator.serviceWorker.ready;let s=await reg.pushManager.getSubscription();
 if(s){const cur=s.options&&s.options.applicationServerKey,want=u8(key);if(cur&&(cur.byteLength!=want.length||new Uint8Array(cur).some((v,i)=>v!=want[i]))){await s.unsubscribe();s=null}}
 if(!s)s=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(key)});await api('push',{sub:s.toJSON()})}
function pushInit(){if(!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window))return;
 const on=Notification.permission==='granted';$('#bell').classList.toggle('hidden',on);
 if(on)api('vapid').then(k=>k.key&&subscribe(k.key)).catch(()=>{})}
async function enablePush(){try{
 if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window)){
  return info(/iPhone|iPad|iPod/.test(navigator.userAgent)?'En iPhone: toca Compartir > Añadir a pantalla de inicio, abre Chaty desde ahí y vuelve a tocar la campana.':'Tu navegador no admite notificaciones.')}
 const k=await api('vapid');if(!k.key)return info('El servidor todavía no tiene las llaves de notificaciones (variable VAPID_PRIVATE_JWK en Vercel).');
 const p=await Notification.requestPermission();if(p!=='granted')return info('Permiso denegado. Actívalo desde los ajustes del navegador para este sitio.');
 await subscribe(k.key);$('#bell').classList.add('hidden');info('Listo, ya recibirás notificaciones de mensajes nuevos.')}catch(e){info('No se pudo activar: '+e.message)}}
if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{});navigator.serviceWorker.addEventListener('message',e=>{if(e.data&&e.data.chat&&me)openChat(e.data.chat)})}
function head(){$('#myav').replaceChildren(av(me,'s'));const s=mk('small');s.textContent=fmt(me.id);$('#myname').replaceChildren(me.name,s)}
/* ---- lista de chats ---- */
async function loadChats(force){const r=await api('chats');if(!Array.isArray(r))return;const s=JSON.stringify(r);if(s===lastL&&!force)return;lastL=s;chats=r;drawList()}
function drawList(){const L=$('#list');L.innerHTML='';
 if(!chats.length){const d=mk('div','l','Aún no tienes chats. Toca + para empezar.');d.style.cssText='padding:24px;text-align:center;color:var(--m)';L.append(d)}
 chats.forEach(c=>{const row=mk('div','row'+(cur==c.id?' on':'')),i=mk('div','i2'),nm=mk('div','n',c.name);if(c.type!='p')nm.insertAdjacentHTML('beforeend',ic('users','sm'));i.append(nm);
  const l=c.last?(c.last.f=='sys'?c.last.x:(c.last.f==me.id?'Tú: ':'')+c.last.x):(c.type=='p'?fmt(c.num):'Grupo nuevo');i.append(mk('div','l',l));
  row.append(av(c),i,mk('div','tm',c.last?hm(c.last.t):''));row.onclick=()=>openChat(c.id);L.append(row)})}
function bump(id,t){const c=chats.find(x=>x.id==id);if(!c)return;c.last={f:me.id,x:t,t:now()};c.ts=now();chats.sort((a,b)=>b.ts-a.ts);lastL='';drawList()}
/* ---- chat ---- */
function hdr(c){$('#cname').textContent=c.name||'';$('#csub').textContent=c.type=='g'?(c.members?c.members.length:c.count||0)+' miembros':(c.num?fmt(c.num):'');$('#cav').replaceChildren(av(c,'s'))}
function openChat(id){cur=id;const c=chats.find(x=>x.id==id)||{id,name:''};const S=ST[id]=ST[id]||{map:{},ids:[],rev:0,users:{},info:c};
 $('#empty').classList.add('hidden');$('#chat').classList.remove('hidden');$('#app').classList.add('open');$('#emo').classList.add('hidden');ctxSet(null);
 hdr(S.info.name?S.info:c);const M=$('#msgs');M.innerHTML='';S.ids.forEach(i=>M.append(bubble(S,S.map[i])));M.scrollTop=M.scrollHeight;drawList();poll()}
function nameOf(S,f){return f==me.id?'Tú':(S.users[f]||{}).name||fmt(f)}
function bubble(S,m){
 if(m.f=='sys'){const s=mk('div','sys',m.x);s.dataset.i=m.i;return s}
 const mine=m.f==me.id,b=mk('div','m'+(mine?' me':'')+(m.d?' del':'')+(m.pend?' pend':''));b.dataset.i=m.i;
 if(S.info.type=='g'&&!mine){const w=mk('div','w',nameOf(S,m.f));w.style.color=cols[hue(m.f)%cols.length];b.append(w)}
 if(m.q&&!m.d){const q=mk('div','q'),o=S.map[m.q.i],t=mk('span');q.append(mk('b','',nameOf(S,m.q.f)),t);rich(t,o&&o.d||!m.q.x?'Mensaje eliminado':m.q.x);
  q.onclick=e=>{e.stopPropagation();const el=$('#msgs').querySelector(`[data-i="${m.q.i}"]`);if(el){el.scrollIntoView({block:'center'});el.classList.add('hl');setTimeout(()=>el.classList.remove('hl'),1200)}};b.append(q)}
 const t=mk('div','bt');m.d?t.textContent='Se eliminó este mensaje':rich(t,m.x);
 b.append(t,mk('div','h',(m.fail?'No enviado · ':m.e?'editado · ':'')+hm(m.t)));b.onclick=()=>menu(S,m);return b}
function put(S,m){const M=$('#msgs'),o=M.querySelector(`[data-i="${m.i}"]`);
 if(m.gone){delete S.map[m.i];S.ids=S.ids.filter(x=>x!=m.i);o&&o.remove();return}
 const isNew=!S.map[m.i];S.map[m.i]=m;const e=bubble(S,m);if(S.ready&&!o)e.classList.add('pop');if(o)o.replaceWith(e);else M.append(e);if(isNew)S.ids.push(m.i)}
async function poll(){if(!cur||pbusy)return;pbusy=1;const id=cur,S=ST[id];const r=await api('msgs',{chat:id,since:S.rev});pbusy=0;if(r.err||id!=cur)return;
 if(r.users){S.users=r.users;S.info=r.info;hdr(r.info)}
 if(r.msgs.length||!S.ready){const M=$('#msgs'),bot=!S.ready||M.scrollHeight-M.scrollTop-M.clientHeight<140;r.msgs.forEach(m=>put(S,m));if(bot)M.scrollTop=M.scrollHeight}
 S.rev=r.rev;S.ready=1}
(function tick(){poll();setTimeout(tick,document.hidden?6000:1300)})();
setInterval(()=>{if(me)loadChats()},5000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){poll();loadChats()}});
/* ---- responder / editar ---- */
function ctxSet(t,m,keep){const was=ctx;ctx=t?{t,m}:null;const b=$('#rbar');b.classList.toggle('hidden',!t);
 if(t){const S=ST[cur];$('#rwho').textContent=t=='e'?'Editando mensaje':nameOf(S,m.f);rich($('#rtxt'),m.x.slice(0,120));if(t=='e'){$('#mi').value=m.x;sendState()}$('#mi').focus()}
 else if(was&&was.t=='e'&&!keep){$('#mi').value='';sendState()}}
$('#rx').onclick=()=>ctxSet(null);
function menu(S,m){if(String(m.i)[0]=='t'||m.f=='sys')return;const mine=m.f==me.id,age=now()-m.t,L=[];
 if(!m.d){L.push(['reply','Responder',()=>ctxSet('r',m)]);L.push(['copy','Copiar',()=>{try{navigator.clipboard.writeText(m.x)}catch(e){}}])}
 if(mine&&!m.d&&age<900)L.push(['edit','Editar',()=>ctxSet('e',m)]);
 L.push(['trash','Eliminar para mí',()=>del(m,'me'),1]);
 if(mine&&!m.d&&age<172800)L.push(['trash','Eliminar para todos',()=>del(m,'all'),1]);
 modal(s=>L.forEach(([i,t,f,red])=>{const b=mk('button','act'+(red?' red':''));b.innerHTML=ic(i)+'<span></span>';b.lastChild.textContent=t;b.onclick=()=>{$('#modal').classList.add('hidden');f()};s.append(b)}))}
function del(m,mode){const S=ST[cur],id=cur;if(mode=='me')put(S,{i:m.i,gone:1});else{m.d=1;m.x='';delete m.q;put(S,m)}
 api('del',{chat:id,id:m.i,mode}).then(r=>{if(r.err)alert(r.err);loadChats(1)})}
$('#bar').onsubmit=e=>{e.preventDefault();const inp=$('#mi'),t=inp.value.trim();if(!t||!cur)return;const S=ST[cur],id=cur,c=ctx;inp.value='';sendState();ctxSet(null,null,1);
 if(c&&c.t=='e'){const m=c.m;m.x=t;m.e=now();put(S,m);api('edit',{chat:id,id:m.i,text:t}).then(r=>r.err&&alert(r.err));return}
 const tmp='t'+(++tn),m={i:tmp,f:me.id,x:t,t:now(),pend:1};if(c&&c.t=='r')m.q={i:c.m.i,f:c.m.f,x:c.m.d?'':c.m.x.slice(0,120)};
 put(S,m);const M=$('#msgs');M.scrollTop=M.scrollHeight;bump(id,t);
 api('send',{chat:id,text:t,reply:c&&c.t=='r'?c.m.i:0}).then(r=>{delete S.map[tmp];S.ids=S.ids.filter(x=>x!=tmp);const el=M.querySelector(`[data-i="${tmp}"]`);
  if(r.err){if(el){m.pend=0;m.fail=1;el.replaceWith(bubble(S,m));el.remove}return}
  if(el)el.remove();if(id==cur){put(S,r.msg);M.scrollTop=M.scrollHeight}});
 setTimeout(poll,350)};
$('.send').onpointerdown=e=>e.preventDefault();
$('#back').onclick=()=>{$('#app').classList.remove('open');cur=null;drawList()};
/* ---- modales / info ---- */
const modal=h=>{const m=$('#modal');m.innerHTML='';const s=mk('div','sheet');m.append(s);m.classList.remove('hidden');m.onclick=e=>{if(e.target==m)m.classList.add('hidden')};h(s);return s};
const big=u=>{const a=av(u);a.style.cssText+=';width:96px;height:96px;font-size:2.4rem;align-self:center';return a};
const sec=(l,v)=>{const d=mk('div','sec'),s=mk('small',null,l),t=mk('div');t.textContent=v;d.append(s,t);return d};
const dt=t=>new Date(t*1e3).toLocaleDateString([],{day:'numeric',month:'long',year:'numeric'});
function userInfo(num){modal(s=>{s.append(mk('div','sub','Cargando…'));api('user',{number:num}).then(u=>{if(u.err){s.textContent=u.err;return}s.innerHTML='';
 const al=Object.assign(mk('input'),{value:u.alias,placeholder:'Nombre con el que lo tienes guardado',maxLength:25}),sv=mk('button','btn','Guardar nombre'),go=mk('button','btn','Enviar mensaje'),er=mk('div','err');
 sv.onclick=async()=>{const r=await api('alias',{number:u.id,alias:al.value});if(r.err)return er.textContent=r.err;$('#modal').classList.add('hidden');await loadChats(1);if(cur){const id=cur;delete ST[id];openChat(id)}};
 go.onclick=async()=>{const r=await api('add',{number:u.id});if(r.err)return er.textContent=r.err;$('#modal').classList.add('hidden');await loadChats(1);openChat(r.id)};
 s.append(big({id:u.id,name:u.alias||u.name,photo:u.photo}),mk('div','big',u.alias||u.name));if(u.alias)s.append(mk('div','sub','Nombre en Chaty: '+u.name));
 s.append(sec('Número',fmt(u.id)),sec('Info.',u.bio),sec('En Chaty desde',dt(u.created)),mk('div','sub','Guardar como'),al,er,sv,go)})})}
function groupInfo(S){const g=S.info;modal(s=>{s.append(big({id:g.id,name:g.name}),mk('div','big',g.name),mk('div','sub','Grupo · '+(g.members||[]).length+' miembros'));
 if(g.created)s.append(sec('Creado',dt(g.created)+' por '+nameOf(S,g.admin)));
 (g.members||[]).forEach(u=>{const r=mk('div','mem'),i=mk('div'),n=mk('b',null,u.id==me.id?'Tú':u.name);if(u.admin){n.append(mk('span','pill','Admin'))}const sb=mk('div','sub',fmt(u.id));sb.style.textAlign='left';i.append(n,sb);r.append(av(u,'s'),i);if(u.id!=me.id)r.onclick=()=>userInfo(u.id);s.append(r)})})}
$('#chead').onclick=()=>{const S=ST[cur];if(!S)return;S.info.type=='g'?groupInfo(S):S.info.num&&userInfo(S.info.num)};
$('#newb').onclick=()=>modal(s=>{let tab=0;const t=mk('div','tabs'),b1=mk('button','on','Por número'),b2=mk('button','','Nuevo grupo');t.append(b1,b2);
 const body=mk('div');body.style.cssText='display:flex;flex-direction:column;gap:12px';s.append(t,body);
 const draw=()=>{body.innerHTML='';b1.className=tab?'':'on';b2.className=tab?'on':'';const er=mk('div','err');er.style.minHeight='1em';
  if(!tab){const i=Object.assign(mk('input'),{placeholder:'Número (+504 9999 9999)',inputMode:'tel'}),go=mk('button','btn','Abrir chat');
   go.onclick=async()=>{const r=await api('add',{number:i.value});if(r.err)return er.textContent=r.err;$('#modal').classList.add('hidden');await loadChats(1);openChat(r.id)};body.append(i,er,go)}
  else{const n=Object.assign(mk('input'),{placeholder:'Nombre del grupo',maxLength:30}),m=Object.assign(mk('input'),{placeholder:'Números separados por coma'}),go=mk('button','btn','Crear grupo');
   go.onclick=async()=>{const r=await api('group',{name:n.value,members:m.value.split(/[,;\n]/).map(x=>x.trim()).filter(Boolean)});if(r.err)return er.textContent=r.err;$('#modal').classList.add('hidden');await loadChats(1);openChat(r.id)};body.append(n,m,er,go)}};
 b1.onclick=()=>{tab=0;draw()};b2.onclick=()=>{tab=1;draw()};draw()});
$('#prof').onclick=()=>modal(s=>{let pv=av(me);const n=Object.assign(mk('input'),{value:me.name,maxLength:25,placeholder:'Nombre'}),bio=Object.assign(mk('input'),{value:me.bio||'',maxLength:80,placeholder:'Info.'}),f=Object.assign(mk('input'),{type:'file',accept:'image/*'}),
 save=mk('button','btn','Guardar'),out=mk('button','lnk');out.innerHTML=ic('logout')+'Cerrar sesión';pv.style.cssText+=';width:90px;height:90px;align-self:center;font-size:2rem';
 f.onchange=()=>{if(f.files[0]){const i=mk('img','av');i.src=URL.createObjectURL(f.files[0]);i.style.cssText='width:90px;height:90px;align-self:center';pv.replaceWith(i);pv=i}};
 save.onclick=async()=>{const d={name:n.value,bio:bio.value};if(f.files[0])d.photo=f.files[0];const r=await api('profile',d);if(!r.err){me=r;head();$('#modal').classList.add('hidden');loadChats(1)}};
 out.onclick=async()=>{try{const reg=await navigator.serviceWorker.getRegistration(),sb=reg&&await reg.pushManager.getSubscription();if(sb){await api('unpush',{endpoint:sb.endpoint});await sb.unsubscribe()}}catch(e){}await api('logout');location.reload()};s.append(pv,mk('div','lnk',fmt(me.id)),n,bio,f,save,out)});
$('#bell').onclick=enablePush;$('#th1').onclick=$('#th2').onclick=tog;theme(document.documentElement.dataset.theme);eInit();start();

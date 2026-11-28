/* ============ utilidades ============ */
const $=s=>document.querySelector(s);
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const ic=(n,c='')=>`<svg class="i ${c}"><use href="#i-${n}"/></svg>`;
const now=()=>Date.now()/1e3|0, fmt=n=>'+'+n;
const hm=t=>new Date(t*1e3).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
const same=(t,off=0)=>new Date(t*1e3).toDateString()==new Date(Date.now()-off*864e5).toDateString();
const dkey=t=>new Date(t*1e3).toDateString();
const dayLabel=t=>same(t)?'Hoy':same(t,1)?'Ayer':new Date(t*1e3).toLocaleDateString([],{weekday:'long',day:'numeric',month:'long'});
const listTime=t=>same(t)?hm(t):same(t,1)?'Ayer':new Date(t*1e3).toLocaleDateString([],{day:'numeric',month:'short'});
const seenTxt=t=>!t?'':same(t)?'últ. vez hoy a las '+hm(t):same(t,1)?'últ. vez ayer a las '+hm(t):'últ. vez el '+new Date(t*1e3).toLocaleDateString([],{day:'numeric',month:'short'});
const presTxt=p=>p?(p.on?'en línea':seenTxt(p.seen)):'';
const dt=t=>new Date(t*1e3).toLocaleDateString([],{day:'numeric',month:'long',year:'numeric'});
const pref=k=>{try{return localStorage.getItem(k)!=='0'}catch(e){return true}};
const setPref=(k,v)=>{try{localStorage.setItem(k,v?'1':'0')}catch(e){}};
function theme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem('ct',t)}catch(e){}$('#th1').innerHTML=ic(t=='dark'?'sun':'moon');const tc=document.querySelector('meta[name=theme-color]');tc&&tc.setAttribute('content',t=='dark'?'#0a0912':'#f3f1fb')}
let me,chats=[],cur=null,CT=[],pickN=null,ST={},ctx=null,tn=0,lastL='',pbusy=0,live=0,es,firstLoad=1,filt='all',qry='',CON=null,lastTy=0,pushOn=false;
function shrink(file,S=256){return new Promise(ok=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),m=Math.min(im.width,im.height);x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,S,S);ok(c.toDataURL('image/jpeg',.82))};im.onerror=()=>ok('');im.src=URL.createObjectURL(file)})}
async function api(a,d={}){try{const o={a};for(const k in d)o[k]=d[k] instanceof File?await shrink(d[k]):d[k];
 const r=await fetch('/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)});const j=await r.json();if(r.status==401&&me)location.reload();return j}catch(e){return{err:'Sin conexión'}}}
const cols=['#ff7a59','#7c4dff','#ec4899','#3b82f6','#f59e0b','#06b6d4','#a855f7','#ef4444'];
const hue=id=>[...String(id)].reduce((a,c)=>a+c.charCodeAt(0),0);
function av(u,cls=''){if(u.photo){const i=document.createElement('img');i.src=u.photo;i.className='av '+cls;return i}
 const d=mk('div','av '+cls);d.style.background=cols[hue(u.id)%cols.length];d.style.backgroundImage='linear-gradient(160deg,#ffffff40,#00000030)';d.textContent=([...(u.name||'?')][0]||'?').toUpperCase();return d}
function avd(u,cls,on){const w=mk('span','avw');w.append(av(u,cls));if(on)w.append(mk('i','dot'));return w}
/* ---- emojis estilo iPhone: nativos en Apple, imágenes Apple en el resto ---- */
const APPLE=/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
const ER=/\p{Extended_Pictographic}(?:\uFE0F|[\u{1F3FB}-\u{1F3FF}]|\u200D\p{Extended_Pictographic}\uFE0F?)*|\p{Regional_Indicator}{2}/gu;
const EH=['https://cdnjs.cloudflare.com/ajax/libs/emoji-datasource-apple/15.0.1/img/apple/64/','https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/'];
function emUrls(ch){const cp=[...ch].map(c=>c.codePointAt(0).toString(16).padStart(4,'0')),a=cp.join('-'),b=cp.filter(x=>x!='fe0f').join('-'),N=[...new Set([a,b+'-fe0f',b])];return EH.flatMap(h=>N.map(n=>h+n+'.png'))}
function emImg(ch){const L=emUrls(ch);let k=0;const i=document.createElement('img');i.className='em';i.alt=ch;i.draggable=false;i.decoding='async';i.onerror=()=>{if(++k<L.length)i.src=L[k];else i.replaceWith(ch)};i.src=L[0];return i}
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
 $('#egrid').onclick=e=>{const b=e.target.closest('button');if(!b)return;const i=$('#mi'),s=i.selectionStart??i.value.length;i.setRangeText(b.dataset.e,s,i.selectionEnd??s,'end');sendState()};
 $('#mi').oninput=()=>{sendState();if(cur&&$('#mi').value&&Date.now()-lastTy>2500){lastTy=Date.now();api('typing',{chat:cur})}};
 $('#eb').onclick=()=>{const p=$('#emo');p.classList.toggle('hidden');if(!p.classList.contains('hidden')&&!$('#egrid').children.length)ePick(0)}}

/* ============ avisos dentro de la página (sin depender de push) ============ */
let AC;document.addEventListener('pointerdown',()=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.state=='suspended'&&AC.resume()}catch(e){}},{passive:true});
function blip(){if(!pref('cs')||!AC)return;try{const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(740,t);o.frequency.exponentialRampToValueAtTime(1180,t+.09);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.26);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.27)}catch(e){}}
function dropToast(el,ms){setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),260)},ms)}
function snack(t){const el=mk('div','toast snk',t);$('#toasts').append(el);dropToast(el,2600)}
function toast(c){if(!pref('cb'))return;const T=$('#toasts');T.querySelectorAll(`[data-c="${c.id}"]`).forEach(x=>x.remove());[...T.querySelectorAll('.toast:not(.snk)')].slice(0,-2).forEach(x=>x.remove());
 const el=mk('div','toast'),i=mk('div','i2'),l=c.last||{},pre=c.type=='g'&&l.fn?l.fn+': ':'';el.dataset.c=c.id;
 const t=mk('span');rich(t,pre+(l.x||''));i.append(mk('b','',c.name),t);el.append(av(c),i);el.onclick=()=>{el.remove();closeSheet();openChat(c.id)};T.append(el);dropToast(el,5000);
 blip();try{navigator.vibrate&&navigator.vibrate(40)}catch(e){}}
function badge(){const n=chats.reduce((a,c)=>a+(c.un||0),0);document.title=(n?`(${n}) `:'')+'Chaty';try{n?navigator.setAppBadge&&navigator.setAppBadge(n):navigator.clearAppBadge&&navigator.clearAppBadge()}catch(e){}
 $('#hsub').textContent=!live?'Conectando…':n?n+(n==1?' mensaje sin leer':' mensajes sin leer'):'Todo al día'}

/* ============ login / registro ============ */
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
 $('#auth').classList.add('hidden');$('#app').classList.remove('hidden');$('#splash').classList.add('hidden');head();await loadChats(1);firstLoad=0;rt();pushInit();api('ping');
 const c=new URLSearchParams(location.search).get('chat');if(c){history.replaceState(null,'','/');openChat(c)}}
function head(){$('#prof').replaceChildren(av(me))}

/* ============ notificaciones del sistema (opcional) ============ */
const u8=k=>Uint8Array.from(atob(k.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-k.length%4)%4)),c=>c.charCodeAt(0));
const info=t=>sheet('Aviso',b=>{b.append(mk('div','sub',t));const x=mk('button','btn','Entendido');x.onclick=closeSheet;b.append(x)});
async function subscribe(key){const reg=await navigator.serviceWorker.ready;let s=await reg.pushManager.getSubscription();
 if(s){const cur=s.options&&s.options.applicationServerKey,want=u8(key);if(cur&&(cur.byteLength!=want.length||new Uint8Array(cur).some((v,i)=>v!=want[i]))){await s.unsubscribe();s=null}}
 if(!s)s=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(key)});await api('push',{sub:s.toJSON()})}
const pushOK=()=>'Notification' in window&&'serviceWorker' in navigator&&'PushManager' in window;
function pushInit(){if(!pushOK())return;pushOn=Notification.permission==='granted';if(pushOn)api('vapid').then(k=>k.key&&subscribe(k.key)).catch(()=>{})}
async function enablePush(){try{
 if(!pushOK())return info(/iPhone|iPad|iPod/.test(navigator.userAgent)?'En iPhone: toca Compartir > Añadir a pantalla de inicio y abre Chaty desde ahí.':'Tu navegador no admite notificaciones del sistema. Los avisos dentro de la app sí funcionan.');
 const k=await api('vapid');if(!k.key)return info('El servidor no tiene las llaves de notificaciones del sistema. Los avisos dentro de la app funcionan igual.');
 const p=await Notification.requestPermission();if(p!=='granted')return info('Permiso denegado. Actívalo desde los ajustes del navegador para este sitio.');
 await subscribe(k.key);pushOn=true;return true}catch(e){info('No se pudo activar: '+e.message)}}
if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{});navigator.serviceWorker.addEventListener('message',e=>{if(e.data&&e.data.chat&&me)openChat(e.data.chat)})}

/* ============ tiempo real (Upstash → SSE) ============ */
function rt(){try{es&&es.close()}catch(e){}es=new EventSource('/api/stream');
 es.onopen=()=>{live=1;badge();sync()};es.onerror=()=>{live=0;badge()};
 es.onmessage=e=>{let d;try{d=JSON.parse(e.data)}catch(x){return}onEv(d)}}
function sync(){loadChats();poll()}
function onEv(d){
 if(d.t=='m'){loadChats();if(d.c==cur)poll()}
 else if(d.t=='u'){loadChats();if(d.c==cur)poll()}
 else if(d.t=='rc'){if(d.c==cur)poll()}
 else if(d.t=='c'){loadChats(1);if(d.c==cur){const S=ST[d.c];if(S){S.rev=0;S.ready=0;poll()}}}
 else if(d.t=='ty'&&d.c==cur){const S=ST[cur];if(S){S.ty={u:d.u,t:Date.now()};hdr(S);setTimeout(()=>ST[cur]===S&&hdr(S),4600)}}}
(function tick(){if(me){loadChats();poll()}setTimeout(tick,live?20000:3000)})();
setInterval(()=>{if(me&&!document.hidden){api('ping');if(cur)poll()}},20000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&me){api('ping');poll();loadChats()}});

/* ============ lista de chats ============ */
async function loadChats(force){const r=await api('chats');if(!Array.isArray(r))return;const s=JSON.stringify(r);if(s===lastL&&!force)return;
 const prev={};chats.forEach(c=>prev[c.id]=c.un||0);lastL=s;chats=r;
 if(!firstLoad)r.forEach(c=>{if(c.un>(prev[c.id]||0)&&!(c.id==cur&&!document.hidden))toast(c)});drawList();badge();
 if(cur&&ST[cur]){const c=chats.find(x=>x.id==cur);if(!c&&ST[cur].ready&&ST[cur].info.type=='g')leaveView()}}
function drawList(){const L=$('#list');L.innerHTML='';const q=qry.toLowerCase();
 const rows=chats.filter(c=>(filt=='all'||(filt=='un'&&c.un)||(filt=='g'&&c.type=='g'))&&(!q||c.name.toLowerCase().includes(q)||(c.num||'').includes(q.replace(/\D/g,'')||'~')||(c.last&&c.last.x||'').toLowerCase().includes(q)));
 if(!rows.length){const d=mk('div','nil');d.innerHTML=chats.length?'<span>Nada por aquí.</span>':'<span>Aún no tienes chats.<br>Agrega un contacto para empezar a hablar.</span>';
  if(!chats.length){const b=mk('button','btn','Agregar contacto');b.onclick=addContact;d.append(b)}L.append(d)}
 rows.forEach(c=>{const row=mk('div','row'+(cur==c.id?' on':'')+(c.un?' un':'')),i=mk('div','i2'),r1=mk('div','r1'),nm=mk('div','n',c.name);if(c.type!='p')nm.insertAdjacentHTML('beforeend',ic('users','sm'));
  r1.append(nm,mk('div','tm',c.last?listTime(c.last.t):''));const r2=mk('div','r2'),l=mk('div','l'),x=c.last;
  if(!x)l.textContent=c.type=='p'?fmt(c.num):'Grupo nuevo';else if(x.f=='sys')l.textContent=x.x;else if(x.d){l.innerHTML='<i>Mensaje eliminado</i>'}else{const p=x.f==me.id?'Tú: ':(c.type=='g'&&x.fn?x.fn+': ':'');rich(l,p+x.x)}
  r2.append(l);if(c.un)r2.append(mk('div','bd',c.un>99?'99+':c.un));i.append(r1,r2);row.append(avd(c,'',c.on),i);row.onclick=()=>openChat(c.id);L.append(row)})}
$('#q').oninput=e=>{qry=e.target.value.trim();drawList()};
$('#fch').onclick=e=>{const b=e.target.closest('button');if(!b)return;filt=b.dataset.f;[...$('#fch').children].forEach(x=>x.classList.toggle('on',x==b));drawList()};
function bump(id,t){const c=chats.find(x=>x.id==id);if(!c)return;c.last={f:me.id,x:t,t:now()};c.ts=now();chats.sort((a,b)=>b.ts-a.ts);lastL='';drawList()}

/* ============ chat ============ */
const nameOf=(S,f)=>f==me.id?'Tú':(S.users[f]||{}).name||fmt(f);
function hdr(S){const c=S.info||{},ty=S.ty&&Date.now()-S.ty.t<4500;$('#cname').textContent=c.name||'';let sub='';
 if(c.type=='g')sub=ty?nameOf(S,S.ty.u)+' está escribiendo…':(c.members||[]).map(u=>u.id==me.id?'Tú':u.name).join(', ');
 else sub=ty?'escribiendo…':presTxt(S.pres);
 const sm=$('#csub');sm.textContent=sub;sm.className=ty||(c.type=='p'&&S.pres&&S.pres.on)?'on':'';
 $('#cav').replaceChildren(avd(c.id?c:{id:'x',name:'?'},'s',c.type=='p'&&S.pres&&S.pres.on))}
function chrome(S){const c=S.info||{},ask=c.type=='p'&&c.num&&c.contact===false&&!S.blk,nt=$('#notice');
 nt.classList.toggle('hidden',!ask);nt.innerHTML='';
 if(ask){const t=mk('span','','No tienes a '+fmt(c.num)+' en tus contactos');const a=mk('button','','Agregar'),b=mk('button','o','Bloquear');a.onclick=()=>userInfo(c.num);b.onclick=()=>blockAsk(c.num,c.name);nt.append(t,a,b)}
 const blk=!!S.blk;$('#bar').classList.toggle('hidden',blk);$('#blockbar').classList.toggle('hidden',!blk);
 if(blk){const bb=$('#blockbar');bb.innerHTML='';const t=mk('span','','Bloqueaste a este contacto'),u=mk('button','','Desbloquear');u.onclick=async()=>{await api('block',{number:c.num,on:0});S.blk=0;chrome(S);hdr(S);poll();snack('Contacto desbloqueado')};bb.append(t,u)}}
function openChat(id,pre){cur=id;const c=chats.find(x=>x.id==id)||(pre&&{...pre,id})||{id,name:''};const S=ST[id]=ST[id]||{map:{},ids:[],rev:0,users:{},info:c,cur:{rd:0,dl:0},shown:new Set()};
 $('#empty').classList.add('hidden');$('#chat').classList.remove('hidden');$('#app').classList.add('open');$('#emo').classList.add('hidden');ctxSet(null);$('#mi').value='';sendState();
 hdr(S);chrome(S);render(S,1);drawList();poll()}
function leaveView(){cur=null;$('#app').classList.remove('open');$('#chat').classList.add('hidden');$('#empty').classList.remove('hidden');drawList()}
function tickOf(S,m){if(m.pend)return ic('clock','tk');if(m.fail)return'<b>!</b>';const n=typeof m.i=='number'?m.i:0;return ic(n&&n<=S.cur.rd?'checks':n&&n<=S.cur.dl?'checks':'check',n&&n<=S.cur.rd?'tk rd':'tk')}
function bubble(S,m){
 if(m.f=='sys'){const s=mk('div','sys',m.x);s.dataset.i=m.i;return s}
 const mine=m.f==me.id,b=mk('div','m'+(mine?' me':'')+(m.d?' del':'')+(m.pend?' pend':'')+(S.shown.has(m.i)?'':' pop'));b.dataset.i=m.i;
 if(S.info.type=='g'&&!mine){const w=mk('div','w',nameOf(S,m.f));w.style.color=cols[hue(m.f)%cols.length];b.append(w)}
 if(m.q&&!m.d){const q=mk('div','q'),o=S.map[m.q.i],t=mk('span');q.append(mk('b','',nameOf(S,m.q.f)),t);rich(t,o&&o.d||!m.q.x?'Mensaje eliminado':m.q.x);
  q.onclick=e=>{e.stopPropagation();const el=$('#msgs').querySelector(`[data-i="${m.q.i}"]`);if(el){el.scrollIntoView({block:'center'});el.classList.add('hl');setTimeout(()=>el.classList.remove('hl'),1200)}};b.append(q)}
 const t=mk('div','bt');m.d?t.textContent='Se eliminó este mensaje':rich(t,m.x);
 const h=mk('div','h');h.append((m.fail?'No enviado · ':m.e?'editado · ':'')+hm(m.t));if(mine&&!m.d){const k=mk('span');k.innerHTML=tickOf(S,m);h.append(k)}
 b.append(t,h);b.onclick=()=>menu(S,m);return b}
function render(S,bottom){if(!S||S.info.id!=cur&&S!==ST[cur])return;const M=$('#msgs'),near=M.scrollHeight-M.scrollTop-M.clientHeight<140,top=M.scrollTop;M.innerHTML='';let ld='';
 S.ids.forEach(i=>{const m=S.map[i];if(!m)return;const k=dkey(m.t);if(k!=ld){ld=k;M.append(mk('div','day',dayLabel(m.t)))}M.append(bubble(S,m));S.shown.add(m.i)});
 M.scrollTop=bottom||near?M.scrollHeight:top}
function put(S,m){if(m.gone){delete S.map[m.i];S.ids=S.ids.filter(x=>x!=m.i);return}const isNew=!S.map[m.i];S.map[m.i]=m;if(isNew)S.ids.push(m.i)}
async function poll(){if(!cur||pbusy)return;pbusy=1;const id=cur,S=ST[id];let r;try{r=await api('msgs',{chat:id,since:S.rev})}finally{pbusy=0}
 if(id!=cur)return;if(r.err){if(r.err=='Chat no encontrado')leaveView();return}
 if(r.users){S.users=r.users;S.info=r.info}
 const ch=r.msgs.length||!S.ready||JSON.stringify(r.cur)!=JSON.stringify(S.cur)||(r.blk||0)!=(S.blk||0);
 S.cur=r.cur;S.blk=r.blk;if('pres' in r)S.pres=r.pres;r.msgs.forEach(m=>put(S,m));S.rev=r.rev;const first=!S.ready;S.ready=1;
 hdr(S);chrome(S);if(ch)render(S,first);
 if(!document.hidden){let mx=0;S.ids.forEach(i=>{const m=S.map[i];if(m&&typeof m.i=='number'&&m.f!=me.id&&m.f!='sys'&&m.i>mx)mx=m.i});
  if(mx>(S.rsent||0)){S.rsent=mx;api('read',{chat:id}).then(()=>loadChats(1))}}}
/* ---- responder / editar / enviar ---- */
function ctxSet(t,m,keep){const was=ctx;ctx=t?{t,m}:null;const b=$('#rbar');b.classList.toggle('hidden',!t);
 if(t){const S=ST[cur];$('#rwho').textContent=t=='e'?'Editando mensaje':nameOf(S,m.f);rich($('#rtxt'),m.x.slice(0,120));if(t=='e'){$('#mi').value=m.x;sendState()}$('#mi').focus()}
 else if(was&&was.t=='e'&&!keep){$('#mi').value='';sendState()}}
$('#rx').onclick=()=>ctxSet(null);
function menu(S,m){if(String(m.i)[0]=='t'||m.f=='sys')return;const mine=m.f==me.id,age=now()-m.t,L=[];
 if(!m.d){L.push(['reply','Responder',()=>ctxSet('r',m)]);L.push(['copy','Copiar',()=>{try{navigator.clipboard.writeText(m.x);snack('Copiado')}catch(e){}}])}
 if(mine&&!m.d&&age<900)L.push(['edit','Editar',()=>ctxSet('e',m)]);
 L.push(['trash','Eliminar para mí',()=>del(m,'me'),1]);
 if(mine&&!m.d&&age<172800)L.push(['trash','Eliminar para todos',()=>del(m,'all'),1]);
 sheet('Mensaje',b=>L.forEach(([i,t,f,red])=>b.append(actBtn(i,t,()=>{closeSheet();f()},red))))}
function del(m,mode){const S=ST[cur],id=cur;if(mode=='me')put(S,{i:m.i,gone:1});else{m.d=1;m.x='';delete m.q;put(S,m)}render(S);
 api('del',{chat:id,id:m.i,mode}).then(r=>{if(r.err)snack(r.err);loadChats(1)})}
$('#bar').onsubmit=e=>{e.preventDefault();const inp=$('#mi'),t=inp.value.trim();if(!t||!cur)return;const S=ST[cur],id=cur,c=ctx;inp.value='';sendState();ctxSet(null,null,1);
 if(c&&c.t=='e'){const m=c.m;m.x=t;m.e=now();render(S);api('edit',{chat:id,id:m.i,text:t}).then(r=>r.err&&snack(r.err));return}
 const tmp='t'+(++tn),m={i:tmp,f:me.id,x:t,t:now(),pend:1};if(c&&c.t=='r')m.q={i:c.m.i,f:c.m.f,x:c.m.d?'':c.m.x.slice(0,120)};
 put(S,m);render(S,1);bump(id,t);
 api('send',{chat:id,text:t,reply:c&&c.t=='r'?c.m.i:0}).then(r=>{delete S.map[tmp];S.ids=S.ids.filter(x=>x!=tmp);
  if(r.err){m.pend=0;m.fail=1;S.map[tmp]=m;S.ids.push(tmp);if(id==cur)render(S);snack(r.err);return}
  put(S,r.msg);if(id==cur)render(S,1);loadChats(1)});
 setTimeout(poll,400)};
$('.send').onpointerdown=e=>e.preventDefault();
$('#back').onclick=()=>{$('#app').classList.remove('open');cur=null;drawList()};
$('#chead').onclick=()=>{const S=ST[cur];if(!S)return;S.info.type=='g'?groupInfo(S):S.info.num&&userInfo(S.info.num)};

/* ============ hojas, menús y piezas de interfaz ============ */
function closeSheet(){$('#modal').classList.add('hidden')}
function sheet(title,build,o={}){const m=$('#modal');m.innerHTML='';const s=mk('div','sheet'+(o.full?' full':'')),h=mk('div','sh'),x=mk('button','ib sm');x.innerHTML=ic('x');x.onclick=closeSheet;h.append(mk('b','',title),x);
 const b=mk('div','sb');s.append(h,b);m.append(s);m.classList.remove('hidden');m.onclick=e=>{if(e.target==m)closeSheet()};build(b,s);return b}
const actBtn=(i,t,f,red)=>{const b=mk('button','act'+(red?' red':''));b.innerHTML=ic(i)+'<span></span>';b.querySelector('span').textContent=t;b.onclick=f;return b};
const sec=(l,v)=>{const d=mk('div','sec'),s=mk('small',null,l),t=mk('div');t.textContent=v;d.append(s,t);return d};
const field=(ph,v='',max=25,extra={})=>Object.assign(mk('input','t'),{placeholder:ph,value:v,maxLength:max},extra);
function swRow(t,sub,on,fn){const r=mk('label','srow'),d=mk('div');d.append(mk('b','',t));if(sub)d.append(mk('small','',sub));const i=Object.assign(mk('input'),{type:'checkbox',checked:!!on});i.onchange=()=>fn(i.checked);r.append(d,i,mk('span','sw'));return r}
function ask(t,x,ok,fn,red=1){sheet(t,b=>{b.append(mk('div','sub',x));const y=mk('button','btn'+(red?' dng':''),ok),n=mk('button','btn ghost','Cancelar');y.onclick=async()=>{closeSheet();await fn()};n.onclick=closeSheet;b.append(y,n)})}
async function openDirect(num,pre){const r=await api('chat',{number:num});if(r.err)return snack(r.err);closeSheet();await loadChats(1);openChat(r.id,pre)}
async function reopen(){const id=cur;if(!id)return;delete ST[id];await loadChats(1);openChat(id)}
function blockAsk(num,name){ask('¿Bloquear a '+name+'?','No recibirás sus mensajes ni verá cuándo estás en línea. Puedes desbloquearlo cuando quieras.','Bloquear',async()=>{await api('block',{number:num,on:1});CON=null;snack('Contacto bloqueado');if(cur&&ST[cur]){ST[cur].blk=1;chrome(ST[cur]);hdr(ST[cur]);poll()}loadChats(1)})}

/* ---- botón + ---- */
$('#newb').onclick=()=>{const m=$('#menu');m.innerHTML='';const p=mk('div','pop');m.append(p);m.classList.remove('hidden');m.onclick=e=>{if(e.target==m)m.classList.add('hidden')};
 [['userplus','c1','Agregar contacto','Busca a alguien por su número',addContact],['book','c2','Mis contactos','Ver, editar o eliminar',contactsSheet],['users','c3','Nuevo grupo','Elige contactos y ponle nombre',newGroup]].forEach(([i,c,t,s,f])=>{
  const b=mk('button','mi');b.innerHTML=`<span class="ico ${c}">${ic(i)}</span><span><b>${t}</b><small>${s}</small></span>`;b.onclick=()=>{m.classList.add('hidden');f()};p.append(b)})};

/* ---- contactos ---- */
async function getContacts(force){if(!CON||force){const r=await api('contacts');CON=Array.isArray(r)?r:[]}return CON}
const subOf=u=>u.pres?presTxt(u.pres):u.bio;
function crow(u,f){const r=mk('div','crow'),i=mk('div','i2'),n=mk('div','n',u.name);n.textContent=u.name;i.append(n,mk('div','l',u.blocked?'Bloqueado':subOf(u)));r.append(avd(u,'s',u.pres&&u.pres.on),i);r.onclick=f;return r}
function contactsSheet(){sheet('Contactos',async b=>{b.append(mk('div','sub','Cargando…'));const list=await getContacts(1);b.innerHTML='';
 const top=mk('button','act');top.innerHTML=ic('userplus')+'<span>Agregar contacto</span>'+ic('chev','sm');top.onclick=addContact;
 const q=field('Buscar contacto','',40);const box=mk('div');
 const draw=()=>{box.innerHTML='';const t=q.value.toLowerCase(),L=list.filter(u=>!t||u.name.toLowerCase().includes(t)||u.id.includes(t));
  if(!list.length)box.append(mk('div','sub','Todavía no tienes contactos guardados.'));else if(!L.length)box.append(mk('div','sub','Sin resultados.'));
  L.forEach(u=>{const r=crow(u,()=>openDirect(u.id,{id:'',name:u.name,photo:u.photo,type:'p',num:u.id,contact:true}));const ib=mk('button','ib sm');ib.innerHTML=ic('info');ib.onclick=e=>{e.stopPropagation();userInfo(u.id)};r.append(ib);box.append(r)})};
 q.oninput=draw;draw();b.append(top);if(list.length)b.append(q);b.append(box)})}
function addContact(){sheet('Agregar contacto',b=>{
 const n=field('Número con código (+504 9999 9999)','',20,{inputMode:'tel'}),go=mk('button','btn','Buscar'),er=mk('div','err'),res=mk('div');res.style.cssText='display:flex;flex-direction:column;gap:10px';
 const look=async()=>{er.textContent='';res.innerHTML='';const digits=n.value.replace(/\D/g,'');if(digits.length<7)return er.textContent='Escribe el número completo con código de país';
  go.disabled=true;const u=await api('user',{number:digits});go.disabled=false;if(u.err)return er.textContent=u.err;
  const card=mk('div','card');card.append(av({id:u.id,name:u.alias||u.name,photo:u.photo}),mk('b','',u.alias||u.name),mk('small','',fmt(u.id)),mk('small','',u.bio));res.append(card);
  if(u.me){res.append(mk('div','sub','Ese es tu propio número.'));return}
  if(u.contact){res.append(mk('div','sub','✓ Ya está en tus contactos'),actBtn('bubble','Enviar mensaje',()=>openDirect(u.id,{id:'',name:u.alias||u.name,photo:u.photo,type:'p',num:u.id,contact:true})),actBtn('edit','Editar o eliminar contacto',()=>userInfo(u.id)));return}
  const nm=field('Nombre para guardarlo',u.name,25);const sv=mk('button','btn','Guardar contacto'),sw=mk('button','btn ghost','Guardar y escribir');
  const save=async go2=>{const r=await api('cadd',{number:u.id,alias:nm.value.trim()===u.name?'':nm.value});if(r.err)return er.textContent=r.err;CON=null;snack(r.already?'Ya estaba en tus contactos':'Contacto guardado');
   go2?openDirect(u.id,{id:'',name:nm.value||u.name,photo:u.photo,type:'p',num:u.id,contact:true}):contactsSheet()};
  sv.onclick=()=>save(0);sw.onclick=()=>save(1);res.append(nm,sv,sw)};
 go.onclick=look;n.onkeydown=e=>{if(e.key=='Enter')look()};b.append(mk('div','sub','Escribe el número de Chaty de la persona.'),n,er,go,res);setTimeout(()=>n.focus(),50)})}
function userInfo(num){sheet('Contacto',async b=>{b.append(mk('div','sub','Cargando…'));const u=await api('user',{number:num});if(u.err){b.textContent=u.err;return}b.innerHTML='';
 const nm=u.alias||u.name,card=mk('div','card');card.append(av({id:u.id,name:nm,photo:u.photo}),mk('b','',nm));if(u.alias)card.append(mk('small','','Nombre en Chaty: '+u.name));card.append(mk('small','',fmt(u.id)));if(u.pres)card.append(mk('small','',presTxt(u.pres)));b.append(card,sec('Info.',u.bio),sec('En Chaty desde',dt(u.created)));
 if(u.me)return;
 b.append(actBtn('bubble','Enviar mensaje',()=>openDirect(u.id,{id:'',name:nm,photo:u.photo,type:'p',num:u.id,contact:u.contact})));
 if(u.contact){const al=field('Nombre del contacto',u.alias||u.name,25),sv=actBtn('edit','Guardar nombre',async()=>{const r=await api('alias',{number:u.id,alias:al.value});if(r.err)return snack(r.err);CON=null;snack('Nombre actualizado');await loadChats(1);if(cur)reopen();userInfo(num)});b.append(al,sv);
  b.append(actBtn('trash','Eliminar contacto',()=>ask('¿Eliminar a '+nm+'?','Se quita de tus contactos. Los mensajes del chat se conservan.','Eliminar',async()=>{await api('cdel',{number:u.id});CON=null;snack('Contacto eliminado');await loadChats(1);if(cur&&ST[cur]&&ST[cur].info.num==u.id)reopen()}),1))}
 else{const al=field('Guardar como',u.name,25),sv=actBtn('userplus','Agregar a mis contactos',async()=>{const r=await api('cadd',{number:u.id,alias:al.value.trim()==u.name?'':al.value});if(r.err)return snack(r.err);CON=null;snack('Contacto guardado');if(cur)reopen();userInfo(num)});b.append(al,sv)}
 b.append(actBtn('ban',u.blocked?'Desbloquear':'Bloquear',()=>u.blocked?api('block',{number:u.id,on:0}).then(()=>{CON=null;snack('Contacto desbloqueado');if(cur)reopen();closeSheet()}):blockAsk(u.id,nm),1))})}

/* ---- grupos ---- */
async function pickContacts(title,btnLabel,exclude,onDone){sheet(title,async b=>{b.append(mk('div','sub','Cargando…'));const all=(await getContacts()).filter(u=>!u.blocked&&!exclude.includes(u.id));b.innerHTML='';
 if(!all.length){b.append(mk('div','sub',CON.length?'Todos tus contactos ya están aquí.':'Primero agrega contactos para poder armar un grupo.'));if(!CON.length){const a=mk('button','btn','Agregar contacto');a.onclick=addContact;b.append(a)}return}
 const sel=new Set(),tags=mk('div','tags'),q=field('Buscar contacto','',40),box=mk('div'),go=mk('button','btn',btnLabel);go.disabled=true;
 const upd=()=>{tags.innerHTML='';sel.forEach(id=>{const u=all.find(x=>x.id==id),t=mk('button','tag2');t.append(av(u),u.name.split(' ')[0]);t.onclick=()=>{sel.delete(id);upd();draw()};tags.append(t)});tags.classList.toggle('hidden',!sel.size);go.disabled=!sel.size;go.textContent=btnLabel+(sel.size?' · '+sel.size:'')};
 const draw=()=>{box.innerHTML='';const t=q.value.toLowerCase();all.filter(u=>!t||u.name.toLowerCase().includes(t)).forEach(u=>{const r=crow(u,()=>{sel.has(u.id)?sel.delete(u.id):sel.add(u.id);upd();r.classList.toggle('on',sel.has(u.id))});r.classList.toggle('on',sel.has(u.id));const ck=mk('span','ck');ck.innerHTML=ic('check','sm');r.append(ck);box.append(r)})};
 q.oninput=draw;go.onclick=async()=>{go.disabled=true;await onDone([...sel],b)};b.append(tags,q,box,go);upd();draw()})}
function newGroup(){const key=Math.random().toString(36).slice(2)+Date.now().toString(36);let busy=0;
 sheet('Nuevo grupo',async b=>{b.append(mk('div','sub','Cargando…'));const all=(await getContacts(1)).filter(u=>!u.blocked);b.innerHTML='';
  if(!all.length){b.append(mk('div','sub','Primero agrega contactos para poder armar un grupo.'));const a=mk('button','btn','Agregar contacto');a.onclick=addContact;b.append(a);return}
  const name=field('Nombre del grupo','',30),sel=new Set(),tags=mk('div','tags'),q=field('Buscar contacto','',40),box=mk('div'),go=mk('button','btn','Crear grupo'),er=mk('div','err');
  const upd=()=>{tags.innerHTML='';sel.forEach(id=>{const u=all.find(x=>x.id==id),t=mk('button','tag2');t.append(av(u),u.name.split(' ')[0]);t.onclick=()=>{sel.delete(id);upd();draw()};tags.append(t)});tags.classList.toggle('hidden',!sel.size);go.disabled=busy||!sel.size||!name.value.trim();go.textContent='Crear grupo'+(sel.size?' · '+sel.size:'')};
  const draw=()=>{box.innerHTML='';const t=q.value.toLowerCase();all.filter(u=>!t||u.name.toLowerCase().includes(t)).forEach(u=>{const r=crow(u,()=>{sel.has(u.id)?sel.delete(u.id):sel.add(u.id);upd();r.classList.toggle('on',sel.has(u.id))});r.classList.toggle('on',sel.has(u.id));const ck=mk('span','ck');ck.innerHTML=ic('check','sm');r.append(ck);box.append(r)})};
  name.oninput=upd;q.oninput=draw;
  go.onclick=async()=>{if(busy)return;busy=1;upd();const r=await api('group',{name:name.value,members:[...sel],key});busy=0;if(r.err){er.textContent=r.err;return upd()}closeSheet();await loadChats(1);openChat(r.id)};
  b.append(name,tags,q,box,er,go);upd();draw()})}
function groupInfo(S){const g=S.info,admin=g.admin==me.id;sheet('Grupo',b=>{
 const card=mk('div','card');card.append(av({id:g.id,name:g.name}),mk('b','',g.name),mk('small','',(g.members||[]).length+' miembros'));b.append(card);
 if(g.created)b.append(sec('Creado',dt(g.created)+' por '+nameOf(S,g.admin)));
 if(admin){const n=field('Nombre del grupo',g.name,30);b.append(n,actBtn('edit','Cambiar nombre',async()=>{const r=await api('gname',{chat:g.id,name:n.value});if(r.err)return snack(r.err);snack('Nombre actualizado');closeSheet();reopen()}),
  actBtn('userplus','Agregar participantes',()=>pickContacts('Agregar al grupo','Agregar',(g.members||[]).map(u=>u.id),async(ids,bb)=>{const r=await api('gadd',{chat:g.id,members:ids});if(r.err){snack(r.err);return closeSheet()}closeSheet();snack('Participantes agregados');reopen()})))}
 b.append(mk('div','grp','Participantes'));
 (g.members||[]).forEach(u=>{const r=crow({id:u.id,name:u.id==me.id?'Tú':u.name,photo:u.photo,bio:fmt(u.id)},()=>u.id!=me.id&&userInfo(u.id));if(u.admin)r.querySelector('.n').append(mk('span','pill','Admin'));
  if(admin&&u.id!=me.id){const x=mk('button','ib sm');x.innerHTML=ic('x');x.onclick=e=>{e.stopPropagation();ask('¿Quitar a '+u.name+'?','Ya no podrá ver los mensajes nuevos del grupo.','Quitar',async()=>{const r2=await api('gdel',{chat:g.id,number:u.id});if(r2.err)return snack(r2.err);snack('Participante eliminado');reopen()})};r.append(x)}b.append(r)});
 b.append(actBtn('logout','Salir del grupo',()=>ask('¿Salir del grupo?','Dejarás de recibir sus mensajes.','Salir',async()=>{const r=await api('gdel',{chat:g.id});if(r.err)return snack(r.err);delete ST[g.id];leaveView();loadChats(1)}),1))})}

/* ---- perfil y ajustes ---- */
function blockedSheet(){sheet('Bloqueados',async b=>{b.append(mk('div','sub','Cargando…'));const L=await api('blocked');b.innerHTML='';if(!Array.isArray(L)||!L.length){b.append(mk('div','sub','No tienes contactos bloqueados.'));return}
 L.forEach(u=>{const r=crow({...u,bio:fmt(u.id)},()=>{}),x=mk('button','ib sm');x.innerHTML=ic('ban');x.style.color='var(--red)';x.title='Desbloquear';x.onclick=async()=>{await api('block',{number:u.id,on:0});CON=null;snack('Desbloqueado');r.remove();if(cur)poll()};r.append(x);b.append(r)})})}
function profile(){sheet('Mi perfil',b=>{
 const n=field('Nombre',me.name,25),bio=field('Info.',me.bio||'',80),f=Object.assign(mk('input'),{type:'file',accept:'image/*',hidden:true,id:'pf'});let pv=av(me);
 const pav=mk('div','pav'),lb=mk('label');lb.htmlFor='pf';lb.innerHTML=ic('camera','sm');pav.append(pv,lb,f);
 f.onchange=()=>{if(f.files[0]){const i=mk('img','av');i.src=URL.createObjectURL(f.files[0]);pv.replaceWith(i);pv=i}};
 const save=mk('button','btn','Guardar cambios');save.onclick=async()=>{const d={name:n.value,bio:bio.value};if(f.files[0])d.photo=f.files[0];const r=await api('profile',d);if(r.err)return snack(r.err);me=r;head();snack('Perfil actualizado');loadChats(1)};
 const num=mk('button','srow');num.innerHTML=`<div><b>${fmt(me.id)}</b><small>Tu número · toca para copiar</small></div>${ic('copy')}`;num.onclick=()=>{try{navigator.clipboard.writeText(fmt(me.id));snack('Número copiado')}catch(e){}};
 b.append(mk('div','cover'),pav,mk('div','big',me.name),n,bio,save,num,
  mk('div','grp','Privacidad'),swRow('Mostrar "en línea" y última vez','Si lo apagas, tampoco verás el de los demás',me.ps,async v=>{const r=await api('profile',{ps:v?1:0});if(!r.err)me=r}),
  swRow('Confirmación de lectura','El visto azul (✓✓). Si lo apagas, tampoco verás el de los demás',me.rr,async v=>{const r=await api('profile',{rr:v?1:0});if(!r.err)me=r}),
  actBtn('ban','Contactos bloqueados',blockedSheet),
  mk('div','grp','Notificaciones'),swRow('Avisos dentro de la app','Tarjeta arriba cuando llega un mensaje',pref('cb'),v=>setPref('cb',v)),swRow('Sonido','Un sonidito al recibir mensajes',pref('cs'),v=>setPref('cs',v)));
 if(pushOK()){const pr=swRow('Notificaciones del sistema','Aunque tengas la app cerrada (opcional)',pushOn,async v=>{if(v){const ok=await enablePush();if(!ok)pr.querySelector('input').checked=false}else{try{const reg=await navigator.serviceWorker.getRegistration(),sb=reg&&await reg.pushManager.getSubscription();if(sb){await api('unpush',{endpoint:sb.endpoint});await sb.unsubscribe()}pushOn=false}catch(e){}}});b.append(pr)}
 const seg=mk('div','seg'),cur0=document.documentElement.dataset.theme;[['dark','moon','Oscuro'],['light','sun','Claro']].forEach(([t,i,l])=>{const x=mk('button',t==cur0?'on':'');x.innerHTML=ic(i,'sm')+l;x.onclick=()=>{theme(t);[...seg.children].forEach(y=>y.classList.toggle('on',y==x))};seg.append(x)});
 const out=actBtn('logout','Cerrar sesión',async()=>{try{const reg=await navigator.serviceWorker.getRegistration(),sb=reg&&await reg.pushManager.getSubscription();if(sb){await api('unpush',{endpoint:sb.endpoint});await sb.unsubscribe()}}catch(e){}await api('logout');location.reload()},1);
 b.append(mk('div','grp','Apariencia'),seg,mk('div','grp',''),out)},{full:true})}
$('#prof').onclick=profile;$('#th1').onclick=()=>theme(document.documentElement.dataset.theme=='dark'?'light':'dark');
theme(document.documentElement.dataset.theme);eInit();start();

const $=s=>document.querySelector(s);
const ic=(n,c='')=>`<svg class="i ${c}"><use href="#i-${n}"/></svg>`;
const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
let pref=LS.get('ct')||'dark',cfg={sound:LS.get('cs')!=='0',banner:LS.get('cb')!=='0'};
const isDark=()=>pref=='dark'||(pref=='auto'&&!matchMedia('(prefers-color-scheme:light)').matches);
function theme(p){if(p)pref=p;LS.set('ct',pref);const d=isDark();document.documentElement.dataset.theme=d?'dark':'light';[$('#th1'),$('#th2')].forEach(b=>b&&(b.innerHTML=ic(d?'sun':'moon')));const tc=document.querySelector('meta[name=theme-color]');tc&&tc.setAttribute('content',d?'#000000':'#ffffff')}
const tog=()=>{theme(isDark()?'light':'dark');if(tab=='set')drawSettings()};
let me,chats=[],contacts=[],cur=null,CT=[],pickN=null,ST={},ctx=null,tn=0,lastL='',pbusy=0,tab='chats',cInit=0,lastTyp=0;
const now=()=>Date.now()/1e3|0;
function shrink(file,S=256){return new Promise(ok=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),m=Math.min(im.width,im.height);x.fillStyle='#fff';x.fillRect(0,0,S,S);x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,S,S);ok(c.toDataURL('image/jpeg',.82))};im.onerror=()=>ok('');im.src=URL.createObjectURL(file)})}
async function api(a,d={}){try{const o={a};for(const k in d)o[k]=d[k] instanceof File?await shrink(d[k]):d[k];
 const r=await fetch('/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)});const j=await r.json();if(r.status==401&&me)location.reload();return j}catch(e){return{err:'Sin conexión'}}}
const cols=['#e07a5f','#6c63ff','#2a9d8f','#d6578a','#3a86ff','#e5575b','#d98e1f','#3d9bd6'];
const hue=id=>[...String(id)].reduce((a,c)=>a+c.charCodeAt(0),0);
function av(u,cls=''){if(u.photo){const i=document.createElement('img');i.src=u.photo;i.className='av '+cls;return i}
 const d=document.createElement('div');d.className='av '+cls;d.style.background=cols[hue(u.id)%cols.length];d.style.backgroundImage='linear-gradient(160deg,#ffffff3d,#00000026)';d.textContent=([...(u.name||'?')][0]||'?').toUpperCase();return d}
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
function avd(u,on,cls=''){const w=mk('div','avw');w.append(av(u,cls));if(on)w.append(mk('i','dot'));return w}
const fmt=n=>'+'+n,hm=t=>new Date(t*1e3).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
const dk=t=>{const d=new Date(t*1e3);return d.getFullYear()*400+d.getMonth()*31+d.getDate()};
const dayLabel=t=>dk(t)==dk(now())?'Hoy':dk(t)==dk(now()-86400)?'Ayer':new Date(t*1e3).toLocaleDateString([],{day:'numeric',month:'long',year:'numeric'});
const ftime=t=>dk(t)==dk(now())?hm(t):dk(t)==dk(now()-86400)?'Ayer':new Date(t*1e3).toLocaleDateString([],{day:'2-digit',month:'2-digit',year:'2-digit'});
const seenTxt=t=>dk(t)==dk(now())?'hoy a las '+hm(t):dk(t)==dk(now()-86400)?'ayer a las '+hm(t):new Date(t*1e3).toLocaleDateString([],{day:'numeric',month:'short'});
const badge=(s,n)=>{const e=$(s);e.textContent=n>99?'99+':n;e.classList.toggle('hidden',!n)};

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

/* ---- inicio ---- */
async function start(){loadCountries();const m=await api('me');if(m.err)return showAuth(0);me=m;
 $('#auth').classList.add('hidden');$('#app').classList.remove('hidden');$('#splash').classList.add('hidden');
 await loadChats(1);cInit=1;setTab(tab);pushInit();api('ping');
 const c=new URLSearchParams(location.search).get('chat');if(c){history.replaceState(null,'','/');openChat(c)}}
function setTab(t){tab=t;const T={chats:'Chats',contacts:'Contactos',set:'Ajustes'};$('#stitle').textContent=T[t];
 [['chats','#vchats'],['contacts','#vcontacts'],['set','#vset']].forEach(([k,s])=>$(s).classList.toggle('hidden',k!=t));
 [...$('#tabs').children].forEach(b=>b.classList.toggle('on',b.dataset.t==t));$('#newb').classList.toggle('hidden',t=='set');
 if(t=='contacts')loadContacts();if(t=='set')drawSettings()}
/* ---- avisos dentro de la página ---- */
let AC,bt;
function ping(){if(!cfg.sound)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume&&AC.resume();const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type='sine';o.frequency.setValueAtTime(880,t);o.frequency.exponentialRampToValueAtTime(1320,t+.09);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.28);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.3)}catch(e){}}
function toast(node){const t=$('#toast');t.innerHTML='';t.append(node);t.classList.add('show');clearTimeout(bt);bt=setTimeout(()=>t.classList.remove('show'),4800)}
function flash(txt){const b=mk('div','bn sm',txt);toast(b);clearTimeout(bt);bt=setTimeout(()=>$('#toast').classList.remove('show'),2200)}
function notice(c){ping();if(navigator.vibrate)navigator.vibrate(40);if(!cfg.banner)return;const b=mk('div','bn'),i=mk('div','i2'),s=mk('span');rich(s,String(c.last.x).slice(0,90));i.append(mk('b',null,c.name),s);b.append(av(c,'s'),i);
 b.onclick=()=>{$('#toast').classList.remove('show');setTab('chats');openChat(c.id)};toast(b)}
/* ---- lista de chats ---- */
async function loadChats(force){const r=await api('chats');if(!Array.isArray(r))return;
 if(cInit)r.forEach(c=>{const o=chats.find(x=>x.id==c.id),li=c.last&&c.last.i;if(li&&c.last.f!=me.id&&c.unread>0&&(!o||!o.last||o.last.i<li)&&(cur!=c.id||document.hidden))notice(c)});
 const tot=r.reduce((a,c)=>a+c.unread,0);document.title=tot?`(${tot}) Chaty`:'Chaty';badge('#tbc',tot);
 const s=JSON.stringify(r);if(s===lastL&&!force)return;lastL=s;chats=r;drawList()}
const nothing=t=>{const d=mk('div','l',t);d.style.cssText='padding:28px 24px;text-align:center;color:var(--m)';return d};
function drawList(){const L=$('#list'),f=($('#qs').value||'').toLowerCase();L.innerHTML='';
 const arr=chats.filter(c=>!f||c.name.toLowerCase().includes(f)||String(c.num||'').includes(f));
 if(!arr.length)L.append(nothing(chats.length?'Sin resultados':'Aún no tienes chats. Toca + para empezar.'));
 arr.forEach(c=>{const row=mk('div','row'+(cur==c.id?' on':'')),i=mk('div','i2'),nm=mk('div','n',c.name);if(c.type!='p')nm.insertAdjacentHTML('beforeend',ic('users','sm'));i.append(nm);
  const l=c.last?(c.last.f=='sys'?c.last.x:(c.last.f==me.id?'Tú: ':'')+c.last.x):(c.type=='p'?fmt(c.num):'Grupo nuevo');i.append(mk('div','l'+(c.unread?' u':''),l));
  const rt=mk('div','rt');rt.append(mk('div','tm'+(c.unread?' u':''),c.last?ftime(c.last.t):''));if(c.unread)rt.append(mk('i','bdg',c.unread>99?'99+':c.unread));
  row.append(avd(c,c.online),i,rt);row.onclick=()=>openChat(c.id);L.append(row)})}
function bump(id,t){const c=chats.find(x=>x.id==id);if(!c)return;c.last={i:0,f:me.id,x:t,t:now()};c.ts=now();chats.sort((a,b)=>b.ts-a.ts);lastL='';drawList()}
/* ---- contactos ---- */
async function loadContacts(){const r=await api('contacts');if(Array.isArray(r)){contacts=r;drawContacts()}}
function drawContacts(){const L=$('#clist'),f=($('#qc').value||'').toLowerCase();L.innerHTML='';
 const arr=contacts.filter(c=>!f||c.name.toLowerCase().includes(f)||c.id.includes(f));
 if(!arr.length)L.append(nothing(contacts.length?'Sin resultados':'Aún no tienes contactos. Toca "Agregar contacto".'));
 arr.forEach(c=>{const row=mk('div','row'),i=mk('div','i2');i.append(mk('div','n',c.name+(c.blocked?' · bloqueado':'')),mk('div','l',c.real&&c.real!=c.name?c.real+' · '+fmt(c.id):fmt(c.id)));
  const inf=mk('button','ib sm');inf.innerHTML=ic('info');inf.onclick=e=>{e.stopPropagation();userInfo(c.id)};
  row.append(avd(c,c.online),i,inf);row.onclick=()=>openWith(c);L.append(row)})}
async function openWith(u){const r=await api('add',{number:u.id});if(r.err)return info(r.err);setTab('chats');openChat(r.id,{type:'p',name:u.name,photo:u.photo,num:u.id})}
/* ---- ajustes ---- */
function sw(on,fn){const b=mk('button','sw'+(on?' on':''));b.type='button';b.onclick=()=>{const v=!b.classList.contains('on');b.classList.toggle('on',v);fn(v)};return b}
function rw(icon,label,right,fn,cls){const r=mk('div','rw'+(fn?' tap':'')+(cls?' '+cls:''));r.insertAdjacentHTML('afterbegin',ic(icon));r.append(mk('span','rl',label));if(right)r.append(right);if(fn)r.onclick=fn;return r}
function grp(title,...rows){const w=mk('div','gw');if(title)w.append(mk('div','gt',title));const g=mk('div','grp');g.append(...rows);w.append(g);return w}
function drawSettings(){const V=$('#vset');V.innerHTML='';
 const card=mk('div','pcard'),pw=mk('div','pw'),pv=av(me,'xl'),cam=mk('button','cam'),f=Object.assign(mk('input'),{type:'file',accept:'image/*'});f.hidden=true;cam.type='button';cam.innerHTML=ic('camera');
 cam.onclick=()=>f.click();f.onchange=async()=>{if(!f.files[0])return;const r=await api('profile',{photo:f.files[0]});if(!r.err){me=r;drawSettings();loadChats(1);flash('Foto actualizada')}};pw.append(pv,cam,f);
 const nm=Object.assign(mk('input'),{value:me.name,maxLength:25,placeholder:'Tu nombre'}),bio=Object.assign(mk('input'),{value:me.bio||'',maxLength:80,placeholder:'Info.'});
 const saveP=async()=>{const r=await api('profile',{name:nm.value,bio:bio.value});if(r.err)return flash(r.err);me=r;flash('Perfil guardado')};
 const chips=mk('div','schips');['Disponible','Ocupado','En el cine','En el gym','Durmiendo','Solo mensajes'].forEach(t=>{const c=mk('button','sch',t);c.type='button';c.onclick=()=>{bio.value=t;saveP()};chips.append(c)});
 const nb=mk('button','lnk');nb.type='button';nb.textContent=fmt(me.id)+' · Copiar';nb.onclick=()=>{try{navigator.clipboard.writeText(fmt(me.id))}catch(e){}nb.textContent='¡Copiado!'};
 const sv=mk('button','btn sm','Guardar');sv.onclick=saveP;card.append(pw,nm,bio,chips,nb,sv);V.append(card);
 const seg=mk('div','tabs');[['dark','Oscuro'],['light','Claro'],['auto','Auto']].forEach(([k,t])=>{const b=mk('button',pref==k?'on':'',t);b.type='button';b.onclick=()=>{theme(k);drawSettings()};seg.append(b)});
 V.append(grp('Apariencia',seg));
 const pr=mk('span','rv',('Notification' in window&&Notification.permission==='granted')?'Activadas':'Activar');pr.insertAdjacentHTML('beforeend',ic('chev'));
 V.append(grp('Notificaciones',rw('bell','Sonido de mensajes',sw(cfg.sound,v=>{cfg.sound=v;LS.set('cs',v?'1':'0')})),rw('bubble','Avisos dentro de la página',sw(cfg.banner,v=>{cfg.banner=v;LS.set('cb',v?'1':'0')})),rw('phone','Notificaciones del teléfono',pr,async()=>{await enablePush();drawSettings()})));
 V.append(grp('Privacidad',rw('clock','Mostrar "en línea" y "última vez"',sw(!me.hs,async v=>{const r=await api('profile',{hs:v?0:1});if(!r.err)me=r})),rw('checks','Confirmaciones de lectura',sw(!me.hr,async v=>{const r=await api('profile',{hr:v?0:1});if(!r.err)me=r})),rw('block','Contactos bloqueados',(()=>{const s=mk('span','rv');s.insertAdjacentHTML('beforeend',ic('chev'));return s})(),blockedList)));
 V.append(grp('Cuenta',rw('logout','Cerrar sesión',null,logout,'red')))}
async function logout(){try{const reg=await navigator.serviceWorker.getRegistration(),sb=reg&&await reg.pushManager.getSubscription();if(sb){await api('unpush',{endpoint:sb.endpoint});await sb.unsubscribe()}}catch(e){}await api('logout');location.reload()}

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

/* ---- chat ---- */
const tstate=(S,m)=>{if(m.pend)return 0;if(me.hr)return 1;const R=S.reads||{},inf=S.info;
 if(inf.type=='p')return R[inf.num]!=null&&R[inf.num]>=m.i?2:1;
 const o=(inf.members||[]).map(u=>u.id).filter(u=>u!=me.id);return o.length&&o.every(u=>R[u]!=null&&R[u]>=m.i)?2:1};
function setTick(k,s){k.dataset.s=s;k.className='tk s'+s;k.innerHTML=ic(s==2?'checks':s==1?'check':'clock')}
function refreshTicks(S){const M=$('#msgs');S.ids.forEach(i=>{const m=S.map[i];if(m.f!=me.id||m.d)return;const e=M.querySelector(`[data-i="${i}"] .tk`),s=tstate(S,m);if(e&&e.dataset.s!=s)setTick(e,s)})}
function hdr(c){$('#cname').textContent=c.name||'';$('#cav').replaceChildren(av(c,'s'))}
function setStatus(S){const i=S.info,e=$('#csub');let t='',on=0;
 if(S.typing&&S.typing.length){t=i.type=='g'?S.typing.map(u=>(S.users[u]||{}).name||fmt(u)).join(', ')+' escribiendo…':'escribiendo…';on=1}
 else if(i.type=='g')t=(i.members?i.members.length:i.count||0)+' miembros';
 else{const p=S.peer;if(p&&p.online){t='en línea';on=1}else if(p&&p.seen)t='últ. vez '+seenTxt(p.seen);else t=i.num?fmt(i.num):''}
 e.textContent=t;e.classList.toggle('on',!!on)}
function composer(S){const bl=!!(S.peer&&S.peer.bl);$('#bar').classList.toggle('hidden',bl);$('#blkbar').classList.toggle('hidden',!bl)}
function openChat(id,pre){cur=id;const c=chats.find(x=>x.id==id)||pre||{id,name:''};const S=ST[id]=ST[id]||{map:{},ids:[],rev:0,users:{},info:Object.assign({id},c),reads:{},typing:[],readSent:0};
 $('#empty').classList.add('hidden');$('#chat').classList.remove('hidden');$('#app').classList.add('open');$('#emo').classList.add('hidden');ctxSet(null);$('#mi').value='';sendState();
 hdr(S.info);setStatus(S);composer(S);const M=$('#msgs');M.innerHTML='';
 S.ids.forEach((i,k)=>{const m=S.map[i],p=S.map[S.ids[k-1]];if(!p||dk(p.t)!=dk(m.t))M.append(mk('div','day',dayLabel(m.t)));M.append(bubble(S,m))});M.scrollTop=M.scrollHeight;drawList();poll()}
function closeChat(hard){$('#app').classList.remove('open');cur=null;if(hard){$('#chat').classList.add('hidden');$('#empty').classList.remove('hidden')}drawList()}
const reopen=id=>{delete ST[id];if(cur==id)openChat(id)};
const nameOf=(S,f)=>f==me.id?'Tú':(S.users[f]||{}).name||fmt(f);
function bubble(S,m){
 if(m.f=='sys'){const s=mk('div','sys',m.x);s.dataset.i=m.i;return s}
 const mine=m.f==me.id,b=mk('div','m'+(mine?' me':'')+(m.d?' del':'')+(m.pend?' pend':''));b.dataset.i=m.i;
 if(S.info.type=='g'&&!mine){const w=mk('div','w',nameOf(S,m.f));w.style.color=cols[hue(m.f)%cols.length];b.append(w)}
 if(m.q&&!m.d){const q=mk('div','q'),o=S.map[m.q.i],t=mk('span');q.append(mk('b','',nameOf(S,m.q.f)),t);rich(t,o&&o.d||!m.q.x?'Mensaje eliminado':m.q.x);
  q.onclick=e=>{e.stopPropagation();const el=$('#msgs').querySelector(`[data-i="${m.q.i}"]`);if(el){el.scrollIntoView({block:'center'});el.classList.add('hl');setTimeout(()=>el.classList.remove('hl'),1200)}};b.append(q)}
 const t=mk('div','bt');m.d?t.textContent='Se eliminó este mensaje':rich(t,m.x);
 const h=mk('div','h');h.append((m.fail?'No enviado · ':m.e?'editado · ':'')+hm(m.t));if(mine&&!m.d){const k=mk('span','tk');setTick(k,m.fail?0:tstate(S,m));h.append(k)}
 b.append(t,h);b.onclick=()=>menu(S,m);return b}
function put(S,m){const M=$('#msgs'),o=M.querySelector(`[data-i="${m.i}"]`);
 if(m.gone){delete S.map[m.i];S.ids=S.ids.filter(x=>x!=m.i);o&&o.remove();return}
 const e=bubble(S,m);if(o){S.map[m.i]=m;o.replaceWith(e);return}
 if(S.map[m.i])return;const p=S.map[S.ids[S.ids.length-1]];if(!p||dk(p.t)!=dk(m.t))M.append(mk('div','day',dayLabel(m.t)));
 if(S.ready)e.classList.add('pop');S.map[m.i]=m;S.ids.push(m.i);M.append(e)}
function markRead(S){if(document.hidden||S!==ST[cur])return;let mx=0;S.ids.forEach(i=>{const m=S.map[i];if(typeof i=='number'&&m.f!=me.id&&m.f!='sys'&&i>mx)mx=i});
 if(mx>S.readSent){S.readSent=mx;api('read',{chat:cur,upto:mx}).then(()=>{const c=chats.find(x=>x.id==S.info.id);if(c&&c.unread){c.unread=0;lastL='';drawList();badge('#tbc',chats.reduce((a,x)=>a+x.unread,0))}})}}
async function poll(){if(!cur||pbusy)return;pbusy=1;const id=cur,S=ST[id],r=await api('msgs',{chat:id,since:S.rev});pbusy=0;
 if(r.err){if(r.err=='Chat no encontrado'&&id==cur)closeChat(true);return}if(id!=cur)return;
 if(r.users){S.users=r.users;S.info=r.info;hdr(r.info)}
 S.reads=r.reads||{};S.typing=r.typing||[];if(r.peer)S.peer=r.peer;
 if(r.msgs.length||!S.ready){const M=$('#msgs'),bot=!S.ready||M.scrollHeight-M.scrollTop-M.clientHeight<140;r.msgs.forEach(m=>put(S,m));if(bot)M.scrollTop=M.scrollHeight}
 S.rev=r.rev;S.ready=1;setStatus(S);composer(S);refreshTicks(S);markRead(S)}
(function tick(){poll();setTimeout(tick,document.hidden?6000:1300)})();
setInterval(()=>{if(me)loadChats()},3000);setInterval(()=>{if(me&&!document.hidden)api('ping')},25000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){poll();loadChats();api('ping')}});
/* ---- responder / editar ---- */
function ctxSet(t,m,keep){const was=ctx;ctx=t?{t,m}:null;$('#rbar').classList.toggle('hidden',!t);
 if(t){const S=ST[cur];$('#rwho').textContent=t=='e'?'Editando mensaje':nameOf(S,m.f);rich($('#rtxt'),m.x.slice(0,120));if(t=='e'){$('#mi').value=m.x;sendState()}$('#mi').focus()}
 else if(was&&was.t=='e'&&!keep){$('#mi').value='';sendState()}}
$('#rx').onclick=()=>ctxSet(null);
function menu(S,m){if(String(m.i)[0]=='t'||m.f=='sys')return;const mine=m.f==me.id,age=now()-m.t,L=[];
 if(!m.d){L.push(['reply','Responder',()=>ctxSet('r',m)]);L.push(['copy','Copiar',()=>{try{navigator.clipboard.writeText(m.x)}catch(e){}}])}
 if(mine&&!m.d&&age<900)L.push(['edit','Editar',()=>ctxSet('e',m)]);
 L.push(['trash','Eliminar para mí',()=>del(m,'me'),1]);
 if(mine&&!m.d&&age<172800)L.push(['trash','Eliminar para todos',()=>del(m,'all'),1]);actions(L)}
function del(m,mode){const S=ST[cur],id=cur;if(mode=='me')put(S,{i:m.i,gone:1});else{m.d=1;m.x='';delete m.q;put(S,m)}
 api('del',{chat:id,id:m.i,mode}).then(r=>{if(r.err)flash(r.err);loadChats(1)})}
$('#bar').onsubmit=e=>{e.preventDefault();const inp=$('#mi'),t=inp.value.trim();if(!t||!cur)return;const S=ST[cur],id=cur,c=ctx;inp.value='';sendState();ctxSet(null,null,1);
 if(c&&c.t=='e'){const m=c.m;m.x=t;m.e=now();put(S,m);api('edit',{chat:id,id:m.i,text:t}).then(r=>r.err&&flash(r.err));return}
 const tmp='t'+(++tn),m={i:tmp,f:me.id,x:t,t:now(),pend:1};if(c&&c.t=='r')m.q={i:c.m.i,f:c.m.f,x:c.m.d?'':c.m.x.slice(0,120)};
 put(S,m);const M=$('#msgs');M.scrollTop=M.scrollHeight;bump(id,t);
 api('send',{chat:id,text:t,reply:c&&c.t=='r'?c.m.i:0}).then(r=>{delete S.map[tmp];S.ids=S.ids.filter(x=>x!=tmp);const el=M.querySelector(`[data-i="${tmp}"]`);
  if(r.err){if(el){m.pend=0;m.fail=1;el.replaceWith(bubble(S,m))}flash(r.err);return}
  if(el)el.remove();if(id==cur){put(S,r.msg);M.scrollTop=M.scrollHeight}});
 setTimeout(poll,350)};
$('#mi').oninput=()=>{sendState();const n=Date.now();if(cur&&$('#mi').value&&n-lastTyp>3000){lastTyp=n;api('typing',{chat:cur})}};
$('.send').onpointerdown=e=>e.preventDefault();
$('#back').onclick=()=>closeChat();
/* ---- hojas / modales ---- */
const modal=h=>{const m=$('#modal');m.innerHTML='';const s=mk('div','sheet');m.append(s);m.classList.remove('hidden');m.onclick=e=>{if(e.target==m)closeModal()};h(s);return s};
const closeModal=()=>$('#modal').classList.add('hidden');
const big=u=>{const a=av(u);a.style.cssText+=';width:96px;height:96px;font-size:2.4rem;align-self:center';return a};
const sec=(l,v)=>{const d=mk('div','sec'),s=mk('small',null,l),t=mk('div');t.textContent=v;d.append(s,t);return d};
const dt=t=>new Date(t*1e3).toLocaleDateString([],{day:'numeric',month:'long',year:'numeric'});
function actions(L){modal(s=>L.forEach(([i,t,f,red])=>{const b=mk('button','act'+(red?' red':''));b.insertAdjacentHTML('afterbegin',ic(i));b.append(mk('span',null,t));b.onclick=()=>{closeModal();f()};s.append(b)}))}
function confirmSheet(txt,label,fn){modal(s=>{s.append(mk('div','sub',txt));const b=mk('button','act red');b.append(mk('span',null,label));b.onclick=()=>{closeModal();fn()};const c=mk('button','btn sec','Cancelar');c.onclick=closeModal;s.append(b,c)})}
async function refreshAfterContact(){await loadContacts();await loadChats(1);const S=ST[cur];if(S&&S.info.num)reopen(cur)}
function userInfo(num){modal(s=>{s.append(mk('div','sub','Cargando…'));api('user',{number:num}).then(u=>{if(u.err){s.textContent=u.err;return}s.innerHTML='';
 const nm=u.saved||u.name;s.append(big({id:u.id,name:nm,photo:u.photo}),mk('div','big',nm));if(u.saved&&u.saved!=u.name)s.append(mk('div','sub','~ '+u.name));
 const pr=u.online?'en línea':u.seen?'últ. vez '+seenTxt(u.seen):'';if(pr)s.append(mk('div','sub'+(u.online?' on':''),pr));
 s.append(sec('Número',fmt(u.id)),sec('Info.',u.bio),sec('En Chaty desde',dt(u.created)));
 const go=mk('button','btn','Enviar mensaje');go.onclick=()=>{closeModal();openWith({id:u.id,name:nm,photo:u.photo})};s.append(go);
 const al=Object.assign(mk('input'),{value:u.saved||'',placeholder:u.inContacts?'Nombre guardado':'Nombre para guardarlo',maxLength:25}),sv=mk('button','btn sec',u.inContacts?'Guardar nombre':'Agregar a contactos'),er=mk('div','err');
 sv.onclick=async()=>{const r=await api(u.inContacts?'cedit':'cadd',{number:u.id,name:al.value});if(r.err)return er.textContent=r.err;closeModal();flash(u.inContacts?'Nombre guardado':'Contacto guardado');refreshAfterContact()};
 s.append(al,er,sv);
 if(u.inContacts){const d=mk('button','act red');d.insertAdjacentHTML('afterbegin',ic('trash'));d.append(mk('span',null,'Eliminar contacto'));d.onclick=()=>confirmSheet('¿Eliminar a '+nm+' de tus contactos? Los chats se conservan.','Eliminar contacto',async()=>{await api('cdel',{number:u.id});flash('Contacto eliminado');refreshAfterContact()});s.append(d)}
 const bk=mk('button','act red');bk.insertAdjacentHTML('afterbegin',ic('block'));bk.append(mk('span',null,u.blocked?'Desbloquear':'Bloquear'));bk.onclick=()=>{closeModal();toggleBlock(u.id,!u.blocked)};s.append(bk)})})}
async function toggleBlock(num,on){const r=await api('block',{number:num,on:on?1:0});if(r.err)return flash(r.err);flash(on?'Contacto bloqueado':'Contacto desbloqueado');poll();loadChats(1);if(tab=='contacts')loadContacts()}
$('#unblk').onclick=()=>{const S=ST[cur];S&&S.info.num&&toggleBlock(S.info.num,false)};
function blockedList(){modal(s=>{s.append(mk('div','big','Contactos bloqueados'));const box=mk('div');s.append(box);
 api('blocked').then(r=>{if(!Array.isArray(r))return;if(!r.length)return box.append(nothing('No has bloqueado a nadie.'));r.forEach(u=>{const row=mk('div','mem'),i=mk('div','i2'),sb=mk('div','sub',fmt(u.id));sb.style.textAlign='left';i.append(mk('b',null,u.name),sb);
  const b=mk('button','btn sm sec','Desbloquear');b.onclick=async()=>{await api('block',{number:u.id,on:0});row.remove();flash('Desbloqueado');loadChats(1)};row.append(av(u,'s'),i,b);box.append(row)})})})}
/* ---- selector de personas (grupos) ---- */
function picker(s,o){const sel=new Set(),extra=[],box=mk('div','pick-list'),q=Object.assign(mk('input'),{placeholder:'Buscar o escribir un número'}),btn=mk('button','btn',o.label+' (0)'),er=mk('div','err');
 const upd=()=>{btn.textContent=o.label+' ('+sel.size+')'};
 const draw=()=>{box.innerHTML='';const f=q.value.toLowerCase();[...contacts,...extra].filter(c=>!o.exclude.includes(c.id)&&(!f||c.name.toLowerCase().includes(f)||c.id.includes(f))).forEach(c=>{const r=mk('div','mem'),i=mk('div','i2'),sb=mk('div','sub',fmt(c.id)),ck=mk('i','ck'+(sel.has(c.id)?' on':''));sb.style.textAlign='left';i.append(mk('b',null,c.name),sb);r.append(av(c,'s'),i,ck);r.onclick=()=>{sel.has(c.id)?sel.delete(c.id):sel.add(c.id);upd();draw()};box.append(r)});if(!box.children.length)box.append(nothing('Sin resultados. Escribe un número y presiona Enter.'))};
 q.oninput=draw;q.onkeydown=async e=>{if(e.key!='Enter')return;e.preventDefault();const n=q.value.replace(/\D/g,'');if(n.length<7)return;const u=await api('user',{number:n});if(u.err)return er.textContent=u.err;er.textContent='';
  if(u.id!=me.id&&!o.exclude.includes(u.id)){if(![...contacts,...extra].some(c=>c.id==u.id))extra.push({id:u.id,name:u.saved||u.name,photo:u.photo});sel.add(u.id);upd()}q.value='';draw()};
 btn.onclick=()=>o.onDone([...sel],btn,er);s.append(q,box,er,btn);draw()}
function newChat(){loadContacts().then(()=>modal(s=>{s.append(mk('div','big','Nuevo chat'));const q=Object.assign(mk('input'),{placeholder:'Buscar contacto'}),box=mk('div','pick-list');
 const draw=()=>{box.innerHTML='';const f=q.value.toLowerCase();const arr=contacts.filter(c=>!f||c.name.toLowerCase().includes(f)||c.id.includes(f));
  if(!arr.length)box.append(nothing(contacts.length?'Sin resultados':'Aún no tienes contactos.'));
  arr.forEach(c=>{const r=mk('div','mem'),i=mk('div','i2'),sb=mk('div','sub',fmt(c.id));sb.style.textAlign='left';i.append(mk('b',null,c.name),sb);r.append(avd(c,c.online,'s'),i);r.onclick=()=>{closeModal();openWith(c)};box.append(r)})};
 q.oninput=draw;const a1=mk('button','act');a1.insertAdjacentHTML('afterbegin',ic('userplus'));a1.append(mk('span',null,'Agregar contacto'));a1.onclick=()=>addContact();const a2=mk('button','act');a2.insertAdjacentHTML('afterbegin',ic('users'));a2.append(mk('span',null,'Nuevo grupo'));a2.onclick=newGroup;
 s.append(a1,a2,q,box);draw()}))}
function newGroup(){loadContacts().then(()=>modal(s=>{s.append(mk('div','big','Nuevo grupo'));const name=Object.assign(mk('input'),{placeholder:'Nombre del grupo',maxLength:30});s.append(name,mk('div','hint','Elige contactos o escribe un número y presiona Enter.'));
 picker(s,{exclude:[],label:'Crear grupo',onDone:async(ids,btn,er)=>{if(btn.disabled)return;if(!name.value.trim())return er.textContent='Ponle nombre al grupo';if(!ids.length)return er.textContent='Elige al menos una persona';
  btn.disabled=true;const r=await api('group',{name:name.value,members:ids});if(r.err){btn.disabled=false;return er.textContent=r.err}closeModal();await loadChats(1);setTab('chats');openChat(r.id)}})}))}
function addContact(){modal(s=>{s.append(mk('div','big','Agregar contacto'));const n=Object.assign(mk('input'),{placeholder:'Número (+504 9999 9999)',inputMode:'tel'}),nm=Object.assign(mk('input'),{placeholder:'Nombre (opcional)',maxLength:25}),er=mk('div','err'),go=mk('button','btn','Guardar contacto');
 const done=(title,sub,r)=>{s.innerHTML='';s.append(mk('div','big',title),mk('div','sub',sub));const o=mk('button','btn','Enviar mensaje');o.onclick=()=>{closeModal();openWith({id:r.id,name:r.name})};s.append(o)};
 go.onclick=async()=>{if(go.disabled)return;go.disabled=true;const r=await api('cadd',{number:n.value,name:nm.value});go.disabled=false;if(r.err)return er.textContent=r.err;
  if(r.dup)return done('Ya lo tienes agregado',r.name+' · '+fmt(r.id),r);loadContacts();flash('Contacto guardado');done('¡Listo!',r.name+' se guardó en tus contactos',r)};
 s.append(n,nm,er,go)})}
function newMenu(){actions([['chatplus','Nuevo chat',newChat],['userplus','Agregar contacto',()=>addContact()],['users','Nuevo grupo',newGroup]])}
/* ---- grupos ---- */
function rename(S){modal(s=>{const n=Object.assign(mk('input'),{value:S.info.name,maxLength:30}),er=mk('div','err'),go=mk('button','btn','Guardar');go.onclick=async()=>{const r=await api('gedit',{chat:S.info.id,name:n.value});if(r.err)return er.textContent=r.err;closeModal();loadChats(1);reopen(S.info.id)};s.append(mk('div','big','Nombre del grupo'),n,er,go)})}
function addMembers(S){loadContacts().then(()=>modal(s=>{s.append(mk('div','big','Agregar personas'));picker(s,{exclude:(S.info.members||[]).map(u=>u.id),label:'Agregar',onDone:async(ids,btn,er)=>{if(!ids.length)return er.textContent='Elige al menos una persona';btn.disabled=true;const r=await api('gadd',{chat:S.info.id,members:ids});if(r.err){btn.disabled=false;return er.textContent=r.err}closeModal();flash('Personas agregadas');loadChats(1);reopen(S.info.id)}})}))}
function leaveGroup(S){confirmSheet('¿Salir de "'+S.info.name+'"?','Salir del grupo',async()=>{await api('gdel',{chat:S.info.id});delete ST[S.info.id];closeChat(true);loadChats(1);flash('Saliste del grupo')})}
function groupInfo(S){const g=S.info,admin=g.admin==me.id;modal(s=>{s.append(big({id:g.id,name:g.name}),mk('div','big',g.name),mk('div','sub','Grupo · '+(g.members||[]).length+' miembros'));
 if(g.created)s.append(sec('Creado',dt(g.created)+' por '+nameOf(S,g.admin)));
 if(admin){const ad=mk('button','btn','Agregar personas'),rn=mk('button','btn sec','Cambiar nombre');ad.onclick=()=>addMembers(S);rn.onclick=()=>rename(S);s.append(ad,rn)}
 s.append(mk('div','sect','Miembros'));
 (g.members||[]).forEach(u=>{const r=mk('div','mem'),i=mk('div','i2'),n=mk('b',null,u.id==me.id?'Tú':u.name),sb=mk('div','sub',fmt(u.id));sb.style.textAlign='left';if(u.admin)n.append(mk('span','pill','Admin'));i.append(n,sb);r.append(av(u,'s'),i);
  if(u.id!=me.id)r.onclick=()=>actions([['info','Ver contacto',()=>userInfo(u.id)],['bubble','Enviar mensaje',()=>openWith(u)],...(admin?[['trash','Eliminar del grupo',()=>confirmSheet('¿Eliminar a '+u.name+' del grupo?','Eliminar del grupo',async()=>{await api('gdel',{chat:g.id,number:u.id});reopen(g.id);loadChats(1)}),1]]:[])]);s.append(r)});
 const lv=mk('button','act red');lv.insertAdjacentHTML('afterbegin',ic('logout'));lv.append(mk('span',null,'Salir del grupo'));lv.onclick=()=>leaveGroup(S);s.append(lv)})}
$('#chead').onclick=()=>{const S=ST[cur];if(!S)return;S.info.type=='g'?groupInfo(S):S.info.num&&userInfo(S.info.num)};
function clearChat(){const S=ST[cur];confirmSheet('Se borrarán los mensajes de este chat solo para ti.','Eliminar chat',async()=>{await api('clear',{chat:S.info.id});delete ST[S.info.id];closeChat(true);loadChats(1);flash('Chat eliminado')})}
$('#cmore').onclick=()=>{const S=ST[cur];if(!S)return;const i=S.info,L=[['info','Ver información',()=>i.type=='g'?groupInfo(S):userInfo(i.num)]];
 if(i.type=='p')L.push(['block',S.peer&&S.peer.bl?'Desbloquear contacto':'Bloquear contacto',()=>toggleBlock(i.num,!(S.peer&&S.peer.bl)),1]);L.push(['trash','Eliminar chat',clearChat,1]);if(i.type=='g')L.push(['logout','Salir del grupo',()=>leaveGroup(S),1]);actions(L)};
/* ---- arranque ---- */
$('#newb').onclick=newMenu;$('#cadd').onclick=()=>addContact();$('#cgrp').onclick=newGroup;$('#qs').oninput=drawList;$('#qc').oninput=drawContacts;
$('#tabs').onclick=e=>{const b=e.target.closest('button');if(b)setTab(b.dataset.t)};
$('#bell').onclick=enablePush;$('#th1').onclick=$('#th2').onclick=tog;theme();eInit();start();

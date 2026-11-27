const IOS=/iPhone|iPad|iPod/.test(self.navigator.userAgent);
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',e=>{
  let d={};try{d=e.data.json()}catch(x){d={title:'Chaty',body:e.data?e.data.text():''}}
  e.waitUntil((async()=>{
    const cl=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    if(!IOS&&cl.some(c=>c.visibilityState==='visible'&&c.focused))return;
    return self.registration.showNotification(d.title||'Chaty',{body:d.body||'',icon:'/icon-192.png',badge:'/icon-192.png',tag:d.tag||d.chat||'chaty',renotify:true,data:{chat:d.chat}});
  })());
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();const chat=e.notification.data&&e.notification.data.chat;
  e.waitUntil((async()=>{
    const cl=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    if(cl.length){const c=cl[0];await c.focus();c.postMessage({chat});return}
    return self.clients.openWindow('/'+(chat?'?chat='+encodeURIComponent(chat):''));
  })());
});

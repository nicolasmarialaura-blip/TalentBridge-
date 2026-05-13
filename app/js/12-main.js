// ── UTILS ──
function goBackFromChat(){
  // Cerrar el listener real-time del chat actual
  unsubscribeFromChatMessages();
  // Si venía de matches, refrescar la lista antes de volver
  if(chatPrev==='matches-scr')buildList();
  go(chatPrev);
}

function nowTime(){var d=new Date();return(d.getHours()<10?'0':'')+d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes();}
function restart(){idx=0;matches=[];chats={};curMatch=null;pipeline={};interviews=[];stats={seen:0,likes:0,mc:0,interviews:0};updateBadge();go('swipe-scr');render();}

// ── INIT ──
updateNdot();

// PWA
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').catch(function(){});}
var _prompt=null;
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();_prompt=e;setTimeout(function(){var b=G('install-banner');if(b)b.style.display='flex';},3000);});
function installApp(){var b=G('install-banner');if(b)b.style.display='none';if(_prompt){_prompt.prompt();_prompt=null;}}
function dismissInstall(){var b=G('install-banner');if(b)b.style.display='none';}

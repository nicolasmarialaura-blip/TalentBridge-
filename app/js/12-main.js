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

// ── PWA / INSTALL ──
if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(function(){}); }

// Detección de plataforma + estado de instalación
var _prompt = null;
var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
// La usuaria pudo haber dismisseado antes: guardamos para no molestar
var installDismissed = false;
try { installDismissed = localStorage.getItem('tnic_install_dismissed') === '1'; } catch(e) {}

function showInstallBanner(mode){
  if(isStandalone || installDismissed) return;
  var b = G('install-banner'); if(!b) return;
  var title = G('install-title'), help = G('install-help'), btn = G('install-cta');
  if(mode === 'ios'){
    if(title) title.textContent = '📲 Instalá tNic en tu iPhone';
    if(help)  help.textContent  = 'Tocá compartir y elegí "Agregar a pantalla de inicio"';
    if(btn)   btn.style.display = 'none';
  } else {
    if(title) title.textContent = '📲 Instalá tNic';
    if(help)  help.textContent  = 'Acceso rápido y notificaciones push, sin pasar por el navegador.';
    if(btn)   btn.style.display = 'inline-block';
  }
  b.style.display = 'flex';
}

// Chrome/Edge/Android: dispara beforeinstallprompt cuando se cumplen criterios PWA.
window.addEventListener('beforeinstallprompt', function(e){
  e.preventDefault();
  _prompt = e;
  // Esperamos unos segundos para no interrumpir el primer impacto visual.
  setTimeout(function(){ showInstallBanner('prompt'); }, 4000);
});

// iOS Safari: no dispara beforeinstallprompt, mostramos instrucciones manuales.
if(isIOS && !isStandalone && !installDismissed){
  setTimeout(function(){ showInstallBanner('ios'); }, 5000);
}

function installApp(){
  var b = G('install-banner'); if(b) b.style.display = 'none';
  if(_prompt){
    _prompt.prompt();
    _prompt.userChoice.then(function(){ _prompt = null; });
  }
}
function dismissInstall(){
  var b = G('install-banner'); if(b) b.style.display = 'none';
  try { localStorage.setItem('tnic_install_dismissed', '1'); } catch(e) {}
  installDismissed = true;
}

// Cuando se completa la instalación, ocultamos cualquier banner residual.
window.addEventListener('appinstalled', function(){
  var b = G('install-banner'); if(b) b.style.display = 'none';
  _prompt = null;
});

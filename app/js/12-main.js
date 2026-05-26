// ── UTILS ──
// Comprime una imagen subida a un dataURL JPEG controlado (max ~maxDim px del
// lado mayor, calidad ~0.85). Evita superar el límite de 1 MB por documento
// de Firestore cuando el perfil incluye la imagen como base64 dentro del doc.
function compressImage(file, maxDim, quality, cb){
  if(!file){ cb(null); return; }
  if(!/^image\/(jpeg|png|webp|gif)$/.test(file.type)){
    alert('Formato no soportado. Usá JPG, PNG, WEBP o GIF.');
    cb(null); return;
  }
  if(file.size > 15 * 1024 * 1024){
    alert('La imagen supera los 15 MB. Usá una más chica.');
    cb(null); return;
  }
  var reader = new FileReader();
  reader.onload = function(ev){
    var img = new Image();
    img.onload = function(){
      var w = img.naturalWidth, h = img.naturalHeight;
      var scale = Math.min(1, (maxDim||600) / Math.max(w, h));
      var cw = Math.max(1, Math.round(w * scale));
      var ch = Math.max(1, Math.round(h * scale));
      var canvas = document.createElement('canvas');
      canvas.width = cw; canvas.height = ch;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, cw, ch);
      try {
        cb(canvas.toDataURL('image/jpeg', quality||0.85));
      } catch(e){
        console.log('compressImage error:', e);
        cb(ev.target.result); // fallback al original si toDataURL falla
      }
    };
    img.onerror = function(){ alert('No se pudo procesar la imagen.'); cb(null); };
    img.src = ev.target.result;
  };
  reader.onerror = function(){ alert('No se pudo leer el archivo.'); cb(null); };
  reader.readAsDataURL(file);
}

function goBackFromChat(){
  // Cerrar el listener real-time del chat actual
  unsubscribeFromChatMessages();
  // Si venía de matches, refrescar la lista antes de volver
  if(chatPrev==='matches-scr')buildList();
  go(chatPrev);
}

function nowTime(){var d=new Date();return(d.getHours()<10?'0':'')+d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes();}
function restart(){idx=0;matches=[];chats={};curMatch=null;pipeline={};interviews=[];stats={seen:0,likes:0,mc:0,interviews:0};updateBadge();go('swipe-scr');render();}

// ── TEMA (dark / light / auto) ──
// El tema inicial ya se aplicó con el script inline del <head> (anti-flash).
// Acá manejamos el cambio en runtime + persistencia + sync de la UI.
function _systemPrefersDark(){
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function _getThemePref(){
  try{ return localStorage.getItem('tnic_theme') || 'auto'; }catch(e){ return 'auto'; }
}
function applyTheme(pref){
  var dark = pref === 'dark' || (pref === 'auto' && _systemPrefersDark());
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}
// Cambia el tema desde el control segmentado del perfil
function setTheme(pref){
  try{ localStorage.setItem('tnic_theme', pref); }catch(e){}
  applyTheme(pref);
  syncThemeUI();
}
// Resalta la opción activa en todos los controles segmentados (perfil candidato + empresa)
function syncThemeUI(){
  var pref = _getThemePref();
  document.querySelectorAll('[data-theme-seg]').forEach(function(seg){
    seg.querySelectorAll('button[data-theme-opt]').forEach(function(btn){
      btn.classList.toggle('on', btn.getAttribute('data-theme-opt') === pref);
    });
  });
}
// Si el usuario está en 'auto', seguir los cambios del sistema en vivo
if(window.matchMedia){
  try{
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(){
      if(_getThemePref() === 'auto') applyTheme('auto');
    });
  }catch(e){}
}

// ── INIT ──
updateNdot();
syncThemeUI();

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

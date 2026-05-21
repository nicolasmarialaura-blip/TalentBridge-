// ── CANDIDATE PROFILE ──
function initCPScreen(){
  G('cp-name-inp').value=cpData.name;G('cp-role-inp').value=cpData.role;G('cp-about-inp').value=cpData.about;
  G('cp-email-inp').value=cpData.email||'';G('cp-loc-inp').value=cpData.loc;G('cp-sal-inp').value=cpData.sal;
  G('cp-avail-inp').value=cpData.avail;G('cp-exp-inp').value=cpData.exp;G('cp-langs-inp').value=cpData.langs;
  updateCPInitials();renderCPAvatar();renderCPBanner();renderSkillsList();renderGallery();
  refreshOwnCVUI();
  selectedSkillRole=null;
  document.querySelectorAll('.skill-role-chip').forEach(function(c){c.classList.remove('on');});
  var sug=G('skill-suggestions');if(sug)sug.innerHTML='<span class="skill-sug-placeholder">Elegí una especialidad arriba para ver sugerencias</span>';
}
function updateCPInitials(){var name=G('cp-name-inp').value;var p=name.trim().split(' ');var init=p.length>=2?(p[0][0]||'').toUpperCase()+(p[1][0]||'').toUpperCase():(p[0][0]||'?').toUpperCase();var el=G('cp-avatar-initials');if(el&&!cpData.avatar)el.textContent=init;}
function renderCPAvatar(){var av=G('cp-avatar-display');if(!av)return;if(cpData.avatar){av.innerHTML='<img src="'+cpData.avatar+'" style="width:100%;height:100%;object-fit:cover">';}else{var name=(G('cp-name-inp')||{}).value||'';var p=name.trim().split(' ');var init=p.length>=2?(p[0][0]||'')+(p[1][0]||''):(p[0][0]||'?');av.innerHTML='<span id="cp-avatar-initials" style="font-size:20px;font-weight:700;color:#fff;font-family:Syne,sans-serif">'+init.toUpperCase()+'</span>';}}
function setCPAvatar(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){cpData.avatar=ev.target.result;renderCPAvatar();};r.readAsDataURL(f);}
function setCPBanner(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){cpData.banner=ev.target.result;var wrap=G('cp-banner-wrap');if(wrap){wrap.style.backgroundImage='url('+ev.target.result+')';wrap.style.backgroundSize='cover';wrap.style.backgroundPosition='center';wrap.querySelector('span').style.opacity='0';}};r.readAsDataURL(f);}
function renderCPBanner(){if(!cpData.banner)return;var wrap=G('cp-banner-wrap');if(wrap){wrap.style.backgroundImage='url('+cpData.banner+')';wrap.style.backgroundSize='cover';wrap.style.backgroundPosition='center';if(wrap.querySelector('span'))wrap.querySelector('span').style.opacity='0';}}
function renderSkillsList(){
  var list=G('cp-skills-list');if(!list)return;
  if(!cpData.skills.length){list.innerHTML='<div style="font-size:12px;color:var(--gray);text-align:center;padding:8px">Sin skills agregadas. Elegí un rol arriba o tocá + Agregar.</div>';if(selectedSkillRole)renderSkillSuggestions(selectedSkillRole);return;}
  list.innerHTML=cpData.skills.map(function(sk,i){return'<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><input class="cp-input" style="margin:0;flex:1" value="'+sk+'" autocomplete="off" name="skill-'+i+'-tnic" onchange="cpData.skills['+i+']=this.value"><button onclick="removeSkill('+i+')" style="background:none;border:none;color:var(--red);font-size:18px;cursor:pointer;flex-shrink:0">×</button></div>';}).join('');
  if(selectedSkillRole)renderSkillSuggestions(selectedSkillRole);
}
function addSkillInput(){cpData.skills.push('');renderSkillsList();var inputs=document.querySelectorAll('#cp-skills-list input');if(inputs.length)inputs[inputs.length-1].focus();}
function removeSkill(i){cpData.skills.splice(i,1);renderSkillsList();}
function addGalleryPhotos(e){var files=Array.from(e.target.files).slice(0,9-cpData.gallery.length);files.forEach(function(f){var r=new FileReader();r.onload=function(ev){cpData.gallery.push(ev.target.result);renderGallery();};r.readAsDataURL(f);});e.target.value='';}
function renderGallery(){var grid=G('gallery-grid');if(!grid)return;var ph=cpData.gallery.map(function(src,i){return'<div class="gallery-item" onclick="openLightbox('+i+')"><img src="'+src+'" alt=""><button class="gallery-item-del" onclick="event.stopPropagation();deleteGalleryPhoto('+i+')">×</button></div>';}).join('');var add=cpData.gallery.length<9?'<label class="gallery-add"><div class="gallery-add-icon">+</div><div class="gallery-add-lbl">Agregar</div><input type="file" accept="image/*" multiple style="display:none" onchange="addGalleryPhotos(event)"></label>':'';grid.innerHTML=ph+add;}
function deleteGalleryPhoto(i){cpData.gallery.splice(i,1);renderGallery();}
function openLightbox(i){cpData.galleryIdx=i;var lb=G('gallery-lightbox'),img=G('lightbox-img'),ctr=G('lightbox-counter');if(lb&&img){img.src=cpData.gallery[i];ctr.textContent=(i+1)+' / '+cpData.gallery.length;lb.classList.add('open');}}
function closeLightbox(){var lb=G('gallery-lightbox');if(lb)lb.classList.remove('open');}
function lightboxNav(dir){var n=cpData.galleryIdx+dir;if(n<0)n=cpData.gallery.length-1;if(n>=cpData.gallery.length)n=0;openLightbox(n);}
function saveCandidateProfile(){
  var email=(G('cp-email-inp')||{}).value||'';if(email&&!isValidEmail(email)){alert('Email inválido.');return;}
  cpData.name=G('cp-name-inp').value;cpData.role=G('cp-role-inp').value;cpData.about=G('cp-about-inp').value;
  cpData.email=email;cpData.loc=G('cp-loc-inp').value;cpData.sal=G('cp-sal-inp').value;
  cpData.avail=G('cp-avail-inp').value;cpData.exp=G('cp-exp-inp').value;cpData.langs=G('cp-langs-inp').value;
  cpData.skills=Array.from(document.querySelectorAll('#cp-skills-list input')).map(function(i){return i.value;}).filter(Boolean);
  persistAll();publishProfileToFirestore();addNotif('✅','Perfil guardado correctamente','ahora');
  if(USER_ROLE==='candidate')sortDataSetByMatch();
  go('swipe-scr');
  var b=document.createElement('div');b.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#16A34A;color:#fff;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:600;z-index:999;font-family:"Plus Jakarta Sans",sans-serif';b.textContent='✓ Perfil guardado';document.body.appendChild(b);setTimeout(function(){b.remove();},2500);
}

// ── ROLE SYSTEM ──
// ── FIREBASE AUTH ──
var currentUser = null;

// ─────────────────────────────────────────────
// FCM — Push notifications
// Estrategia:
//   - tryRegisterPush(): silencioso, se llama al login. Si el permiso ya está
//     'granted' renueva token y lo guarda; si está 'default' NO prompt; si
//     está 'denied' no hace nada.
//   - requestPushPermission(): pide permiso explícito. Lo llamamos al final
//     del onboarding (finishSetup) y desde un botón en el perfil.
//   - Token se guarda en users/{uid}.fcmTokens (array, multi-device).
// ─────────────────────────────────────────────
function fcmMessagingSWReg(){
  if(!('serviceWorker' in navigator)) return Promise.resolve(null);
  return navigator.serviceWorker.getRegistration('/app/firebase-messaging-sw.js')
    .then(function(reg){
      if(reg) return reg;
      return navigator.serviceWorker.register('/app/firebase-messaging-sw.js');
    })
    .catch(function(e){ console.log('Messaging SW register:', e); return null; });
}

function saveFcmToken(token){
  if(!token || !currentUser || currentUser.isAnonymous) return Promise.resolve();
  return db.collection('users').doc(currentUser.uid).set({
    fcmTokens: firebase.firestore.FieldValue.arrayUnion(token),
    fcmUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

async function tryRegisterPush(){
  if(!messaging) return;
  if(!currentUser || currentUser.isAnonymous) return;
  if(!('Notification' in window)) return;
  if(Notification.permission !== 'granted') return; // silencioso: no prompt
  try {
    var swReg = await fcmMessagingSWReg();
    if(!swReg) return;
    var token = await messaging.getToken({ vapidKey: FCM_VAPID_KEY, serviceWorkerRegistration: swReg });
    if(token) { await saveFcmToken(token); console.log('FCM token refresh OK'); }
  } catch(e){ console.log('tryRegisterPush error:', e); }
}

async function requestPushPermission(){
  if(!messaging){ alert('Tu navegador no soporta notificaciones push.'); return false; }
  if(!currentUser || currentUser.isAnonymous){ return false; }
  if(!('Notification' in window)){ return false; }
  try {
    var perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if(perm !== 'granted'){ return false; }
    var swReg = await fcmMessagingSWReg();
    if(!swReg) return false;
    var token = await messaging.getToken({ vapidKey: FCM_VAPID_KEY, serviceWorkerRegistration: swReg });
    if(!token) return false;
    await saveFcmToken(token);
    addNotif('🔔','Notificaciones activadas','ahora');
    return true;
  } catch(e){ console.log('requestPushPermission error:', e); return false; }
}

// Mensajes en foreground (app abierta): mostramos toast/notif interna.
if(messaging){
  try {
    messaging.onMessage(function(payload){
      var n = payload.notification || {};
      addNotif('🔔','<strong>'+(n.title||'tNic')+'</strong> · '+(n.body||''),'ahora');
    });
  } catch(e){ console.log('onMessage setup:', e); }
}

function loginConGoogle() {
  document.getElementById('login-buttons').style.display = 'none';
  document.getElementById('login-loading').style.display = 'flex';
  var provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(function(result) {
      currentUser = result.user;
      onLoginSuccess(result.user);
    })
    .catch(function(error) {
      console.log('Login error:', error);
      document.getElementById('login-buttons').style.display = 'flex';
      document.getElementById('login-loading').style.display = 'none';
      alert('Error al iniciar sesión. Intentá de nuevo.');
    });
}

function loginComoInvitado() {
  onLoginSuccess(null, true);
}

function onLoginSuccess(user, isGuest) {
  currentUser = user;
  if (user && !user.isAnonymous) {
    db.collection('users').doc(user.uid).get()
      .then(function(doc) {
        if (doc.exists) {
          var data = doc.data();
          if (data.cpData) Object.assign(cpData, data.cpData);
          if (data.copData) Object.assign(copData, data.copData);
          if (data.USER_ROLE) USER_ROLE = data.USER_ROLE;
          if (data.matches) matches = data.matches;
          if (data.subscription) subscription = data.subscription;
          // chats reales viven en matches/{id}/messages — no leer del subcampo viejo

          // Backfill de email en el perfil (necesario para que las Cloud Functions
          // de match/interview puedan mandar notifs por SendGrid).
          if (user.email) {
            if (USER_ROLE === 'candidate' && !cpData.email) cpData.email = user.email;
            if (USER_ROLE === 'company'   && !copData.contactEmail) copData.contactEmail = user.email;
          }
          if (user.photoURL && !cpData.photo) cpData.photo = user.photoURL;
          if (user.displayName && !cpData.name) cpData.name = user.displayName;
          save();
          if (USER_ROLE) {
            applyRoleUI(); listenForMatches(); go('swipe-scr'); sortDataSetByMatch(); render();
            // Backfill silencioso: re-publica el perfil con email para que las
            // Cloud Functions de match/interview puedan leerlo.
            try { publishProfileToFirestore(); } catch(e) { console.log('backfill publish:', e); }
            // Refresh silencioso del token FCM si ya hay permiso concedido
            try { tryRegisterPush(); } catch(e) { console.log('tryRegisterPush:', e); }
            // Listener real-time de la suscripción (syncSubscriptions la actualiza c/5min)
            try { listenForSubscription(); } catch(e) { console.log('listenForSubscription:', e); }
            // Deep-link desde /precios.html?upgrade=pro → abrir modal de upgrade
            if (location.search.indexOf('upgrade=pro') !== -1 && USER_ROLE === 'company' && !hasProAccess()) {
              setTimeout(function(){ showUpgradeModal(''); }, 900);
            }
            setTimeout(function(){initCardEvents();updateNdot();buildAgenda();}, 100);
          } else {
            var tc=false;try{tc=localStorage.getItem('tnic_tc_accepted')==='1';}catch(e){}
            go(tc?'onboard-scr':'welcome-scr');
          }
        } else {
          if (user.displayName) cpData.name = user.displayName;
          if (user.photoURL) cpData.photo = user.photoURL;
          if (user.email) cpData.email = user.email;
          save();
          var tc=false;try{tc=localStorage.getItem('tnic_tc_accepted')==='1';}catch(e){}
          go(tc?'onboard-scr':'welcome-scr');
        }
      }).catch(function() {
        var tc=false;try{tc=localStorage.getItem('tnic_tc_accepted')==='1';}catch(e){}
        go(tc?'onboard-scr':'welcome-scr');
      });
  } else {
    var has=loadAll();
    if (has&&USER_ROLE) {
      applyRoleUI(); go('swipe-scr'); sortDataSetByMatch(); render();
      setTimeout(function(){initCardEvents();updateNdot();buildAgenda();}, 100);
    } else {
      var tc=false;try{tc=localStorage.getItem('tnic_tc_accepted')==='1';}catch(e){}
      go(tc?'onboard-scr':'welcome-scr');
    }
  }
}

function saveToFirestore() {
  if (currentUser && !currentUser.isAnonymous) {
    db.collection('users').doc(currentUser.uid).set({
      cpData:cpData, copData:copData, USER_ROLE:USER_ROLE,
      matches:matches,
      // chats removidos — viven en matches/{id}/messages (real-time)
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    }, {merge:true}).catch(function(e){console.log('Firestore error:',e);});
  }
}


// ── SUSCRIPCIÓN: listener + UI ──────────────────────────────────────────
function listenForSubscription(){
  if(subscriptionUnsub){try{subscriptionUnsub();}catch(e){}subscriptionUnsub=null;}
  if(!currentUser || currentUser.isAnonymous) return;
  subscriptionUnsub = db.collection('users').doc(currentUser.uid)
    .onSnapshot(function(doc){
      if(doc.exists && doc.data().subscription){
        subscription = doc.data().subscription;
        refreshSubscriptionUI();
      }
    }, function(err){ console.log('Subscription listener error:', err); });
}

// Actualiza elementos de UI que dependen del plan (badge, banner, etc.)
function refreshSubscriptionUI(){
  // Badge de plan en el perfil de empresa
  var badge = G('plan-badge');
  if(badge){
    if(USER_ROLE !== 'company'){
      badge.style.display = 'none';
    } else {
      var plan = (subscription && subscription.plan) || 'free';
      var status = (subscription && subscription.status) || '';
      var label = plan === 'enterprise' ? '🏢 Enterprise'
                : plan === 'pro' ? '💎 Pro'
                : '🆓 Free';
      if(status === 'on_trial') label += ' · Trial';
      if(status === 'cancelled') label += ' · Cancela pronto';
      if(status === 'past_due') label += ' · Pago pendiente';
      badge.textContent = label;
      badge.className = 'plan-badge plan-' + plan;
      badge.style.display = 'inline-block';
    }
  }
  // Botón "Tu plan": adaptativo según si la empresa paga o no.
  //  - Cliente con plan pago → "Gestionar suscripción" abre el portal de
  //    LemonSqueezy (cambiar tarjeta, cancelar, facturas, cambiar plan).
  //  - Empresa Free → "Mejorar plan" abre el modal de upgrade/checkout.
  var manageBtn = G('plan-manage-btn');
  if(manageBtn){
    if(USER_ROLE === 'company' && hasProAccess()){
      var portalUrl = subscription && subscription.customerPortalUrl;
      manageBtn.textContent = 'Gestionar suscripción';
      manageBtn.onclick = portalUrl
        ? function(){ window.open(portalUrl, '_blank', 'noopener'); }
        : function(){ alert('Tu portal de suscripción se está preparando. Si te suscribiste recién, reintentá en unos minutos.'); };
    } else {
      manageBtn.textContent = 'Mejorar plan';
      manageBtn.onclick = function(){ showUpgradeModal(''); };
    }
  }
  // Banner de upgrade en swipe-scr (solo empresa Free)
  var banner = G('upgrade-banner');
  if(banner){
    banner.style.display = (USER_ROLE === 'company' && !hasProAccess()) ? 'flex' : 'none';
  }
}

// Modal de upgrade — se dispara cuando una empresa Free toca una feature paga.
function showUpgradeModal(featureLabel){
  var modal = G('upgrade-modal');
  if(!modal) return;
  var sub = G('upgrade-modal-sub');
  if(sub){
    sub.textContent = featureLabel
      ? 'Para ' + featureLabel + ' necesitás tNic Pro. Probalo 14 días gratis.'
      : 'Desbloqueá todas las features de tNic. Probalo 14 días gratis.';
  }
  modal.style.display = 'flex';
}
function closeUpgradeModal(){
  var m = G('upgrade-modal'); if(m) m.style.display = 'none';
}
// Botones del modal → checkout de LemonSqueezy
function upgradeToProMonthly(){ closeUpgradeModal(); goToLSCheckout(LS_CHECKOUTS.proMonthly); }
function upgradeToProAnnual(){ closeUpgradeModal(); goToLSCheckout(LS_CHECKOUTS.proAnnual); }

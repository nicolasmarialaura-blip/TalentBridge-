// ── WELCOME SCREEN ──
function toggleWelcomeBtn(){
  var cb=document.getElementById('welcome-tc-check');
  var btn=document.getElementById('welcome-btn');
  if(btn)btn.classList.toggle('on',cb&&cb.checked);
}
function goToOnboard(){
  // Marcar que aceptó T&C
  try{localStorage.setItem('tnic_tc_accepted','1');}catch(e){}
  go('onboard-scr');
}
function openAppTC(e){
  if(e)e.preventDefault();
  document.getElementById('app-tc-modal').classList.add('open');
}
function closeAppTC(){
  document.getElementById('app-tc-modal').classList.remove('open');
}

function selectRole(role){USER_ROLE=role;['candidate','company'].forEach(function(r){var c=G('role-'+r);if(c)c.classList.toggle('sel',r===role);});var btn=G('onboard-btn');if(btn){btn.disabled=false;btn.style.opacity='1';}}
// ── FIRESTORE REAL MATCHING ──

// Publicar perfil del usuario en Firestore para que otros lo vean
function publishProfileToFirestore() {
  if (!currentUser || currentUser.isAnonymous) return;
  var uid = currentUser.uid;
  // Email del usuario para que las Cloud Functions puedan mandarle notifs (welcome usa el de Auth directo, pero match/interview leen el del perfil aquí).
  var authEmail = (currentUser && currentUser.email) || '';
  if (USER_ROLE === 'candidate') {
    var profile = {
      uid: uid,
      type: 'candidate',
      name: cpData.name || '',
      role: cpData.role || '',
      loc: cpData.loc || '',
      about: cpData.about || '',
      skills: cpData.skills || [],
      sal: cpData.sal || '',
      avail: cpData.avail || '',
      exp: cpData.exp || '',
      langs: cpData.langs || '',
      email: cpData.email || authEmail || '',
      color: cpData.color || '#2B5CE6',
      av: cpData.name ? cpData.name.split(' ').map(function(w){return w[0]||'';}).join('').substring(0,2).toUpperCase() : 'UN',
      photo: cpData.photo || null,
      cvUrl: cpData.cvUrl || null,
      cvName: cpData.cvName || null,
      active: true,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    db.collection('candidates').doc(uid).set(profile, {merge: true})
      .then(function() { console.log('Candidato publicado'); })
      .catch(function(e) { console.log('Error publicando candidato:', e); });
  } else if (USER_ROLE === 'company') {
    var profile = {
      uid: uid,
      type: 'company',
      name: copData.name || '',
      role: 'Busca: ' + (copData.jobs.length ? copData.jobs[0].title : 'Talento IT'),
      loc: copData.location || '',
      about: copData.desc || '',
      skills: copData.jobs.length ? (copData.jobs[0].skills || '').split(',').map(function(s){return s.trim();}).filter(Boolean) : [],
      sal: copData.jobs.length ? copData.jobs[0].salary || '' : '',
      size: copData.size || '',
      industry: copData.industry || '',
      email: copData.contactEmail || authEmail || '',
      color: '#2B5CE6',
      av: copData.name ? copData.name.substring(0,2).toUpperCase() : 'CO',
      photo: copData.logo || null,
      activeJobs: copData.jobs || [],
      active: true,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    db.collection('companies').doc(uid).set(profile, {merge: true})
      .then(function() { console.log('Empresa publicada'); })
      .catch(function(e) { console.log('Error publicando empresa:', e); });
  }
}

// Cargar perfiles reales de Firestore para el swipe
function loadRealProfilesFromFirestore(callback) {
  if (!currentUser) { callback([]); return; }
  var collection = USER_ROLE === 'candidate' ? 'companies' : 'candidates';
  db.collection(collection)
    .where('active', '==', true)
    .limit(20)
    .get()
    .then(function(snapshot) {
      var profiles = [];
      snapshot.forEach(function(doc) {
        var data = doc.data();
        // No mostrar el propio perfil
        if (data.uid === currentUser.uid) return;
        profiles.push(data);
      });
      callback(profiles);
    })
    .catch(function(e) {
      console.log('Error cargando perfiles:', e);
      callback([]);
    });
}

// ── SWIPES y MATCHES (Firestore) ──
//
// Flujo del matching real:
//  1. swipe(dir) en la UI escribe un doc en /swipes con {from, to, kind}.
//     ID determinístico ({from}_{to}) para evitar swipes duplicados.
//  2. Cloud Function onSwipeCreated detecta likes recíprocos y crea un
//     doc en /matches con users:[uidA,uidB] y ID determinístico.
//  3. listenForMatches() en el cliente escucha /matches y, cuando llega
//     un doc nuevo después de la carga inicial, muestra la pantalla
//     "Mutual Interest" (showMI) con el perfil del otro usuario.

var matchesUnsub = null;
var matchesInitialized = false;

function writeSwipeToFirestore(target, kind) {
  if (!currentUser || currentUser.isAnonymous) return;
  if (!target || !target.uid) return;          // perfil demo sin uid: ignorar
  if (target.uid === currentUser.uid) return;   // self-swipe: defensivo
  var docId = currentUser.uid + '_' + target.uid;
  db.collection('swipes').doc(docId).set({
    from: currentUser.uid,
    to: target.uid,
    kind: kind, // 'like' | 'pass'
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function(e) { console.log('Swipe error:', e); });
}

function listenForMatches() {
  if (!currentUser || currentUser.isAnonymous) return;
  if (matchesUnsub) { matchesUnsub(); matchesUnsub = null; }
  matchesInitialized = false;
  matchesUnsub = db.collection('matches')
    .where('users', 'array-contains', currentUser.uid)
    .onSnapshot(function(snapshot) {
      var firstSnapshot = !matchesInitialized;
      matchesInitialized = true;
      snapshot.docChanges().forEach(function(change) {
        if (change.type === 'added') {
          handleMatchDoc(change.doc, !firstSnapshot);
        }
      });
    }, function(err) { console.log('Match listener error:', err); });
}

function handleMatchDoc(matchDoc, isNew) {
  var data = matchDoc.data();
  if (!data || !data.users) return;
  var otherUid = data.users.find(function(u) { return u !== currentUser.uid; });
  if (!otherUid) return;

  // Si ya existe en matches local, parcharle matchId (lo que habilita el chat real-time)
  // y salir. Esto cubre el caso de matches viejos guardados sin matchId (de versiones
  // anteriores) o matches agregados optimistamente por addMatch en swipes.
  var existing = matches.find(function(m) { return m.uid === otherUid; });
  if (existing) {
    if (!existing.matchId) {
      existing.matchId = matchDoc.id;
      persistAll();
    }
    if (isNew) {
      curMatch = existing;
      showMI();
      addNotif('🎉', 'Mutual Interest con <strong>'+(existing.name||'usuario')+'</strong>', 'ahora');
    }
    return;
  }

  // No existe local: cargar el perfil del otro usuario. Buscar primero en la
  // colección esperada según USER_ROLE; si no aparece (puede pasar por estados
  // de rol cruzados entre testers), probar la otra colección como fallback.
  var primary = USER_ROLE === 'candidate' ? 'companies' : 'candidates';
  var secondary = primary === 'companies' ? 'candidates' : 'companies';
  function loadFrom(coll, onMiss) {
    db.collection(coll).doc(otherUid).get().then(function(doc) {
      if (!doc.exists) { onMiss(); return; }
      var profile = doc.data();
      profile.matchId = matchDoc.id;
      addMatch(profile, false);
      var added = matches.find(function(m) { return m.uid === otherUid; }) || profile;
      // Si el pipeline ya tiene stage para este uid, aplicarlo al name
      reconcilePipelineFromUids();
      persistAll();
      if (isNew) {
        curMatch = added;
        showMI();
        addNotif('🎉', 'Mutual Interest con <strong>'+(added.name||'usuario')+'</strong>', 'ahora');
      }
    }).catch(function(e) { console.log('Error cargando perfil de match:', e); });
  }
  loadFrom(primary, function() {
    loadFrom(secondary, function() {
      console.log('Match doc apunta a uid sin perfil publicado:', otherUid);
    });
  });
}

function confirmRole(){
  if(!USER_ROLE)return;applyRoleUI();
  if(USER_ROLE==='company'){go('company-profile-scr');initCompanyProfile();showSetupBanner();}
  else{go('candidate-profile-scr');initCPScreen();showSetupBanner();}
}
function showSetupBanner(){
  ['company-profile-scr','candidate-profile-scr'].forEach(function(scr){
    var el=G(scr);if(!el)return;
    var ex=el.querySelector('.setup-banner');if(ex)ex.remove();
    var b=document.createElement('div');b.className='setup-banner';
    b.style.cssText='background:linear-gradient(135deg,#0F172A,#2B5CE6);padding:12px 18px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;z-index:10';
    b.innerHTML='<div><div style="font-family:Syne,sans-serif;font-size:13px;font-weight:800;color:#fff">¡Bienvenido/a a tNic! 👋</div><div style="font-size:11px;color:rgba(255,255,255,.65);margin-top:1px">Completá tu perfil para empezar</div></div><button onclick="finishSetup()" style="background:#fff;color:#2B5CE6;border:none;border-radius:16px;padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer">Listo →</button>';
    el.insertBefore(b,el.firstChild);
  });
}
function finishSetup(){
  saveSilent();
  document.querySelectorAll('.setup-banner').forEach(function(b){b.remove();});
  // Publicar perfil en Firestore
  publishProfileToFirestore();
  // Empezar a escuchar matches reales (creados por la Cloud Function)
  listenForMatches();
  // Cargar perfiles reales para el swipe
  loadRealProfilesForSwipe();
  // Pedir permiso de notificaciones — la primera y única vez que el browser muestra prompt.
  // Si bloquea, la app sigue funcionando; solo se pierde el push.
  setTimeout(function(){ try { requestPushPermission(); } catch(e) { console.log('push permission:', e); } }, 1500);
}

function loadRealProfilesForSwipe() {
  loadRealProfilesFromFirestore(function(realProfiles) {
    var defaultProfiles = USER_ROLE === 'candidate' ? COMPANIES : CANDIDATES;
    if (realProfiles && realProfiles.length > 0) {
      // Mezclar perfiles reales con demo — reales primero
      dataSet = realProfiles.concat(defaultProfiles);
    } else {
      // Sin perfiles reales → usar demo
      dataSet = defaultProfiles;
    }
    idx = 0;
    sortDataSetByMatch();
    render();
    initCardEvents();
    go('swipe-scr');
    // Toast informativo
    var count = realProfiles.length;
    if (count > 0) {
      var b = document.createElement('div');
      b.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#2B5CE6;color:#fff;padding:10px 20px;border-radius:20px;font-size:12px;font-weight:600;z-index:999;font-family:"Plus Jakarta Sans",sans-serif;white-space:nowrap';
      b.textContent = '🎉 ' + count + ' perfil' + (count > 1 ? 'es' : '') + ' real' + (count > 1 ? 'es' : '') + ' encontrado' + (count > 1 ? 's' : '');
      document.body.appendChild(b);
      setTimeout(function(){b.remove();}, 3000);
    }
  });
}
function saveSilent(){
  if(USER_ROLE==='company'){var g=function(id){return(G(id)||{value:''});};copData.name=g('cop-name').value;copData.tagline=g('cop-tagline').value;copData.industry=g('cop-industry').value;copData.size=g('cop-size').value;copData.contactEmail=g('cop-email').value;copData.location=g('cop-location').value;copData.desc=g('cop-desc').value;copData.culture=Array.from(document.querySelectorAll('.culture-chip.on')).map(function(c){return c.textContent.trim();});}
  else{var g=function(id){return(G(id)||{value:''});};cpData.name=g('cp-name-inp').value;cpData.role=g('cp-role-inp').value;cpData.email=g('cp-email-inp').value;cpData.loc=g('cp-loc-inp').value;cpData.sal=g('cp-sal-inp').value;cpData.avail=g('cp-avail-inp').value;cpData.exp=g('cp-exp-inp').value;cpData.langs=g('cp-langs-inp').value;cpData.skills=Array.from(document.querySelectorAll('#cp-skills-list input')).map(function(i){return i.value;}).filter(Boolean);}
  persistAll();
}

function applyRoleUI(){
  // Safety net: cualquier transición de rol arranca los listeners.
  if (currentUser && !currentUser.isAnonymous) {
    if (!matchesUnsub) { try { listenForMatches(); } catch(e) { console.log('applyRoleUI: listenForMatches falló', e); } }
    if (!interviewsUnsub) { try { subscribeToInterviews(); } catch(e) { console.log('applyRoleUI: subscribeToInterviews falló', e); } }
    if (USER_ROLE==='company' && !pipelineUnsub) { try { subscribeToPipeline(); } catch(e) { console.log('applyRoleUI: subscribeToPipeline falló', e); } }
  }
  var isC=USER_ROLE==='candidate';
  dataSet=isC?COMPANIES:CANDIDATES;idx=0;mode=isC?'companies':'candidates';
  var mt=document.querySelector('.modetabs');if(mt)mt.style.display='none';
  var lbl=G('topbar-role-label');
  if(!lbl){lbl=document.createElement('div');lbl.id='topbar-role-label';lbl.style.cssText='font-size:12px;font-weight:600;color:var(--b);background:var(--bxlight);border-radius:var(--rp);padding:5px 12px';var tb=document.querySelector('.topbar');if(tb&&mt)tb.insertBefore(lbl,mt);}
  lbl.textContent=isC?'🏢 Empresas':'🧑‍💼 Candidatos';
  // Cargar perfiles reales de Firestore en background
  loadRealProfilesFromFirestore(function(realProfiles) {
    if (realProfiles && realProfiles.length > 0) {
      var defaultProfiles = isC ? COMPANIES : CANDIDATES;
      dataSet = realProfiles.concat(defaultProfiles);
      idx = 0;
      sortDataSetByMatch();
      render();
    }
  });
}


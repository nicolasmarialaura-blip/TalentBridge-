// ── COMPANY PROFILE ──
function initCompanyProfile(){var g=G;g('cop-name').value=copData.name;g('cop-tagline').value=copData.tagline;g('cop-industry').value=copData.industry;g('cop-size').value=copData.size;g('cop-email').value=copData.contactEmail||'';g('cop-location').value=copData.location;g('cop-web').value=copData.web;g('cop-founded').value=copData.founded;g('cop-desc').value=copData.desc;g('cop-linkedin').value=copData.linkedin;g('cop-twitter').value=copData.twitter;g('cop-instagram').value=copData.instagram;g('cop-github').value=copData.github;updateCopInitials();renderCopLogo();renderCopBanner();renderCultureChips();renderCopJobs();try{refreshSubscriptionUI();}catch(e){}}
function updateCopInitials(){var name=(G('cop-name')||{}).value||'';var p=name.trim().split(' ');var init=p.length>=2?(p[0][0]||'').toUpperCase()+(p[1][0]||'').toUpperCase():(p[0][0]||'?').toUpperCase();var el=G('cop-logo-initials');if(el&&!copData.logo)el.textContent=init;}
function renderCopLogo(){var el=G('cop-logo-display');if(!el)return;if(copData.logo){el.innerHTML='<img src="'+copData.logo+'">';}else{var name=(G('cop-name')||{}).value||'';var p=name.trim().split(' ');var init=p.length>=2?(p[0][0]||'')+(p[1][0]||''):(p[0][0]||'?');el.innerHTML='<span id="cop-logo-initials" style="font-family:Syne,sans-serif;font-weight:800;font-size:22px;color:#fff">'+init.toUpperCase()+'</span>';}}
function setCopLogo(e){var f=e.target.files[0];if(!f)return;compressImage(f,500,0.9,function(dataUrl){if(!dataUrl)return;copData.logo=dataUrl;renderCopLogo();});}
function setCopBanner(e){var f=e.target.files[0];if(!f)return;compressImage(f,1200,0.85,function(dataUrl){if(!dataUrl)return;copData.banner=dataUrl;var w=G('cop-banner-wrap');if(w){w.style.backgroundImage='url('+dataUrl+')';w.style.backgroundSize='cover';w.style.backgroundPosition='center';if(w.querySelector('span'))w.querySelector('span').style.opacity='0';}});}
function renderCopBanner(){if(!copData.banner)return;var w=G('cop-banner-wrap');if(w){w.style.backgroundImage='url('+copData.banner+')';w.style.backgroundSize='cover';w.style.backgroundPosition='center';if(w.querySelector('span'))w.querySelector('span').style.opacity='0';}}
function renderCultureChips(){document.querySelectorAll('.culture-chip').forEach(function(chip){chip.classList.toggle('on',copData.culture.indexOf(chip.textContent.trim())>=0);});}
function renderCopJobs(){var list=G('cop-jobs-list'),badge=G('job-count-badge');if(badge)badge.textContent=copData.jobs.length;if(!list)return;if(!copData.jobs.length){list.innerHTML='<div style="font-size:12px;color:var(--gray);text-align:center;padding:10px 0">Sin búsquedas activas.</div>';return;}list.innerHTML=copData.jobs.map(function(job,i){var tags=[job.modality,job.seniority,job.contract].filter(Boolean).map(function(t){return'<span class="job-tag">'+t+'</span>';}).join('');return'<div class="job-card"><div class="job-card-header"><div class="job-card-title">'+job.title+'</div><div class="job-card-actions"><button class="job-edit-btn" onclick="openJobModal('+i+')">✏️</button><button class="job-del-btn" onclick="deleteJob('+i+')">🗑</button></div></div>'+(job.salary?'<div style="font-size:12px;font-weight:600;color:var(--b);margin-bottom:4px">💰 '+job.salary+'</div>':'')+'<div class="job-meta">'+(job.urgent?'<span class="job-tag job-urgent-tag">🔥 Urgente</span>':'')+tags+'</div>'+(job.skills?'<div style="font-size:11px;color:var(--gray);margin-top:6px">🔧 '+job.skills+'</div>':'')+'</div>';}).join('');}
function openJobModal(i){editJobIdx=i;var isEdit=i!==null&&i!==undefined;G('job-modal-title-text').textContent=isEdit?'Editar búsqueda':'Nueva búsqueda';if(isEdit){var j=copData.jobs[i];G('jm-title').value=j.title||'';G('jm-desc').value=j.desc||'';G('jm-salary').value=j.salary||'';G('jm-modality').value=j.modality||'Remoto';G('jm-seniority').value=j.seniority||'Sr';G('jm-contract').value=j.contract||'Full-time';G('jm-skills').value=j.skills||'';G('jm-deadline').value=j.deadline||'';G('jm-urgent').checked=j.urgent||false;}else{['jm-title','jm-desc','jm-salary','jm-skills'].forEach(function(id){G(id).value='';});G('jm-deadline').value='';G('jm-urgent').checked=false;G('jm-modality').value='Remoto';G('jm-seniority').value='Sr';G('jm-contract').value='Full-time';}G('job-modal').classList.add('open');}
function closeJobModal(){G('job-modal').classList.remove('open');editJobIdx=null;}
function saveJob(){var title=G('jm-title').value.trim();if(!title){alert('El título es obligatorio.');return;}var job={title:title,desc:G('jm-desc').value,salary:G('jm-salary').value,modality:G('jm-modality').value,seniority:G('jm-seniority').value,contract:G('jm-contract').value,skills:G('jm-skills').value,deadline:G('jm-deadline').value,urgent:G('jm-urgent').checked};if(editJobIdx!==null&&editJobIdx!==undefined){copData.jobs[editJobIdx]=job;}else{copData.jobs.push(job);}closeJobModal();renderCopJobs();}
function deleteJob(i){if(confirm('¿Eliminar esta búsqueda?')){copData.jobs.splice(i,1);renderCopJobs();}}
function saveCompanyProfile(){var email=(G('cop-email')||{}).value||'';if(email&&!isValidEmail(email)){alert('Email inválido.');return;}copData.name=G('cop-name').value;copData.tagline=G('cop-tagline').value;copData.industry=G('cop-industry').value;copData.size=G('cop-size').value;copData.contactEmail=email;copData.location=G('cop-location').value;copData.web=G('cop-web').value;copData.founded=G('cop-founded').value;copData.desc=G('cop-desc').value;copData.linkedin=G('cop-linkedin').value;copData.twitter=G('cop-twitter').value;copData.instagram=G('cop-instagram').value;copData.github=G('cop-github').value;copData.culture=Array.from(document.querySelectorAll('.culture-chip.on')).map(function(c){return c.textContent.trim();});persistAll();publishProfileToFirestore();addNotif('✅','Perfil de empresa guardado','ahora');if(USER_ROLE==='company')sortDataSetByMatch();go('swipe-scr');var b=document.createElement('div');b.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#16A34A;color:#fff;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:600;z-index:999;font-family:"Plus Jakarta Sans",sans-serif;white-space:nowrap';b.textContent='✓ Perfil guardado';document.body.appendChild(b);setTimeout(function(){b.remove();},2500);}
function goMyProfile(){if(USER_ROLE==='company'){go('company-profile-scr');initCompanyProfile();}else{go('candidate-profile-scr');initCPScreen();}}

// ── AGENDA ──
function getPlatformIcon(p){return{meet:'🎥',zoom:'💻',teams:'💼',presencial:'🏢'}[p]||'📅';}
function getPlatformName(p){return{meet:'Google Meet',zoom:'Zoom',teams:'Microsoft Teams',presencial:'Presencial'}[p]||p;}
function getPlatformClass(p){return{meet:'iv-btn-meet',zoom:'iv-btn-zoom',teams:'iv-btn-teams'}[p]||'iv-btn-ghost';}
function selectPlatform(p){selectedPlatform=p;['meet','zoom','teams','presencial'].forEach(function(pl){var el=G('plat-'+pl);if(el)el.classList.toggle('on',pl===p);});var lbl=G('sm-link-label'),hint=G('sm-link-hint'),inp=G('sm-link');if(p==='presencial'){if(lbl)lbl.textContent='📍 Dirección';if(inp)inp.placeholder='Ej: Av. Corrientes 1234, piso 5, CABA';if(hint)hint.textContent='Dirección donde se realizará la entrevista.';}else{var n=getPlatformName(p);if(lbl)lbl.textContent=getPlatformIcon(p)+' Link de '+n;if(inp)inp.placeholder='Pegá acá tu link de '+n;if(hint)hint.textContent='Creá la reunión en '+n+' y pegá el link acá.';}}
function addAltSlot(){altSlots.push({date:'',time:''});renderAltSlots();}
function removeAltSlot(i){altSlots.splice(i,1);renderAltSlots();}
function renderAltSlots(){var list=G('alt-slots-list');if(!list)return;list.innerHTML=altSlots.map(function(s,i){return'<div class="slot-row"><input type="date" class="sm-inp" value="'+s.date+'" onchange="altSlots['+i+'].date=this.value"><input type="time" class="sm-inp" value="'+s.time+'" onchange="altSlots['+i+'].time=this.value"><button class="slot-del" onclick="removeAltSlot('+i+')">×</button></div>';}).join('');}
function openScheduleModal(candidateName){
  // Gate: empresas Free no pueden agendar entrevistas
  if(!requirePro('agendar entrevistas')) return;
  editInterviewIdx=null;altSlots=[];selectedPlatform='meet';
  ['meet','zoom','teams','presencial'].forEach(function(p){var el=G('plat-'+p);if(el)el.classList.toggle('on',p==='meet');});
  var sel=G('sm-candidate');if(sel){sel.innerHTML='<option value="">Seleccioná un candidato...</option>'+matches.map(function(m){return'<option value="'+m.name+'"'+(m.name===candidateName?' selected':'')+'>'+m.name+' — '+m.role+'</option>';}).join('');}
  G('sm-date').value='';G('sm-time').value='10:00';G('sm-notes').value='';
  var li=G('sm-link');if(li)li.value='';
  renderAltSlots();selectPlatform(selectedPlatform);G('schedule-modal').classList.add('open');
}
function closeScheduleModal(){G('schedule-modal').classList.remove('open');editInterviewIdx=null;}
function saveScheduledInterview(){
  var sel=G('sm-candidate'),candName=sel?sel.value:'';
  var date=G('sm-date').value,time=G('sm-time').value;
  if(!candName){alert('Seleccioná un candidato.');return;}
  if(!date||!time){alert('Ingresá fecha y hora.');return;}
  var duration=G('sm-duration').value,notes=G('sm-notes').value;
  var link=(G('sm-link')||{value:''}).value.trim();
  var match=matches.find(function(m){return m.name===candName;});
  var iv={
    candidate:candName,
    candidateEmail:(match&&match.email)||'',
    recruiterEmail:copData.contactEmail||'',
    companyName:copData.name||'tNic',
    platform:selectedPlatform,
    date:date, time:time, duration:duration, notes:notes, link:link,
    status:'confirmed',
    altSlots:altSlots.filter(function(s){return s.date&&s.time;}),
    createdAt:new Date().toISOString()
  };
  if(match){iv.color=match.color;iv.av=match.av;iv.photo=match.photo||null;iv.role=match.role;}

  var realMatch = isRealMatch(match) && USER_ROLE==='company' && canSyncToFirestore();
  var existing = (editInterviewIdx!==null) ? agendaInterviews[editInterviewIdx] : null;

  if(realMatch){
    // Construir payload sin campos de UI local
    var payload = {
      companyUid: currentUser.uid,
      candidateUid: match.uid,
      candidateName: candName,
      companyName: copData.name||'',
      candidateEmail: iv.candidateEmail,
      recruiterEmail: iv.recruiterEmail,
      platform: selectedPlatform,
      date:date, time:time, duration:duration, notes:notes, link:link,
      status:'confirmed',
      altSlots: iv.altSlots,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    if(existing && existing.interviewId){
      db.collection('interviews').doc(existing.interviewId).set(payload,{merge:true})
        .catch(function(e){console.log('Interview update error:',e); alert('No se pudo actualizar la entrevista.');});
    } else {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      db.collection('interviews').add(payload)
        .catch(function(e){console.log('Interview create error:',e); alert('No se pudo crear la entrevista.');});
    }
    // El snapshot listener actualizará agendaInterviews; mostrar un toast por ahora.
  } else {
    // Camino demo / sin sync: mantener flujo local
    if(editInterviewIdx!==null){agendaInterviews[editInterviewIdx]=iv;}else{agendaInterviews.push(iv);}
  }

  if(pipeline[candName]===undefined||pipeline[candName]===0){
    pipeline[candName]=1;
    writePipelineStage(candName, 1);
  }

  var schedMsg='📅 Entrevista agendada: '+date+' a las '+time+'.'+(link?' Link: '+link:'')+(notes?' Nota: '+notes:'');
  if(isRealMatch(match)){
    db.collection('matches').doc(match.matchId).collection('messages').add({
      from:currentUser.uid,
      text:schedMsg,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    }).catch(function(e){console.log('Error escribiendo mensaje de entrevista:',e);});
  } else if(chats[candName]){
    chats[candName].push({from:'me',text:schedMsg,time:nowTime()});
  }
  addNotif('📅','Entrevista agendada con <strong>'+candName+'</strong> — '+date+' '+time,'ahora');
  persistAll();closeScheduleModal();buildAgenda();
}
function buildAgenda(){
  var isCandidate = USER_ROLE==='candidate';
  // Título adaptado por rol
  var titleEl=document.querySelector('#agenda-scr .agenda-title');
  if(titleEl) titleEl.textContent = isCandidate ? '📅 Mis próximas entrevistas' : '📅 Agenda de entrevistas';
  // Ocultar el botón "+ Nueva entrevista" para el candidato (no puede crear)
  var newBtn=document.querySelector('#agenda-scr .add-job-btn');
  if(newBtn) newBtn.style.display = isCandidate ? 'none' : '';

  var filtered=agendaInterviews.filter(function(iv){return agendaTab==='all'||iv.status===agendaTab;});
  G('agenda-sub').textContent=agendaInterviews.length+' entrevistas '+(isCandidate?'recibidas':'agendadas');
  var list=G('agenda-list');if(!list)return;
  if(!filtered.length){
    var title, body, cta = '';
    if(isCandidate){
      title = 'Sin entrevistas todavía';
      body  = 'Cuando una empresa con la que matcheaste agende una entrevista, te avisamos por mail, push y la vas a ver acá.';
    } else if(agendaTab === 'all'){
      title = 'Tu agenda está vacía';
      body  = 'Agendá una primera entrevista con tus candidatos. Soportamos Google Meet, Zoom y Teams.';
      cta   = '<button class="empty-cta" onclick="openScheduleModal(null)">Agendar entrevista</button>';
    } else {
      title = 'Sin entrevistas en este estado';
      body  = 'Cambiá de filtro arriba para ver el resto de tu agenda.';
    }
    list.innerHTML='<div class="empty-state">'
      +'<div class="empty-icon"><svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M12 14v4M10 16h4"/></svg></div>'
      +'<div class="empty-title">'+title+'</div>'
      +'<div class="empty-body">'+body+'</div>'
      +cta
      +'</div>';
    return;
  }
  list.innerHTML=filtered.map(function(iv,i){
    var av=iv.photo?'<img src="'+iv.photo+'">':iv.av||'?';
    var sc=iv.status==='confirmed'?'confirmed':iv.status==='proposed'?'proposed':'pending';
    var sl={confirmed:'✓ Confirmada',pending:'⏳ Pendiente',proposed:'💬 Propuesta'};
    // El "candidate" en la card es el contraparte: candidato ve nombre de empresa, empresa ve nombre de candidato.
    var displayName = isCandidate ? (iv.companyName||iv.candidate||'') : (iv.candidate||iv.candidateName||'');
    var linkHtml=iv.link?'<div class="iv-link"><span>'+getPlatformIcon(iv.platform)+'</span><a href="'+iv.link+'" target="_blank">'+iv.link+'</a><button class="iv-copy-btn" onclick="copyLink(\''+encodeURIComponent(iv.link)+'\')">Copiar</button></div>':'';
    var joinBtn = iv.link?'<button class="iv-btn '+getPlatformClass(iv.platform)+'" onclick="window.open(\''+iv.link+'\',\'_blank\')">'+getPlatformIcon(iv.platform)+' Unirse</button>':'';
    // Acciones de mutación sólo para empresa
    var mutateActions = isCandidate ? '' :
      '<button class="iv-btn iv-btn-ghost" onclick="openScheduleModal(\''+iv.candidate+'\')">✏️ Editar</button><button class="iv-btn iv-btn-danger" onclick="deleteInterview('+i+')">🗑</button>';
    return'<div class="interview-card '+sc+'"><div class="iv-header"><div class="iv-avatar" style="background:'+(iv.color||'var(--b)')+'">'+av+'</div><div><div class="iv-name">'+displayName+'</div><div class="iv-role">'+(iv.role||'')+'</div></div><div class="iv-status '+sc+'">'+sl[iv.status]+'</div></div><div class="iv-details"><div class="iv-detail-row"><span class="iv-detail-icon">📅</span>'+iv.date+' · '+iv.time+'</div><div class="iv-detail-row"><span class="iv-detail-icon">⏱</span>'+iv.duration+'</div><div class="iv-detail-row"><span class="iv-detail-icon">'+getPlatformIcon(iv.platform)+'</span>'+getPlatformName(iv.platform)+'</div>'+(iv.notes?'<div class="iv-detail-row"><span class="iv-detail-icon">📝</span>'+iv.notes+'</div>':'')+'</div>'+linkHtml+'<div class="iv-actions">'+joinBtn+mutateActions+'</div></div>';
  }).join('');
}
function switchAgendaTab(tab){agendaTab=tab;['all','pending','confirmed','proposed'].forEach(function(t){var el=G('ag-tab-'+t);if(el)el.classList.toggle('on',t===tab);});buildAgenda();}
function deleteInterview(i){
  if(!confirm('¿Eliminar esta entrevista?')) return;
  var iv=agendaInterviews[i];
  if(iv && iv.interviewId && canSyncToFirestore() && USER_ROLE==='company'){
    db.collection('interviews').doc(iv.interviewId).delete()
      .catch(function(e){console.log('Interview delete error:',e); alert('No se pudo eliminar la entrevista.');});
    // El snapshot listener removerá la entry local
  } else {
    agendaInterviews.splice(i,1); buildAgenda();
  }
}
function copyLink(enc){var link=decodeURIComponent(enc);if(navigator.clipboard){navigator.clipboard.writeText(link).then(function(){addNotif('📋','Link copiado al portapapeles','ahora');});}}
function acceptSlot(ivIdx,slotIdx){
  var iv=agendaInterviews[ivIdx]; if(!iv) return;
  var s=iv.altSlots[slotIdx]; if(!s) return;
  iv.date=s.date; iv.time=s.time; iv.status='confirmed'; iv.altSlots=[];
  if(iv.interviewId && canSyncToFirestore()){
    db.collection('interviews').doc(iv.interviewId).set({
      date:iv.date, time:iv.time, status:'confirmed', altSlots:[],
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true}).catch(function(e){console.log('acceptSlot write error:',e);});
    // snapshot re-renderiza; mostrar update inmediato igual
  }
  buildAgenda();
  addNotif('✅','Horario confirmado con <strong>'+iv.candidate+'</strong>','ahora');
}


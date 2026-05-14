// ── SCHEDULE ──
function buildSchedule(){
  var sel=G('cand-select');
  if(!matches.length){sel.innerHTML='<span style="font-size:12px;color:var(--gray)">Aún no tenés matches.</span>';return;}
  sel.innerHTML=matches.map(function(m){return'<div class="csel-chip'+(selectedInterview===m.name?' on':'')+'" onclick="selCand(this,\''+m.name+'\')">'+m.av+' '+m.name+'</div>';}).join('');
  var list=G('sch-list');if(!interviews.length){list.innerHTML='';return;}
  list.innerHTML='<div style="font-size:11px;font-weight:700;color:var(--gray);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Agendadas</div>'+interviews.map(function(iv){var icon=iv.type==='Video'?'💻':iv.type==='Presencial'?'🏢':'📞';return'<div class="sch-item"><div class="sch-icon">'+icon+'</div><div class="sch-info"><div class="sch-name">'+iv.name+'</div><div class="sch-detail">'+iv.date+' · '+iv.time+' · '+iv.duration+'</div></div><div class="sch-badge">'+iv.type+'</div></div>';}).join('');
}
function selCand(el,name){document.querySelectorAll('.csel-chip').forEach(function(c){c.classList.remove('on');});el.classList.add('on');selectedInterview=name;}
function selectType(el){document.querySelectorAll('.itype').forEach(function(t){t.classList.remove('on');});el.classList.add('on');}
function saveInterview(){
  if(!selectedInterview){alert('Seleccioná un candidato primero.');return;}
  var date=G('sch-date').value,time=G('sch-time').value;if(!date||!time){alert('Completá fecha y hora.');return;}
  var type=document.querySelector('.itype.on').dataset.type;var duration=G('sch-duration').value;var notes=G('sch-notes').value;
  interviews.push({name:selectedInterview,date:date,time:time,type:type,duration:duration,notes:notes});
  stats.interviews++;if(pipeline[selectedInterview]===0)pipeline[selectedInterview]=1;
  addNotif('📅','Entrevista con <strong>'+selectedInterview+'</strong> — '+date+' '+time,'ahora');
  G('sch-date').value='';G('sch-notes').value='';selectedInterview=null;buildSchedule();
}

// ── MATCHES LIST + CHAT DIRECTO ──
var chatFilter='all';

function setChatFilter(f){
  chatFilter=f;
  ['all','unread','active'].forEach(function(x){
    var el=G('cf-'+x);if(el)el.classList.toggle('on',x===f);
  });
  buildList();
}

function buildList(){
  // Safety net: si entramos a la lista y el listener no está activo, arrancarlo.
  // Cubre estados donde onLoginSuccess no llegó a llamar listenForMatches.
  if (currentUser && !currentUser.isAnonymous && !matchesUnsub) {
    try { listenForMatches(); } catch(e) { console.log('buildList: listenForMatches falló', e); }
  }
  var title=G('matches-title');
  if(title)title.textContent=USER_ROLE==='candidate'?'Mis Conversaciones':'Chats con candidatos';
  G('msub2').textContent=matches.length+' conexión'+(matches.length===1?'':'es')+' activa'+(matches.length===1?'':'s');

  // Mostrar botón "+ Chat" si hay matches
  var btn=G('new-chat-btn');
  if(btn)btn.style.display=matches.length?'block':'none';

  var list=G('mlist');
  if(!matches.length){
    list.innerHTML='<div class="empty-state">'
      +'<div class="empty-icon"><svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>'
      +'<div class="empty-title">Aún no tenés conexiones</div>'
      +'<div class="empty-body">Explorá perfiles y hacé swipe a la derecha. Cuando alguien también te elige, se abre el chat.</div>'
      +'<button class="empty-cta" onclick="go(\'swipe-scr\')">Explorar perfiles</button>'
      +'</div>';
    return;
  }

  // Aplicar filtro
  var filtered=matches.filter(function(m){
    if(chatFilter==='unread')return m.unread;
    if(chatFilter==='active')return chats[m.name]&&chats[m.name].length>0;
    return true;
  });

  if(!filtered.length){
    list.innerHTML='<div class="nomatch"><div style="font-size:32px">🔍</div><div style="font-size:13px">Sin resultados para este filtro</div></div>';
    return;
  }

  // Ordenar: primero los que tienen mensajes sin leer, luego con mensajes, luego el resto
  filtered.sort(function(a,b){
    if(a.unread&&!b.unread)return -1;
    if(!a.unread&&b.unread)return 1;
    var ha=chats[a.name]&&chats[a.name].length>0;
    var hb=chats[b.name]&&chats[b.name].length>0;
    if(ha&&!hb)return -1;
    if(!ha&&hb)return 1;
    return 0;
  });

  list.innerHTML=filtered.map(function(m){
    var av=m.photo?'<img src="'+m.photo+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%">':m.av;
    var hasChat=chats[m.name]&&chats[m.name].length>0;
    var lastMsg=m.lastMsg||(hasChat?chats[m.name][chats[m.name].length-1].text:'Mutual Interest · Tocá para chatear');
    var subLabel=m.type==='company'?'🏢 Empresa':'🧑‍💼 Candidato';
    // Escapar nombre para uso en atributo HTML
    var safeName=m.name.replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    return'<div class="mitem" style="flex-direction:column;align-items:stretch;gap:0">'
      +'<div style="display:flex;align-items:center;gap:10px">'
      +'<div class="miav" style="background:'+m.color+'">'+av+'</div>'
      +'<div class="miinfo">'
      +'<div class="miname" style="display:flex;align-items:center;gap:6px">'+m.name+(m.unread?'<div class="miunread">Nuevo</div>':'')+'</div>'
      +'<div class="mirole">'+m.role+' · <span style="color:var(--b);font-weight:700">'+subLabel+'</span></div>'
      +'<div class="milast">'+lastMsg+'</div>'
      +'</div>'
      +'<div class="miright"><div class="mitime">'+(m.time||'')+'</div></div>'
      +'</div>'
      +'<div class="mitem-actions">'
      +'<button class="mitem-btn mitem-btn-chat" data-mname="'+safeName+'" onclick="event.stopPropagation();chatPrev=\'matches-scr\';openChatByName(this.dataset.mname)">💬 '+(hasChat?'Continuar chat':'Iniciar chat')+'</button>'
      +'<button class="mitem-btn mitem-btn-sched" data-mname="'+safeName+'" onclick="event.stopPropagation();openScheduleModal(this.dataset.mname)">📅 Agendar</button>'
      +'<button class="mitem-btn mitem-btn-info" data-mname="'+safeName+'" onclick="event.stopPropagation();viewMatchByName(this.dataset.mname)">👤 Ver perfil</button>'
      +'</div>'
      +'</div>';
  }).join('');
}

function viewMatchDetail(m){currentDetail=m;detailPrev='matches-scr';buildDetailScreen(m);go('detail-scr');}

// Busca por nombre — evita bugs de índice con listas filtradas/reordenadas
function openChatByName(name){
  var m=matches.find(function(x){return x.name===name;});
  if(m)openChat(m);
}
function viewMatchByName(name){
  var m=matches.find(function(x){return x.name===name;});
  if(m){currentDetail=m;detailPrev='matches-scr';buildDetailScreen(m);go('detail-scr');}
}

function showNewChatOptions(){
  // Muestra modal para elegir con quién chatear (todos los matches)
  var modal=G('new-chat-modal');if(modal)modal.style.display='flex';
  var list=G('new-chat-list');if(!list)return;
  if(!matches.length){list.innerHTML='<div style="text-align:center;color:var(--gray);padding:20px">Sin matches aún</div>';return;}
  list.innerHTML=matches.map(function(m){
    var av=m.photo?'<img src="'+m.photo+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%">':m.av;
    var hasChat=chats[m.name]&&chats[m.name].length>0;
    var safeName=m.name.replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    return'<div class="mitem-btn" data-mname="'+safeName+'" style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--light);border-radius:var(--rl);cursor:pointer;border:1.5px solid '+(hasChat?'var(--b)':'var(--brd)')+'" onclick="closeNewChatModal();chatPrev=\'matches-scr\';openChatByName(this.dataset.mname)">'
      +'<div class="miav" style="background:'+m.color+';width:40px;height:40px;flex-shrink:0">'+av+'</div>'
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:13px;font-weight:700;color:var(--dark)">'+m.name+'</div>'
      +'<div style="font-size:11px;color:var(--gray)">'+m.role+'</div>'
      +'</div>'
      +(hasChat?'<div style="font-size:10px;background:var(--blight);color:var(--b);border-radius:8px;padding:3px 8px;font-weight:600">Chat activo</div>':'<div style="font-size:10px;background:var(--bxlight);color:var(--gray);border-radius:8px;padding:3px 8px;font-weight:600">Iniciar</div>')
      +'</div>';
  }).join('');
}
function closeNewChatModal(){var m=G('new-chat-modal');if(m)m.style.display='none';}

function updateBadge(){var n=matches.filter(function(m){return m.unread;}).length;G('nbadge').textContent=n;G('nbadge').classList.toggle('on',n>0);}


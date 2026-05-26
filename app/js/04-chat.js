// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// CHAT — real-time via Firestore para matches reales (matches/{matchId}/messages).
// Para perfiles demo (sin matchId / sin login) se conserva el chat local con bot.
// ─────────────────────────────────────────────
function isRealMatch(person){
  return !!(person && person.matchId && currentUser && !currentUser.isAnonymous);
}
function escapeHtml(s){
  return String(s==null?'':s).replace(/[&<>"']/g,function(c){
    return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function fmtTs(ts){
  if(!ts||!ts.toDate)return'';
  var dt=ts.toDate();
  return(dt.getHours()<10?'0':'')+dt.getHours()+':'+(dt.getMinutes()<10?'0':'')+dt.getMinutes();
}
function unsubscribeFromChatMessages(){
  if(currentChatUnsub){try{currentChatUnsub();}catch(e){}currentChatUnsub=null;}
}

// ─────────────────────────────────────────────
// PIPELINE — sync con pipelines/{companyUid}/items/{candidateUid}
// Sólo empresas. Para candidatos demos (sin uid) queda local.
// ─────────────────────────────────────────────
function canSyncToFirestore(){ return !!(currentUser && !currentUser.isAnonymous); }
function findMatchByName(name){ return matches.find(function(m){return m.name===name;}); }
function findUidByName(name){ var m=findMatchByName(name); return m&&m.uid?m.uid:null; }
function findNameByUid(uid){ var m=matches.find(function(x){return x.uid===uid;}); return m?m.name:null; }

function reconcilePipelineFromUids(){
  matches.forEach(function(m){
    if(m.uid && pipelineByUid[m.uid]!==undefined){
      pipeline[keyOf(m)]=pipelineByUid[m.uid];
    }
  });
}

function subscribeToPipeline(){
  if(pipelineUnsub){try{pipelineUnsub();}catch(e){}pipelineUnsub=null;}
  if(!canSyncToFirestore() || USER_ROLE!=='company') return;
  pipelineUnsub=db.collection('pipelines').doc(currentUser.uid).collection('items')
    .onSnapshot(function(snap){
      // Migración 1-vez: si snapshot está vacío y hay pipeline en localStorage, subir.
      if(!pipelineMigrated && snap.empty){
        pipelineMigrated=true;
        Object.keys(pipeline).forEach(function(name){
          var uid=findUidByName(name);
          if(uid && pipeline[name]>0){
            db.collection('pipelines').doc(currentUser.uid).collection('items').doc(uid).set({
              stage:pipeline[name],
              updatedAt:firebase.firestore.FieldValue.serverTimestamp()
            }).catch(function(e){console.log('Pipeline migration error:',e);});
          }
        });
        return; // listener se va a re-disparar con los items
      }
      pipelineMigrated=true;
      snap.docs.forEach(function(doc){
        var d=doc.data();
        pipelineByUid[doc.id]=(typeof d.stage==='number')?d.stage:0;
      });
      reconcilePipelineFromUids();
      persistAll();
      var scr=G('pipeline-scr'); if(scr && scr.classList.contains('on')) buildKanban();
    },function(err){console.log('Pipeline listener error:',err);});
}

// Acepta un match-object (preferido, robusto contra colisiones por nombre) o
// un string (legacy: nombre). Si se le pasa string, busca el match por nombre
// — puede dar el match equivocado si hay nombres repetidos, por eso preferir
// pasar el match completo cuando se tenga.
function writePipelineStage(matchOrName, stage){
  if(!canSyncToFirestore() || USER_ROLE!=='company') return;
  var uid;
  if(typeof matchOrName === 'string'){
    uid = findUidByName(matchOrName);
  } else if(matchOrName){
    uid = matchOrName.uid;
  }
  if(!uid) return; // demo / sin uid: no sync
  pipelineByUid[uid]=stage;
  db.collection('pipelines').doc(currentUser.uid).collection('items').doc(uid).set({
    stage:stage,
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  },{merge:true}).catch(function(e){console.log('Pipeline write error:',e);});
}

// ─────────────────────────────────────────────
// INTERVIEWS — sync con interviews/{interviewId}
// Empresa: write/update/delete. Candidato: solo lectura de las suyas.
// ─────────────────────────────────────────────
function subscribeToInterviews(){
  if(interviewsUnsub){try{interviewsUnsub();}catch(e){}interviewsUnsub=null;}
  if(!canSyncToFirestore()) return;
  var field = USER_ROLE==='company' ? 'companyUid' : 'candidateUid';
  interviewsUnsub=db.collection('interviews').where(field,'==',currentUser.uid)
    .onSnapshot(function(snap){
      // Mantener entradas locales sin interviewId (demos)
      var localOnly = agendaInterviews.filter(function(iv){return !iv.interviewId;});
      var fromFirestore = snap.docs.map(function(doc){
        var d=doc.data(); d.interviewId=doc.id;
        // Enriquecer con metadata visual desde matches si la tenemos
        var m = matches.find(function(x){return x.uid===d.candidateUid;}) ||
                matches.find(function(x){return x.uid===d.companyUid;});
        if(m){ d.color=d.color||m.color; d.av=d.av||m.av; d.photo=d.photo||m.photo||null; d.role=d.role||m.role; }
        // Para que el UI muestre el nombre de quien corresponda
        d.candidate = USER_ROLE==='company' ? (d.candidateName||d.candidate||'') : (d.companyName||'');
        return d;
      });
      agendaInterviews = fromFirestore.concat(localOnly);
      persistAll();
      var scr=G('agenda-scr'); if(scr && scr.classList.contains('on')) buildAgenda();
    },function(err){console.log('Interviews listener error:',err);});
}

function unsubscribeFromPipelineAndInterviews(){
  if(pipelineUnsub){try{pipelineUnsub();}catch(e){}pipelineUnsub=null;}
  if(interviewsUnsub){try{interviewsUnsub();}catch(e){}interviewsUnsub=null;}
  pipelineByUid={}; pipelineMigrated=false;
}
function subscribeToChatMessages(person){
  unsubscribeFromChatMessages();
  if(!isRealMatch(person))return;
  currentChatUnsub=db.collection('matches').doc(person.matchId)
    .collection('messages').orderBy('createdAt','asc')
    .onSnapshot(function(snap){
      chats[person.name]=snap.docs.map(function(doc){
        var d=doc.data();
        return{
          from:(d.from===currentUser.uid)?'me':'them',
          text:d.text||'',
          time:fmtTs(d.createdAt)
        };
      });
      var arr=chats[person.name];
      var last=arr.length?arr[arr.length-1]:null;
      var mx=matches.find(function(x){return x.name===person.name;});
      if(mx&&last){mx.lastMsg=last.text;mx.time=last.time||'ahora';}
      if(curChat&&curChat.name===person.name)renderChat();
    },function(err){console.log('Chat listener error:',err);});
}

function openChat(person){
  // Gate: empresas Free no pueden chatear con sus matches
  if(!requirePro('chatear con tus matches')) return;
  curChat=person;
  var real=isRealMatch(person);

  if(real){
    // Suscribir al snapshot real-time. Sin welcome ni bot.
    chats[person.name]=chats[person.name]||[];
    subscribeToChatMessages(person);
  } else {
    // Match no-real (caso defensivo: el matchId todavía no llegó por el listener,
    // o es un perfil sin uid). Sin respuestas falsas — el usuario podrá escribir;
    // cuando el matchId llegue, el próximo openChat se suscribe al snapshot real.
    chats[person.name]=chats[person.name]||[];
  }

  // Marcar como leído
  var m=matches.find(function(x){return x.name===person.name;});
  if(m){m.unread=false;updateBadge();}

  // Render header del chat
  var chav=G('chav'),chimg=G('chav-img'),chinit=G('chav-init');
  chav.style.background=person.color;
  if(person.photo){chimg.src=person.photo;chimg.style.display='block';chinit.style.display='none';}
  else{chimg.style.display='none';chinit.style.display='block';chinit.textContent=person.av;}

  G('chname').textContent=person.name;
  G('chrole').textContent=person.role+' · '+(person.type==='company'?'Empresa':'Candidato');

  renderChat();go('chat-scr');
}
function renderChat(){
  if(!curChat)return;
  var h=chats[curChat.name]||[];
  G('chatbody').innerHTML=h.map(function(m){
    return'<div class="bw '+m.from+'"><div class="bub '+m.from+'">'+escapeHtml(m.text)+'</div><div class="bt">'+escapeHtml(m.time||'')+'</div></div>';
  }).join('');
  G('chatbody').scrollTop=G('chatbody').scrollHeight;
}

function sendMsg(){
  var inp=G('chatin');if(!inp.value.trim()||!curChat)return;
  var text=inp.value.trim();
  inp.value='';

  if(isRealMatch(curChat)){
    // Match real: escribir en Firestore. El snapshot pinta la burbuja.
    db.collection('matches').doc(curChat.matchId).collection('messages').add({
      from:currentUser.uid,
      text:text,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    }).catch(function(e){
      console.log('Error enviando mensaje:',e);
      alert('No se pudo enviar el mensaje. Probá de nuevo.');
    });
    return;
  }

  // Match no-real (caso defensivo): guardamos el mensaje local sin respuestas falsas.
  chats[curChat.name]=chats[curChat.name]||[];
  chats[curChat.name].push({from:'me',text:text,time:nowTime()});
  var mx=matches.find(function(x){return x.name===curChat.name;});
  if(mx){mx.lastMsg=text;mx.time='ahora';}
  renderChat();
}

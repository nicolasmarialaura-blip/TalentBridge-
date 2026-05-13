// ── SCORING ──
function tokenizeText(text){if(!text)return[];return text.toLowerCase().replace(/[^a-z0-9áéíóúüñ\s]/gi,' ').split(/\s+/).filter(function(w){return w.length>2;});}
function scoreCandidateVsJD(c,jdText){
  if(!jdText)return{score:0,matched:[]};
  var jdT=tokenizeText(jdText);
  var cT=tokenizeText([c.name,c.role,c.about,(c.skills||[]).join(' '),c.avail,c.exp,c.langs,c.cvText||''].join(' '));
  var jdSet={};jdT.forEach(function(t){jdSet[t]=1;});
  var matched=[],seen={};
  cT.forEach(function(t){if(jdSet[t]&&!seen[t]){matched.push(t);seen[t]=1;}});
  var u=Object.keys(jdSet).length;
  var s=u>0?Math.round((matched.length/u)*100):0;
  if(c.cvData)s=Math.min(100,s+8);
  return{score:Math.min(100,s),matched:matched.slice(0,6)};
}
function scoreCompanyVsCandidate(co,cp){
  var cpT=tokenizeText([cp.name,cp.role,cp.about,(cp.skills||[]).join(' '),cp.langs,cp.exp].join(' '));
  var coText=[co.name,co.about,(co.skills||[]).join(' '),co.jd||''].join(' ');
  if(copData&&copData.jobs&&copData.jobs.length)copData.jobs.forEach(function(j){coText+=' '+j.title+' '+j.desc+' '+j.skills;});
  var coSet={};tokenizeText(coText).forEach(function(t){coSet[t]=1;});
  var matched=[],seen={};cpT.forEach(function(t){if(coSet[t]&&!seen[t]){matched.push(t);seen[t]=1;}});
  var u=Object.keys(coSet).length;
  return{score:Math.min(100,u>0?Math.round((matched.length/u)*100):0),matched:matched.slice(0,6)};
}
function sortDataSetByMatch(){
  if(!dataSet||!dataSet.length)return;
  var jdText=USER_ROLE==='company'?(copData.jobs||[]).map(function(j){return j.title+' '+j.desc+' '+j.skills;}).join(' '):'';
  dataSet.forEach(function(item){
    var r=USER_ROLE==='company'?scoreCandidateVsJD(item,jdText):scoreCompanyVsCandidate(item,cpData);
    item._matchScore=r.score;item._matchKeywords=r.matched;
  });
  dataSet.sort(function(a,b){return(b._matchScore||0)-(a._matchScore||0);});
  idx=0;
}

// ── RENDER ──
function render(){
  if(idx>=dataSet.length){go('empty-scr');return;}
  var c=dataSet[idx];stats.seen++;
  var img=G('cav-img'),init=G('cav-initials'),av=G('cav');
  av.style.background=c.color;
  if(c.photo){img.src=c.photo;img.style.display='block';init.style.display='none';}
  else{img.style.display='none';init.style.display='block';init.textContent=c.av;}
  G('cname').textContent=c.name;G('cloc').textContent='📍 '+c.loc;G('crole').textContent=c.role;
  G('cabout').textContent=c.about;G('csal').textContent=c.sal;
  G('cskills').innerHTML=(c.skills||[]).map(function(s){return'<span class="sk">'+s+'</span>';}).join('');
  var sc=(c._matchScore!==undefined)?c._matchScore:c.score;
  G('cbar').style.width=sc+'%';G('cpct').textContent=sc+'%';
  G('cavail').textContent=c.avail;G('cexp').textContent=c.exp;G('clang').textContent=c.langs;
  var isComp=c.type==='company';
  G('cbadge').style.display=isComp?'block':'none';
  G('company-extra-row').style.display=isComp?'flex':'none';
  G('company-extra-row2').style.display=isComp?'flex':'none';
  if(isComp){G('csize').textContent=c.size;G('cindustry').textContent=c.industry;}
  G('cv-section').style.display=isComp?'none':'block';
  var card=G('card');card.removeAttribute('style');
  G('extra').classList.remove('on');G('dbtn').textContent='Más info ▾';
  updateCVUI();G('sl').style.opacity='0';G('sp').style.opacity='0';
  G('card-bg').style.display=idx+1<dataSet.length?'block':'none';
}

// ── CARD EVENTS ──
function initCardEvents(){
  var card=G('card');if(!card||card._bound)return;card._bound=true;
  card.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;dragging=true;dx=0;card.style.transition='none';},{passive:true});
  card.addEventListener('touchmove',function(e){if(!dragging)return;dx=e.touches[0].clientX-tx;card.style.transform='translateX('+dx+'px) rotate('+(dx*.04)+'deg)';G('sl').style.opacity=Math.min(Math.max(dx/90,0),1);G('sp').style.opacity=Math.min(Math.max(-dx/90,0),1);},{passive:true});
  card.addEventListener('touchend',function(){dragging=false;if(Math.abs(dx)>80){swipe(dx>0?'right':'left');}else{card.style.transition='transform .3s';card.style.transform='';G('sl').style.opacity='0';G('sp').style.opacity='0';}});
  card.addEventListener('mousedown',function(e){if(e.target.closest('.cav-upload')||e.target.closest('input'))return;mdown=true;mx2=e.clientX;card.style.transition='none';});
  document.addEventListener('mousemove',function(e){if(!mdown)return;dx=e.clientX-mx2;card.style.transform='translateX('+dx+'px) rotate('+(dx*.04)+'deg)';G('sl').style.opacity=Math.min(Math.max(dx/90,0),1);G('sp').style.opacity=Math.min(Math.max(-dx/90,0),1);});
  document.addEventListener('mouseup',function(){if(!mdown)return;mdown=false;if(Math.abs(dx)>80){swipe(dx>0?'right':'left');}else{card.style.transition='transform .3s';card.style.transform='';G('sl').style.opacity='0';G('sp').style.opacity='0';}});
}

function setMode(m){mode=m;document.querySelectorAll('.mtab').forEach(function(t,i){t.classList.toggle('on',i===(m==='candidates'?0:1));});dataSet=m==='candidates'?CANDIDATES:COMPANIES;idx=0;render();go('swipe-scr');}
function handlePhoto(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){var c=dataSet[idx];c.photo=ev.target.result;G('cav-img').src=ev.target.result;G('cav-img').style.display='block';G('cav-initials').style.display='none';};r.readAsDataURL(f);}
function handleCV(e){var f=e.target.files[0];if(!f)return;var c=dataSet[idx];var r=new FileReader();r.onload=function(ev){c.cvData=ev.target.result;c.cvName=f.name;G('cv-filename').textContent=f.name;G('cv-empty').style.display='none';G('cv-loaded').style.display='block';};r.readAsDataURL(f);}
function viewCV(e){e.stopPropagation();var c=dataSet[idx];if(!c.cvData)return;var w=window.open();w.document.write('<iframe src="'+c.cvData+'" style="width:100%;height:100%;border:none"></iframe>');}
function removeCV(e){e.stopPropagation();var c=dataSet[idx];c.cvData=null;c.cvName=null;G('cv-empty').style.display='block';G('cv-loaded').style.display='none';G('cv-in').value='';}
function updateCVUI(){var c=dataSet[idx];if(c.cvData){G('cv-filename').textContent=c.cvName||'CV.pdf';G('cv-empty').style.display='none';G('cv-loaded').style.display='block';}else{G('cv-empty').style.display='block';G('cv-loaded').style.display='none';G('cv-in').value='';}}
function toggleExtra(e){e.stopPropagation();G('extra').classList.toggle('on');G('dbtn').textContent=G('extra').classList.contains('on')?'Ocultar ▴':'Más info ▾';}

function swipe(dir){
  var card=G('card');
  var target=dataSet[idx];
  card.style.transition='transform .4s,opacity .4s';
  card.style.transform='translateX('+(dir==='right'?'500px':'-500px')+') rotate('+(dir==='right'?'18deg':'-18deg')+')';
  card.style.opacity='0';
  setTimeout(function(){
    // Persistir el swipe en Firestore (la Cloud Function detectará match mutuo)
    if(dir==='right'){stats.likes++;writeSwipeToFirestore(target,'like');}
    else{writeSwipeToFirestore(target,'pass');}
    // El match se muestra cuando el listener de /matches dispara handleMatchDoc
    idx++;render();
  },400);
}

// ── LANG ──
function pickLang(lang){LANG=lang;['es','en'].forEach(function(l){var o=G('lopt-'+l);if(o)o.classList.toggle('sel',l===lang);});var b=G('lbtn');if(b)b.textContent=lang==='en'?'Continue →':'Continuar →';}

function startApp(){
  // Mostrar login screen primero
  go('login-scr');
  // Escuchar cambios de auth state
  auth.onAuthStateChanged(function(user) {
    if (user) {
      // Usuario ya logueado — ir directo
      currentUser = user;
      onLoginSuccess(user);
    }
    // Si no hay usuario, quedarse en login-scr
  });
}
function changeLang(){go('lang-scr');}

// ── MATCH ──
function showMI(){
  var c=curMatch;
  G('msub').innerHTML='<strong>'+c.name+'</strong> y vos tienen Mutual Interest';
  var mav=G('mav2');mav.style.background=c.color;
  mav.innerHTML=c.photo?'<img src="'+c.photo+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%">':c.av;
  go('match-scr');
}
function doContinue(){addMatch(curMatch,false);idx++;chatPrev='swipe-scr';go('swipe-scr');render();addNotif('🎉','Mutual Interest con <strong>'+curMatch.name+'</strong>','ahora');}
function doOpenChat(){addMatch(curMatch,true);idx++;chatPrev='swipe-scr';openChat(curMatch);addNotif('💬','<strong>'+curMatch.name+'</strong> te envió un mensaje','ahora');}
function doScheduleFromMatch(){addMatch(curMatch,false);idx++;schedulePrev='match-scr';selectedInterview=curMatch.name;go('schedule-scr');buildSchedule();}
function addMatch(c,msg){
  if(!matches.find(function(m){return m.name===c.name;})){
    var o=Object.assign({},c);
    o.lastMsg=msg?'¡Hola! Me interesa tu perfil. ¿Cuándo podemos hablar?':'';
    o.unread=msg;o.time='ahora';o.initiatedBy='them';
    matches.push(o);stats.mc++;
    if(pipeline[c.name]===undefined)pipeline[c.name]=0;
    updateBadge();
  }
}


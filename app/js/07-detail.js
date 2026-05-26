// ── FILTERS ──
var CAND_FILTERS=[{title:'Modalidad',chips:['Remoto','Híbrido','Presencial'],on:[0]},{title:'Seniority',chips:['Jr','Semi-Sr','Sr','Lead'],on:[1,2]},{title:'Stack',chips:['Frontend','Backend','Full Stack','Data','DevOps','Mobile','Design'],on:[0,1]},{title:'Disponibilidad',chips:['Inmediata','2 semanas','1 mes'],on:[0,1]}];
var COMP_FILTERS=[{title:'Modalidad',chips:['Remoto','Híbrido','Presencial'],on:[0]},{title:'Industria',chips:['E-commerce','Fintech','Healthtech','Consulting IT','SaaS','Travel Tech','Ciberseguridad'],on:[]},{title:'Tamaño',chips:['Startup <50','Scale-up 50–500','Corporación 500+'],on:[]},{title:'Salario',chips:['$2k–$5k','$5k–$9k','$9k–$15k'],on:[0,1]}];
function openFilters(){var fs=mode==='candidates'?CAND_FILTERS:COMP_FILTERS;G('filter-body').innerHTML=fs.map(function(f){return'<div class="fsec"><div class="fstitle">'+f.title+'</div><div class="chips">'+f.chips.map(function(c,i){return'<div class="chip'+(f.on.indexOf(i)>=0?' on':'')+'" onclick="this.classList.toggle(\'on\')">'+c+'</div>';}).join('')+'</div></div>';}).join('');go('filter-scr');}
function applyFilters(){var chips=[].slice.call(document.querySelectorAll('#filter-body .chip.on')).map(function(c){return c.textContent;});G('pfilters').innerHTML=chips.join(' · ')||'Sin filtros activos';go('swipe-scr');}

// ── PROFILE STATS ──
function buildProfile(){G('sseen').textContent=stats.seen;G('slikes').textContent=stats.likes;G('smatches').textContent=stats.mc;G('sinterviews').textContent=stats.interviews;var cols=[0,0,0,0];for(var k in pipeline){var s=pipeline[k];if(s>=0&&s<=3)cols[s]++;}for(var i=0;i<4;i++)G('pk'+i).textContent=cols[i];}

// ── NOTIFS ──
function openNotifs(){renderNotifs();G('npanel').classList.add('on');}
function closeNotifs(){G('npanel').classList.remove('on');}
function renderNotifs(){var list=G('nlist');if(!notifs.length){list.innerHTML='<div class="nempty"><div style="font-size:36px">🔔</div><div>Sin notificaciones</div></div>';updateNdot();return;}list.innerHTML=notifs.map(function(n,i){return'<div class="nitem '+(n.unread?'unread':'')+'" onclick="markRead('+i+')"><div class="nicon">'+n.icon+'</div><div style="flex:1"><div class="ntext">'+n.text+'</div><div class="ntime">'+n.time+'</div></div>'+(n.unread?'<div class="nudot"></div>':'')+'</div>';}).join('');updateNdot();}
function markRead(i){notifs[i].unread=false;renderNotifs();}
function clearNotifs(){notifs=[];renderNotifs();}
function addNotif(icon,text,time){notifs.unshift({icon:icon,text:text,time:time,unread:true});updateNdot();}
function updateNdot(){G('ndot').classList.toggle('on',notifs.some(function(n){return n.unread;}));}

// ── SEARCH ──
function openSearch(){G('spanel').classList.add('on');var inp=G('search-inp');if(inp){inp.placeholder=mode==='candidates'?'Buscar candidatos...':'Buscar empresas...';inp.value='';}var t=G('sempty-target');if(t)t.textContent=mode==='candidates'?'candidatos':'empresas';renderSearchEmpty();setTimeout(function(){if(inp)inp.focus();},100);}
function closeSearch(){G('spanel').classList.remove('on');}
function clearSearchInput(){var inp=G('search-inp');if(inp){inp.value='';inp.focus();}runSearch();}
function renderSearchEmpty(){var list=G('slist');if(!list)return;list.innerHTML='<div class="sempty"><div style="font-size:42px;margin-bottom:8px">🔍</div><div style="font-weight:700;color:var(--dark);margin-bottom:4px">Buscá en '+(mode==='candidates'?'candidatos':'empresas')+'</div><div style="font-size:12px;color:var(--gray);line-height:1.5;max-width:240px;margin:0 auto">Nombre, rol, skills, ubicación, idiomas...</div></div>';var st=G('sstats');if(st)st.textContent='';var cb=G('sclear-btn');if(cb)cb.style.display='none';}
function searchableText(item){return[item.name,item.role,item.loc,item.sal,item.about,item.avail,item.exp,item.langs,item.size,item.industry,(item.skills||[]).join(' '),(item.activeJobs||[]).map(function(j){return j.title+' '+j.sal;}).join(' '),item.jd||''].join(' ').toLowerCase();}
function runSearch(){
  var inp=G('search-inp');var q=(inp?inp.value:'').trim().toLowerCase();
  var cb=G('sclear-btn');if(cb)cb.style.display=q?'flex':'none';
  if(!q){renderSearchEmpty();return;}
  var tokens=q.split(/\s+/).filter(function(t){return t.length>=2;});
  if(!tokens.length){renderSearchEmpty();return;}
  var pool=mode==='candidates'?CANDIDATES:COMPANIES;
  var results=pool.map(function(item){var blob=searchableText(item);var matched=tokens.filter(function(t){return blob.indexOf(t)>=0;}).length;return{item:item,matched:matched};}).filter(function(r){return r.matched>0;}).sort(function(a,b){return b.matched-a.matched||(b.item.score||0)-(a.item.score||0);});
  var list=G('slist'),st=G('sstats');
  if(!results.length){list.innerHTML='<div class="sempty"><div style="font-size:42px;margin-bottom:8px">😕</div><div style="font-weight:700;color:var(--dark);margin-bottom:4px">Sin resultados</div></div>';if(st)st.textContent='';return;}
  if(st)st.textContent=results.length+' resultado'+(results.length===1?'':'s');
  list.innerHTML=results.map(function(r){
    var item=r.item;var av=item.photo?'<img src="'+item.photo+'" alt="">':item.av;
    var safe=(item.name||'').replace(/'/g,"\\'");
    return'<div class="sresult" onclick="openFromSearch(\''+safe+'\')"><div class="sr-av" style="background:'+(item.color||'#2B5CE6')+'">'+av+'</div><div class="sr-info"><div class="sr-name">'+(item.type==='company'?'🏢 ':'')+item.name+'</div><div class="sr-role">'+(item.role||'')+'</div><div class="sr-meta">'+(item.exp||'')+(item.avail?' · '+item.avail:'')+'</div></div>'+(item.score?'<div class="sr-score">'+item.score+'%</div>':'')+'</div>';
  }).join('');
}
function openFromSearch(name){var pool=mode==='candidates'?CANDIDATES:COMPANIES;var item=pool.find(function(x){return x.name===name;});if(!item)return;closeSearch();currentDetail=item;detailPrev='swipe-scr';buildDetailScreen(item);go('detail-scr');}

// ── DETAIL ──
function openDetail(e){if(e)e.stopPropagation();var c=dataSet[idx];currentDetail=c;detailPrev='swipe-scr';buildDetailScreen(c);go('detail-scr');}
function buildDetailScreen(c){
  var av=G('detail-av');av.style.background=c.color;
  av.innerHTML=c.photo?'<img src="'+c.photo+'">':c.av;
  G('detail-name').textContent=c.name;G('detail-role2').textContent=c.role;G('detail-loc2').textContent='📍 '+c.loc;
  var isMatch=!!matches.find(function(m){return m.name===c.name;});
  G('detail-like-btn').style.display=isMatch?'none':'block';G('detail-chat-btn').style.display=isMatch?'block':'none';
  var isComp=c.type==='company';
  var sc=c.score;
  var skills=(c.skills||[]).map(function(s){return'<span class="sk">'+s+'</span>';}).join('');
  var body='';
  body+='<div class="detail-section"><div class="detail-section-title">Match Score</div><div class="detail-score-row"><div class="detail-score-num">'+sc+'%</div><div class="detail-score-bar"><div class="detail-score-fill" style="width:'+sc+'%"></div></div></div></div>';
  body+='<div class="detail-section"><div class="detail-section-title">'+(isComp?'Sobre la empresa':'Sobre el candidato')+'</div><div class="detail-about">'+c.about+'</div></div>';
  body+='<div class="detail-section"><div class="detail-section-title">'+(isComp?'Stack buscado':'Skills')+'</div><div class="detail-skills">'+skills+'</div></div>';
  var rows=[{l:'Salario',v:c.sal},{l:'Disponibilidad',v:c.avail},{l:'Experiencia',v:c.exp},{l:'Idiomas',v:c.langs}];
  if(isComp)rows.push({l:'Industria',v:c.industry},{l:'Empleados',v:c.size});
  body+='<div class="detail-section"><div class="detail-section-title">Información</div>'+rows.filter(function(r){return r.v;}).map(function(r){return'<div class="detail-row"><span class="detail-lbl">'+r.l+'</span><span class="detail-val">'+r.v+'</span></div>';}).join('')+'</div>';
  if(isComp&&c.activeJobs&&c.activeJobs.length){
    body+='<div class="detail-section"><div class="detail-section-title">💼 Puestos activos ('+c.activeJobs.length+')</div>'+c.activeJobs.map(function(j){return'<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--brd)"><div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--dark)">'+j.title+'</div><div style="font-size:11px;color:var(--gray)">'+j.sal+' · '+j.type+'</div></div>'+(j.urgent?'<div style="background:#FEF3C7;color:#92400E;font-size:10px;font-weight:700;border-radius:6px;padding:3px 8px">Urgente</div>':'')+'</div>';}).join('')+'</div>';
  }
  if(isComp&&c.jd){body+='<div class="detail-section"><div class="detail-section-title">📋 Job Description</div><div style="font-size:12px;color:var(--mid);line-height:1.7;max-height:160px;overflow-y:auto">'+c.jd+'</div><button onclick="loadJDtoRanking()" style="margin-top:10px;background:var(--blight);border:none;border-radius:10px;padding:8px 14px;font-size:12px;font-weight:600;color:var(--b);cursor:pointer;width:100%">🎯 Usar JD para Ranking</button></div>';}
  if(!isComp){
    var cvHtml;
    if(c.cvUrl || c.cvData){
      // Hay CV (subido a Storage o base64 demo)
      cvHtml='<div style="display:flex;align-items:center;gap:10px;background:var(--bxlight);border-radius:12px;padding:12px;border-left:3px solid var(--b)"><span style="font-size:22px">📄</span><div style="flex:1;font-size:13px;font-weight:700;color:var(--dark)">'+(c.cvName||'CV.pdf')+'</div><button class="cv-view-btn" onclick="openCVViewer()">Ver PDF</button></div>';
    } else if(c.uid){
      // Candidato real sin CV — la empresa no puede subir, sólo el candidato puede
      cvHtml='<div style="font-size:12px;color:var(--gray);background:var(--bxlight);border-radius:12px;padding:12px;text-align:center">Este candidato todavía no subió su CV.</div>';
    } else {
      // Perfil demo (sin uid) — permite "subir" CV localmente para testing
      cvHtml='<label style="display:flex;align-items:center;gap:8px;background:var(--bxlight);border:1.5px dashed var(--b3);border-radius:12px;padding:12px;cursor:pointer"><span>📎</span><span style="font-size:12px;font-weight:600;color:var(--b)">Subir CV (PDF) — modo demo</span><input type="file" accept="application/pdf" style="display:none" onchange="handleCVFromDetail(event)"></label>';
    }
    body+='<div class="detail-section"><div class="detail-section-title">📄 Currículum</div>'+cvHtml+'</div>';
  }
  var detailKey=keyOf(c);
  if(pipeline[detailKey]!==undefined){var stages=['Nuevo','Entrevista','Oferta','Contratado'];var p=pipeline[detailKey];body+='<div class="detail-section"><div class="detail-section-title">Pipeline</div><div style="display:flex;gap:6px;flex-wrap:wrap">'+stages.map(function(s,i){return'<div style="padding:5px 12px;border-radius:14px;font-size:11px;font-weight:600;'+(i===p?'background:var(--b);color:#fff':'background:var(--bxlight);color:var(--gray)')+'">'+s+'</div>';}).join('')+'</div><div style="display:flex;gap:6px;margin-top:10px">'+(p>0?'<button class="kmove-btn" style="padding:6px 0;font-size:11px" onclick="movePipelineFromDetail(-1)">◀ Atrás</button>':'')+(p<3?'<button class="kmove-btn" style="padding:6px 0;font-size:11px;background:var(--b);color:#fff" onclick="movePipelineFromDetail(1)">Adelante ▶</button>':'')+'</div></div>';}
  G('detail-body').innerHTML=body;
}
function detailSwipeRight(){if(!currentDetail)return;addMatch(currentDetail,false);G('detail-like-btn').style.display='none';G('detail-chat-btn').style.display='block';addNotif('💙','Liked a <strong>'+currentDetail.name+'</strong>','ahora');buildDetailScreen(currentDetail);}
function detailOpenChat(){if(!currentDetail)return;chatPrev='detail-scr';openChat(currentDetail);}
function movePipelineFromDetail(dir){if(!currentDetail)return;movePipelineByKey(keyOf(currentDetail),dir);buildDetailScreen(currentDetail);}
function loadJDtoRanking(){if(!currentDetail||!currentDetail.jd)return;go('profile-scr');buildProfile();setTimeout(function(){var ta=G('jd-text');if(ta){ta.value=currentDetail.jd;calcRanking();}},100);}


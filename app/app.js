// ═══════════════════════════════════════════════
// FIX #4: SKILL PRESETS por rol (tipo LinkedIn)
// ═══════════════════════════════════════════════
var SKILL_PRESETS={
  // IT - sub-especialidades
  fullstack:  ['React','Node.js','TypeScript','PostgreSQL','MongoDB','Docker','REST APIs','Git','AWS','Redis','GraphQL','Next.js'],
  backend:    ['Node.js','Python','Java','Go','PostgreSQL','MySQL','Redis','Docker','Kubernetes','REST APIs','Microservices','RabbitMQ'],
  frontend:   ['React','Vue.js','TypeScript','CSS/SCSS','Tailwind','Next.js','Testing Library','Storybook','Webpack','Figma','Accesibilidad','Performance'],
  data_eng:   ['Python','SQL','Spark','dbt','Airflow','BigQuery','Snowflake','Pandas','NumPy','Tableau','Power BI','Data Modeling'],
  devops:     ['AWS','GCP','Azure','Kubernetes','Docker','Terraform','CI/CD','Linux','Bash','Prometheus','Grafana','Security'],
  mobile:     ['Flutter','React Native','Swift','Kotlin','Firebase','Xcode','Android Studio','App Store','Push Notifications','SQLite','REST APIs','Performance'],
  design:     ['Figma','UX Research','Prototyping','Design Systems','Accessibility','Adobe XD','User Testing','Wireframing','Motion Design','HTML/CSS','Analytics','Copywriting'],
  qa:         ['Selenium','Cypress','Jest','Postman','JMeter','Test Planning','BDD/TDD','Automation','SQL','CI/CD','Bug Tracking','Performance Testing'],
  pm:         ['Jira','Roadmap','OKRs','Agile/Scrum','Stakeholder Mgmt','Data Analysis','A/B Testing','User Stories','Prioritization','Notion','Figma','SQL'],
  // Otros sectores
  it:         ['Soporte IT','Redes','Seguridad','Cloud','Helpdesk','Infraestructura','Virtualización','Active Directory','Linux','Windows Server','Backup','Monitoreo'],
  comercial:  ['Ventas B2B','CRM','Salesforce','Negociación','Pipeline','Prospección','Account Management','Presentaciones','KPIs','Cierre de ventas','Partnerships','E-commerce'],
  rrhh:       ['Talent Acquisition','Selección','Onboarding','Employer Branding','Evaluación de desempeño','Formación','Compensaciones','Clima organizacional','HRIS','ATS','Nómina','Compliance laboral'],
  finanzas:   ['Excel avanzado','SAP','Análisis financiero','Presupuesto','Flujo de caja','Reporting','Control de gestión','Contabilidad','Impuestos','Auditoría','Power BI','FP&A'],
  marketing:  ['Marketing Digital','SEO/SEM','Google Ads','Meta Ads','Email Marketing','Contenidos','Analytics','HubSpot','Social Media','Branding','Copywriting','CRO'],
  legal:      ['Contratos','Compliance','Derecho laboral','Propiedad intelectual','M&A','Regulatorio','GDPR','Negociación','Litigios','Due diligence','Sociedades','Derecho corporativo'],
  operaciones:['Logística','Supply Chain','Procesos','Six Sigma','Lean','ERP','SAP','Gestión de proyectos','KPIs','Mejora continua','Calidad','Planificación'],
  data:       ['Power BI','Tableau','SQL','Python','Excel','Google Analytics','Data Storytelling','Dashboards','Estadística','Machine Learning','A/B Testing','Insights'],
  producto:   ['Product Management','Roadmap','OKRs','UX','Métricas','Agile','Discovery','User Research','Priorización','Go-to-market','Stakeholders','Growth']
};
var selectedSkillRole=null;
var selectedSubRole=null;

function selectSkillRole(el,sector){
  selectedSkillRole=sector;
  selectedSubRole=null;
  document.querySelectorAll('.skill-role-chip').forEach(function(c){c.classList.remove('on');});
  el.classList.add('on');
  // Mostrar/ocultar sub-especialidades IT
  var itSub=document.getElementById('it-subesp');
  if(itSub) itSub.style.display=sector==='it'?'block':'none';
  // Si es IT sin subesp, mostrar skills generales IT
  if(sector!=='it'){
    renderSkillSuggestions(sector);
  } else {
    // Limpiar sugerencias hasta que elija subespecialidad
    var container=document.getElementById('skill-suggestions');
    if(container)container.innerHTML='<span class="skill-sug-placeholder">Elegí una especialidad IT</span>';
  }
}

function selectSubRole(el,subrole){
  selectedSubRole=subrole;
  document.querySelectorAll('#it-subesp .skill-role-chip').forEach(function(c){c.classList.remove('on');});
  el.classList.add('on');
  renderSkillSuggestions(subrole);
}
function renderSkillSuggestions(role){
  var container=document.getElementById('skill-suggestions');if(!container)return;
  var presets=SKILL_PRESETS[role]||[];
  var current=getCurrentSkills();
  if(!presets.length){container.innerHTML='<span class="skill-sug-placeholder">Sin sugerencias para este rol</span>';return;}
  container.innerHTML=presets.map(function(sk){
    var added=current.indexOf(sk)>=0;
    var safe=sk.replace(/'/g,"\\'");
    return'<div class="skill-sug-chip'+(added?' added':'')+'" onclick="toggleSugSkill(this,\''+safe+'\')">'+sk+'</div>';
  }).join('');
}
function getCurrentSkills(){
  var inputs=document.querySelectorAll('#cp-skills-list input');
  return Array.from(inputs).map(function(i){return i.value.trim();}).filter(Boolean);
}
function toggleSugSkill(el,skillName){
  var current=getCurrentSkills();
  var idx=current.indexOf(skillName);
  if(idx>=0){cpData.skills=current.filter(function(s){return s!==skillName;});el.classList.remove('added');}
  else{cpData.skills=current.concat([skillName]);el.classList.add('added');}
  renderSkillsList();
  if(selectedSkillRole)renderSkillSuggestions(selectedSkillRole);
}

// ═══════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════
var CANDIDATES=[
  {type:'candidate',name:"Matías G.",    loc:"Buenos Aires, AR",role:"Full Stack Dev",   skills:["React","Node.js","PostgreSQL"],sal:"$4.500/mes · Remoto",about:"5 años en startups. Apasionado por productos con impacto real.",av:"MG",color:"#2B5CE6",avail:"Inmediata",exp:"5 años",langs:"Español, Inglés B2",score:92,photo:null,cvData:null,cvName:null},
  {type:'candidate',name:"Valentina R.",loc:"Córdoba, AR",      role:"Data Engineer",   skills:["Python","Spark","dbt"],        sal:"$5.000/mes · Remoto",about:"Ex-Mercado Libre. Especialista en pipelines de datos a escala.",av:"VR",color:"#7C3AED",avail:"2 semanas",exp:"7 años",langs:"Español, Inglés C1",score:87,photo:null,cvData:null,cvName:null},
  {type:'candidate',name:"Lucas P.",    loc:"Rosario, AR",      role:"DevOps Engineer", skills:["AWS","Kubernetes","Terraform"],sal:"$5.500/mes · Remoto",about:"Certificado AWS. Infraestructura cloud desde cero.",av:"LP",color:"#059669",avail:"Inmediata",exp:"6 años",langs:"Español, Inglés B2",score:78,photo:null,cvData:null,cvName:null},
  {type:'candidate',name:"Camila S.",   loc:"Mendoza, AR",      role:"Product Designer",skills:["Figma","UX Research","Proto"],sal:"$3.800/mes · Remoto",about:"Diseño centrado en el usuario. Portfolio con productos lanzados en LATAM.",av:"CS",color:"#DC2626",avail:"1 mes",exp:"4 años",langs:"Español, Inglés B1",score:84,photo:null,cvData:null,cvName:null},
  {type:'candidate',name:"Andrés M.",   loc:"CABA, AR",         role:"Mobile Developer",skills:["Flutter","Swift","Firebase"],  sal:"$4.200/mes · Remoto",about:"Apps con +100k descargas. Enfocado en rendimiento y UX móvil.",av:"AM",color:"#D97706",avail:"2 semanas",exp:"5 años",langs:"Español, Inglés C1",score:95,photo:null,cvData:null,cvName:null},
];
var COMPANIES=[
  {type:'company',name:"Mercado Libre",loc:"CABA / Remoto",role:"Busca: Full Stack Sr",skills:["React","Java","AWS","Microservices"],sal:"$6.000–$9.000/mes",about:"Líder en e-commerce LATAM con presencia en 18 países. Cultura de alto desempeño e innovación.",av:"ML",color:"#F59E0B",avail:"Inmediata",exp:"5+ años",langs:"Español + Inglés B2",score:90,size:"5.000+",industry:"E-commerce",photo:null,activeJobs:[{title:"Full Stack Sr",sal:"$7.000–$9.000/mes",type:"Remoto",urgent:true},{title:"Tech Lead Frontend",sal:"$9.000–$12.000/mes",type:"Híbrido",urgent:false}],jd:"Senior Full Stack Developer. 5+ years React and Node.js, PostgreSQL and AWS, microservices architecture, CI/CD pipelines. English B2+."},
  {type:'company',name:"Globant",loc:"Buenos Aires, AR",role:"Busca: Data Engineer",skills:["Python","Spark","GCP","dbt"],sal:"$5.500–$8.000/mes",about:"Empresa global de tecnología con más de 25.000 empleados y proyectos en USA, Europa y LATAM.",av:"GL",color:"#10B981",avail:"2 semanas",exp:"4+ años",langs:"Inglés C1",score:82,size:"25.000+",industry:"Consulting IT",photo:null,activeJobs:[{title:"Data Engineer Sr",sal:"$5.500–$7.500/mes",type:"Remoto",urgent:true}],jd:"Senior Data Engineer. 4+ years Python, Spark, dbt, GCP or AWS. Experience with Airflow, BigQuery. Strong English C1."},
  {type:'company',name:"Despegar",loc:"CABA, AR",role:"Busca: DevOps Lead",skills:["Kubernetes","Azure","CI/CD","Terraform"],sal:"$7.000–$10.000/mes",about:"Plataforma de viajes líder en LATAM con más de 2.000 empleados. Remoto-first.",av:"DS",color:"#2563EB",avail:"Inmediata",exp:"6+ años",langs:"Español + Inglés B1",score:75,size:"2.000+",industry:"Travel Tech",photo:null,activeJobs:[{title:"DevOps Lead",sal:"$8.000–$10.000/mes",type:"Híbrido",urgent:true}],jd:"DevOps Lead to manage Azure infrastructure. Lead team of 4, Terraform IaC, Kubernetes clusters, CI/CD pipelines."},
  {type:'company',name:"Auth0/Okta",loc:"100% Remoto",role:"Busca: Security Engineer",skills:["OAuth","Node","Go","Zero Trust"],sal:"$9.000–$14.000/mes",about:"Líder global en identity & access management. Equipo 100% remoto con cultura de autonomía.",av:"AO",color:"#EC4899",avail:"1 mes",exp:"5+ años",langs:"Inglés C1",score:88,size:"1.000+",industry:"Ciberseguridad",photo:null,activeJobs:[{title:"Security Engineer Sr",sal:"$10.000–$14.000/mes",type:"Remoto",urgent:false}],jd:"Senior Security Engineer. OAuth 2.0, OpenID Connect, Zero Trust. Node.js and Go. Excellent English required."},
];

var mode='candidates',dataSet=CANDIDATES,idx=0;
var matches=[],chats={},curMatch=null,curChat=null;
var currentChatUnsub=null;
var pipelineUnsub=null, interviewsUnsub=null;
var pipelineByUid={}; // uid -> stage (cache para reconciliar cuando los matches recién cargan)
var pipelineMigrated=false;
var chatPrev='swipe-scr',schedulePrev='swipe-scr',detailPrev='swipe-scr',cvViewerPrev='detail-scr';
var stats={seen:0,likes:0,mc:0,interviews:0};
var pipeline={},interviews=[],selectedInterview=null;
var agendaInterviews=[],agendaTab='all';
var selectedPlatform='meet',altSlots=[],editInterviewIdx=null,editJobIdx=null;
var currentDetail=null,cvTabMode='pdf';
var notifs=[
  {icon:"💙",text:"<strong>Andrés M.</strong> tiene 95% de match",time:"hace 2 min",unread:true},
  {icon:"🎉",text:"Nueva empresa: <strong>Auth0/Okta</strong> — 88% match",time:"hace 20 min",unread:true},
  {icon:"🔔",text:"Tus filtros encontraron <strong>5 perfiles</strong> nuevos",time:"hace 1h",unread:false},
];
var tx=0,dragging=false,dx=0,mdown=false,mx2=0;
var LANG='es',USER_ROLE=null;

// ── EMAIL WEBHOOK ──
var EMAIL_WEBHOOK_URL='https://tnic-mailer.nicolasmarialaura.workers.dev';
function isValidEmail(e){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e||'').trim());}

// ── PERSIST ──
var cpData={name:'',role:'',about:'',loc:'',sal:'',avail:'',exp:'',langs:'',email:'',avatar:null,banner:null,skills:[],gallery:[],galleryIdx:0,cvUrl:null,cvName:null,cvPath:null};
var copData={name:'',tagline:'',industry:'',size:'',location:'',web:'',founded:'',desc:'',logo:null,banner:null,contactEmail:'',culture:[],linkedin:'',twitter:'',instagram:'',github:'',jobs:[]};

function persistAll(){
  try{localStorage.setItem('tnic_v2',JSON.stringify({cpData:cpData,copData:copData,agendaInterviews:agendaInterviews,pipeline:pipeline,matches:matches,chats:chats,notifs:notifs,USER_ROLE:USER_ROLE,LANG:LANG}));}catch(e){}
  // Sync con Firestore si hay usuario logueado
  saveToFirestore();
}
function loadAll(){
  try{
    var raw=localStorage.getItem('tnic_v2');
    // Migrate from old key
    if(!raw) raw=localStorage.getItem('tnic_state_v1');
    if(!raw)return false;
    var d=JSON.parse(raw);
    if(d.cpData)Object.assign(cpData,d.cpData);
    if(d.copData)Object.assign(copData,d.copData);
    if(Array.isArray(d.agendaInterviews))agendaInterviews=d.agendaInterviews;
    if(d.pipeline)pipeline=d.pipeline;
    if(Array.isArray(d.matches))matches=d.matches;
    if(d.chats)chats=d.chats;
    if(Array.isArray(d.notifs))notifs=d.notifs;
    if(d.USER_ROLE)USER_ROLE=d.USER_ROLE;
    if(d.LANG)LANG=d.LANG;
    return true;
  }catch(e){return false;}
}

function G(id){return document.getElementById(id);}
function go(id){document.querySelectorAll('.scr').forEach(function(s){s.classList.remove('on');});G(id).classList.add('on');}

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
      pipeline[m.name]=pipelineByUid[m.uid];
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

function writePipelineStage(name, stage){
  if(!canSyncToFirestore() || USER_ROLE!=='company') return;
  var uid=findUidByName(name);
  if(!uid) return; // demo: no sync
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
  curChat=person;
  var real=isRealMatch(person);

  if(real){
    // Limpiar caché local y dejar que el snapshot popule. Sin welcome/bot.
    chats[person.name]=chats[person.name]||[];
    subscribeToChatMessages(person);
  } else if(!chats[person.name]){
    // Camino demo: welcome message + bot reply (sólo cuando no hay match real).
    var welcomeMsg;
    if(USER_ROLE==='company'){
      welcomeMsg='Hola '+person.name+'! Vi tu perfil y me parece muy interesante. ¿Tenés disponibilidad para charlar sobre una oportunidad?';
    } else {
      var coName=person.name||'la empresa';
      welcomeMsg='¡Hola '+coName+'! Vi su oferta y me interesa mucho. ¿Puedo hacerles algunas preguntas sobre el rol?';
    }
    chats[person.name]=[{from:'me',text:welcomeMsg,time:nowTime(),auto:true}];
    var mxw=matches.find(function(x){return x.name===person.name;});
    if(mxw){mxw.lastMsg=welcomeMsg;mxw.time='ahora';}
    setTimeout(function(){
      if(chats[person.name]&&chats[person.name].length===1){
        var replies=USER_ROLE==='company'
          ?['¡Hola! Claro, con mucho gusto. ¿Me podés contar más sobre tu experiencia?','¡Hola! Gracias por escribir. ¿Qué tecnologías manejás principalmente?','¡Hola! Perfecto. ¿Cuándo tenés disponibilidad para una llamada?']
          :['¡Hola! Gracias por escribirnos. Claro que sí, ¿qué querés saber?','¡Hola! Con gusto. ¿Cuál es tu experiencia con nuestro stack?','¡Hola! Bienvenido. Contanos un poco de tu perfil.'];
        var reply=replies[Math.floor(Math.random()*replies.length)];
        chats[person.name].push({from:'them',text:reply,time:nowTime()});
        var mx2=matches.find(function(x){return x.name===person.name;});
        if(mx2){mx2.lastMsg=reply;mx2.time='ahora';}
        if(curChat&&curChat.name===person.name)renderChat();
      }
    },1500);
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

  // Camino demo: push local + bot reply.
  chats[curChat.name]=chats[curChat.name]||[];
  chats[curChat.name].push({from:'me',text:text,time:nowTime()});
  var mx=matches.find(function(x){return x.name===curChat.name;});
  if(mx){mx.lastMsg=text;mx.time='ahora';}
  renderChat();
  var body=G('chatbody');
  var t=document.createElement('div');t.className='bw them';
  t.innerHTML='<div class="typing"><div class="td"></div><div class="td"></div><div class="td"></div></div>';
  body.appendChild(t);body.scrollTop=body.scrollHeight;
  var msgLow=text.toLowerCase();
  setTimeout(function(){
    t.remove();
    var rs;
    if(msgLow.includes('entrevista')||msgLow.includes('llamada')||msgLow.includes('reunión')||msgLow.includes('meet')){
      rs=['¡Perfecto! ¿El jueves a las 15hs te viene bien?','Claro, ¿qué días y horarios tenés disponibles?','¡Genial! Te mando el link por acá.','Excelente. ¿Preferís Meet, Zoom o Teams?'];
    } else if(msgLow.includes('salario')||msgLow.includes('sueldo')||msgLow.includes('compensación')||msgLow.includes('plata')){
      rs=['El rango es el que figura en el perfil, negociable según experiencia.','Podemos hablar de eso en la entrevista técnica.','Estamos abiertos a conversar sobre la compensación.'];
    } else if(msgLow.includes('remoto')||msgLow.includes('presencial')||msgLow.includes('híbrido')||msgLow.includes('modalidad')){
      rs=['Es 100% remoto, con reuniones ocasionales en CABA.','Híbrido: 3 días en oficina, 2 desde casa.','Totalmente flexible, nos manejamos por objetivos.'];
    } else if(msgLow.includes('tecnología')||msgLow.includes('stack')||msgLow.includes('lenguaje')||msgLow.includes('framework')){
      rs=['Usamos React + Node.js en el frontend/backend, PostgreSQL como DB principal.','El stack principal es Python + FastAPI, con infraestructura en AWS.','Trabajamos con Flutter para mobile y Node.js para el backend.'];
    } else if(msgLow.includes('gracias')||msgLow.includes('ok')||msgLow.includes('perfecto')||msgLow.includes('excelente')){
      rs=['¡Genial! Quedamos en contacto 🙌','¡Buenísimo! Cualquier duda, escribinos.','Perfecto, te confirmamos los detalles pronto.'];
    } else {
      rs=['¡Perfecto! Te mando más info 🙌','Genial, coordinamos por acá 👍','¿Algo más que quieras saber?','Claro, con gusto. ¿Cuándo podemos hablar?'];
    }
    var r=rs[Math.floor(Math.random()*rs.length)];
    chats[curChat.name].push({from:'them',text:r,time:nowTime()});
    var mx2=matches.find(function(x){return x.name===curChat.name;});
    if(mx2){mx2.lastMsg=r;mx2.time='ahora';mx2.unread=false;}
    renderChat();
  },900);
}

// ── PIPELINE ──
var STAGES=['nuevo','entrevista','oferta','contratado'];
function buildKanban(){
  var cols=[[],[],[],[]];matches.forEach(function(m){cols[pipeline[m.name]||0].push(m);});
  for(var i=0;i<4;i++){
    G('k-count-'+i).textContent=cols[i].length;
    G('k-col-'+i).innerHTML=cols[i].map(function(m){
      var sc=STAGES[pipeline[m.name]||0];
      var av=m.photo?'<img src="'+m.photo+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%">':m.av;
      var p=pipeline[m.name]||0;
      var prev=p>0?'<button class="kmove-btn" onclick="movePipeline(\''+m.name+'\',-1)">◀</button>':'';
      var next=p<3?'<button class="kmove-btn" onclick="movePipeline(\''+m.name+'\',1)">▶</button>':'';
      return'<div class="kcard '+sc+'"><div class="kav" style="background:'+m.color+'">'+av+'</div><div class="kname">'+m.name+'</div><div class="krole">'+m.role+'</div><div class="kmove">'+prev+next+'</div></div>';
    }).join('');
  }
  G('pipeline-sub').textContent=matches.length+' candidatos en pipeline';
}
function movePipeline(name,dir){
  if(pipeline[name]===undefined)pipeline[name]=0;
  pipeline[name]=Math.max(0,Math.min(3,pipeline[name]+dir));
  buildKanban();
  addNotif('📋','<strong>'+name+'</strong> → '+['Nuevo','Entrevista','Oferta','Contratado'][pipeline[name]],'ahora');
  writePipelineStage(name, pipeline[name]);
  persistAll();
}

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
    list.innerHTML='<div class="nomatch">'
      +'<div style="font-size:40px">💙</div>'
      +'<div style="font-weight:700;color:var(--dark)">Aún no tenés conexiones</div>'
      +'<div style="font-size:11px;margin-top:4px">Explorá perfiles y hacé swipe para conectar</div>'
      +'<button class="bprimary" style="max-width:220px;margin-top:12px" onclick="go(\'swipe-scr\')">Explorar →</button>'
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
  if(pipeline[c.name]!==undefined){var stages=['Nuevo','Entrevista','Oferta','Contratado'];var p=pipeline[c.name];body+='<div class="detail-section"><div class="detail-section-title">Pipeline</div><div style="display:flex;gap:6px;flex-wrap:wrap">'+stages.map(function(s,i){return'<div style="padding:5px 12px;border-radius:14px;font-size:11px;font-weight:600;'+(i===p?'background:var(--b);color:#fff':'background:var(--bxlight);color:var(--gray)')+'">'+s+'</div>';}).join('')+'</div><div style="display:flex;gap:6px;margin-top:10px">'+(p>0?'<button class="kmove-btn" style="padding:6px 0;font-size:11px" onclick="movePipelineFromDetail(-1)">◀ Atrás</button>':'')+(p<3?'<button class="kmove-btn" style="padding:6px 0;font-size:11px;background:var(--b);color:#fff" onclick="movePipelineFromDetail(1)">Adelante ▶</button>':'')+'</div></div>';}
  G('detail-body').innerHTML=body;
}
function detailSwipeRight(){if(!currentDetail)return;addMatch(currentDetail,false);G('detail-like-btn').style.display='none';G('detail-chat-btn').style.display='block';addNotif('💙','Liked a <strong>'+currentDetail.name+'</strong>','ahora');buildDetailScreen(currentDetail);}
function detailOpenChat(){if(!currentDetail)return;chatPrev='detail-scr';openChat(currentDetail);}
function movePipelineFromDetail(dir){if(!currentDetail)return;movePipeline(currentDetail.name,dir);buildDetailScreen(currentDetail);}
function loadJDtoRanking(){if(!currentDetail||!currentDetail.jd)return;go('profile-scr');buildProfile();setTimeout(function(){var ta=G('jd-text');if(ta){ta.value=currentDetail.jd;calcRanking();}},100);}

// ── CV ──
// ─────────────────────────────────────────────
// CV propio del candidato — sube a Cloud Storage en cvs/{uid}/cv.pdf y
// guarda cvUrl + cvName en cpData. publishProfileToFirestore los expone en
// /candidates/{uid} para que las empresas con match puedan abrir el PDF.
// ─────────────────────────────────────────────
function refreshOwnCVUI(){
  var has = !!(cpData.cvUrl);
  var empty=G('cp-cv-empty'), loaded=G('cp-cv-loaded'), name=G('cp-cv-filename');
  if(empty) empty.style.display = has ? 'none' : 'block';
  if(loaded) loaded.style.display = has ? 'block' : 'none';
  if(name) name.textContent = cpData.cvName || 'CV.pdf';
}

function uploadOwnCV(e){
  var f = e.target.files && e.target.files[0];
  if(!f) return;
  if(!currentUser || currentUser.isAnonymous){ alert('Necesitás iniciar sesión para subir un CV.'); return; }
  if(f.type !== 'application/pdf'){ alert('Solo se aceptan archivos PDF.'); return; }
  if(f.size > 10 * 1024 * 1024){ alert('El archivo supera los 10 MB.'); return; }

  var progress = G('cp-cv-progress'), pct = G('cp-cv-pct');
  if(progress) progress.style.display = 'block';

  var path = 'cvs/' + currentUser.uid + '/cv.pdf';
  var ref = storage.ref().child(path);
  var task = ref.put(f, { contentType: 'application/pdf' });

  task.on('state_changed', function(snap){
    var p = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
    if(pct) pct.textContent = p + '%';
  }, function(err){
    console.log('CV upload error:', err);
    if(progress) progress.style.display = 'none';
    alert('No se pudo subir el CV: ' + (err.message || err.code || 'error'));
  }, function(){
    task.snapshot.ref.getDownloadURL().then(function(url){
      cpData.cvUrl  = url;
      cpData.cvName = f.name;
      cpData.cvPath = path;
      if(progress) progress.style.display = 'none';
      refreshOwnCVUI();
      persistAll();
      // Publicar el cambio en /candidates/{uid} para que las empresas con match lo vean
      if(USER_ROLE === 'candidate') publishProfileToFirestore();
      addNotif('📄','CV subido correctamente','ahora');
    }).catch(function(err){
      console.log('getDownloadURL error:', err);
      if(progress) progress.style.display = 'none';
      alert('CV subido, pero no se pudo obtener el link. Intentá guardar el perfil de nuevo.');
    });
  });

  // limpiar el input para que el mismo archivo pueda re-seleccionarse
  e.target.value = '';
}

function viewOwnCV(){
  if(!cpData.cvUrl){ alert('Todavía no subiste un CV.'); return; }
  window.open(cpData.cvUrl, '_blank');
}

function removeOwnCV(){
  if(!cpData.cvUrl){ return; }
  if(!confirm('¿Eliminar tu CV? Las empresas con match dejarán de verlo.')) return;
  var path = cpData.cvPath || ('cvs/' + (currentUser && currentUser.uid) + '/cv.pdf');
  var done = function(){
    cpData.cvUrl = null; cpData.cvName = null; cpData.cvPath = null;
    refreshOwnCVUI();
    persistAll();
    if(USER_ROLE === 'candidate') publishProfileToFirestore();
    addNotif('🗑','CV eliminado','ahora');
  };
  if(currentUser && !currentUser.isAnonymous){
    storage.ref().child(path).delete()
      .then(done)
      .catch(function(err){
        console.log('CV delete error:', err);
        // Si el archivo no existe en Storage, igual limpiamos los datos
        if(err && (err.code === 'storage/object-not-found')) { done(); }
        else { alert('No se pudo eliminar el archivo: ' + (err.message || err.code)); }
      });
  } else { done(); }
}

function openCVViewer(){if(!currentDetail||(!currentDetail.cvUrl && !currentDetail.cvData))return;cvViewerPrev='detail-scr';G('cv-viewer-title').textContent=currentDetail.cvName||'CV.pdf';switchCvTab('pdf');go('cv-viewer-scr');}
function switchCvTab(tab){
  cvTabMode=tab;G('cv-tab-pdf').classList.toggle('on',tab==='pdf');G('cv-tab-text').classList.toggle('on',tab==='text');
  var body=G('cv-viewer-body');
  if(tab==='pdf'){
    if(currentDetail && currentDetail.cvUrl){
      // CV real desde Cloud Storage
      var url = currentDetail.cvUrl;
      body.innerHTML='<object class="cv-pdf-frame" data="'+url+'" type="application/pdf"><div class="cv-text-placeholder"><div>📄</div><a href="'+url+'" target="_blank" style="color:#3B82F6;font-size:13px;font-weight:600">Abrir PDF</a></div></object>';
      return;
    }
    if(currentDetail && currentDetail.cvData){
      // CV demo (base64 legacy)
      try{var b64=currentDetail.cvData.split(',')[1];var bin=atob(b64);var bytes=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);var blob=new Blob([bytes],{type:'application/pdf'});var u2=URL.createObjectURL(blob);body.innerHTML='<object class="cv-pdf-frame" data="'+u2+'" type="application/pdf"><div class="cv-text-placeholder"><div>📄</div><a href="'+u2+'" target="_blank" style="color:#3B82F6;font-size:13px;font-weight:600">Abrir PDF</a></div></object>';}catch(e){body.innerHTML='<div class="cv-text-placeholder"><div>⚠️</div><div>Error al cargar PDF</div></div>';}
      return;
    }
    body.innerHTML='<div class="cv-text-placeholder"><div>📄</div><div>Sin CV cargado</div></div>';
  } else {
    if(currentDetail && currentDetail.cvText){body.innerHTML='<div class="cv-text-body">'+currentDetail.cvText+'</div>';}
    else if(currentDetail && (currentDetail.cvUrl || currentDetail.cvData)){body.innerHTML='<div class="cv-text-placeholder"><div style="font-size:36px">⏳</div><div>Extrayendo texto...</div></div>';extractCVText();}
    else {body.innerHTML='<div class="cv-text-placeholder"><div>📝</div><div>Sin CV cargado</div></div>';}
  }
}
function extractCVText(){
  if(!currentDetail || currentDetail.cvText) return;

  function runOnBytes(bytes){
    pdfjsLib.getDocument({data:bytes}).promise.then(function(pdf){
      var pp=[];for(var p=1;p<=pdf.numPages;p++)pp.push(p);
      return Promise.all(pp.map(function(p){return pdf.getPage(p).then(function(pg){return pg.getTextContent().then(function(tc){return tc.items.map(function(i){return i.str;}).join(' ');});});}));
    }).then(function(texts){
      currentDetail.cvText=texts.join('\n\n').replace(/\s+/g,' ').trim();
      if(cvTabMode==='text') G('cv-viewer-body').innerHTML='<div class="cv-text-body">'+currentDetail.cvText+'</div>';
    }).catch(function(e){
      G('cv-viewer-body').innerHTML='<div class="cv-text-placeholder"><div>⚠️</div><div>Error: '+(e.message||e)+'</div></div>';
    });
  }

  if(currentDetail.cvUrl){
    // Descargar el PDF y pasarlo a PDF.js
    fetch(currentDetail.cvUrl).then(function(res){
      if(!res.ok) throw new Error('HTTP '+res.status);
      return res.arrayBuffer();
    }).then(function(ab){ runOnBytes(new Uint8Array(ab)); })
      .catch(function(e){ G('cv-viewer-body').innerHTML='<div class="cv-text-placeholder"><div>⚠️</div><div>Error descargando CV: '+(e.message||e)+'</div></div>'; });
    return;
  }
  if(currentDetail.cvData){
    try{var b64=currentDetail.cvData.split(',')[1];var bin=atob(b64);var bytes=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);runOnBytes(bytes);}
    catch(e){ G('cv-viewer-body').innerHTML='<div class="cv-text-placeholder"><div>⚠️</div><div>Error al procesar PDF</div></div>'; }
  }
}
function handleCVFromDetail(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){currentDetail.cvData=ev.target.result;currentDetail.cvName=f.name;currentDetail.cvText=null;var orig=dataSet.find(function(x){return x.name===currentDetail.name;});if(orig){orig.cvData=ev.target.result;orig.cvName=f.name;orig.cvText=null;}buildDetailScreen(currentDetail);};r.readAsDataURL(f);}

// ── JD RANKING ──
var JD_PRESETS={'full-stack':'React Node.js JavaScript TypeScript PostgreSQL REST API Git Docker AWS microservices CI/CD full stack developer senior','data':'Python SQL Spark dbt Airflow BigQuery PostgreSQL data engineering analytics pandas numpy data warehouse GCP','devops':'AWS Kubernetes Docker Terraform CI/CD Linux bash DevOps SRE monitoring Prometheus Grafana security IaC','mobile':'iOS Android Flutter React Native Swift Kotlin Firebase push notifications UI UX performance optimization testing','design':'Figma UX UI design user research prototyping wireframes design system accessibility responsive mobile product designer'};
function tokenize(text){if(!text)return[];return text.toLowerCase().replace(/[^a-z0-9áéíóúüñ\s]/gi,' ').split(/\s+/).filter(function(w){return w.length>2;});}
function scoreCandidate(c,jdT){if(!jdT.length)return{score:0,matched:[]};var cT=tokenize([c.name,c.role,c.about,(c.skills||[]).join(' '),c.avail,c.exp,c.langs,c.cvText||''].join(' '));var jdSet={};jdT.forEach(function(t){jdSet[t]=1;});var matched=[],seen={};cT.forEach(function(t){if(jdSet[t]&&!seen[t]){seen[t]=1;matched.push(t);}});var u=Object.keys(jdSet).length;var s=u>0?Math.round((matched.length/u)*100):0;if(c.cvData)s=Math.min(100,s+8);return{score:Math.min(100,s),matched:matched.slice(0,5)};}
function calcRanking(){var jdText=G('jd-text').value;var jdT=tokenize(jdText);var list=G('rank-list');if(!jdT.length){list.innerHTML='<div class="rank-empty">Ingresá un JD para ver el ranking</div>';return;}var scored=CANDIDATES.map(function(c){var r=scoreCandidate(c,jdT);return{c:c,score:r.score,matched:r.matched};}).sort(function(a,b){return b.score-a.score;});var medals=['gold','silver','bronze','',''];var labels=['🥇','🥈','🥉','4°','5°'];list.innerHTML=scored.slice(0,5).map(function(item,i){var av=item.c.photo?'<img src="'+item.c.photo+'">':item.c.av;return'<div class="rank-item"><div class="rank-pos '+medals[i]+'">'+labels[i]+'</div><div class="rank-av" style="background:'+item.c.color+'">'+av+'</div><div class="rank-info"><div class="rank-name">'+item.c.name+'</div><div class="rank-role">'+item.c.role+'</div><div class="rank-keywords">🔑 '+(item.matched.length?item.matched.join(', '):'—')+'</div></div><div class="rank-right"><div class="rank-pct">'+item.score+'%</div><div class="rank-bar-bg"><div class="rank-bar-fill" style="width:'+item.score+'%"></div></div>'+(item.c.cvData?'<div style="font-size:9px;color:var(--green);font-weight:600">📄 CV</div>':'')+'</div></div>';}).join('');}
function loadPreset(el,key){document.querySelectorAll('.jd-preset').forEach(function(p){p.classList.remove('on');});el.classList.add('on');G('jd-text').value=JD_PRESETS[key]||'';calcRanking();}

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

// ── COMPANY PROFILE ──
function initCompanyProfile(){var g=G;g('cop-name').value=copData.name;g('cop-tagline').value=copData.tagline;g('cop-industry').value=copData.industry;g('cop-size').value=copData.size;g('cop-email').value=copData.contactEmail||'';g('cop-location').value=copData.location;g('cop-web').value=copData.web;g('cop-founded').value=copData.founded;g('cop-desc').value=copData.desc;g('cop-linkedin').value=copData.linkedin;g('cop-twitter').value=copData.twitter;g('cop-instagram').value=copData.instagram;g('cop-github').value=copData.github;updateCopInitials();renderCopLogo();renderCopBanner();renderCultureChips();renderCopJobs();}
function updateCopInitials(){var name=(G('cop-name')||{}).value||'';var p=name.trim().split(' ');var init=p.length>=2?(p[0][0]||'').toUpperCase()+(p[1][0]||'').toUpperCase():(p[0][0]||'?').toUpperCase();var el=G('cop-logo-initials');if(el&&!copData.logo)el.textContent=init;}
function renderCopLogo(){var el=G('cop-logo-display');if(!el)return;if(copData.logo){el.innerHTML='<img src="'+copData.logo+'">';}else{var name=(G('cop-name')||{}).value||'';var p=name.trim().split(' ');var init=p.length>=2?(p[0][0]||'')+(p[1][0]||''):(p[0][0]||'?');el.innerHTML='<span id="cop-logo-initials" style="font-family:Syne,sans-serif;font-weight:800;font-size:22px;color:#fff">'+init.toUpperCase()+'</span>';}}
function setCopLogo(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){copData.logo=ev.target.result;renderCopLogo();};r.readAsDataURL(f);}
function setCopBanner(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){copData.banner=ev.target.result;var w=G('cop-banner-wrap');if(w){w.style.backgroundImage='url('+ev.target.result+')';w.style.backgroundSize='cover';w.style.backgroundPosition='center';if(w.querySelector('span'))w.querySelector('span').style.opacity='0';}};r.readAsDataURL(f);}
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
    var empty = isCandidate
      ? 'Aún no tenés entrevistas. Cuando una empresa agende una contigo, va a aparecer acá.'
      : 'Sin entrevistas '+(agendaTab==='all'?'agendadas':'en este estado');
    list.innerHTML='<div style="text-align:center;padding:30px;color:var(--gray);font-size:13px"><div style="font-size:36px;margin-bottom:8px">📅</div><div>'+empty+'</div></div>';
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

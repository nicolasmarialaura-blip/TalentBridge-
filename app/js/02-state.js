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


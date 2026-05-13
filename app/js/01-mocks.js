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


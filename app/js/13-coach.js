// ─────────────────────────────────────────────────────────
// SISTEMA DE ASESORÍA tNic ("coach")
// 3 superficies donde aparecen los tips:
//   A) Banner persistente arriba de la pantalla de swipe (dismissable por sesión).
//   B) Sección "Mejorá tu perfil" en candidate-profile-scr (siempre visible).
//   C) Notificación contextual: tras 10 swipes sin match, sugiere editar perfil.
//
// Los tips se generan dinámicamente según el estado del perfil del candidato
// (`cpData`) y el comportamiento de la sesión (`coachSession`). Sólo aplica a
// USER_ROLE === 'candidate'. Empresas mantienen su flujo actual sin tips.
// ─────────────────────────────────────────────────────────

// Estado de la sesión del coach (se reinicia al recargar).
var coachSession = {
  swipesInSession: 0,
  matchesInSession: 0,
  bannerDismissed: false,    // tocó la X → banner oculto el resto de esta sesión
  contextualShown: false,    // notif #C ya disparada en esta sesión?
  currentBannerTipId: null
};

// Helper: ¿el candidato tiene foto propia subida o de Google?
function _coachHasPhoto(cp) {
  return !!(cp && (cp.photo || cp.avatar));
}

// Patrón de tecnologías típicas para detectar especificidad en el bio.
var _COACH_TECH_RE = /react|vue|angular|node|python|java|kotlin|swift|flutter|django|rails|spring|laravel|express|next|nuxt|postgres|mysql|mongo|redis|aws|gcp|azure|docker|kubernetes|terraform|graphql|typescript/i;

// ── La librería de tips (orden definido por `priority` desc) ──
// Cada tip tiene: id, icon, title, body, priority, condition(cp, ctx).
// `priority` más alto = aparece primero. Los "negativos" (perfil incompleto)
// tienen prioridad alta para que se atiendan antes que los motivacionales.
var COACH_TIPS = [
  {
    id: 'add-photo',
    icon: '📸',
    title: 'Agregá una foto profesional',
    body: 'Los perfiles con foto reciben hasta 3× más matches.',
    priority: 100,
    condition: function(cp){ return !_coachHasPhoto(cp); }
  },
  {
    id: 'add-cv',
    icon: '📄',
    title: 'Subí tu CV',
    body: 'Las empresas con match lo ven, y triplica tus chances de entrevista.',
    priority: 95,
    condition: function(cp){ return !cp || !cp.cvUrl; }
  },
  {
    id: 'longer-bio',
    icon: '✍️',
    title: 'Ampliá tu bio',
    body: 'Contá tu seniority + stack principal en 2 líneas concretas.',
    priority: 90,
    condition: function(cp){ return !cp || !cp.about || cp.about.length < 50; }
  },
  {
    id: 'more-skills',
    icon: '🛠',
    title: 'Sumá más skills',
    body: 'Listá al menos 5 skills clave — los reclutadores filtran por ahí.',
    priority: 85,
    condition: function(cp){ return !cp || !cp.skills || cp.skills.length < 5; }
  },
  {
    id: 'add-salary',
    icon: '💵',
    title: 'Indicá tu rango USD',
    body: 'La transparencia mejora la calidad y velocidad de tus matches.',
    priority: 80,
    condition: function(cp){ return !cp || !cp.sal; }
  },
  {
    id: 'add-availability',
    icon: '⏱',
    title: 'Aclará tu disponibilidad',
    body: 'Inmediata / 15 días / 1 mes — las empresas filtran por esto.',
    priority: 75,
    condition: function(cp){ return !cp || !cp.avail; }
  },
  {
    id: 'add-languages',
    icon: '🌐',
    title: 'Mencioná idiomas',
    body: 'Inglés intermedio o avanzado abre 2× más oportunidades remotas.',
    priority: 70,
    condition: function(cp){ return !cp || !cp.langs; }
  },
  {
    id: 'add-experience',
    icon: '💼',
    title: 'Cargá tus años de experiencia',
    body: 'Las empresas filtran por seniority. No lo dejes vacío.',
    priority: 65,
    condition: function(cp){ return !cp || !cp.exp; }
  },
  {
    id: 'add-location',
    icon: '📍',
    title: 'Indicá tu ubicación',
    body: 'Las empresas valoran saber tu zona horaria y modalidad remota.',
    priority: 60,
    condition: function(cp){ return !cp || !cp.loc; }
  },
  {
    id: 'specific-tech',
    icon: '⚡',
    title: 'Sumá tecnologías concretas',
    body: 'Decir "React + Node 18 + PostgreSQL" pega más fuerte que "Full Stack".',
    priority: 55,
    condition: function(cp){
      return cp && cp.about && cp.about.length >= 50 && !_COACH_TECH_RE.test(cp.about);
    }
  },
  {
    id: 'measurable-achievement',
    icon: '📊',
    title: 'Mencioná un logro medible',
    body: 'Ej: "Reduje el tiempo de deploy de 30 a 5 minutos". Los números atraen.',
    priority: 50,
    condition: function(cp){
      return cp && cp.about && cp.about.length >= 50 && !/\d/.test(cp.about);
    }
  },
  // Tips basados en comportamiento de la sesión (no en datos del perfil).
  {
    id: 'many-swipes-no-match',
    icon: '🤔',
    title: 'Probá ajustar tu posicionamiento',
    body: 'Viste muchos perfiles sin match. Capaz tu stack o seniority apunta distinto a lo que buscás. Editá el perfil y reintentá.',
    priority: 40,
    condition: function(cp, ctx){ return ctx.swipesInSession >= 15 && ctx.matchesInSession === 0; }
  },
  {
    id: 'session-tip-explore',
    icon: '🚀',
    title: 'Empezá con calidad',
    body: 'Leé 3-4 perfiles a fondo antes de pasar. Los matches buenos suelen estar entre los primeros 10.',
    priority: 25,
    condition: function(cp, ctx){ return ctx.swipesInSession === 0; }
  },
  {
    id: 'github-link',
    icon: '🐙',
    title: 'Sumá señales técnicas',
    body: 'Si tenés GitHub o portfolio público, mencionalos en el bio. Las empresas tech los valoran muchísimo.',
    priority: 20,
    condition: function(cp){
      if (!cp || !cp.role) return false;
      var hasGithubInBio = cp.about && /github|gitlab|portfolio|portafolio/i.test(cp.about);
      var techRole = /developer|engineer|dev|programmer|backend|frontend|full[\s-]?stack|data|devops|sre|qa|tester/i.test(cp.role);
      return techRole && !hasGithubInBio;
    }
  },
  {
    id: 'celebrate-complete',
    icon: '🎉',
    title: 'Tu perfil está completísimo',
    body: 'Compartilo en LinkedIn o con tu red para multiplicar tus matches.',
    priority: 10,
    condition: function(cp){ return getProfileCompletion(cp) >= 100; }
  }
];

// ── Cálculo de % de completitud del perfil ──
// Pesos suman 100. Los campos críticos (bio, skills, CV, foto) pesan más.
function getProfileCompletion(cp){
  if (!cp) return 0;
  var fields = [
    { key: 'name',   weight: 5 },
    { key: 'role',   weight: 10 },
    { key: 'about',  weight: 15, minLen: 50 },
    { key: 'skills', weight: 15, minArr: 5 },
    { key: 'photo',  weight: 10, alt: 'avatar' },
    { key: 'cvUrl',  weight: 15 },
    { key: 'loc',    weight: 5 },
    { key: 'sal',    weight: 5 },
    { key: 'avail',  weight: 5 },
    { key: 'exp',    weight: 5 },
    { key: 'langs',  weight: 5 },
    { key: 'email',  weight: 5 }
  ];
  var earned = 0;
  fields.forEach(function(f){
    var v = cp[f.key];
    var ok = false;
    if (Array.isArray(v)) {
      ok = f.minArr ? v.length >= f.minArr : v.length > 0;
    } else if (typeof v === 'string') {
      ok = f.minLen ? v.length >= f.minLen : v.trim().length > 0;
    } else if (v) {
      ok = true;
    }
    if (!ok && f.alt && cp[f.alt]) ok = true;
    if (ok) earned += f.weight;
  });
  // El total real puede ser 100 exacto; clamping defensivo.
  return Math.min(100, Math.max(0, Math.round(earned)));
}

// Devuelve la lista de tips activos para el candidato, ordenados por prioridad.
function getActiveTips(cp, ctx){
  ctx = ctx || coachSession;
  return COACH_TIPS
    .filter(function(t){ try { return t.condition(cp, ctx); } catch(e){ return false; } })
    .sort(function(a, b){ return b.priority - a.priority; });
}

// Devuelve el tip de mayor prioridad para mostrar en el banner.
function getTopActiveTip(cp){
  var tips = getActiveTips(cp);
  return tips[0] || null;
}

// ── Superficie A: Banner en swipe-scr ──
function renderTipBanner(){
  var banner = G('tip-banner');
  if (!banner) return;
  // Sólo para candidatos logueados con perfil real
  if (USER_ROLE !== 'candidate') { banner.style.display = 'none'; return; }
  // Si el usuario lo dismisseó esta sesión, no volver a mostrar hasta recargar
  if (coachSession.bannerDismissed) { banner.style.display = 'none'; return; }
  var tip = getTopActiveTip(cpData);
  if (!tip) {
    banner.style.display = 'none';
    coachSession.currentBannerTipId = null;
    return;
  }
  coachSession.currentBannerTipId = tip.id;
  banner.dataset.tipId = tip.id;
  var i = G('tip-banner-icon');   if (i) i.textContent = tip.icon;
  var t = G('tip-banner-title');  if (t) t.textContent = tip.title;
  var b = G('tip-banner-body');   if (b) b.textContent = tip.body;
  banner.style.display = 'flex';
}

// El usuario cierra el banner → no se vuelve a mostrar en toda la sesión.
function dismissTip(e){
  if (e && e.stopPropagation) e.stopPropagation();
  coachSession.bannerDismissed = true;
  var banner = G('tip-banner');
  if (banner) banner.style.display = 'none';
}

// Tap sobre el banner (no en la X) → opcional: lleva al perfil para corregir.
function openTipAction(){
  // Por ahora todos los tips redirigen al perfil del candidato para editar.
  // (Las acciones específicas por tip se pueden afinar luego.)
  go('candidate-profile-scr');
  if (typeof initCPScreen === 'function') initCPScreen();
}

// ── Superficie B: Sección "Mejorá tu perfil" en candidate-profile-scr ──
function renderProfileCoach(){
  var pct = getProfileCompletion(cpData);
  var pctNum = G('coach-pct-num');   if (pctNum) pctNum.textContent = pct;
  var fill   = G('coach-pct-fill');  if (fill)   fill.style.width = pct + '%';

  var list = G('coach-tips-list');
  if (!list) return;
  var tips = getActiveTips(cpData).slice(0, 4); // mostrar top 4
  if (tips.length === 0) {
    list.innerHTML = '<li class="coach-tip coach-tip-done">🎉  ¡Tu perfil está completo! Compartilo en LinkedIn para multiplicar matches.</li>';
    return;
  }
  list.innerHTML = tips.map(function(t){
    return '<li class="coach-tip">'
         + '<span class="coach-tip-icon">' + t.icon + '</span>'
         + '<div class="coach-tip-body">'
         +   '<div class="coach-tip-title">' + t.title + '</div>'
         +   '<div class="coach-tip-text">' + t.body + '</div>'
         + '</div>'
         + '</li>';
  }).join('');
}

// ── Superficie C: Notificación contextual tras 10 swipes sin match ──
function maybeShowContextualCoach(){
  if (USER_ROLE !== 'candidate') return;
  if (coachSession.contextualShown) return;
  if (coachSession.swipesInSession >= 10 && coachSession.matchesInSession === 0) {
    coachSession.contextualShown = true;
    if (typeof addNotif === 'function') {
      addNotif('💡',
        'Llevás 10+ perfiles vistos sin match. <strong>Editá tu perfil</strong> para destacar mejor lo que ofrecés.',
        'ahora');
    }
  }
}

// ── Hooks de comportamiento ──
function coachOnSwipe(){
  coachSession.swipesInSession++;
  maybeShowContextualCoach();
}

function coachOnMatch(){
  coachSession.matchesInSession++;
}

// Refresh global: vuelve a evaluar tips después de cambios en el perfil
// (p.ej. después de guardar perfil) o de mostrar la pantalla de swipe.
function coachRefresh(){
  renderTipBanner();
  renderProfileCoach();
}


// ── PIPELINE ──
var STAGES=['nuevo','entrevista','oferta','contratado'];
function buildKanban(){
  var cols=[[],[],[],[]];
  matches.forEach(function(m){
    var k=keyOf(m);
    cols[pipeline[k]||0].push(m);
  });
  for(var i=0;i<4;i++){
    G('k-count-'+i).textContent=cols[i].length;
    G('k-col-'+i).innerHTML=cols[i].map(function(m){
      var k=keyOf(m);
      var sc=STAGES[pipeline[k]||0];
      var av=m.photo?'<img src="'+m.photo+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%">':m.av;
      var p=pipeline[k]||0;
      // Escapar la key para usarla dentro de un atributo onclick con comillas simples
      var safeK=String(k).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      var prev=p>0?'<button class="kmove-btn" onclick="movePipelineByKey(\''+safeK+'\',-1)">◀</button>':'';
      var next=p<3?'<button class="kmove-btn" onclick="movePipelineByKey(\''+safeK+'\',1)">▶</button>':'';
      return'<div class="kcard '+sc+'"><div class="kav" style="background:'+m.color+'">'+av+'</div><div class="kname">'+m.name+'</div><div class="krole">'+m.role+'</div><div class="kmove">'+prev+next+'</div></div>';
    }).join('');
  }
  G('pipeline-sub').textContent=matches.length+' candidatos en pipeline';
}

// API principal del pipeline: opera por `key` (uid si es match real, sino name).
// El kanban pasa la key explícita desde buildKanban; el detalle entra por
// movePipelineFromDetail; y movePipeline(name) queda como dispatcher legacy.
function movePipelineByKey(key, dir){
  // Gate: empresas Free ven el pipeline en modo preview (read-only)
  if(!requirePro('mover candidatos en el pipeline')) return;
  if(pipeline[key]===undefined) pipeline[key]=0;
  pipeline[key]=Math.max(0,Math.min(3,pipeline[key]+dir));
  var m = matches.find(function(x){return keyOf(x)===key;});
  var displayName = (m && m.name) || key;
  buildKanban();
  addNotif('📋','<strong>'+displayName+'</strong> → '+['Nuevo','Entrevista','Oferta','Contratado'][pipeline[key]],'ahora');
  writePipelineStage(m || key, pipeline[key]);
  persistAll();
}

// Legacy: dispatch por nombre. Si hay nombres repetidos agarra al primero —
// preferí usar movePipelineByKey(keyOf(match), dir) cuando tengas el match.
function movePipeline(name, dir){
  var m = matches.find(function(x){return x.name===name;});
  movePipelineByKey(m ? keyOf(m) : name, dir);
}


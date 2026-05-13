
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


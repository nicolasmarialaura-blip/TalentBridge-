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


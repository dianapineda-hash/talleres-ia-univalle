import {contenido} from './aula-contenido.js';
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(url,label)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
export function unitHTML(id,pos){
 const u=contenido.courses[id].units[pos];
 if(u.pause)return `<p class="eyebrow">Pausa · 15 minutos</p><h2 id="unit-heading" tabindex="-1">Tome una pausa</h2><p>Puede descansar antes de continuar. Cuando quiera retomar, elija la siguiente actividad en el menú.</p>`;
 const v=contenido.videos[u.video];
 const yt=/[?&]v=([a-zA-Z0-9_-]{11})/.exec(v.url);
 return `<p class="eyebrow">Actividad ${pos+1} · ${u.minutes} minutos de trabajo</p><h2 id="unit-heading" tabindex="-1">${esc(u.title)}</h2><p class="goal">${esc(u.goal)}</p>
 <section><h3>Antes de empezar</h3><p>${esc(u.concept)}</p></section>
 <section class="case"><h3>El caso</h3><p>${esc(u.case)}</p></section>
 <section><h3>Qué hacer</h3><ol>${u.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><fieldset><legend>${esc(u.question)}</legend>${u.options.map((s,i)=>`<button class="choice" data-choice="${i}">${esc(s)}</button>`).join('')}</fieldset><p id="answer" role="status"></p><p class="aside">Puede cambiar de opción o avanzar cuando lo desee. La elección se guarda en su cuenta para la revisión de las actividades; no constituye una calificación.</p>
 <details id="worked-example"><summary>Ver el ejemplo explicado</summary><p>${esc(u.worked)}</p></details>
 <h3>Para pensar antes de continuar</h3><p>${esc(u.transfer)}</p><p class="aside">No necesita escribir su reflexión.</p></section>
 <section><h3>Video de apoyo</h3><h4>${esc(v.title)}</h4><p>${esc(v.origin)} · ${esc(v.language)}</p><p>${esc(u.focus)}</p><p>${esc(v.note)}</p>${yt?`<button id="play-video" data-youtube="${yt[1]}">Reproducir el video</button><div id="video-frame"></div>`:''}<p>${link(v.url,yt?'Abrir el video en YouTube':'Abrir la página con videos')}</p><p class="aside">El recurso se abre por elección del participante. El proveedor puede usar cookies o registrar la visita. Los subtítulos disponibles dependen del video. Puede continuar con la explicación escrita de esta página.</p></section>
 <section><h3>Lecturas recomendadas</h3><p>Reserve unos diez minutos para explorar el apartado indicado. La lectura completa puede hacerse después del taller.</p>${u.reads.map(k=>{const r=contenido.readings[k];return `<article class="reading"><h4>${link(r.url,r.title)}</h4><p>${esc(r.hint)}</p></article>`}).join('')}<p class="aside">Los artículos incluyen DOI para consulta en WoS. Su registro individual no ha sido verificado aquí. El texto disponible depende del editor y del acceso institucional. No necesita enviar estas lecturas a una IA.</p></section>`;
}
export function resourcesHTML(){
 return `<section id="herramientas"><h2>Herramientas para consultar</h2><p>Estas recomendaciones responden a tareas de investigación. No constituyen una clasificación de calidad. Puede explorar sus funciones después del recorrido; no necesita cuentas externas para resolver los casos.</p><p>Las consultas propuestas usan preguntas o datos bibliográficos. No requieren artículos, entrevistas ni documentos de empresas. Las políticas de cada proveedor se aplican al abrir sus servicios.</p><div class="tool-grid">${contenido.tools.map(t=>`<article class="tool-card"><h3>${link(t.url,t.name)}</h3><p>${esc(t.use)}</p><p><strong>Ejemplo de consulta:</strong> ${esc(t.example)}</p><p>${esc(t.limit)}</p><p>${link(t.source,'Consultar la información del proveedor')}${t.pricing?' · '+link(t.pricing,'Planes de acceso'):''}</p></article>`).join('')}</div><p class="aside">Condiciones consultadas el 25 de noviembre de 2026. Las funciones y cuotas pueden cambiar. Las herramientas de mapas emplean relaciones bibliográficas; no todas generan respuestas mediante un modelo de lenguaje.</p></section>`;
}
export function headerHTML(user=null){return `<header><img src="media/logo-univalle.jpg" alt="Universidad del Valle" width="424" height="51"><nav aria-label="Navegación"><a href="index.html">Inicio</a><a href="taller-1.html">Taller 1</a><a href="taller-2.html">Taller 2</a><a href="#herramientas">Herramientas</a>${user?.role==='admin'?'<a href="administracion.html">Administración</a>':''}</nav>${user?`<div class="account-bar"><span>${esc(user.name)} <small>Usuario: ${esc(user.username)}</small></span><a href="acceso.html?password=1&amp;next=%2Faula%2Findex.html">Mi contraseña</a><button id="logout" class="button-secondary" type="button">Cerrar sesión</button></div>`:''}</header>`;}
export function footerHTML(){return `<footer><p>Material de formación para investigadores de la Universidad del Valle. No implica aval institucional. <a href="https://www.univalle.edu.co/la-universidad/nuestros-simbolos/manual-de-identidad-visual-corporativa" target="_blank" rel="noopener noreferrer">Manual de identidad</a>.</p><p>Se guarda el avance por actividad y el tiempo acumulado de participación. El registro de aprendizaje no incluye fechas ni horarios. La administración puede consultarlo para revisar evidencias de formación. El alojamiento y los recursos externos aplican sus políticas.</p></footer>`;}
export function courseProgress(id,rows=[]){
 const course=contenido.courses[id],activities=course.units.map((u,i)=>({...u,unit:i+1})).filter(u=>!u.pause);
 const byUnit=new Map(rows.filter(r=>String(r.course)===String(id)).map(r=>[Number(r.unit),r]));
 const completed=activities.filter(u=>byUnit.get(u.unit)?.completed).length;
 return {completed,total:activities.length,percent:Math.round(completed/activities.length*100),answered:activities.filter(u=>Number.isInteger(byUnit.get(u.unit)?.answer)).length,pauseCompleted:!!byUnit.get(course.units.findIndex(u=>u.pause)+1)?.completed};
}
export function activityIsActive({visible,focused,idleMs,onUnit=true}){
 return !!visible&&!!focused&&!!onUnit&&Number.isFinite(idleMs)&&idleMs>=0&&idleMs<300000;
}
export function navigationHTML(id){return contenido.courses[id].units.map((u,i)=>`<a href="#unidad-${i+1}" data-unit="${i}">${i+1}. ${esc(u.title)}<small>${u.minutes} minutos previstos</small><span class="unit-state" data-unit-state="${i+1}"></span></a>`).join('');}
export function completionHTML(pause=false){return `<section class="completion"><h3>${pause?'Estado de la pausa':'Avance de esta actividad'}</h3><p>${pause?'Puede señalar que realizó la pausa y volver a cualquier apartado.':'Cuando considere que ha trabajado el caso, puede marcar esta actividad como realizada. Esta marca expresa su valoración del trabajo; la administración podrá revisar también la respuesta del ejercicio.'}</p><button id="complete-unit" type="button" aria-pressed="false">${pause?'Marcar pausa como realizada':'Marcar actividad como realizada'}</button><p>Puede cambiar esta marca. Todas las actividades permanecen disponibles.</p></section>`;}

const API='/aula/api';
async function request(path,{method='GET',body,keepalive=false}={}){
 const response=await fetch(API+path,{method,credentials:'same-origin',cache:'no-store',keepalive,signal:AbortSignal.timeout(12000),headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
 let data;try{data=await response.json()}catch{throw new Error('No fue posible interpretar la respuesta del servidor.');}
 if(!response.ok){const error=new Error(data.error||'No fue posible completar la solicitud.');error.status=response.status;throw error;}
 return data;
}
function accessURL(){return '/aula/acceso.html?next='+encodeURIComponent(location.pathname+location.search+location.hash);}
function mergeRows(previous,incoming){
 const old=new Map(previous.map(r=>[`${r.course}:${r.unit}`,r]));
 return incoming.map(r=>({...r,seconds:Math.max(Number(r.seconds)||0,Number(old.get(`${r.course}:${r.unit}`)?.seconds)||0)}));
}
async function boot(){
 const main=document.querySelector('main'),id=document.body.dataset.course;
 let user,rows=[];
 try{({user}=await request('/session'));if(!user||user.mustChangePassword){location.replace(accessURL());return;}({progress:rows}=await request('/progress'));}
 catch(error){if(error.status===401){location.replace(accessURL());return;}main.innerHTML=`<h1>No se pudo abrir el taller</h1><p>${esc(error.message)}</p><p>El contenido y su avance se conservan. Vuelva a intentar el acceso.</p><button id="retry-access" type="button">Volver a intentar</button>`;document.querySelector('#retry-access').onclick=()=>location.reload();return;}
 document.body.insertAdjacentHTML('afterbegin',headerHTML(user));
 document.body.insertAdjacentHTML('beforeend',footerHTML());
 let stopTracking=async()=>{};
 document.querySelector('#logout').onclick=async()=>{try{await stopTracking();await request('/logout',{method:'POST',body:{}});location.replace('/aula/acceso.html');}catch(error){const note=document.createElement('p');note.setAttribute('role','alert');note.textContent=error.message;document.querySelector('.account-bar').append(note);}};
 if(!id){
  main.innerHTML=`<p class="eyebrow">Administración de empresas</p><h1>Talleres de IA para la investigación</h1><p class="lead">Recorra los casos a su ritmo. Puede entrar a cualquier actividad y consultar su explicación. Su cuenta conserva el avance para que pueda retomarlo.</p><div class="tool-grid">${Object.entries(contenido.courses).map(([k,c])=>{const p=courseProgress(k,rows);return `<article class="tool-card"><p>Taller ${k} · 4 horas previstas</p><h2>${esc(c.title)}</h2><p>${esc(c.intro)}</p><p>${p.completed} de ${p.total} actividades marcadas como realizadas.</p><a class="button" href="taller-${k}.html">Entrar al taller ${k}</a></article>`}).join('')}</div><section><h2>Cómo recorrer los talleres</h2><p>Elija una actividad en el menú y cambie de apartado cuando lo necesite. No tiene que terminar un ejercicio para abrir otro. Cada programa comprende cuatro horas, incluida una pausa.</p><p>La cuenta conserva las respuestas de los ejercicios y las marcas de realización. También registra la duración acumulada de la actividad en esta página, sin fechas ni horarios. La administración puede revisar esta información como evidencia de formación.</p><p>Las lecturas se consultan en las páginas de sus editores. Los casos han sido creados para aprender; no representan resultados de las publicaciones recomendadas.</p></section>${resourcesHTML()}`;
  return;
 }
 const course=contenido.courses[id];let pos=0,saveQueue=Promise.resolve(),pulseQueue=Promise.resolve(),pendingPulses=0,lastQueuedPulse='',lastInteraction=performance.now(),lastActive=false;
 const tabId=crypto.randomUUID();
 main.innerHTML=`<div class="intro"><p class="eyebrow">Taller ${id} · Administración de empresas · 4 horas previstas</p><h1>${esc(course.title)}</h1><p class="lead">${esc(course.intro)}</p><p>${esc(course.outcome)}</p><details><summary>Cómo comenzar y qué se registra</summary><p>Elija cualquier actividad en el menú. Lea el caso y pulse una opción para consultar la explicación. Puede avanzar sin responder y volver cuando lo desee.</p><p>Su cuenta guarda la elección del ejercicio y si consultó el ejemplo explicado. También conserva las actividades que marque como realizadas. La administración puede revisar estos datos.</p><p>El registro de participación suma la duración de actividad en una pestaña visible, con foco e interacción reciente. Se detiene al cambiar de pestaña o después de un periodo sin interacción. Las lecturas y los vídeos abiertos fuera de esta página no se contabilizan. La duración registrada no acredita por sí misma atención o aprendizaje.</p><p>No se guardan fechas ni horarios en el registro de aprendizaje. La duración prevista de cada apartado orienta el estudio y no se convierte en tiempo registrado por abrirlo.</p></details><a class="button" href="#unidad-1">Ir a la primera actividad</a></div><div class="learning-progress" aria-label="Avance del taller"><p id="course-progress"></p><progress id="course-meter" max="100" value="0" aria-label="Actividades realizadas"></progress><p class="aside">Las marcas de realización no restringen el acceso a otras actividades.</p></div><p id="save-status" class="save-status" role="status" aria-live="polite"></p><div id="tracking-notice" class="tracking-notice" hidden><p>El registro de actividad está en pausa por falta de interacción. Puede continuar leyendo o retomar el registro cuando vuelva al trabajo.</p><button id="resume-tracking" type="button" class="button-secondary">Retomar el registro</button></div><p id="tracking-error" class="save-status" role="status" hidden></p><div class="layout"><aside><h2>Recorrido</h2><nav id="units" aria-label="Actividades">${navigationHTML(id)}</nav></aside><div><article id="unit"></article><nav class="next-prev" aria-label="Avanzar"><button id="previous" type="button">Anterior</button><button id="next" type="button">Continuar</button></nav></div></div>${resourcesHTML()}`;
 const currentRow=(unit=pos+1)=>rows.find(r=>Number(r.course)===Number(id)&&Number(r.unit)===unit)||{};
 const saveStatus=(text,error=false)=>{const node=document.querySelector('#save-status');node.textContent=text;node.classList.toggle('save-error',error);};
 const renderState=()=>{
  const p=courseProgress(id,rows);document.querySelector('#course-progress').textContent=`${p.completed} de ${p.total} actividades marcadas como realizadas (${p.percent} %).`;
  document.querySelector('#course-meter').value=p.percent;
  for(const node of document.querySelectorAll('[data-unit-state]')){const row=currentRow(Number(node.dataset.unitState));node.textContent=row.completed?'Realizada':row.opened?'Consultada':'';}
  const row=currentRow(),u=course.units[pos],complete=document.querySelector('#complete-unit');
  if(complete){complete.setAttribute('aria-pressed',String(!!row.completed));complete.textContent=row.completed?'Quitar marca de realización':u.pause?'Marcar pausa como realizada':'Marcar actividad como realizada';}
  if(!u.pause&&Number.isInteger(row.answer)&&u.options[row.answer]!==undefined){document.querySelector('#answer').textContent=u.feedback[row.answer];document.querySelectorAll('[data-choice]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.choice)===row.answer)));}
 };
 const save=(unit,patch)=>{
  const task=saveQueue.then(async()=>{saveStatus('Guardando el avance…');try{const result=await request('/progress',{method:'PATCH',body:{course:Number(id),unit,...patch}});rows=mergeRows(rows,result.progress);renderState();saveStatus('Avance guardado en su cuenta.');return true;}catch(error){saveStatus('No se pudo guardar este cambio. '+error.message,true);if(error.status===401)location.replace(accessURL());return false;}});
  saveQueue=task.catch(()=>{});return task;
 };
 const isActive=()=>activityIsActive({visible:document.visibilityState==='visible',focused:document.hasFocus(),idleMs:performance.now()-lastInteraction,onUnit:location.hash!=='#herramientas'});
 const pulse=(forceInactive=false,{keepalive=false}={})=>{
  const active=!forceInactive&&isActive(),unit=pos+1,key=unit+':'+active;
  document.querySelector('#tracking-notice').hidden=!(document.visibilityState==='visible'&&performance.now()-lastInteraction>=300000);
  if(pendingPulses&&lastQueuedPulse===key)return pulseQueue;
  pendingPulses++;lastQueuedPulse=key;
  const task=pulseQueue.then(async()=>{
   // Un inicio pendiente deja de ser válido si la persona ya cambió de apartado.
   const actualActive=active&&unit===pos+1&&isActive();
   try{await request('/pulse',{method:'POST',body:{course:Number(id),unit,active:actualActive,tabId},keepalive});lastActive=actualActive;document.querySelector('#tracking-error').hidden=true;}
   catch(error){const node=document.querySelector('#tracking-error');node.hidden=false;node.textContent='El registro de actividad no está disponible. Puede continuar con el contenido; la duración de este intervalo puede quedar sin registrar. '+error.message;if(error.status===401)location.replace(accessURL());}
   finally{pendingPulses--;}
  });
  pulseQueue=task.catch(()=>{});return task;
 };
 stopTracking=()=>pulse(true);
 const show=(focus=false)=>{
  const match=/^#unidad-([1-7])$/.exec(location.hash);pos=match?Number(match[1])-1:0;
  const unit=pos+1,u=course.units[pos];
  document.querySelector('#unit').innerHTML=unitHTML(id,pos)+completionHTML(!!u.pause);
  document.querySelectorAll('[data-unit]').forEach(a=>{if(Number(a.dataset.unit)===pos)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
  document.querySelector('#previous').disabled=pos===0;
  document.querySelector('#next').textContent=pos===course.units.length-1?'Ir a los recursos':'Continuar';
  renderState();
  document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=async()=>{const choice=Number(b.dataset.choice);document.querySelector('#answer').textContent=u.feedback[choice];const buttons=[...document.querySelectorAll('[data-choice]')];buttons.forEach(x=>{x.disabled=true;x.setAttribute('aria-pressed',String(x===b))});await save(unit,{answer:choice});buttons.forEach(x=>x.disabled=false);});
  document.querySelector('#complete-unit').onclick=async e=>{const button=e.currentTarget;button.disabled=true;await save(unit,{completed:!currentRow(unit).completed});button.disabled=false;};
  const worked=document.querySelector('#worked-example');if(worked)worked.addEventListener('toggle',()=>{if(worked.open&&!currentRow(unit).explained)void save(unit,{explained:true});});
  const play=document.querySelector('#play-video');if(play)play.onclick=()=>{const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+play.dataset.youtube;frame.title=contenido.videos[u.video].title;frame.allowFullscreen=true;frame.referrerPolicy='no-referrer';document.querySelector('#video-frame').replaceChildren(frame);play.hidden=true;};
  if(!currentRow(unit).opened)void save(unit,{opened:true});
  if(focus){const h=document.querySelector('#unit-heading');h.focus();h.scrollIntoView({block:'start'});}
  void pulse();
 };
 document.querySelector('#previous').onclick=()=>{location.hash='unidad-'+pos};
 document.querySelector('#next').onclick=()=>{location.hash=pos===course.units.length-1?'herramientas':'unidad-'+(pos+2)};
 window.addEventListener('hashchange',()=>{const closing=pulse(true);if(location.hash.startsWith('#unidad-')){show(true);void closing.finally(()=>pulse());}});
 const interaction=()=>{const wasIdle=performance.now()-lastInteraction>=300000;lastInteraction=performance.now();document.querySelector('#tracking-notice').hidden=true;if(wasIdle||!lastActive)void pulse();};
 for(const event of ['pointerdown','keydown','scroll','touchstart'])window.addEventListener(event,interaction,{passive:true});
 document.querySelector('#resume-tracking').onclick=interaction;
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')lastInteraction=performance.now();void pulse();});
 window.addEventListener('focus',()=>{lastInteraction=performance.now();void pulse();});
 window.addEventListener('blur',()=>{void pulse(true);});
 window.addEventListener('pagehide',()=>{void pulse(true,{keepalive:true});});
 window.setInterval(()=>{void pulse();},20000);
 show(location.hash.startsWith('#unidad-'));
}
if(typeof document!=='undefined')void boot();

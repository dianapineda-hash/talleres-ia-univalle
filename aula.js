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
 <section><h3>Qué hacer</h3><ol>${u.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><fieldset><legend>${esc(u.question)}</legend>${u.options.map((s,i)=>`<button class="choice" data-choice="${i}">${esc(s)}</button>`).join('')}</fieldset><p id="answer" role="status"></p><p class="aside">Puede cambiar de opción o avanzar cuando lo desee. La respuesta no se guarda ni cuenta como una calificación.</p>
 <details><summary>Ver el ejemplo explicado</summary><p>${esc(u.worked)}</p></details>
 <h3>Para pensar antes de continuar</h3><p>${esc(u.transfer)}</p><p class="aside">No necesita escribir su reflexión.</p></section>
 <section><h3>Video de apoyo</h3><h4>${esc(v.title)}</h4><p>${esc(v.origin)} · ${esc(v.language)}</p><p>${esc(u.focus)}</p><p>${esc(v.note)}</p>${yt?`<button id="play-video" data-youtube="${yt[1]}">Reproducir el video</button><div id="video-frame"></div>`:''}<p>${link(v.url,yt?'Abrir el video en YouTube':'Abrir la página con videos')}</p><p class="aside">El recurso se abre por elección del participante. El proveedor puede usar cookies o registrar la visita. Los subtítulos disponibles dependen del video. Puede continuar con la explicación escrita de esta página.</p></section>
 <section><h3>Lecturas recomendadas</h3><p>Reserve unos diez minutos para explorar el apartado indicado. La lectura completa puede hacerse después del taller.</p>${u.reads.map(k=>{const r=contenido.readings[k];return `<article class="reading"><h4>${link(r.url,r.title)}</h4><p>${esc(r.hint)}</p></article>`}).join('')}<p class="aside">Los artículos incluyen DOI para consulta en WoS. Su registro individual no ha sido verificado aquí. El texto disponible depende del editor y del acceso institucional. No necesita enviar estas lecturas a una IA.</p></section>`;
}
export function resourcesHTML(){
 return `<section id="herramientas"><h2>Herramientas para consultar</h2><p>Estas recomendaciones responden a tareas de investigación. No constituyen una clasificación de calidad. Puede explorar sus funciones después del recorrido; ninguna cuenta es necesaria para resolver los casos.</p><p>Las consultas propuestas usan preguntas o datos bibliográficos. No requieren artículos, entrevistas ni documentos de empresas. Las políticas de cada proveedor se aplican al abrir sus servicios.</p><div class="tool-grid">${contenido.tools.map(t=>`<article class="tool-card"><h3>${link(t.url,t.name)}</h3><p>${esc(t.use)}</p><p><strong>Ejemplo de consulta:</strong> ${esc(t.example)}</p><p>${esc(t.limit)}</p><p>${link(t.source,'Consultar la información del proveedor')}${t.pricing?' · '+link(t.pricing,'Planes de acceso'):''}</p></article>`).join('')}</div><p class="aside">Condiciones consultadas el 25 de noviembre de 2026. Las funciones y cuotas pueden cambiar. Las herramientas de mapas emplean relaciones bibliográficas; no todas generan respuestas mediante un modelo de lenguaje.</p></section>`;
}
export function headerHTML(){return `<header><img src="media/logo-univalle.jpg" alt="Universidad del Valle" width="424" height="51"><nav aria-label="Navegación"><a href="index.html">Inicio</a><a href="taller-1.html">Taller 1</a><a href="taller-2.html">Taller 2</a><a href="#herramientas">Herramientas</a></nav></header>`;}
export function footerHTML(){return `<footer><p>Material de formación para investigadores de la Universidad del Valle. No implica aval institucional. <a href="https://www.univalle.edu.co/la-universidad/nuestros-simbolos/manual-de-identidad-visual-corporativa" target="_blank" rel="noopener noreferrer">Manual de identidad</a>.</p><p>Esta ruta no recoge respuestas ni guarda avances. No solicita datos de participantes. El alojamiento puede conservar registros de acceso; los servicios externos aplican sus políticas. No hay analítica añadida a estas páginas.</p></footer>`;}
if(typeof document!=='undefined'){
 const main=document.querySelector('main'),id=document.body.dataset.course;
 document.body.insertAdjacentHTML('afterbegin',headerHTML());
 document.body.insertAdjacentHTML('beforeend',footerHTML());
 if(!id){main.innerHTML=`<p class="eyebrow">Administración de empresas</p><h1>Talleres de IA para la investigación</h1><p class="lead">Resuelva los casos a su ritmo. Puede consultar una explicación antes de continuar. El recorrido se realiza en esta página, sin cuentas ni entrega de respuestas.</p><div class="tool-grid">${Object.entries(contenido.courses).map(([k,c])=>`<article class="tool-card"><p>Taller ${k} · 4 horas</p><h2>${esc(c.title)}</h2><p>${esc(c.intro)}</p><a class="button" href="taller-${k}.html">Comenzar el taller ${k}</a></article>`).join('')}</div><section><h2>Cómo recorrer los talleres</h2><p>Los tiempos incluyen la práctica y la consulta de recursos. Cada recorrido suma cuatro horas, con una pausa. Puede detenerse y retomar desde el menú de actividades.</p><p>Las lecturas se consultan en las páginas de sus editores. Los ejemplos han sido creados para aprender; no representan resultados de las publicaciones recomendadas. Los videos proceden de los proveedores indicados.</p></section>${resourcesHTML()}`;}
 else{
 const course=contenido.courses[id];let pos=0;
 main.innerHTML=`<div class="intro"><p class="eyebrow">Taller ${id} · Administración de empresas · 4 horas</p><h1>${esc(course.title)}</h1><p class="lead">${esc(course.intro)}</p><p>${esc(course.outcome)}</p><details><summary>Cómo comenzar</summary><p>Elija una actividad en el menú. Lea el caso y pulse una opción si desea recibir una explicación. Puede avanzar sin responder.</p><p>La página no guarda sus elecciones. El enlace de la actividad permite volver a ese punto, pero no contiene respuestas. Al recargar, la actividad se abre sin elecciones previas.</p><p>Los tiempos incluyen la práctica y la consulta de recursos; no son la duración de los videos. Cada recorrido suma cuatro horas. Puede distribuirlo entre varios días.</p></details><a class="button" href="#unidad-1">Ir a la primera actividad</a></div><div class="layout"><aside><h2>Recorrido</h2><nav id="units" aria-label="Actividades">${course.units.map((u,i)=>`<a href="#unidad-${i+1}" data-unit="${i}">${i+1}. ${esc(u.title)}<small>${u.minutes} minutos</small></a>`).join('')}</nav></aside><div><article id="unit"></article><nav class="next-prev" aria-label="Avanzar"><button id="previous">Anterior</button><button id="next">Continuar</button></nav></div></div>${resourcesHTML()}`;
 const show=(focus=false)=>{
 const match=/^#unidad-([1-7])$/.exec(location.hash);pos=match?Number(match[1])-1:0;
 document.querySelector('#unit').innerHTML=unitHTML(id,pos);
 document.querySelectorAll('[data-unit]').forEach(a=>{if(Number(a.dataset.unit)===pos)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
 document.querySelector('#previous').disabled=pos===0;
 document.querySelector('#next').textContent=pos===course.units.length-1?'Ir a los recursos':'Continuar';
 document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.choice),u=course.units[pos];document.querySelector('#answer').textContent=u.feedback[i];document.querySelectorAll('[data-choice]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
 const play=document.querySelector('#play-video');if(play)play.onclick=()=>{const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+play.dataset.youtube;frame.title=contenido.videos[course.units[pos].video].title;frame.allowFullscreen=true;frame.referrerPolicy='no-referrer';document.querySelector('#video-frame').replaceChildren(frame);play.hidden=true;};
 if(focus){const h=document.querySelector('#unit-heading');h.focus();h.scrollIntoView({block:'start'});}
 };
 document.querySelector('#previous').onclick=()=>{location.hash='unidad-'+pos};
 document.querySelector('#next').onclick=()=>{location.hash=pos===course.units.length-1?'herramientas':'unidad-'+(pos+2)};
 window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#unidad-'))show(true)});
 show(location.hash.startsWith('#unidad-'));
 }
}

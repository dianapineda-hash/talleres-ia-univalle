import {contenido} from './aula-contenido.js';
import {apiRequest, escapeHTML as esc} from './acceso.js';

const yes = value => value ? 'Sí' : 'No';
export const recordedSeconds = value => typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
export const minutes = seconds => (recordedSeconds(seconds) / 60).toLocaleString('es-CO', {minimumFractionDigits:1,maximumFractionDigits:1});

export function courseProgress(student, courseId) {
  const course = contenido.courses[courseId];
  if (!course) throw new Error('Taller desconocido.');
  const records = new Map();
  for (const entry of Array.isArray(student.progress) ? student.progress : []) {
    if (String(entry.course) === String(courseId) && Number.isInteger(entry.unit) && entry.unit >= 1 && entry.unit <= course.units.length) records.set(entry.unit,entry);
  }
  const units = course.units.map((unit,index) => {
    const record = records.get(index+1) || {};
    const answer = !unit.pause && Number.isInteger(record.answer) && record.answer >= 0 && record.answer < unit.options.length ? record.answer : null;
    return {unit,index:index+1,opened:record.opened === true,completed:record.completed === true,explained:record.explained === true,answer,seconds:recordedSeconds(record.seconds)};
  });
  const exercises = units.filter(item => !item.unit.pause);
  const activitySeconds = exercises.reduce((sum,item) => sum+item.seconds,0);
  const pauseSeconds = units.filter(item => item.unit.pause).reduce((sum,item) => sum+item.seconds,0);
  return {course,units,activitySeconds,pauseSeconds,totalSeconds:activitySeconds+pauseSeconds,
    completed:exercises.filter(item=>item.completed).length,answered:exercises.filter(item=>item.answer !== null).length,
    explained:exercises.filter(item=>item.explained).length,exerciseCount:exercises.length,
    expectedMinutes:course.units.reduce((sum,unit)=>sum+unit.minutes,0),
    activityMinutes:exercises.reduce((sum,item)=>sum+item.unit.minutes,0),
    pauseMinutes:units.filter(item=>item.unit.pause).reduce((sum,item)=>sum+item.unit.minutes,0)};
}

export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s\uFEFF]*[=+@-]/u.test(text) || /^[\t\r\n]/.test(text)) text = "'"+text;
  return '"'+text.replace(/"/g,'""')+'"';
}

export function studentCSV(student) {
  const rows = [['Estudiante','Usuario','Taller','Nombre del taller','Apartado','Nombre del apartado','Abierto','Realizado declarado','Explicación consultada','Respuesta registrada','Opción de referencia','Minutos registrados','Minutos previstos']];
  for (const courseId of Object.keys(contenido.courses)) {
    const result = courseProgress(student,courseId);
    for (const item of result.units) {
      rows.push([student.name,student.username,courseId,result.course.title,item.index,item.unit.title,yes(item.opened),yes(item.completed),item.unit.pause?'No aplica':yes(item.explained),item.answer === null?(item.unit.pause?'No aplica':'Sin respuesta'):item.unit.options[item.answer],item.unit.pause?'No aplica':item.unit.options[item.unit.correct],minutes(item.seconds),item.unit.minutes]);
    }
  }
  return '\uFEFF'+rows.map(row=>row.map(csvCell).join(';')).join('\r\n');
}

function unitReport(item) {
  const unit = item.unit;
  if (unit.pause) return `<section class="unit-report"><h3>Apartado ${item.index}. ${esc(unit.title)}</h3><p class="report-meta">Abierto: ${yes(item.opened)}. Pausa marcada como realizada: ${yes(item.completed)}.</p><p>Tiempo registrado: ${minutes(item.seconds)} minutos. Pausa prevista: ${unit.minutes} minutos.</p><p class="aside">Este apartado no contiene un ejercicio.</p></section>`;
  const chosen = item.answer === null ? 'Sin respuesta registrada.' : unit.options[item.answer];
  return `<section class="unit-report"><h3>Apartado ${item.index}. ${esc(unit.title)}</h3><p>${esc(unit.goal)}</p><p class="report-meta">Abierto: ${yes(item.opened)}. Realizado, según declaración del estudiante: ${yes(item.completed)}. Explicación consultada: ${yes(item.explained)}.</p><p>Tiempo registrado: ${minutes(item.seconds)} minutos. Dedicación prevista: ${unit.minutes} minutos.</p><dl><dt>Pregunta del ejercicio</dt><dd>${esc(unit.question)}</dd><dt>Respuesta registrada</dt><dd>${esc(chosen)}</dd><dt>Opción de referencia del ejercicio</dt><dd>${esc(unit.options[unit.correct])}</dd>${item.answer === null ? '' : `<dt>Comentario correspondiente a la respuesta</dt><dd>${esc(unit.feedback[item.answer])}</dd>`}</dl></section>`;
}

export function reportHTML(student) {
  return `<div class="print-only"><img src="media/logo-univalle.jpg" alt="Universidad del Valle" width="424" height="51"><p>IA Hub · Reporte de recorrido</p></div><div class="report-identity"><h2>${esc(student.name)}</h2><p>Usuario: <strong>${esc(student.username)}</strong>. Cuenta: ${student.active ? 'activa' : 'desactivada'}.</p><p class="no-print">Cambio de contraseña pendiente: ${yes(student.mustChangePassword)}.</p></div><div class="admin-actions no-print"><button type="button" id="print-report">Imprimir o guardar PDF</button><button type="button" id="export-report" class="secondary">Descargar registro CSV</button><button type="button" id="reset-password" class="secondary">Restablecer contraseña</button><button type="button" id="toggle-active" class="secondary">${student.active ? 'Desactivar' : 'Activar'} cuenta</button></div><p class="aside no-print">Para guardar el reporte en PDF, elija esa opción en la ventana de impresión. Desactive «Encabezados y pies de página» para excluir la fecha y la dirección web que añade el navegador.</p><div class="review-note"><p>El tiempo refleja la actividad registrada con la página visible y una interacción reciente. La consulta de lecturas o vídeos en otras páginas puede quedar fuera de este registro. Los minutos no certifican atención ni comprensión.</p><p>La marca «Realizado» corresponde a una declaración del estudiante. Se muestra la respuesta que permanece registrada en cada ejercicio. Este reporte requiere revisión institucional y no constituye un certificado ni acredita asistencia.</p></div>${Object.keys(contenido.courses).map(courseId=>{
    const result=courseProgress(student,courseId);
    return `<section class="report-course"><p class="eyebrow">Taller ${esc(courseId)}</p><h2>${esc(result.course.title)}</h2><div class="table-wrap"><table class="summary-table"><caption>Evidencia registrada frente al recorrido previsto</caption><thead><tr><th scope="col">Aspecto</th><th scope="col">Registro</th><th scope="col">Referencia del taller</th></tr></thead><tbody><tr><th scope="row">Tiempo en actividades</th><td>${minutes(result.activitySeconds)} minutos</td><td>${result.activityMinutes} minutos</td></tr><tr><th scope="row">Tiempo en la pausa</th><td>${minutes(result.pauseSeconds)} minutos</td><td>${result.pauseMinutes} minutos</td></tr><tr><th scope="row">Tiempo del recorrido</th><td>${minutes(result.totalSeconds)} minutos</td><td>${result.expectedMinutes} minutos</td></tr><tr><th scope="row">Ejercicios marcados como realizados</th><td>${result.completed} de ${result.exerciseCount}</td><td>${result.exerciseCount} ejercicios</td></tr><tr><th scope="row">Ejercicios con respuesta</th><td>${result.answered} de ${result.exerciseCount}</td><td>Elección de una opción por ejercicio</td></tr><tr><th scope="row">Explicaciones consultadas</th><td>${result.explained} de ${result.exerciseCount}</td><td>Consulta disponible en cada ejercicio</td></tr></tbody></table></div><p class="aside">La dedicación prevista orienta el recorrido. No equivale a créditos académicos. La navegación permite abrir los apartados en cualquier orden.</p>${result.units.map(unitReport).join('')}</section>`;
  }).join('')}`;
}

async function startAdmin() {
  const status=document.querySelector('#admin-status'), content=document.querySelector('#admin-content');
  const report=document.querySelector('#report-panel'), list=document.querySelector('#student-list');
  let students=[], selectedId=null;
  const message=(text,error=false)=>{status.textContent=text;status.classList.toggle('error',error)};
  const login=()=>location.replace('/aula/acceso.html?next='+encodeURIComponent('/aula/administracion.html'));
  const showError=error=>{
    if(error.status===401 || error.code==='PASSWORD_CHANGE_REQUIRED') {login();return;}
    message(error.status===409?'Ese usuario ya está registrado. Elija otro nombre de usuario.':'No fue posible completar la solicitud. Revise los datos e intente de nuevo.',true);
  };
  function hideCredential() {
    document.querySelector('#credential-panel').hidden=true;
    document.querySelector('#credential-value').textContent='';
    document.querySelector('#credential-user').textContent='';
  }
  function showCredential(user,password) {
    document.querySelector('#credential-user').textContent=user.name+' · Usuario: '+user.username;
    document.querySelector('#credential-value').textContent=password;
    document.querySelector('#credential-panel').hidden=false;
    document.querySelector('#credential-panel').scrollIntoView({block:'center',behavior:'smooth'});
  }
  function renderList() {
    const term=document.querySelector('#student-search').value.trim().toLocaleLowerCase('es');
    const filtered=students.filter(student=>(student.name+' '+student.username).toLocaleLowerCase('es').includes(term));
    document.querySelector('#student-count').textContent=filtered.length+' de '+students.length+' cuentas';
    list.innerHTML=filtered.length ? filtered.map(student=>`<li><button type="button" data-student="${esc(student.id)}" aria-current="${String(student.id)===String(selectedId)}"><strong>${esc(student.name)}</strong><span>${esc(student.username)} · ${student.active?'Activa':'Desactivada'}</span></button></li>`).join('') : '<li>No hay estudiantes que coincidan con la búsqueda.</li>';
  }
  function renderReport() {
    const student=students.find(item=>String(item.id)===String(selectedId));
    report.hidden=!student;document.querySelector('#empty-report').hidden=!!student;
    report.innerHTML=student?reportHTML(student):'';
  }
  async function refresh() {
    const result=await apiRequest('/admin/students');
    students=Array.isArray(result.students)?result.students:[];
    renderList();renderReport();
  }
  list.addEventListener('click',event=>{
    const button=event.target.closest('[data-student]');if(!button)return;
    hideCredential();selectedId=button.dataset.student;renderList();renderReport();report.focus({preventScroll:true});
  });
  document.querySelector('#student-search').addEventListener('input',renderList);
  document.querySelector('#refresh-students').addEventListener('click',async event=>{
    event.currentTarget.disabled=true;
    try{await refresh();message('Registros actualizados.')}catch(error){showError(error)}finally{document.querySelector('#refresh-students').disabled=false;}
  });
  document.querySelector('#student-form').addEventListener('submit',async event=>{
    event.preventDefault();const form=event.currentTarget,button=form.querySelector('button');button.disabled=true;hideCredential();
    try{
      const {user,password}=await apiRequest('/admin/students',{method:'POST',body:{username:document.querySelector('#student-username').value.trim().toLowerCase(),name:document.querySelector('#student-name').value.trim()}});
      selectedId=user.id;form.reset();showCredential(user,password);message('Cuenta creada. Entregue la contraseña temporal al estudiante.');
      try{await refresh()}catch{message('La cuenta fue creada. Pulse «Actualizar registros» para consultar la lista.',true)}
    }catch(error){showError(error)}finally{button.disabled=false;}
  });
  report.addEventListener('click',async event=>{
    const button=event.target.closest('button');if(!button)return;
    const student=students.find(item=>String(item.id)===String(selectedId));if(!student)return;
    if(button.id==='print-report'){window.print();return;}
    if(button.id==='export-report'){
      const url=URL.createObjectURL(new Blob([studentCSV(student)],{type:'text/csv;charset=utf-8;'}));
      const anchor=document.createElement('a');anchor.href=url;anchor.download='recorrido-'+student.username.replace(/[^a-z0-9._-]/gi,'_')+'.csv';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
    }
    if(button.id==='reset-password'){
      if(!window.confirm('¿Restablecer la contraseña de '+student.name+'? La persona deberá ingresar con una contraseña temporal y cambiarla.'))return;
      button.disabled=true;hideCredential();
      try{
        const {password}=await apiRequest('/admin/students/'+encodeURIComponent(student.id)+'/reset',{method:'POST',body:{}});
        showCredential(student,password);message('Contraseña restablecida. Entregue la contraseña temporal al estudiante.');
        try{await refresh()}catch{message('La contraseña fue restablecida. Pulse «Actualizar registros» para consultar el estado.',true)}
      }catch(error){showError(error)}finally{button.disabled=false;}
    }
    if(button.id==='toggle-active'){
      const active=!student.active;
      if(!window.confirm((active?'¿Activar':'¿Desactivar')+' la cuenta de '+student.name+'?'))return;
      button.disabled=true;hideCredential();
      try{
        await apiRequest('/admin/students/'+encodeURIComponent(student.id),{method:'PATCH',body:{active}});
        student.active=active;renderList();renderReport();message(active?'Cuenta activada.':'Cuenta desactivada.');
      }catch(error){showError(error)}finally{button.disabled=false;}
    }
  });
  document.querySelector('#hide-credential').addEventListener('click',hideCredential);
  document.querySelector('#copy-credential').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(document.querySelector('#credential-value').textContent);message('Contraseña copiada.')}catch{message('Seleccione la contraseña y use la función de copiar de su navegador.',true)}
  });
  document.querySelector('#admin-logout').addEventListener('click',async()=>{
    try{await apiRequest('/logout',{method:'POST',body:{}});hideCredential();location.replace('/aula/acceso.html')}catch(error){showError(error)}
  });
  try{
    const {user}=await apiRequest('/session');
    if(!user || user.mustChangePassword){login();return;}
    if(user.role!=='admin'){message('Esta sección requiere una cuenta de administración.',true);return;}
    document.querySelector('#admin-user').textContent='Cuenta: '+user.name;
    content.hidden=false;await refresh();message('');
  }catch(error){showError(error)}
}

if(typeof document!=='undefined' && document.body.dataset.page==='admin')startAdmin();
